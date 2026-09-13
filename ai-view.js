/* =======================================================================
   Claudeにコピー（画面の内容を、そのまま貼れる形で書き出す）
   -----------------------------------------------------------------------
   ・いま開いている問題・ノート・単語帳の内容と、答え方の指示をまとめて
     クリップボードへ入れる。Claudeアプリに貼って、最後に質問を書くだけ。
   ・通信は一切しない。APIキーも料金も不要。
   ・おまけとして、アプリ内の教材をその場で検索する窓も付けてある。
   ・名前の「ai」は、APIで答えていた頃の名残（保存済みの設定キーに合わせている）。

   構成
     1. 設定          … 開き方・参照扱い・正解を含めるか
     2. 文面づくり    … 画面ごとの「いまの状況」と「参考資料」
     3. コピー        … クリップボードへの書き込みと通知
     4. アプリ内検索
     5. パネルの表示と組み立て
   ======================================================================= */

/* =======================================================================
   1. 設定
   ======================================================================= */
const AI_KEY     = "linuc101.ai.v1";   // この機能の設定（同期の対象外）
const AI_MAX_CTX = 14000;              // 書き出す文字数の上限

/*
   コピーのあとに開く先。
     browser … https://claude.ai/new
               claude.ai の Universal Links に /new が登録されているため、
               スマホでClaudeアプリが入っていればアプリが開く。無ければブラウザ。
     app     … claude://claude.ai/new（アプリを直接呼ぶ。未インストールだとエラー）
     none    … 開かない
*/
const AI_OPEN_URL = {
  browser: "https://claude.ai/new",
  app: "claude://claude.ai/new"
};

// 指で操作する端末か（スマホ・タブレット）
function aiIsTouch() {
  return !!(window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches);
}

let aiCfg = load(AI_KEY, null) || {};
if ("key" in aiCfg || "effort" in aiCfg) {   // 旧版で保存されたAPIキーは残さない
  delete aiCfg.key;
  delete aiCfg.effort;
  save(AI_KEY, aiCfg);
}
if (aiCfg.assist === undefined)     aiCfg.assist = true;
if (aiCfg.withAnswer === undefined) aiCfg.withAnswer = false;

/*
   実際に使う開き方。
   利用者が選んでいなければ、そのつど端末を見て決める
   （スマホはClaudeを開く／PCはコピーだけ。読み込んだ直後は端末の判定が
     定まらないことがあるので、値を焼き付けずに毎回見る）
*/
function aiOpenMode() {
  return aiCfg.open || (aiIsTouch() ? "browser" : "none");
}

function aiIsOpen() { return document.body.classList.contains("ai-open"); }

/* =======================================================================
   2. 文面づくり
   ======================================================================= */

// 貼り付け先への指示
function aiHeader(hideAnswer) {
  const lines = [
    "あなたは LinuC レベル1（101試験）の学習を助ける家庭教師です。",
    "下の【いまの状況】と【参考資料】をふまえて、いちばん最後の【質問】に日本語で答えてください。",
    "",
    "答え方のきまり:",
    "- 結論を最初の1〜2文で言い、そのあとに理由や補足を書く",
    "- 短くまとめる（目安5〜12行）。長い前置きは書かない",
    "- コマンドやオプションは `ls -l` のように書く",
    "- オプションには「-r（recursive＝再帰的）」のように元の英単語を添えて、覚え方を示す",
    "- 試験で狙われる点（ひっかけ、似たコマンドとの違い）があれば必ず触れる",
    "- 【参考資料】はこの学習アプリが持っている教材です。できるだけこれに沿って答え、",
    "  違うことを言う場合は「教材にはこう書かれていますが」と断ってください"
  ];
  if (hideAnswer) {
    lines.push("- この問題はまだ解答していません。正解は伏せてあります。");
    lines.push("  「答えを教えて」と書かれていないかぎり、答えそのものではなくヒントを出してください");
  }
  return lines.join("\n");
}

function aiCurrentScreen() {
  for (const id of SCREENS) if (!$("screen-" + id).hidden) return id;
  return "home";
}

