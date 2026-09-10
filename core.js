/* =======================================================================
   共通の土台
   -----------------------------------------------------------------------
   すべての画面から使う保存領域・状態・小さな道具をここにまとめる。
   このファイルは最初に読み込むこと（データやビューより前）。
   ======================================================================= */

/* ---------------- 保存キー ---------------- */
const SESSION_KEY = "linuc101.session.v1";   // 進行中のセッション
const STATS_KEY   = "linuc101.stats.v1";     // 累計成績
const CONFIG_KEY  = "linuc101.config.v1";    // 出題設定
const LEARNED_KEY = "linuc101.learned.v1";   // ノートの「覚えた」チェック
const CARDS_KEY   = "linuc101.cards.v1";     // 単語帳の「覚えた」チェック
const STAMP_KEY   = "linuc101.stamp.v1";     // 進捗を最後に変更した時刻
const GIST_KEY    = "linuc101.gist.v1";      // 自動同期の設定（トークン等）
const HELP_OPEN_KEY = "linuc101.help.v1";    // コマンド表を開いているか

// 進捗として同期・バックアップの対象になるキー
const SYNCED_KEYS = [SESSION_KEY, STATS_KEY, CONFIG_KEY, LEARNED_KEY, CARDS_KEY];

/* ---------------- 保存と読み込み ---------------- */
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;   // localStorage が使えない環境でも動かす
  }
}

// 進捗が保存されたときに呼ばれる（自動同期の予約に使う。sync-view.js が設定する）
let onProgressSaved = null;
let syncMuted = false;                        // 同期で書き込んでいる間は再送しない

// 保存領域から消す（localStorage が使えない環境でも落ちないように）
function remove(key) {
  try { localStorage.removeItem(key); } catch (e) { /* noop */ }
}

// 進捗の最終変更時刻を記録する
function stampNow() {
  lastChangeAt = Date.now();
  try { localStorage.setItem(STAMP_KEY, JSON.stringify(lastChangeAt)); } catch (e) { /* noop */ }
}

function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 保存不可でも継続 */ }

  if (SYNCED_KEYS.includes(key)) {
    stampNow();
    if (!syncMuted && onProgressSaved) onProgressSaved();
  }
}

/* ---------------- アプリの状態 ---------------- */
let session      = load(SESSION_KEY, null);
let stats        = load(STATS_KEY, {});      // { 問題ID: {c:自力正解, w:不正解, a:参照正解} }
let learned      = load(LEARNED_KEY, {});    // { "主題/見出し": true }
let cardsLearned = load(CARDS_KEY, {});      // { カードID: true }
let lastChangeAt = load(STAMP_KEY, 0);       // 同期の新旧判定に使う
let gist         = load(GIST_KEY, { token: "", id: "", auto: true, lastSyncAt: 0 });
let config       = load(CONFIG_KEY, {
  count: 20, cats: null, order: "random", weak: false, keepHelp: true, imp: 0
});

/* ---------------- 小さな道具 ---------------- */
const $ = (id) => document.getElementById(id);

// HTMLに埋め込む文字列のエスケープ
function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

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
  return a.slice().sort().join(",") === b.slice().sort().join(",");
}

// 正答率の色分け（mid の境目だけ場所によって変える）
function rateClass(r, mid) {
  return r >= 80 ? "rate-good" : r >= (mid === undefined ? 60 : mid) ? "rate-mid" : "rate-bad";
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "不明";
  const p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "/" + p(d.getMonth() + 1) + "/" + p(d.getDate()) +
         " " + p(d.getHours()) + ":" + p(d.getMinutes());
}

// 入力欄にカーソルがあるか（キーボード操作の誤爆よけ）
function isTyping(el) {
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

/* ---------------- 節キー（"主題/見出し"）の扱い ---------------- */
function secTheme(key) { const i = key.indexOf("/"); return i < 0 ? "00" : key.slice(0, i); }
function secTitle(key) { const i = key.indexOf("/"); return i < 0 ? key : key.slice(i + 1); }

/* ---------------- 問題ごとの到達ランク ----------------
     3 ◎ 連続正解 … 直近2回以上つづけて自力で正解した
     2 ○ 正解     … 自力で正解した実績がある
     1 △ つまずき … 解いたが、まだ自力正解がない
     0 － 未着手   … まだ解いていない
------------------------------------------------------ */
const RANK_MARK  = ["－", "△", "○", "◎"];
const RANK_LABEL = ["未着手", "つまずき", "正解", "連続正解"];
const STREAK_RANK = 2;              // このランクに上がるのに必要な連続正解の回数

function qRank(id) {
  const s = stats[id];
  if (!s || (s.c + s.w + (s.a || 0)) === 0) return 0;
  if ((s.s || 0) >= STREAK_RANK) return 3;
  return s.c > 0 ? 2 : 1;
}

// その問題の現在の連続正解数
function qStreak(id) {
  const s = stats[id];
  return s ? (s.s || 0) : 0;
}

/* ---------------- セッションの集計 ---------------- */
function tally(s) {
  if (!s) return { total: 0, correct: 0, assist: 0, wrong: 0, skip: 0 };
  let correct = 0, assist = 0, wrong = 0;
  for (const r of s.results) {
    if (r === "correct") correct++;
    else if (r === "assist") assist++;      // コマンド表を参照しての正解
    else if (r === "wrong") wrong++;
  }
  const total = s.order.length;
  return { total, correct, assist, wrong, skip: total - correct - assist - wrong };
}

/* ---------------- 画面切り替え ---------------- */
const SCREENS = ["home", "quiz", "result", "notes", "cards"];

function show(name) {
  for (const id of SCREENS) $("screen-" + id).hidden = (id !== name);
  if (typeof aiRefresh === "function") aiRefresh();
  window.scrollTo(0, 0);
}

/* ---------------- チップ（1つだけ選ぶボタン列） ---------------- */
// data 属性の値を受け取るコールバックを登録する
function bindChips(boxId, attr, onPick) {
  const box = $(boxId);
  if (!box) return;
  box.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip || chip.dataset[attr] === undefined) return;
    [...box.children].forEach(c => {
      if (c.dataset[attr] !== undefined) c.classList.toggle("is-on", c === chip);
    });
    onPick(chip.dataset[attr], chip);
  });
}

// 保存済みの設定をチップ列に反映する
function selectChip(boxId, attr, value) {
  const box = $(boxId);
  if (!box) return;
  [...box.children].forEach(c => {
    if (c.dataset[attr] !== undefined) c.classList.toggle("is-on", c.dataset[attr] === String(value));
  });
}
