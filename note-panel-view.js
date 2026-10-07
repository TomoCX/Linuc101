/* =======================================================================
   この問題のノート（右から出るパネル）
   -----------------------------------------------------------------------
   出題中や結果の解答一覧から、その問題に紐づくノートの節を
   コマンド表と同じように画面の横に出して確認する。
   解答前に開いた場合は、コマンド表と同じく「参照した」として記録する。
   ======================================================================= */

let notePanelKey = null;      // パネルに出している節（"主題/見出し"）

function notePanelIsOpen() { return document.body.classList.contains("note-open"); }

// key の節を開く（key が空なら閉じる）
function openNotePanel(key) {
  const sec = key && NOTE_SECTIONS.find(s => noteKey(s) === key);
  if (!sec) { closeNotePanel(); return; }

  notePanelKey = key;
  if (helpIsOpen()) openHelp(false);          // 右側のパネルは1つずつ

  const stars = noteStars(key);
  $("notePanelTitle").innerHTML =
    html`<span class="note-star star-${stars}">${"★★★".slice(0, stars)}</span>${sec.title}`;
  $("notePanelTheme").textContent = sec.themeTitle;
  const fig = NOTE_FIGURES[sec.title];
  $("npBody").innerHTML =
    (fig ? html`<div class="note-fig">${raw(fig)}</div>` : "") + mdToHtml(sec.lines);
  $("notePanel").querySelector(".help-body").scrollTop = 0;
  paintNotePanelStatus();

  document.body.classList.add("note-open");

  // 出題中に解答前に開いたら「参照した」として記録する（コマンド表と同じ扱い）
  if (!$("screen-quiz").hidden && !answered) helpUsed = true;
  $("npUsedNote").hidden = !(!$("screen-quiz").hidden && !answered);
  updateQuizHelpUI();
}

function closeNotePanel() {
  if (!notePanelIsOpen()) return;
  document.body.classList.remove("note-open");
  updateQuizHelpUI();
}

// 「覚えた／苦手」のチェックをパネルに反映する
function paintNotePanelStatus() {
  if (!notePanelKey) return;
  const st = noteStatus(notePanelKey);
  $("npLearned").checked = st === "learned";
  $("npWeak").checked = st === "weak";
  const acts = $("npActs");
  acts.classList.toggle("is-learned", st === "learned");
  acts.classList.toggle("is-weak", st === "weak");
}

// 出題中の問題のノートを開く／閉じる
function toggleQuizNote() {
  if (notePanelIsOpen()) { closeNotePanel(); return; }
  const q = QMAP.get(session.order[session.idx]);
  if (q && q.sec) openNotePanel(q.sec);
}

/* ---------------- 操作 ---------------- */
$("btnNoteQuiz").addEventListener("click", toggleQuizNote);
$("btnNotePanelClose").addEventListener("click", closeNotePanel);
$("noteBackdrop").addEventListener("click", closeNotePanel);

// 覚えた／苦手（ノート画面と同じ保存先。片方を付けたらもう片方は外す）
["npLearned", "npWeak"].forEach(id => {
  $(id).addEventListener("change", (e) => {
    const key = notePanelKey;
    if (!key) return;
    const isWeak = id === "npWeak";
    const [mine, other] = isWeak ? [noteWeak, learned] : [learned, noteWeak];
    if (e.target.checked) { mine[key] = true; delete other[key]; } else delete mine[key];
    save(WEAK_KEY, noteWeak);
    save(LEARNED_KEY, learned);
    paintNotePanelStatus();
    if (notesBuilt) refreshLearnedUI();       // ノート画面の表示もそろえる
  });
});

// ノート画面のその節へ移る
$("btnNpOpenNotes").addEventListener("click", () => {
  const key = notePanelKey;
  closeNotePanel();
  if (session && !$("screen-quiz").hidden) save(SESSION_KEY, session);   // 出題は中断として残す
  showNotes();
  const el = document.querySelector('#notesBody .note-sec[data-key="' + CSS.escape(key) + '"]');
  if (el) el.scrollIntoView({ block: "start" });
});

// 出題・結果以外の画面へ移ったら閉じる（パネルの中身はその問題のためのもの）
onViewChanged(() => {
  if (notePanelIsOpen() && !["quiz", "result"].includes(document.body.dataset.screen)) closeNotePanel();
});

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.key === "Escape" && notePanelIsOpen()) { closeNotePanel(); return; }
  if (isTyping(e.target)) return;
  if ((e.key === "n" || e.key === "N") && !$("screen-quiz").hidden) {
    e.preventDefault();
    toggleQuizNote();
  }
});