// いま画面をいちばん広く占めているノートの節（＝読んでいる節）
function aiVisibleNoteKey() {
  const h = window.innerHeight || document.documentElement.clientHeight;
  let best = null, bestSeen = 0;
  for (const el of document.querySelectorAll("#notesBody .note-sec")) {
    if (el.hidden) continue;
    const r = el.getBoundingClientRect();
    const seen = Math.min(r.bottom, h) - Math.max(r.top, 0);   // 画面に見えている高さ
    if (seen > bestSeen) { bestSeen = seen; best = el; }
  }
  return best ? best.dataset.key : null;
}

// 節キー → ノート本文（長すぎるときは切る）
function aiSectionText(key, limit) {
  const sec = NOTE_BY_KEY.get(key);
  if (!sec) return "";
  let text = sec.lines.join("\n");
  if (text.length > limit) text = text.slice(0, limit) + "\n…（以下省略）";
  return "### ノート：" + key + "（重要度 " + "★".repeat(noteStars(key)) + "）\n" + text;
}

// コマンド表の該当部分
function aiCommandsText(cmds) {
  if (!cmds.length) return "";
  const out = ["### コマンド表（入力するもの / 覚え方 / 役割）"];
  for (const c of cmds.slice(0, 4)) {
    out.push("- " + c.name + "：" + c.desc + (c.ex ? "　例) " + c.ex : ""));
    for (const r of c.rows.slice(0, 10)) {
      out.push("    " + r.opt + " | " + r.memo + " | " + r.role);
    }
  }
  return out.join("\n");
}

// 文中に出てくる用語の意味（単語帳・用語集から）
function aiGlossText(text, max) {
  const hits = [];
  for (const [term, def] of glossMap) {
    if (term.length < 3) continue;
    if (text.includes(term)) hits.push("- " + term + "：" + def);
    if (hits.length >= max) break;
  }
  return hits.length ? "### 用語の意味\n" + hits.join("\n") : "";
}

// 選択肢の行（正解を伏せるかどうかを切り替えられる）
function aiChoiceLines(q, picks, hideAnswer) {
  return q.choices.map((c, i) => {
    const mark = [];
    if (!hideAnswer && q.answer.includes(i)) mark.push("正解");
    if (picks && picks.includes(i)) mark.push("自分が選んだ");
    return "  " + (KEYS[i] || i + 1) + ". " + c + (mark.length ? "　←" + mark.join("・") : "");
  }).join("\n");
}

const AI_VERDICT = {
  correct: "自力で正解した", assist: "コマンド表を参照して正解した",
  wrong: "不正解だった", skip: "スキップした（未回答）"
};

