/* =======================================================================
   この問題のノート（右から出るパネル）
   -----------------------------------------------------------------------
   出題中や結果の解答一覧から、その問題に紐づくノートの節を
   コマンド表と同じように画面の横に出して確認する。
   解答前に開いた場合は、コマンド表と同じく「参照した」として記録する。
   ======================================================================= */

let notePanelKey = null;      // パネルに出している節（"主題/見出し"）

function notePanelIsOpen() { return document.body.classList.contains("note-open"); }

// key の節を開く（その節が無ければ閉じる）
function openNotePanel(key) {
  const sec = key && noteByKey(key);
  if (!sec) { closeNotePanel(); return; }

  notePanelKey = key;
  if (helpIsOpen()) openHelp(false);          // 右側のパネルは1つずつ

  $("notePanelTitle").innerHTML = noteStarsHtml(key) + esc(sec.title);
  $("notePanelTheme").textContent = sec.themeTitle;
  $("npBody").innerHTML = noteBodyHtml(sec);
  $("notePanel").querySelector(".help-body").scrollTop = 0;
  paintNotePanelStatus();

  // 出題中に解答前に開いたら「参照した」として記録する（コマンド表と同じ扱い）
  $("npUsedNote").hidden = !(currentScreen() === "quiz" && !answered);
  document.body.classList.add("note-open");
  markReferred();
  updateQuizRefUI();
}

function closeNotePanel() {
  if (!notePanelIsOpen()) return;
  document.body.classList.remove("note-open");
  updateQuizRefUI();
}

// 「覚えた／苦手」のチェックをパネルに反映する
function paintNotePanelStatus() {
  const st = noteStatus(notePanelKey);
  $("npLearned").checked = st === "learned";
  $("npWeak").checked = st === "weak";
  $("npActs").classList.toggle("is-learned", st === "learned");
  $("npActs").classList.toggle("is-weak", st === "weak");
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

// 覚えた／苦手（ノート画面と同じ記録）
for (const [id, kind] of [["npLearned", "learned"], ["npWeak", "weak"]]) {
  $(id).addEventListener("change", (e) => {
    if (!notePanelKey) return;
    setNoteMark(notePanelKey, kind, e.target.checked);
    paintNotePanelStatus();
    if (notesBuilt) refreshLearnedUI();       // ノート画面の表示もそろえる
  });
}

// ノート画面のその節へ移る（出題中なら、セッションは中断として残る）
$("btnNpOpenNotes").addEventListener("click", () => {
  const key = notePanelKey;
  closeNotePanel();
  saveSession();
  showNoteSection(key);
});

// 出題・結果以外の画面へ移ったら閉じる（パネルの中身はその問題のためのもの）
onViewChanged(() => {
  if (notePanelIsOpen() && !["quiz", "result"].includes(currentScreen())) closeNotePanel();
});

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.key === "Escape" && notePanelIsOpen()) { closeNotePanel(); return; }
  if (isTyping(e.target)) return;
  if ((e.key === "n" || e.key === "N") && currentScreen() === "quiz") {
    e.preventDefault();
    toggleQuizNote();
  }
});
