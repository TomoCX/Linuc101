/* =======================================================================
   アプリ本体（ホーム・出題・結果）
   -----------------------------------------------------------------------
   共通の道具と状態は core.js、
   コマンド表は help-view.js、この問題のノートは note-panel-view.js、
   進捗の同期は sync-view.js にある。
   ======================================================================= */

const QMAP = new Map(QUESTIONS.map(q => [q.id, q]));

/* ==================================================================
   ホーム画面
================================================================== */
function buildCatList() {
  const list = $("catList");
  list.innerHTML = "";
  for (const [id, name] of examCategories()) {
    const n = examQuestions().filter(q => q.cat === id).length;
    const label = document.createElement("label");
    label.className = "cat-item";
    label.innerHTML = html`
      <input type="checkbox" value="${id}">
      <span class="cat-id">${id}</span>
      <span>${name}</span>
      <span class="cat-n">${n}問</span>`;
    label.querySelector("input").checked = config.cats.includes(id);
    label.querySelector("input").addEventListener("change", () => {
      setExamCats([...list.querySelectorAll("input:checked")].map(i => i.value));
      save(CONFIG_KEY, config);
      updateCountHint();
    });
    list.appendChild(label);
  }
}

// 出題範囲のうち、学習中の試験のカテゴリだけを入れ替える（もう一方の試験の選択は残す）
function setExamCats(cats) {
  const mine = examInfo().cats;
  config.cats = config.cats.filter(c => !mine.includes(c)).concat(cats);
  save(CONFIG_KEY, config);
}

function pool() {
  const min = config.imp || 0;
  return examQuestions().filter(q => config.cats.includes(q.cat) && (q.imp || 2) >= min);
}

function updateCountHint() {
  const n = pool().length;
  const want = config.count === "all" ? n : Math.min(config.count, n);
  const impNote = config.imp ? "（重要度 " + impStars(config.imp) + " 以上）" : "";
  $("countHint").textContent =
    n === 0 ? "条件に合う問題がありません。"
            : "選択中の範囲" + impNote + ": 全 " + n + " 問 → 今回の出題数: " + want + " 問";
  $("startWarn").hidden = n > 0;
  if (n === 0) $("startWarn").textContent = "カテゴリを1つ以上選び、重要度の条件を緩めてください。";
  $("btnStart").disabled = n === 0;
}

function renderSessionCard() {
  const card = $("sessionCard");
  if (!session) { card.hidden = true; $("topbarStatus").textContent = ""; return; }
  card.hidden = false;

  const t = tally(session);
  paintTally(t, "stat", "bar");

  const done = t.correct + t.assist + t.wrong;
  $("progressLabel").textContent =
    "全 " + t.total + " 問中 " + done + " 問に解答済み（未回答 " + t.skip + " 問）";

  const rate = pct(t.correct, done);
  $("statRate").textContent = rate + "%";
  $("statRate").className = rateClass(rate);
  $("statRateNote").textContent =
    "（解答済み " + done + " 問のうち、自力で正解した割合）";

  $("sessionMode").textContent = session.finished ? "完了" : "進行中";
  $("btnResume").hidden = !!session.finished;
  $("btnShowResult").hidden = false;

  $("topbarStatus").textContent = tallyLine(t);
}

function renderLifetime() {
  const body = $("lifetimeBody");
  body.innerHTML = "";

  // 解答数・自力正解・参照つき正解・連続正解の問題数をまとめる
  const sum = (qs) => {
    let c = 0, a = 0, t = 0;
    for (const q of qs) { const s = statOf(q.id); c += s.c; a += s.a; t += s.c + s.w + s.a; }
    return { t, c, a, k: rankCounts(qs.map(q => q.id)).streak };
  };
  const row = (label, { t, c, a, k }) => {
    const r = pct(c, t);
    const tr = document.createElement("tr");
    tr.innerHTML = html`
      <td>${label}</td><td>${t}</td><td>${c}</td>
      <td class="cell-assist">${a}</td>
      <td class="cell-rank">${k}</td>
      <td class="${t ? rateClass(r) : ""}">${t ? r + "%" : "-"}</td>`;
    body.appendChild(tr);
  };

  for (const [id, name] of examCategories()) {
    row(raw(html`<span class="cat-id">${id}</span> ${name}`), sum(examQuestions().filter(q => q.cat === id)));
  }
  row("合計", sum(examQuestions()));
}

