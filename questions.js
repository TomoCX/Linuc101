/* =======================================================================
   Linuc レベル1 101 問題データ
   -----------------------------------------------------------------------
   1問 = 1オブジェクト。ここに追記すればそのまま出題対象になります。
     id      : 通し番号（重複しない数値）
     cat     : カテゴリID（下の CATEGORIES のキー）
     q       : 問題文
     choices : 選択肢の配列
     answer  : 正解の選択肢インデックス配列（0始まり）
               要素が1つ → 単一選択（クリックで即判定）
               要素が2つ以上 → 複数選択（チェックして「解答する」）
     exp     : 解説。オプションの後ろには（英単語＝意味）の形で覚え方を添える
   ======================================================================= */

const CATEGORIES = {
  "1.01": "Linuxのインストールと仮想マシン・コンテナの利用",
  "1.02": "ファイル・ディレクトリの操作と管理",
  "1.03": "GNUとUnixのコマンド",
  "1.04": "リポジトリとパッケージ管理",
  "1.05": "ハードウェア、ディスク、パーティション、ファイルシステム"
};

const QUESTIONS = [

  /* ============ 1.01 インストールと仮想マシン・コンテナ ============ */
  {
    id: 1, cat: "1.01",
    q: "GRUB2の設定ファイル /boot/grub/grub.cfg を生成するコマンドはどれか。",
    choices: ["grub-install", "grub-mkconfig", "grub-set-default", "grub-md5-crypt"],
    answer: [1],
    exp: "GRUB2では grub.cfg を直接編集せず、/etc/default/grub と /etc/grub.d/ 以下のスクリプトを元に grub-mkconfig（make config＝設定を生成する）で生成する。出力先は -o（output＝出力先）で指定する。Debian系では同等のラッパーである update-grub が使われる。grub-install（install＝導入）はブートローダ本体をMBR等に書き込むコマンド。"
  },
  {
    id: 2, cat: "1.01",
    q: "systemd環境で、現在のデフォルトターゲットを表示するコマンドはどれか。",
    choices: ["systemctl list-units", "systemctl default", "systemctl get-default", "runlevel"],
    answer: [2],
    exp: "systemctl get-default（default＝既定）でデフォルトターゲット（例: graphical.target）を表示する。変更は systemctl set-default multi-user.target のように行う。実体は /etc/systemd/system/default.target のシンボリックリンク。"
  },
  {
    id: 3, cat: "1.01",
    q: "systemdのターゲットとSysVinitのランレベルの対応として正しいものはどれか。",
    choices: [
      "multi-user.target はランレベル5に相当する",
      "graphical.target はランレベル5に相当する",
      "rescue.target はランレベル6に相当する",
      "poweroff.target はランレベル1に相当する"
    ],
    answer: [1],
    exp: "graphical.target（graphical＝画面あり）≒ ランレベル5、multi-user.target（multi user＝複数ユーザ）≒ ランレベル3、rescue.target（rescue＝救助）≒ ランレベル1、poweroff.target（power off＝電源断）≒ 0、reboot.target（reboot＝再起動）≒ 6。"
  },
  {
    id: 4, cat: "1.01",
    q: "カーネルのリングバッファに記録された起動時メッセージを表示するコマンドはどれか。",
    choices: ["dmesg", "lsmod", "sysctl", "uname -a"],
    answer: [0],
    exp: "dmesg（diagnostic message＝診断メッセージ）はカーネルリングバッファの内容を表示し、デバイス認識状況やドライバのエラー確認に使う。-T（Time＝時刻）で日時形式の表示になる。systemd環境では journalctl -k（kernel＝カーネル）でも同じ内容を参照できる。"
  },
  {
    id: 5, cat: "1.01",
    q: "実行ファイル /usr/bin/less が依存する共有ライブラリを一覧表示するコマンドはどれか。",
    choices: ["ldconfig /usr/bin/less", "ldd /usr/bin/less", "lsof /usr/bin/less", "file /usr/bin/less"],
    answer: [1],
    exp: "ldd（list dynamic dependencies＝動的依存の一覧）はプログラムが必要とする共有ライブラリと、その解決先パスを表示する。'not found' と出た場合はライブラリが不足している。"
  },
  {
    id: 6, cat: "1.01",
    q: "ldconfig が作成・更新する共有ライブラリのキャッシュファイルはどれか。",
    choices: ["/etc/ld.so.conf", "/etc/ld.so.cache", "/lib/modules/modules.dep", "/etc/ldconfig.cache"],
    answer: [1],
    exp: "ldconfig（library config＝ライブラリ設定）は /etc/ld.so.conf（および /etc/ld.so.conf.d/ 以下）に書かれたディレクトリを走査し、キャッシュ /etc/ld.so.cache を更新する。-p（print＝表示）でキャッシュ内容を確認できる。"
  },
  {
    id: 7, cat: "1.01",
    q: "一時的に共有ライブラリの検索パスを追加したい。使用する環境変数はどれか。",
    choices: ["LD_PRELOAD", "LIBRARY_PATH", "LD_LIBRARY_PATH", "PATH"],
    answer: [2],
    exp: "LD_LIBRARY_PATH（library path＝ライブラリを探す道）に追加ディレクトリをコロン区切りで指定すると、動的リンカがそのパスも検索する。恒久的な設定は /etc/ld.so.conf.d/ にファイルを置いて ldconfig を実行する。"
  },
  {
    id: 8, cat: "1.01",
    q: "sshd サービスをシステム起動時に自動起動するよう設定するコマンドはどれか。",
    choices: ["systemctl start sshd", "systemctl enable sshd", "systemctl status sshd", "systemctl mask sshd"],
    answer: [1],
    exp: "enable（有効にする）は自動起動の設定（ユニットのシンボリックリンク作成）で、その場の起動は行わない。即時起動も同時に行うなら systemctl enable --now sshd（now＝今すぐ）。mask（覆い隠す）は起動を完全に禁止する。"
  },
  {
    id: 9, cat: "1.01",
    q: "10分後にシステムを再起動するコマンドはどれか。",
    choices: ["shutdown -r +10", "shutdown -h 10", "shutdown -r now 10", "reboot -t 10"],
    answer: [0],
    exp: "shutdown の時刻指定は「+分」または「hh:mm」。-r（reboot＝再起動）、-h（halt＝停止）、-c（cancel＝取り消し）。shutdown -h +10 なら10分後に停止となる。"
  },
  {
    id: 10, cat: "1.01",
    q: "コンテナ型仮想化（Docker など）の説明として正しいものはどれか。",
    choices: [
      "ゲストOSのカーネルを個別に起動するため起動が遅い",
      "ホストOSのカーネルを共有するため軽量かつ高速に起動できる",
      "CPUの仮想化支援機能がないと一切動作しない",
      "ホストと異なるカーネルを持つOSを自由に実行できる"
    ],
    answer: [1],
    exp: "コンテナはホストのカーネルを共有し、名前空間とcgroupsでプロセスやリソースを分離する。ゲストOSの起動が不要なため軽量。半面、ホストのカーネルに依存するので異なるカーネルのOSは動かせない。"
  },
  {
    id: 11, cat: "1.01",
    q: "Linuxカーネルに組み込まれている仮想化機構（ハイパーバイザ）はどれか。",
    choices: ["KVM", "VMware ESXi", "Hyper-V", "LXC"],
    answer: [0],
    exp: "KVM（Kernel-based Virtual Machine＝カーネル内蔵の仮想マシン）はLinuxカーネルのモジュールとして動作する完全仮想化機構で、CPUの仮想化支援機能（Intel VT-x / AMD-V）を利用する。LXC（LinuX Container）はコンテナ型仮想化。"
  },
  {
    id: 12, cat: "1.01",
    q: "SysVinitでデフォルトランレベルを定義している設定ファイルはどれか。",
    choices: ["/etc/init.d/rc", "/etc/inittab", "/etc/rc.local", "/etc/default/runlevel"],
    answer: [1],
    exp: "/etc/inittab（init table＝initの設定表）の 'id:3:initdefault:' の行でデフォルトランレベルを指定する。systemd環境ではこのファイルは使われず、default.target で指定する。"
  },
  {
    id: 13, cat: "1.01",
    q: "systemd環境で、今回の起動以降のログのみをjournaldから表示するコマンドはどれか。",
    choices: ["journalctl -f", "journalctl -b", "journalctl -u", "journalctl -r"],
    answer: [1],
    exp: "-b（boot＝起動）は現在のブート以降のログを表示する（-b -1 で前回起動時）。-f（follow＝追いかける）は追尾表示、-u（unit＝ユニット）はサービス指定、-r（reverse＝逆）は新しい順、-k（kernel＝カーネル）はカーネルメッセージのみ。"
  },
  {
    id: 14, cat: "1.01",
    q: "現在のシステムを直ちにグラフィカルモードのターゲットへ切り替えるコマンドはどれか。",
    choices: [
      "systemctl set-default graphical.target",
      "systemctl isolate graphical.target",
      "systemctl enable graphical.target",
      "systemctl reload graphical.target"
    ],
    answer: [1],
    exp: "isolate（隔離＝そこだけにする）は指定ターゲットに属さないユニットを停止し、そのターゲットへ即座に移行する（telinit 相当）。set-default（default＝既定）は次回起動時のデフォルトを変えるだけで、現在の状態は変わらない。"
  },
  {
    id: 15, cat: "1.01",
    q: "クラウドのサービスモデルのうち、OSより下（サーバ、ストレージ、ネットワーク）が提供され、利用者がOSやミドルウェアを管理するものはどれか。",
    choices: ["SaaS", "PaaS", "IaaS", "DaaS"],
    answer: [2],
    exp: "IaaS（Infrastructure as a Service＝基盤の提供）はインフラを提供し、OS以上は利用者の管理範囲。PaaS（Platform＝実行基盤）はアプリ実行基盤まで、SaaS（Software＝アプリ）はアプリケーションそのものを提供する。"
  },

  /* ============ 1.02 ファイル・ディレクトリの操作と管理 ============ */
  {
    id: 16, cat: "1.02",
    q: "FHSにおいて、システム起動やシングルユーザーモードでの復旧に必要な基本コマンドが置かれるディレクトリはどれか。",
    choices: ["/usr/bin", "/bin", "/opt", "/usr/local/bin"],
    answer: [1],
    exp: "/bin（binary＝実行ファイル）は一般ユーザーも使う基本コマンドで、/usr がマウントされていなくても使える必要がある。/sbin（system binary）は管理者用の必須コマンド。/usr/bin は起動に必須でない一般コマンド、/opt（optional＝追加）は追加アプリケーション用。"
  },
  {
    id: 17, cat: "1.02",
    q: "ログファイルやメールスプールなど、稼働中に内容が変化するデータを格納するディレクトリはどれか。",
    choices: ["/etc", "/var", "/usr", "/srv"],
    answer: [1],
    exp: "/var（variable＝可変）は書き換わるデータ用で、/var/log、/var/spool、/var/tmp などを含む。/usr は共有可能かつ読み取り専用にできる静的データ、/etc はそのホスト固有の設定ファイル。"
  },
  {
    id: 18, cat: "1.02",
    q: "ディレクトリ data を gzip 圧縮したアーカイブ data.tar.gz として作成するコマンドはどれか。",
    choices: [
      "tar cvf data.tar.gz data",
      "tar czvf data.tar.gz data",
      "tar xzvf data.tar.gz data",
      "tar tzvf data.tar.gz data"
    ],
    answer: [1],
    exp: "c（create＝作成）、z（gZip＝gzip圧縮）、v（verbose＝おしゃべり／経過表示）、f（file＝ファイル名指定。最後に書く）。bzip2 は j、xz は大文字の J を使う。x（extract＝取り出す）は展開、t（table of contents＝目次）は内容一覧。"
  },
  {
    id: 19, cat: "1.02",
    q: "アーカイブ backup.tar.xz を展開するコマンドとして適切なものはどれか。",
    choices: [
      "tar cJf backup.tar.xz",
      "tar xjf backup.tar.xz",
      "tar xJf backup.tar.xz",
      "tar xzf backup.tar.xz"
    ],
    answer: [2],
    exp: "xz 圧縮は大文字の J、bzip2 は小文字の j、gzip は z。x（extract＝取り出す）が展開、f（file＝ファイル名）が対象の指定。なお近年のGNU tarは圧縮形式を自動判別するため tar xf backup.tar.xz でも展開できる。"
  },
  {
    id: 20, cat: "1.02",
    q: "umask が 022 に設定されているとき、新規に作成される通常ファイルのパーミッションはどれか。",
    choices: ["755", "644", "666", "600"],
    answer: [1],
    exp: "umask（mask＝覆い隠す）は基準値から取り除く値。ファイルの基準値は666なので 666-022=644。ディレクトリは基準値777なので 777-022=755 となる。ファイルに実行権が自動付与されることはない。-S（Symbolic＝記号で）を付けると rwxr-xr-x 形式で表示される。"
  },
  {
    id: 21, cat: "1.02",
    q: "ファイル prog に対して SUID を設定するコマンドはどれか。",
    choices: ["chmod 1755 prog", "chmod 2755 prog", "chmod 4755 prog", "chmod 755 prog"],
    answer: [2],
    exp: "特殊なパーミッションビットは4桁目で表し、4=SUID（Set User ID＝所有者権限で実行）、2=SGID（Set Group ID）、1=スティッキービット（sTicky＝粘着）。chmod u+s prog（u=user、s=SUID）と同じ。SUIDが付いた実行ファイルは、実行時にファイル所有者の権限で動作する。"
  },
  {
    id: 22, cat: "1.02",
    q: "/tmp のようにディレクトリへ設定すると、ファイルの所有者と root 以外はそのファイルを削除できなくなる仕組みはどれか。",
    choices: ["SUID", "SGID", "スティッキービット", "umask"],
    answer: [2],
    exp: "スティッキービット（sTicky＝粘着、chmod 1777 または chmod +t）を設定すると、書き込み権があってもファイル所有者以外は削除・名前変更ができない。ls -ld では末尾が t と表示される（drwxrwxrwt）。"
  },
  {
    id: 23, cat: "1.02",
    q: "ディレクトリに SGID を設定した場合の効果として正しいものはどれか。",
    choices: [
      "そのディレクトリ内に作成されたファイルの所有グループがディレクトリのグループになる",
      "そのディレクトリ内のファイルを所有者以外が削除できなくなる",
      "そのディレクトリ内の実行ファイルが root 権限で実行される",
      "そのディレクトリが他のユーザーから見えなくなる"
    ],
    answer: [0],
    exp: "ディレクトリのSGID（Set Group ID、chmod g+s または 2775）は、内部で作成されるファイルの所有グループを親ディレクトリのグループに継承させる。グループ共有ディレクトリの運用で使われる。"
  },
  {
    id: 24, cat: "1.02",
    q: "ハードリンクに関する説明として正しいものを2つ選べ。",
    choices: [
      "元ファイルと同じiノード番号を持つ",
      "異なるファイルシステム上にも作成できる",
      "一般ユーザーはディレクトリに対して作成できない",
      "リンク元を削除するとリンクは無効になる"
    ],
    answer: [0, 2],
    exp: "ハードリンクは同一iノードへの別名なので、同じファイルシステム内にしか作れず、ディレクトリには（一般ユーザーは）作成できない。元の名前を削除してもiノードは残るため内容は失われない。シンボリックリンク（ln -s、symbolic＝別名）は別ファイルシステム可・ディレクトリ可だが、リンク先削除でリンク切れになる。"
  },
  {
    id: 25, cat: "1.02",
    q: "/etc/hosts へのシンボリックリンク myhosts をカレントディレクトリに作成するコマンドはどれか。",
    choices: [
      "ln /etc/hosts myhosts",
      "ln -s /etc/hosts myhosts",
      "ln -s myhosts /etc/hosts",
      "link /etc/hosts myhosts"
    ],
    answer: [1],
    exp: "ln -s（symbolic＝別名）リンク先 リンク名 の順で指定する。-s を付けなければハードリンクになる。-f（force＝強制）は同名のリンクがあれば作り直す。"
  },
  {
    id: 26, cat: "1.02",
    q: "/home 以下から、サイズが100MBを超えるファイルを検索するコマンドはどれか。",
    choices: [
      "find /home -size +100M",
      "find /home -size 100M",
      "find /home -size -100M",
      "find /home -maxsize 100M"
    ],
    answer: [0],
    exp: "-size（size＝サイズ）の指定で + は「より大きい」、- は「より小さい」、符号なしは「ちょうど」。単位は c（characters＝バイト）、k、M、G。デフォルト単位はブロック(512バイト)。"
  },
  {
    id: 27, cat: "1.02",
    q: "/var/log 以下で30日より前に更新されたファイルを削除する find コマンドはどれか。",
    choices: [
      "find /var/log -mtime +30 -delete",
      "find /var/log -mtime -30 -delete",
      "find /var/log -atime +30 -exec rm {}",
      "find /var/log -ctime 30 -remove"
    ],
    answer: [0],
    exp: "-mtime（modify time＝更新時刻）+30 は「最終更新が30日より前」を意味する。-atime（access time＝アクセス時刻）は最終アクセス、-ctime（change time＝変更時刻）はiノード情報の最終変更。-delete（削除）の代わりに -exec（execute＝実行）を使う場合は末尾に \\; が必要（-exec rm {} \\;）。"
  },
  {
    id: 28, cat: "1.02",
    q: "ファイルの所有者を user1、所有グループを staff に同時に変更するコマンドはどれか。",
    choices: [
      "chown user1.staff file",
      "chown user1:staff file",
      "chgrp user1:staff file",
      "chmod user1:staff file"
    ],
    answer: [1],
    exp: "chown（change owner＝所有者を変える）ユーザ:グループ ファイル で同時に変更できる（ドット区切りも歴史的に使えるが、現在はコロンが標準）。グループのみなら chown :staff file または chgrp（change group）staff file。-R（Recursive＝再帰的）で配下すべてに適用する。"
  },
  {
    id: 29, cat: "1.02",
    q: "タイムスタンプや所有者などの属性を保持したままファイルをコピーするオプションはどれか。",
    choices: ["cp -r", "cp -p", "cp -f", "cp -l"],
    answer: [1],
    exp: "-p（preserve＝保つ）はモード・所有者・タイムスタンプを保持する。-a（archive＝保管）は -dR --preserve=all 相当で、再帰＋属性保持＋シンボリックリンク保持をまとめて行う。-r / -R（recursive＝再帰的）はディレクトリごとのコピー、-l（link＝リンク）はハードリンクの作成。"
  },
  {
    id: 30, cat: "1.02",
    q: "存在しない中間ディレクトリも含めて /tmp/a/b/c を一度に作成するコマンドはどれか。",
    choices: ["mkdir -r /tmp/a/b/c", "mkdir -p /tmp/a/b/c", "mkdir -m /tmp/a/b/c", "mkdir --force /tmp/a/b/c"],
    answer: [1],
    exp: "-p（parents＝親も）は必要な親ディレクトリを併せて作成し、既に存在してもエラーにしない。-m（mode＝モード）はパーミッションを指定して作成する。"
  },
  {
    id: 31, cat: "1.02",
    q: "既存ファイル report.txt のタイムスタンプのみを現在時刻に更新するコマンドはどれか。",
    choices: ["touch report.txt", "cat > report.txt", "echo > report.txt", "stat report.txt"],
    answer: [0],
    exp: "touch（触る）は存在するファイルのタイムスタンプを現在時刻に更新し、存在しなければ空ファイルを作成する。-t（time＝時刻）で任意の日時を、-r（reference＝参照）で別ファイルと同じ日時を指定できる。-c（no-create＝作らない）を付けると新規作成しない。> によるリダイレクトは中身を消してしまうので誤り。"
  },
  {
    id: 32, cat: "1.02",
    q: "ファイルの種類（テキスト、実行形式、圧縮形式など）を調べるコマンドはどれか。",
    choices: ["stat", "file", "type", "which"],
    answer: [1],
    exp: "file（種類）はファイルの内容（マジックナンバー）から種類を判定する。stat（status＝状態）はiノード情報やタイムスタンプ、type（種別）はシェルがコマンドをどう解釈するか、which（どれ？）はコマンドの絶対パスを表示する。"
  },
  {
    id: 33, cat: "1.02",
    q: "カレントディレクトリ以下の .conf ファイルだけをまとめて /backup にコピーしたい。空白を含むファイル名でも安全に動作する組み合わせはどれか。",
    choices: [
      "find . -name '*.conf' | xargs cp -t /backup",
      "find . -name '*.conf' -print0 | xargs -0 cp -t /backup",
      "find . -name '*.conf' -exec cp {} /backup",
      "ls *.conf | cp -t /backup"
    ],
    answer: [1],
    exp: "find の -print0（NUL区切りで出力）と xargs の -0（NUL区切りで受け取る）を組み合わせるとNUL文字区切りになり、空白や改行を含むファイル名でも正しく処理できる。cp -t（target＝宛先）は先にコピー先を指定するオプション。-exec（execute＝実行）を使う場合は末尾の \\; が必須。"
  },

  /* ============ 1.03 GNUとUnixのコマンド ============ */
  {
    id: 34, cat: "1.03",
    q: "シェル変数を環境変数に昇格させ、子プロセスへ引き継ぐコマンドはどれか。",
    choices: ["set", "export", "env", "declare -r"],
    answer: [1],
    exp: "export（輸出する）VAR で環境変数となり、そのシェルから起動されるプロセスへ引き継がれる。set（設定一式）はシェル変数を含む全変数の表示やシェルオプション設定、env（environment＝環境）は環境変数の表示や一時的な環境変更でのコマンド実行に使う。"
  },
  {
    id: 35, cat: "1.03",
    q: "現在設定されている環境変数のみを一覧表示するコマンドとして適切なものを2つ選べ。",
    choices: ["env", "set", "printenv", "export -p 以外の unset"],
    answer: [0, 2],
    exp: "env（environment＝環境）と printenv（print environment＝環境を表示）は環境変数のみを表示する。set（設定一式）は環境変数に加えてシェル変数やシェル関数も表示する。unset（un-set＝設定解除）は変数の削除。"
  },
  {
    id: 36, cat: "1.03",
    q: "シェルスクリプト setup.sh を、現在のシェルの環境に反映させる形で実行する方法はどれか。",
    choices: ["./setup.sh", "bash setup.sh", "source setup.sh", "exec setup.sh"],
    answer: [2],
    exp: "source（源から読む。または . ）はサブシェルを起動せずカレントシェルでスクリプトを読み込むため、スクリプト内で設定した変数がそのまま残る。./setup.sh や bash setup.sh はサブシェルで実行されるので設定は残らない。"
  },
  {
    id: 37, cat: "1.03",
    q: "コマンドの標準エラー出力のみを error.log に書き出すリダイレクトはどれか。",
    choices: ["cmd > error.log", "cmd 2> error.log", "cmd >> error.log", "cmd 1> error.log"],
    answer: [1],
    exp: "ファイルディスクリプタは 0=標準入力（stdin）、1=標準出力（stdout）、2=標準エラー出力（stderr）。2>（error output＝エラー出力）で標準エラーのみをリダイレクトする。追記する場合は 2>>（append＝追記）を使う。"
  },
  {
    id: 38, cat: "1.03",
    q: "標準出力と標準エラー出力の両方を all.log にまとめて出力する書き方はどれか。",
    choices: [
      "cmd > all.log 2>&1",
      "cmd 2>&1 > all.log",
      "cmd > all.log 1>&2",
      "cmd 2> all.log 1>&1"
    ],
    answer: [0],
    exp: "先に標準出力をファイルへ向け、その後 2>&1（2番を1番と同じ先へ）で標準エラーを標準出力と同じ先へ複製する。順序を逆にすると、標準エラーは画面のまま残る。bashなら cmd &> all.log（both＝両方）とも書ける。"
  },
  {
    id: 39, cat: "1.03",
    q: "コマンドの出力を画面に表示しつつ、同時にファイルにも保存するコマンドはどれか。",
    choices: ["tee", "split", "cat", "xargs"],
    answer: [0],
    exp: "cmd | tee out.txt（tee＝T字管で分岐）で標準出力への表示とファイル保存を同時に行う。追記する場合は tee -a（append＝追記）を使う。"
  },
  {
    id: 40, cat: "1.03",
    q: "/etc/passwd からユーザー名（1番目のフィールド）だけを取り出すコマンドはどれか。",
    choices: [
      "cut -d: -f1 /etc/passwd",
      "cut -c1 /etc/passwd",
      "cut -f1 /etc/passwd",
      "cut -d: -c1 /etc/passwd"
    ],
    answer: [0],
    exp: "-d（delimiter＝区切り文字）で区切り文字、-f（field＝フィールド）でフィールド番号を指定する。-d を省略するとタブ区切りとみなされる。-c（character＝文字位置）は文字位置での切り出し。"
  },
  {
    id: 41, cat: "1.03",
    q: "uniq コマンドの説明として正しいものはどれか。",
    choices: [
      "ファイル全体から重複行をすべて取り除く",
      "連続して並んでいる重複行のみをまとめる",
      "重複行を数えるには -n オプションを使う",
      "自動的にソートしてから重複を除去する"
    ],
    answer: [1],
    exp: "uniq（unique＝一意）は隣接する重複行しか処理しないため、通常は sort と組み合わせて sort file | uniq とする。出現回数を表示するのは -c（count＝数える）、重複行のみ表示は -d（duplicated＝重複した）、重複しない行のみは -u（unique＝唯一）。"
  },
  {
    id: 42, cat: "1.03",
    q: "数値として大きい順に並べ替えるコマンドはどれか。",
    choices: ["sort -n", "sort -nr", "sort -r", "sort -k"],
    answer: [1],
    exp: "-n（numeric＝数値）は数値として比較、-r（reverse＝逆）は逆順。両方指定して降順の数値ソートになる。-k（key＝キー）はソートキーとなるフィールドの指定、-t（terminator＝区切り）は区切り文字、-u（unique＝一意）は重複除去。"
  },
  {
    id: 43, cat: "1.03",
    q: "ファイル中の小文字をすべて大文字に変換するコマンドはどれか。",
    choices: [
      "tr 'a-z' 'A-Z' < file.txt",
      "tr file.txt 'a-z' 'A-Z'",
      "sed 'a-z/A-Z' file.txt",
      "cut -u file.txt"
    ],
    answer: [0],
    exp: "tr（translate＝変換）はファイル名を引数に取らず標準入力のみを処理するため、リダイレクトかパイプで渡す。-d（delete＝削除）で文字削除、-s（squeeze＝圧縮）で連続文字の圧縮ができる。"
  },
  {
    id: 44, cat: "1.03",
    q: "file.txt 内のすべての 'apple' を 'orange' に置換して表示するコマンドはどれか。",
    choices: [
      "sed 's/apple/orange/' file.txt",
      "sed 's/apple/orange/g' file.txt",
      "sed '/apple/orange/g' file.txt",
      "sed -e 'apple=orange' file.txt"
    ],
    answer: [1],
    exp: "s（substitute＝置換）/置換前/置換後/ の形式で、末尾の g（global＝全体）がないと各行の最初の1個しか置換されない。ファイル自体を書き換えるには -i（in-place＝その場で）を付ける。-n（no auto print＝自動表示しない）は p（print＝表示）と組み合わせて使う。"
  },
  {
    id: 45, cat: "1.03",
    q: "grep で「パターンに一致しない行」を表示するオプションはどれか。",
    choices: ["-i", "-v", "-c", "-l"],
    answer: [1],
    exp: "-v（inVert＝反転）は一致しない行。-i（ignore case＝大小を無視）は大文字小文字を無視、-c（count＝数える）は一致行数のみ表示、-l（files with match＝ファイル名）は一致したファイル名のみ表示、-n（number＝行番号）は行番号付き、-r（recursive＝再帰的）は再帰検索。"
  },
  {
    id: 46, cat: "1.03",
    q: "正規表現 '^root' が意味するものはどれか。",
    choices: [
      "root で終わる行",
      "root で始まる行",
      "root を含まない行",
      "root という単語だけの行"
    ],
    answer: [1],
    exp: "^（キャレットは上＝行の頭）は行頭、$（お金は最後）は行末を表すメタ文字。行末一致なら 'root$'、行全体が root なら '^root$'。.（any one＝任意の1文字）は改行以外の任意の1文字、*（0回以上の繰り返し）は直前の文字の繰り返しを表す。"
  },
  {
    id: 47, cat: "1.03",
    q: "拡張正規表現（+、?、| など）をそのまま使える grep の呼び出し方はどれか。",
    choices: ["grep -F", "grep -E", "grep -w", "grep -x"],
    answer: [1],
    exp: "grep -E（Extended regexp＝拡張正規表現。egrep 相当）は拡張正規表現を使う。-F（Fixed string＝固定文字列。fgrep 相当）は正規表現を解釈せず固定文字列として扱う。-w（word＝単語）は単語単位、-x（eXact line＝行全体）は行全体一致。"
  },
  {
    id: 48, cat: "1.03",
    q: "ログファイルに追記される内容をリアルタイムに表示し続けるコマンドはどれか。",
    choices: ["tail -n 10 /var/log/messages", "tail -f /var/log/messages", "head -f /var/log/messages", "cat -f /var/log/messages"],
    answer: [1],
    exp: "tail -f（follow＝追いかける）はファイル末尾を監視し、追記された行を随時表示する。-n（number of lines＝行数）で表示行数を指定でき、head は先頭からの表示なので -f 相当の追尾はできない。"
  },
  {
    id: 49, cat: "1.03",
    q: "ファイルの行数だけを表示するコマンドはどれか。",
    choices: ["wc -c file", "wc -l file", "wc -w file", "wc -m file"],
    answer: [1],
    exp: "-l（lines＝行）は行数、-w（words＝単語）は単語数、-c（characters/bytes＝バイト）はバイト数、-m（multibyte＝文字）は文字数。オプションなしでは行数・単語数・バイト数の順に表示される。"
  },
  {
    id: 50, cat: "1.03",
    q: "viエディタで、変更内容を保存せずに強制的に終了するコマンドはどれか。",
    choices: [":wq", ":q!", "ZZ", ":w!"],
    answer: [1],
    exp: ":q!（quit＝やめる、! は強制）は保存せず強制終了。:wq（write & quit＝書いてやめる）と ZZ は保存して終了、:w!（write＝書く）は強制的に書き込み。:x も変更があった場合のみ保存して終了する。"
  },
  {
    id: 51, cat: "1.03",
    q: "viのコマンドモードで、カーソル行を削除する操作はどれか。",
    choices: ["dw", "dd", "yy", "x"],
    answer: [1],
    exp: "dd（delete＝削除）は1行削除（削除内容はバッファに入るので p（put＝置く）で貼り付け可能）。dw（delete word）は単語削除、yy（yank＝引き抜く）は1行コピー、x（cross out＝×印で消す）はカーソル位置の1文字削除、u（undo＝取り消す）は直前の操作の取り消し。"
  },
  {
    id: 52, cat: "1.03",
    q: "実行中の全プロセスを詳細に表示する、BSDオプション形式のコマンドはどれか。",
    choices: ["ps -ef", "ps aux", "ps -l", "ps"],
    answer: [1],
    exp: "ps aux はBSD形式（ハイフンなし）で、a（all users＝全ユーザ）、u（user oriented＝ユーザ視点の詳細）、x（端末を持たないプロセスも）の組み合わせ。System V形式では ps -ef（-e＝every すべて、-f＝full 完全）が同等。オプションなしの ps は自分の端末のプロセスのみ表示する。"
  },
  {
    id: 53, cat: "1.03",
    q: "kill コマンドでシグナルを指定しなかった場合に送られるシグナルはどれか。",
    choices: ["SIGHUP (1)", "SIGKILL (9)", "SIGTERM (15)", "SIGINT (2)"],
    answer: [2],
    exp: "デフォルトは SIGTERM(15)（TERMinate＝終了）で、プロセスに終了処理の機会を与える。SIGKILL(9)（KILL＝強制終了）は捕捉不可、SIGHUP(1)（HangUP＝回線切断）は設定の再読み込みに使われることが多い、SIGINT(2)（INTerrupt＝割り込み）は Ctrl+C に相当。-l（list＝一覧）でシグナル一覧を確認できる。"
  },
  {
    id: 54, cat: "1.03",
    q: "プロセス名を指定してまとめてシグナルを送るコマンドはどれか（2つ選べ）。",
    choices: ["killall", "pkill", "kill", "nice"],
    answer: [0, 1],
    exp: "killall（kill all＝全部）と pkill（process kill）はプロセス名を指定してシグナルを送る（pkill は部分一致、killall は完全一致が基本）。kill はプロセスID（PID）を指定する。pgrep（process grep＝探す）は該当PIDを表示するだけ。"
  },
  {
    id: 55, cat: "1.03",
    q: "Ctrl+Z でサスペンドしたジョブを、バックグラウンドで実行再開させるコマンドはどれか。",
    choices: ["fg %1", "bg %1", "jobs %1", "nohup %1"],
    answer: [1],
    exp: "Ctrl+Z（suspend＝一時停止）で止めたジョブは bg（BackGround＝背景）でバックグラウンド実行、fg（ForeGround＝前面）でフォアグラウンド実行に戻せる。jobs（仕事一覧）は現在のジョブ一覧を表示する。"
  },
  {
    id: 56, cat: "1.03",
    q: "ログアウト後もコマンドの実行を継続させたい。適切な実行方法はどれか。",
    choices: [
      "nohup command &",
      "bg command",
      "command | at now",
      "kill -HUP command"
    ],
    answer: [0],
    exp: "nohup（no hangup＝切断されても平気）はSIGHUPを無視させるため、端末を閉じてもプロセスが終了しない。&（background＝背景）を付けてバックグラウンド実行にする。出力はデフォルトで nohup.out に記録される。"
  },
  {
    id: 57, cat: "1.03",
    q: "nice値に関する説明として正しいものはどれか。",
    choices: [
      "指定できる範囲は0〜19で、値が大きいほど優先度が高い",
      "指定できる範囲は-20〜19で、値が小さいほど優先度が高い",
      "一般ユーザーはnice値を下げて優先度を上げられる",
      "実行中のプロセスのnice値は変更できない"
    ],
    answer: [1],
    exp: "nice値（nice＝お行儀よく譲る）は-20（最高優先度）から19（最低優先度）で、デフォルトは0。値を下げる（優先度を上げる）操作はroot権限が必要。実行中プロセスの変更は renice（re-nice＝付け直す）で行い、-p（process＝PID指定）や -u（user＝ユーザ指定）を使う。"
  },
  {
    id: 58, cat: "1.03",
    q: "システムの物理メモリとスワップの使用状況を人間に読みやすい単位で表示するコマンドはどれか。",
    choices: ["free -h", "df -h", "du -h", "top -h"],
    answer: [0],
    exp: "free（空き）はメモリとスワップの使用量を表示し、-h（human readable＝人が読める）で単位を自動整形する。情報源は /proc/meminfo。df はファイルシステムの使用量、du はディレクトリの使用量。"
  },
  {
    id: 59, cat: "1.03",
    q: "uptime コマンドで確認できない情報はどれか。",
    choices: ["システムの連続稼働時間", "ログイン中のユーザー数", "ロードアベレージ", "スワップの使用量"],
    answer: [3],
    exp: "uptime（up time＝稼働時間）は現在時刻、稼働時間、ログインユーザー数、直近1分・5分・15分のロードアベレージを表示する。スワップ使用量は free や top で確認する。"
  },
  {
    id: 60, cat: "1.03",
    q: "コマンド履歴に関する説明として正しいものはどれか。",
    choices: [
      "直前のコマンドを再実行するには !! を使う",
      "履歴は /etc/history に保存される",
      "履歴の保存件数は HISTORY 変数で指定する",
      "history -c は履歴ファイルを削除する"
    ],
    answer: [0],
    exp: "!! は直前のコマンド、!n は履歴番号n、!str は str で始まる直近のコマンドを再実行する。Ctrl+R（Reverse search＝逆検索）でも履歴を探せる。履歴は ~/.bash_history に保存され、件数は HISTSIZE（history size＝履歴の数）/ HISTFILESIZE で指定する。history -c（clear＝消去）はメモリ上の履歴のみ消去する。"
  },
  {
    id: 61, cat: "1.03",
    q: "設定済みのエイリアス ll を一時的に解除するコマンドはどれか。",
    choices: ["alias -d ll", "unalias ll", "alias ll=", "unset ll"],
    answer: [1],
    exp: "unalias（un-alias＝別名を解除）でエイリアスを解除する（-a（all＝すべて）ですべて解除）。エイリアスを一時的に無効化してコマンド本体を実行したい場合は \\ll のようにバックスラッシュを付ける方法もある。"
  },
  {
    id: 62, cat: "1.03",
    q: "コマンド which の説明として正しいものはどれか。",
    choices: [
      "コマンドのマニュアルを表示する",
      "環境変数PATHの中からコマンドの実行ファイルを探して絶対パスを表示する",
      "コマンドの実体・エイリアス・シェル組み込みの区別を表示する",
      "コマンドに関連するバイナリ・ソース・マニュアルの場所を表示する"
    ],
    answer: [1],
    exp: "which（which one?＝どれ？）はPATHを検索して実行ファイルのパスを表示する。実体かエイリアスかを区別するのは type（種別）、バイナリ・ソース・manの位置をまとめて示すのは whereis（where is?＝どこ？）。"
  },
  {
    id: 63, cat: "1.03",
    q: "テキストファイルを1000行ずつの複数ファイルに分割するコマンドはどれか。",
    choices: ["split -l 1000 file", "split -b 1000 file", "csplit -n 1000 file", "cut -l 1000 file"],
    answer: [0],
    exp: "split -l（lines＝行）で行数指定、-b（bytes＝バイト）でバイト数指定の分割ができる。出力は xaa、xab… のような接頭辞付きファイルになる。"
  },

  /* ============ 1.04 リポジトリとパッケージ管理 ============ */
  {
    id: 64, cat: "1.04",
    q: "Debian系で、インストール済みパッケージに含まれるファイルの一覧を表示するコマンドはどれか。",
    choices: ["dpkg -l bash", "dpkg -L bash", "dpkg -S bash", "dpkg -c bash"],
    answer: [1],
    exp: "-L（List files＝ファイル一覧。大文字）はインストール済みパッケージのファイル一覧、-l（list＝一覧。小文字）はパッケージの一覧と状態表示、-S（Search＝ファイルから探す）はファイル名から所属パッケージを検索、-c（contents＝中身）は .deb ファイル内のファイル一覧。"
  },
  {
    id: 65, cat: "1.04",
    q: "ファイル /bin/ls がどのパッケージによって提供されているかを調べるコマンドはどれか（Debian系）。",
    choices: ["dpkg -S /bin/ls", "dpkg -L /bin/ls", "apt-cache show /bin/ls", "dpkg -i /bin/ls"],
    answer: [0],
    exp: "dpkg -S（Search＝探す）はファイルパスから提供元パッケージを検索する。RPM系での同等コマンドは rpm -qf（query file＝このファイルは？）/bin/ls。"
  },
  {
    id: 66, cat: "1.04",
    q: "Debian系で、設定ファイルも含めてパッケージを完全に削除するコマンドはどれか。",
    choices: ["dpkg -r pkg", "dpkg -P pkg", "dpkg -i pkg", "dpkg -V pkg"],
    answer: [1],
    exp: "-P（Purge＝一掃する）は設定ファイルも含めて完全削除、-r（remove＝削除）は設定ファイルを残して削除する。apt では apt purge / apt remove が対応する。-i（install＝導入）はインストール、-V（Verify＝検証）は変更検出。"
  },
  {
    id: 67, cat: "1.04",
    q: "apt-get update の動作として正しいものはどれか。",
    choices: [
      "インストール済みパッケージを最新版に更新する",
      "リポジトリのパッケージ情報（インデックス）を取得して更新する",
      "不要になった依存パッケージを削除する",
      "ダウンロード済みのパッケージファイルを削除する"
    ],
    answer: [1],
    exp: "update（情報の更新）はパッケージ情報の取得のみ。実際の更新は upgrade（格上げ。依存関係の変化を伴う削除・追加は行わない）や dist-upgrade / full-upgrade（依存解決のため削除・追加も行う）。不要な依存の削除は autoremove（自動で掃除）、キャッシュ削除は clean / autoclean（掃除）。"
  },
  {
    id: 68, cat: "1.04",
    q: "APTが参照するリポジトリを記述する主要な設定ファイルはどれか。",
    choices: ["/etc/apt/apt.conf", "/etc/apt/sources.list", "/etc/yum.repos.d/", "/etc/dpkg/dpkg.cfg"],
    answer: [1],
    exp: "/etc/apt/sources.list（sources＝供給元）および /etc/apt/sources.list.d/ 以下のファイルにリポジトリを記述する。apt.conf はAPT自体の動作設定。"
  },
  {
    id: 69, cat: "1.04",
    q: "キーワードからパッケージを検索する apt のコマンドはどれか。",
    choices: ["apt-cache search キーワード", "apt-cache show キーワード", "apt-get search キーワード", "apt-cache depends キーワード"],
    answer: [0],
    exp: "apt-cache search（探す）はパッケージ名と説明文からキーワード検索する。show（見せる）は詳細情報、depends（依存する）は依存関係、rdepends（reverse depends＝逆依存）は逆に依存されている側を表示する。新しい apt コマンドでは apt search / apt show。"
  },
  {
    id: 70, cat: "1.04",
    q: "RPM系で、インストール済みの全パッケージを一覧表示するコマンドはどれか。",
    choices: ["rpm -qa", "rpm -qi", "rpm -ql", "rpm -qp"],
    answer: [0],
    exp: "-q（query＝問い合わせ）に続けて指定する。-qa（query all＝全部）は全パッケージの一覧、-qi（query info＝情報）は詳細情報、-ql（query list＝ファイル一覧）はファイル一覧、-qp（query package file＝未導入のファイルに対して）は未インストールのRPMファイルへの問い合わせ（-qip や -qlp のように併用する）。"
  },
  {
    id: 71, cat: "1.04",
    q: "rpm コマンドの -Uvh と -ivh の違いとして正しいものはどれか。",
    choices: [
      "-U は未インストールでもインストールし、既存があればアップグレードする",
      "-U は既にインストールされている場合のみ更新し、なければ何もしない",
      "-i は既存パッケージを削除してから再インストールする",
      "-U は依存関係を無視してインストールする"
    ],
    answer: [0],
    exp: "-U（Upgrade＝更新）は未インストールなら新規インストール、インストール済みならアップグレードする。既存パッケージがある場合のみ更新するのは -F（Freshen＝新しくする）。-i（install＝導入）は新規インストール専用で、既存があるとエラーになる。-v（verbose＝詳細）と -h（hash＝#で進捗表示）は併用されることが多い。"
  },
  {
    id: 72, cat: "1.04",
    q: "指定したファイルを含むパッケージをリポジトリから探す yum のサブコマンドはどれか。",
    choices: ["yum search", "yum provides", "yum info", "yum list"],
    answer: [1],
    exp: "yum provides（提供する。または whatprovides）はファイルや機能を提供するパッケージを検索する。search（探す）は名前・説明文からのキーワード検索、info（情報）は詳細表示、list（一覧）は一覧表示。"
  },
  {
    id: 73, cat: "1.04",
    q: "yumが参照するリポジトリ定義ファイルが配置されるディレクトリはどれか。",
    choices: ["/etc/yum.conf.d/", "/etc/yum.repos.d/", "/var/cache/yum/", "/etc/rpm/repos/"],
    answer: [1],
    exp: "/etc/yum.repos.d/（repositories＝供給元）に拡張子 .repo のファイルを置いてリポジトリを定義する。yum全体の設定は /etc/yum.conf。DNFでも同じディレクトリを使用する。"
  },
  {
    id: 74, cat: "1.04",
    q: "openSUSE系ディストリビューションで用いられるパッケージ管理コマンドはどれか。",
    choices: ["apt", "zypper", "dnf", "pacman"],
    answer: [1],
    exp: "zypper は openSUSE / SUSE Linux Enterprise のパッケージ管理コマンド（in=install＝導入、rm=remove＝削除、up=update＝更新、ref=refresh＝情報更新）。dnf は Fedora / RHEL 系、apt は Debian 系。"
  },
  {
    id: 75, cat: "1.04",
    q: "RPMパッケージがインストール後に改ざん・変更されていないか検証するコマンドはどれか。",
    choices: ["rpm -V パッケージ名", "rpm -e パッケージ名", "rpm -qc パッケージ名", "rpm --rebuilddb"],
    answer: [0],
    exp: "-V（Verify＝検証）はインストール時の情報とファイルの現状を比較し、S（Size＝サイズ）、M（Mode＝モード）、5（MD5）、T（Time＝タイムスタンプ）などの差異を表示する。-e（erase＝消去）は削除、-qc（query config＝設定ファイル）は設定ファイルの一覧表示。"
  },

  /* ============ 1.05 ハードウェア・ディスク・ファイルシステム ============ */
  {
    id: 76, cat: "1.05",
    q: "PCI接続されたデバイスの一覧を表示するコマンドはどれか。",
    choices: ["lsusb", "lspci", "lsmod", "lsblk"],
    answer: [1],
    exp: "lspci（list PCI＝PCI一覧）はPCIデバイス、lsusb（list USB）はUSBデバイスの情報を表示する。lsmod（list modules）はロード済みカーネルモジュール、lsblk（list block devices＝ブロック装置一覧）はブロックデバイスの一覧。-v（verbose＝詳しく）や -k（kernel driver＝使用ドライバ）で詳細を確認できる。"
  },
  {
    id: 77, cat: "1.05",
    q: "現在ロードされているカーネルモジュールの一覧を表示するコマンドはどれか。また、その情報源となるファイルはどれか。",
    choices: [
      "lsmod / /proc/modules",
      "modinfo / /etc/modules",
      "depmod / /lib/modules/modules.dep",
      "modprobe -l / /proc/devices"
    ],
    answer: [0],
    exp: "lsmod（list modules＝モジュール一覧）は /proc/modules の内容を整形して表示する。modinfo（module info＝情報）はモジュールの詳細情報、depmod（dependency module＝依存関係）は依存関係ファイル modules.dep を生成するコマンド。"
  },
  {
    id: 78, cat: "1.05",
    q: "依存関係にあるモジュールも含めてカーネルモジュールをロードするコマンドはどれか。",
    choices: ["insmod", "modprobe", "depmod", "rmmod"],
    answer: [1],
    exp: "modprobe（module probe＝探して入れる）は modules.dep を参照して依存モジュールも自動的にロードする（-r（remove＝取り外す）でアンロード）。insmod（insert module＝挿し込む）は指定モジュールのみをロードし依存解決を行わない。rmmod（remove module＝外す）はアンロード。"
  },
  {
    id: 79, cat: "1.05",
    q: "CPUの種類やクロック、コア数などの情報が記録されているファイルはどれか。",
    choices: ["/proc/cpuinfo", "/proc/meminfo", "/proc/devices", "/proc/interrupts"],
    answer: [0],
    exp: "/proc 以下はカーネル内部情報の仮想ファイルシステム。cpuinfo（CPU情報）はCPU、meminfo（memory情報）はメモリ、interrupts（割り込み）はIRQの使用状況、ioports（I/Oポート）はI/Oアドレス、dma（DMAチャネル）はDMAの情報を持つ。"
  },
  {
    id: 80, cat: "1.05",
    q: "udev の説明として正しいものはどれか。",
    choices: [
      "起動時に /dev 以下のデバイスファイルを静的にすべて作成する",
      "デバイスの接続・切断を検知して /dev 以下のデバイスファイルを動的に管理する",
      "カーネルモジュールの依存関係を解決する仕組みである",
      "ハードディスクのパーティションを自動的に作成する"
    ],
    answer: [1],
    exp: "udev（userspace device＝ユーザ空間のデバイス管理）はカーネルからのuevent（ホットプラグイベント）を受けてデバイスファイルを動的に作成・削除する。ルールは /etc/udev/rules.d/（rules＝規則）や /lib/udev/rules.d/ に置き、デバイス情報は /sys（sysfs）から取得する。"
  },
  {
    id: 81, cat: "1.05",
    q: "MBR形式のパーティションに関する説明として正しいものはどれか。",
    choices: [
      "基本パーティションは最大4つまで作成できる",
      "拡張パーティションは1台のディスクに4つまで作成できる",
      "パーティションは最大128個まで作成できる",
      "2TB以上のディスクでも問題なく全容量を利用できる"
    ],
    answer: [0],
    exp: "MBR（Master Boot Record）では基本パーティションが最大4つで、そのうち1つを拡張パーティションにして中に論理パーティションを作る。扱えるディスクサイズは約2TBまで。GPT（GUID Partition Table）は標準で128パーティション、2TB超にも対応する。"
  },
  {
    id: 82, cat: "1.05",
    q: "GPT形式のパーティションを操作できるコマンドの組み合わせとして適切なものはどれか。",
    choices: ["fdisk（古い版）とcfdiskのみ", "gdisk と parted", "mkfs と fsck", "tune2fs と dumpe2fs"],
    answer: [1],
    exp: "gdisk（GPT fdisk）はGPT専用の対話型パーティション管理ツール、parted（partition editor＝パーティション編集）はMBR/GPT双方に対応する。近年の fdisk はGPTにも対応しているが、伝統的にはMBR用とされる。mkfs（make filesystem）はファイルシステム作成、tune2fs はext系の設定変更。"
  },
  {
    id: 83, cat: "1.05",
    q: "/dev/sdb1 に ext4 ファイルシステムを作成するコマンドとして誤っているものはどれか。",
    choices: ["mkfs -t ext4 /dev/sdb1", "mkfs.ext4 /dev/sdb1", "mke2fs -t ext4 /dev/sdb1", "fsck -t ext4 /dev/sdb1"],
    answer: [3],
    exp: "fsck（filesystem check＝検査）はファイルシステムの検査・修復コマンドで、作成は行わない。mkfs（make filesystem＝作る）は各 mkfs.<type> のフロントエンドで、ext系専用コマンドが mke2fs。-t（type＝種類）で種類を指定する。"
  },
  {
    id: 84, cat: "1.05",
    q: "ファイルシステムの検査・修復（fsck）を行う際の注意点として正しいものはどれか。",
    choices: [
      "対象ファイルシステムをマウントした状態で実行する",
      "対象ファイルシステムをアンマウントしてから実行する",
      "必ず -y オプションを付けないと実行できない",
      "スワップ領域に対しても定期的に実行する必要がある"
    ],
    answer: [1],
    exp: "マウント中のファイルシステムに fsck を実行するとデータ破損の恐れがあるため、アンマウントするかシングルユーザーモードで実行する。-y（yes＝すべて「はい」）や -a（auto＝自動）で自動修復、-f（force＝強制）でクリーンでも強制検査、-A（All＝fstab全部）で一括検査。ルートファイルシステムはレスキューモードや起動時の自動チェックを利用する。"
  },
  {
    id: 85, cat: "1.05",
    q: "ext系ファイルシステムのラベルや最大マウント回数などのパラメータを変更するコマンドはどれか。",
    choices: ["dumpe2fs", "tune2fs", "e2fsck", "debugfs"],
    answer: [1],
    exp: "tune2fs（tune＝調律する）は -L（Label＝ラベル）でラベル、-c（count＝回数）で最大マウント回数、-i（interval＝間隔）でチェック間隔、-m（minimum reserved＝予約）で予約ブロック率を変更する。dumpe2fs（dump＝吐き出す）は現在の設定・情報を表示するだけのコマンドで、-h（header＝要約）でスーパーブロックのみ表示する。"
  },
  {
    id: 86, cat: "1.05",
    q: "/etc/fstab の各行に記述するフィールドの順序として正しいものはどれか。",
    choices: [
      "デバイス、マウントポイント、ファイルシステムの種類、マウントオプション、dumpの要否、fsckの順序",
      "マウントポイント、デバイス、マウントオプション、ファイルシステムの種類、fsckの順序、dumpの要否",
      "デバイス、ファイルシステムの種類、マウントポイント、マウントオプション、fsckの順序、dumpの要否",
      "デバイス、マウントポイント、マウントオプション、ファイルシステムの種類、dumpの要否、fsckの順序"
    ],
    answer: [0],
    exp: "6フィールドは「デバイス（UUID可） / マウントポイント / 種類 / オプション / dump（バックアップの要否） / fsck の pass 番号」の順。第6フィールドは0=検査しない、1=ルート、2=その他が一般的。オプションには defaults（既定一式）、ro（read only＝読み取り専用）、noauto（no auto＝自動マウントしない）などを書く。"
  },
  {
    id: 87, cat: "1.05",
    q: "/etc/fstab に記述されたファイルシステムのうち、未マウントのものをすべてマウントするコマンドはどれか。",
    choices: ["mount -a", "mount -o remount", "mount -t auto", "umount -a"],
    answer: [0],
    exp: "mount -a（all＝すべて）は /etc/fstab の内容に従って（noauto（no auto＝自動しない）指定を除き）まとめてマウントする。fstab編集後の記述ミス確認にも使われる。-o remount（remount＝付け直す）はアンマウントせずオプションを変更する。"
  },
  {
    id: 88, cat: "1.05",
    q: "ブロックデバイスのUUIDやファイルシステムの種類を確認するコマンドはどれか。",
    choices: ["blkid", "df -T", "fdisk -l", "du -s"],
    answer: [0],
    exp: "blkid（block id＝ブロック装置の識別子）は各ブロックデバイスのUUID、LABEL、TYPEを表示する。/etc/fstab でUUID指定する際に利用する。lsblk -f（filesystem＝ファイルシステム）でも同様の情報を確認できる。"
  },
  {
    id: 89, cat: "1.05",
    q: "ファイルシステムのiノードの使用状況を表示するコマンドはどれか。",
    choices: ["df -h", "df -i", "du -a", "df -T"],
    answer: [1],
    exp: "df -i（inode＝iノード）はiノードの総数・使用数・使用率を表示する。ディスク容量に余裕があってもiノードが枯渇するとファイルを作成できなくなる。-h（human readable＝人が読める）は容量を読みやすい単位で、-T（Type＝種類）はファイルシステムの種類を表示する。"
  },
  {
    id: 90, cat: "1.05",
    q: "/home ディレクトリ全体の使用容量の合計だけを表示するコマンドはどれか。",
    choices: ["du -sh /home", "du -ah /home", "df -sh /home", "ls -lh /home"],
    answer: [0],
    exp: "du -s（summarize＝合計だけ）は合計のみを表示し、-h（human readable＝人が読める）で読みやすい単位にする。-a（all＝すべて）は各ファイルも表示、-c（total＝総計）は最後に合計を表示。df はファイルシステム単位の使用量を表示するコマンドで -s オプションは持たない。"
  },
  {
    id: 91, cat: "1.05",
    q: "パーティション /dev/sdb2 をスワップ領域として利用可能にする手順の組み合わせとして正しいものはどれか。",
    choices: [
      "mkswap /dev/sdb2 の後に swapon /dev/sdb2",
      "mkfs -t swap /dev/sdb2 の後に mount /dev/sdb2",
      "swapon /dev/sdb2 の後に mkswap /dev/sdb2",
      "fdisk /dev/sdb2 の後に swapon -a"
    ],
    answer: [0],
    exp: "mkswap（make swap＝スワップを作る）でスワップ領域として初期化し、swapon（swap on＝有効化）で有効化する。起動時から有効にするには /etc/fstab に 'UUID=... swap swap defaults 0 0' のように記述する。"
  },
  {
    id: 92, cat: "1.05",
    q: "現在有効なスワップ領域とその使用状況を確認する方法として適切なものを2つ選べ。",
    choices: ["swapon -s", "cat /proc/swaps", "mkswap -s", "du -s /swap"],
    answer: [0, 1],
    exp: "swapon -s（summary＝要約。または --show）は /proc/swaps の内容を表示する。-a（all＝すべて）は fstab のスワップをまとめて有効化するオプション。free コマンドでもスワップの総量と使用量を確認できる。"
  },
  {
    id: 93, cat: "1.05",
    q: "ユーザーごとのディスク使用量を制限するクォータ機能で、編集用のコマンドはどれか。",
    choices: ["quotaon", "edquota", "repquota", "quotacheck"],
    answer: [1],
    exp: "edquota（edit quota＝編集）はユーザー/グループのクォータ上限をエディタで編集する。quotacheck（check＝検査）はクォータ情報の初期作成・整合性チェック、quotaon（on＝有効化）は有効化、repquota（report quota＝報告）は使用状況レポート表示。"
  },
  {
    id: 94, cat: "1.05",
    q: "XFSファイルシステムの情報を表示するコマンドはどれか。",
    choices: ["xfs_info", "dumpe2fs", "tune2fs", "xfs_growfs -n のみ"],
    answer: [0],
    exp: "XFSは xfs_info（info＝情報）で情報表示、xfs_repair（repair＝修復）で修復、xfs_admin（admin＝管理）で設定変更、xfs_growfs（grow＝広げる）で拡張を行う。ext系の dumpe2fs / tune2fs / e2fsck はXFSには使えない。"
  },
  {
    id: 95, cat: "1.05",
    q: "ISOイメージファイル image.iso を /mnt にマウントするコマンドはどれか。",
    choices: [
      "mount -o loop image.iso /mnt",
      "mount -t iso image.iso /mnt",
      "mount -o ro image.iso /mnt",
      "mount --bind image.iso /mnt"
    ],
    answer: [0],
    exp: "ファイルをブロックデバイスとして扱うにはループバックデバイスを使うため -o loop（loopback＝ループ）を指定する（多くの環境ではファイル指定時に自動判別もされる）。-o（options＝オプション）はマウントオプションの指定、-t（type＝種類）はファイルシステム種別の指定で、ISO9660は iso9660 と書く。"
  },
  {
    id: 96, cat: "1.05",
    q: "ジャーナリング機能を持つファイルシステムの利点として正しいものはどれか。",
    choices: [
      "ディスクの物理的な故障を自動的に修復できる",
      "システム障害後の整合性チェックが短時間で完了する",
      "ファイルの断片化が発生しなくなる",
      "パーティションサイズを無制限に拡張できる"
    ],
    answer: [1],
    exp: "ジャーナル（journal＝更新の日誌）に変更内容を先に記録するため、クラッシュ後はジャーナルの再適用だけで整合性を回復でき、全領域のチェックが不要になる。ext3/ext4/XFS/JFS/ReiserFSなどが該当し、ext2は非ジャーナリング。ext2にジャーナルを追加するには tune2fs -j（journal）を使う。"
  }

];
