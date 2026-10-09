/* =======================================================================
   進捗の同期・バックアップ（書き出し／読み込み・GitHub Gist 自動同期）
   ======================================================================= */

const SYNC_APP = "linuc101";

// 保存済みセッションの健全性チェック（壊れていたら null を返す。exam を省くと学習中の試験）
function normalizeSession(s, exam) {
  if (!s || !Array.isArray(s.order) || !s.order.length) return null;
  if (s.order.some(id => !QMAP.has(id))) return null;          // 削除された問題を含む
  exam = exam || currentExam();
  if (s.order.some(id => examOfTheme(QMAP.get(id).cat) !== exam)) return null;   // 別の試験の問題を含む
  const n = s.order.length;
  const fix = (arr) => (Array.isArray(arr) && arr.length === n) ? arr : new Array(n).fill(null);
  s.results = fix(s.results);
  s.picked  = fix(s.picked);
  s.flags   = fix(s.flags);
  s.perms   = fix(s.perms);       // 旧セッションは null → 元の順で表示される
  if (typeof s.idx !== "number" || s.idx < 0 || s.idx >= n) s.idx = 0;
  return s;
}

// 保存済みの出題設定を、いまのカテゴリ・項目に合わせて整える（起動時と取り込み時）
function normalizeConfig(c) {
  c.cats = (c.cats || []).filter(id => CATEGORIES[id]);
  // 試験ごとに、1つも選ばれていなければ全部を選ぶ（カテゴリや試験が増えたときに追随）
  for (const e of Object.values(EXAMS)) {
    if (!c.cats.some(id => e.cats.includes(id))) c.cats.push(...e.cats.filter(id => CATEGORIES[id]));
  }
  if (c.keepHelp === undefined) c.keepHelp = true;        // 旧設定の互換
  return c;
}

// 古い版のデータのセッション（session ＝ 101、session102 ＝ 102）を、試験ID → セッションの形にする
function legacySessions(data) {
  const s = {};
  if ("session" in data) s["101"] = data.session;
  if ("session102" in data) s["102"] = data.session102;
  return s;
}

// 試験ごとの進行中のセッション（学習中の試験はメモリ上のもの、ほかは保存領域から）
function sessionOf(exam) {
  return exam === currentExam() ? session : load(sessionKey(exam), null);
}

// 現在の状態を1つのオブジェクトにまとめる
function buildPayload() {
  let answered = 0;
  for (const id of Object.keys(stats)) answered += statTries(id);
  return {
    app: SYNC_APP,
    ver: 1,
    savedAt: new Date(lastChangeAt || Date.now()).toISOString(),
    answered: answered,
    questions: QUESTIONS.length,
    sessions: Object.fromEntries(EXAM_ORDER.map(id => [id, sessionOf(id)])),   // 試験ID → 進行中のセッション
    session: sessionOf(EXAM_ORDER[0]),   // 試験を分ける前の版でも読めるよう、最初の試験（101）の分はここにも入れる
    stats: stats,
    config: config,
    learned: learned,
    weak: noteWeak,
    cards: cardsLearned
  };
}

function encodeSync(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = "";
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin);
}

function decodeSync(code) {
  const bin = atob(code.replace(/\s+/g, ""));
  const bytes = Uint8Array.from(bin, ch => ch.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function syncMessage(text, cls) {
  const box = $("syncMsg");
  box.hidden = false;
  box.textContent = text;
  box.className = "sync-msg" + (cls ? " " + cls : "");
}


function exportFile() {
  const payload = buildPayload();
  const blob = new Blob([JSON.stringify(payload, null, 1)], { type: "application/json" });
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const name = "linuc101-progress-" +
    d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes()) + ".json";

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);

  syncMessage(name + " を書き出しました。累計 " + payload.answered +
    " 問の解答記録が入っています。iCloud Drive などに保存して、もう一方の端末で読み込んでください。", "ok");
}