function renderHome() {
  renderSessionCard();
  renderDueCard();
  renderLifetime();
  renderHomeRecommend();
  updateCountHint();
  setRelatedCommands(null);
  show("home");
}

/*
   復習の期限が来た問題の案内（無ければカードごと隠す）。
   内訳は出題画面のランク表示と同じ区分で数える。
     △ つまずき（まだ自力正解がない）／ ○ 正解済みの見直し ／ ◎ 定着の確認
*/
function renderDueCard() {
  const due = dueQuestions();
  const card = $("dueCard");
  card.hidden = due.length === 0;
  if (!due.length) return;

  const n = rankCounts(due.map(q => q.id));
  $("dueCount").textContent = due.length;
  $("dueDetail").textContent = [
    n.stumbled && "つまずいている問題 " + n.stumbled + "問",
    n.solved   && "正解済みの見直し " + n.solved + "問",
    n.streak   && "定着の確認 " + n.streak + "問"
  ].filter(Boolean).join(" ・ ");
  $("btnStartDue").textContent = "期限が来た問題を解く（" + due.length + "問）";
  renderDueSections(due);
}

// 期限が来た問題を、ノートの項目（節）ごとにまとめる。主題の順、同じ主題の中は問題の多い順
function dueBySection(due) {
  const groups = new Map();
  for (const q of due) {
    const key = q.sec || "";
    if (!groups.has(key)) groups.set(key, { key, ids: [] });
    groups.get(key).ids.push(q.id);        // due は弱点優先の順なので、その順のまま出す
  }
  return [...groups.values()].sort((a, b) =>
    secTheme(a.key || "99").localeCompare(secTheme(b.key || "99")) || b.ids.length - a.ids.length);
}

function renderDueSections(due) {
  const groups = dueBySection(due);
  $("dueSecsSum").textContent = "項目ごとに解く（" + groups.length + "項目）";
  $("dueSecList").innerHTML = groups.map(g => {
    const stumbled = rankCounts(g.ids).stumbled;     // △ だけ（○ 正解済みは含めない）
    return html`
    <button class="due-sec" data-key="${g.key}">
      <span class="rec-theme">${g.key ? secTheme(g.key) : "—"}</span>
      <span class="due-sec-title">${g.key ? secTitle(g.key) : "項目なし"}</span>
      <span class="due-sec-n">${g.ids.length}問${stumbled > 0 && raw(html`<small>（つまずき ${stumbled}）</small>`)}</span>
    </button>`;
  }).join("");
}

// 1つの項目の、期限が来た問題だけを解く（結果画面から、その項目のノートへ戻れるようにする）
$("dueSecList").addEventListener("click", (e) => {
  const btn = e.target.closest(".due-sec");
  if (!btn) return;
  const key = btn.dataset.key;
  const ids = dueQuestions().filter(q => (q.sec || "") === key).map(q => q.id);
  if (ids.length) beginSession(ids, key || null);
});

/* ==================================================================
   セッション開始
================================================================== */
// セッションを作って保存し、1問目を出す（from はノートへ戻る導線に使う節キー）
function beginSession(ids, from) {
  startSession(ids);
  if (from) session.from = from;
  saveSession();
  renderQuiz();
}

function startSession(ids) {
  let order;
  if (ids) {
    order = ids.slice();
  } else {
    let p = pool();
    const want = config.count === "all" ? p.length : Math.min(config.count, p.length);
    if (config.weak) {
      // 不正解率が高い順に抽出（同スコア内はランダム。sortが安定なのでshuffle後にsort）
      p = shuffle(p).sort((a, b) => weakScore(b) - weakScore(a));
      order = p.slice(0, want).map(q => q.id);
      if (config.order === "seq") order.sort((a, b) => a - b);
      else order = shuffle(order);
    } else {
      p = config.order === "random" ? shuffle(p) : p.slice().sort((a, b) => a.id - b.id);
      order = p.slice(0, want).map(q => q.id);
    }
  }
  session = newSession(order);
}

