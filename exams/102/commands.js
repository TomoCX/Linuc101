/* =======================================================================
   コマンドオプション早見表（102）
   -----------------------------------------------------------------------
   書き方は exams/101/commands.js と同じ。
   ======================================================================= */

addCommands("102", [
  "シェルスクリプト",
  "ネットワーク",
  "ユーザー・グループ管理",
  "ジョブ・時刻・ロケール",
  "ログ・メール",
  "セキュリティ"
], [

/* ========== シェルスクリプト ========== */
{
  name: "alias / unalias", group: "シェルスクリプト",
  desc: "コマンドの別名（エイリアス）を設定・解除する",
  keys: ["エイリアス", "別名"],
  ex: "alias ll='ls -la'",
  rows: [
    { opt: "alias 名前='コマンド'", memo: "alias（別名）", role: "エイリアスを設定（= の前後にスペースを入れない）" },
    { opt: "alias", memo: "引数なし", role: "設定中のエイリアスを一覧表示" },
    { opt: "unalias 名前", memo: "un（取り消し）", role: "エイリアスを解除" },
    { opt: "unalias -a", memo: "all（すべて）", role: "すべてのエイリアスを解除" },
    { opt: "\\コマンド", memo: "バックスラッシュ", role: "エイリアスを無視して本来のコマンドを実行" }
  ]
},
{
  name: "source / declare / unset", group: "シェルスクリプト",
  desc: "設定ファイルの読み込みと、シェル関数・変数の確認・削除",
  keys: ["シェル関数", "今のシェル"],
  ex: "source ~/.bashrc",
  rows: [
    { opt: "source ファイル（. ファイル）", memo: "source（源）", role: "ファイルを今のシェルで実行（変数・設定が残る）" },
    { opt: "declare -f [関数名]", memo: "function（関数）", role: "定義した関数の内容を表示" },
    { opt: "declare -F", memo: "Function names", role: "関数名だけを一覧表示" },
    { opt: "unset 名前", memo: "un-set（設定を外す）", role: "変数や関数を削除" },
    { opt: "type 名前", memo: "type（種類）", role: "エイリアス・関数・組み込み・外部コマンドのどれかを表示" }
  ]
},
{
  name: "test / [ ]", group: "シェルスクリプト",
  desc: "条件を判定して、真なら終了ステータス0を返す（if・while の条件に使う）",
  keys: ["条件式", "真になる"],
  ex: "if [ $a -gt $b ]; then echo big; fi",
  rows: [
    { opt: "-eq / -ne", memo: "equal / not equal", role: "数値が等しい／等しくない" },
    { opt: "-gt / -ge", memo: "greater than / greater or equal", role: "より大きい／以上" },
    { opt: "-lt / -le", memo: "less than / less or equal", role: "より小さい／以下" },
    { opt: "= / !=", memo: "（記号）", role: "文字列が等しい／異なる" },
    { opt: "-z / -n", memo: "zero / nonzero", role: "文字列が空／空でない" },
    { opt: "-e / -f / -d", memo: "exist / file / directory", role: "存在する／通常ファイル／ディレクトリ" },
    { opt: "-r / -w / -x / -s", memo: "read / write / execute / size", role: "読める／書ける／実行できる／サイズが0より大きい" },
    { opt: "! / -a / -o", memo: "not / and / or", role: "否定／かつ／または" }
  ]
},
{
  name: "bash / shift / read / seq / exit", group: "シェルスクリプト",
  desc: "スクリプトの実行と、スクリプトの中でよく使うコマンド",
  keys: ["シェルスクリプト", "終了ステータス", "デバッグ"],
  ex: "bash -x backup.sh",
  rows: [
    { opt: "bash -x スクリプト", memo: "execute trace（実行の追跡）", role: "コマンドを1行ずつ表示しながら実行（デバッグ）" },
    { opt: "bash -n スクリプト", memo: "no exec（実行しない）", role: "実行せずに文法だけを確認" },
    { opt: "shift [n]", memo: "shift（ずらす）", role: "引数を n 個前へずらす（$2 が $1 に）" },
    { opt: "read [-p 文] 変数", memo: "read（読む）", role: "標準入力から1行読んで変数に入れる" },
    { opt: "seq 開始 [増分] 終了", memo: "sequence（連続）", role: "連番を出力" },
    { opt: "exit 数値", memo: "exit（出口）", role: "終了ステータスを返してスクリプトを終える" },
    { opt: "$# / $? / $0 / $@", memo: "（特殊変数）", role: "引数の数／直前の終了ステータス／スクリプト名／全引数" }
  ]
},

/* ========== ネットワーク ========== */
{
  name: "ip", group: "ネットワーク",
  desc: "IPアドレス・インターフェイス・ルーティングを表示・設定する（ifconfig・route の後継）",
  keys: ["ip addr", "ip link", "ip route", "ip a"],
  ex: "ip route add default via 192.168.1.1",
  rows: [
    { opt: "ip addr show（ip a）", memo: "address（住所）", role: "IPアドレスを表示" },
    { opt: "ip addr add 10.0.0.5/24 dev eth0", memo: "add / device", role: "IPアドレスを追加（再起動で消える）" },
    { opt: "ip link show", memo: "link（つながり）", role: "インターフェイス（データリンク層）を表示" },
    { opt: "ip link set eth0 up / down", memo: "set（設定）", role: "インターフェイスを有効／無効" },
    { opt: "ip route show（ip r）", memo: "route（経路）", role: "ルーティングテーブルを表示" },
    { opt: "ip route add 宛先 via GW", memo: "via（経由して）", role: "経路を追加（default でデフォルトゲートウェイ）" }
  ]
},
{
  name: "nmcli", group: "ネットワーク",
  desc: "NetworkManager を操作して、ネットワークの状態の確認や設定をする",
  keys: ["networkmanager", "コネクション"],
  ex: "nmcli connection show --active",
  rows: [
    { opt: "nmcli general status", memo: "general（全体）", role: "NetworkManager の状態" },
    { opt: "nmcli general hostname 名前", memo: "hostname", role: "ホスト名を変更" },
    { opt: "nmcli networking on / off", memo: "networking", role: "ネットワーク全体を有効／無効" },
    { opt: "nmcli radio wifi on / off", memo: "radio（無線）", role: "Wi-Fi を有効／無効" },
    { opt: "nmcli device status", memo: "device（装置）", role: "デバイスの状態一覧（wifi list でアクセスポイント）" },
    { opt: "nmcli connection show", memo: "connection（接続）", role: "接続の一覧（--active で使用中だけ）" },
    { opt: "nmcli connection up / down 名前", memo: "up / down", role: "接続を有効／無効" },
    { opt: "nmcli connection modify 名前 項目 値", memo: "modify（変更）", role: "接続の設定を変更（恒久的）" }
  ]
},
{
  name: "ifconfig / ifup / ifdown / route", group: "ネットワーク",
  desc: "古くからあるインターフェイス・経路の設定コマンド（net-tools）",
  keys: ["ルーティングテーブル", "デフォルトゲートウェイ", "サブネットマスク"],
  ex: "route add default gw 192.168.1.1",
  rows: [
    { opt: "ifconfig [eth0]", memo: "interface config", role: "インターフェイスの情報を表示" },
    { opt: "ifconfig eth0 IP netmask マスク", memo: "netmask", role: "IPアドレスとサブネットマスクを設定" },
    { opt: "ifup eth0 / ifdown eth0", memo: "up / down", role: "インターフェイスを有効／無効" },
    { opt: "route -n", memo: "numeric（数値）", role: "ルーティングテーブルを数値で表示" },
    { opt: "route add default gw GW", memo: "gateway", role: "デフォルトゲートウェイを設定（ip route は via）" },
    { opt: "route add -net 宛先 netmask マスク gw GW", memo: "-net（ネットワーク宛て）", role: "経路を追加（del で削除）" }
  ]
},
{
  name: "hostname / hostnamectl", group: "ネットワーク",
  desc: "ホスト名を表示・変更する",
  keys: ["ホスト名"],
  ex: "hostnamectl set-hostname server1",
  rows: [
    { opt: "hostname", memo: "host name", role: "ホスト名を表示（引数で一時的に変更）" },
    { opt: "hostnamectl", memo: "control（制御）", role: "ホスト名などの情報を表示" },
    { opt: "hostnamectl set-hostname 名前", memo: "set（設定）", role: "ホスト名を恒久的に変更（/etc/hostname も更新）" }
  ]
},
{
  name: "ping / traceroute / tracepath", group: "ネットワーク",
  desc: "相手との疎通と、経由するルーター（経路）を調べる",
  keys: ["経由するルーター", "エコー要求", "icmp"],
  ex: "ping -c 3 192.168.1.1",
  rows: [
    { opt: "ping -c 回数", memo: "count（回数）", role: "回数を指定して送る（無指定は Ctrl+C まで）" },
    { opt: "ping -i 秒", memo: "interval（間隔）", role: "送信の間隔" },
    { opt: "ping6 / ping -6", memo: "IPv6", role: "IPv6 で送る" },
    { opt: "traceroute ホスト", memo: "trace route（経路をたどる）", role: "TTL を増やしながら経由するルーターを表示" },
    { opt: "tracepath ホスト", memo: "trace path", role: "同上（root 不要、MTU も表示）" }
  ]
},
{
  name: "ss / netstat", group: "ネットワーク",
  desc: "ソケット（接続）と待ち受けポートを表示する。ss は netstat の後継",
  keys: ["待ち受け", "リッスン", "ソケット"],
  ex: "ss -ltnp",
  rows: [
    { opt: "-a", memo: "all（すべて）", role: "接続中と待ち受けのすべて" },
    { opt: "-l", memo: "listening（待ち受け）", role: "待ち受け中のポートだけ" },
    { opt: "-n", memo: "numeric（数値）", role: "名前に変換せず数値で表示" },
    { opt: "-t / -u", memo: "tcp / udp", role: "TCP だけ／UDP だけ" },
    { opt: "-p", memo: "process（プロセス）", role: "PID とプログラム名も表示" },
    { opt: "netstat -r", memo: "route（経路）", role: "ルーティングテーブル（ss には無い）" }
  ]
},
{
  name: "nc", group: "ネットワーク",
  desc: "指定したホスト・ポートとデータをやりとりする（netcat）",
  keys: ["netcat"],
  ex: "nc -l 12345 > recv.txt",
  rows: [
    { opt: "nc ホスト ポート", memo: "connect（接続）", role: "相手に接続して標準入力を送る" },
    { opt: "-l", memo: "listen（待ち受け）", role: "指定ポートで待ち受ける" },
    { opt: "-p ポート", memo: "port", role: "ポート番号を指定" },
    { opt: "-u", memo: "udp", role: "TCP の代わりに UDP を使う" },
    { opt: "-z -v", memo: "zero-I/O / verbose", role: "データを送らずポートが開いているかだけ確認" }
  ]
},
{
  name: "host / dig / getent", group: "ネットワーク",
  desc: "名前解決（ホスト名 ⇔ IPアドレス）を問い合わせる",
  keys: ["名前解決", "逆引き", "正引き", "レコード"],
  ex: "dig @8.8.8.8 example.com mx",
  rows: [
    { opt: "host 名前 / host IP", memo: "host", role: "正引き／逆引き" },
    { opt: "host -t タイプ 名前", memo: "type（種類）", role: "a / aaaa / mx / ns などを指定" },
    { opt: "dig [@サーバー] 名前 [タイプ]", memo: "domain information groper", role: "DNS に詳しく問い合わせる" },
    { opt: "dig -x IP", memo: "reverse（逆）", role: "逆引き" },
    { opt: "getent hosts 名前", memo: "get entries（項目を取る）", role: "nsswitch.conf の順で /etc/hosts も含めて引く" },
    { opt: "nslookup 名前", memo: "name server lookup", role: "古くからある問い合わせコマンド" }
  ]
},

/* ========== ユーザー・グループ管理 ========== */
{
  name: "useradd / usermod / userdel", group: "ユーザー・グループ管理",
  desc: "ユーザーアカウントを追加・変更・削除する（root 権限）",
  keys: ["サブグループ", "プライマリグループ", "ユーザーを追加", "ユーザーを削除"],
  ex: "useradd -m -G wheel neko",
  rows: [
    { opt: "useradd -m", memo: "make home（作る）", role: "ホームディレクトリを作成（/etc/skel をコピー）" },
    { opt: "-g / -G", memo: "group / Groups（複数）", role: "プライマリグループ／サブグループ" },
    { opt: "-s / -d / -c / -u", memo: "shell / directory / comment / uid", role: "シェル／ホームの場所／コメント／UID" },
    { opt: "useradd -D", memo: "Defaults", role: "既定値を表示（/etc/default/useradd）" },
    { opt: "usermod -aG グループ", memo: "append（追加）", role: "サブグループに追加（-a が無いと置き換え）" },
    { opt: "usermod -L / -U", memo: "Lock / Unlock", role: "パスワードをロック／解除" },
    { opt: "userdel -r", memo: "remove（取り除く）", role: "ホームディレクトリも削除" }
  ]
},
{
  name: "groupadd / groupmod / groupdel / id / passwd", group: "ユーザー・グループ管理",
  desc: "グループの管理と、所属・パスワードの確認や変更",
  keys: ["グループ名", "パスワードをロック"],
  ex: "groupmod -n doubutsu animals",
  rows: [
    { opt: "groupadd グループ", memo: "add", role: "グループを追加（-g で GID）" },
    { opt: "groupmod -n 新 旧", memo: "new name", role: "グループ名を変更（-g で GID を変更）" },
    { opt: "groupdel グループ", memo: "delete", role: "グループを削除" },
    { opt: "id [ユーザー]", memo: "identity（身元）", role: "UID・GID・所属グループを表示" },
    { opt: "passwd [ユーザー]", memo: "password", role: "パスワードを変更（省略で自分）" },
    { opt: "passwd -l / -u", memo: "lock / unlock", role: "パスワードをロック／解除" }
  ]
},

/* ========== ジョブ・時刻・ロケール ========== */
{
  name: "crontab", group: "ジョブ・時刻・ロケール",
  desc: "定期的に実行するジョブ（cron）を登録する。書式は 分 時 日 月 曜日 コマンド",
  keys: ["cron", "毎週", "毎日"],
  ex: "30 9 * * 1 /root/backup.sh",
  rows: [
    { opt: "-e", memo: "edit（編集）", role: "crontab を編集" },
    { opt: "-l", memo: "list（一覧）", role: "登録内容を表示" },
    { opt: "-r", memo: "remove（削除）", role: "すべて削除（-i で確認してから）" },
    { opt: "-u ユーザー", memo: "user", role: "他のユーザーの crontab を操作（root）" },
    { opt: "* , - /", memo: "（記号）", role: "すべて／列挙／範囲／間隔（*/15 は15ごと）" }
  ]
},
{
  name: "at / atq / atrm", group: "ジョブ・時刻・ロケール",
  desc: "1回だけ実行するジョブを予約する",
  keys: ["1回だけ"],
  ex: "at -f backup.sh 22:00",
  rows: [
    { opt: "at 時刻", memo: "at（〜に）", role: "対話モードで入力し Ctrl+D で登録" },
    { opt: "at -f ファイル 時刻", memo: "file", role: "ファイルに書いたコマンドを予約" },
    { opt: "atq（at -l）", memo: "queue（待ち行列）", role: "予約の一覧" },
    { opt: "atrm 番号（at -d）", memo: "remove", role: "予約を削除" },
    { opt: "now + 10 minutes", memo: "（時刻の書き方）", role: "22:00、tomorrow、noon などとも書ける" }
  ]
},
{
  name: "locale / localectl / iconv", group: "ジョブ・時刻・ロケール",
  desc: "ロケールの確認・設定と、文字コードの変換",
  keys: ["ロケール", "文字コード"],
  ex: "iconv -f SHIFT_JIS -t UTF-8 a.txt > b.txt",
  rows: [
    { opt: "locale", memo: "locale（地域）", role: "今のロケール設定を表示" },
    { opt: "locale -a", memo: "all", role: "使えるロケールの一覧" },
    { opt: "localectl set-locale LANG=ja_JP.UTF-8", memo: "control", role: "システムのロケールを設定（systemd）" },
    { opt: "iconv -f 元 -t 先", memo: "from / to", role: "文字コードを変換" },
    { opt: "iconv -l", memo: "list", role: "扱える文字コードの一覧" },
    { opt: "LANG=C コマンド", memo: "C（標準）", role: "そのコマンドだけ英語の標準形式で動かす" }
  ]
},
{
  name: "date / hwclock / timedatectl", group: "ジョブ・時刻・ロケール",
  desc: "システムクロック・ハードウェアクロック・タイムゾーンを扱う",
  keys: ["システムクロック", "ハードウェアクロック", "タイムゾーン"],
  ex: "timedatectl set-timezone Asia/Tokyo",
  rows: [
    { opt: "date [+書式]", memo: "date（日付）", role: "日時を表示（%Y %m %d %H %M）" },
    { opt: "date MMDDhhmmCCYY.ss", memo: "（並び順）", role: "日時を設定（root）" },
    { opt: "hwclock -r（--show）", memo: "read", role: "ハードウェアクロックを表示" },
    { opt: "hwclock -w（--systohc）", memo: "system to hardware clock", role: "システム → ハードウェア" },
    { opt: "hwclock -s（--hctosys）", memo: "hardware clock to system", role: "ハードウェア → システム" },
    { opt: "timedatectl set-timezone 地域", memo: "set", role: "タイムゾーンを設定（list-timezones で一覧）" },
    { opt: "timedatectl set-ntp yes", memo: "ntp", role: "NTP による自動同期を有効" }
  ]
},
{
  name: "chronyc / ntpdate", group: "ジョブ・時刻・ロケール",
  desc: "NTP で時刻を合わせる・同期状態を確認する",
  keys: ["chrony", "ntp サーバー", "ntpサーバー"],
  ex: "chronyc sources",
  rows: [
    { opt: "chronyc sources", memo: "sources（情報源）", role: "参照している NTP サーバーの一覧" },
    { opt: "chronyc tracking", memo: "tracking（追跡）", role: "現在の同期状態" },
    { opt: "chronyc makestep", memo: "make step（一気に）", role: "時刻を一気に合わせる" },
    { opt: "ntpdate サーバー", memo: "（ntp + date）", role: "一度だけ時刻を合わせる" },
    { opt: "ntpq -p", memo: "query / peers", role: "ntpd が参照しているサーバーの状態" }
  ]
},

/* ========== ログ・メール ========== */
{
  name: "journalctl / logger", group: "ログ・メール",
  desc: "systemd のジャーナルを読む／ログを手動で送る",
  keys: ["ジャーナル", "journald"],
  ex: "journalctl -u sshd -b",
  rows: [
    { opt: "journalctl -u ユニット", memo: "unit", role: "特定のサービスのログ" },
    { opt: "journalctl -b [-1]", memo: "boot（起動）", role: "今回（-1 で前回）の起動以降" },
    { opt: "journalctl -f", memo: "follow（追う）", role: "追いかけて表示" },
    { opt: "journalctl -p err", memo: "priority（重要度）", role: "重要度で絞り込む" },
    { opt: "journalctl --since / --until", memo: "since / until", role: "期間を指定" },
    { opt: "logger -p 施設.重要度 -t タグ 文", memo: "logger（記録係）", role: "ログを手動で送る（テスト用）" }
  ]
},
{
  name: "mailq / newaliases / mail", group: "ログ・メール",
  desc: "メールキューの確認とエイリアスの反映",
  keys: ["メールキュー", "/etc/aliases"],
  ex: "newaliases",
  rows: [
    { opt: "mailq", memo: "mail queue", role: "送信待ちのメールを表示（sendmail -bp）" },
    { opt: "newaliases", memo: "new aliases", role: "/etc/aliases の変更を反映" },
    { opt: "mail -s 件名 宛先", memo: "subject（件名）", role: "簡単なメールを送る" },
    { opt: "~/.forward", memo: "forward（転送）", role: "個人の転送先を書くファイル" }
  ]
},

/* ========== セキュリティ ========== */
{
  name: "chage", group: "セキュリティ",
  desc: "パスワードとアカウントの有効期限を表示・設定する（change age）",
  keys: ["有効期限"],
  ex: "chage -M 30 testuser",
  rows: [
    { opt: "-l", memo: "list", role: "期限の情報を表示" },
    { opt: "-m / -M", memo: "min / Max", role: "変更できるまでの最短日数／最長有効日数" },
    { opt: "-W", memo: "Warn（警告）", role: "期限切れの何日前から警告するか" },
    { opt: "-I", memo: "Inactive（無効）", role: "期限切れから何日でロックするか" },
    { opt: "-E 日付", memo: "Expire（失効）", role: "アカウントを無効にする日" },
    { opt: "-d 0", memo: "date（最終変更日）", role: "次回ログイン時にパスワード変更を強制" }
  ]
},
{
  name: "lsof / fuser / nmap", group: "セキュリティ",
  desc: "開いているポートと、それを使うプロセスを調べる",
  keys: ["ポートスキャン", "開いているポート"],
  ex: "lsof -i :22",
  rows: [
    { opt: "lsof -i [:ポート]", memo: "list open files（開いたファイル一覧）", role: "ネットワークを開いているプロセス" },
    { opt: "fuser -n tcp 番号（番号/tcp）", memo: "file user", role: "そのポートを使う PID（-k で終了）" },
    { opt: "nmap ホスト", memo: "network mapper", role: "外から開いているポートを調べる" }
  ]
},
{
  name: "who / w / last / ulimit", group: "セキュリティ",
  desc: "ログイン状況の確認と、リソースの制限",
  keys: ["ログイン中", "ログイン履歴", "リソース"],
  ex: "last neko",
  rows: [
    { opt: "who", memo: "who（誰）", role: "ログイン中のユーザー" },
    { opt: "w", memo: "what（何を）", role: "ログイン中のユーザーと実行中の処理" },
    { opt: "last [ユーザー]", memo: "last（最後の）", role: "ログイン履歴（/var/log/wtmp）" },
    { opt: "lastb / lastlog", memo: "bad / log", role: "失敗したログイン／最終ログイン" },
    { opt: "ulimit -a", memo: "all", role: "制限の一覧" },
    { opt: "ulimit -u / -n / -f / -c", memo: "user procs / number / file / core", role: "プロセス数／ファイル数／ファイルサイズ／コアファイル" }
  ]
},
{
  name: "su / sudo / visudo", group: "セキュリティ",
  desc: "root など別のユーザーの権限で作業する",
  keys: ["root権限", "/etc/sudoers"],
  ex: "sudo -l",
  rows: [
    { opt: "su -", memo: "substitute user（ログインシェル）", role: "root の環境に切り替える（root のパスワード）" },
    { opt: "sudo コマンド", memo: "superuser do", role: "許可されたコマンドを root 権限で実行（自分のパスワード）" },
    { opt: "sudo -l", memo: "list", role: "許可されているコマンドを表示" },
    { opt: "sudo -u ユーザー", memo: "user", role: "root 以外のユーザーとして実行" },
    { opt: "sudo -i / -s", memo: "login / shell", role: "対象ユーザーのログインシェル／シェルを起動" },
    { opt: "visudo", memo: "vi + sudo", role: "/etc/sudoers を文法チェック付きで編集" }
  ]
},
{
  name: "ssh-keygen / ssh-add / scp", group: "セキュリティ",
  desc: "SSH の鍵の作成・登録と、SSH でのファイル転送",
  keys: ["authorized_keys", "known_hosts", "ポート転送"],
  ex: "scp /etc/hosts server1:/tmp",
  rows: [
    { opt: "ssh-keygen -t ed25519", memo: "key generate", role: "鍵ペアを作る（rsa・ecdsa も可）" },
    { opt: "ssh-copy-id ユーザー@ホスト", memo: "copy id", role: "公開鍵を相手の authorized_keys に登録" },
    { opt: "ssh-agent / ssh-add", memo: "agent（代理人）/ add", role: "秘密鍵を預かる常駐プログラム／そこへ登録" },
    { opt: "scp 元 先", memo: "secure copy", role: "SSH でコピー（ホスト:パス、-r、-P ポート）" },
    { opt: "ssh -L 自ポート:先:先ポート ホスト", memo: "Local forward", role: "ポート転送" }
  ]
},
{
  name: "gpg", group: "セキュリティ",
  desc: "GnuPG で暗号化・復号・署名をする",
  keys: ["gnupg"],
  ex: "gpg -e -r alice secret.txt",
  rows: [
    { opt: "--gen-key", memo: "generate key", role: "鍵ペアを作る" },
    { opt: "--import / --export -a", memo: "import / export", role: "公開鍵の取り込み／書き出し" },
    { opt: "-e -r 相手", memo: "encrypt / recipient", role: "相手の公開鍵で暗号化" },
    { opt: "-d", memo: "decrypt", role: "自分の秘密鍵で復号" },
    { opt: "--sign / --verify", memo: "sign / verify", role: "署名／署名の検証" }
  ]
},
{
  name: "firewall-cmd / iptables", group: "セキュリティ",
  desc: "ファイアウォールの設定（実際の処理はカーネルの netfilter）",
  keys: ["ファイアウォール", "firewalld"],
  ex: "firewall-cmd --add-service=http --permanent",
  rows: [
    { opt: "firewall-cmd --list-all", memo: "list", role: "今のゾーンの設定を表示" },
    { opt: "--add-service=名前 --permanent", memo: "permanent（恒久的）", role: "サービスを許可（--reload で反映）" },
    { opt: "iptables -L", memo: "List", role: "ルールの一覧" },
    { opt: "ACCEPT / DROP / REJECT", memo: "（動作）", role: "許可／黙って破棄／拒否を返す" }
  ]
}

]);
