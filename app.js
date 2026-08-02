/* =======================================================================
   Linuc レベル1 101 問題演習  ―  アプリ本体
   ======================================================================= */

const SESSION_KEY = "linuc101.session.v1";
const STATS_KEY   = "linuc101.stats.v1";
const CONFIG_KEY  = "linuc101.config.v1";

const $  = (id) => document.getElementById(id);
const QMAP = new Map(QUESTIONS.map(q => [q.id, q]));
const KEYS = ["A", "B", "C", "D", "E", "F", "G", "H"];

/* ------------------------------------------------------------------
   永続化
------------------------------------------------------------------ */
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 保存不可でも継続 */ }
}

let session = load(SESSION_KEY, null);
let stats   = load(STATS_KEY, {});          // { qid: {c:正解数, w:不正解数} }
let config  = load(CONFIG_KEY, { count: 20, cats: Object.keys(CATEGORIES), order: "random", weak: false, keepHelp: true });

/* ------------------------------------------------------------------
   汎用
------------------------------------------------------------------ */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pct(n, d) { return d > 0 ? Math.round((n / d) * 100) : 0; }
function eqSet(a, b) {
  if (a.length !== b.length) return false;
  const s = a.slice().sort().join(",");
  return s === b.slice().sort().join(",");
}
function tally(s) {
  if (!s) return { total: 0, correct: 0, assist: 0, wrong: 0, skip: 0 };
  let correct = 0, assist = 0, wrong = 0;
  for (const r of s.results) {
    if (r === "correct") correct++;
    else if (r === "assist") assist++;    // コマンド表を参照しての正解
    else if (r === "wrong") wrong++;
  }
  const total = s.order.length;
  return { total, correct, assist, wrong, skip: total - correct - assist - wrong };
}
function rateClass(r) { return r >= 80 ? "rate-good" : r >= 60 ? "rate-mid" : "rate-bad"; }

/* ------------------------------------------------------------------
   画面切り替え
------------------------------------------------------------------ */
function show(name) {
  for (const id of ["home", "quiz", "result"]) {
    $("screen-" + id).hidden = (id !== name);
  }
  window.scrollTo(0, 0);
}

/* ==================================================================
   ホーム画面
================================================================== */
function buildCatList() {
  const list = $("catList");
  list.innerHTML = "";
  for (const [id, name] of Object.entries(CATEGORIES)) {
    const n = QUESTIONS.filter(q => q.cat === id).length;
    const label = document.createElement("label");
    label.className = "cat-item";
    label.innerHTML =
      '<input type="checkbox" value="' + id + '">' +
      '<span class="cat-id">' + id + '</span>' +
      '<span>' + name + '</span>' +
      '<span class="cat-n">' + n + '問</span>';
    label.querySelector("input").checked = config.cats.includes(id);
    label.querySelector("input").addEventListener("change", () => {
      config.cats = [...list.querySelectorAll("input:checked")].map(i => i.value);
      save(CONFIG_KEY, config);
      updateCountHint();
    });
    list.appendChild(label);
  }
}

function pool() {
  return QUESTIONS.filter(q => config.cats.includes(q.cat));
}

function updateCountHint() {
  const n = pool().length;
  const want = config.count === "all" ? n : Math.min(config.count, n);
  $("countHint").textContent =
    n === 0 ? "選択中のカテゴリに問題がありません。"
            : "選択中のカテゴリ: 全 " + n + " 問 → 今回の出題数: " + want + " 問";
  $("startWarn").hidden = n > 0;
  if (n === 0) $("startWarn").textContent = "カテゴリを1つ以上選択してください。";
  $("btnStart").disabled = n === 0;
}

function renderSessionCard() {
  const card = $("sessionCard");
  if (!session) { card.hidden = true; $("topbarStatus").textContent = ""; return; }
  card.hidden = false;

  const t = tally(session);
  $("statTotal").textContent   = t.total;
  $("statCorrect").textContent = t.correct;
  $("statAssist").textContent  = t.assist;
  $("statWrong").textContent   = t.wrong;
  $("statSkip").textContent    = t.skip;

  $("barCorrect").style.width = pct(t.correct, t.total) + "%";
  $("barAssist").style.width  = pct(t.assist,  t.total) + "%";
  $("barWrong").style.width   = pct(t.wrong,   t.total) + "%";
  $("barSkip").style.width    = pct(t.skip,    t.total) + "%";

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

  $("topbarStatus").textContent =
    "正解 " + t.correct + " / 参照 " + t.assist + " / 不正解 " + t.wrong + " / 未回答 " + t.skip;
}

