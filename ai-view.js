/* =======================================================================
   Claudeにコピー（画面の内容を、そのまま貼れる形で書き出す）
   -----------------------------------------------------------------------
   ・いま開いている問題・ノート・単語帳の内容と、答え方の指示をまとめて
     クリップボードへ入れる。Claudeアプリに貼って、最後に質問を書くだけ。
   ・通信は一切しない。APIキーも料金も不要。
   ・おまけとして、アプリ内の教材をその場で検索する窓も付けてある。
   ======================================================================= */

/* ---------------- 設定と状態 ---------------- */
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
if (aiCfg.key !== undefined) {         // 旧版で保存されたAPIキーは残さない
  delete aiCfg.key;
  delete aiCfg.effort;
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

/* ---------------- 貼り付け先への指示 ---------------- */
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

/* =======================================================================
   画面の内容を集める
   ======================================================================= */

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
  const sec = (typeof NOTE_BY_KEY !== "undefined") ? NOTE_BY_KEY.get(key) : null;
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
   いま開いている画面から、貼り付ける内容を組み立てる。
     label      … パネルに出す短い説明
     body       … 【いまの状況】と【参考資料】の中身
     hideAnswer … 正解を伏せているか（出題中で未解答のとき）
     screen     … 画面の種類
*/
function aiContext() {
  const screen = aiCurrentScreen();
  const now = [], ref = [];
  let label = "ホーム", sec = null, hideAnswer = false;

  if (screen === "quiz" && session) {
    const q = QMAP.get(session.order[session.idx]);
    const done = answered || curSkipped;
    hideAnswer = !done && !aiCfg.withAnswer;
    sec = q.sec || null;
    label = "問題 #" + q.id + "（" + (session.idx + 1) + "/" + session.order.length + "）";

    now.push("いま解いている問題です。");
    now.push("主題: " + (CATEGORIES[q.cat] || q.cat) + "　節: " + (q.sec || "未分類"));
    now.push("重要度: " + impStars(q.imp || 1) + "（" + impLabel(q.imp || 1) + "）" +
             "　これまでの成績: " + RANK_LABEL[qRank(q.id)]);
    now.push("");
    now.push("問題文: " + q.q);
    now.push("選択肢:");
    now.push(aiChoiceLines(q, session.picked[session.idx], hideAnswer));
    now.push("");

    if (done) {
      now.push("結果: " + (AI_VERDICT[session.results[session.idx]] || "判定なし"));
      now.push("アプリの解説: " + q.exp);
    } else if (aiCfg.withAnswer) {
      now.push("結果: まだ解答していません。");
      now.push("アプリの解説: " + q.exp);
    } else {
      now.push("結果: まだ解答していません（正解と解説は伏せています）。");
    }

    ref.push(aiCommandsText(findRelatedCommands(q)));
    ref.push(aiGlossText(q.q + " " + q.choices.join(" ") + (hideAnswer ? "" : " " + q.exp), 8));

  } else if (screen === "result" && session) {
    const t = tally(session);
    label = "結果（" + t.correct + "/" + t.total + "）";
    now.push("問題を解き終えたところです。");
    now.push("成績: 全" + t.total + "問中、自力正解 " + t.correct + "・参照つき正解 " + t.assist +
             "・不正解 " + t.wrong + "・未回答 " + t.skip);
    const missed = session.order
      .map((id, i) => ({ q: QMAP.get(id), r: session.results[i] }))
      .filter(x => x.r !== "correct");
    if (missed.length) {
      now.push("");
      now.push("できなかった問題:");
      for (const m of missed.slice(0, 12)) {
        now.push("- #" + m.q.id + "（" + (m.q.sec || "未分類") + "・" + AI_VERDICT[m.r] + "）");
        now.push("  " + m.q.q);
        now.push("  正解: " + m.q.answer.map(i => m.q.choices[i]).join(" ／ "));
      }
    }

  } else if (screen === "notes") {
    sec = aiVisibleNoteKey();
    label = sec ? "ノート：" + secTitle(sec) : "暗記ノート";
    now.push("暗記ノートを読んでいます。");
    if (sec) now.push("いま開いている節: " + sec + (learned[sec] ? "（覚えたにチェック済み）" : ""));
    else now.push("特定の節ではなく一覧を見ています。");

  } else if (screen === "cards") {
    const card = cardDeck[cardIdx];
    label = card ? "単語帳：" + card.term : "単語帳";
    now.push("単語帳を使っています。");
    if (card) {
      sec = card.sec;
      now.push("表示中のカード: " + card.term);
      now.push("意味: " + card.mean);
      now.push("節: " + card.sec);
    }
    if (cardSec) now.push("絞り込み中の節: " + cardSec);

  } else {
    let seen = 0, ok = 0, streak = 0;
    for (const q of QUESTIONS) {
      const r = qRank(q.id);
      if (r > 0) seen++;
      if (r >= 2) ok++;
      if (r === 3) streak++;
    }
    label = "ホーム";
    now.push("学習アプリのホーム画面です。");
    now.push("累計: 全" + QUESTIONS.length + "問中、解いたことがある " + seen + "問、" +
             "自力正解できた " + ok + "問（うち2回以上つづけて正解 " + streak + "問）");
    const weak = (typeof recMasteryByStats === "function")
      ? recMasteryByStats().filter(x => x.answered > 0 && x.ok < x.total)
          .sort((a, b) => a.rate - b.rate).slice(0, 5) : [];
    if (weak.length) {
      now.push("");
      now.push("自力正解できていない問題が残っている節（正解率の低い順）:");
      for (const w of weak) now.push("- " + w.key + "　" + w.ok + "/" + w.total + "問");
    }
  }

  if (sec) ref.unshift(aiSectionText(sec, 4000));

  let body = "## いまの状況\n" + now.filter(Boolean).join("\n");
  const refText = ref.filter(Boolean).join("\n\n");
  if (refText) body += "\n\n## 参考資料\n" + refText;
  if (body.length > AI_MAX_CTX) body = body.slice(0, AI_MAX_CTX) + "\n…（省略）";

  return { label, body, hideAnswer, sec, screen };
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
   コピー
   ======================================================================= */

// 新しい方法が使えない環境（file:// や古いiOS）でも動くようにする
function aiCopyFallback(text) {
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

async function aiCopyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* 下の方法を試す */ }
  return aiCopyFallback(text);
}

let aiMsgTimer = null;

function aiSayCopied(ok, n) {
  const msg = $("aiCopyMsg");
  msg.hidden = false;
  if (ok) {
    msg.className = "ai-copy-msg is-ok";
    msg.textContent = "コピーしました（" + n + "文字）。Claudeアプリに貼り付けて、いちばん下に質問を書いてください。";
  } else {
    msg.className = "ai-copy-msg is-ng";
    msg.textContent = "自動でコピーできませんでした。上の枠を長押し（PCはドラッグ）して選び、コピーしてください。";
    $("aiPreview").classList.add("is-pickable");
  }
  clearTimeout(aiMsgTimer);
  aiMsgTimer = setTimeout(() => { msg.hidden = true; }, 9000);
}

async function aiDoCopy() {
  markAssistIfUnanswered();
  const text = aiFullText($("aiQuestion").value);
  const ok = await aiCopyToClipboard(text);
  aiSayCopied(ok, text.length);
  aiUpdate();
}

/* ---------------- コピーしてClaudeを開く ---------------- */
let aiToastTimer = null;

function aiToast(ok, n, opening) {
  const el = $("aiToast");
  el.hidden = false;
  el.className = ok ? "is-ok" : "is-ng";
  el.textContent = ok
    ? "コピーしました（" + n + "文字）　" +
      (opening ? "Claudeで貼り付けて、下に質問を書いてください" : "Claudeに貼り付けて、下に質問を書いてください")
    : "コピーできませんでした。パネルを開いて手動で選んでください";
  clearTimeout(aiToastTimer);
  aiToastTimer = setTimeout(() => { el.hidden = true; }, 4500);
}

/*
   リンク（<a>）が押されたときの処理。
   Universal Links は「利用者がリンクを押した」ときしかアプリに渡らないので、
   ここでは既定の遷移を止めず、コピーだけ同期的に済ませる。
   （execCommand は同期なので、画面が切り替わる前に確実に書き込める）
*/
function aiCopyAndOpen(e) {
  markAssistIfUnanswered();
  const el = e.currentTarget;
  const text = aiFullText(el.id === "btnAiCopyOpen" ? $("aiQuestion").value : "");
  const open = aiOpenMode() !== "none" && el.getAttribute("href");

  // 開き方は押された時点で決める（読み込み時には端末の判定が定まらないことがある）
  if (aiIsTouch()) el.removeAttribute("target");            // スマホ：同じタブ→アプリへ引き渡し
  else { el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener"); }

  /*
     画面が切り替わる前に確実に書き込みたいので、まず同期の方法で入れる。
     そのうえで新しい方式でも書き込んでおく（どちらも同じ文面なので重ねても問題ない）。
     同期が断られた環境では、新しい方式の結果を待って知らせる。
  */
  let ok = aiCopyFallback(text);
  const modern = navigator.clipboard && window.isSecureContext;

  if (modern) {
    navigator.clipboard.writeText(text).catch(() => {
      if (!ok) { aiToast(false, text.length, false); openAi(true); }
    });
    ok = true;
  }

  if (!open || !ok) e.preventDefault();
  aiToast(ok, text.length, !!open && ok);
  if (!ok) openAi(true);          // 手動で選んでコピーしてもらう
  else aiRefresh();
}

// 設定に合わせてリンク先を入れ替える
function aiApplyOpenLinks() {
  const url = AI_OPEN_URL[aiOpenMode()] || "";
  for (const id of ["btnAiQuiz", "btnAiCopyOpen"]) {
    const el = $(id);
    if (!el) continue;
    if (url) el.setAttribute("href", url);
    else { el.removeAttribute("href"); el.removeAttribute("target"); }
  }
  $("btnAiQuiz").textContent = url ? "Claudeにコピーして開く" : "Claudeにコピー";
  $("btnAiCopyOpen").hidden = !url;
  $("btnAiCopy").className = url ? "btn" : "btn btn-primary btn-lg";
  $("btnAiCopy").textContent = url ? "コピーだけ" : "この内容をコピーする";
}

// 解答前のコピーは、コマンド表と同じく「参照」扱いにする
function markAssistIfUnanswered() {
  if (!aiCfg.assist) return;
  if (aiCurrentScreen() !== "quiz" || !session) return;
  if (answered || curSkipped || helpUsed) return;
  helpUsed = true;
  updateQuizHelpUI();
}

/* =======================================================================
   アプリ内検索（コピーせずに調べる）
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

/* =======================================================================
   表示
   ======================================================================= */

function aiUpdate() {
  const c = aiContext();
  const text = aiFullText($("aiQuestion").value);
  $("aiCtxLabel").textContent = c.label;
  $("aiPreview").textContent = text;
  $("aiLen").textContent = text.length + "文字";
  $("aiAssistNote").hidden =
    !(aiCfg.assist && c.screen === "quiz" && session && !answered && !curSkipped);
  return c;
}

// 画面に合わせた質問の候補
function aiRenderSuggest() {
  const screen = aiCurrentScreen();
  let list;
  if (screen === "quiz") {
    list = (answered || curSkipped)
      ? ["なぜこの答えになるのか教えて", "ほかの選択肢が違う理由は？", "似たコマンドとの違いは？", "試験ではどう問われる？"]
      : ["ヒントをちょうだい", "この問題は何を聞いている？", "関係するコマンドを教えて"];
  } else if (screen === "result") {
    list = ["間違えた問題の共通点は？", "次に何を復習すべき？", "弱点を整理して"];
  } else if (screen === "notes") {
    list = ["この節を3行でまとめて", "覚え方のコツは？", "試験で狙われるのはどこ？", "具体例を出して説明して"];
  } else if (screen === "cards") {
    list = ["この単語をやさしく説明して", "似た用語との違いは？", "具体例を教えて"];
  } else {
    list = ["今日は何から勉強すべき？", "弱点の克服プランを作って", "101試験の出題範囲を教えて"];
  }
  $("aiSuggest").innerHTML = list.map(s => '<button class="chip ai-sug">' + esc(s) + "</button>").join("");
}

/* ---------------- 開閉 ---------------- */
function openAi(open) {
  document.body.classList.toggle("ai-open", open);
  if (open) {
    aiUpdate();
    aiRenderSuggest();
    $("aiCopyMsg").hidden = true;
  }
}

// 画面が切り替わったときに、開いていれば内容を取り直す（core.js の show() などから呼ぶ）
function aiRefresh() {
  aiApplyOpenLinks();
  if (!document.body.classList.contains("ai-open")) return;
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

/* =======================================================================
   組み立て
   ======================================================================= */
$("aiTab").addEventListener("click", () => openAi(true));
$("btnAiTop").addEventListener("click", () => openAi(!document.body.classList.contains("ai-open")));
$("btnAiClose").addEventListener("click", () => openAi(false));
$("aiBackdrop").addEventListener("click", () => openAi(false));
$("btnAiQuiz").addEventListener("click", aiCopyAndOpen);
$("btnAiCopyOpen").addEventListener("click", aiCopyAndOpen);

$("btnAiCopy").addEventListener("click", aiDoCopy);
$("aiQuestion").addEventListener("input", aiUpdate);

$("aiSuggest").addEventListener("click", (e) => {
  const b = e.target.closest(".ai-sug");
  if (!b) return;
  $("aiQuestion").value = b.textContent;
  aiUpdate();
});

// アプリ内検索
function aiRunLocal() {
  const v = $("aiLocalInput").value.trim();
  $("aiLocalOut").innerHTML = v ? aiLocalSearch(v) : "";
}
$("btnAiLocal").addEventListener("click", aiRunLocal);
$("aiLocalInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); aiRunLocal(); }
});

$("aiAssist").addEventListener("change", (e) => { aiCfg.assist = e.target.checked; aiSaveCfg(); });
$("aiWithAnswer").addEventListener("change", (e) => { aiCfg.withAnswer = e.target.checked; aiSaveCfg(); });
$("aiOpen").addEventListener("change", (e) => { aiCfg.open = e.target.value; aiSaveCfg(); });

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.key === "Escape" && document.body.classList.contains("ai-open")) { openAi(false); return; }
  if (isTyping(document.activeElement)) return;
  if (e.key === "a" || e.key === "A") { e.preventDefault(); openAi(!document.body.classList.contains("ai-open")); }
});

// ノートを読みながらスクロールしたときも、見えている節に追随させる
let aiScrollTimer = null;
window.addEventListener("scroll", () => {
  if (!document.body.classList.contains("ai-open")) return;
  clearTimeout(aiScrollTimer);
  aiScrollTimer = setTimeout(aiRefresh, 250);
}, { passive: true });

aiRenderSettings();

// 端末の判定が後から変わったとき（スマホ表示への切り替えなど）にも追随させる
if (window.matchMedia) {
  const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
  const onChange = () => { if (!aiCfg.open) aiRenderSettings(); };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
}