/*
   画面ごとの文面づくり。どれも次の形を返す（その画面で作れなければ null）。
     label      … パネルに出す短い説明
     now        … 【いまの状況】の行
     ref        … 【参考資料】のかたまり（ノート本文は aiContext が先頭に足す）
     sec        … 関係するノートの節キー（無ければ null）
     hideAnswer … 正解を伏せているか
*/
const AI_CONTEXT = {
  quiz() {
    if (!session) return null;
    const q = QMAP.get(session.order[session.idx]);
    const done = answered || curSkipped;
    const hideAnswer = !done && !aiCfg.withAnswer;

    const now = [
      "いま解いている問題です。",
      "主題: " + (CATEGORIES[q.cat] || q.cat) + "　節: " + (q.sec || "未分類"),
      "重要度: " + impStars(q.imp || 1) + "（" + impLabel(q.imp || 1) + "）" +
        "　これまでの成績: " + RANK_LABEL[qRank(q.id)],
      "問題文: " + q.q,
      "選択肢:",
      aiChoiceLines(q, session.picked[session.idx], hideAnswer)
    ];
    if (done)                  now.push("結果: " + (AI_VERDICT[session.results[session.idx]] || "判定なし"));
    else if (aiCfg.withAnswer) now.push("結果: まだ解答していません。");
    else                       now.push("結果: まだ解答していません（正解と解説は伏せています）。");
    if (!hideAnswer)           now.push("アプリの解説: " + q.exp);

    return {
      label: "問題 #" + q.id + "（" + (session.idx + 1) + "/" + session.order.length + "）",
      now, sec: q.sec || null, hideAnswer,
      ref: [
        aiCommandsText(findRelatedCommands(q)),
        aiGlossText(q.q + " " + q.choices.join(" ") + (hideAnswer ? "" : " " + q.exp), 8)
      ]
    };
  },

  result() {
    if (!session) return null;
    const t = tally(session);
    const now = [
      "問題を解き終えたところです。",
      "成績: 全" + t.total + "問中、自力正解 " + t.correct + "・参照つき正解 " + t.assist +
        "・不正解 " + t.wrong + "・未回答 " + t.skip
    ];
    const missed = session.order
      .map((id, i) => ({ q: QMAP.get(id), r: session.results[i] }))
      .filter(x => x.r !== "correct");
    if (missed.length) {
      now.push("できなかった問題:");
      for (const m of missed.slice(0, 12)) {
        // まだ解いていない問題（結果が空）は未回答として扱う
        now.push("- #" + m.q.id + "（" + (m.q.sec || "未分類") + "・" + (AI_VERDICT[m.r] || AI_VERDICT.skip) + "）");
        now.push("  " + m.q.q);
        now.push("  正解: " + m.q.answer.map(i => m.q.choices[i]).join(" ／ "));
      }
    }
    return { label: "結果（" + t.correct + "/" + t.total + "）", now, ref: [], sec: null };
  },

  notes() {
    const sec = aiVisibleNoteKey();
    return {
      label: sec ? "ノート：" + secTitle(sec) : "暗記ノート",
      now: [
        "暗記ノートを読んでいます。",
        sec ? "いま開いている節: " + sec + (learned[sec] ? "（覚えたにチェック済み）" : "")
            : "特定の節ではなく一覧を見ています。"
      ],
      ref: [], sec
    };
  },

  cards() {
    const card = cardDeck[cardIdx];
    const now = ["単語帳を使っています。"];
    if (card) now.push("表示中のカード: " + card.term, "意味: " + card.mean, "節: " + card.sec);
    if (cardSec) now.push("絞り込み中の節: " + cardSec);
    return { label: card ? "単語帳：" + card.term : "単語帳", now, ref: [], sec: card ? card.sec : null };
  },

  home() {
    let seen = 0, ok = 0, streak = 0;
    for (const q of QUESTIONS) {
      const r = qRank(q.id);
      if (r > 0) seen++;
      if (r >= 2) ok++;
      if (r === 3) streak++;
    }
    const now = [
      "学習アプリのホーム画面です。",
      "累計: 全" + QUESTIONS.length + "問中、解いたことがある " + seen + "問、" +
        "自力正解できた " + ok + "問（うち2回以上つづけて正解 " + streak + "問）"
    ];
    const weak = recMasteryByStats()
      .filter(x => x.answered > 0 && x.ok < x.total)
      .sort((a, b) => a.rate - b.rate).slice(0, 5);
    if (weak.length) {
      now.push("自力正解できていない問題が残っている節（正解率の低い順）:");
      for (const w of weak) now.push("- " + w.key + "　" + w.ok + "/" + w.total + "問");
    }
    return { label: "ホーム", now, ref: [], sec: null };
  }
};

// いま開いている画面から、【いまの状況】と【参考資料】を組み立てる
function aiContext() {
  const screen = aiCurrentScreen();
  const c = (AI_CONTEXT[screen] && AI_CONTEXT[screen]()) || AI_CONTEXT.home();

  const ref = c.sec ? [aiSectionText(c.sec, 4000)].concat(c.ref) : c.ref;
  let body = "## いまの状況\n" + c.now.filter(Boolean).join("\n");
  const refText = ref.filter(Boolean).join("\n\n");
  if (refText) body += "\n\n## 参考資料\n" + refText;
  if (body.length > AI_MAX_CTX) body = body.slice(0, AI_MAX_CTX) + "\n…（省略）";

  return { label: c.label, body, hideAnswer: !!c.hideAnswer, sec: c.sec, screen };
}