/*
   弱点優先の並び順に使う優先度（高いほど先に出す）。
     未出題              … 0.5（中間）
     連続正解まで届いた  … 期限が来ていれば 0.45（確認のため出す）、まだなら 0（後回し）
     それ以外            … 自力で正解できなかった率。期限前なら半分に、期限が来ていれば最低 0.3
*/
function weakScore(q) {
  const n = statTries(q.id);
  if (!n) return 0.5;
  const due = isDue(q.id);
  if (qRank(q.id) === 3) return due ? 0.45 : 0;
  const fail = statFails(q.id) / n;
  return due ? Math.max(fail, 0.3) : fail * 0.5;
}

// 復習の期限が来ている問題（弱点優先の順に並べる）
function dueQuestions() {
  return examQuestions().filter(q => isDue(q.id))
    .sort((a, b) => weakScore(b) - weakScore(a));
}

function newSession(order) {
  return {
    order: order,
    idx: 0,
    results: new Array(order.length).fill(null),   // null | "correct" | "wrong" | "skip"
    picked: new Array(order.length).fill(null),    // 選んだ選択肢（元の番号）の配列
    flags: new Array(order.length).fill(null),     // null | "help"（コマンド表参照）| "manual"（自己申告）
    // 選択肢の表示順（表示位置 → 元の番号）。再開しても同じ並びで出す
    perms: order.map(id => makePerm(QMAP.get(id).choices.length, config.shuffle !== false)),
    finished: false,
    startedAt: Date.now()
  };
}

/* ==================================================================
   出題画面
================================================================== */
let answered = false;          // 現在の問題が判定済みか
let selection = [];            // 複数選択の選択中インデックス
let referred = false;          // 解答前にコマンド表・ノート・Claudeへのコピーを使ったか（正解しても「参照」扱い）
let rawOk = false;             // 選択内容そのものは正解だったか
let curSkipped = false;        // この問題をスキップしたか

// 解答前に手がかりを見たことを記録する（コマンド表・ノート・コピーの各機能から呼ぶ）
function markReferred() {
  if (currentScreen() !== "quiz" || !session || answered) return;
  referred = true;
  updateQuizRefUI();
}

// 問題ごとの到達ランクのバッジ（－未着手 / △つまずき / ○正解 / ◎連続正解）
function updateRankBadge(qid) {
  const rk = qRank(qid);
  const st = qStreak(qid);
  const el = $("qRank");
  el.textContent = RANK_MARK[rk] + " " + RANK_LABEL[rk] + (rk === 3 ? "（" + st + "回連続）" : "");
  el.className = "rank-badge rank-" + rk;
  const last = lastAnsweredText(qid);
  el.title = "この問題のこれまでの成績" + (last ? "（前回: " + last + "）" : "");
}

function renderQuiz() {
  const q = QMAP.get(session.order[session.idx]);
  answered = false;
  selection = [];
  rawOk = false;
  curSkipped = false;
  // 「次の問題でも開いたままにする」が外れていれば、ここで閉じる
  if (config.keepHelp === false && helpIsOpen()) {
    openHelp(false);
  }
  // ノートは前の問題の範囲なので、次の問題では閉じる
  closeNotePanel();
  // 出題開始時点でコマンド表が開いていれば「参照した」扱いにする
  referred = helpIsOpen();
  updateQuizRefUI();

  $("qIndex").textContent = session.idx + 1;
  $("qTotal").textContent = session.order.length;
  $("qCat").textContent   = q.cat + " " + CATEGORIES[q.cat];
  $("qId").textContent    = "No." + q.id;
  const imp = q.imp || 2;
  $("qImp").textContent = impStars(imp) + " " + impLabel(imp);
  $("qImp").className = "imp-badge imp-" + imp;
  $("qImp").title = "重要度：" + impLabel(imp);

  // これまでの到達ランク（解く前の状態）
  updateRankBadge(q.id);
  notifyViewChanged();

  $("questionText").textContent = q.q;

  const multi = q.answer.length > 1;
  $("multiNote").hidden = !multi;
  $("btnAnswer").hidden = !multi;
  $("btnAnswer").disabled = true;
  $("btnSkip").hidden = false;
  $("explain").hidden = true;

  // 選択肢は表示位置 d に元の番号 perm[d] の内容を出す（ボタンは元の番号を覚えている）
  const perm = choicePerm(session, session.idx, q.choices.length);
  const box = $("choices");
  box.innerHTML = "";
  perm.forEach((orig, d) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.dataset.i = orig;
    btn.innerHTML = html`
      <span class="key">${KEYS[d] || d + 1}</span>
      <span>${q.choices[orig]}</span>
      <span class="mark"></span>`;
    btn.addEventListener("click", () => onChoice(orig, multi));
    box.appendChild(btn);
  });

  updateScoreBar();
  setRelatedCommands(q);
  show("quiz");
}

