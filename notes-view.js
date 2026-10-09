/* =======================================================================
   暗記ノート画面
   -----------------------------------------------------------------------
   各試験の notes.js（addNotes で登録された Markdown）を解析して表示する。
   図解（addNoteFigures で登録した SVG）は、同じ見出しの節の直後に自動で差し込まれる。
   ======================================================================= */

/* ---------------- Markdown → HTML ---------------- */

function mdInline(text) {
  // コード部分をいったん退避してから装飾を処理する
  // （**`-P` と同じ** のように太字がコードをまたぐ場合に対応するため）
  const codes = [];
  // `` ` `` のように、バッククォート自体を書くための二重バッククォートにも対応する
  let s = esc(text).replace(/``\s?(.+?)\s?``|`([^`]+)`/g, (m, p2, p1) => {
    codes.push(p2 !== undefined ? p2 : p1);
    return "@@CODE" + (codes.length - 1) + "@@";
  });

  s = s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  s = markKeyPoints(s);

  // コードは、まるごと重要語なら印を付けて戻す
  return s.replace(/@@CODE([0-9]+)@@/g, (m, i) => {
    const body = codes[i];
    const kp = showKeyPoints && KEY_POINT_SET.has(body);
    return "<code" + (kp ? ' class="kp"' : "") + ">" + body + "</code>";
  });
}

// 重要語を拾うための正規表現（長い語から順に並べてある）
// バックスラッシュを直接書かずに組み立てる
function reEscape(str) {
  const bs = String.fromCharCode(92);
  let out = "";
  for (const ch of str) out += ("^$.*+?()[]{}|/".indexOf(ch) >= 0 ? bs + ch : ch);
  return out;
}
// 各試験の keypoints.js で登録された語を、長い語から順に照合する（短い語が長い語の一部を先に取らないように）
const KEY_POINT_SET = new Set(KEY_POINTS);
const KEY_POINT_RE = new RegExp("(" + [...KEY_POINT_SET].sort((a, b) => b.length - a.length).map(reEscape).join("|") + ")", "g");

// 重要語に印を付ける（タグの中身には触れない）
function markKeyPoints(html) {
  if (!showKeyPoints) return html;
  return html.split(/(<[^>]*>)/).map(part =>
    part.startsWith("<") ? part
      : part.replace(KEY_POINT_RE, m => '<mark class="kp">' + m + "</mark>")
  ).join("");
}

// 表の1行をセルに分ける（前後の | を落として分割する）
// 「\|」はセルの区切りではなく文字の | として扱う（|| や正規表現の | を表に書くため）
function mdCells(line) {
  const bs = String.fromCharCode(92);   // バックスラッシュ（直接書かない。reEscape と同じ理由）
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith(bs + "|")) s = s.slice(0, -1);

  const cells = [];
  let cur = "";
  for (let k = 0; k < s.length; k++) {
    if (s[k] === bs && s[k + 1] === "|") { cur += "|"; k++; }
    else if (s[k] === "|") { cells.push(cur.trim()); cur = ""; }
    else cur += s[k];
  }
  cells.push(cur.trim());
  return cells;
}

// 行の配列を HTML に変換する
function mdToHtml(lines) {
  let out = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // コードブロック
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out += "<pre><code>" + esc(buf.join("\n")) + "</code></pre>";
      continue;
    }

    // 表
    if (/^\|/.test(line) && /^\|[\s:\-|]+\|?\s*$/.test(lines[i + 1] || "")) {
      const head = mdCells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(mdCells(lines[i])); i++; }
      out += '<div class="tbl-wrap"><table><thead><tr>' +
        head.map(c => "<th>" + mdInline(c) + "</th>").join("") + "</tr></thead><tbody>" +
        rows.map(r => "<tr>" + r.map(c => "<td>" + mdInline(c) + "</td>").join("") + "</tr>").join("") +
        "</tbody></table></div>";
      continue;
    }

    // 見出し（h3以下）
    const h = line.match(/^(#{3,6})\s+(.+)$/);
    if (h) {
      const lv = h[1].length;
      out += "<h" + lv + ">" + mdInline(h[2]) + "</h" + lv + ">";
      i++;
      continue;
    }

    // 区切り線
    if (/^\s*---+\s*$/.test(line)) { out += "<hr>"; i++; continue; }

    // 引用
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      out += "<blockquote>" + mdToHtml(buf) + "</blockquote>";
      continue;
    }

    // 箇条書き（1段のネストまで）
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const tag = ordered ? "ol" : "ul";
      out += "<" + tag + ">";
      let open = false;
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
        const indent = lines[i].match(/^\s*/)[0].length;
        const text = lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, "");
        if (indent >= 2) {
          if (!open) { out += "<ul>"; open = true; }
          out += "<li>" + mdInline(text) + "</li>";
        } else {
          if (open) { out += "</ul>"; open = false; }
          out += "<li>" + mdInline(text) + "</li>";
        }
        i++;
      }
      if (open) out += "</ul>";
      out += "</" + tag + ">";
      continue;
    }

    // 空行
    if (!line.trim()) { i++; continue; }

    // 段落
    const buf = [];
    while (i < lines.length && lines[i].trim() &&
           !/^```/.test(lines[i]) && !/^\|/.test(lines[i]) &&
           !/^#{3,6}\s/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]) &&
           !/^\s*\d+\.\s+/.test(lines[i]) && !/^>\s?/.test(lines[i]) &&
           !/^\s*---+\s*$/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    if (buf.length) out += "<p>" + buf.map(mdInline).join("<br>") + "</p>";
  }

  return out;
}