// 読み込んだデータを適用する（silent = 確認ダイアログなし。自動同期で使う）
function applyPayload(data, silent) {
  if (!data || data.app !== SYNC_APP) {
    if (!silent) syncMessage("このアプリの進捗データではないようです。書き出したファイル（linuc101-progress-*.json）か同期コードを指定してください。", "ng");
    return false;
  }

  if (!silent) {
    const mine = buildPayload();
    let msg = "読み込むデータ：" + fmtDate(data.savedAt) + " 時点／累計 " + (data.answered || 0) + " 問\n" +
              "この端末の記録：" + fmtDate(mine.savedAt) + " 時点／累計 " + mine.answered + " 問\n\n" +
              "この端末の進捗を、読み込むデータで置き換えます。よろしいですか？";
    if (mine.answered > (data.answered || 0)) {
      msg = "⚠ 読み込むデータの方が解答数が少ないようです。\n\n" + msg;
    }
    if (!confirm(msg)) { syncMessage("読み込みを取りやめました。", ""); return false; }
  }

  // 取り込んだ内容をそのまま送り返さないよう、書き込み中は同期予約を止める
  syncMuted = true;

  stats = (data.stats && typeof data.stats === "object") ? data.stats : {};
  save(STATS_KEY, stats);

  learned = (data.learned && typeof data.learned === "object") ? data.learned : {};
  save(LEARNED_KEY, learned);

  // 苦手チェックを持たない古いデータからは、この端末の苦手を消さない
  if (data.weak && typeof data.weak === "object") {
    noteWeak = data.weak;
    save(WEAK_KEY, noteWeak);
  }

  cardsLearned = (data.cards && typeof data.cards === "object") ? data.cards : {};
  save(CARDS_KEY, cardsLearned);

  // 進行中のセッションは試験ごとに。データに無い試験（古い版のデータなど）は、この端末の分を残す
  for (const [exam, raw] of Object.entries(data.sessions || legacySessions(data))) {
    if (!EXAMS[exam]) continue;
    const s = normalizeSession(raw, exam);
    if (s) save(sessionKey(exam), s);
    else remove(sessionKey(exam));
  }
  session = normalizeSession(load(sessionKey(), null));

  if (data.config && typeof data.config === "object") {
    config = normalizeConfig(data.config);
    save(CONFIG_KEY, config);
  }

  // 変更時刻は取り込んだデータのものに合わせる（同期の新旧判定のため）
  lastChangeAt = new Date(data.savedAt).getTime() || Date.now();
  try { localStorage.setItem(STAMP_KEY, JSON.stringify(lastChangeAt)); } catch (e) { /* noop */ }
  syncMuted = false;

  applyConfigToForm();
  refreshLearnedUI();
  refreshCardsUI();
  if (examId) renderHome();
  else showExamSelect();          // 試験を選ぶ前に取り込んだときは、選択画面のまま進み具合だけ更新
  if (!silent) {
    syncMessage("読み込みました（" + fmtDate(data.savedAt) + " 時点、累計 " +
      (data.answered || 0) + " 問）。" + (session ? "中断していたセッションも復元しました。" : ""), "ok");
  }
  return true;
}

// 設定を画面の入力欄へ反映する
function applyConfigToForm() {
  buildCatList();
  selectChip("countChips", "count", config.count);
  selectChip("orderChips", "order", config.order);
  selectChip("impChips",   "imp",   config.imp || 0);
  $("optWeak").checked = !!config.weak;
  $("optShuffle").checked = config.shuffle !== false;
  $("optKeepHelp").checked = config.keepHelp !== false;
}

$("btnExportFile").addEventListener("click", exportFile);

$("btnImportFile").addEventListener("click", () => $("importFile").click());
$("importFile").addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try { applyPayload(JSON.parse(reader.result)); }
    catch (err) { syncMessage("ファイルを読み取れませんでした（" + err.message + "）。", "ng"); }
  };
  reader.onerror = () => syncMessage("ファイルの読み込みに失敗しました。", "ng");
  reader.readAsText(file);
  e.target.value = "";      // 同じファイルを続けて選べるようにする
});

$("btnCopyCode").addEventListener("click", async () => {
  const payload = buildPayload();
  const code = encodeSync(payload);
  $("syncBox").hidden = false;
  $("syncBox").value = code;
  $("syncBoxRow").hidden = true;
  try {
    await navigator.clipboard.writeText(code);
    syncMessage("同期コードをコピーしました（累計 " + payload.answered +
      " 問）。もう一方の端末で「同期コードから読み込む」に貼り付けてください。", "ok");
  } catch (e) {
    $("syncBox").select();
    syncMessage("自動コピーできませんでした。下の枠の文字列を全選択してコピーしてください。", "");
  }
});

