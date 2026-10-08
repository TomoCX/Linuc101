/* =======================================================================
   復習おすすめ（回答状況に応じた学習テキストの表示）
   -----------------------------------------------------------------------
   ・結果画面 … 直前のセッションで落とした項目
   ・ホーム   … 累計成績で自力正解できていない項目
   どちらも「その節の全問題数」を分母にして習得状況を示す。
   ======================================================================= */

/* ---------------- 集計 ---------------- */

/*
   累計成績から、節ごとの習得状況を出す。
   分母はその節の全問題数。1問ずつ到達ランクで分類する（core.js の rankCounts）。
     streak    … ◎ 2回以上つづけて自力正解（定着）
     mastered  … ○ 一度でも自力で正解した
     stumbled  … △ 解いたが自力正解はまだ（不正解・参照つき正解のみ）
     untouched … － まだ一度も解いていない
   ok = streak + mastered（自力で正解できている問題）
*/
function recMasteryByStats() {
  const out = [];
  questionsBySec().forEach((ids, key) => {
    const n = rankCounts(ids);
    const ok = n.streak + n.solved;
    out.push({
      key: key, title: secTitle(key), theme: secTheme(key),
      total: ids.length,
      streak: n.streak, mastered: n.solved, stumbled: n.stumbled, untouched: n.untouched,
      ok: ok,
      answered: ok + n.stumbled,
      rate: pct(ok, ids.length)
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

  const nQ = secQuestionIds(item.key).length;
  const nC = CARDS.filter(c => c.sec === item.key).length;
  const sec = noteByKey(item.key);

  // 習得状況のバー（連続正解／正解／つまずき／未着手）
  const seg = (cls, n) => raw(html`<span class="seg ${cls}" style="width:${n / item.total * 100}%"></span>`);
  const bar = item.bar && raw(html`
    <div class="rec-bar" title="連続正解 ${item.streak} ・ 正解 ${item.mastered} ・ つまずき ${item.stumbled} ・ 未着手 ${item.untouched}">
      ${seg("seg-streak", item.streak)}${seg("seg-correct", item.mastered)}${seg("seg-wrong", item.stumbled)}${seg("seg-skip", item.untouched)}
    </div>`);

  const text = sec && raw(html`
    <details class="rec-text">
      <summary>学習テキストを開く</summary>
      <div class="note-sec rec-note">${raw(noteBodyHtml(sec))}</div>
    </details>`);

  el.innerHTML = html`
    <div class="rec-head">
      <span class="rec-theme">${secTheme(item.key)}</span>
      <span class="rec-title">${item.title}</span>
      <span class="rec-rate ${rateClass(item.rate, 50)}">${item.rate}%</span>
    </div>
    <div class="rec-sub">${raw(item.sub)}</div>
    ${bar}
    ${text}
    <div class="btn-row btn-row-tight rec-acts">
      ${nQ > 0 && raw(html`<button class="btn btn-mini rec-quiz">この項目を解く（${nQ}問）</button>`)}
      ${nC > 0 && raw(html`<button class="btn btn-mini rec-cards">単語帳（${nC}枚）</button>`)}
      ${sec && raw('<button class="btn btn-mini btn-ghost rec-note-open">ノートで開く</button>')}
    </div>`;
  return el;
}

function recRender(boxId, items, emptyText) {
  const box = $(boxId);
  box.innerHTML = "";
  if (!items.length) {
    box.innerHTML = html`<div class="rec-empty">${emptyText}</div>`;
    return;
  }
  for (const item of items) box.appendChild(recBuildItem(item));
}

// 「ほかに n 項目」のバッジ（表示しきれなかった数）
function recSetMore(id, shown, total) {
  const el = $(id);
  el.hidden = total <= shown;
  el.textContent = "ほかに " + Math.max(0, total - shown) + " 項目";
}

// ボタンはまとめて処理する
function recBindActions(boxId) {
  $(boxId).addEventListener("click", (e) => {
    const item = e.target.closest(".rec-item");
    if (!item) return;
    const key = item.dataset.key;

    if (e.target.closest(".rec-quiz")) startSectionQuiz(key);
    else if (e.target.closest(".rec-cards")) showCards(key);
    else if (e.target.closest(".rec-note-open")) showNoteSection(key);
  });
}

/* ---------------- 呼び出し口 ---------------- */

// 結果画面：この回で落とした項目（累計の習得状況もあわせて出す）
function renderResultRecommend() {
  $("recResultCard").hidden = false;

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
           "この項目は全 " + m.total + "問 ── 自力正解 <b>" + m.ok + "問</b>（うち◎連続正解 " + m.streak + "問） ・ " +
           "つまずき " + m.stumbled + "問 ・ 未着手 " + m.untouched + "問"
    }));
  });

  // 落とした数が多い順、次に習得率の低い順
  items.sort((x, y) => (y.lost - x.lost) || (x.rate - y.rate));

  recRender("recResult", items.slice(0, 6), "この回で落とした項目はありません。よくできています。");
  recSetMore("recResultMore", 6, items.length);
}

// ホーム：累計成績から見た習得状況
function renderHomeRecommend() {
  const card = $("recHomeCard");
  const all = recMasteryByStats().filter(x => x.answered > 0);   // 一度は解いた節だけ

  if (!all.length) { card.hidden = true; return; }
  card.hidden = false;

  // まだ自力正解できていない問題が残っている節を、習得率の低い順に
  const items = all
    .filter(x => x.ok < x.total)
    .sort((x, y) => (x.rate - y.rate) || (y.stumbled - x.stumbled))
    .map(x => Object.assign({}, x, {
      bar: true,
      sub: "全 " + x.total + "問中 <b>" + x.ok + "問</b> を自力で正解（うち◎連続 " + x.streak + "問）" +
           " ・ つまずき " + x.stumbled + "問 ・ 未着手 " + x.untouched + "問"
    }));

  recRender("recHome", items.slice(0, 5),
    "解いた項目はすべて自力で正解できています。範囲を広げてみましょう。");
  recSetMore("recHomeMore", 5, items.length);
}

recBindActions("recResult");
recBindActions("recHome");