/* ---------------- ノートの構造化 ---------------- */
// 見出しごとに { theme, themeTitle, title, lines } へ分割する
// intro は「主題」の付かない大見出し（冒頭・直前チェック）の主題として使う番号（exam.js の intro）
function parseNotes(md, intro) {
  const lines = md.split(/\r?\n/);
  const list = [];
  let theme = intro, themeTitle = "はじめに", cur = null, inFence = false;

  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;

    if (!inFence) {
      const h1 = line.match(/^#\s+(.+)$/);
      const h2 = line.match(/^##\s+(.+)$/);
      if (h1) {
        themeTitle = h1[1];
        const m = themeTitle.match(/主題\s*(\d+\.\d+)/);
        theme = m ? m[1] : intro;
        cur = null;
        continue;
      }
      if (h2) {
        cur = { theme, themeTitle, title: h2[1], lines: [] };
        list.push(cur);
        continue;
      }
    }

    if (!cur) { cur = { theme, themeTitle, title: themeTitle, lines: [] }; list.push(cur); }
    cur.lines.push(line);
  }
  // 見出しだけで中身のない節（大見出しの直後など）は除く
  return list.filter(s => s.lines.some(l => l.trim()));
}

// すべての試験のノートをまとめて持ち、画面には学習中の試験の分だけを出す
const NOTE_SECTIONS = NOTE_SOURCES.flatMap(src => parseNotes(src.md, examInfo(src.exam).intro));

// 学習中の試験の主題の並び（101 なら "00", "1.01", …）
function noteThemes() {
  return [...new Set(NOTE_SECTIONS.map(s => s.theme))].filter(inExam);
}
// 学習中の試験の節を、全体での番号（idx。要素の id に使う）と一緒に回す
function forExamSections(fn) {
  NOTE_SECTIONS.forEach((sec, idx) => { if (inExam(sec.theme)) fn(sec, idx); });
}

// 節のキー（"主題/見出し"）。問題データの sec と対応する
function noteKey(sec) { return sec.theme + "/" + sec.title; }

const NOTE_BY_KEY = new Map(NOTE_SECTIONS.map(s => [noteKey(s), s]));
function noteByKey(key) { return NOTE_BY_KEY.get(key) || null; }

let noteTheme = null;          // 絞り込み中の主題（null = すべて）
let noteStatusFilter = "";     // 状態での絞り込み（"" = すべて / learned / weak / unseen）
let showKeyPoints  = true;     // 重要語に印を付けるか
let onlyTopStars   = false;    // ★★★の節だけ表示するか
let notesBuilt = false;

function noteThemeLabel(t) {
  return isIntroTheme(t) ? "全体" : t;
}

/* ---------------- 覚えた／苦手 ----------------
   learned と noteWeak（core.js）に節キーで記録する。両方には付けない。 */

// 節の状態：覚えた / 苦手 / 未確認（どちらのチェックも付いていない）
function noteStatus(key) {
  if (learned[key]) return "learned";
  if (noteWeak[key]) return "weak";
  return "unseen";
}
const NOTE_STATUS_MARK  = { learned: "✓ ", weak: "△ ", unseen: "" };
const NOTE_STATUS_LABEL = { "": "すべて", learned: "覚えた", weak: "苦手", unseen: "未確認" };

// 覚えた（kind = "learned"）／苦手（"weak"）を付け外しする。片方を付けたらもう片方は外す
function setNoteMark(key, kind, on) {
  const [mine, other] = kind === "weak" ? [noteWeak, learned] : [learned, noteWeak];
  if (on) { mine[key] = true; delete other[key]; } else delete mine[key];
  save(WEAK_KEY, noteWeak);
  save(LEARNED_KEY, learned);
}

function noteStatusOk(key) {
  return !noteStatusFilter || noteStatus(key) === noteStatusFilter;
}

// 節の重要度（3=最重要 / 2=重要 / 1=補足）
function noteStars(key) { return NOTE_STARS[key] || 2; }
function noteStarsHtml(key) {
  const n = noteStars(key);
  return html`<span class="note-star star-${n}" title="重要度">${starMarks(n)}</span>`;
}

// 節の本文（図解があれば先頭に付ける）。ノート画面・復習おすすめ・ノートのパネルで共通
function noteBodyHtml(sec) {
  const fig = (NOTE_FIGURES[examOfTheme(sec.theme)] || {})[sec.title];
  return (fig ? html`<div class="note-fig">${raw(fig)}</div>` : "") + mdToHtml(sec.lines);
}

// 大見出し（# ）ごとのかたまり。{ head: 見出しの要素, arts: 節の要素の配列 }
// 冒頭と直前チェックは主題の番号が同じ（exam.js の intro）なので、番号ではなく見出しの並びで分ける
let noteBlocks = [];

function buildNotes() {
  const body = $("notesBody");
  body.innerHTML = "";
  noteBlocks = [];

  let lastBlock = null;
  forExamSections((sec, idx) => {
    const blockKey = sec.theme + "|" + sec.themeTitle;
    if (blockKey !== lastBlock) {
      const head = document.createElement("h2");
      head.className = "note-theme";
      head.textContent = sec.themeTitle;
      head.dataset.theme = sec.theme;
      body.appendChild(head);
      noteBlocks.push({ head, arts: [] });
      lastBlock = blockKey;
    }

    const key = noteKey(sec);
    const n = secQuestionIds(key).length;

    const art = document.createElement("article");
    art.className = "note-sec";
    art.id = "note-sec-" + idx;
    art.dataset.theme = sec.theme;
    art.dataset.title = sec.title;
    art.dataset.key = key;
    art.dataset.stars = noteStars(key);

    art.innerHTML = html`
      <div class="note-sec-head">
        <h3>${raw(noteStarsHtml(key))}${sec.title}</h3>
        <div class="note-sec-act">
          ${n > 0 && raw(html`<button class="btn btn-mini note-quiz" data-key="${key}">問題を解く（${n}問）</button>`)}
          <label class="learn-check"><input type="checkbox" class="learn-box" data-key="${key}"><span>覚えた</span></label>
          <label class="learn-check weak-check"><input type="checkbox" class="weak-box" data-key="${key}"><span>苦手</span></label>
        </div>
      </div>
      ${raw(noteBodyHtml(sec))}`;
    body.appendChild(art);
    noteBlocks[noteBlocks.length - 1].arts.push(art);
  });

  refreshLearnedUI();
  buildNoteToc();
  notesBuilt = true;
}

// 1つの節のチェックと色を、保存されている状態に合わせる
function paintNoteSec(el) {
  const st = noteStatus(el.dataset.key);
  el.querySelector(".learn-box").checked = st === "learned";
  el.querySelector(".weak-box").checked  = st === "weak";
  el.classList.toggle("is-learned", st === "learned");
  el.classList.toggle("is-weak", st === "weak");
}

// 「覚えた／苦手」の状態を画面に反映する（同期で取り込んだときにも呼ばれる）
function refreshLearnedUI() {
  document.querySelectorAll("#notesBody .note-sec").forEach(paintNoteSec);
  updateLearnProgress();
  buildNoteToc();
  if (notesBuilt) filterNotes();
}

function updateLearnProgress() {
  const el = $("learnProgress");
  if (!el) return;
  const n = { learned: 0, weak: 0, unseen: 0 };
  forExamSections(s => { n[noteStatus(noteKey(s))]++; });
  const total = n.learned + n.weak + n.unseen;
  const pctDone = total ? Math.round((n.learned / total) * 100) : 0;
  el.innerHTML = html`覚えた <b>${n.learned}</b> / ${total} 項目（${pctDone}%）` +
    html`<span class="learn-sub">苦手 <b class="n-weak">${n.weak}</b>・未確認 <b class="n-unseen">${n.unseen}</b></span>`;
}

// 絞り込みボタンの表示（件数つき）
function renderStatusFilter() {
  const n = { "": 0, learned: 0, weak: 0, unseen: 0 };
  forExamSections(s => {
    if (noteTheme && s.theme !== noteTheme) return;
    n[""]++;
    n[noteStatus(noteKey(s))]++;
  });
  document.querySelectorAll("#noteStatusFilter .chip").forEach(b => {
    const st = b.dataset.status;
    b.classList.toggle("is-on", st === noteStatusFilter);
    b.setAttribute("aria-pressed", st === noteStatusFilter);
    b.textContent = NOTE_STATUS_LABEL[st] + " " + n[st];
  });

  // 折りたたんだときの見出しに、いまの絞り込みを出す
  const on = [
    noteTheme && noteThemeLabel(noteTheme),
    noteStatusFilter && NOTE_STATUS_LABEL[noteStatusFilter],
    onlyTopStars && "★★★"
  ].filter(Boolean);
  $("noteFilterSum").textContent = on.length ? "：" + on.join("・") : "";
}

// ノートの節から、その範囲だけの問題を出題する（結果画面からその節へ戻れる）
function startSectionQuiz(key) {
  const ids = secQuestionIds(key);
  if (ids.length) beginSession(shuffle(ids), key);
}

// ノート画面を開いて、その節まで移る（ほかの画面から「ノートで開く」とき）
function showNoteSection(key) {
  showNotes();
  const el = document.querySelector('#notesBody .note-sec[data-key="' + CSS.escape(key) + '"]');
  if (!el) return;
  if (el.hidden) {             // 絞り込みや検索で隠れているときは、解除してから出す
    noteStatusFilter = "";
    onlyTopStars = false;
    $("optOnlyTopStars").checked = false;
    $("noteSearch").value = "";
    showNotes(null);
  }
  el.scrollIntoView({ block: "start" });
}

function buildNoteToc() {
  const box = $("noteTocList");
  box.innerHTML = "";
  let lastTheme = null;
  forExamSections((sec, idx) => {
    if (noteTheme && sec.theme !== noteTheme) return;
    const key = noteKey(sec);
    if (!noteStatusOk(key)) return;
    if (onlyTopStars && noteStars(key) !== 3) return;
    if (sec.theme !== lastTheme) {
      const h = document.createElement("div");
      h.className = "toc-theme";
      h.textContent = sec.themeTitle;
      box.appendChild(h);
      lastTheme = sec.theme;
    }
    const a = document.createElement("button");
    const st = noteStatus(key);
    a.className = "toc-link is-" + st;
    a.innerHTML = NOTE_STATUS_MARK[st] + noteStarsHtml(key) + esc(sec.title);
    a.addEventListener("click", () => jumpFromToc(idx));
    box.appendChild(a);
  });
}

// 目次から節へ移る
function jumpFromToc(idx) {
  const side = notesSideMode();
  if (!side) $("noteToc").open = false;   // サイドバーでは開いたままにする
  const el = $("note-sec-" + idx);
  if (!el) return;
  // 目次を閉じた後の見出しの高さで位置を決める（scroll-margin は閉じる前の高さのままのことがある）
  const cover = document.querySelector(".topbar").offsetHeight +
                (side ? 4 : document.querySelector("#screen-notes .notes-head").offsetHeight);
  const y = el.getBoundingClientRect().top + window.scrollY - cover - 8;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function filterNotes() {
  const q = $("noteSearch").value.trim().toLowerCase();
  let hit = 0;

  document.querySelectorAll("#notesBody .note-sec").forEach(el => {
    const themeOk = !noteTheme || el.dataset.theme === noteTheme;
    const textOk = !q || el.textContent.toLowerCase().includes(q);
    const learnOk = noteStatusOk(el.dataset.key);
    const starOk  = !onlyTopStars || el.dataset.stars === "3";
    const show = themeOk && textOk && learnOk && starOk;
    el.hidden = !show;
    if (show) hit++;
  });

  // 大見出しは、その下に表示中の節があるときだけ出す
  for (const b of noteBlocks) b.head.hidden = !b.arts.some(el => !el.hidden);

  $("noteEmpty").hidden = hit > 0;
  renderStatusFilter();
  layoutNotes();           // 表示する節が変わると高さも変わるので、2列の割り振りをやり直す
}

/* ---------------- 広い画面での並べ方 ----------------
   本文が十分に広いときは、大見出しごとに節を2列に詰める。
   各節を「いま短い方の列」へ順に入れるので、上から読む順番は保たれ、列の下に大きな空きもできない */
const NOTE_TWO_COL_MIN = 1100;   // 本文がこの幅（px）以上なら2列（1列が 540px 程度あればコードや表がほぼ収まる）
let noteLayoutWidth = 0;
let noteSideMode = null;
let noteCompact = null;

// 検索・目次がサイドバーに移っているか（style.css の @container で切り替わる）
function notesSideMode() {
  return getComputedStyle($("screen-notes")).display === "grid";
}

function layoutNotes() {
  const body = $("notesBody");
  if (!notesBuilt || !body.clientWidth) return;       // 画面が隠れている間は測れない
  noteLayoutWidth = body.clientWidth;

  // サイドバーに移ったときは目次を開き、上に戻ったときは閉じる（本文を隠さないように）
  const side = notesSideMode();
  if (side !== noteSideMode) { $("noteToc").open = side; noteSideMode = side; }

  const two = body.clientWidth >= NOTE_TWO_COL_MIN;

  // 絞り込み欄を折りたたむか：スマホと、サイドバーなしで2列にする幅（上の見出しを低くして本文を広く見せる）
  const compact = !side && (window.innerWidth <= 560 || two);
  $("screen-notes").classList.toggle("is-compact", compact);
  if (compact !== noteCompact) { $("noteFilter").open = !compact; noteCompact = compact; }
  const old = [...body.querySelectorAll(".note-group")];

  for (const block of noteBlocks) {
    body.appendChild(block.head);
    const arts = block.arts;

    if (!two) { arts.forEach(a => body.appendChild(a)); continue; }

    // いったん列の幅に入れて、高さと「列に収まるか」を測る
    const probe = noteGroup();
    body.appendChild(probe.group);
    arts.forEach(a => probe.cols[0].appendChild(a));
    const info = new Map(arts.map(a => [a, { h: a.hidden ? 0 : a.offsetHeight, full: !a.hidden && noteNeedsFullWidth(a) }]));

    // 列に収まらない節は全幅で置き、その前後のふつうの節を2列のかたまりにまとめる
    let run = [];
    const flush = () => {
      const shown = run.filter(a => !a.hidden).length;
      if (shown <= 1) run.forEach(a => body.appendChild(a));   // 1節だけなら、片方の列が空くので全幅にする
      else body.appendChild(noteTwoCols(run, info));
      run = [];
    };
    for (const a of arts) {
      if (info.get(a).full) { flush(); body.appendChild(a); }
      else run.push(a);
    }
    flush();
    probe.group.remove();
  }
  old.forEach(g => g.remove());
}

// 半分の幅だと読みにくい節か（列の幅に入れた状態で測る）
//   ・図の文字が小さくなりすぎる ・列の多い表が詰まる ・表やコードが横にはみ出す
function noteNeedsFullWidth(art) {
  const fig = art.querySelector(".fig");
  if (fig && fig.getBoundingClientRect().width < 540) return true;          // 図は 640 幅で描いてあり、これ未満だと文字が 11px を切る
  const narrow = art.clientWidth < 600;
  if (narrow && [...art.querySelectorAll("table")].some(t => t.rows[0] && t.rows[0].cells.length >= 4)) return true;
  return [...art.querySelectorAll(".tbl-wrap, pre")].some(el => el.scrollWidth > el.clientWidth + 1);
}

function noteGroup() {
  const group = document.createElement("div");
  group.className = "note-group";
  const cols = [document.createElement("div"), document.createElement("div")];
  cols.forEach(c => { c.className = "note-col"; group.appendChild(c); });
  return { group, cols };
}

// 節を「いま短い方の列」へ順に入れて、2列のかたまりを作る
function noteTwoCols(arts, info) {
  const { group, cols } = noteGroup();
  const sum = [0, 0];
  for (const a of arts) {
    const c = sum[0] <= sum[1] ? 0 : 1;
    cols[c].appendChild(a);
    sum[c] += info.get(a).h;
  }
  return group;
}

if (window.ResizeObserver) {
  // 幅が変わったとき（ウィンドウの大きさ・コマンド表の開閉・画面の切り替え）に並べ直す
  new ResizeObserver(() => {
    const w = $("notesBody").clientWidth;
    if (w && w !== noteLayoutWidth) layoutNotes();
  }).observe($("notesBody"));

  // 見出しの高さを CSS に渡す（ほかの画面から節へ飛んだとき、節の頭が見出しに隠れないように）
  new ResizeObserver(([e]) => {
    if (e.contentRect.height) {
      document.documentElement.style.setProperty("--notes-head-h", Math.ceil(e.target.getBoundingClientRect().height) + "px");
    }
  }).observe(document.querySelector("#screen-notes .notes-head"));
}

function renderNoteThemes() {
  const box = $("noteThemes");
  box.innerHTML = "";

  const mk = (label, value) => {
    const b = document.createElement("button");
    b.className = "chip" + (noteTheme === value ? " is-on" : "");
    b.textContent = label;
    b.addEventListener("click", () => {
      noteTheme = (noteTheme === value) ? null : value;
      renderNoteThemes();
      buildNoteToc();
      filterNotes();
      window.scrollTo(0, 0);
    });
    box.appendChild(b);
  };
  mk("すべて", null);
  noteThemes().forEach(t => mk(noteThemeLabel(t), t));
}

function showNotes(theme) {
  if (!notesBuilt) buildNotes();
  if (theme !== undefined) noteTheme = theme;
  renderNoteThemes();
  buildNoteToc();
  filterNotes();
  show("notes");
  layoutNotes();           // 隠れている間は測れないので、表示してから並べる
}

// 試験を切り替えたときに、ノートを学習中の試験の分で作り直す
function resetNotesForExam() {
  notesBuilt = false;
  noteTheme = null;
  noteStatusFilter = "";
  $("noteSearch").value = "";
  $("notesBody").innerHTML = "";
  renderNoteJump();
}

// ホーム画面に主題ごとの入口を並べる
function renderNoteJump() {
  const box = $("noteJump");
  if (!box) return;
  box.innerHTML = "";

  const mk = (label, value) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = label;
    b.addEventListener("click", () => showNotes(value));
    box.appendChild(b);
  };
  mk("ノートを開く", null);
  noteThemes().forEach(t => {
    if (isIntroTheme(t)) return;
    const sec = NOTE_SECTIONS.find(s => s.theme === t);
    const name = sec.themeTitle.replace(/^主題\s*\d+\.\d+\s*/, "");
    mk(t + " " + name.slice(0, 14), t);
  });
}

$("btnNotesTop").addEventListener("click", () => showNotes());
$("btnNotesHome").addEventListener("click", () => renderHome());
$("noteSearch").addEventListener("input", filterNotes);
$("noteStatusFilter").addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  // 選択中のボタンをもう一度押したら「すべて」に戻す
  noteStatusFilter = (noteStatusFilter === b.dataset.status) ? "" : b.dataset.status;
  buildNoteToc();
  filterNotes();
  window.scrollTo(0, 0);
});
$("optOnlyTopStars").addEventListener("change", (e) => {
  onlyTopStars = e.target.checked;
  buildNoteToc();
  filterNotes();
});
$("optShowKeyPoints").addEventListener("change", (e) => {
  showKeyPoints = e.target.checked;
  notesBuilt = false;          // 本文を作り直して印を付け直す
  buildNotes();
  filterNotes();
});
renderNoteJump();

/* ノート本文のチェックボックスと出題ボタン（委譲で一度だけ登録する） */
$("notesBody").addEventListener("change", (e) => {
  const box = e.target.closest(".learn-box, .weak-box");
  if (!box) return;
  setNoteMark(box.dataset.key, box.classList.contains("weak-box") ? "weak" : "learned", box.checked);
  paintNoteSec(box.closest(".note-sec"));
  updateLearnProgress();
  buildNoteToc();          // 目次の印も更新する
  renderStatusFilter();    // 絞り込み中でも節はすぐには隠さない（押し間違えを直せるように）
});
$("notesBody").addEventListener("click", (e) => {
  const btn = e.target.closest(".note-quiz");
  if (!btn) return;
  startSectionQuiz(btn.dataset.key);
});
