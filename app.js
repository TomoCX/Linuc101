/* =======================================================================
   アプリ本体（ホーム・出題・結果）
   -----------------------------------------------------------------------
   共通の道具と状態は core.js、
   コマンド表は help-view.js、進捗の同期は sync-view.js にある。
   ======================================================================= */

const QMAP = new Map(QUESTIONS.map(q => [q.id, q]));

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
    label.innerHTML = html`
      <input type="checkbox" value="${id}">
      <span class="cat-id">${id}</span>
      <span>${name}</span>
      <span class="cat-n">${n}問</span>`;
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
  const min = config.imp || 0;
  return QUESTIONS.filter(q => config.cats.includes(q.cat) && (q.imp || 2) >= min);
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
  let tc = 0, ta = 0, tt = 0, tk = 0;

  const row = (label, t, c, a, k) => {
    const r = pct(c, t);
    const tr = document.createElement("tr");
    tr.innerHTML = html`
      <td>${label}</td><td>${t}</td><td>${c}</td>
      <td class="cell-assist">${a}</td>
      <td class="cell-rank">${k}</td>
      <td class="${t ? rateClass(r) : ""}">${t ? r + "%" : "-"}</td>`;
    body.appendChild(tr);
  };

  for (const [id, name] of Object.entries(CATEGORIES)) {
    let c = 0, a = 0, t = 0, k = 0;
    for (const q of QUESTIONS) {
      if (q.cat !== id) continue;
      if (qRank(q.id) === 3) k++;
      const s = statOf(q.id);
      c += s.c; a += s.a; t += s.c + s.w + s.a;
    }
    tc += c; ta += a; tt += t; tk += k;
    row(raw(html`<span class="cat-id">${id}</span> ${name}`), t, c, a, k);
  }
  row("合計", tt, tc, ta, tk);
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

// 復習の期限が来た問題の案内（無ければカードごと隠す）
function renderDueCard() {
  const due = dueQuestions();
  const card = $("dueCard");
  card.hidden = due.length === 0;
  if (!due.length) return;

  let check = 0, weak = 0;
  for (const q of due) { if (qRank(q.id) === 3) check++; else weak++; }
  $("dueCount").textContent = due.length;
  $("dueDetail").textContent =
    (weak ? "つまずいている問題 " + weak + "問" : "") +
    (weak && check ? " ・ " : "") +
    (check ? "定着の確認 " + check + "問" : "");
  $("btnStartDue").textContent = "期限が来た問題を解く（" + due.length + "問）";
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
  return QUESTIONS.filter(q => isDue(q.id))
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
let helpUsed = false;          // この問題の解答中にコマンド表を開いたか
let rawOk = false;             // 選択内容そのものは正解だったか
let curSkipped = false;        // この問題をスキップしたか

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
  // 出題開始時点でコマンド表が開いていれば「参照した」扱いにする
  helpUsed = helpIsOpen();
  updateQuizHelpUI();

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

  // コマンド表を参照して正解した場合は「正解（参照）」として別枠で記録する
  const result = skipped ? "skip" : (ok ? (helpUsed ? "assist" : "correct") : "wrong");
  session.results[session.idx] = result;
  session.picked[session.idx]  = skipped ? null : picked.slice();
  session.flags[session.idx]   = (ok && helpUsed) ? "help" : null;

  // 累計成績（スキップは記録しない）
  if (!skipped) recordStat(q.id, null, result);
  save(SESSION_KEY, session);

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
    v.innerHTML = html`○ 正解<span class="verdict-tag">コマンド表を参照</span>`;
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
  const open = helpIsOpen();
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
  // この回で正解した問題のうち、連続正解のランクに達したもの
  const streaked = session.order.filter((id, i) =>
    session.results[i] === "correct" && qRank(id) === 3).length;

  $("resultSub").textContent  = t.correct + " / " + t.total + " 問を自力で正解"
    + (t.assist ? "（ほかに参照 " + t.assist + " 問）" : "");
  $("resultStreak").hidden = streaked === 0;
  $("resultStreak").innerHTML = html`◎ うち <b>${streaked}問</b> が連続正解（2回以上つづけて自力正解）`;
  $("rTotal").textContent   = t.total;
  $("rCorrect").textContent = t.correct;
  $("rAssist").textContent  = t.assist;
  $("rWrong").textContent   = t.wrong;
  $("rSkip").textContent    = t.skip;

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

const REVIEW_FLAG_TEXT = {
  help:   "コマンド表を参照して正解しました。自力で正解した問題とは分けて記録しています。",
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
    <div class="review-exp">${raw(glossHtml(q.exp))}</div>`;

  head.addEventListener("click", () => { body.hidden = !body.hidden; });
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
  if (!ids.length) return;
  startSession(ids);
  renderQuiz();
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
  remove(SESSION_KEY);
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

$("btnPause").addEventListener("click", () => { save(SESSION_KEY, session); renderHome(); });
$("brandHome").addEventListener("click", () => { if (session) save(SESSION_KEY, session); renderHome(); });

$("btnRetryWrong").addEventListener("click", () => {
  const from = session.from;
  const ids = session.order.filter((id, i) => session.results[i] !== "correct");
  if (!ids.length) return;
  startSession(shuffle(ids));
  if (from) session.from = from;          // ノートへ戻る導線を保つ
  save(SESSION_KEY, session);
  renderQuiz();
});
$("btnRetrySame").addEventListener("click", () => {
  // ノートの節から始めた場合は、同じ節をもう一度出題する
  if (session.from) { startSectionQuiz(session.from); return; }
  startSession(null);
  save(SESSION_KEY, session);
  renderQuiz();
});
$("btnHomeFromResult").addEventListener("click", renderHome);
$("btnBackToNote").addEventListener("click", () => {
  const key = session && session.from;
  showNotes();
  if (key) {
    const el = document.querySelector('#notesBody .note-sec[data-key="' + CSS.escape(key) + '"]');
    if (el) el.scrollIntoView({ block: "start" });
  }
});

// キーボード操作
document.addEventListener("keydown", (e) => {
  if (isTyping(e.target)) return;
  if (e.target.closest && e.target.closest(".gloss")) return;   // 用語の説明を開く操作を優先
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
   初期化
================================================================== */
(function init() {
  // 設定の妥当性チェック（カテゴリ追加・削除に追随）
  config.cats = (config.cats || []).filter(c => CATEGORIES[c]);
  if (!config.cats.length) config.cats = Object.keys(CATEGORIES);
  if (config.keepHelp === undefined) config.keepHelp = true;   // 旧設定の互換

  // 保存済みセッションが壊れていたら破棄する
  session = normalizeSession(session);
  if (!session) remove(SESSION_KEY);

  applyConfigToForm();

  renderHelpGroups();
  renderHelpBody();
  if (load(HELP_OPEN_KEY, false)) document.body.classList.add("help-open");

  renderHome();

  // 自動同期：接続済みなら起動時に取り込む
  renderGistUI();
  if (gistConnected()) gistSync();
})();