function renderLifetime() {
  const body = $("lifetimeBody");
  body.innerHTML = "";
  let tc = 0, ta = 0, tt = 0;

  const row = (label, t, c, a) => {
    const r = pct(c, t);
    const tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + label + "</td><td>" + t + "</td><td>" + c + "</td>" +
      '<td class="cell-assist">' + a + "</td>" +
      '<td class="' + (t ? rateClass(r) : "") + '">' + (t ? r + "%" : "-") + "</td>";
    body.appendChild(tr);
  };

  for (const [id, name] of Object.entries(CATEGORIES)) {
    let c = 0, a = 0, t = 0;
    for (const q of QUESTIONS) {
      if (q.cat !== id) continue;
      const s = stats[q.id];
      if (!s) continue;
      c += s.c; a += s.a || 0; t += s.c + s.w + (s.a || 0);
    }
    tc += c; ta += a; tt += t;
    row('<span class="cat-id">' + id + "</span> " + name, t, c, a);
  }
  row("合計", tt, tc, ta);
}

function renderHome() {
  renderSessionCard();
  renderLifetime();
  updateCountHint();
  setRelatedCommands(null);
  show("home");
}

/* ==================================================================
   セッション開始
================================================================== */
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

function weakScore(q) {
  const s = stats[q.id];
  const n = s ? s.c + s.w + (s.a || 0) : 0;
  if (!n) return 0.5;                              // 未出題は中間の優先度
  return (s.w + (s.a || 0)) / n;                   // 自力で正解できなかった率が高いほど優先
}

function newSession(order) {
  return {
    order: order,
    idx: 0,
    results: new Array(order.length).fill(null),   // null | "correct" | "wrong" | "skip"
    picked: new Array(order.length).fill(null),    // 選んだ選択肢インデックスの配列
    flags: new Array(order.length).fill(null),     // null | "help"（コマンド表参照）| "manual"（自己申告）
    finished: false,
    startedAt: Date.now()
  };
}

/* ==================================================================
   出題画面
================================================================== */
let answered = false;          // 現在の問題が判定済みか
let selection = [];            // 複数選択の選択中インデックス
let helpUsed = false;          // この問題の解答中にコマンド表を開いたか
let rawOk = false;             // 選択内容そのものは正解だったか
let curSkipped = false;        // この問題をスキップしたか

function renderQuiz() {
  const q = QMAP.get(session.order[session.idx]);
  answered = false;
  selection = [];
  rawOk = false;
  curSkipped = false;
  // 「次の問題でも開いたままにする」が外れていれば、ここで閉じる
  if (config.keepHelp === false && document.body.classList.contains("help-open")) {
    openHelp(false);
  }
  // 出題開始時点でコマンド表が開いていれば「参照した」扱いにする
  helpUsed = document.body.classList.contains("help-open");
  updateQuizHelpUI();

  $("qIndex").textContent = session.idx + 1;
  $("qTotal").textContent = session.order.length;
  $("qCat").textContent   = q.cat + " " + CATEGORIES[q.cat];
  $("qId").textContent    = "No." + q.id;
  $("questionText").textContent = q.q;

  const multi = q.answer.length > 1;
  $("multiNote").hidden = !multi;
  $("btnAnswer").hidden = !multi;
  $("btnAnswer").disabled = true;
  $("btnSkip").hidden = false;
  $("explain").hidden = true;

  const box = $("choices");
  box.innerHTML = "";
  q.choices.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.dataset.i = i;
    btn.innerHTML =
      '<span class="key">' + (KEYS[i] || i + 1) + "</span>" +
      "<span>" + escapeHtml(text) + "</span>" +
      '<span class="mark"></span>';
    btn.addEventListener("click", () => onChoice(i, multi));
    box.appendChild(btn);
  });

  updateScoreBar();
  setRelatedCommands(q);
  show("quiz");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function onChoice(i, multi) {
  if (answered) return;
  if (!multi) {
    judge([i]);
    return;
  }
  const idx = selection.indexOf(i);
  if (idx >= 0) selection.splice(idx, 1); else selection.push(i);
  [...$("choices").children].forEach((el, n) => {
    el.classList.toggle("selected", selection.includes(n));
  });
  $("btnAnswer").disabled = selection.length === 0;
}