// 選択肢が押された（orig は元の番号）
function onChoice(orig, multi) {
  if (answered) return;
  if (!multi) {
    judge([orig]);
    return;
  }
  const idx = selection.indexOf(orig);
  if (idx >= 0) selection.splice(idx, 1); else selection.push(orig);
  for (const el of $("choices").children) {
    el.classList.toggle("selected", selection.includes(Number(el.dataset.i)));
  }
  $("btnAnswer").disabled = selection.length === 0;
}

// picked は元の番号の配列（null はスキップ）
function judge(picked) {
  const q = QMAP.get(session.order[session.idx]);
  const skipped = picked === null;
  const ok = !skipped && eqSet(picked, q.answer);

  answered = true;
  rawOk = ok;
  curSkipped = skipped;

  // コマンド表やノートを参照して正解した場合は「正解（参照）」として別枠で記録する
  const result = skipped ? "skip" : (ok ? (referred ? "assist" : "correct") : "wrong");
  session.results[session.idx] = result;
  session.picked[session.idx]  = skipped ? null : picked.slice();
  session.flags[session.idx]   = (ok && referred) ? "help" : null;

  // 累計成績（スキップは記録しない）
  if (!skipped) recordStat(q.id, null, result);
  saveSession();

  // 選択肢の色付け（ボタンは元の番号を持っている）
  for (const el of $("choices").children) {
    const n = Number(el.dataset.i);
    el.disabled = true;
    el.classList.remove("selected");
    const isAns = q.answer.includes(n);
    const isPick = !skipped && picked.includes(n);
    const mark = el.querySelector(".mark");
    if (isAns) { el.classList.add("is-correct"); mark.textContent = "○"; }
    else if (isPick) { el.classList.add("is-wrong"); mark.textContent = "✕"; }
    else { el.classList.add("dimmed"); }
  }

  refreshVerdict();

  const perm = choicePerm(session, session.idx, q.choices.length);
  $("explainAnswer").textContent = "正解： " + choiceText(q, perm, q.answer);
  // 解説中の用語はクリックで説明が出るようにする
  $("explainText").innerHTML = glossHtml(q.exp);

  $("btnAnswer").hidden = true;
  $("btnSkip").hidden = true;
  $("explain").hidden = false;
  updateScoreBar();
  $("btnNext").textContent = (session.idx + 1 >= session.order.length) ? "結果を見る" : "次の問題へ";
  $("btnNext").focus();
}

// 判定表示と「不正解にする」ボタンの状態を現在の結果に合わせて更新する
function refreshVerdict() {
  const res = session.results[session.idx];
  const v = $("verdict");
  const note = $("verdictNote");
  const btn = $("btnDowngrade");

  const qid = session.order[session.idx];
  updateRankBadge(qid);
  notifyViewChanged();

  if (res === "skip")         { v.textContent = "― 未回答"; v.className = "verdict sk"; }
  else if (res === "correct") {
    const st = qStreak(qid);
    if (st >= STREAK_RANK) {
      // 2回以上つづけて自力で正解した問題は、正解の上のランクとして表示する
      v.className = "verdict rk";
      v.innerHTML = html`◎ 連続正解<span class="verdict-tag">${st}回つづけて自力正解</span>`;
    } else {
      v.textContent = "○ 正解";
      v.className = "verdict ok";
    }
  }
  else if (res === "assist")  {
    v.className = "verdict as";
    v.innerHTML = html`○ 正解<span class="verdict-tag">参照あり</span>`;
  }
  else                        { v.textContent = "✕ 不正解"; v.className = "verdict ng"; }

  // 判定の補足
  if (res === "assist") {
    note.hidden = false;
    note.textContent = "コマンド表やノートを参照して解答したため、自力で正解した問題とは分けて記録します（正答率には含めません）。";
  } else if (res === "wrong" && rawOk) {
    note.hidden = false;
    note.textContent = "自己申告により不正解として記録しました。";
  } else {
    note.hidden = true;
    note.textContent = "";
  }

  // 「不正解にする」ボタンは、参照なしで正解した問題にだけ出す
  if (curSkipped || !rawOk || referred) {
    btn.hidden = true;
  } else {
    btn.hidden = false;
    const downgraded = (res === "wrong");
    btn.textContent = downgraded ? "やっぱり正解にする" : "不正解にする";
    btn.classList.toggle("is-undo", downgraded);
  }
  updateQuizRefUI();
}

