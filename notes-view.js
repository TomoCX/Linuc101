/* =======================================================================
   暗記ノート画面
   -----------------------------------------------------------------------
   notes.js の NOTES_MD（Markdown）を解析して表示する。
   NOTE_FIGURES は見出し名と対応づけた図解（SVG）で、
   その見出しの直後に自動で差し込まれる。
   ======================================================================= */

/* ---------------- 図解（見出し名 → SVG） ---------------- */
const NOTE_FIGURES = {

  "OSとカーネル・シェル": `
<svg viewBox="0 0 560 210" class="fig" role="img" aria-label="ハードウェアからユーザーまでの階層">
  <text class="lbl" x="8" y="20">上位</text>
  <rect class="bx"   x="120" y="8"   width="320" height="32" rx="6"/><text x="280" y="29" text-anchor="middle">ユーザー</text>
  <rect class="bx-a" x="120" y="48"  width="320" height="32" rx="6"/><text x="280" y="69" text-anchor="middle">アプリケーション</text>
  <rect class="bx-g" x="120" y="88"  width="320" height="32" rx="6"/><text x="280" y="109" text-anchor="middle">シェル（カーネルとユーザーの通訳係）</text>
  <rect class="bx-w" x="120" y="128" width="320" height="32" rx="6"/><text x="280" y="149" text-anchor="middle">カーネル（OSの最も基本的な機能）</text>
  <rect class="bx"   x="120" y="168" width="320" height="32" rx="6"/><text x="280" y="189" text-anchor="middle">ハードウェア</text>
  <text class="lbl" x="8" y="195">下位</text>
  <path d="M470 24 L470 184" marker-end="url(#arw)"/>
  <text class="lbl" x="478" y="108">直接は操作できない</text>
  <defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0 0 L10 5 L0 10 z" class="arw"/></marker></defs>
</svg>`,

  "起動の流れとブートプロセス": `
<svg viewBox="0 0 640 230" class="fig" role="img" aria-label="電源投入からログインまでの流れ">
  <rect class="bx"   x="10"  y="10" width="130" height="44" rx="6"/><text x="75"  y="30" text-anchor="middle">電源ON</text><text class="lbl" x="75" y="46" text-anchor="middle">Power on</text>
  <rect class="bx-a" x="170" y="10" width="150" height="44" rx="6"/><text x="245" y="30" text-anchor="middle">BIOS / UEFI</text><text class="lbl" x="245" y="46" text-anchor="middle">ハードウェア確認</text>
  <rect class="bx-a" x="350" y="10" width="150" height="44" rx="6"/><text x="425" y="30" text-anchor="middle">ブートローダー</text><text class="lbl" x="425" y="46" text-anchor="middle">GRUB2</text>
  <rect class="bx-w" x="170" y="95" width="150" height="52" rx="6"/><text x="245" y="116" text-anchor="middle">カーネル</text><text class="lbl" x="245" y="133" text-anchor="middle">メモリ初期化・仮の /</text>
  <rect class="bx-g" x="350" y="95" width="150" height="52" rx="6"/><text x="425" y="116" text-anchor="middle">init / systemd</text><text class="lbl" x="425" y="133" text-anchor="middle">PID 1</text>
  <rect class="bx"   x="350" y="180" width="150" height="40" rx="6"/><text x="425" y="205" text-anchor="middle">ログインプロンプト</text>
  <path d="M142 32 L166 32" marker-end="url(#arw2)"/>
  <path d="M322 32 L346 32" marker-end="url(#arw2)"/>
  <path d="M425 56 L425 74 L245 74 L245 91" marker-end="url(#arw2)"/>
  <path d="M322 121 L346 121" marker-end="url(#arw2)"/>
  <path d="M425 149 L425 176" marker-end="url(#arw2)"/>
  <text class="lbl mono" x="516" y="121">/etc/inittab または</text>
  <text class="lbl mono" x="516" y="137">default.target</text>
  <defs><marker id="arw2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0 0 L10 5 L0 10 z" class="arw"/></marker></defs>
</svg>`,

  "アクセス権（パーミッション）": `
<svg viewBox="0 0 620 210" class="fig" role="img" aria-label="パーミッション表記の読み方">
  <text class="mono big" x="20" y="42">-</text>
  <text class="mono big" x="52" y="42">r w x</text>
  <text class="mono big" x="160" y="42">r - x</text>
  <text class="mono big" x="268" y="42">r - -</text>
  <path d="M20 54 L20 66 L36 66" /><text class="lbl" x="42" y="70">ファイル種別（- 通常 / d ディレクトリ / l リンク）</text>
  <rect class="bx-g" x="44"  y="80" width="100" height="30" rx="5"/><text x="94"  y="100" text-anchor="middle">所有者 u</text>
  <rect class="bx-a" x="152" y="80" width="100" height="30" rx="5"/><text x="202" y="100" text-anchor="middle">グループ g</text>
  <rect class="bx-w" x="260" y="80" width="100" height="30" rx="5"/><text x="310" y="100" text-anchor="middle">その他 o</text>
  <text class="mono" x="94"  y="132" text-anchor="middle">4+2+1 = 7</text>
  <text class="mono" x="202" y="132" text-anchor="middle">4+0+1 = 5</text>
  <text class="mono" x="310" y="132" text-anchor="middle">4+0+0 = 4</text>
  <text class="mono big" x="400" y="105">→ 754</text>
  <rect class="bx" x="20" y="152" width="580" height="46" rx="6"/>
  <text class="mono" x="36" y="172">r = read（4）  w = write（2）  x = execute（1）</text>
  <text class="lbl" x="36" y="190">ディレクトリでは x が「中に入る権限」、r が「一覧を見る権限」</text>
</svg>`,

  "SUID・SGID・スティッキービット（超頻出）": `
<svg viewBox="0 0 640 200" class="fig" role="img" aria-label="SUID・SGID・スティッキービットの位置と意味">
  <rect class="bx-r" x="10"  y="10" width="196" height="130" rx="8"/>
  <text x="108" y="34" text-anchor="middle">SUID（4）</text>
  <text class="mono" x="108" y="58" text-anchor="middle">-rw<tspan class="hi">s</tspan>r-xr-x</text>
  <text class="lbl" x="108" y="80" text-anchor="middle">所有者の x の位置に s</text>
  <text class="lbl" x="108" y="100" text-anchor="middle">実行時に所有者の権限で動く</text>
  <text class="lbl mono" x="108" y="122" text-anchor="middle">例: /usr/bin/passwd</text>

  <rect class="bx-w" x="222" y="10" width="196" height="130" rx="8"/>
  <text x="320" y="34" text-anchor="middle">SGID（2）</text>
  <text class="mono" x="320" y="58" text-anchor="middle">-rwxr<tspan class="hi">s</tspan>xr-x</text>
  <text class="lbl" x="320" y="80" text-anchor="middle">グループの x の位置に s</text>
  <text class="lbl" x="320" y="100" text-anchor="middle">ディレクトリなら</text>
  <text class="lbl" x="320" y="118" text-anchor="middle">グループを引き継ぐ</text>

  <rect class="bx-a" x="434" y="10" width="196" height="130" rx="8"/>
  <text x="532" y="34" text-anchor="middle">スティッキー（1）</text>
  <text class="mono" x="532" y="58" text-anchor="middle">drwxrwxrw<tspan class="hi">t</tspan></text>
  <text class="lbl" x="532" y="80" text-anchor="middle">その他の x の位置に t</text>
  <text class="lbl" x="532" y="100" text-anchor="middle">所有者以外は削除できない</text>
  <text class="lbl mono" x="532" y="122" text-anchor="middle">例: /tmp（1777）</text>

  <text class="mono" x="320" y="172" text-anchor="middle">chmod 4755 = SUID ／ 2755 = SGID ／ 1777 = スティッキー</text>
  <text class="lbl" x="320" y="190" text-anchor="middle">大文字の S / T は「元の x が無い」状態（実行権なし）</text>
</svg>`,

  "iノードとリンク": `
<svg viewBox="0 0 640 220" class="fig" role="img" aria-label="ハードリンクとシンボリックリンクの違い">
  <text class="lbl" x="12" y="18">ハードリンク（同じiノードの別名）</text>
  <rect class="bx" x="12" y="28" width="120" height="34" rx="5"/><text class="mono" x="72" y="50" text-anchor="middle">file1</text>
  <rect class="bx" x="12" y="76" width="120" height="34" rx="5"/><text class="mono" x="72" y="98" text-anchor="middle">file2</text>
  <rect class="bx-g" x="196" y="52" width="130" height="34" rx="5"/><text x="261" y="74" text-anchor="middle">iノード 12345</text>
  <rect class="bx-a" x="366" y="52" width="120" height="34" rx="5"/><text x="426" y="74" text-anchor="middle">データ本体</text>
  <path d="M134 45 L192 62" marker-end="url(#arw3)"/>
  <path d="M134 93 L192 78" marker-end="url(#arw3)"/>
  <path d="M328 69 L362 69" marker-end="url(#arw3)"/>
  <text class="lbl" x="500" y="60">同じFS内のみ</text>
  <text class="lbl" x="500" y="78">ディレクトリ不可</text>

  <text class="lbl" x="12" y="150">シンボリックリンク（パスを指す別ファイル）</text>
  <rect class="bx" x="12" y="160" width="120" height="34" rx="5"/><text class="mono" x="72" y="182" text-anchor="middle">link1</text>
  <rect class="bx" x="196" y="160" width="130" height="34" rx="5"/><text class="mono" x="261" y="182" text-anchor="middle">file1（パス）</text>
  <rect class="bx-g" x="366" y="160" width="120" height="34" rx="5"/><text x="426" y="182" text-anchor="middle">iノード 12345</text>
  <path d="M134 177 L192 177" marker-end="url(#arw3)"/>
  <path d="M328 177 L362 177" marker-end="url(#arw3)"/>
  <text class="lbl" x="500" y="172">別FS・ディレクトリ可</text>
  <text class="lbl" x="500" y="190">元を消すとリンク切れ</text>
  <defs><marker id="arw3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0 0 L10 5 L0 10 z" class="arw"/></marker></defs>
</svg>`,

  "ファイルの配置（FHS）": `
<svg viewBox="0 0 640 300" class="fig" role="img" aria-label="FHSの主なディレクトリ">
  <rect class="bx-a" x="12" y="10" width="60" height="30" rx="5"/><text class="mono" x="42" y="30" text-anchor="middle">/</text>
  <path d="M42 40 L42 280"/>
  <g class="row">
    <rect class="bx-g" x="72" y="50" width="86" height="26" rx="4"/><text class="mono" x="115" y="68" text-anchor="middle">/bin</text>
    <text class="lbl" x="170" y="68">一般ユーザーも使う基本コマンド（起動に必須）</text><path d="M42 63 L68 63"/>
  </g>
  <g>
    <rect class="bx-g" x="72" y="82" width="86" height="26" rx="4"/><text class="mono" x="115" y="100" text-anchor="middle">/sbin</text>
    <text class="lbl" x="170" y="100">管理者用の必須コマンド</text><path d="M42 95 L68 95"/>
  </g>
  <g>
    <rect class="bx-w" x="72" y="114" width="86" height="26" rx="4"/><text class="mono" x="115" y="132" text-anchor="middle">/etc</text>
    <text class="lbl" x="170" y="132">設定ファイル（共有不可・書き込みあり）</text><path d="M42 127 L68 127"/>
  </g>
  <g>
    <rect class="bx-w" x="72" y="146" width="86" height="26" rx="4"/><text class="mono" x="115" y="164" text-anchor="middle">/var</text>
    <text class="lbl" x="170" y="164">ログ・スプールなど変化するデータ</text><path d="M42 159 L68 159"/>
  </g>
  <g>
    <rect class="bx" x="72" y="178" width="86" height="26" rx="4"/><text class="mono" x="115" y="196" text-anchor="middle">/usr</text>
    <text class="lbl" x="170" y="196">共有可能・読み取り専用にできる静的データ</text><path d="M42 191 L68 191"/>
  </g>
  <g>
    <rect class="bx" x="72" y="210" width="86" height="26" rx="4"/><text class="mono" x="115" y="228" text-anchor="middle">/boot</text>
    <text class="lbl" x="170" y="228">カーネルとブートローダー（共有不可）</text><path d="M42 223 L68 223"/>
  </g>
  <g>
    <rect class="bx" x="72" y="242" width="86" height="26" rx="4"/><text class="mono" x="115" y="260" text-anchor="middle">/proc</text>
    <text class="lbl" x="170" y="260">カーネル情報の仮想ファイルシステム</text><path d="M42 255 L68 255"/>
  </g>
  <text class="lbl" x="12" y="292">共有可否 → /usr・/var は共有可能、/etc・/boot は共有不可。書き込み → /var は必要、/usr は不要</text>
</svg>`,

  "パイプとリダイレクト": `
<svg viewBox="0 0 640 230" class="fig" role="img" aria-label="標準入出力とリダイレクト">
  <rect class="bx-a" x="230" y="60" width="170" height="58" rx="8"/><text x="315" y="86" text-anchor="middle">コマンド</text>
  <text class="lbl" x="315" y="105" text-anchor="middle">process</text>
  <rect class="bx" x="40" y="72" width="120" height="34" rx="5"/><text class="mono" x="100" y="94" text-anchor="middle">0 stdin</text>
  <rect class="bx-g" x="460" y="30" width="140" height="34" rx="5"/><text class="mono" x="530" y="52" text-anchor="middle">1 stdout</text>
  <rect class="bx-r" x="460" y="114" width="140" height="34" rx="5"/><text class="mono" x="530" y="136" text-anchor="middle">2 stderr</text>
  <path d="M162 89 L226 89" marker-end="url(#arw4)"/>
  <path d="M402 78 L430 78 L430 47 L456 47" marker-end="url(#arw4)"/>
  <path d="M402 100 L430 100 L430 131 L456 131" marker-end="url(#arw4)"/>
  <text class="mono" x="40" y="180">&lt; file</text><text class="lbl" x="110" y="180">入力をファイルから</text>
  <text class="mono" x="40" y="202">&gt; file  &gt;&gt; file</text><text class="lbl" x="180" y="202">出力を上書き／追記</text>
  <text class="mono" x="330" y="180">2&gt; file</text><text class="lbl" x="410" y="180">エラーだけ</text>
  <text class="mono" x="330" y="202">&gt; file 2&gt;&amp;1</text><text class="lbl" x="440" y="202">両方まとめて</text>
  <defs><marker id="arw4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0 0 L10 5 L0 10 z" class="arw"/></marker></defs>
</svg>`,

  "ジョブ": `
<svg viewBox="0 0 640 200" class="fig" role="img" aria-label="ジョブの状態遷移">
  <rect class="bx-g" x="20"  y="70" width="160" height="50" rx="8"/><text x="100" y="92" text-anchor="middle">フォアグラウンド</text><text class="lbl" x="100" y="110" text-anchor="middle">画面を占有して実行</text>
  <rect class="bx-w" x="240" y="10" width="160" height="50" rx="8"/><text x="320" y="32" text-anchor="middle">停止（サスペンド）</text><text class="lbl" x="320" y="50" text-anchor="middle">Stopped</text>
  <rect class="bx-a" x="240" y="130" width="160" height="50" rx="8"/><text x="320" y="152" text-anchor="middle">バックグラウンド</text><text class="lbl" x="320" y="170" text-anchor="middle">Running</text>
  <path d="M150 68 L250 58" marker-end="url(#arw5)"/><text class="mono" x="160" y="46">Ctrl+Z</text>
  <path d="M250 70 L160 92" marker-end="url(#arw5)"/><text class="mono" x="196" y="86">fg</text>
  <path d="M320 62 L320 126" marker-end="url(#arw5)"/><text class="mono" x="330" y="100">bg</text>
  <path d="M240 155 L150 118" marker-end="url(#arw5)"/><text class="mono" x="150" y="146">fg</text>
  <text class="mono" x="440" y="60">コマンド &amp;</text><text class="lbl" x="440" y="78">最初からバックグラウンド</text>
  <text class="mono" x="440" y="106">jobs</text><text class="lbl" x="440" y="124">ジョブ番号を確認（%1 で指定）</text>
  <text class="mono" x="440" y="152">nohup … &amp;</text><text class="lbl" x="440" y="170">ログアウト後も継続</text>
  <defs><marker id="arw5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0 0 L10 5 L0 10 z" class="arw"/></marker></defs>
</svg>`,

  "パーティション": `
<svg viewBox="0 0 640 230" class="fig" role="img" aria-label="MBRとGPTのパーティション構成">
  <text class="lbl" x="12" y="18">MBR（最大2TB・基本パーティションは4つまで）</text>
  <rect class="bx" x="12" y="28" width="616" height="56" rx="6"/>
  <rect class="bx-g" x="20"  y="36" width="120" height="40" rx="4"/><text class="mono" x="80"  y="54" text-anchor="middle">/dev/sda1</text><text class="lbl" x="80" y="70" text-anchor="middle">基本</text>
  <rect class="bx-g" x="148" y="36" width="120" height="40" rx="4"/><text class="mono" x="208" y="54" text-anchor="middle">/dev/sda2</text><text class="lbl" x="208" y="70" text-anchor="middle">基本</text>
  <rect class="bx-g" x="276" y="36" width="120" height="40" rx="4"/><text class="mono" x="336" y="54" text-anchor="middle">/dev/sda3</text><text class="lbl" x="336" y="70" text-anchor="middle">基本</text>
  <rect class="bx-w" x="404" y="36" width="216" height="40" rx="4"/><text class="mono" x="512" y="54" text-anchor="middle">/dev/sda4（拡張）</text><text class="lbl" x="512" y="70" text-anchor="middle">1つだけ・入れ物なので直接は使わない</text>
  <rect class="bx-a" x="412" y="96" width="100" height="36" rx="4"/><text class="mono" x="462" y="118" text-anchor="middle">sda5 論理</text>
  <rect class="bx-a" x="520" y="96" width="100" height="36" rx="4"/><text class="mono" x="570" y="118" text-anchor="middle">sda6 論理</text>
  <path d="M462 78 L462 92"/><path d="M570 78 L570 92"/>
  <text class="lbl" x="12" y="120">論理は 5 番から</text>
  <text class="lbl" x="12" y="168">GPT（2TB超に対応・標準で128個）</text>
  <rect class="bx" x="12" y="178" width="616" height="40" rx="6"/>
  <rect class="bx-a" x="20" y="186" width="96" height="24" rx="4"/><text class="mono" x="68" y="203" text-anchor="middle">sda1</text>
  <rect class="bx-a" x="122" y="186" width="96" height="24" rx="4"/><text class="mono" x="170" y="203" text-anchor="middle">sda2</text>
  <rect class="bx-a" x="224" y="186" width="96" height="24" rx="4"/><text class="mono" x="272" y="203" text-anchor="middle">sda3</text>
  <text class="lbl" x="340" y="203">… 最大128（拡張・論理の区別なし）</text>
</svg>`,

  "viエディタ": `
<svg viewBox="0 0 640 210" class="fig" role="img" aria-label="viの3つのモードと切り替え">
  <rect class="bx-a" x="220" y="20" width="200" height="56" rx="8"/><text x="320" y="44" text-anchor="middle">コマンドモード</text><text class="lbl" x="320" y="63" text-anchor="middle">起動直後はここ</text>
  <rect class="bx-g" x="20"  y="130" width="200" height="56" rx="8"/><text x="120" y="154" text-anchor="middle">入力モード</text><text class="lbl" x="120" y="173" text-anchor="middle">文字を打ち込む</text>
  <rect class="bx-w" x="420" y="130" width="200" height="56" rx="8"/><text x="520" y="154" text-anchor="middle">exモード（コマンドライン）</text><text class="lbl" x="520" y="173" text-anchor="middle">:w :q :wq :%s/A/B/g</text>
  <path d="M240 78 L150 126" marker-end="url(#arw6)"/><text class="mono" x="120" y="104">i a o I A O</text>
  <path d="M190 126 L280 80" marker-end="url(#arw6)"/><text class="mono" x="250" y="112">Esc</text>
  <path d="M400 78 L490 126" marker-end="url(#arw6)"/><text class="mono" x="470" y="104">:</text>
  <path d="M530 126 L440 80" marker-end="url(#arw6)"/><text class="mono" x="516" y="112">Enter / Esc</text>
  <text class="lbl" x="320" y="204" text-anchor="middle">入力モードから直接exモードへは行けない（必ずEscでコマンドモードを経由）</text>
  <defs><marker id="arw6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0 0 L10 5 L0 10 z" class="arw"/></marker></defs>
</svg>`,

  "マウントとアンマウント": `
<svg viewBox="0 0 640 210" class="fig" role="img" aria-label="マウントの考え方">
  <rect class="bx" x="230" y="10" width="180" height="60" rx="6"/>
  <text class="mono" x="320" y="34" text-anchor="middle">/dev/sdb1</text>
  <text class="lbl" x="320" y="54" text-anchor="middle">ファイルシステムを作った領域</text>
  <path d="M320 74 L320 104" marker-end="url(#arw7)"/>
  <text class="mono" x="332" y="94">mount</text>
  <rect class="bx-a" x="20" y="110" width="60" height="28" rx="5"/><text class="mono" x="50" y="129" text-anchor="middle">/</text>
  <path d="M50 138 L50 190"/>
  <rect class="bx" x="90" y="112" width="90" height="24" rx="4"/><text class="mono" x="135" y="129" text-anchor="middle">/etc</text><path d="M50 124 L86 124"/>
  <rect class="bx" x="90" y="144" width="90" height="24" rx="4"/><text class="mono" x="135" y="161" text-anchor="middle">/home</text><path d="M50 156 L86 156"/>
  <rect class="bx-g" x="90" y="176" width="90" height="24" rx="4"/><text class="mono" x="135" y="193" text-anchor="middle">/data</text><path d="M50 188 L86 188"/>
  <text class="lbl" x="196" y="193">← ここに接続される（マウントポイント）</text>
  <text class="lbl" x="196" y="124">マウントポイントに元々ファイルがあると、</text>
  <text class="lbl" x="196" y="142">アンマウントするまで見えなくなる</text>
  <text class="mono" x="196" y="166">umount /data</text><text class="lbl" x="330" y="166">使用中だと外せない</text>
  <defs><marker id="arw7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0 0 L10 5 L0 10 z" class="arw"/></marker></defs>
</svg>`,

  "systemd": `
<svg viewBox="0 0 640 190" class="fig" role="img" aria-label="systemdのターゲットとランレベルの対応">
  <text class="lbl" x="14" y="18">systemd のターゲット</text>
  <text class="lbl" x="420" y="18">SysVinit のランレベル</text>
  <rect class="bx" x="14" y="28" width="220" height="26" rx="4"/><text class="mono" x="24" y="46">poweroff.target</text>
  <rect class="bx" x="14" y="60" width="220" height="26" rx="4"/><text class="mono" x="24" y="78">rescue.target</text>
  <rect class="bx-g" x="14" y="92" width="220" height="26" rx="4"/><text class="mono" x="24" y="110">multi-user.target</text>
  <rect class="bx-a" x="14" y="124" width="220" height="26" rx="4"/><text class="mono" x="24" y="142">graphical.target</text>
  <rect class="bx" x="14" y="156" width="220" height="26" rx="4"/><text class="mono" x="24" y="174">reboot.target</text>
  <text class="mono" x="430" y="46">0　停止</text>
  <text class="mono" x="430" y="78">1　シングルユーザー</text>
  <text class="mono" x="430" y="110">3　CUIマルチユーザー</text>
  <text class="mono" x="430" y="142">5　GUIマルチユーザー</text>
  <text class="mono" x="430" y="174">6　再起動</text>
  <path d="M240 41 L420 41"/><path d="M240 73 L420 73"/><path d="M240 105 L420 105"/>
  <path d="M240 137 L420 137"/><path d="M240 169 L420 169"/>
</svg>`
};

