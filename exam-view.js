/* =======================================================================
   試験の選択（LinuC レベル1 101 ／ 102）
   -----------------------------------------------------------------------
   ・初めて使う端末（学習の記録が無い）では、最初にこの選択画面を出す
   ・記録がある端末では、前回選んだ試験のホームから始める
     （試験を選ぶ前から使っていた端末は 101 として扱う）
   ・ホームのいちばん上の「切り替える」から、いつでもこの画面に戻れる
   どちらの試験かは端末ごとに覚える（EXAM_KEY。同期はしない）。
   ======================================================================= */

// この端末に学習の記録があるか（初めて使う端末かの判定に使う）
function hasProgress() {
  const some = (o) => !!o && Object.keys(o).length > 0;
  return some(stats) || some(learned) || some(noteWeak) || some(cardsLearned) ||
    !!load(SESSION_KEY, null) || !!load(SESSION102_KEY, null);
}

// 試験ごとの規模と進み具合
function examSummary(id) {
  const qs = examQuestions(id);
  const n = rankCounts(qs.map(q => q.id));
  const running = id === currentExam() ? session : load(sessionKey(id), null);
  return {
    questions: qs.length,
    sections: NOTE_SECTIONS.filter(s => examOfTheme(s.theme) === id && !isIntroTheme(s.theme)).length,
    cards: examCards(id).length,
    seen: qs.length - n.untouched,
    solved: n.solved + n.streak,
    running: !!(running && !running.finished)
  };
}

function renderExamSelect() {
  $("examChoices").innerHTML = Object.values(EXAMS).map(e => {
    const s = examSummary(e.id);
    const current = examId === e.id;
    const progress = s.seen
      ? "解いた問題 " + s.seen + "問（自力で正解 " + s.solved + "問）" + (s.running ? "・途中のセッションあり" : "")
      : "まだ解いていません";
    return html`
      <button class="exam-choice${current ? " is-current" : ""}" data-exam="${e.id}">
        <span class="exam-choice-head">
          <span class="exam-choice-no">${e.id}</span>
          <b class="exam-choice-title">${e.title}</b>
          ${current && raw('<span class="badge">学習中</span>')}
        </span>
        <span class="exam-choice-topics">
          ${examCategories(e.id).map(([c, name]) => raw(html`<span class="exam-topic"><span class="cat-id">${c}</span>${name}</span>`))}
        </span>
        <span class="exam-choice-meta">問題 ${s.questions}問 ・ ノート ${s.sections}項目 ・ 単語帳 ${s.cards}枚</span>
        <span class="exam-choice-progress">${progress}</span>
        <span class="btn btn-primary exam-choice-go">${current ? "このまま続ける" : "この試験を学習する"}</span>
      </button>`;
  }).join("");
}

function showExamSelect() {
  closeNotePanel();
  renderExamSelect();
  show("select");
}

// 学習する試験を切り替えて、その試験のホームを出す
function setExam(id) {
  if (!EXAMS[id]) return;
  if (examId && examId !== id) saveSession();      // いまの試験の途中のセッションを残す
  closeNotePanel();
  examId = id;
  save(EXAM_KEY, id);
  session = normalizeSession(load(sessionKey(), null));
  if (!session) remove(sessionKey());
  applyExamUI();
  renderHome();
}

// 試験に合わせて、名前の表示や一覧（出題範囲・ノート・単語帳・コマンド表）を作り直す
function applyExamUI() {
  const e = examInfo();
  // 試験を選ぶ前（初めての端末の選択画面）は、どちらの試験とも書かない
  $("brandExam").textContent = examId ? e.id : "レベル1";
  document.title = "Linuc レベル1 " + (examId ? e.id + " " : "") + "問題演習";
  $("examBarName").textContent = e.title;
  $("examBarRange").textContent = "主題 " + e.cats[0] + "〜" + e.cats[e.cats.length - 1];
  $("noteSearch").placeholder = "ノート内を検索（例: " + e.searchHint + "）";
  buildCatList();
  resetNotesForExam();
  resetCardsForExam();
  renderHelpGroups();
  renderHelpBody();
}

/* ---------------- 操作 ---------------- */
$("examChoices").addEventListener("click", (e) => {
  const b = e.target.closest(".exam-choice");
  if (b) setExam(b.dataset.exam);
});
$("btnExamSwitch").addEventListener("click", showExamSelect);
