/* =======================================================================
   コマンドオプション早見表（右側ヘルプパネル）
   ======================================================================= */

let helpGroup = null;                 // 絞り込み中のグループ（null = すべて）
let helpOpenSet = new Set();          // 展開中のコマンド名
let relatedCmds = [];                 // 現在の問題に関係するコマンド
let relatedCollapsed = new Set();     // 関連コマンドのうち手動で閉じたもの


// コマンド名からキーワードを抽出（問題文との突き合わせに使う）
const HELP_TOKENS = COMMAND_HELP.map(c => {
  const stop = new Set(["debian", "rpm系", "gpt", "and", "for"]);
  const set = new Set();
  (c.name.match(/[A-Za-z][A-Za-z0-9_.+-]*/g) || []).forEach(t => {
    t = t.toLowerCase();
    if (t.length >= 2 && !stop.has(t)) set.add(t);
  });
  return { cmd: c, tokens: [...set], keys: c.keys || [] };
});

function openHelp(open) {
  document.body.classList.toggle("help-open", open);
  save(HELP_OPEN_KEY, open);
  // 解答前にコマンド表を開いたら「参照した」として記録する
  if (open && !$("screen-quiz").hidden && !answered) helpUsed = true;
  updateQuizHelpUI();
  if (open) setTimeout(() => $("helpSearch").focus(), 220);
}

function highlight(text, q) {
  const safe = esc(text);
  if (!q) return safe;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(escaped, "gi"), m => "<mark>" + m + "</mark>");
}

function renderHelpGroups() {
  const box = $("helpGroups");
  box.innerHTML = "";
  const mk = (label, value) => {
    const b = document.createElement("button");
    b.className = "hgroup" + (helpGroup === value ? " is-on" : "");
    b.textContent = label;
    b.addEventListener("click", () => {
      helpGroup = (helpGroup === value) ? null : value;
      renderHelpGroups();
      renderHelpBody();
    });
    box.appendChild(b);
  };
  mk("すべて", null);
  HELP_GROUPS.forEach(g => mk(g, g));
}

// コマンド1件分のカードを作る
function makeCmdCard(cmd, rows, q, isRelated) {
  const expanded = q ? true
    : (isRelated ? !relatedCollapsed.has(cmd.name) : helpOpenSet.has(cmd.name));

  const card = document.createElement("div");
  card.className = "hcmd" + (isRelated ? " is-related" : "");
  card.dataset.name = cmd.name;

  const head = document.createElement("button");
  head.className = "hcmd-head";
  head.innerHTML =
    '<span class="hcmd-name">' + highlight(cmd.name, q) + "</span>" +
    '<span class="hcmd-desc">' + highlight(cmd.desc, q) + "</span>" +
    '<span class="hcmd-arrow">' + (expanded ? "▲" : "▼") + "</span>";
  head.addEventListener("click", () => {
    const set = isRelated ? relatedCollapsed : helpOpenSet;
    // 関連コマンドは既定で開いているので、集合は「閉じたもの」を表す
    if (set.has(cmd.name)) set.delete(cmd.name);
    else set.add(cmd.name);
    $("helpSearch").value = "";
    renderHelpBody();
    const el = $("helpBody").querySelector('[data-name="' + CSS.escape(cmd.name) + '"]');
    if (el) el.scrollIntoView({ block: "nearest" });
  });
  card.appendChild(head);

  if (expanded) {
    const inner = document.createElement("div");
    inner.className = "hcmd-body";
    let html = cmd.ex ? '<div class="hcmd-ex">' + highlight(cmd.ex, q) + "</div>" : "";
    for (const r of rows) {
      html +=
        '<div class="hrow">' +
          '<span class="hopt">'  + highlight(r.opt,  q) + "</span>" +
          '<span class="hmemo">' + highlight(r.memo, q) + "</span>" +
          '<span class="hrole">' + highlight(r.role, q) + "</span>" +
        "</div>";
    }
    inner.innerHTML = html;
    card.appendChild(inner);
  }
  return card;
}