$("btnPasteCode").addEventListener("click", () => {
  $("syncBox").hidden = false;
  $("syncBox").value = "";
  $("syncBox").placeholder = "ここに同期コードを貼り付けてください";
  $("syncBoxRow").hidden = false;
  $("syncMsg").hidden = true;
  $("syncBox").focus();
});

$("btnApplyCode").addEventListener("click", () => {
  const code = $("syncBox").value.trim();
  if (!code) { syncMessage("同期コードが空です。", "ng"); return; }
  try {
    if (applyPayload(decodeSync(code))) {
      $("syncBox").hidden = true;
      $("syncBoxRow").hidden = true;
    }
  } catch (err) {
    syncMessage("同期コードを読み取れませんでした。途中で切れていないか確認してください。", "ng");
  }
});

$("btnCancelCode").addEventListener("click", () => {
  $("syncBox").hidden = true;
  $("syncBoxRow").hidden = true;
});

/* ==================================================================
   自動同期（GitHub Gist）
   -----------------------------------------------------------------
   非公開Gistに進捗JSONを1ファイル置き、
     ・起動時／再表示時に取り込み（相手が新しければ）
     ・解答するたびに保存（3秒まとめて送信）
   を行う。トークンはこの端末の localStorage にのみ保存する。
================================================================== */
const GIST_FILE = "linuc101-progress.json";
const GIST_API  = "https://api.github.com";
let gistTimer = null;
let gistBusy  = false;

function gistConnected() { return !!(gist.token && gist.id); }

function gistState(text, cls) {
  const el = $("gistStatus");
  if (!el) return;
  if (!gistConnected()) {
    el.textContent = text || "未接続";
    el.className = "sync-status" + (cls ? " " + cls : "");
    return;
  }
  const last = gist.lastSyncAt
    ? "（最終同期 " + fmtDate(new Date(gist.lastSyncAt).toISOString()) + "）" : "";
  el.textContent = text ? text : "接続済み " + last;
  el.className = "sync-status " + (cls || "on");
}

function renderGistUI() {
  $("gistSetup").hidden = gistConnected();
  $("gistConnected").hidden = !gistConnected();
  $("optGistAuto").checked = gist.auto !== false;
  gistState();
}

function gistHeaders() {
  return {
    "Authorization": "Bearer " + gist.token,
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json"
  };
}

// Gist に置く中身（進捗を1ファイルにしたもの。省略するといまの進捗）
function gistFiles(payload) {
  return { [GIST_FILE]: { content: JSON.stringify(payload || buildPayload()) } };
}

async function gistApi(path, options) {
  const opt = Object.assign({}, options);
  opt.headers = Object.assign(gistHeaders(), options && options.headers);

  const res = await fetch(GIST_API + path, opt);
  if (!res.ok) {
    if (res.status === 401) throw new Error("トークンが無効です");
    if (res.status === 403) throw new Error("権限が足りません（gist 権限を付けてください）");
    if (res.status === 404) throw new Error("保存先が見つかりません");
    throw new Error("GitHub エラー " + res.status);
  }
  return res.json();
}

function scheduleGistPush() {
  if (!gistConnected() || gist.auto === false) return;
  clearTimeout(gistTimer);
  gistTimer = setTimeout(() => { gistPush(); }, 3000);
}

async function gistPush(manual) {
  if (!gistConnected() || gistBusy) return false;
  clearTimeout(gistTimer);
  gistBusy = true;
  gistState("保存中…", "busy");
  try {
    const payload = buildPayload();
    await gistApi("/gists/" + gist.id, { method: "PATCH", body: JSON.stringify({ files: gistFiles(payload) }) });
    gist.lastSyncAt = Date.now();
    save(GIST_KEY, gist);
    gistState();
    if (manual) syncMessage("GitHubに保存しました（累計 " + payload.answered + " 問）。", "ok");
    return true;
  } catch (e) {
    gistState("保存できませんでした：" + e.message, "err");
    if (manual) syncMessage("保存に失敗しました：" + e.message, "ng");
    else toast("GitHubへの保存に失敗しました：" + e.message + "　次に接続できたときに保存されます", "ng", 8000);
    return false;
  } finally {
    gistBusy = false;
  }
}