// 「不正解にする」／「やっぱり正解にする」
function setManualResult(res) {
  const q = QMAP.get(session.order[session.idx]);
  const prev = session.results[session.idx];
  if (prev === res) return;
  recordStat(q.id, prev, res);
  session.results[session.idx] = res;
  session.flags[session.idx] = (res === "wrong") ? "manual" : null;
  saveSession();
  refreshVerdict();
  updateScoreBar();
}

// 参照の状態にあわせて、問題画面の警告文と「コマンド表」「ノート」ボタンを更新する
function updateQuizRefUI() {
  $("refNote").hidden = !(referred && !answered);
  updateHelpButton();
  updateNoteButton();
}

function updateHelpButton() {
  const btn = $("btnHelpQuiz");
  const open = helpIsOpen();
  btn.textContent = open ? "コマンド表を閉じる"
    : (answered ? "コマンド表を開く" : "コマンド表を開く（参照扱い）");
  btn.title = (!open && !answered)
    ? "解答前に開くと、正解しても「正解（参照）」として記録されます"
    : "コマンドオプション早見表";
  btn.classList.toggle("is-warn", !open && !answered);
}

// この問題のノート（△ つまずいている問題は目立たせる）
function updateNoteButton() {
  const btn = $("btnNoteQuiz");
  const q = session && QMAP.get(session.order[session.idx]);
  btn.hidden = !(q && q.sec);
  if (btn.hidden) return;
  const open = notePanelIsOpen();
  const stumble = qRank(q.id) === 1;
  btn.textContent = open ? "ノートを閉じる"
    : (stumble ? "△ " : "") + (answered ? "ノートで確認" : "ノートで確認（参照扱い）");
  btn.title = "この問題の範囲のノートを横に開きます（N）" +
    (!open && !answered ? "。解答前に開くと「正解（参照）」として記録されます" : "");
  btn.classList.toggle("is-stumble", stumble && !open);
}

function updateScoreBar() {
  const t = tally(session);
  paintTally(t, "score", "qBar");
  $("topbarStatus").textContent = tallyLine(t);
}

function next() {
  if (session.idx + 1 >= session.order.length) {
    session.finished = true;
    saveSession();
    renderResult();
  } else {
    session.idx++;
    saveSession();
    renderQuiz();
  }
}

/* ==================================================================
   結果画面
================================================================== */
function renderResult() {
  setRelatedCommands(null);
  const t = tally(session);
  const rate = pct(t.correct, t.total);

  $("resultRate").textContent = rate + "%";
  // この回で正解した問題のうち、連続正解のランクに達したもの
  const streaked = session.order.filter((id, i) =>
    session.results[i] === "correct" && qRank(id) === 3).length;

  $("resultSub").textContent  = t.correct + " / " + t.total + " 問を自力で正解"
    + (t.assist ? "（ほかに参照 " + t.assist + " 問）" : "");
  $("resultStreak").hidden = streaked === 0;
  $("resultStreak").innerHTML = html`◎ うち <b>${streaked}問</b> が連続正解（2回以上つづけて自力正解）`;
  paintTally(t, "r");

  const color = rate >= 80 ? "var(--correct)" : rate >= 60 ? "var(--warn)" : "var(--wrong)";
  $("scoreCircle").style.borderColor = color;
  $("resultRate").style.color = color;

  $("resultMsg").textContent = resultComment(rate);

  // ノートの節から始めた場合は、戻る導線を出す
  $("btnBackToNote").hidden = !session.from;

  // 自力で正解できなかった問題（参照つき正解・未回答も含む）を再挑戦の対象にする
  const wrongIds = session.order.filter((id, i) => session.results[i] !== "correct");
  $("btnRetryWrong").disabled = wrongIds.length === 0;
  $("btnRetryWrong").textContent =
    wrongIds.length === 0 ? "全問を自力で正解！" : "できなかった問題だけ再挑戦（" + wrongIds.length + "問）";

  renderResultRecommend();

  const list = $("reviewList");
  list.innerHTML = "";
  session.order.forEach((qid, i) => list.appendChild(buildReviewItem(i)));

  show("result");
}