function renderHelpBody() {
  const q = $("helpSearch").value.trim().toLowerCase();
  const body = $("helpBody");
  body.innerHTML = "";

  // 検索中・グループ絞り込み中は通常の一覧のみを表示する
  const related = (q || helpGroup) ? [] : relatedCmds;
  let hit = 0;

  const section = (text, cls) => {
    const el = document.createElement("div");
    el.className = "help-section" + (cls ? " " + cls : "");
    el.textContent = text;
    body.appendChild(el);
  };

  // 出題中は、その問題に関係するコマンドを先頭に開いた状態で並べる
  if (related.length) {
    section("この問題に関係するコマンド", "is-related");
    for (const cmd of related) {
      body.appendChild(makeCmdCard(cmd, cmd.rows, "", true));
      hit++;
    }
    section("そのほかのコマンド");
  }

  for (const cmd of COMMAND_HELP) {
    if (related.includes(cmd)) continue;
    if (helpGroup && cmd.group !== helpGroup) continue;

    const nameHit = !q || (cmd.name + " " + cmd.desc).toLowerCase().includes(q);
    const rows = q && !nameHit
      ? cmd.rows.filter(r => (r.opt + " " + r.memo + " " + r.role).toLowerCase().includes(q))
      : cmd.rows;
    if (!rows.length) continue;

    body.appendChild(makeCmdCard(cmd, rows, q, false));
    hit++;
  }

  if (!hit) {
    body.innerHTML = '<div class="help-empty">該当するコマンドが見つかりませんでした。</div>';
  }
}

// 問題文・選択肢・解説に登場するコマンドを拾う（問題文に出るものほど上位）
function findRelatedCommands(q) {
  const choices = q.choices.map(c => c.toLowerCase());
  const zones = [
    { text: q.q.toLowerCase(), w: 10 },
    { text: choices.join(" \n "), w: 3 },
    // 解説の（覚え方）は英単語が多く誤検出のもとになるので除いて突き合わせる
    { text: q.exp.replace(/（[^）]*）/g, " ").toLowerCase(), w: 1 }
  ];

  const scored = [];
  for (const { cmd, tokens, keys } of HELP_TOKENS) {
    let score = 0;
    // 日本語キーワードは単純な部分一致で見る
    for (const k of keys) {
      for (const z of zones) if (z.text.includes(k.toLowerCase())) score += z.w;
    }
    for (const t of tokens) {
      const escaped = t.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
      // file.txt や data.tar.gz のような文字列に反応しないよう、前後にピリオドを許さない
      const re = new RegExp("(^|[^a-z0-9_.-])" + escaped + "([^a-z0-9_.-]|$)");
      for (const z of zones) if (re.test(z.text)) score += z.w;
      // 選択肢がそのコマンドで始まる場合は「問われているコマンド」とみなす
      if (choices.some(c => c === t || c.startsWith(t + " "))) score += 4;
    }
    if (score > 0) scored.push({ cmd, score });
  }
  scored.sort((a, b) => b.score - a.score);   // 同点は COMMAND_HELP の並び順
  return scored.slice(0, 6).map(s => s.cmd);
}

// 現在の問題に合わせてコマンド表の内容を差し替える（q が null なら解除）
function setRelatedCommands(q) {
  relatedCmds = q ? findRelatedCommands(q) : [];
  relatedCollapsed = new Set();
  renderHelpBody();
  $("helpBody").scrollTop = 0;
}

$("helpTab").addEventListener("click", () => openHelp(true));
$("btnHelpQuiz").addEventListener("click", () => openHelp(!document.body.classList.contains("help-open")));
$("optKeepHelp").addEventListener("change", (e) => {
  config.keepHelp = e.target.checked;
  save(CONFIG_KEY, config);
});
$("btnHelpTop").addEventListener("click", () => openHelp(!document.body.classList.contains("help-open")));
$("btnHelpClose").addEventListener("click", () => openHelp(false));
$("helpBackdrop").addEventListener("click", () => openHelp(false));
$("helpSearch").addEventListener("input", renderHelpBody);

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.key === "Escape" && document.body.classList.contains("help-open")) {
    openHelp(false);
    return;
  }
  if (isTyping(e.target)) return;
  if (e.key === "h" || e.key === "H" || e.key === "?" || e.key === "/") {
    e.preventDefault();
    openHelp(!document.body.classList.contains("help-open"));
  }
});

