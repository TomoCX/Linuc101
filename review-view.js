/* =======================================================================
   復習おすすめ（回答状況に応じた学習テキストの表示）
   -----------------------------------------------------------------------
   ・結果画面 … 直前のセッションで落とした項目
   ・ホーム   … 累計成績で自力正解できていない項目
   どちらも「その節の全問題数」を分母にして習得状況を示す。
   ======================================================================= */

function recSecTitle(key) { const i = key.indexOf("/"); return i < 0 ? key : key.slice(i + 1); }
function recSecTheme(key) { const i = key.indexOf("/"); return i < 0 ? "00" : key.slice(0, i); }

// 節キー → ノート本文
const NOTE_BY_KEY = new Map();
(function () {
  if (typeof NOTE_SECTIONS === "undefined") return;
  for (const s of NOTE_SECTIONS) NOTE_BY_KEY.set(s.theme + "/" + s.title, s);
})();

// 節キー → その節の問題ID一覧
const QIDS_BY_SEC = new Map();
(function () {
  for (const q of QUESTIONS) {
    if (!q.sec) continue;
    if (!QIDS_BY_SEC.has(q.sec)) QIDS_BY_SEC.set(q.sec, []);
    QIDS_BY_SEC.get(q.sec).push(q.id);
  }
})();

/* ---------------- 集計 ---------------- */

/*
   累計成績から、節ごとの習得状況を出す。
   分母はその節の全問題数。1問ずつ次のどれかに分類する。
     mastered  … 一度でも自力で正解した
     stumbled  … 解いたが自力正解はまだ（不正解・参照つき正解のみ）
     untouched … まだ一度も解いていない
*/
function recMasteryByStats() {
  const out = [];
  QIDS_BY_SEC.forEach((ids, key) => {
    let mastered = 0, stumbled = 0, untouched = 0;
    for (const id of ids) {
      const st = stats[id];
      if (!st || (st.c + st.w + (st.a || 0)) === 0) { untouched++; continue; }
      if (st.c > 0) mastered++; else stumbled++;
    }
    out.push({
      key: key, title: recSecTitle(key), theme: recSecTheme(key),
      total: ids.length, mastered: mastered, stumbled: stumbled, untouched: untouched,
      answered: mastered + stumbled,
      rate: ids.length ? Math.round((mastered / ids.length) * 100) : 0
    });
  });
  return out;
}

// 直前のセッションで、その節をどれだけ落としたか
function recMissBySession(s) {
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

/* ---------------- 表示 ---------------- */

function recRateClass(r) { return r >= 80 ? "rate-good" : r >= 50 ? "rate-mid" : "rate-bad"; }

/*
   item に必要なもの
     key / title / theme / rate / total（節の全問題数）
     sub   … 内訳の文
     badge … 率のとなりに出す補足（省略可）
*/
function recBuildItem(item) {
  const el = document.createElement("div");
  el.className = "rec-item";
  el.dataset.key = item.key;

  const nQ = (QIDS_BY_SEC.get(item.key) || []).length;
  const nC = (typeof CARDS !== "undefined") ? CARDS.filter(c => c.sec === item.key).length : 0;
  const sec = NOTE_BY_KEY.get(item.key);

  let html =
    '<div class="rec-head">' +
      '<span class="rec-theme">' + recSecTheme(item.key) + "</span>" +
      '<span class="rec-title">' + noteEsc(item.title) + "</span>" +
      '<span class="rec-rate ' + recRateClass(item.rate) + '">' + item.rate + "%</span>" +
    "</div>" +
    '<div class="rec-sub">' + item.sub + "</div>";

  // 習得状況のバー（自力正解／つまずき／未着手）
  if (item.bar) {
    html +=
      '<div class="rec-bar" title="自力正解 ' + item.mastered + ' ・ つまずき ' + item.stumbled + ' ・ 未着手 ' + item.untouched + '">' +
        '<span class="seg seg-correct" style="width:' + (item.mastered / item.total * 100) + '%"></span>' +
        '<span class="seg seg-wrong" style="width:' + (item.stumbled / item.total * 100) + '%"></span>' +
        '<span class="seg seg-skip" style="width:' + (item.untouched / item.total * 100) + '%"></span>' +
      "</div>";
  }

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

function recSetMore(id, hidden, n) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = hidden;
  el.textContent = "ほかに " + n + " 項目";
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

// 結果画面：この回で落とした項目（累計の習得状況もあわせて出す）
function renderResultRecommend() {
  document.getElementById("recResultCard").hidden = false;

  const miss = recMissBySession(session);
  const mastery = new Map(recMasteryByStats().map(x => [x.key, x]));
  const items = [];

  miss.forEach((a, key) => {
    const lost = a.w + a.a + a.skip;
    if (!lost) return;
    const m = mastery.get(key);
    if (!m) return;

    const parts = [];
    if (a.w) parts.push("不正解 " + a.w);
    if (a.a) parts.push("参照 " + a.a);
    if (a.skip) parts.push("未回答 " + a.skip);

    items.push(Object.assign({}, m, {
      lost: lost,
      bar: true,
      sub: "この回で " + lost + "問 落とした（" + parts.join(" ・ ") + "）<br>" +
           "この項目は全 " + m.total + "問 ── 自力正解 <b>" + m.mastered + "問</b> ・ " +
           "つまずき " + m.stumbled + "問 ・ 未着手 " + m.untouched + "問"
    }));
  });

  // 落とした数が多い順、次に習得率の低い順
  items.sort((x, y) => (y.lost - x.lost) || (x.rate - y.rate));

  recRender("recResult", items.slice(0, 6), "この回で落とした項目はありません。よくできています。");
  recSetMore("recResultMore", items.length <= 6, Math.max(0, items.length - 6));
}

// ホーム：累計成績から見た習得状況
function renderHomeRecommend() {
  const card = document.getElementById("recHomeCard");
  const all = recMasteryByStats().filter(x => x.answered > 0);   // 一度は解いた節だけ

  if (!all.length) { card.hidden = true; return; }
  card.hidden = false;

  // まだ自力正解できていない問題が残っている節を、習得率の低い順に
  const items = all
    .filter(x => x.mastered < x.total)
    .sort((x, y) => (x.rate - y.rate) || (y.stumbled - x.stumbled))
    .map(x => Object.assign({}, x, {
      bar: true,
      sub: "全 " + x.total + "問中 <b>" + x.mastered + "問</b> を自力で正解" +
           "（つまずき " + x.stumbled + "問 ・ 未着手 " + x.untouched + "問）"
    }));

  recRender("recHome", items.slice(0, 5),
    "解いた項目はすべて自力で正解できています。範囲を広げてみましょう。");
  recSetMore("recHomeMore", items.length <= 5, Math.max(0, items.length - 5));
}

recBindActions("recResult");
recBindActions("recHome");