// 累計成績を prev → next へ付け替える（null は「記録なし」）
function recordStat(qid, prev, next) {
  if (prev === next) return;
  const s = stats[qid] || { c: 0, w: 0, a: 0 };
  if (s.a === undefined) s.a = 0;                 // 旧データの補完
  if (prev === "correct") s.c = Math.max(0, s.c - 1);
  if (prev === "assist")  s.a = Math.max(0, s.a - 1);
  if (prev === "wrong")   s.w = Math.max(0, s.w - 1);
  if (next === "correct") s.c++;
  if (next === "assist")  s.a++;
  if (next === "wrong")   s.w++;
  stats[qid] = s;
  save(STATS_KEY, stats);
}

function judge(picked) {
  const q = QMAP.get(session.order[session.idx]);
  const skipped = picked === null;
  const ok = !skipped && eqSet(picked, q.answer);

  answered = true;
  rawOk = ok;
  curSkipped = skipped;

  // コマンド表を参照して正解した場合は「正解（参照）」として別枠で記録する
  const result = skipped ? "skip" : (ok ? (helpUsed ? "assist" : "correct") : "wrong");
  session.results[session.idx] = result;
  session.picked[session.idx]  = skipped ? null : picked.slice();
  session.flags[session.idx]   = (ok && helpUsed) ? "help" : null;

  // 累計成績（スキップは記録しない）
  if (!skipped) recordStat(q.id, null, result);
  save(SESSION_KEY, session);

  // 選択肢の色付け
  [...$("choices").children].forEach((el, n) => {
    el.disabled = true;
    el.classList.remove("selected");
    const isAns = q.answer.includes(n);
    const isPick = !skipped && picked.includes(n);
    const mark = el.querySelector(".mark");
    if (isAns) { el.classList.add("is-correct"); mark.textContent = "○"; }
    else if (isPick) { el.classList.add("is-wrong"); mark.textContent = "✕"; }
    else { el.classList.add("dimmed"); }
  });

  refreshVerdict();

  const ansLabel = q.answer.map(i => KEYS[i] || (i + 1)).join("・");
  $("explainAnswer").textContent = "正解： " + ansLabel + "　" + q.answer.map(i => q.choices[i]).join(" ／ ");
  $("explainText").textContent = q.exp;

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

  if (res === "skip")         { v.textContent = "― 未回答"; v.className = "verdict sk"; }
  else if (res === "correct") { v.textContent = "○ 正解";   v.className = "verdict ok"; }
  else if (res === "assist")  {
    v.className = "verdict as";
    v.innerHTML = "○ 正解" + '<span class="verdict-tag">コマンド表を参照</span>';
  }
  else                        { v.textContent = "✕ 不正解"; v.className = "verdict ng"; }

  // 判定の補足
  if (res === "assist") {
    note.hidden = false;
    note.textContent = "コマンド表を参照して解答したため、自力で正解した問題とは分けて記録します（正答率には含めません）。";
  } else if (res === "wrong" && rawOk) {
    note.hidden = false;
    note.textContent = "自己申告により不正解として記録しました。";
  } else {
    note.hidden = true;
    note.textContent = "";
  }

  // 「不正解にする」ボタンは、参照なしで正解した問題にだけ出す
  if (curSkipped || !rawOk || helpUsed) {
    btn.hidden = true;
  } else {
    btn.hidden = false;
    const downgraded = (res === "wrong");
    btn.textContent = downgraded ? "やっぱり正解にする" : "不正解にする";
    btn.classList.toggle("is-undo", downgraded);
  }
  updateQuizHelpUI();
}

// 「不正解にする」／「やっぱり正解にする」
function setManualResult(res) {
  const q = QMAP.get(session.order[session.idx]);
  const prev = session.results[session.idx];
  if (prev === res) return;
  recordStat(q.id, prev, res);
  session.results[session.idx] = res;
  session.flags[session.idx] = (res === "wrong") ? "manual" : null;
  save(SESSION_KEY, session);
  refreshVerdict();
  updateScoreBar();
}