// 貼り付ける全文を作る
function aiFullText(question) {
  const c = aiContext();
  const q = (question || "").trim();
  return [
    aiHeader(c.hideAnswer),
    "",
    c.body,
    "",
    "## 質問",
    q || "（この下に質問を書いてください）"
  ].join("\n");
}

/* =======================================================================
   3. コピー
   ======================================================================= */

// 同期の方法（execCommand）。file:// や古いiOSでも動き、画面が切り替わる前に書き込みが終わる
function aiCopySync(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.top = "0";
  ta.style.left = "0";
  ta.style.opacity = "0";
  ta.contentEditable = "true";
  document.body.appendChild(ta);

  const range = document.createRange();
  range.selectNodeContents(ta);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  ta.setSelectionRange(0, text.length);     // iOS はこれが必要

  let ok = false;
  try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
  sel.removeAllRanges();
  document.body.removeChild(ta);
  return ok;
}

/*
   クリップボードに書き込む。
   まず同期の方法で確実に入れ、使える環境では新しい方式でも重ねて書き込む（同じ文面なので問題ない）。
   同期が断られ、あとから新しい方式も失敗したときは onFail を呼ぶ。
*/
function aiWriteClipboard(text, onFail) {
  let ok = aiCopySync(text);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => { if (!ok) onFail(); });
    ok = true;
  }
  return ok;
}

let aiToastTimer = null;

// コピーの結果を画面下に知らせる。失敗したらパネルを開いて、手動で選べるようにする
function aiNotify(ok, n, opening) {
  const el = $("aiToast");
  el.hidden = false;
  el.className = ok ? "is-ok" : "is-ng";
  el.textContent = ok
    ? "コピーしました（" + n + "文字）　" + (opening ? "Claudeで" : "Claudeに") + "貼り付けて、下に質問を書いてください"
    : "自動でコピーできませんでした。枠を長押し（PCはドラッグ）して選び、コピーしてください";
  clearTimeout(aiToastTimer);
  aiToastTimer = setTimeout(() => { el.hidden = true; }, ok ? 4500 : 9000);

  if (!ok) {
    openAi(true);
    $("aiPreview").classList.add("is-pickable");
  }
}

// 解答前のコピーは、コマンド表と同じく「参照」扱いにする
function markAssistIfUnanswered() {
  if (!aiCfg.assist) return;
  if (aiCurrentScreen() !== "quiz" || !session) return;
  if (answered || curSkipped || helpUsed) return;
  helpUsed = true;
  updateQuizHelpUI();
}

