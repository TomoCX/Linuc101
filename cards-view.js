/* =======================================================================
   単語帳画面
   -----------------------------------------------------------------------
   CARDS（cards.js）を、セクション単位またはまとめてランダムに表示する。
   「覚えた」の状態は cardsLearned（app.js）に保持し、進捗の同期対象になる。
   ======================================================================= */

let cardSec    = null;      // 対象セクション（null = すべて）
let cardMode   = "card";    // "card"（1枚ずつ）/ "list"（一覧）
let cardOrder  = "seq";     // "seq"（順番）/ "shuffle"（ランダム）
let hideKnown  = false;     // 覚えたカードを隠す
let cardDeck   = [];        // 現在の対象カード
let cardIdx    = 0;         // 表示中のカード位置
let cardShown  = false;     // 意味を表示しているか
let cardsBuilt = false;


// セクションの見出しだけを取り出す（"1.02/アクセス権（パーミッション）" → "アクセス権（パーミッション）"）

function buildCardSelect() {
  const sel = document.getElementById("cardSec");
  sel.innerHTML = "";

  const all = document.createElement("option");
  all.value = "";
  all.textContent = "すべてのセクション（" + CARDS.length + "枚）";
  sel.appendChild(all);

  // 主題ごとにまとめて並べる
  const themes = [];
  CARDS.forEach(c => { const t = secTheme(c.sec); if (!themes.includes(t)) themes.push(t); });
  themes.sort();

  for (const t of themes) {
    const group = document.createElement("optgroup");
    group.label = (t === "00" ? "直前チェック・全体" : "主題 " + t);

    // 主題まるごと
    const nAll = CARDS.filter(c => secTheme(c.sec) === t).length;
    const oAll = document.createElement("option");
    oAll.value = t + "/*";
    oAll.textContent = "── この主題すべて（" + nAll + "枚）";
    group.appendChild(oAll);

    const keys = [];
    CARDS.forEach(c => { if (secTheme(c.sec) === t && !keys.includes(c.sec)) keys.push(c.sec); });
    for (const k of keys) {
      const n = CARDS.filter(c => c.sec === k).length;
      const o = document.createElement("option");
      o.value = k;
      o.textContent = secTitle(k) + "（" + n + "枚）";
      group.appendChild(o);
    }
    sel.appendChild(group);
  }
  sel.value = cardSec || "";
}

// 選択中の範囲にそのカードが含まれるか（"1.02/*" のように主題まとめも指定できる）
function cardMatch(c) {
  if (!cardSec) return true;
  if (cardSec.endsWith("/*")) return secTheme(c.sec) === cardSec.slice(0, -2);
  return c.sec === cardSec;
}

// 表示対象のカードを組み立てる
function buildDeck(keepPosition) {
  const prevId = keepPosition && cardDeck[cardIdx] ? cardDeck[cardIdx].id : null;

  let list = CARDS.filter(cardMatch);
  if (hideKnown) list = list.filter(c => !cardsLearned[c.id]);
  if (cardOrder === "shuffle") list = shuffle(list);

  cardDeck = list;
  const at = prevId ? cardDeck.findIndex(c => c.id === prevId) : -1;
  cardIdx = at >= 0 ? at : 0;
  if (cardIdx >= cardDeck.length) cardIdx = Math.max(0, cardDeck.length - 1);
}

function updateCardProgress() {
  const target = CARDS.filter(cardMatch);
  const done = target.filter(c => cardsLearned[c.id]).length;
  const p = target.length ? Math.round((done / target.length) * 100) : 0;
  document.getElementById("cardProgress").innerHTML =
    "覚えた <b>" + done + "</b> / " + target.length + " 枚（" + p + "%）";
}

function renderCard() {
  const empty = !cardDeck.length;
  document.getElementById("cardEmpty").hidden = !empty;
  document.getElementById("cardSingle").hidden = empty || cardMode !== "card";
  document.getElementById("cardList").hidden = empty || cardMode !== "list";
  updateCardProgress();
  if (empty) return;

  if (cardMode === "list") { renderCardList(); return; }

  const c = cardDeck[cardIdx];
  document.getElementById("fcSec").textContent = secTitle(c.sec);
  document.getElementById("fcTerm").textContent = c.term;
  document.getElementById("fcMean").textContent = c.mean;
  document.getElementById("fcMean").hidden = !cardShown;
  document.getElementById("fcTap").hidden = cardShown;
  document.getElementById("fcLearned").checked = !!cardsLearned[c.id];
  document.getElementById("flashcard").classList.toggle("is-learned", !!cardsLearned[c.id]);
  document.getElementById("fcPos").textContent = (cardIdx + 1) + " / " + cardDeck.length;
  document.getElementById("btnCardPrev").disabled = cardIdx === 0;
  document.getElementById("btnCardNext").textContent =
    cardIdx === cardDeck.length - 1 ? "最初へ戻る ↺" : "次へ →";
}