// 正答率に応じたひとこと
function resultComment(rate) {
  if (rate >= 90) return "素晴らしい。この調子で範囲を広げましょう。";
  if (rate >= 80) return "合格ラインです。取りこぼした分野を復習しましょう。";
  if (rate >= 60) return "あと一歩。間違えた問題の再挑戦がおすすめです。";
  return "解説を読み直して、同じ範囲をもう一周しましょう。";
}

// session.flags の値ごとの説明（"help" は参照つき正解。旧版からの保存データに合わせた名前）
const REVIEW_FLAG_TEXT = {
  help:   "コマンド表やノートを参照して正解しました。自力で正解した問題とは分けて記録しています。",
  manual: "自己申告により不正解として記録されています（選んだ選択肢自体は正解）。"
};

// 解答一覧の1行（見出しを押すと解説が開く）
function buildReviewItem(i) {
  const q = QMAP.get(session.order[i]);
  const res = session.results[i];
  const cls  = res === "correct" ? "ok" : res === "assist" ? "as" : res === "wrong" ? "ng" : "sk";
  const mark = (res === "correct" || res === "assist") ? "○" : res === "wrong" ? "✕" : "―";
  const picked = session.picked[i];
  const perm = choicePerm(session, i, q.choices.length);
  const flagText = REVIEW_FLAG_TEXT[session.flags ? session.flags[i] : null];

  const item = document.createElement("div");
  item.className = "review-item " + cls;

  const head = document.createElement("button");
  head.className = "review-head";
  head.innerHTML = html`
    <span class="rmark">${mark}</span>
    <span class="rno">${i + 1}.</span>
    <span>${q.q}</span>`;

  const body = document.createElement("div");
  body.className = "review-body";
  body.hidden = true;
  body.innerHTML = html`
    ${flagText && raw(html`<div class="rline rflag">${flagText}</div>`)}
    <div class="rline"><span class="rlabel">あなたの解答：</span>${
      picked && picked.length
        ? raw(html`<span class="${res === "wrong" ? "rw" : "rc"}">${choiceText(q, perm, picked)}</span>`)
        : raw('<span class="rlabel">（未回答）</span>')
    }</div>
    <div class="rline"><span class="rlabel">正解：</span><span class="rc">${choiceText(q, perm, q.answer)}</span></div>
    <div class="review-exp">${raw(glossHtml(q.exp))}</div>
    ${q.sec && raw(html`<div class="btn-row btn-row-tight"><button class="btn btn-mini btn-note rnote">ノートで確認：${secTitle(q.sec)}</button></div>`)}`;

  head.addEventListener("click", () => { body.hidden = !body.hidden; });
  const nb = body.querySelector(".rnote");
  if (nb) nb.addEventListener("click", () => openNotePanel(q.sec));
  item.appendChild(head);
  item.appendChild(body);
  return item;
}

/* ==================================================================
   イベント登録
================================================================== */
// 出題条件のチップ（1つだけ選ぶ列）
bindChips("countChips", "count", (v) => {
  config.count = v === "all" ? "all" : Number(v);
  save(CONFIG_KEY, config);
  updateCountHint();
});
bindChips("impChips", "imp", (v) => {
  config.imp = Number(v);
  save(CONFIG_KEY, config);
  updateCountHint();
});
bindChips("orderChips", "order", (v) => {
  config.order = v;
  save(CONFIG_KEY, config);
});

$("optWeak").addEventListener("change", (e) => {
  config.weak = e.target.checked;
  save(CONFIG_KEY, config);
});

$("optShuffle").addEventListener("change", (e) => {
  config.shuffle = e.target.checked;
  save(CONFIG_KEY, config);
});

// 復習の期限が来た問題だけを解く
$("btnStartDue").addEventListener("click", () => {
  const ids = dueQuestions().map(q => q.id);
  if (ids.length) beginSession(ids);
});

$("btnCatAll").addEventListener("click", () => {
  setExamCats(examInfo().cats);
  buildCatList();
  updateCountHint();
});
$("btnCatNone").addEventListener("click", () => {
  setExamCats([]);
  buildCatList();
  updateCountHint();
});

