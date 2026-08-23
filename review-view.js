/* =======================================================================
   復習おすすめ（回答状況に応じた学習テキストの表示）
   -----------------------------------------------------------------------
   ・結果画面 … 直前のセッションで落とした項目
   ・ホーム   … 累計成績で自力正解できていない項目
   それぞれの学習テキスト（ノート本文）をその場で開けるようにする。
   ======================================================================= */

function recSecTitle(key) { const i = key.indexOf("/"); return i < 0 ? key : key.slice(i + 1); }
function recSecTheme(key) { const i = key.indexOf("/"); return i < 0 ? "00" : key.slice(0, i); }

// 節キー → ノート本文
const NOTE_BY_KEY = new Map();
(function () {
  if (typeof NOTE_SECTIONS === "undefined") return;
  for (const s of NOTE_SECTIONS) NOTE_BY_KEY.set(s.theme + "/" + s.title, s);
})();

/* ---------------- 集計 ---------------- */

// 累計成績から節ごとに集計する
function recAggFromStats() {
  const m = new Map();
  for (const q of QUESTIONS) {
    if (!q.sec) continue;
    const st = stats[q.id];
    if (!st) continue;
    const a = m.get(q.sec) || { c: 0, w: 0, a: 0, skip: 0 };
    a.c += st.c; a.w += st.w; a.a += (st.a || 0);
    m.set(q.sec, a);
  }
  return m;
}

// 直前のセッションから節ごとに集計する
function recAggFromSession(s) {
  const m = new Map();
  if (!s) return m;
  s.order.forEach((id, i) => {
    const q = QMAP.get(id);
    if (!q || !q.sec) return;
    const r = s.results[i];
    const a = m.get(q.sec) || { c: 0, w: 0, a: 0, skip: 0 };
    if (r === "correct") a.c++;
    else if (r === "wrong") a.w++;
    else if (r === "assist") a.a++;
    else a.skip++;
    m.set(q.sec, a);
  });
  return m;
}

// 弱い順に並べる（自力で正解できなかった問題があるものだけ）
function recWeakList(m, limit) {
  const out = [];
  m.forEach((a, key) => {
    const miss = a.w + a.a + a.skip;
    if (!miss) return;
    const total = a.c + miss;
    out.push({
      key: key,
      title: recSecTitle(key),
      theme: recSecTheme(key),
      correct: a.c, wrong: a.w, assist: a.a, skip: a.skip,
      total: total,
      miss: miss,
      rate: total ? Math.round((a.c / total) * 100) : 0
    });
  });
  out.sort((x, y) => (x.rate - y.rate) || (y.miss - x.miss));
  return limit ? out.slice(0, limit) : out;
}

/* ---------------- 表示 ---------------- */

function recRateClass(r) { return r >= 80 ? "rate-good" : r >= 50 ? "rate-mid" : "rate-bad"; }

function recBuildItem(item) {
  const el = document.createElement("div");
  el.className = "rec-item";
  el.dataset.key = item.key;

  const parts = [];
  if (item.wrong)  parts.push("不正解 " + item.wrong);
  if (item.assist) parts.push("参照 " + item.assist);
  if (item.skip)   parts.push("未回答 " + item.skip);

  const nQ = QUESTIONS.filter(q => q.sec === item.key).length;
  const nC = (typeof CARDS !== "undefined") ? CARDS.filter(c => c.sec === item.key).length : 0;
  const sec = NOTE_BY_KEY.get(item.key);

  let html =
    '<div class="rec-head">' +
      '<span class="rec-theme">' + recSecTheme(item.key) + "</span>" +
      '<span class="rec-title">' + noteEsc(item.title) + "</span>" +
      '<span class="rec-rate ' + recRateClass(item.rate) + '">' + item.rate + "%</span>" +
    "</div>" +
    '<div class="rec-sub">' + item.total + "問中 " + item.correct + "問を自力で正解" +
      (parts.length ? "（" + parts.join(" ・ ") + "）" : "") + "</div>";

  if (sec) {
    const fig = NOTE_FIGURES[sec.title] ? '<div class="note-fig">' + NOTE_FIGURES[sec.title] + "</div>" : "";
    html +=
      '<details class="rec-text">' +
        "<summary>学習テキストを開く</summary>" +
        '<div class="note-sec rec-note">' + fig + mdToHtml(sec.lines) + "</div>" +
      "</details>";
  }

  html += '<div class="btn-row btn-row-tight rec-acts">';
  if (nQ) html += '<button class="btn btn-mini rec-quiz">この項目を解く（' + nQ + '問）</button>';
  if (nC) html += '<button class="btn btn-mini rec-cards">単語帳（' + nC + '枚）</button>';
  if (sec) html += '<button class="btn btn-mini btn-ghost rec-note-open">ノートで開く</button>';
  html += "</div>";

  el.innerHTML = html;
  return el;
}

function recRender(boxId, items, emptyText) {
  const box = document.getElementById(boxId);
  if (!box) return;
  box.innerHTML = "";

  if (!items.length) {
    box.innerHTML = '<div class="rec-empty">' + emptyText + "</div>";
    return;
  }
  for (const item of items) box.appendChild(recBuildItem(item));
}

// ボタンはまとめて処理する
function recBindActions(boxId) {
  const box = document.getElementById(boxId);
  if (!box) return;
  box.addEventListener("click", (e) => {
    const item = e.target.closest(".rec-item");
    if (!item) return;
    const key = item.dataset.key;

    if (e.target.closest(".rec-quiz")) { startSectionQuiz(key); return; }
    if (e.target.closest(".rec-cards")) { showCards(key); return; }
    if (e.target.closest(".rec-note-open")) {
      showNotes();
      const el = document.querySelector('#notesBody .note-sec[data-key="' + CSS.escape(key) + '"]');
      if (el) el.scrollIntoView({ block: "start" });
    }
  });
}

/* ---------------- 呼び出し口 ---------------- */

// 結果画面：直前のセッションで落とした項目
function renderResultRecommend() {
  const card = document.getElementById("recResultCard");
  const items = recWeakList(recAggFromSession(session));
  card.hidden = false;
  recRender("recResult", items.slice(0, 6),
    "この回で落とした項目はありません。よくできています。");

  const more = document.getElementById("recResultMore");
  if (more) {
    more.hidden = items.length <= 6;
    more.textContent = "ほかに " + Math.max(0, items.length - 6) + " 項目";
  }
}

// ホーム：累計成績から
function renderHomeRecommend() {
  const card = document.getElementById("recHomeCard");
  const all = recWeakList(recAggFromStats());
  const answered = Object.keys(stats).length;

  if (!answered) { card.hidden = true; return; }
  card.hidden = false;
  recRender("recHome", all.slice(0, 5),
    "自力で正解できていない項目はありません。範囲を広げて解いてみましょう。");

  const more = document.getElementById("recHomeMore");
  if (more) {
    more.hidden = all.length <= 5;
    more.textContent = "ほかに " + Math.max(0, all.length - 5) + " 項目";
  }
}

recBindActions("recResult");
recBindActions("recHome");