function renderCardList() {
  const box = document.getElementById("cardList");
  box.innerHTML = "";
  let lastSec = null;

  cardDeck.forEach(c => {
    if (c.sec !== lastSec && cardOrder !== "shuffle") {
      const h = document.createElement("div");
      h.className = "help-section";
      h.textContent = secTitle(c.sec);
      box.appendChild(h);
      lastSec = c.sec;
    }
    const row = document.createElement("div");
    row.className = "card-row" + (cardsLearned[c.id] ? " is-learned" : "");
    row.innerHTML =
      '<label class="learn-check card-row-check"><input type="checkbox" class="card-box" data-id="' + c.id + '"' +
        (cardsLearned[c.id] ? " checked" : "") + '><span>覚えた</span></label>' +
      '<div class="card-row-body">' +
        '<div class="card-row-term">' + esc(c.term) + "</div>" +
        '<div class="card-row-mean">' + esc(c.mean) + "</div>" +
      "</div>";
    box.appendChild(row);
  });
}

function setCardLearned(id, on) {
  if (on) cardsLearned[id] = true; else delete cardsLearned[id];
  save(CARDS_KEY, cardsLearned);
  updateCardProgress();
}

function moveCard(step) {
  if (!cardDeck.length) return;
  cardIdx = (cardIdx + step + cardDeck.length) % cardDeck.length;
  cardShown = false;
  renderCard();
}

function showCards(sec) {
  if (!cardsBuilt) { buildCardSelect(); cardsBuilt = true; }
  if (sec !== undefined) {
    cardSec = sec;
    document.getElementById("cardSec").value = sec || "";
  }
  cardShown = false;
  buildDeck(false);
  renderCard();
  show("cards");
}

// 同期でカードの状態を取り込んだときの再描画
function refreshCardsUI() {
  if (!cardsBuilt) return;
  buildDeck(true);
  renderCard();
}

/* ---------------- 操作 ---------------- */
document.getElementById("cardSec").addEventListener("change", (e) => {
  cardSec = e.target.value || null;
  cardShown = false;
  buildDeck(false);
  renderCard();
  window.scrollTo(0, 0);
});

document.getElementById("cardModeChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;

  if (chip.dataset.mode) {
    cardMode = chip.dataset.mode;
    [...e.currentTarget.children].forEach(c => {
      if (c.dataset.mode) c.classList.toggle("is-on", c === chip);
    });
  } else {
    // シャッフルは押すたびに切り替え（ONのあいだは並び順がランダム）
    cardOrder = (cardOrder === "shuffle") ? "seq" : "shuffle";
    chip.classList.toggle("is-on", cardOrder === "shuffle");
    cardIdx = 0;
  }
  cardShown = false;
  buildDeck(cardOrder !== "shuffle");
  renderCard();
});

document.getElementById("optHideKnown").addEventListener("change", (e) => {
  hideKnown = e.target.checked;
  buildDeck(true);
  renderCard();
});

document.getElementById("flashcard").addEventListener("click", (e) => {
  if (e.target.closest("input,label")) return;
  cardShown = !cardShown;
  renderCard();
});

document.getElementById("btnCardPrev").addEventListener("click", () => moveCard(-1));
document.getElementById("btnCardNext").addEventListener("click", () => moveCard(1));

document.getElementById("fcLearned").addEventListener("change", (e) => {
  const c = cardDeck[cardIdx];
  if (!c) return;
  setCardLearned(c.id, e.target.checked);
  document.getElementById("flashcard").classList.toggle("is-learned", e.target.checked);
});

document.getElementById("cardList").addEventListener("change", (e) => {
  const box = e.target.closest(".card-box");
  if (!box) return;
  setCardLearned(Number(box.dataset.id), box.checked);
  box.closest(".card-row").classList.toggle("is-learned", box.checked);
});

document.getElementById("btnCardsTop").addEventListener("click", () => showCards());
document.getElementById("btnCardsHome").addEventListener("click", () => renderHome());

// キーボード操作（単語帳の1枚ずつ表示のときだけ）
document.addEventListener("keydown", (e) => {
  if (document.getElementById("screen-cards").hidden) return;
  if (cardMode !== "card") return;
  if (isTyping(e.target) || e.ctrlKey || e.altKey || e.metaKey) return;

  if (e.key === "ArrowRight") { e.preventDefault(); moveCard(1); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); moveCard(-1); }
  else if (e.key === " ") { e.preventDefault(); cardShown = !cardShown; renderCard(); }
  else if (e.key === "Enter") {
    e.preventDefault();
    const c = cardDeck[cardIdx];
    if (!c) return;
    setCardLearned(c.id, !cardsLearned[c.id]);
    renderCard();
  }
});

// ホーム画面の入口
function renderCardJump() {
  const box = document.getElementById("cardJump");
  if (!box) return;
  box.innerHTML = "";

  const mk = (label, value, shuffleOn) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = label;
    b.addEventListener("click", () => {
      cardOrder = shuffleOn ? "shuffle" : "seq";
      const chip = document.querySelector('#cardModeChips [data-order="shuffle"]');
      if (chip) chip.classList.toggle("is-on", shuffleOn);
      showCards(value);
    });
    box.appendChild(b);
  };

  mk("全部シャッフル（" + CARDS.length + "枚）", null, true);
  const themes = [];
  CARDS.forEach(c => { const t = secTheme(c.sec); if (!themes.includes(t)) themes.push(t); });
  themes.sort().forEach(t => {
    const n = CARDS.filter(c => secTheme(c.sec) === t).length;
    mk((t === "00" ? "直前チェック" : t) + "（" + n + "枚）", t + "/*", false);
  });
}
renderCardJump();