// 相手が新しければ取り込み、こちらが新しければ送る
async function gistSync(manual) {
  if (!gistConnected() || gistBusy) return;
  gistBusy = true;
  gistState("同期中…", "busy");
  try {
    const data = await gistApi("/gists/" + gist.id);
    const file = data.files && data.files[GIST_FILE];
    const payload = file && file.content ? JSON.parse(file.content) : null;
    const remoteAt = payload ? (new Date(payload.savedAt).getTime() || 0) : 0;

    gist.lastSyncAt = Date.now();
    save(GIST_KEY, gist);

    if (remoteAt > lastChangeAt + 1000) {
      applyPayload(payload, true);
      gistState();
      syncMessage("別の端末の進捗を取り込みました（" + fmtDate(payload.savedAt) +
        " 時点、累計 " + (payload.answered || 0) + " 問）。", "ok");
    } else if (lastChangeAt > remoteAt + 1000 || !payload) {
      gistBusy = false;
      const ok = await gistPush(manual);
      if (ok && manual) syncMessage("この端末の進捗をGitHubに保存しました。", "ok");
      return;
    } else {
      gistState();
      if (manual) syncMessage("すでに最新です。", "ok");
    }
  } catch (e) {
    gistState("同期できませんでした：" + e.message, "err");
    if (manual) syncMessage("同期に失敗しました：" + e.message, "ng");
    else toast("GitHubとの同期に失敗しました：" + e.message + "　この端末の進捗はそのまま残っています", "ng", 8000);
  } finally {
    gistBusy = false;
  }
}

async function gistConnect() {
  const token = $("gistToken").value.trim();
  if (!token) { syncMessage("アクセストークンを貼り付けてください。", "ng"); return; }

  gist.token = token;
  gist.id = "";
  gistState("接続中…", "busy");
  try {
    // 同じトークンで作成済みのGistがあれば、それを使う（2台目はこれで自動的に繋がる）
    const list = await gistApi("/gists?per_page=100");
    const found = Array.isArray(list) ? list.find(g => g.files && g.files[GIST_FILE]) : null;

    // 保存先を決めて接続済みにする（トークンの入力欄は空にする）
    const connectTo = (id, syncedNow) => {
      gist.id = id;
      gist.auto = true;
      if (syncedNow) gist.lastSyncAt = Date.now();
      save(GIST_KEY, gist);
      renderGistUI();
      $("gistToken").value = "";
    };

    if (found) {
      connectTo(found.id, false);
      await gistSync(true);
    } else {
      const created = await gistApi("/gists", {
        method: "POST",
        body: JSON.stringify({
          description: "Linuc 101 問題演習の進捗（自動同期用）",
          public: false,
          files: gistFiles()
        })
      });
      connectTo(created.id, true);
      syncMessage("自動同期を開始しました。もう一方の端末でも同じトークンを入れると、この保存先に自動でつながります。", "ok");
    }
  } catch (e) {
    gist.token = "";
    gist.id = "";
    save(GIST_KEY, gist);
    renderGistUI();
    gistState("接続できませんでした：" + e.message, "err");
    syncMessage("接続に失敗しました：" + e.message, "ng");
  }
}

$("btnGistConnect").addEventListener("click", gistConnect);
$("btnGistSyncNow").addEventListener("click", () => gistSync(true));
$("optGistAuto").addEventListener("change", (e) => {
  gist.auto = e.target.checked;
  save(GIST_KEY, gist);
  gistState();
});
$("btnGistDisconnect").addEventListener("click", () => {
  if (!confirm("この端末の自動同期を解除します。GitHub上の保存データは残ります。よろしいですか？")) return;
  clearTimeout(gistTimer);
  gist = { token: "", id: "", auto: true, lastSyncAt: 0 };
  save(GIST_KEY, gist);
  renderGistUI();
  syncMessage("自動同期を解除しました。", "");
});

// アプリに戻ってきたときに取り込み直す（もう一方の端末で進めた分を反映）
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") gistSync();
});

// 画面を閉じる直前に、送信待ちがあれば送り切る
window.addEventListener("pagehide", () => {
  if (!gistConnected() || gist.auto === false || !gistTimer) return;
  clearTimeout(gistTimer);
  try {
    fetch(GIST_API + "/gists/" + gist.id, {
      method: "PATCH",
      keepalive: true,
      headers: gistHeaders(),
      body: JSON.stringify({ files: gistFiles() })
    });
  } catch (e) { /* 失敗しても次回起動時に同期される */ }
});

// 進捗が保存されたら自動同期を予約する（core.js の save から呼ばれる）
onProgressSaved = scheduleGistPush;
