/* =======================================================================
   用語集（解説中の単語をクリックしたときに出る説明）
   -----------------------------------------------------------------------
   ここに書いた語を最優先で使い、足りない分は
   単語帳（CARDS）とコマンド表（COMMAND_HELP）から自動で補う。
   ======================================================================= */

const GLOSSARY = [

  /* ---- 全般 ---- */
  { key: "カーネル", def: "OSの中心となる部分。ハードウェアとアプリケーションの仲立ちをする。ユーザーが直接操作することはできない" },
  { key: "シェル", def: "カーネルとユーザーをつなぐ通訳係。入力したコマンドを解釈してカーネルに伝える。Linuxでは bash が標準的" },
  { key: "サブシェル", def: "現在のシェルから新しく起動される子のシェル。ここで変えた変数は元のシェルには戻らない" },
  { key: "デーモン", def: "背景で常時動き続けるサービス用のプロセス。名前の末尾に d が付くことが多い（sshd, systemd など）" },
  { key: "ディストリビューション", def: "カーネルに各種ソフトウェアを加えて、すぐ使える形にまとめて配布したもの（Ubuntu、RHEL など）" },

  /* ---- ファイルとパーミッション ---- */
  { key: "iノード", def: "ファイルの属性（所有者・更新日時・サイズ）とディスク上の位置を記録した管理データ。ファイル名とは別に管理される" },
  { key: "パーミッション", def: "ファイルやディレクトリへのアクセス権。所有者・グループ・その他の3者に対し、r(4)/w(2)/x(1) を設定する" },
  { key: "アクセス権", def: "パーミッションと同じ。r（読み取り4）・w（書き込み2）・x（実行1）の組み合わせで表す" },
  { key: "所有者", def: "そのファイルを所有するユーザー。変更（chown）はrootのみ可能" },
  { key: "所有グループ", def: "そのファイルが属するグループ。変更は chgrp。一般ユーザーは自分が所属するグループ間でのみ可能" },
  { key: "スティッキービット", def: "ディレクトリに付けると、書き込み権があっても所有者以外はファイルを削除できなくなる（例：/tmp、1777）" },
  { key: "SUID", def: "Set User ID。実行時にファイル所有者の権限で動作する特殊な権限。所有者の x の位置が s になる" },
  { key: "SGID", def: "Set Group ID。グループの権限で動作する。ディレクトリに付けると、中で作ったファイルがそのグループを引き継ぐ" },
  { key: "umask", def: "新規作成時のパーミッションから差し引く値。基準値はファイル666・ディレクトリ777" },
  { key: "ハードリンク", def: "同じiノードを指す別名。同一ファイルシステム内にしか作れず、ディレクトリには作成できない" },
  { key: "シンボリックリンク", def: "別ファイルへのパスを保持する小さなファイル。別のファイルシステムやディレクトリも指せるが、元を消すとリンク切れになる" },
  { key: "絶対パス", def: "/ から始まる完全なパス表記（例：/etc/fstab）" },
  { key: "相対パス", def: "現在のディレクトリを起点としたパス表記（例：../etc）" },
  { key: "隠しファイル", def: "名前が . で始まるファイル。ls では -a を付けないと表示されない" },
  { key: "アーカイブ", def: "複数のファイルを1つのファイルにまとめたもの。tar で作成する。圧縮とは別の処理" },

  /* ---- ファイルシステム・ディスク ---- */
  { key: "ファイルシステム", def: "ディスク上でデータを管理する仕組み。ext4・XFS などの種類がある。mkfs で作成する" },
  { key: "ジャーナリング", def: "変更内容を先にログ（ジャーナル）へ記録する仕組み。障害後の整合性チェックが短時間で済む" },
  { key: "スーパーブロック", def: "ファイルシステム全体の管理情報が入った領域。dumpe2fs や tune2fs で参照・変更する" },
  { key: "ブロック", def: "ファイルシステムがデータを扱う単位。ディスク側の物理的な区画は「セクタ」" },
  { key: "セクタ", def: "ディスク側の物理的な最小の区画。ファイルシステム側の単位は「ブロック」" },
  { key: "パーティション", def: "ディスク内の論理的な区分け。区画ごとに別のファイルシステムを作成できる" },
  { key: "基本パーティション", def: "MBRで作成できる通常のパーティション。1ディスクに最大4つ（/dev/sda1〜4）" },
  { key: "拡張パーティション", def: "論理パーティションを入れるための箱。1ディスクに1つだけで、そこに直接データは置かない" },
  { key: "論理パーティション", def: "拡張パーティションの中に作るパーティション。デバイス名は /dev/sda5 から始まる" },
  { key: "MBR", def: "Master Boot Record。BIOS環境のパーティション方式。2TBまで・基本パーティション4個まで" },
  { key: "GPT", def: "GUID Partition Table。UEFI環境のパーティション方式。標準で128個、2TB超にも対応" },
  { key: "LVM", def: "Logical Volume Manager。複数のディスクをまとめて柔軟に管理する仕組み。サイズ変更やスナップショットができる" },
  { key: "マウント", def: "ファイルシステムをディレクトリツリーの一部として接続すること。接続先をマウントポイントと呼ぶ" },
  { key: "アンマウント", def: "マウントを解除すること（umount）。使用中のファイルシステムは解除できない" },
  { key: "マウントポイント", def: "ファイルシステムを接続する先のディレクトリ。元々あったファイルは接続中は見えなくなる" },
  { key: "ループバックデバイス", def: "ファイルをブロックデバイスのように扱う仕組み。ISOイメージのマウント（mount -o loop）で使う" },
  { key: "UUID", def: "デバイスを一意に識別する文字列。デバイス名の変動に影響されないため /etc/fstab で使われる。確認は blkid" },
  { key: "クォータ", def: "ユーザーやグループごとにディスク使用量の上限を設ける機能" },
  { key: "スワップ", def: "メモリが不足したときに、ディスク上の領域を一時的にメモリの代わりとして使う仕組み" },
  { key: "デバイスファイル", def: "ハードウェアをファイルとして扱うための特殊なファイル。/dev 以下に udev が自動作成する" },
  { key: "ブロックデバイス", def: "ディスクのようにブロック単位でまとめて読み書きするデバイス" },

  /* ---- プロセス・シェル ---- */
  { key: "プロセス", def: "実行中のプログラム。それぞれPID（プロセスID）を持つ" },
  { key: "ジョブ", def: "シェルが管理する実行単位。ジョブ番号（%1 など）で指定し、fg / bg で切り替える" },
  { key: "シグナル", def: "プロセスに送る通知。TERM(15)は正常終了、KILL(9)は強制終了、HUP(1)は設定の再読み込み" },
  { key: "バックグラウンド", def: "画面を占有せずに実行する状態。コマンドの末尾に & を付けるか bg で移行する" },
  { key: "フォアグラウンド", def: "画面を占有して実行している状態。fg で戻す" },
  { key: "nice値", def: "プロセスの実行優先度。-20（最優先）〜19（最低）で、既定は0。下げるにはroot権限が必要" },
  { key: "ロードアベレージ", def: "実行待ちのプロセス数の平均。uptime や top で直近1分・5分・15分の値が見られる" },
  { key: "環境変数", def: "子プロセスにも引き継がれる変数。export でシェル変数から昇格させる" },
  { key: "シェル変数", def: "そのシェルの中だけで有効な変数。子プロセスには引き継がれない" },
  { key: "エイリアス", def: "コマンドに付ける別名。alias で定義し unalias で解除する" },
  { key: "ファイルディスクリプタ", def: "入出力の通り道に付けられた番号。0=標準入力、1=標準出力、2=標準エラー出力" },
  { key: "標準入力", def: "コマンドがデータを受け取る既定の入口（番号0）。通常はキーボード" },
  { key: "標準出力", def: "コマンドが結果を出す既定の出口（番号1）。通常は画面" },
  { key: "標準エラー出力", def: "エラーメッセージ専用の出口（番号2）。標準出力とは別に扱える" },
  { key: "リダイレクト", def: "入出力の向き先をファイルなどに変えること（> < 2> など）" },
  { key: "パイプ", def: "前のコマンドの標準出力を、次のコマンドの標準入力へ渡す仕組み（|）" },
  { key: "正規表現", def: "文字列のパターンを表す記法。^ 行頭、$ 行末、. 任意の1文字、* 直前の0回以上の繰り返し" },
  { key: "拡張正規表現", def: "+ ? | ( ) などをそのまま使える正規表現。grep -E（egrep）で利用する" },
  { key: "メタ文字", def: "正規表現で特別な意味を持つ記号（^ $ . * [ ] など）。文字として扱うには \\ を前に付ける" },
  { key: "ワイルドカード", def: "シェルがファイル名を展開するときの記号。* は0文字以上の文字列、? は任意の1文字" },

  /* ---- 起動・システム ---- */
  { key: "ブートローダ", def: "カーネルをメモリに読み込んで起動させるプログラム。Linuxでは GRUB2 が一般的" },
  { key: "ブートローダー", def: "カーネルをメモリに読み込んで起動させるプログラム。Linuxでは GRUB2 が一般的" },
  { key: "初期RAMディスク", def: "起動途中で仮のルートファイルシステムとして使われる領域。必要なデバイスドライバを提供する" },
  { key: "ランレベル", def: "SysVinitでのシステムの動作モード。0停止／1シングルユーザー／3CUI／5GUI／6再起動" },
  { key: "ターゲット", def: "systemdでの動作モードの単位。multi-user.target はランレベル3、graphical.target は5に相当" },
  { key: "ユニット", def: "systemdが管理する対象の単位。service（サービス）や target（動作モード）などの種類がある" },
  { key: "カーネルモジュール", def: "必要に応じてカーネルに組み込める部品（主にデバイスドライバ）。modprobe でロードする" },
  { key: "共有ライブラリ", def: "複数のプログラムが共通で使う部品。依存関係は ldd、検索設定は ldconfig で扱う" },
  { key: "udev", def: "デバイスの接続・切断を検知して /dev のデバイスファイルを動的に作成・削除する仕組み" },
  { key: "IRQ", def: "ハードウェアがCPUに処理を要求する割り込み番号。使用状況は /proc/interrupts で確認できる" },
  { key: "DMA", def: "CPUを介さずメモリと直接データをやりとりする仕組み。/proc/dma で確認できる" },

  /* ---- 仮想化・パッケージ ---- */
  { key: "ハイパーバイザ", def: "仮想マシンを動かす基盤。ハイパーバイザ型はCPUの仮想化支援機能を使い効率よく動作する" },
  { key: "仮想化支援機能", def: "CPUが持つ仮想化を高速化する機能。Intelは VT-x、AMDは AMD-V" },
  { key: "コンテナ", def: "アプリを環境ごと分離して動かす仕組み。ホストのカーネルを共有するため軽量" },
  { key: "名前空間", def: "namespace。コンテナごとにプロセスやユーザー権限などを分離する仕組み" },
  { key: "リポジトリ", def: "パッケージが保管・配布されている場所。APTは /etc/apt/sources.list、YUMは /etc/yum.repos.d で設定する" },
  { key: "パッケージ", def: "実行ファイル・ライブラリ・設定ファイルなどを1つにまとめた配布単位" },
  { key: "依存関係", def: "あるパッケージが別のパッケージを必要とする関係。apt や yum は自動で解決する" },
  { key: "競合関係", def: "2つのパッケージが同時に存在できない関係。ファイルの重複やバージョンの違いで起きる" },

  /* ---- SSH・X ---- */
  { key: "公開鍵認証", def: "秘密鍵と公開鍵の組で本人確認する方式。パスワード認証より安全だが設定は手間がかかる" },
  { key: "秘密鍵", def: "手元に置いて他人に渡さない鍵。SSHでは ~/.ssh/id_rsa" },
  { key: "公開鍵", def: "接続先に登録する鍵。SSHでは ~/.ssh/id_rsa.pub を相手の authorized_keys に登録する" },
  { key: "X Window System", def: "LinuxでGUIを実現している仕組み。実装は X.Org Server" },
  { key: "ウィンドウマネージャ", def: "ウィンドウの外観や配置を制御するソフトウェア（Mutter、KWin など）" },
  { key: "ディスプレイマネージャ", def: "GUIのログイン画面を表示してユーザー認証を行うソフトウェア（GDM、SDDM など）" }

];