/*
   コピーのボタンが押されたときの処理（出題画面のリンク・パネルの2つのボタンで共通）。
   Universal Links は「利用者がリンクを押した」ときしかアプリに渡らないので、
   開くときは既定の遷移を止めず、その前にコピーを済ませる。
*/
function aiCopy(e) {
  markAssistIfUnanswered();
  const el = e.currentTarget;
  const inPanel = !!el.closest("#aiPanel");            // パネルでは入力した質問も入れる
  const text = aiFullText(inPanel ? $("aiQuestion").value : "");
  const href = el.getAttribute("href");
  const opening = !!href && aiOpenMode() !== "none";

  if (href) {
    // 開き方は押された時点で決める（スマホ：同じタブでアプリへ引き渡す／PC：新しいタブ）
    if (aiIsTouch()) el.removeAttribute("target");
    else { el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener"); }
  }

  const ok = aiWriteClipboard(text, () => aiNotify(false, text.length, false));
  if (!opening || !ok) e.preventDefault();
  aiNotify(ok, text.length, opening && ok);
  if (ok) aiRefresh();
}

// 設定に合わせてリンク先とボタンの文言を入れ替える
function aiApplyOpenLinks() {
  const url = AI_OPEN_URL[aiOpenMode()] || "";
  for (const id of ["btnAiQuiz", "btnAiCopyOpen"]) {
    const el = $(id);
    if (url) el.setAttribute("href", url);
    else { el.removeAttribute("href"); el.removeAttribute("target"); }
  }
  $("btnAiQuiz").textContent = url ? "Claudeにコピーして開く" : "Claudeにコピー";
  $("btnAiCopyOpen").hidden = !url;
  $("btnAiCopy").className = url ? "btn" : "btn btn-primary btn-lg";
  $("btnAiCopy").textContent = url ? "コピーだけ" : "この内容をコピーする";
}

/* =======================================================================
   4. アプリ内検索（コピーせずに調べる）
   ======================================================================= */

function aiTokens(text) {
  return [...new Set(
    text.toLowerCase()
        .replace(/[、。？?！!「」『』（）()\[\]【】,.:;/\\]/g, " ")
        .split(/\s+/)
        .filter(t => t.length >= 2)
  )].slice(0, 8);
}

function aiCountHits(hay, tokens) {
  const h = hay.toLowerCase();
  let n = 0;
  for (const t of tokens) if (h.includes(t)) n++;
  return n;
}

function aiLocalSearch(question) {
  const tokens = aiTokens(question);
  if (!tokens.length) return "<p>検索する語句が読み取れませんでした。コマンド名や用語を入れてみてください。</p>";

  const parts = [];

  const cmds = COMMAND_HELP
    .map(c => ({ c, n: aiCountHits(c.name + " " + c.desc + " " + (c.keys || []).join(" ") +
                                  " " + c.rows.map(r => r.opt + r.memo + r.role).join(" "), tokens) }))
    .filter(x => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 2);
  for (const { c } of cmds) {
    parts.push("### " + c.name + "\n" + c.desc + (c.ex ? "\n\n```\n" + c.ex + "\n```" : "") +
      "\n\n| 入力するもの | 覚え方 | 役割 |\n|---|---|---|\n" +
      c.rows.slice(0, 8).map(r => "| `" + r.opt + "` | " + r.memo + " | " + r.role + " |").join("\n"));
  }

  const terms = [...glossMap].filter(([k]) => aiCountHits(k, tokens) > 0).slice(0, 4);
  if (terms.length) {
    parts.push("### 用語\n" + terms.map(([k, v]) => "- **" + k + "**：" + v).join("\n"));
  }

  const secs = NOTE_SECTIONS
    .map(s => ({ s, n: aiCountHits(s.title + " " + s.lines.join(" "), tokens) }))
    .filter(x => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 2);
  for (const { s } of secs) {
    parts.push("### ノート：" + s.title + "\n" + s.lines.slice(0, 20).join("\n") +
               (s.lines.length > 20 ? "\n\n（続きは暗記ノートで）" : ""));
  }

  if (!parts.length) {
    return "<p>「" + esc(question) + "」に当てはまる項目はアプリ内に見つかりませんでした。</p>";
  }
  return aiRenderMd(parts.join("\n\n"));
}

// Markdown を、ノートと同じ見た目で描く（mdToHtml が中でエスケープする）
function aiRenderMd(text) {
  const box = document.createElement("div");
  box.innerHTML = mdToHtml(String(text).split("\n"));
  for (const a of box.querySelectorAll("a[href]")) {
    if (!/^https?:/i.test(a.getAttribute("href"))) a.removeAttribute("href");
  }
  return box.innerHTML;
}

function aiRunLocal() {
  const v = $("aiLocalInput").value.trim();
  $("aiLocalOut").innerHTML = v ? aiLocalSearch(v) : "";
}

/* =======================================================================
   5. パネルの表示と組み立て
   ======================================================================= */

function aiUpdate() {
  const c = aiContext();
  const text = aiFullText($("aiQuestion").value);
  $("aiCtxLabel").textContent = c.label;
  $("aiPreview").textContent = text;
  $("aiLen").textContent = text.length + "文字";
  $("aiAssistNote").hidden =
    !(aiCfg.assist && c.screen === "quiz" && session && !answered && !curSkipped);
}

// 画面に合わせた質問の候補
const AI_SUGGEST = {
  quizDone: ["なぜこの答えになるのか教えて", "ほかの選択肢が違う理由は？", "似たコマンドとの違いは？", "試験ではどう問われる？"],
  quizOpen: ["ヒントをちょうだい", "この問題は何を聞いている？", "関係するコマンドを教えて"],
  result:   ["間違えた問題の共通点は？", "次に何を復習すべき？", "弱点を整理して"],
  notes:    ["この節を3行でまとめて", "覚え方のコツは？", "試験で狙われるのはどこ？", "具体例を出して説明して"],
  cards:    ["この単語をやさしく説明して", "似た用語との違いは？", "具体例を教えて"],
  home:     ["今日は何から勉強すべき？", "弱点の克服プランを作って", "101試験の出題範囲を教えて"]
};

function aiRenderSuggest() {
  const screen = aiCurrentScreen();
  const key = screen !== "quiz" ? screen : (answered || curSkipped) ? "quizDone" : "quizOpen";
  const list = AI_SUGGEST[key] || AI_SUGGEST.home;
  $("aiSuggest").innerHTML = list.map(s => '<button class="chip ai-sug">' + esc(s) + "</button>").join("");
}

function openAi(open) {
  document.body.classList.toggle("ai-open", open);
  if (open) {
    aiUpdate();
    aiRenderSuggest();
  }
}

// 画面や出題内容が変わったときに、リンクと（開いていれば）パネルの中身を取り直す
function aiRefresh() {
  aiApplyOpenLinks();
  if (!aiIsOpen()) return;
  aiUpdate();
  aiRenderSuggest();
}

function aiRenderSettings() {
  $("aiOpen").value = aiOpenMode();
  aiApplyOpenLinks();
  $("aiAssist").checked = aiCfg.assist !== false;
  $("aiWithAnswer").checked = !!aiCfg.withAnswer;
}

function aiSaveCfg() { save(AI_KEY, aiCfg); aiRenderSettings(); aiRefresh(); }

/* ---------------- イベントの登録 ---------------- */
onViewChanged(aiRefresh);

$("aiTab").addEventListener("click", () => openAi(true));
$("btnAiTop").addEventListener("click", () => openAi(!aiIsOpen()));
$("btnAiClose").addEventListener("click", () => openAi(false));
$("aiBackdrop").addEventListener("click", () => openAi(false));
for (const id of ["btnAiQuiz", "btnAiCopyOpen", "btnAiCopy"]) {
  $(id).addEventListener("click", aiCopy);
}

$("aiQuestion").addEventListener("input", aiUpdate);
$("aiSuggest").addEventListener("click", (e) => {
  const b = e.target.closest(".ai-sug");
  if (!b) return;
  $("aiQuestion").value = b.textContent;
  aiUpdate();
});

$("btnAiLocal").addEventListener("click", aiRunLocal);
$("aiLocalInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); aiRunLocal(); }
});

$("aiAssist").addEventListener("change", (e) => { aiCfg.assist = e.target.checked; aiSaveCfg(); });
$("aiWithAnswer").addEventListener("change", (e) => { aiCfg.withAnswer = e.target.checked; aiSaveCfg(); });
$("aiOpen").addEventListener("change", (e) => { aiCfg.open = e.target.value; aiSaveCfg(); });

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.key === "Escape" && aiIsOpen()) { openAi(false); return; }
  if (isTyping(document.activeElement)) return;
  if (e.key === "a" || e.key === "A") { e.preventDefault(); openAi(!aiIsOpen()); }
});

// ノートを読みながらスクロールしたときも、見えている節に追随させる
let aiScrollTimer = null;
window.addEventListener("scroll", () => {
  if (!aiIsOpen()) return;
  clearTimeout(aiScrollTimer);
  aiScrollTimer = setTimeout(aiRefresh, 250);
}, { passive: true });

// 端末の判定が後から変わったとき（スマホ表示への切り替えなど）にも追随させる
if (window.matchMedia) {
  const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
  const onChange = () => { if (!aiCfg.open) aiRenderSettings(); };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
}

aiRenderSettings();