// コマンド表の参照状態にあわせて、問題画面の警告文とボタンを更新する
function updateQuizHelpUI() {
  const note = $("helpUsedNote");
  if (note) note.hidden = !(helpUsed && !answered);

  const btn = $("btnHelpQuiz");
  if (!btn) return;
  const open = document.body.classList.contains("help-open");
  btn.textContent = open ? "コマンド表を閉じる"
    : (answered ? "コマンド表を開く" : "コマンド表を開く（参照扱い）");
  btn.title = (!open && !answered)
    ? "解答前に開くと、正解しても「正解（参照）」として記録されます"
    : "コマンドオプション早見表";
  btn.classList.toggle("is-warn", !open && !answered);
}

function updateScoreBar() {
  const t = tally(session);
  $("scoreCorrect").textContent = t.correct;
  $("scoreAssist").textContent  = t.assist;
  $("scoreWrong").textContent   = t.wrong;
  $("scoreSkip").textContent    = t.skip;
  $("qBarCorrect").style.width  = pct(t.correct, t.total) + "%";
  $("qBarAssist").style.width   = pct(t.assist,  t.total) + "%";
  $("qBarWrong").style.width    = pct(t.wrong,   t.total) + "%";
  $("qBarSkip").style.width     = pct(t.skip,    t.total) + "%";
  $("topbarStatus").textContent =
    "正解 " + t.correct + " / 参照 " + t.assist + " / 不正解 " + t.wrong + " / 未回答 " + t.skip;
}

function next() {
  if (session.idx + 1 >= session.order.length) {
    session.finished = true;
    save(SESSION_KEY, session);
    renderResult();
  } else {
    session.idx++;
    save(SESSION_KEY, session);
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
  $("resultSub").textContent  = t.correct + " / " + t.total + " 問を自力で正解"
    + (t.assist ? "（ほかに参照 " + t.assist + " 問）" : "");
  $("rTotal").textContent   = t.total;
  $("rCorrect").textContent = t.correct;
  $("rAssist").textContent  = t.assist;
  $("rWrong").textContent   = t.wrong;
  $("rSkip").textContent    = t.skip;

  const color = rate >= 80 ? "var(--correct)" : rate >= 60 ? "var(--warn)" : "var(--wrong)";
  $("scoreCircle").style.borderColor = color;
  $("resultRate").style.color = color;

  $("resultMsg").textContent =
    rate >= 90 ? "素晴らしい。この調子で範囲を広げましょう。" :
    rate >= 80 ? "合格ラインです。取りこぼした分野を復習しましょう。" :
    rate >= 60 ? "あと一歩。間違えた問題の再挑戦がおすすめです。" :
                 "解説を読み直して、同じ範囲をもう一周しましょう。";

  // 自力で正解できなかった問題（参照つき正解・未回答も含む）を再挑戦の対象にする
  const wrongIds = session.order.filter((id, i) => session.results[i] !== "correct");
  $("btnRetryWrong").disabled = wrongIds.length === 0;
  $("btnRetryWrong").textContent =
    wrongIds.length === 0 ? "全問を自力で正解！" : "できなかった問題だけ再挑戦（" + wrongIds.length + "問）";

  const list = $("reviewList");
  list.innerHTML = "";
  session.order.forEach((qid, i) => {
    const q = QMAP.get(qid);
    const res = session.results[i];
    const cls = res === "correct" ? "ok" : res === "assist" ? "as" : res === "wrong" ? "ng" : "sk";
    const mark = (res === "correct" || res === "assist") ? "○" : res === "wrong" ? "✕" : "―";

    const item = document.createElement("div");
    item.className = "review-item " + cls;

    const head = document.createElement("button");
    head.className = "review-head";
    head.innerHTML =
      '<span class="rmark">' + mark + "</span>" +
      '<span class="rno">' + (i + 1) + ".</span>" +
      "<span>" + escapeHtml(q.q) + "</span>";

    const body = document.createElement("div");
    body.className = "review-body";
    body.hidden = true;
    const picked = session.picked[i];
    const flag = session.flags ? session.flags[i] : null;
    const flagText =
      flag === "help"   ? "コマンド表を参照して正解しました。自力で正解した問題とは分けて記録しています。" :
      flag === "manual" ? "自己申告により不正解として記録されています（選んだ選択肢自体は正解）。" : "";
    body.innerHTML =
      (flagText ? '<div class="rline rflag">' + flagText + "</div>" : "") +
      '<div class="rline"><span class="rlabel">あなたの解答：</span>' +
        (picked && picked.length
          ? '<span class="' + (res === "wrong" ? "rw" : "rc") + '">' +
            escapeHtml(picked.map(n => (KEYS[n] || n + 1) + ". " + q.choices[n]).join(" ／ ")) + "</span>"
          : '<span class="rlabel">（未回答）</span>') +
      "</div>" +
      '<div class="rline"><span class="rlabel">正解：</span><span class="rc">' +
        escapeHtml(q.answer.map(n => (KEYS[n] || n + 1) + ". " + q.choices[n]).join(" ／ ")) +
      "</span></div>" +
      '<div class="review-exp">' + escapeHtml(q.exp) + "</div>";

    head.addEventListener("click", () => { body.hidden = !body.hidden; });
    item.appendChild(head);
    item.appendChild(body);
    list.appendChild(item);
  });

  show("result");
}

/* ==================================================================
   イベント登録
================================================================== */
// 出題数チップ
$("countChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  [...$("countChips").children].forEach(c => c.classList.toggle("is-on", c === chip));
  const v = chip.dataset.count;
  config.count = v === "all" ? "all" : Number(v);
  save(CONFIG_KEY, config);
  updateCountHint();
});