/* ==================================================================
   用語辞書の組み立て
================================================================== */
const glossMap = new Map();
let glossRe = null;

function glossAdd(key, def) {
  if (!key || key.length < 2) return;
  if (/[<>&"]/.test(key)) return;               // HTMLエスケープと衝突する語は除く
  if (!glossMap.has(key)) glossMap.set(key, def);
}

// 単語帳の見出しから、本文中で照合できる形を取り出す
function glossKeyFromTerm(term) {
  let k = term.split(/\s*[（(]/)[0].trim();      // 「カーネル (Kernel)」→「カーネル」
  if (/[⇔／]|\s\/\s|=|^-|^\d/.test(k)) return "";  // 対比・記号・数字だけの見出しは対象外
  return k;
}

(function buildGlossary() {
  for (const g of GLOSSARY) glossAdd(g.key, g.def);

  if (typeof CARDS !== "undefined") {
    for (const c of CARDS) glossAdd(glossKeyFromTerm(c.term), c.mean);
  }

  if (typeof COMMAND_HELP !== "undefined") {
    for (const cmd of COMMAND_HELP) {
      // 「mv / rm / mkdir / rmdir」のような見出しは個別のコマンドに分ける
      const names = cmd.name.split(/[\/／・]/).map(s => s.trim());
      for (const n of names) {
        if (/^[a-z][a-z0-9_.+-]*$/i.test(n)) glossAdd(n, cmd.desc);
      }
    }
  }

  // 長い語から順に照合する（「シンボリックリンク」が「リンク」に食われないように）
  const keys = [...glossMap.keys()].sort((a, b) => b.length - a.length);
  const pattern = keys.map(k => {
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const head = /^[A-Za-z0-9_]/.test(k) ? "\\b" : "";
    const tail = /[A-Za-z0-9_]$/.test(k) ? "\\b" : "";
    return head + escaped + tail;
  }).join("|");
  glossRe = new RegExp("(" + pattern + ")", "g");
})();

/* ==================================================================
   解説文に用語リンクを埋め込む
================================================================== */

// 同じ語は最初の1か所だけリンクにする（読みづらくならないように）
function glossHtml(text) {
  const used = new Set();
  return esc(text).replace(glossRe, (m) => {
    if (used.has(m)) return m;
    used.add(m);
    return '<span class="gloss" role="button" tabindex="0" data-k="' + esc(m) + '">' + m + "</span>";
  });
}

/* ==================================================================
   説明のポップアップ
================================================================== */
function glossOpen(key, anchor) {
  const def = glossMap.get(key);
  if (!def) return;

  const pop = document.getElementById("glossPop");
  document.getElementById("glossTerm").textContent = key;
  document.getElementById("glossDef").textContent = def;
  pop.hidden = false;

  // 画面が狭いときは下部に固定表示、広いときはクリックした語の近くに出す
  if (window.innerWidth <= 560) {
    pop.classList.add("is-sheet");
    pop.style.left = pop.style.top = pop.style.width = "";
    return;
  }
  pop.classList.remove("is-sheet");

  const r = anchor.getBoundingClientRect();
  const w = Math.min(360, window.innerWidth - 24);
  pop.style.width = w + "px";
  let left = r.left + r.width / 2 - w / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - w - 12));
  let top = r.bottom + 8;
  if (top + pop.offsetHeight > window.innerHeight - 12) {
    top = Math.max(12, r.top - pop.offsetHeight - 8);
  }
  pop.style.left = left + "px";
  pop.style.top = top + "px";
}

function glossClose() {
  const pop = document.getElementById("glossPop");
  if (pop) pop.hidden = true;
}

document.getElementById("btnGlossClose").addEventListener("click", (e) => {
  e.stopPropagation();
  glossClose();
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".gloss");
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    glossOpen(btn.dataset.k, btn);
    return;
  }
  if (!e.target.closest("#glossPop")) glossClose();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { glossClose(); return; }
  const btn = e.target.closest && e.target.closest(".gloss");
  if (btn && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    glossOpen(btn.dataset.k, btn);
  }
});

window.addEventListener("resize", glossClose);
