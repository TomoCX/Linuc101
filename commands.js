/* =======================================================================
   コマンドオプション早見表（ヘルプパネル用データ）
   -----------------------------------------------------------------------
   name  : コマンド名
   group : 表示グループ
   desc  : コマンドの概要
   keys  : （任意）出題中の問題と結び付けるための日本語キーワード
   ex    : 典型的な使用例
   rows  : [{ opt: 入力するもの, memo: 覚え方（英単語）, role: 実際の役割 }]
   ======================================================================= */

const HELP_GROUPS = [
  "ファイル・ディレクトリ操作",
  "アーカイブ・圧縮",
  "テキスト処理",
  "検索・正規表現",
  "プロセス管理",
  "シェル・環境変数",
  "パッケージ管理",
  "ハードウェア・カーネルモジュール",
  "ディスク・ファイルシステム",
  "システム管理・起動",
  "vi エディタ",
  /* ---- 102 ---- */
  "シェルスクリプト",
  "ネットワーク",
  "ユーザー・グループ管理",
  "ジョブ・時刻・ロケール",
  "ログ・メール",
  "セキュリティ"
];

// 102 の範囲のグループ（学習中の試験のコマンドを先に並べるのに使う）
const HELP_GROUPS_102 = ["シェルスクリプト", "ネットワーク", "ユーザー・グループ管理", "ジョブ・時刻・ロケール", "ログ・メール", "セキュリティ"];
function helpGroupExam(group) { return HELP_GROUPS_102.includes(group) ? "102" : "101"; }

