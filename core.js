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
  count: 20, cats: null, order: "random", weak: false, shuffle: true, keepHelp: true, imp: 0
});

/* ---------------- 小さな道具 ---------------- */
const $ = (id) => document.getElementById(id);

// HTMLに埋め込む文字列のエスケープ
function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/* ---------------- HTMLの組み立て ----------------
   html`<b>${値}</b>` と書くと、${} の中身は自動でエスケープされる。
     ・すでにHTMLとして組み立て済みの文字列は raw(文字列) で包む
     ・配列はつなげて出す（要素ごとにエスケープ／rawを判定）
     ・null / undefined / false は何も出さない（条件付きの部品に使う）
------------------------------------------------------ */
class RawHtml { constructor(s) { this.s = String(s); } }
function raw(s) { return s instanceof RawHtml ? s : new RawHtml(s); }

function html(strings, ...vals) {
  const piece = (v) => {
    if (v instanceof RawHtml) return v.s;
    if (Array.isArray(v)) return v.map(piece).join("");
    if (v === null || v === undefined || v === false) return "";
    return esc(v);
  };
  let out = "";
  strings.forEach((str, i) => { out += str; if (i < vals.length) out += piece(vals[i]); });
  return out;
}

/* ---------------- 画面下の短い通知 ---------------- */
let toastTimer = null;

// kind: "ok" | "ng" | 省略（ふつう）。ms を省略すると 4.5 秒で消える
function toast(text, kind, ms) {
  const el = $("toast");
  if (!el) return;
  el.hidden = false;
  el.className = kind ? "is-" + kind : "";
  el.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, ms || 4500);
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

/* ---------------- 問題の表示に使う道具 ---------------- */
const KEYS = ["A", "B", "C", "D", "E", "F", "G", "H"];   // 選択肢の記号

// 重要度の表示（3=必出／2=重要／1=補足）
function impStars(n) { return "★★★".slice(0, n) + "☆☆☆".slice(0, 3 - n); }
function impLabel(n) { return n === 3 ? "必出" : n === 2 ? "重要" : "補足"; }

/* ---------------- 累計成績（stats）の読み書き ----------------
   stats[問題ID] = { c, w, a, s, t }
     c … 自力で正解した回数    w … 不正解の回数    a … 参照つき正解の回数
     s … 現在の連続正解数（不正解・参照で 0 に戻る）
     t … 最後に解答した時刻（ms）。旧データには無い（0 = 不明）
   ほかのファイルからは直接触らず、ここの関数を通す。
------------------------------------------------------ */
function statOf(id) {
  const s = stats[id] || {};
  return { c: s.c || 0, w: s.w || 0, a: s.a || 0, s: s.s || 0, t: s.t || 0 };
}
function statTries(id) { const s = statOf(id); return s.c + s.w + s.a; }   // 解いた回数
function statFails(id) { const s = statOf(id); return s.w + s.a; }         // 自力で正解できなかった回数

// 累計成績を prev → next へ付け替える（null は「記録なし」）
function recordStat(qid, prev, next) {
  if (prev === next) return;
  const s = statOf(qid);

  if (prev === "correct") { s.c = Math.max(0, s.c - 1); s.s = Math.max(0, s.s - 1); }
  if (prev === "assist")  s.a = Math.max(0, s.a - 1);
  if (prev === "wrong")   s.w = Math.max(0, s.w - 1);

  if (next === "correct") { s.c++; s.s++; }
  if (next === "assist")  { s.a++; s.s = 0; }     // 参照した時点で連続は途切れる
  if (next === "wrong")   { s.w++; s.s = 0; }

  s.t = Date.now();
  stats[qid] = s;
  save(STATS_KEY, stats);
}

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
  const s = statOf(id);
  if (s.c + s.w + s.a === 0) return 0;
  if (s.s >= STREAK_RANK) return 3;
  return s.c > 0 ? 2 : 1;
}

// その問題の現在の連続正解数
function qStreak(id) { return statOf(id).s; }

/* ---------------- 復習の間隔（間隔反復） ----------------
   連続正解が伸びるほど、次に出すまでの日数を空ける。
     連続 0 … すぐ   1 … 1日   2 … 3日   3 … 7日   4 … 14日   5以上 … 30日
   最後に解いた時刻が無い旧データは「期限切れ」として扱う。
------------------------------------------------------ */
const REVIEW_DAYS = [0, 1, 3, 7, 14, 30];
const DAY_MS = 24 * 60 * 60 * 1000;

function reviewDays(streak) { return REVIEW_DAYS[Math.min(streak, REVIEW_DAYS.length - 1)]; }
function daysSince(t) { return t ? (Date.now() - t) / DAY_MS : Infinity; }

// 復習の期限が来ているか（解いたことがない問題は対象外）
function isDue(id) {
  const s = statOf(id);
  if (s.c + s.w + s.a === 0) return false;
  return daysSince(s.t) >= reviewDays(s.s);
}

// 「前回: 3日前」のような表示
function lastAnsweredText(id) {
  const t = statOf(id).t;
  if (!t) return "";
  const d = Math.floor(daysSince(t));
  return d === 0 ? "今日" : d + "日前";
}

/* ---------------- 選択肢の表示順 ----------------
   正解の位置が偏らないよう、出題ごとに並び替える。
   session.perms[i] に「表示位置 → 元の番号」を持ち、
   記録（picked / answer）は元の番号のまま扱う。
------------------------------------------------------ */
function makePerm(n, shuffled) {
  const p = [...Array(n).keys()];
  return shuffled ? shuffle(p) : p;
}

// セッションの i 問目の表示順（無ければ元の順）
function choicePerm(s, i, n) {
  const p = s.perms && s.perms[i];
  return (Array.isArray(p) && p.length === n) ? p : [...Array(n).keys()];
}

// 元の番号 → 表示の記号（A, B, …）
function choiceKey(perm, orig) {
  const d = perm.indexOf(orig);
  return KEYS[d] || (d + 1);
}

// 記録の並び（元の番号の配列）を、画面の並び順で「A. 本文 ／ B. 本文」の形にする
function choiceText(q, perm, origs) {
  return origs.slice()
    .sort((x, y) => perm.indexOf(x) - perm.indexOf(y))
    .map(n => choiceKey(perm, n) + ". " + q.choices[n]).join(" ／ ");
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

/* ---------------- 画面の変化を知らせる ----------------
   画面の切り替えや出題内容の変化を、ほかの機能（Claudeにコピー など）へ伝える。
   core.js が個々の機能を知らなくて済むように、受け取る側が登録する形にしている。
------------------------------------------------------ */
const viewListeners = [];
function onViewChanged(fn) { viewListeners.push(fn); }
function notifyViewChanged() { for (const fn of viewListeners) fn(); }

/* ---------------- 画面切り替え ---------------- */
const SCREENS = ["home", "quiz", "result", "notes", "cards"];

function show(name) {
  for (const id of SCREENS) $("screen-" + id).hidden = (id !== name);
  notifyViewChanged();
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