// 出題順チップ
$("orderChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  [...$("orderChips").children].forEach(c => c.classList.toggle("is-on", c === chip));
  config.order = chip.dataset.order;
  save(CONFIG_KEY, config);
});

$("optWeak").addEventListener("change", (e) => {
  config.weak = e.target.checked;
  save(CONFIG_KEY, config);
});

$("btnCatAll").addEventListener("click", () => {
  config.cats = Object.keys(CATEGORIES);
  save(CONFIG_KEY, config);
  buildCatList();
  updateCountHint();
});
$("btnCatNone").addEventListener("click", () => {
  config.cats = [];
  save(CONFIG_KEY, config);
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
  startSession(null);
  save(SESSION_KEY, session);
  renderQuiz();
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
  localStorage.removeItem(SESSION_KEY);
  renderHome();
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

$("btnPause").addEventListener("click", () => { save(SESSION_KEY, session); renderHome(); });
$("brandHome").addEventListener("click", () => { if (session) save(SESSION_KEY, session); renderHome(); });

$("btnRetryWrong").addEventListener("click", () => {
  const ids = session.order.filter((id, i) => session.results[i] !== "correct");
  if (!ids.length) return;
  startSession(shuffle(ids));
  save(SESSION_KEY, session);
  renderQuiz();
});
$("btnRetrySame").addEventListener("click", () => {
  startSession(null);
  save(SESSION_KEY, session);
  renderQuiz();
});
$("btnHomeFromResult").addEventListener("click", renderHome);

// キーボード操作
document.addEventListener("keydown", (e) => {
  if (isTyping(e.target)) return;
  if ($("screen-quiz").hidden) return;
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
   右側ヘルプパネル（コマンドオプション早見表）
================================================================== */
const HELP_OPEN_KEY = "linuc101.help.v1";
let helpGroup = null;                 // 絞り込み中のグループ（null = すべて）
let helpOpenSet = new Set();          // 展開中のコマンド名
let relatedCmds = [];                 // 現在の問題に関係するコマンド
let relatedCollapsed = new Set();     // 関連コマンドのうち手動で閉じたもの

function isTyping(el) {
  return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

// コマンド名からキーワードを抽出（問題文との突き合わせに使う）
const HELP_TOKENS = COMMAND_HELP.map(c => {
  const stop = new Set(["debian", "rpm系", "gpt", "and", "for"]);
  const set = new Set();
  (c.name.match(/[A-Za-z][A-Za-z0-9_.+-]*/g) || []).forEach(t => {
    t = t.toLowerCase();
    if (t.length >= 2 && !stop.has(t)) set.add(t);
  });
  return { cmd: c, tokens: [...set], keys: c.keys || [] };
});

function openHelp(open) {
  document.body.classList.toggle("help-open", open);
  save(HELP_OPEN_KEY, open);
  // 解答前にコマンド表を開いたら「参照した」として記録する
  if (open && !$("screen-quiz").hidden && !answered) helpUsed = true;
  updateQuizHelpUI();
  if (open) setTimeout(() => $("helpSearch").focus(), 220);
}

function highlight(text, q) {
  const safe = escapeHtml(text);
  if (!q) return safe;
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(esc, "gi"), m => "<mark>" + m + "</mark>");
}

function renderHelpGroups() {
  const box = $("helpGroups");
  box.innerHTML = "";
  const mk = (label, value) => {
    const b = document.createElement("button");
    b.className = "hgroup" + (helpGroup === value ? " is-on" : "");
    b.textContent = label;
    b.addEventListener("click", () => {
      helpGroup = (helpGroup === value) ? null : value;
      renderHelpGroups();
      renderHelpBody();
    });
    box.appendChild(b);
  };
  mk("すべて", null);
  HELP_GROUPS.forEach(g => mk(g, g));
}

// コマンド1件分のカードを作る
function makeCmdCard(cmd, rows, q, isRelated) {
  const expanded = q ? true
    : (isRelated ? !relatedCollapsed.has(cmd.name) : helpOpenSet.has(cmd.name));

  const card = document.createElement("div");
  card.className = "hcmd" + (isRelated ? " is-related" : "");
  card.dataset.name = cmd.name;

  const head = document.createElement("button");
  head.className = "hcmd-head";
  head.innerHTML =
    '<span class="hcmd-name">' + highlight(cmd.name, q) + "</span>" +
    '<span class="hcmd-desc">' + highlight(cmd.desc, q) + "</span>" +
    '<span class="hcmd-arrow">' + (expanded ? "▲" : "▼") + "</span>";
  head.addEventListener("click", () => {
    const set = isRelated ? relatedCollapsed : helpOpenSet;
    // 関連コマンドは既定で開いているので、集合は「閉じたもの」を表す
    if (set.has(cmd.name)) set.delete(cmd.name);
    else set.add(cmd.name);
    $("helpSearch").value = "";
    renderHelpBody();
    const el = $("helpBody").querySelector('[data-name="' + CSS.escape(cmd.name) + '"]');
    if (el) el.scrollIntoView({ block: "nearest" });
  });
  card.appendChild(head);

  if (expanded) {
    const inner = document.createElement("div");
    inner.className = "hcmd-body";
    let html = cmd.ex ? '<div class="hcmd-ex">' + highlight(cmd.ex, q) + "</div>" : "";
    for (const r of rows) {
      html +=
        '<div class="hrow">' +
          '<span class="hopt">'  + highlight(r.opt,  q) + "</span>" +
          '<span class="hmemo">' + highlight(r.memo, q) + "</span>" +
          '<span class="hrole">' + highlight(r.role, q) + "</span>" +
        "</div>";
    }
    inner.innerHTML = html;
    card.appendChild(inner);
  }
  return card;
}

function renderHelpBody() {
  const q = $("helpSearch").value.trim().toLowerCase();
  const body = $("helpBody");
  body.innerHTML = "";

  // 検索中・グループ絞り込み中は通常の一覧のみを表示する
  const related = (q || helpGroup) ? [] : relatedCmds;
  let hit = 0;

  const section = (text, cls) => {
    const el = document.createElement("div");
    el.className = "help-section" + (cls ? " " + cls : "");
    el.textContent = text;
    body.appendChild(el);
  };

  // 出題中は、その問題に関係するコマンドを先頭に開いた状態で並べる
  if (related.length) {
    section("この問題に関係するコマンド", "is-related");
    for (const cmd of related) {
      body.appendChild(makeCmdCard(cmd, cmd.rows, "", true));
      hit++;
    }
    section("そのほかのコマンド");
  }

  for (const cmd of COMMAND_HELP) {
    if (related.includes(cmd)) continue;
    if (helpGroup && cmd.group !== helpGroup) continue;

    const nameHit = !q || (cmd.name + " " + cmd.desc).toLowerCase().includes(q);
    const rows = q && !nameHit
      ? cmd.rows.filter(r => (r.opt + " " + r.memo + " " + r.role).toLowerCase().includes(q))
      : cmd.rows;
    if (!rows.length) continue;

    body.appendChild(makeCmdCard(cmd, rows, q, false));
    hit++;
  }

  if (!hit) {
    body.innerHTML = '<div class="help-empty">該当するコマンドが見つかりませんでした。</div>';
  }
}

// 問題文・選択肢・解説に登場するコマンドを拾う（問題文に出るものほど上位）
function findRelatedCommands(q) {
  const choices = q.choices.map(c => c.toLowerCase());
  const zones = [
    { text: q.q.toLowerCase(), w: 10 },
    { text: choices.join(" \n "), w: 3 },
    // 解説の（覚え方）は英単語が多く誤検出のもとになるので除いて突き合わせる
    { text: q.exp.replace(/（[^）]*）/g, " ").toLowerCase(), w: 1 }
  ];

  const scored = [];
  for (const { cmd, tokens, keys } of HELP_TOKENS) {
    let score = 0;
    // 日本語キーワードは単純な部分一致で見る
    for (const k of keys) {
      for (const z of zones) if (z.text.includes(k.toLowerCase())) score += z.w;
    }
    for (const t of tokens) {
      const esc = t.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
      // file.txt や data.tar.gz のような文字列に反応しないよう、前後にピリオドを許さない
      const re = new RegExp("(^|[^a-z0-9_.-])" + esc + "([^a-z0-9_.-]|$)");
      for (const z of zones) if (re.test(z.text)) score += z.w;
      // 選択肢がそのコマンドで始まる場合は「問われているコマンド」とみなす
      if (choices.some(c => c === t || c.startsWith(t + " "))) score += 4;
    }
    if (score > 0) scored.push({ cmd, score });
  }
  scored.sort((a, b) => b.score - a.score);   // 同点は COMMAND_HELP の並び順
  return scored.slice(0, 6).map(s => s.cmd);
}

// 現在の問題に合わせてコマンド表の内容を差し替える（q が null なら解除）
function setRelatedCommands(q) {
  relatedCmds = q ? findRelatedCommands(q) : [];
  relatedCollapsed = new Set();
  renderHelpBody();
  $("helpBody").scrollTop = 0;
}

$("helpTab").addEventListener("click", () => openHelp(true));
$("btnHelpQuiz").addEventListener("click", () => openHelp(!document.body.classList.contains("help-open")));
$("optKeepHelp").addEventListener("change", (e) => {
  config.keepHelp = e.target.checked;
  save(CONFIG_KEY, config);
});
$("btnHelpTop").addEventListener("click", () => openHelp(!document.body.classList.contains("help-open")));
$("btnHelpClose").addEventListener("click", () => openHelp(false));
$("helpBackdrop").addEventListener("click", () => openHelp(false));
$("helpSearch").addEventListener("input", renderHelpBody);

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.key === "Escape" && document.body.classList.contains("help-open")) {
    openHelp(false);
    return;
  }
  if (isTyping(e.target)) return;
  if (e.key === "h" || e.key === "H" || e.key === "?" || e.key === "/") {
    e.preventDefault();
    openHelp(!document.body.classList.contains("help-open"));
  }
});

/* ==================================================================
   初期化
================================================================== */
(function init() {
  // 設定の妥当性チェック（カテゴリ追加・削除に追随）
  config.cats = (config.cats || []).filter(c => CATEGORIES[c]);
  if (!config.cats.length) config.cats = Object.keys(CATEGORIES);

  // 保存済みセッションに存在しない問題IDが含まれていたら破棄
  if (session && (!Array.isArray(session.order) || session.order.some(id => !QMAP.has(id)))) {
    session = null;
    localStorage.removeItem(SESSION_KEY);
  }
  // 旧バージョンのセッションには flags がないので補う
  if (session && !Array.isArray(session.flags)) {
    session.flags = new Array(session.order.length).fill(null);
  }

  buildCatList();
  [...$("countChips").children].forEach(c =>
    c.classList.toggle("is-on", String(config.count) === c.dataset.count));
  [...$("orderChips").children].forEach(c =>
    c.classList.toggle("is-on", config.order === c.dataset.order));
  $("optWeak").checked = !!config.weak;
  if (config.keepHelp === undefined) config.keepHelp = true;   // 旧設定の互換
  $("optKeepHelp").checked = config.keepHelp !== false;

  renderHelpGroups();
  renderHelpBody();
  if (load(HELP_OPEN_KEY, false)) document.body.classList.add("help-open");

  renderHome();
})();