/* ---------------- Markdown → HTML ---------------- */
function noteEsc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function mdInline(text) {
  // コード部分をいったん退避してから装飾を処理する
  // （**`-P` と同じ** のように太字がコードをまたぐ場合に対応するため）
  const codes = [];
  let s = noteEsc(text).replace(/`([^`]+)`/g, (m, p1) => {
    codes.push(p1);
    return "\u0001" + (codes.length - 1) + "\u0001";
  });

  s = s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  return s.replace(/\u0001(\d+)\u0001/g, (m, i) => "<code>" + codes[i] + "</code>");
}

function mdCells(line) {
  return line.replace(/^\||\|$/g, "").split("|").map(c => c.trim());
}

// 行の配列を HTML に変換する
function mdToHtml(lines) {
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // コードブロック
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      html += "<pre><code>" + noteEsc(buf.join("\n")) + "</code></pre>";
      continue;
    }

    // 表
    if (/^\|/.test(line) && /^\|[\s:\-|]+\|?\s*$/.test(lines[i + 1] || "")) {
      const head = mdCells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(mdCells(lines[i])); i++; }
      html += '<div class="tbl-wrap"><table><thead><tr>' +
        head.map(c => "<th>" + mdInline(c) + "</th>").join("") + "</tr></thead><tbody>" +
        rows.map(r => "<tr>" + r.map(c => "<td>" + mdInline(c) + "</td>").join("") + "</tr>").join("") +
        "</tbody></table></div>";
      continue;
    }

    // 見出し（h3以下）
    const h = line.match(/^(#{3,6})\s+(.+)$/);
    if (h) {
      const lv = h[1].length;
      html += "<h" + lv + ">" + mdInline(h[2]) + "</h" + lv + ">";
      i++;
      continue;
    }

    // 区切り線
    if (/^\s*---+\s*$/.test(line)) { html += "<hr>"; i++; continue; }

    // 引用
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      html += "<blockquote>" + mdToHtml(buf) + "</blockquote>";
      continue;
    }

    // 箇条書き（1段のネストまで）
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const tag = ordered ? "ol" : "ul";
      html += "<" + tag + ">";
      let open = false;
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
        const indent = lines[i].match(/^\s*/)[0].length;
        const text = lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, "");
        if (indent >= 2) {
          if (!open) { html += "<ul>"; open = true; }
          html += "<li>" + mdInline(text) + "</li>";
        } else {
          if (open) { html += "</ul>"; open = false; }
          html += "<li>" + mdInline(text) + "</li>";
        }
        i++;
      }
      if (open) html += "</ul>";
      html += "</" + tag + ">";
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
    if (buf.length) html += "<p>" + buf.map(mdInline).join("<br>") + "</p>";
  }

  return html;
}

/* ---------------- ノートの構造化 ---------------- */
// 見出しごとに { theme, themeTitle, title, lines } へ分割する
function parseNotes(md) {
  const lines = md.split(/\r?\n/);
  const list = [];
  let theme = "00", themeTitle = "はじめに", cur = null, inFence = false;

  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;

    if (!inFence) {
      const h1 = line.match(/^#\s+(.+)$/);
      const h2 = line.match(/^##\s+(.+)$/);
      if (h1) {
        themeTitle = h1[1];
        const m = themeTitle.match(/主題\s*(\d+\.\d+)/);
        theme = m ? m[1] : "00";
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

const NOTE_SECTIONS = parseNotes(typeof NOTES_MD === "string" ? NOTES_MD : "");
let noteTheme = null;          // 絞り込み中の主題（null = すべて）
let onlyUnlearned = false;     // 覚えていない項目だけ表示するか
let notesBuilt = false;

function noteThemeLabel(t) {
  return t === "00" ? "全体" : t;
}

// 節のキー（"主題/見出し"）。問題データの sec と対応する
function noteKey(sec) { return sec.theme + "/" + sec.title; }

// その節に紐づく問題の数
function sectionQuestionCount(key) {
  return QUESTIONS.filter(q => q.sec === key).length;
}

function buildNotes() {
  const body = document.getElementById("notesBody");
  body.innerHTML = "";

  let lastTheme = null;
  NOTE_SECTIONS.forEach((sec, idx) => {
    if (sec.theme !== lastTheme) {
      const head = document.createElement("h2");
      head.className = "note-theme";
      head.id = "note-theme-" + sec.theme;
      head.textContent = sec.themeTitle;
      head.dataset.theme = sec.theme;
      body.appendChild(head);
      lastTheme = sec.theme;
    }

    const key = noteKey(sec);
    const n = sectionQuestionCount(key);

    const art = document.createElement("article");
    art.className = "note-sec";
    art.id = "note-sec-" + idx;
    art.dataset.theme = sec.theme;
    art.dataset.title = sec.title;
    art.dataset.key = key;

    const fig = NOTE_FIGURES[sec.title] ? '<div class="note-fig">' + NOTE_FIGURES[sec.title] + "</div>" : "";
    art.innerHTML =
      '<div class="note-sec-head">' +
        "<h3>" + noteEsc(sec.title) + "</h3>" +
        '<div class="note-sec-act">' +
          (n ? '<button class="btn btn-mini note-quiz" data-key="' + noteEsc(key) + '">問題を解く（' + n + '問）</button>' : "") +
          '<label class="learn-check"><input type="checkbox" class="learn-box" data-key="' + noteEsc(key) + '"><span>覚えた</span></label>' +
        "</div>" +
      "</div>" +
      fig + mdToHtml(sec.lines);
    body.appendChild(art);
  });

  // チェックボックスと出題ボタン（イベントは委譲でまとめて処理）
  body.addEventListener("change", (e) => {
    const box = e.target.closest(".learn-box");
    if (!box) return;
    const key = box.dataset.key;
    if (box.checked) learned[key] = true; else delete learned[key];
    save(LEARNED_KEY, learned);
    box.closest(".note-sec").classList.toggle("is-learned", box.checked);
    updateLearnProgress();
    buildNoteToc();          // 目次の ✓ 表示も更新する
  });
  body.addEventListener("click", (e) => {
    const btn = e.target.closest(".note-quiz");
    if (!btn) return;
    startSectionQuiz(btn.dataset.key);
  });

  refreshLearnedUI();
  buildNoteToc();
  notesBuilt = true;
}

// 「覚えた」の状態を画面に反映する（同期で取り込んだときにも呼ばれる）
function refreshLearnedUI() {
  document.querySelectorAll("#notesBody .note-sec").forEach(el => {
    const on = !!learned[el.dataset.key];
    const box = el.querySelector(".learn-box");
    if (box) box.checked = on;
    el.classList.toggle("is-learned", on);
  });
  updateLearnProgress();
  buildNoteToc();
}

function updateLearnProgress() {
  const el = document.getElementById("learnProgress");
  if (!el) return;
  const total = NOTE_SECTIONS.length;
  const done = NOTE_SECTIONS.filter(s => learned[noteKey(s)]).length;
  const pctDone = total ? Math.round((done / total) * 100) : 0;
  el.innerHTML = "覚えた <b>" + done + "</b> / " + total + " 項目（" + pctDone + "%）";
}

// ノートの節から、その範囲だけの問題を出題する
function startSectionQuiz(key) {
  const ids = QUESTIONS.filter(q => q.sec === key).map(q => q.id);
  if (!ids.length) return;
  startSession(shuffle(ids));
  session.from = key;
  save(SESSION_KEY, session);
  renderQuiz();
}

function buildNoteToc() {
  const box = document.getElementById("noteTocList");
  box.innerHTML = "";
  let lastTheme = null;
  NOTE_SECTIONS.forEach((sec, idx) => {
    if (noteTheme && sec.theme !== noteTheme) return;
    if (onlyUnlearned && learned[noteKey(sec)]) return;
    if (sec.theme !== lastTheme) {
      const h = document.createElement("div");
      h.className = "toc-theme";
      h.textContent = sec.themeTitle;
      box.appendChild(h);
      lastTheme = sec.theme;
    }
    const a = document.createElement("button");
    a.className = "toc-link" + (learned[noteKey(sec)] ? " is-learned" : "");
    a.textContent = (learned[noteKey(sec)] ? "✓ " : "") + sec.title;
    a.addEventListener("click", () => {
      document.getElementById("noteToc").open = false;
      const el = document.getElementById("note-sec-" + idx);
      if (el) el.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    box.appendChild(a);
  });
}

function filterNotes() {
  const q = document.getElementById("noteSearch").value.trim().toLowerCase();
  let hit = 0;

  document.querySelectorAll("#notesBody .note-sec").forEach(el => {
    const themeOk = !noteTheme || el.dataset.theme === noteTheme;
    const textOk = !q || el.textContent.toLowerCase().includes(q);
    const learnOk = !onlyUnlearned || !learned[el.dataset.key];
    const show = themeOk && textOk && learnOk;
    el.hidden = !show;
    if (show) hit++;
  });

  // 見出し（主題）は、その中に表示中の節があるときだけ出す
  document.querySelectorAll("#notesBody .note-theme").forEach(h => {
    const any = [...document.querySelectorAll('#notesBody .note-sec[data-theme="' + h.dataset.theme + '"]')]
      .some(el => !el.hidden);
    h.hidden = !any;
  });

  const empty = document.getElementById("noteEmpty");
  empty.hidden = hit > 0;
}

function renderNoteThemes() {
  const box = document.getElementById("noteThemes");
  box.innerHTML = "";
  const themes = [];
  NOTE_SECTIONS.forEach(s => { if (!themes.includes(s.theme)) themes.push(s.theme); });

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
  themes.forEach(t => mk(noteThemeLabel(t), t));
}

function showNotes(theme) {
  if (!notesBuilt) buildNotes();
  if (theme !== undefined) noteTheme = theme;
  renderNoteThemes();
  buildNoteToc();
  filterNotes();
  show("notes");
}

// ホーム画面に主題ごとの入口を並べる
function renderNoteJump() {
  const box = document.getElementById("noteJump");
  if (!box) return;
  box.innerHTML = "";
  const themes = [];
  NOTE_SECTIONS.forEach(s => { if (!themes.includes(s.theme)) themes.push(s.theme); });

  const mk = (label, value) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = label;
    b.addEventListener("click", () => showNotes(value));
    box.appendChild(b);
  };
  mk("ノートを開く", null);
  themes.forEach(t => {
    if (t === "00") return;
    const sec = NOTE_SECTIONS.find(s => s.theme === t);
    const name = sec.themeTitle.replace(/^主題\s*\d+\.\d+\s*/, "");
    mk(t + " " + name.slice(0, 14), t);
  });
}

document.getElementById("btnNotesTop").addEventListener("click", () => showNotes());
document.getElementById("btnNotesHome").addEventListener("click", () => renderHome());
document.getElementById("noteSearch").addEventListener("input", filterNotes);
document.getElementById("optOnlyUnlearned").addEventListener("change", (e) => {
  onlyUnlearned = e.target.checked;
  buildNoteToc();
  filterNotes();
});
renderNoteJump();