$("btnStart").addEventListener("click", () => {
  if (session && !session.finished) {
    const t = tally(session);
    if (t.correct + t.wrong > 0 &&
        !confirm("進行中のセッション（" + t.total + "問中 " + (t.correct + t.wrong) + "問解答済み）を破棄して新しく始めますか？")) {
      return;
    }
  }
  beginSession(null);
});

$("btnResume").addEventListener("click", () => {
  // 未解答の最初の問題へ移動して再開
  const i = session.results.findIndex(r => r === null);
  session.idx = i >= 0 ? i : session.order.length - 1;
  if (i < 0) { renderResult(); return; }
  renderQuiz();
});

$("btnShowResult").addEventListener("click", renderResult);

$("btnDiscard").addEventListener("click", () => {
  if (!confirm("現在のセッションを破棄します。よろしいですか？（累計成績は残ります）")) return;
  session = null;
  remove(sessionKey());
  renderHome();
});

$("btnRelock").addEventListener("click", () => {
  if (confirm("この端末のロックを戻します。次に開くときパスワードの入力が必要になります。よろしいですか？（進捗は消えません）")) authRelock();
});

$("btnResetStats").addEventListener("click", () => {
  if (!confirm("累計の成績をすべて消去します。よろしいですか？")) return;
  stats = {};
  save(STATS_KEY, stats);
  renderLifetime();
});

$("btnAnswer").addEventListener("click", () => {
  if (!answered && selection.length) judge(selection);
});
$("btnSkip").addEventListener("click", () => { if (!answered) judge(null); });
$("btnNext").addEventListener("click", next);
$("btnDowngrade").addEventListener("click", () => {
  if (!answered || $("btnDowngrade").hidden) return;
  setManualResult(session.results[session.idx] === "wrong" ? "correct" : "wrong");
});

$("btnPause").addEventListener("click", () => { saveSession(); renderHome(); });
$("brandHome").addEventListener("click", () => {
  if (!examId) { showExamSelect(); return; }      // 試験を選ぶまではホームへ進まない
  saveSession();
  renderHome();
});

$("btnRetryWrong").addEventListener("click", () => {
  const ids = session.order.filter((id, i) => session.results[i] !== "correct");
  if (ids.length) beginSession(shuffle(ids), session.from);   // ノートへ戻る導線を保つ
});
$("btnRetrySame").addEventListener("click", () => {
  // ノートの節から始めた場合は、同じ節をもう一度出題する
  if (session.from) startSectionQuiz(session.from);
  else beginSession(null);
});
$("btnHomeFromResult").addEventListener("click", renderHome);
$("btnBackToNote").addEventListener("click", () => {
  if (session && session.from) showNoteSection(session.from);
  else showNotes();
});

// キーボード操作
document.addEventListener("keydown", (e) => {
  if (isTyping(e.target)) return;
  if (e.target.closest && e.target.closest(".gloss")) return;   // 用語の説明を開く操作を優先
  if (currentScreen() !== "quiz") return;
  if (e.key === "Enter" || e.key === " ") {
    if (answered) { e.preventDefault(); next(); }
    else if (!$("btnAnswer").hidden && selection.length) { e.preventDefault(); judge(selection); }
    return;
  }
  const n = "123456789".indexOf(e.key);
  if (n >= 0) {
    const btn = $("choices").children[n];
    if (btn && !answered) { e.preventDefault(); btn.click(); }
  }
});

/* ==================================================================
   初期化
================================================================== */
(function init() {
  normalizeConfig(config);

  // 試験を選ぶ前から使っていた端末（記録がある）は 101 として続ける。記録が無ければ選択画面から
  if (!examId && hasProgress()) { examId = "101"; save(EXAM_KEY, examId); }

  // 保存済みセッションが壊れていたら破棄する
  session = normalizeSession(session);
  if (!session) remove(sessionKey());

  applyConfigToForm();

  applyExamUI();
  if (load(HELP_OPEN_KEY, false)) document.body.classList.add("help-open");

  if (examId) renderHome();
  else showExamSelect();

  // 自動同期：接続済みなら起動時に取り込む
  renderGistUI();
  if (gistConnected()) gistSync();
})();