const COMMAND_HELP = [

/* ========== ファイル・ディレクトリ操作 ========== */
{
  name: "ls", group: "ファイル・ディレクトリ操作",
  desc: "ファイルとディレクトリの一覧を表示する",
  ex: "ls -lah /etc",
  rows: [
    { opt: "-l", memo: "long（長い形式）",        role: "パーミッション・所有者・サイズ・日時を1行で詳細表示" },
    { opt: "-a", memo: "all（すべて）",            role: "「.」で始まる隠しファイルも表示" },
    { opt: "-h", memo: "human-readable（人が読める）", role: "サイズをK/M/Gの単位で表示（-lと併用）" },
    { opt: "-R", memo: "Recursive（再帰的）",      role: "サブディレクトリの中まで辿って表示" },
    { opt: "-t", memo: "time（時刻）",             role: "更新時刻の新しい順に並べる" },
    { opt: "-r", memo: "reverse（逆）",            role: "並び順を逆にする" },
    { opt: "-S", memo: "Size（サイズ）",           role: "ファイルサイズの大きい順に並べる" },
    { opt: "-d", memo: "directory（ディレクトリ自身）", role: "中身ではなくディレクトリ自体の情報を表示" },
    { opt: "-i", memo: "inode（iノード）",         role: "iノード番号を表示（ハードリンクの確認に使う）" },
    { opt: "-F", memo: "File type（種類）",        role: "末尾に / * @ などの記号を付けて種類を示す" }
  ]
},
{
  name: "cp", group: "ファイル・ディレクトリ操作",
  desc: "ファイル・ディレクトリをコピーする",
  ex: "cp -a /var/www /backup/",
  rows: [
    { opt: "-r / -R", memo: "recursive（再帰的）", role: "ディレクトリを中身ごとコピー" },
    { opt: "-p", memo: "preserve（保つ）",          role: "所有者・パーミッション・タイムスタンプを保持" },
    { opt: "-a", memo: "archive（保管）",           role: "-dR --preserve=all 相当。丸ごとそのままコピー" },
    { opt: "-i", memo: "interactive（対話的）",     role: "上書き前に確認する" },
    { opt: "-f", memo: "force（強制）",             role: "確認せず強制的に上書き" },
    { opt: "-u", memo: "update（更新）",            role: "コピー先が古いときだけ上書き" },
    { opt: "-l", memo: "link（リンク）",            role: "コピーせずハードリンクを作る" },
    { opt: "-s", memo: "symbolic（シンボリック）",  role: "コピーせずシンボリックリンクを作る" }
  ]
},
{
  name: "mv / rm / mkdir / rmdir", group: "ファイル・ディレクトリ操作",
  desc: "移動・削除・ディレクトリ作成",
  ex: "mkdir -p /tmp/a/b/c",
  rows: [
    { opt: "mv -i", memo: "interactive（対話的）", role: "移動先が存在するとき確認する" },
    { opt: "mv -n", memo: "no-clobber（壊さない）", role: "既存ファイルを上書きしない" },
    { opt: "rm -r", memo: "recursive（再帰的）",   role: "ディレクトリを中身ごと削除" },
    { opt: "rm -f", memo: "force（強制）",         role: "確認せず、存在しなくてもエラーにしない" },
    { opt: "rm -i", memo: "interactive（対話的）", role: "1つずつ削除確認する" },
    { opt: "mkdir -p", memo: "parents（親も）",    role: "途中の親ディレクトリもまとめて作成" },
    { opt: "mkdir -m", memo: "mode（モード）",     role: "パーミッションを指定して作成" },
    { opt: "rmdir -p", memo: "parents（親も）",    role: "空になった親ディレクトリも削除" }
  ]
},
{
  name: "ln", group: "ファイル・ディレクトリ操作",
  keys: ["ハードリンク", "シンボリックリンク"],
  desc: "リンクを作成する（ln リンク先 リンク名）",
  ex: "ln -s /etc/nginx/nginx.conf ~/nginx.conf",
  rows: [
    { opt: "（なし）", memo: "hard link（ハードリンク）", role: "同じiノードへの別名。同一ファイルシステム内のみ" },
    { opt: "-s", memo: "symbolic（象徴的な＝別名）", role: "パスを指すシンボリックリンクを作る。別FS・ディレクトリも可" },
    { opt: "-f", memo: "force（強制）",            role: "同名のリンクがあれば削除して作り直す" },
    { opt: "-n", memo: "no-dereference（辿らない）", role: "リンク先ディレクトリの中に作らず、リンク自身を置き換える" }
  ]
},
{
  name: "chmod", group: "ファイル・ディレクトリ操作",
  keys: ["パーミッション", "アクセス権", "SUID", "SGID", "スティッキー"],
  desc: "パーミッション（アクセス権）を変更する",
  ex: "chmod 4755 /usr/bin/passwd　/　chmod u+s file",
  rows: [
    { opt: "u / g / o / a", memo: "user / group / other / all", role: "所有者／グループ／その他／全員を対象に指定" },
    { opt: "+ / - / =", memo: "add / remove / set", role: "権限を追加／削除／その値に設定" },
    { opt: "r / w / x", memo: "read / write / execute", role: "読み取り(4)／書き込み(2)／実行(1)" },
    { opt: "4---", memo: "SUID", role: "実行時にファイル所有者の権限で動く（chmod u+s）" },
    { opt: "2---", memo: "SGID", role: "実行時に所有グループ権限／ディレクトリではグループを継承（g+s）" },
    { opt: "1---", memo: "sTicky（粘着）", role: "所有者以外がファイルを削除できない（+t、/tmpで使用）" },
    { opt: "-R", memo: "Recursive（再帰的）", role: "ディレクトリ以下すべてに適用" }
  ]
},
{
  name: "chown / chgrp / umask", group: "ファイル・ディレクトリ操作",
  desc: "所有者・所有グループの変更とデフォルト権限",
  ex: "chown -R user1:staff /srv/data　/　umask 022",
  rows: [
    { opt: "chown ユーザ:グループ", memo: "change owner（所有者を変える）", role: "所有者と所有グループを同時に変更" },
    { opt: "chown :グループ", memo: "コロンのみ", role: "グループだけを変更（chgrp と同じ）" },
    { opt: "-R", memo: "Recursive（再帰的）", role: "ディレクトリ以下すべてに適用" },
    { opt: "umask 022", memo: "mask（覆い隠す）", role: "新規作成時に取り除く権限。ファイル666-022=644、ディレクトリ777-022=755" },
    { opt: "umask -S", memo: "Symbolic（記号で）", role: "rwxr-xr-x のような記号表記で表示" }
  ]
},
{
  name: "touch / file / stat", group: "ファイル・ディレクトリ操作",
  desc: "タイムスタンプ更新とファイル情報の確認",
  ex: "touch -t 202601011200 file",
  rows: [
    { opt: "touch（オプションなし）", memo: "touch（触る）", role: "タイムスタンプを現在時刻に更新。無ければ空ファイル作成" },
    { opt: "touch -t", memo: "time（時刻）", role: "[[CC]YY]MMDDhhmm 形式で日時を指定" },
    { opt: "touch -a / -m", memo: "access / modify", role: "アクセス時刻のみ／更新時刻のみを変更" },
    { opt: "touch -r", memo: "reference（参照）", role: "別のファイルと同じタイムスタンプにする" },
    { opt: "touch -c", memo: "no-create（作らない）", role: "存在しないときファイルを作成しない" },
    { opt: "file", memo: "file type（種類）", role: "中身から種類（テキスト/ELF/gzipなど）を判定" },
    { opt: "stat", memo: "status（状態）", role: "iノード番号・サイズ・3種のタイムスタンプを表示" }
  ]
},

/* ========== アーカイブ・圧縮 ========== */
{
  name: "tar", group: "アーカイブ・圧縮",
  desc: "複数ファイルを1つにまとめる／展開する",
  ex: "tar czvf backup.tar.gz /home　/　tar xJvf src.tar.xz",
  rows: [
    { opt: "-c", memo: "create（作成）",   role: "新しいアーカイブを作成する" },
    { opt: "-x", memo: "extract（取り出す）", role: "アーカイブを展開する" },
    { opt: "-t", memo: "table of contents（目次）", role: "展開せず中身の一覧を表示する" },
    { opt: "-f", memo: "file（ファイル名）", role: "対象アーカイブのファイル名を指定（必須。最後に書く）" },
    { opt: "-v", memo: "verbose（おしゃべり）", role: "処理中のファイル名を表示する" },
    { opt: "-z", memo: "gZip（gzip）",     role: "gzip で圧縮／展開する（.tar.gz .tgz）" },
    { opt: "-j", memo: "bzip2（bzip2のj）", role: "bzip2 で圧縮／展開する（.tar.bz2）" },
    { opt: "-J", memo: "xz（大文字のJ）",  role: "xz で圧縮／展開する（.tar.xz）" },
    { opt: "-r", memo: "append（追加）",   role: "既存アーカイブにファイルを追加する" },
    { opt: "-u", memo: "update（更新）",   role: "新しいファイルだけ追加更新する" },
    { opt: "-C", memo: "Change directory（移動）", role: "指定ディレクトリへ移動してから処理する" },
    { opt: "-p", memo: "preserve（保つ）", role: "パーミッションを保持して展開する" }
  ]
},
{
  name: "gzip / bzip2 / xz", group: "アーカイブ・圧縮",
  desc: "単一ファイルの圧縮・展開",
  ex: "gzip -9 log.txt　/　gunzip log.txt.gz",
  rows: [
    { opt: "-d", memo: "decompress（展開）", role: "圧縮を解除する（gunzip / bunzip2 / unxz と同じ）" },
    { opt: "-c", memo: "to Console（画面へ）", role: "結果を標準出力へ出す（元ファイルを残せる）" },
    { opt: "-k", memo: "keep（残す）", role: "元のファイルを削除せず残す" },
    { opt: "-r", memo: "recursive（再帰的）", role: "ディレクトリ内のファイルをまとめて圧縮（gzip）" },
    { opt: "-1 〜 -9", memo: "1=fast, 9=best", role: "圧縮率の指定。9が最高圧縮・低速" },
    { opt: "-l", memo: "list（一覧）", role: "圧縮前後のサイズと圧縮率を表示（gzip）" },
    { opt: "-t", memo: "test（検査）", role: "圧縮ファイルが壊れていないか検査する" }
  ]
},
{
  name: "cpio / dd", group: "アーカイブ・圧縮",
  desc: "標準入力からのアーカイブ／ブロック単位のコピー",
  ex: "find . | cpio -o > a.cpio　/　dd if=/dev/sda of=disk.img bs=4M",
  rows: [
    { opt: "cpio -o", memo: "output（出力）", role: "アーカイブを作成する（コピーアウト）" },
    { opt: "cpio -i", memo: "input（入力）", role: "アーカイブを展開する（コピーイン）" },
    { opt: "cpio -t", memo: "table（一覧）", role: "中身の一覧を表示する" },
    { opt: "cpio -d", memo: "directory（ディレクトリ）", role: "必要なディレクトリを作りながら展開" },
    { opt: "dd if=", memo: "input file（入力元）", role: "読み込み元のファイル／デバイス" },
    { opt: "dd of=", memo: "output file（出力先）", role: "書き込み先のファイル／デバイス" },
    { opt: "dd bs=", memo: "block size（ブロックサイズ）", role: "一度に読み書きするサイズ（例 bs=4M）" },
    { opt: "dd count=", memo: "count（回数）", role: "処理するブロック数を指定" }
  ]
},

/* ========== テキスト処理 ========== */
{
  name: "cat / head / tail", group: "テキスト処理",
  desc: "ファイルの表示・先頭・末尾の抽出",
  ex: "tail -f /var/log/syslog",
  rows: [
    { opt: "cat -n", memo: "number（番号）", role: "全行に行番号を付ける" },
    { opt: "cat -b", memo: "number-nonblank（空行以外）", role: "空行を除いて行番号を付ける" },
    { opt: "cat -s", memo: "squeeze（絞る）", role: "連続する空行を1行にまとめる" },
    { opt: "cat -A", memo: "show-All（全部見せる）", role: "タブや改行など不可視文字を表示" },
    { opt: "head -n 5", memo: "number of lines（行数）", role: "先頭5行を表示" },
    { opt: "tail -n 5", memo: "number of lines（行数）", role: "末尾5行を表示" },
    { opt: "tail -f", memo: "follow（追いかける）", role: "追記を監視してリアルタイム表示（ログ監視）" },
    { opt: "-c", memo: "characters/bytes（バイト）", role: "行ではなくバイト数で切り出す" }
  ]
},
{
  name: "sort / uniq / wc", group: "テキスト処理",
  desc: "並べ替え・重複処理・カウント",
  ex: "cut -d: -f7 /etc/passwd | sort | uniq -c | sort -nr",
  rows: [
    { opt: "sort -n", memo: "numeric（数値）", role: "文字列でなく数値として比較する" },
    { opt: "sort -r", memo: "reverse（逆）", role: "降順に並べる" },
    { opt: "sort -k 3", memo: "key（キー）", role: "3番目のフィールドをキーにして並べる" },
    { opt: "sort -t:", memo: "terminator（区切り）", role: "フィールドの区切り文字を指定" },
    { opt: "sort -u", memo: "unique（一意）", role: "重複行を1つにまとめる" },
    { opt: "sort -f", memo: "fold case（大小同一視）", role: "大文字小文字を区別しない" },
    { opt: "uniq -c", memo: "count（数える）", role: "連続する重複行の出現回数を先頭に付ける" },
    { opt: "uniq -d", memo: "duplicated（重複）", role: "重複した行だけを表示" },
    { opt: "uniq -u", memo: "unique（唯一）", role: "重複していない行だけを表示" },
    { opt: "wc -l", memo: "lines（行）", role: "行数を数える" },
    { opt: "wc -w", memo: "words（単語）", role: "単語数を数える" },
    { opt: "wc -c / -m", memo: "characters / multibyte", role: "バイト数／文字数を数える" }
  ]
},
{
  name: "cut / paste / join / tr", group: "テキスト処理",
  desc: "列の切り出し・結合・文字変換",
  ex: "cut -d: -f1,7 /etc/passwd",
  rows: [
    { opt: "cut -d:", memo: "delimiter（区切り）", role: "フィールドの区切り文字を指定（既定はタブ）" },
    { opt: "cut -f 1,3", memo: "field（フィールド）", role: "1番目と3番目のフィールドを取り出す" },
    { opt: "cut -c 5-10", memo: "character（文字位置）", role: "5〜10文字目を取り出す" },
    { opt: "paste -d", memo: "delimiter（区切り）", role: "行を横に連結するときの区切り文字" },
    { opt: "paste -s", memo: "serial（直列）", role: "ファイルごとに1行へ連結する" },
    { opt: "join -j 2", memo: "join field（結合キー）", role: "共通フィールドで2つのファイルを結合" },
    { opt: "tr 'a-z' 'A-Z'", memo: "translate（変換）", role: "文字を1対1で置き換える（標準入力のみ）" },
    { opt: "tr -d", memo: "delete（削除）", role: "指定した文字を削除する" },
    { opt: "tr -s", memo: "squeeze（圧縮）", role: "連続する同じ文字を1つにまとめる" }
  ]
},
{
  name: "sed", group: "テキスト処理",
  desc: "ストリームエディタ。行単位の置換・削除・抽出",
  ex: "sed -i 's/old/new/g' file.txt　/　sed -n '10,20p' file",
  rows: [
    { opt: "s/A/B/", memo: "substitute（置換）", role: "各行の最初のAをBに置換する" },
    { opt: "s/A/B/g", memo: "global（全体）", role: "行内すべてのAをBに置換する" },
    { opt: "-n", memo: "no auto print（自動表示しない）", role: "p と組み合わせて必要な行だけ表示" },
    { opt: "p", memo: "print（表示）", role: "その行を出力する" },
    { opt: "d", memo: "delete（削除）", role: "その行を削除する" },
    { opt: "-e", memo: "expression（式）", role: "複数のコマンドを続けて指定する" },
    { opt: "-i", memo: "in-place（その場で）", role: "ファイル自体を直接書き換える" },
    { opt: "-f", memo: "file（スクリプトファイル）", role: "編集コマンドを書いたファイルを読み込む" }
  ]
},
{
  name: "xargs / tee / split / od / nl", group: "テキスト処理",
  desc: "パイプ周辺のユーティリティ",
  ex: "find . -name '*.log' -print0 | xargs -0 rm",
  rows: [
    { opt: "xargs -n 2", memo: "number（個数）", role: "一度に渡す引数の数を指定" },
    { opt: "xargs -I {}", memo: "Interpret（置き換え）", role: "{} の位置に受け取った値を差し込む" },
    { opt: "xargs -0", memo: "null（NUL区切り）", role: "find -print0 と組み合わせ、空白入りの名前に対応" },
    { opt: "xargs -p", memo: "prompt（確認）", role: "実行前に確認する" },
    { opt: "tee -a", memo: "append（追記）", role: "画面表示しつつファイルへ追記（既定は上書き）" },
    { opt: "split -l 1000", memo: "lines（行）", role: "1000行ごとにファイルを分割" },
    { opt: "split -b 10M", memo: "bytes（バイト）", role: "10MBごとにファイルを分割" },
    { opt: "od -c", memo: "character（文字）", role: "バイナリを文字表現で表示" },
    { opt: "od -x", memo: "heXadecimal（16進）", role: "16進数で表示" },
    { opt: "nl", memo: "number lines（行番号）", role: "行番号を付けて表示" }
  ]
},

/* ========== 検索・正規表現 ========== */
{
  name: "grep", group: "検索・正規表現",
  desc: "ファイルや標準入力からパターンに一致する行を探す",
  ex: "grep -rin 'error' /var/log",
  rows: [
    { opt: "-i", memo: "ignore case（無視する）", role: "大文字と小文字を区別しない" },
    { opt: "-v", memo: "inVert（反転）", role: "一致しない行を表示する" },
    { opt: "-c", memo: "count（数える）", role: "一致した行数だけを表示" },
    { opt: "-n", memo: "number（行番号）", role: "行番号を付けて表示" },
    { opt: "-l", memo: "files with match（ファイル名）", role: "一致したファイル名だけを表示" },
    { opt: "-r / -R", memo: "recursive（再帰的）", role: "ディレクトリ以下を辿って検索" },
    { opt: "-w", memo: "word（単語）", role: "単語として完全一致する行のみ" },
    { opt: "-x", memo: "eXact line（行全体）", role: "行全体が一致するもののみ" },
    { opt: "-E", memo: "Extended regexp（拡張正規表現）", role: "+ ? | ( ) をそのまま使える（egrep 相当）" },
    { opt: "-F", memo: "Fixed string（固定文字列）", role: "正規表現として解釈しない（fgrep 相当）" },
    { opt: "-o", memo: "only matching（一致部分のみ）", role: "行全体でなく一致した部分だけ表示" },
    { opt: "-A / -B / -C 3", memo: "After / Before / Context", role: "一致行の後／前／前後3行も表示" }
  ]
},
{
  name: "正規表現（メタ文字）", group: "検索・正規表現",
  keys: ["正規表現", "メタ文字"],
  desc: "grep / sed / vi などで共通して使うパターン記法",
  ex: "grep -E '^(root|admin):' /etc/passwd",
  rows: [
    { opt: "^", memo: "行の頭（キャレットは上向き）", role: "行頭に一致（^root で root で始まる行）" },
    { opt: "$", memo: "行の終わり（お金は最後）", role: "行末に一致（bash$ で bash で終わる行）" },
    { opt: ".", memo: "any one（任意の1文字）", role: "改行以外の任意の1文字に一致" },
    { opt: "*", memo: "0回以上の繰り返し", role: "直前の文字の0回以上の繰り返し（ab* は a, ab, abb…）" },
    { opt: "+", memo: "1回以上（拡張正規表現）", role: "直前の文字の1回以上の繰り返し" },
    { opt: "?", memo: "0か1回（拡張正規表現）", role: "直前の文字があってもなくてもよい" },
    { opt: "[abc]", memo: "class（文字クラス）", role: "括弧内のいずれか1文字に一致（[^abc] は否定）" },
    { opt: "{n,m}", memo: "n〜m回", role: "直前の文字のn回以上m回以下の繰り返し" },
    { opt: "|", memo: "or（または）", role: "いずれかに一致（拡張正規表現）" },
    { opt: "\\", memo: "escape（打ち消し）", role: "メタ文字を通常の文字として扱う" }
  ]
},
{
  name: "find", group: "検索・正規表現",
  desc: "条件を指定してファイルを検索する（find パス 条件 アクション）",
  ex: "find /var/log -name '*.log' -mtime +30 -delete",
  rows: [
    { opt: "-name", memo: "name（名前）", role: "ファイル名で検索（-iname は大小無視）" },
    { opt: "-type f / d / l", memo: "file / directory / link", role: "通常ファイル／ディレクトリ／シンボリックリンク" },
    { opt: "-size +100M", memo: "size（サイズ）", role: "+は「より大きい」、-は「より小さい」、無印はちょうど" },
    { opt: "-mtime +7", memo: "modify time（更新時刻）", role: "7日より前に更新されたもの（-は「以内」）" },
    { opt: "-atime / -ctime", memo: "access / change time", role: "最終アクセス時刻／iノード情報の変更時刻" },
    { opt: "-perm 644", memo: "permission（権限）", role: "パーミッションで検索（-perm -u+s でSUID）" },
    { opt: "-user / -group", memo: "user / group", role: "所有者／所有グループで検索" },
    { opt: "-maxdepth 2", memo: "max depth（深さ上限）", role: "辿るディレクトリ階層の深さを制限" },
    { opt: "-exec … \\;", memo: "execute（実行）", role: "見つかった各ファイルにコマンドを実行（{} がファイル名）" },
    { opt: "-delete", memo: "delete（削除）", role: "見つかったファイルを削除する" },
    { opt: "-print0", memo: "NUL区切りで出力", role: "xargs -0 と組み合わせ、空白入りの名前に対応" }
  ]
},
{
  name: "which / whereis / type / man", group: "検索・正規表現",
  desc: "コマンドの所在とマニュアルを調べる",
  ex: "man 5 passwd　/　man -k network",
  rows: [
    { opt: "which", memo: "which one?（どれ？）", role: "PATH の中から実行ファイルの絶対パスを表示" },
    { opt: "whereis", memo: "where is?（どこ？）", role: "バイナリ・ソース・マニュアルの場所をまとめて表示" },
    { opt: "type", memo: "type（種別）", role: "エイリアス／シェル組み込み／外部コマンドの区別を表示" },
    { opt: "man 1 / 5 / 8", memo: "section（章）", role: "1=ユーザコマンド、5=設定ファイル、8=管理コマンド" },
    { opt: "man -k", memo: "keyword（キーワード）", role: "キーワードでマニュアルを検索（apropos と同じ）" },
    { opt: "man -f", memo: "whatis（何者か）", role: "コマンドの1行説明を表示（whatis と同じ）" }
  ]
},

/* ========== プロセス管理 ========== */
{
  name: "ps", group: "プロセス管理",
  desc: "実行中プロセスの一覧を表示する",
  ex: "ps aux | grep nginx　/　ps -ef",
  rows: [
    { opt: "a", memo: "all users（全ユーザ）", role: "BSD形式。他ユーザのプロセスも表示" },
    { opt: "u", memo: "user oriented（ユーザ視点）", role: "BSD形式。CPU/メモリ使用率など詳細表示" },
    { opt: "x", memo: "no tty（端末なしも）", role: "BSD形式。端末を持たないデーモンも表示" },
    { opt: "-e", memo: "every（すべて）", role: "System V形式。全プロセスを表示" },
    { opt: "-f", memo: "full（完全）", role: "System V形式。親PIDやコマンドライン全体を表示" },
    { opt: "-l", memo: "long（長い形式）", role: "優先度(PRI)やnice値(NI)も表示" },
    { opt: "--sort", memo: "sort（並べ替え）", role: "指定項目で並べ替え（例 --sort=-%mem）" }
  ]
},
{
  name: "kill / killall / pkill / pgrep", group: "プロセス管理",
  desc: "プロセスにシグナルを送る",
  ex: "kill -9 1234　/　pkill -u user1 httpd",
  rows: [
    { opt: "-1 (SIGHUP)", memo: "HangUP（回線切断）", role: "設定ファイルの再読み込みに使われることが多い" },
    { opt: "-2 (SIGINT)", memo: "INTerrupt（割り込み）", role: "Ctrl+C と同じ。中断要求" },
    { opt: "-9 (SIGKILL)", memo: "KILL（強制終了）", role: "捕捉・無視できない強制終了。最後の手段" },
    { opt: "-15 (SIGTERM)", memo: "TERMinate（終了）", role: "既定のシグナル。後始末をして正常終了させる" },
    { opt: "-l", memo: "list（一覧）", role: "使用できるシグナルの一覧を表示" },
    { opt: "killall 名前", memo: "kill all（全部）", role: "同名のプロセスをまとめて終了" },
    { opt: "pkill -u", memo: "process kill（user指定）", role: "ユーザや名前の部分一致でシグナルを送る" },
    { opt: "pgrep -l", memo: "process grep（探す）", role: "条件に合うPIDを表示（-l で名前も）" }
  ]
},
{
  name: "jobs / fg / bg / nohup", group: "プロセス管理",
  desc: "ジョブ制御とログアウト後の実行継続",
  ex: "nohup ./batch.sh &　/　fg %1",
  rows: [
    { opt: "コマンド &", memo: "background（背景）", role: "バックグラウンドで実行する" },
    { opt: "Ctrl+Z", memo: "suspend（一時停止）", role: "実行中のジョブをサスペンドする" },
    { opt: "jobs", memo: "jobs（仕事一覧）", role: "現在のジョブ一覧と番号を表示（-l でPIDも）" },
    { opt: "fg %1", memo: "ForeGround（前面）", role: "ジョブ1をフォアグラウンドで再開" },
    { opt: "bg %1", memo: "BackGround（背景）", role: "サスペンド中のジョブ1をバックグラウンドで再開" },
    { opt: "nohup", memo: "no hangup（切断しても平気）", role: "SIGHUPを無視。ログアウト後も実行を継続（出力は nohup.out）" }
  ]
},
{
  name: "nice / renice / top / free / uptime", group: "プロセス管理",
  desc: "優先度の変更とシステム状態の確認",
  ex: "nice -n 10 ./job.sh　/　renice -n 5 -p 1234",
  rows: [
    { opt: "nice -n 10", memo: "nice（お行儀よく譲る）", role: "nice値を指定して起動。-20（最優先）〜19（最低）、既定0" },
    { opt: "renice -n 5 -p", memo: "re-nice（付け直す）", role: "実行中プロセスのnice値をPID指定で変更" },
    { opt: "renice -u", memo: "user（ユーザ）", role: "ユーザ単位でnice値を変更" },
    { opt: "top -d 5", memo: "delay（間隔）", role: "画面更新の間隔を秒で指定" },
    { opt: "top → P / M", memo: "Processor / Memory", role: "CPU使用率順／メモリ使用率順に並べ替え" },
    { opt: "top → k / r / q", memo: "kill / renice / quit", role: "プロセス終了／優先度変更／終了" },
    { opt: "free -h", memo: "human readable（人が読める）", role: "メモリとスワップの使用量を単位付きで表示" },
    { opt: "uptime", memo: "up time（稼働時間）", role: "稼働時間・ログインユーザ数・ロードアベレージ(1/5/15分)" }
  ]
},

/* ========== シェル・環境変数 ========== */
{
  name: "リダイレクト / パイプ", group: "シェル・環境変数",
  keys: ["リダイレクト", "パイプ", "標準出力", "標準エラー", "標準入力"],
  desc: "入出力の向き先を変える記号",
  ex: "cmd > out.log 2>&1　/　cmd1 | cmd2",
  rows: [
    { opt: "0 / 1 / 2", memo: "stdin / stdout / stderr", role: "標準入力／標準出力／標準エラー出力の番号" },
    { opt: "> file", memo: "output（出力）", role: "標準出力をファイルへ（上書き）" },
    { opt: ">> file", memo: "append（追記）", role: "標準出力をファイルへ追記" },
    { opt: "2> file", memo: "error output（エラー出力）", role: "標準エラー出力だけをファイルへ" },
    { opt: "> file 2>&1", memo: "2を1と同じ所へ", role: "標準出力と標準エラーをまとめて1つのファイルへ" },
    { opt: "&> file", memo: "both（両方）", role: "上と同じ意味の bash の短縮記法" },
    { opt: "< file", memo: "input（入力）", role: "ファイルを標準入力として読み込む" },
    { opt: "<< EOF", memo: "here document（ここ文書）", role: "EOF までの複数行を標準入力として渡す" },
    { opt: "|", memo: "pipe（管）", role: "前のコマンドの標準出力を次のコマンドの標準入力へ" },
    { opt: "/dev/null", memo: "null（無）", role: "捨て場所。2>/dev/null でエラーを破棄" }
  ]
},
{
  name: "変数 / export / env / set", group: "シェル・環境変数",
  desc: "シェル変数と環境変数の扱い",
  ex: "export PATH=$PATH:/opt/bin",
  rows: [
    { opt: "VAR=値", memo: "（スペースを入れない）", role: "シェル変数を定義。そのシェル内でのみ有効" },
    { opt: "export VAR", memo: "export（輸出する）", role: "環境変数に昇格させ、子プロセスへ引き継ぐ" },
    { opt: "env / printenv", memo: "environment（環境）", role: "環境変数だけを一覧表示" },
    { opt: "set", memo: "set（設定一式）", role: "シェル変数・関数も含めてすべて表示" },
    { opt: "unset VAR", memo: "un-set（設定解除）", role: "変数を削除する" },
    { opt: "echo $VAR", memo: "$ は「中身」", role: "変数の値を参照して表示" },
    { opt: "PATH", memo: "path（道筋）", role: "コマンドを探すディレクトリのリスト" },
    { opt: "PS1", memo: "Prompt String 1", role: "プロンプトの表示形式" },
    { opt: "source / .", memo: "source（源から読む）", role: "サブシェルを作らず現在のシェルでスクリプトを読み込む" }
  ]
},
{
  name: "history / alias / bash設定ファイル", group: "シェル・環境変数",
  desc: "コマンド履歴とエイリアス",
  ex: "alias ll='ls -l'　/　!!",
  rows: [
    { opt: "!!", memo: "直前のコマンド", role: "直前に実行したコマンドを再実行" },
    { opt: "!123", memo: "履歴番号", role: "履歴番号123のコマンドを再実行" },
    { opt: "!ssh", memo: "文字列で検索", role: "ssh で始まる直近のコマンドを再実行" },
    { opt: "Ctrl+R", memo: "Reverse search（逆検索）", role: "履歴をさかのぼって対話的に検索" },
    { opt: "history -c", memo: "clear（消去）", role: "メモリ上の履歴を消去" },
    { opt: "HISTSIZE", memo: "history size（履歴の数）", role: "保持する履歴の件数（ファイルは HISTFILESIZE）" },
    { opt: "alias / unalias", memo: "alias（別名）", role: "コマンドの別名を定義／解除（-a で全解除）" },
    { opt: "~/.bashrc", memo: "run commands（起動時実行）", role: "対話シェル起動ごとに読まれる（エイリアス等）" },
    { opt: "~/.bash_profile", memo: "profile（ログイン時）", role: "ログイン時に1度だけ読まれる（環境変数等）" }
  ]
},

/* ========== パッケージ管理 ========== */
{
  name: "dpkg（Debian系）", group: "パッケージ管理",
  desc: "個別の .deb パッケージを直接操作する（依存解決はしない）",
  ex: "dpkg -i pkg.deb　/　dpkg -S /bin/ls",
  rows: [
    { opt: "-i", memo: "install（導入）", role: ".deb ファイルをインストールする" },
    { opt: "-r", memo: "remove（削除）", role: "設定ファイルを残して削除" },
    { opt: "-P", memo: "Purge（一掃）", role: "設定ファイルも含めて完全に削除" },
    { opt: "-l", memo: "list（一覧・小文字）", role: "インストール済みパッケージの一覧と状態" },
    { opt: "-L", memo: "List files（ファイル一覧・大文字）", role: "そのパッケージが提供するファイルの一覧" },
    { opt: "-S", memo: "Search（ファイルから探す）", role: "指定ファイルを提供しているパッケージを検索" },
    { opt: "-s", memo: "status（状態）", role: "パッケージの詳細情報・状態を表示" },
    { opt: "-c", memo: "contents（中身）", role: "未インストールの .deb ファイル内の一覧を表示" },
    { opt: "-V", memo: "Verify（検証）", role: "インストール後に変更されたファイルを検出" }
  ]
},
{
  name: "apt / apt-get / apt-cache", group: "パッケージ管理",
  desc: "リポジトリを使い依存関係を解決してパッケージを管理する",
  ex: "apt-get update && apt-get -y upgrade",
  rows: [
    { opt: "update", memo: "update（情報の更新）", role: "リポジトリのパッケージ情報を取得する（本体は更新しない）" },
    { opt: "upgrade", memo: "upgrade（格上げ）", role: "インストール済みを更新（削除を伴う更新はしない）" },
    { opt: "dist-upgrade / full-upgrade", memo: "distribution upgrade", role: "依存解決のため削除・追加も行う全面更新" },
    { opt: "install / remove / purge", memo: "install / remove / purge", role: "導入／削除（設定は残す）／設定ごと削除" },
    { opt: "autoremove", memo: "auto remove（自動掃除）", role: "不要になった依存パッケージを削除" },
    { opt: "clean / autoclean", memo: "clean（掃除）", role: "ダウンロード済みパッケージのキャッシュを削除" },
    { opt: "-y", memo: "yes（はい）", role: "問い合わせにすべて yes で答える" },
    { opt: "-s", memo: "simulate（模擬）", role: "実際には行わず動作をシミュレートする" },
    { opt: "apt-cache search", memo: "search（探す）", role: "名前と説明文からキーワード検索" },
    { opt: "apt-cache show", memo: "show（見せる）", role: "パッケージの詳細情報を表示" },
    { opt: "apt-cache depends", memo: "depends（依存する）", role: "依存パッケージを表示（rdepends は逆依存）" },
    { opt: "/etc/apt/sources.list", memo: "sources（供給元）", role: "参照するリポジトリを記述する設定ファイル" }
  ]
},
{
  name: "rpm（RPM系）", group: "パッケージ管理",
  desc: "個別の .rpm パッケージを直接操作する（依存解決はしない）",
  ex: "rpm -ivh pkg.rpm　/　rpm -qf /bin/ls",
  rows: [
    { opt: "-i", memo: "install（導入）", role: "新規インストール（既にあるとエラー）" },
    { opt: "-U", memo: "Upgrade（更新）", role: "なければ導入、あれば更新" },
    { opt: "-F", memo: "Freshen（新しくする）", role: "既にインストール済みの場合のみ更新" },
    { opt: "-e", memo: "erase（消去）", role: "パッケージを削除する" },
    { opt: "-v / -h", memo: "verbose / hash（###）", role: "詳細表示／進行状況を # で表示" },
    { opt: "-q", memo: "query（問い合わせ）", role: "情報の問い合わせ。以下と組み合わせる" },
    { opt: "-qa", memo: "query all（全部）", role: "インストール済みパッケージをすべて一覧表示" },
    { opt: "-qi", memo: "query info（情報）", role: "パッケージの詳細情報を表示" },
    { opt: "-ql", memo: "query list（ファイル一覧）", role: "パッケージが提供するファイルの一覧" },
    { opt: "-qf", memo: "query file（このファイルは？）", role: "指定ファイルを提供するパッケージ名を表示" },
    { opt: "-qc / -qd", memo: "config / document", role: "設定ファイル／ドキュメントの一覧" },
    { opt: "-qp", memo: "query package file（未導入）", role: "未インストールの .rpm ファイルに問い合わせる" },
    { opt: "-V", memo: "Verify（検証）", role: "インストール時から変更されたファイルを検出" },
    { opt: "--nodeps", memo: "no dependencies（依存無視）", role: "依存関係を無視して処理する" }
  ]
},
{
  name: "yum / dnf / zypper", group: "パッケージ管理",
  desc: "RPM系のリポジトリ管理コマンド",
  ex: "yum provides /usr/bin/vim　/　dnf -y update",
  rows: [
    { opt: "install / remove", memo: "install / remove", role: "依存解決しつつ導入／削除（remove は erase でも可）" },
    { opt: "update / check-update", memo: "update（更新）", role: "更新の実行／更新可能なパッケージの確認" },
    { opt: "search", memo: "search（探す）", role: "名前・説明文からキーワード検索" },
    { opt: "info / list", memo: "info / list", role: "詳細情報／パッケージ一覧の表示" },
    { opt: "provides", memo: "provides（提供する）", role: "指定ファイルを提供するパッケージを検索" },
    { opt: "grouplist / groupinstall", memo: "group（グループ）", role: "パッケージグループの一覧／一括導入" },
    { opt: "repolist", memo: "repository list", role: "有効なリポジトリの一覧" },
    { opt: "clean all", memo: "clean（掃除）", role: "キャッシュをすべて削除" },
    { opt: "/etc/yum.repos.d/", memo: "repos（供給元）", role: "リポジトリ定義ファイル（.repo）の置き場所" },
    { opt: "zypper in / rm / up / ref", memo: "install/remove/update/refresh", role: "openSUSE系の導入／削除／更新／情報更新" }
  ]
},

/* ========== ハードウェア・カーネルモジュール ========== */
{
  name: "lspci / lsusb / lsblk", group: "ハードウェア・カーネルモジュール",
  desc: "接続されているデバイスの確認",
  ex: "lspci -k　/　lsusb -t　/　lsblk -f",
  rows: [
    { opt: "lspci", memo: "list PCI（PCI一覧）", role: "PCIデバイスの一覧を表示" },
    { opt: "lspci -v / -vv", memo: "verbose（詳しく）", role: "詳細情報を表示（vが増えるほど詳しい）" },
    { opt: "lspci -k", memo: "kernel driver（ドライバ）", role: "各デバイスが使うカーネルモジュールを表示" },
    { opt: "lsusb", memo: "list USB（USB一覧）", role: "USBデバイスの一覧を表示" },
    { opt: "lsusb -t", memo: "tree（木構造）", role: "接続の階層をツリー表示" },
    { opt: "lsblk", memo: "list block（ブロック装置）", role: "ディスクとパーティションをツリー表示" },
    { opt: "lsblk -f", memo: "filesystem（ファイルシステム）", role: "FSの種類・UUID・マウント先も表示" }
  ]
},
{
  name: "lsmod / modprobe / insmod / modinfo", group: "ハードウェア・カーネルモジュール",
  desc: "カーネルモジュールの確認とロード",
  ex: "modprobe vfat　/　modprobe -r vfat",
  rows: [
    { opt: "lsmod", memo: "list modules（一覧）", role: "ロード中モジュールの一覧（/proc/modules の内容）" },
    { opt: "modprobe", memo: "module probe（探して入れる）", role: "依存モジュールも含めてロードする" },
    { opt: "modprobe -r", memo: "remove（取り外す）", role: "依存関係も考慮してアンロードする" },
    { opt: "insmod", memo: "insert module（挿し込む）", role: "指定モジュールのみをロード（依存解決なし）" },
    { opt: "rmmod", memo: "remove module（外す）", role: "指定モジュールをアンロード" },
    { opt: "modinfo", memo: "module info（情報）", role: "モジュールの説明・パラメータ・依存を表示" },
    { opt: "depmod -a", memo: "dependency（依存）", role: "依存関係ファイル modules.dep を再生成" },
    { opt: "/etc/modprobe.d/", memo: "modprobe設定", role: "モジュールのオプションやブラックリストを記述" }
  ]
},
{
  name: "/proc・/sys・udev", group: "ハードウェア・カーネルモジュール",
  desc: "カーネルが公開する情報とデバイスファイル管理",
  ex: "cat /proc/cpuinfo　/　cat /proc/meminfo",
  rows: [
    { opt: "/proc/cpuinfo", memo: "CPU info", role: "CPUの種類・クロック・コア数" },
    { opt: "/proc/meminfo", memo: "memory info", role: "メモリとスワップの詳細（free の情報源）" },
    { opt: "/proc/interrupts", memo: "interrupts（割り込み）", role: "IRQ番号の使用状況" },
    { opt: "/proc/ioports", memo: "I/O ports", role: "I/Oポートアドレスの使用状況" },
    { opt: "/proc/dma", memo: "DMA", role: "DMAチャネルの使用状況" },
    { opt: "/proc/modules", memo: "modules", role: "ロード中モジュール（lsmod の情報源）" },
    { opt: "/proc/partitions", memo: "partitions", role: "認識中のパーティション一覧" },
    { opt: "/sys", memo: "sysfs（システム情報）", role: "デバイスの階層構造。udev が参照する" },
    { opt: "/etc/udev/rules.d/", memo: "udev rules（規則）", role: "デバイスファイル名や権限を決めるルール" }
  ]
},

/* ========== ディスク・ファイルシステム ========== */
{
  name: "fdisk / gdisk / parted", group: "ディスク・ファイルシステム",
  keys: ["パーティション", "MBR", "GPT", "基本パーティション", "拡張パーティション"],
  desc: "パーティションの作成・削除",
  ex: "fdisk -l　/　fdisk /dev/sdb",
  rows: [
    { opt: "fdisk -l", memo: "list（一覧）", role: "パーティションテーブルを一覧表示" },
    { opt: "p", memo: "print（表示）", role: "対話モード：現在のパーティションを表示" },
    { opt: "n", memo: "new（新規）", role: "対話モード：パーティションを新規作成" },
    { opt: "d", memo: "delete（削除）", role: "対話モード：パーティションを削除" },
    { opt: "t", memo: "type（種類）", role: "対話モード：パーティションタイプを変更（82=swap, 83=Linux）" },
    { opt: "w", memo: "write（書き込む）", role: "対話モード：変更をディスクに書き込んで終了" },
    { opt: "q", memo: "quit（やめる）", role: "対話モード：保存せず終了" },
    { opt: "gdisk", memo: "GPT fdisk", role: "GPT形式専用の対話型パーティション管理" },
    { opt: "parted", memo: "partition editor", role: "MBR/GPT両対応。mklabel / mkpart / print / rm" }
  ]
},
{
  name: "mkfs / fsck / tune2fs", group: "ディスク・ファイルシステム",
  desc: "ファイルシステムの作成・検査・設定変更",
  ex: "mkfs -t ext4 /dev/sdb1　/　tune2fs -L data /dev/sdb1",
  rows: [
    { opt: "mkfs -t ext4", memo: "make filesystem（作る）", role: "種類を指定してファイルシステムを作成" },
    { opt: "mkfs.xfs / mke2fs", memo: "各FS専用コマンド", role: "mkfs は各 mkfs.種類 のフロントエンド" },
    { opt: "mke2fs -b", memo: "block size（ブロック）", role: "ブロックサイズを指定" },
    { opt: "mke2fs -j", memo: "journal（ジャーナル）", role: "ジャーナルを作成（ext3化）" },
    { opt: "fsck -t", memo: "filesystem check（検査）", role: "種類を指定して検査。必ずアンマウントしてから実行" },
    { opt: "fsck -y / -a", memo: "yes / auto", role: "問い合わせにすべてyes／自動で修復" },
    { opt: "fsck -f", memo: "force（強制）", role: "クリーンでも強制的に検査する" },
    { opt: "fsck -A", memo: "All（fstab全部）", role: "/etc/fstab に書かれたFSをまとめて検査" },
    { opt: "tune2fs -L", memo: "Label（ラベル）", role: "ボリュームラベルを設定" },
    { opt: "tune2fs -c", memo: "count（回数）", role: "検査までの最大マウント回数を設定" },
    { opt: "tune2fs -i", memo: "interval（間隔）", role: "検査を行う日数間隔を設定" },
    { opt: "tune2fs -m", memo: "minimum reserved（予約）", role: "root用予約ブロックの割合(%)を設定" },
    { opt: "dumpe2fs -h", memo: "dump header（要約）", role: "スーパーブロックの情報を表示（表示専用）" },
    { opt: "xfs_info / xfs_repair", memo: "XFS専用", role: "XFSの情報表示／修復。ext系コマンドは使えない" }
  ]
},
{
  name: "mount / umount / fstab", group: "ディスク・ファイルシステム",
  desc: "ファイルシステムのマウント",
  ex: "mount -t ext4 -o ro /dev/sdb1 /mnt",
  rows: [
    { opt: "-a", memo: "all（すべて）", role: "/etc/fstab の内容に従ってまとめてマウント" },
    { opt: "-t", memo: "type（種類）", role: "ファイルシステムの種類を指定（ext4, xfs, iso9660…）" },
    { opt: "-o", memo: "options（オプション）", role: "マウントオプションをカンマ区切りで指定" },
    { opt: "-o loop", memo: "loopback（ループ）", role: "ISOイメージなどファイルをデバイスとして扱う" },
    { opt: "-o remount", memo: "remount（付け直す）", role: "アンマウントせずオプションを変更して再マウント" },
    { opt: "ro / rw", memo: "read only / read write", role: "読み取り専用／読み書き可能" },
    { opt: "noexec / nosuid / nodev", memo: "no execute / no SUID / no device", role: "実行禁止／SUID無効／デバイスファイル無効" },
    { opt: "noauto / user", memo: "no auto / user", role: "自動マウントしない／一般ユーザにマウントを許可" },
    { opt: "defaults", memo: "defaults（既定一式）", role: "rw,suid,dev,exec,auto,nouser,async をまとめて指定" },
    { opt: "umount -l", memo: "lazy（遅延）", role: "使用中でも参照が終わり次第アンマウント（-f は強制）" },
    { opt: "/etc/fstab の6列", memo: "デバイス／マウント先／種類／オプション／dump／fsck順", role: "第5列はdumpの要否、第6列は起動時チェック順（0=しない,1=ルート,2=その他）" }
  ]
},
{
  name: "df / du / blkid / quota", group: "ディスク・ファイルシステム",
  keys: ["クォータ", "使用量", "使用状況"],
  desc: "使用量の確認とクォータ",
  ex: "df -hT　/　du -sh /home/*",
  rows: [
    { opt: "df -h", memo: "human readable（人が読める）", role: "ファイルシステム別の空き容量を単位付きで表示" },
    { opt: "df -i", memo: "inode（iノード）", role: "iノードの使用状況を表示（枯渇するとファイル作成不可）" },
    { opt: "df -T", memo: "Type（種類）", role: "ファイルシステムの種類も表示" },
    { opt: "du -s", memo: "summarize（合計だけ）", role: "指定ディレクトリの合計サイズのみ表示" },
    { opt: "du -a", memo: "all（すべて）", role: "ファイル単位でも表示" },
    { opt: "du -c", memo: "total（総計）", role: "最後に合計行を表示" },
    { opt: "blkid", memo: "block id（識別子）", role: "各デバイスのUUID・LABEL・種類を表示" },
    { opt: "quotacheck -a", memo: "check（検査）", role: "クォータ情報ファイルを作成・整合性チェック" },
    { opt: "edquota -u", memo: "edit quota（編集）", role: "ユーザのクォータ上限をエディタで編集" },
    { opt: "quotaon / quotaoff", memo: "on / off", role: "クォータ機能の有効化／無効化" },
    { opt: "repquota -a", memo: "report quota（報告）", role: "クォータの使用状況レポートを表示" }
  ]
},
{
  name: "swap（mkswap / swapon）", group: "ディスク・ファイルシステム",
  desc: "スワップ領域の作成と有効化",
  ex: "mkswap /dev/sdb2 && swapon /dev/sdb2",
  rows: [
    { opt: "mkswap", memo: "make swap（作る）", role: "パーティションやファイルをスワップとして初期化" },
    { opt: "swapon", memo: "swap on（有効化）", role: "スワップ領域を有効にする" },
    { opt: "swapon -s", memo: "summary（要約）", role: "有効なスワップの一覧（/proc/swaps と同じ）" },
    { opt: "swapon -a", memo: "all（すべて）", role: "/etc/fstab の swap をすべて有効化" },
    { opt: "swapoff", memo: "swap off（無効化）", role: "スワップ領域を無効にする" },
    { opt: "fstab の記述", memo: "swap swap defaults 0 0", role: "マウントポイント欄・種類欄ともに swap と書く" }
  ]
},

/* ========== システム管理・起動 ========== */
{
  name: "systemctl", group: "システム管理・起動",
  desc: "systemd のサービスとターゲットを制御する",
  ex: "systemctl enable --now sshd",
  rows: [
    { opt: "start / stop / restart", memo: "そのまま", role: "サービスの開始／停止／再起動" },
    { opt: "reload", memo: "reload（読み直す）", role: "停止せず設定ファイルを再読み込み" },
    { opt: "status", memo: "status（状態）", role: "稼働状態と直近のログを表示" },
    { opt: "enable / disable", memo: "enable（有効にする）", role: "自動起動を有効／無効にする（今すぐ起動はしない）" },
    { opt: "--now", memo: "now（今すぐ）", role: "enable/disable と同時に起動／停止も行う" },
    { opt: "mask / unmask", memo: "mask（覆い隠す）", role: "手動でも起動できないよう完全に禁止／解除" },
    { opt: "is-enabled / is-active", memo: "is …?（〜か？）", role: "自動起動の有無／稼働中かを確認" },
    { opt: "list-units", memo: "list（一覧）", role: "読み込まれているユニットの一覧" },
    { opt: "get-default / set-default", memo: "default（既定）", role: "デフォルトターゲットの確認／変更" },
    { opt: "isolate", memo: "isolate（隔離＝そこだけに）", role: "指定ターゲットへ即座に切り替える" },
    { opt: "daemon-reload", memo: "reload（読み直す）", role: "ユニットファイルを編集した後に読み込み直す" }
  ]
},
{
  name: "ターゲット / ランレベル", group: "システム管理・起動",
  keys: ["ランレベル", "ターゲット", "シングルユーザー"],
  desc: "systemd のターゲットと SysVinit のランレベルの対応",
  ex: "systemctl set-default multi-user.target",
  rows: [
    { opt: "poweroff.target", memo: "power off（電源断）", role: "ランレベル0：システム停止" },
    { opt: "rescue.target", memo: "rescue（救助）", role: "ランレベル1：シングルユーザーモード" },
    { opt: "multi-user.target", memo: "multi user（複数ユーザ）", role: "ランレベル3：CUIのマルチユーザーモード" },
    { opt: "graphical.target", memo: "graphical（画面）", role: "ランレベル5：GUI付きマルチユーザーモード" },
    { opt: "reboot.target", memo: "reboot（再起動）", role: "ランレベル6：再起動" },
    { opt: "/etc/inittab", memo: "init table", role: "SysVinit でデフォルトランレベルを指定するファイル" }
  ]
},
{
  name: "journalctl / dmesg / shutdown", group: "システム管理・起動",
  desc: "ログの確認とシステムの停止・再起動",
  ex: "journalctl -u sshd -b　/　shutdown -r +10",
  rows: [
    { opt: "journalctl -b", memo: "boot（起動）", role: "今回の起動以降のログ（-b -1 で前回起動時）" },
    { opt: "journalctl -u", memo: "unit（ユニット）", role: "指定サービスのログだけを表示" },
    { opt: "journalctl -f", memo: "follow（追いかける）", role: "追記されるログをリアルタイム表示" },
    { opt: "journalctl -k", memo: "kernel（カーネル）", role: "カーネルメッセージのみ（dmesg 相当）" },
    { opt: "journalctl -n 50", memo: "number（件数）", role: "最新50件を表示（-r で新しい順）" },
    { opt: "dmesg", memo: "diagnostic message", role: "カーネルリングバッファの内容を表示" },
    { opt: "dmesg -T", memo: "Time（人が読める時刻）", role: "タイムスタンプを日時形式で表示" },
    { opt: "shutdown -h +10", memo: "halt（停止）", role: "10分後に停止（時刻は hh:mm でも指定可）" },
    { opt: "shutdown -r now", memo: "reboot（再起動）", role: "今すぐ再起動" },
    { opt: "shutdown -c", memo: "cancel（取消）", role: "予約したシャットダウンを取り消す" }
  ]
},
{
  name: "GRUB / ldd / ldconfig / uname", group: "システム管理・起動",
  desc: "ブートローダと共有ライブラリ、カーネル情報",
  ex: "grub-mkconfig -o /boot/grub/grub.cfg",
  rows: [
    { opt: "grub-install", memo: "install（導入）", role: "ブートローダ本体をMBR等に書き込む" },
    { opt: "grub-mkconfig -o", memo: "make config（設定生成）", role: "grub.cfg を生成する（-o で出力先。update-grub も同義）" },
    { opt: "/etc/default/grub", memo: "default（既定値）", role: "タイムアウトやカーネルパラメータを書く設定ファイル" },
    { opt: "/etc/grub.d/", memo: "grub scripts", role: "grub.cfg の元になるスクリプト群" },
    { opt: "ldd", memo: "list dynamic dependencies", role: "実行ファイルが必要とする共有ライブラリを表示" },
    { opt: "ldconfig", memo: "library config（設定）", role: "/etc/ld.so.conf を元にキャッシュ /etc/ld.so.cache を更新" },
    { opt: "ldconfig -p", memo: "print（表示）", role: "キャッシュに登録済みのライブラリを表示" },
    { opt: "LD_LIBRARY_PATH", memo: "library path（探す道）", role: "共有ライブラリの検索パスを一時的に追加する環境変数" },
    { opt: "uname -a", memo: "all（すべて）", role: "カーネル名・ホスト名・リリース・アーキテクチャをまとめて表示" },
    { opt: "uname -r", memo: "release（版）", role: "カーネルのリリース番号のみ表示" }
  ]
},

/* ========== vi エディタ ========== */
{
  name: "vi：モード切替と保存終了", group: "vi エディタ",
  desc: "コマンドモード ⇄ 入力モード ⇄ exモード",
  ex: "vi /etc/fstab → i で入力 → Esc → :wq",
  rows: [
    { opt: "i / a", memo: "insert / append（挿入／追加）", role: "カーソル位置の前／後ろから入力モードへ" },
    { opt: "I / A", memo: "行頭Insert / 行末Append", role: "行頭／行末から入力モードへ" },
    { opt: "o / O", memo: "open line（行を開く）", role: "下／上に空行を作って入力モードへ" },
    { opt: "Esc", memo: "escape（脱出）", role: "コマンドモードに戻る" },
    { opt: ":w", memo: "write（書く）", role: "保存する（:w ファイル名 で別名保存）" },
    { opt: ":q", memo: "quit（やめる）", role: "終了する（変更があると警告）" },
    { opt: ":q!", memo: "quit force（!は強制）", role: "変更を保存せず強制終了" },
    { opt: ":wq / ZZ", memo: "write & quit", role: "保存して終了（:x も同様）" },
    { opt: ":e!", memo: "edit again（読み直す）", role: "編集内容を破棄してファイルを読み直す" }
  ]
},
{
  name: "vi：移動・編集・検索", group: "vi エディタ",
  desc: "コマンドモードでの操作",
  ex: ":%s/old/new/g",
  rows: [
    { opt: "h / j / k / l", memo: "左・下・上・右", role: "カーソル移動（jは下に落ちる、kは上）" },
    { opt: "0 / $", memo: "行頭 / 行末", role: "行の先頭／末尾へ移動" },
    { opt: "gg / G", memo: "go to（行く）", role: "ファイルの先頭／末尾へ移動（:n でn行目）" },
    { opt: "w / b", memo: "word / back（単語）", role: "次の単語の先頭／前の単語の先頭へ" },
    { opt: "x / D", memo: "cross out / Delete to end", role: "1文字削除／カーソル位置から行末まで削除" },
    { opt: "dd / dw", memo: "delete（削除）", role: "1行削除／1単語削除（削除内容はバッファに入る）" },
    { opt: "yy / p / P", memo: "yank / put（コピー／貼る）", role: "1行コピー／カーソルの下（上）に貼り付け" },
    { opt: "u / Ctrl+r", memo: "undo / redo", role: "直前の操作を取り消す／やり直す" },
    { opt: "/文字列 → n / N", memo: "search（検索）", role: "前方検索し、次／前の一致へ移動（?は後方検索）" },
    { opt: ":%s/A/B/g", memo: "substitute（置換）", role: "ファイル全体（%）のAをBに全置換（g）" },
    { opt: ":set number", memo: "number（行番号）", role: "行番号を表示（:set nu、解除は :set nonu）" }
  ]
},

/* ================================================================
   ここから 102
   ================================================================ */

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

];
