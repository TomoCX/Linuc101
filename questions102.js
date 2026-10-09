/* =======================================================================
   Linuc レベル1 102 問題データ
   -----------------------------------------------------------------------
   書き方は questions.js と同じ。102 の問題は ID 2001 から振る。
   sec はノート（LinuC102_暗記まとめ.md）の節、imp は重要度（3=必出 / 2=重要 / 1=補足）。
   重要度は公式の出題範囲（Version 10.0）の重要度を目安にしている。
   ======================================================================= */

// 102 のカテゴリ（公式の主題番号 1.06〜1.11）
Object.assign(CATEGORIES, {
  "1.06": "シェルおよびスクリプト",
  "1.07": "ネットワークの基礎",
  "1.08": "システム管理",
  "1.09": "重要なシステムサービス",
  "1.10": "セキュリティ",
  "1.11": "オープンソースの文化"
});

const QUESTIONS_102 = [

  /* ===== 1.06 エイリアス ===== */
  {
    id: 2001, cat: "1.06", sec: "1.06/エイリアス（alias）", imp: 3,
    q: "ll と入力すると ls -la が実行されるように設定するコマンドはどれか。",
    choices: ["alias ll='ls -la'", "alias ll = 'ls -la'", "set ll='ls -la'", "export ll='ls -la'"],
    answer: [0],
    exp: "alias 名前='コマンド' でエイリアス（alias＝別名）を設定する。= の前後にスペースを入れるとエラーになる。set や export は変数の操作でエイリアスにはならない。毎回使うなら ~/.bashrc に書いておく。"
  },
  {
    id: 2002, cat: "1.06", sec: "1.06/エイリアス（alias）", imp: 2,
    q: "ls にエイリアスが設定されているとき、エイリアスを使わずに本来の ls を実行する方法はどれか。",
    choices: ["先頭に \\ を付けて \\ls と入力する", "先頭に ! を付けて !ls と入力する", "末尾に & を付けて ls & と入力する", "unalias を付けて unalias ls と入力する"],
    answer: [0],
    exp: "コマンドの先頭に \\（バックスラッシュ）を付けると、エイリアスを無視して本来のコマンドが実行される。!ls は履歴から ls で始まるコマンドを再実行、& はバックグラウンド実行。unalias ls はエイリアス自体を解除してしまう。"
  },
  {
    id: 2003, cat: "1.06", sec: "1.06/エイリアス（alias）", imp: 2,
    q: "設定されているエイリアスをすべて解除するコマンドはどれか。",
    choices: ["unalias -a", "alias -r", "unset -a", "alias --clear"],
    answer: [0],
    exp: "unalias -a（all＝すべて）で全エイリアスを解除する。1つだけなら unalias 名前。alias を引数なしで実行すると、設定中のエイリアスの一覧が表示される。unset は変数や関数を消すコマンド。"
  },

  /* ===== 1.06 bashの設定ファイル ===== */
  {
    id: 2004, cat: "1.06", sec: "1.06/bashの設定ファイル", imp: 3,
    q: "ログイン時に、すべてのユーザーに共通で読み込まれる設定ファイルはどれか。",
    choices: ["/etc/profile", "~/.bash_profile", "~/.bashrc", "/etc/skel/.bashrc"],
    answer: [0],
    exp: "/etc/profile はログイン時に全ユーザー共通で読まれる。~/.bash_profile はログイン時にそのユーザーだけ、~/.bashrc は bash を起動するたびにそのユーザーだけが読む。/etc/skel は新規ユーザーのホームのひな形で、起動時に読まれる場所ではない。"
  },
  {
    id: 2005, cat: "1.06", sec: "1.06/bashの設定ファイル", imp: 2,
    q: "ログイン時、~/.bash_profile が存在しない場合に次に読み込まれるユーザーの設定ファイルはどれか。",
    choices: ["~/.bash_login", "~/.bashrc", "~/.bash_logout", "/etc/bashrc"],
    answer: [0],
    exp: "ログイン時のユーザー設定は ~/.bash_profile → （無ければ）~/.bash_login → （それも無ければ）~/.profile の順に探し、最初に見つかった1つだけを読む。~/.bash_logout はログアウト時に読まれる。"
  },
  {
    id: 2006, cat: "1.06", sec: "1.06/bashの設定ファイル", imp: 3,
    q: "編集した ~/.bashrc の内容を、ログインし直さずに今のシェルへ反映させるコマンドを2つ選べ。",
    choices: ["source ~/.bashrc", ". ~/.bashrc", "bash ~/.bashrc", "exec ~/.bashrc"],
    answer: [0, 1],
    exp: "source（または同じ意味の .）はファイルを今のシェルの中で実行するので、設定した変数やエイリアスがそのまま残る。bash ~/.bashrc は新しいシェル（子プロセス）で実行されるため、終わると設定は消えてしまう。"
  },
  {
    id: 2007, cat: "1.06", sec: "1.06/bashの設定ファイル", imp: 2,
    q: "ログアウトするときに実行される、ユーザーごとの bash の設定ファイルはどれか。",
    choices: ["~/.bash_logout", "~/.bash_exit", "~/.logout_profile", "/etc/profile"],
    answer: [0],
    exp: "~/.bash_logout はログアウト時に読まれる。特に設定することが無ければ空のままでよい。ログイン時は ~/.bash_profile、bash 起動のたびは ~/.bashrc、全ユーザー共通のログイン時は /etc/profile。"
  },

  /* ===== 1.06 シェル関数 ===== */
  {
    id: 2008, cat: "1.06", sec: "1.06/シェル関数", imp: 2,
    q: "bash でシェル関数を定義する書き方として正しいものはどれか。",
    choices: ["function hello() { echo hello; }", "function hello() [ echo hello ]", "def hello(): echo hello", "hello = { echo hello }"],
    answer: [0],
    exp: "function 関数名() { コマンド; } の形で定義する（function は省略可）。{ の後と } の前にスペース、最後のコマンドの後に ; が必要。関数の中では $1 $2 で引数を受け取れる。残しておきたい関数は ~/.bashrc に書く。"
  },
  {
    id: 2009, cat: "1.06", sec: "1.06/シェル関数", imp: 2,
    q: "定義済みのシェル関数 lstee の内容を表示するコマンドはどれか。",
    choices: ["declare -f lstee", "type -a lstee", "alias lstee", "set -f lstee"],
    answer: [0],
    exp: "declare -f（function）で関数の内容を表示する。関数名を省くと全関数を内容ごと表示し、declare -F なら関数名だけを一覧表示する。関数を削除するときは unset lstee。"
  },
  {
    id: 2010, cat: "1.06", sec: "1.06/シェル関数", imp: 1,
    q: "定義したシェル関数 lstee を削除するコマンドはどれか。",
    choices: ["unset lstee", "unalias lstee", "declare -d lstee", "rm lstee"],
    answer: [0],
    exp: "シェル関数は変数と同じく unset で削除する（unset -f lstee でも可）。unalias はエイリアスの解除、rm はファイルの削除。関数はメモリ上にあるだけなので、シェルを終了しても消える。"
  },

  /* ===== 1.06 シェルスクリプトの実行方法 ===== */
  {
    id: 2011, cat: "1.06", sec: "1.06/シェルスクリプトの実行方法", imp: 3,
    q: "スクリプト setenv.sh の中で設定した変数を、実行後も今のシェルで使えるように実行する方法を2つ選べ。",
    choices: ["source setenv.sh", ". setenv.sh", "bash setenv.sh", "./setenv.sh"],
    answer: [0, 1],
    exp: "source（または .）は今のシェルの中でスクリプトを実行するので、スクリプトで設定した変数が残る。bash setenv.sh や ./setenv.sh は新しいシェル（子プロセス）で実行されるため、終わると変数は消える。"
  },
  {
    id: 2012, cat: "1.06", sec: "1.06/シェルスクリプトの実行方法", imp: 3,
    q: "作成したスクリプト backup.sh を ./backup.sh の形で実行するために必要なものはどれか。",
    choices: ["ファイルに実行権が付いていること", "ファイル名が .sh で終わること", "ファイルが /usr/bin に置かれていること", "ファイルの所有者が root であること"],
    answer: [0],
    exp: "./スクリプト で実行するにはファイルに実行権（x）が必要。chmod +x backup.sh や chmod 744 backup.sh で付ける。拡張子 .sh は慣習で必須ではない。bash backup.sh の形なら実行権がなくても実行できる。"
  },
  {
    id: 2013, cat: "1.06", sec: "1.06/シェルスクリプトの実行方法", imp: 2,
    q: "スクリプトの1行目に書く #!/bin/bash のような記述を何と呼ぶか。",
    choices: ["シバン（shebang）", "ヒアドキュメント", "エイリアス", "マジックナンバー変数"],
    answer: [0],
    exp: "#! で始まる1行目をシバン（shebang）と呼び、./スクリプト で実行したときにどのプログラムで解釈するかを指定する。#!/bin/bash なら bash で動く。ヒアドキュメントは << を使ってまとまった文字列を渡す書き方。"
  },
  {
    id: 2014, cat: "1.06", sec: "1.06/シェルスクリプトの実行方法", imp: 2,
    q: "スクリプトのデバッグのため、実行するコマンドを1行ずつ表示しながら test.sh を実行するコマンドはどれか。",
    choices: ["bash -x test.sh", "bash -n test.sh", "bash -d test.sh", "bash -v -q test.sh"],
    answer: [0],
    exp: "bash -x（execute trace）は、変数を展開した後のコマンドを先頭に + を付けて表示しながら実行する。スクリプトの中では set -x で同じ動きになる。bash -n は実行せずに文法だけを調べる。"
  },

  /* ===== 1.06 特殊変数と引数 ===== */
  {
    id: 2015, cat: "1.06", sec: "1.06/特殊変数と引数（$1・$#・shift）", imp: 3,
    q: "シェルスクリプトの中で、実行時に渡された引数の個数が入っている変数はどれか。",
    choices: ["$#", "$*", "$0", "$?"],
    answer: [0],
    exp: "$# が引数の個数（# は「数」の記号）。$* と $@ はすべての引数、$0 はスクリプト自身の名前、$? は直前のコマンドの終了ステータス。bash args.sh a b c なら $# は 3 になる。"
  },
  {
    id: 2016, cat: "1.06", sec: "1.06/特殊変数と引数（$1・$#・shift）", imp: 3,
    q: "直前に実行したコマンドの終了ステータスが入っている変数はどれか。",
    choices: ["$?", "$!", "$$", "$#"],
    answer: [0],
    exp: "$? が直前のコマンドの終了ステータス。0 なら成功、0以外なら失敗を表す。$$ は今のシェルのプロセスID、$! は最後にバックグラウンドで実行したプロセスのID、$# は引数の個数。"
  },
  {
    id: 2017, cat: "1.06", sec: "1.06/特殊変数と引数（$1・$#・shift）", imp: 3,
    q: "bash args.sh a b c と実行したスクリプトの中で shift を1回実行した後、$1 の値はどれか。",
    choices: ["b", "a", "c", "空になる"],
    answer: [0],
    exp: "shift は引数を1つずつ前へずらす。元の $1（a）は捨てられ、$2 だった b が $1 に、c が $2 になる。$# も 3 から 2 に減る。shift 2 なら2つずらす。"
  },
  {
    id: 2018, cat: "1.06", sec: "1.06/特殊変数と引数（$1・$#・shift）", imp: 2,
    q: "シェルスクリプトの中で、スクリプト自身のファイル名が入っている変数はどれか。",
    choices: ["$0", "$1", "$@", "$_"],
    answer: [0],
    exp: "$0 はスクリプト自身の名前（0番目の引数）。$1 は1番目の引数、$@ はすべての引数（\"$@\" と書くと1つずつ別々に扱える）。10番目以降の引数は ${10} のように { } で囲む。"
  },

  /* ===== 1.06 条件式 ===== */
  {
    id: 2019, cat: "1.06", sec: "1.06/条件式（test と [ ]）", imp: 3,
    q: "変数 a の数値が変数 b の数値より大きいときに真になる条件式はどれか。",
    choices: ["[ $a -gt $b ]", "[ $a -lt $b ]", "[ $a -ge $b ]", "[$a -gt $b]"],
    answer: [0],
    exp: "-gt（greater than）が「より大きい」。-lt（less than）は「より小さい」、-ge（greater or equal）は「以上」。[ の後と ] の前にはスペースが必要で、[$a -gt $b] のように詰めるとエラーになる。"
  },
  {
    id: 2020, cat: "1.06", sec: "1.06/条件式（test と [ ]）", imp: 2,
    q: "指定したパスがディレクトリとして存在するときに真になる test の演算子はどれか。",
    choices: ["-d", "-f", "-e", "-s"],
    answer: [0],
    exp: "-d（directory）はディレクトリとして存在すれば真。-f（file）は通常のファイル、-e（exist）は種類を問わず存在すれば真、-s（size）はサイズが0より大きければ真。"
  },
  {
    id: 2021, cat: "1.06", sec: "1.06/条件式（test と [ ]）", imp: 2,
    q: "2つの数値が等しくないときに真になる test の演算子はどれか。",
    choices: ["-ne", "-eq", "!=", "-nq"],
    answer: [0],
    exp: "数値の比較は -eq（equal＝等しい）・-ne（not equal＝等しくない）を使う。!= は文字列の比較に使う演算子。数値には英字の演算子、文字列には記号（= と !=）と覚える。"
  },
  {
    id: 2022, cat: "1.06", sec: "1.06/条件式（test と [ ]）", imp: 1,
    q: "変数 name の中身が空文字列のときに真になる条件式はどれか。",
    choices: ["[ -z \"$name\" ]", "[ -n \"$name\" ]", "[ -e \"$name\" ]", "[ \"$name\" -eq 0 ]"],
    answer: [0],
    exp: "-z（zero length＝長さ0）は空文字列なら真、-n（nonzero）は空でなければ真。変数を \" \" で囲んでおくと、空のときにも条件式の形が崩れない。-e はファイルが存在するかの判定。"
  },

  /* ===== 1.06 制御構造 ===== */
  {
    id: 2023, cat: "1.06", sec: "1.06/制御構造（if・case・for・while）", imp: 3,
    q: "シェルスクリプトの if 文を閉じるキーワードはどれか。",
    choices: ["fi", "end", "endif", "done"],
    answer: [0],
    exp: "if 文は fi（if を逆から書いたもの）で閉じる。case 文は esac で閉じ、for・while・until は do 〜 done で囲む。end や endif は bash では使わない。"
  },
  {
    id: 2024, cat: "1.06", sec: "1.06/制御構造（if・case・for・while）", imp: 3,
    q: "case 文の書き方として正しい組み合わせはどれか。",
    choices: ["各パターンの終わりは ;; で、文全体の終わりは esac", "各パターンの終わりは ; で、文全体の終わりは fi", "各パターンの終わりは break で、文全体の終わりは done", "各パターンの終わりは ;; で、文全体の終わりは endcase"],
    answer: [0],
    exp: "case 値 in パターン) コマンド ;; … esac の形。各パターンの処理は ;; で終え、文全体は esac（case の逆つづり）で閉じる。どれにも当てはまらないときの処理は *) で書く。"
  },
  {
    id: 2025, cat: "1.06", sec: "1.06/制御構造（if・case・for・while）", imp: 2,
    q: "条件が真である間、処理を繰り返す構文はどれか。",
    choices: ["while", "until", "case", "if"],
    answer: [0],
    exp: "while は条件が真の間繰り返す。until は逆に条件が偽の間（真になるまで）繰り返す。どちらも do 〜 done で囲む。case と if は繰り返しではなく条件分岐。"
  },
  {
    id: 2026, cat: "1.06", sec: "1.06/制御構造（if・case・for・while）", imp: 2,
    q: "for c in A B C; do echo $c; done を実行したときの出力として正しいものはどれか。",
    choices: ["A、B、C が1行ずつ表示される", "A B C が1行で1回だけ表示される", "$c と3回表示される", "C だけが表示される"],
    answer: [0],
    exp: "for 変数 in 値の並び は、スペースで区切った値を1つずつ変数に入れて do 〜 done を繰り返す。A、B、C の3回 echo されるので1行ずつ表示される。値の並びには $(seq 1 5) のようなコマンドの結果も使える。"
  },
  {
    id: 2027, cat: "1.06", sec: "1.06/制御構造（if・case・for・while）", imp: 1,
    q: "条件が偽である間繰り返し、真になったら終了する構文はどれか。",
    choices: ["until", "while", "for", "select"],
    answer: [0],
    exp: "until は条件が偽の間繰り返し、真になったところで終わる（while の逆）。while は真の間繰り返す。for はリストの値の数だけ繰り返す。ループを途中で抜けるのは break、次の周回へ進むのは continue。"
  },

  /* ===== 1.06 スクリプトで使う小技 ===== */
  {
    id: 2028, cat: "1.06", sec: "1.06/スクリプトで使う小技（read・seq・exit・終了ステータス）", imp: 2,
    q: "seq 1 2 9 を実行したときの出力として正しいものはどれか。",
    choices: ["1 3 5 7 9（1行ずつ）", "1 2 9（1行ずつ）", "1 から 9 までの全部（1行ずつ）", "2 4 6 8（1行ずつ）"],
    answer: [0],
    exp: "seq 開始 増分 終了 の形で、1 から 2 ずつ 9 まで数える。引数が2つなら seq 開始 終了 で1ずつ増える。for i in $(seq 1 5) のようにループの回数を作るのによく使う。"
  },
  {
    id: 2029, cat: "1.06", sec: "1.06/スクリプトで使う小技（read・seq・exit・終了ステータス）", imp: 2,
    q: "シェルスクリプトで、キーボードから入力された1行を変数 ans に読み込むコマンドはどれか。",
    choices: ["read ans", "input ans", "get ans", "echo ans"],
    answer: [0],
    exp: "read 変数 で標準入力から1行を読み込んで変数に入れる。read -p \"質問\" ans とすると、プロンプトを表示してから読み込む。input や get というコマンドは bash には無い。"
  },
  {
    id: 2030, cat: "1.06", sec: "1.06/スクリプトで使う小技（read・seq・exit・終了ステータス）", imp: 2,
    q: "コマンドが正常に終了したときの終了ステータスの値はどれか。",
    choices: ["0", "1", "-1", "255"],
    answer: [0],
    exp: "Linux のコマンドは成功すると 0、失敗すると 0 以外の値を返す（一般的な真偽値とは逆なので注意）。直前の値は echo $? で確認でき、スクリプトは exit 数値 で終了ステータスを決めて終われる。"
  },
  {
    id: 2031, cat: "1.06", sec: "1.06/スクリプトで使う小技（read・seq・exit・終了ステータス）", imp: 2,
    q: "mkdir /tmp/work && cd /tmp/work の動作として正しいものはどれか。",
    choices: ["mkdir が成功したときだけ cd が実行される", "mkdir が失敗したときだけ cd が実行される", "mkdir の結果に関係なく cd が実行される", "mkdir と cd が同時に実行される"],
    answer: [0],
    exp: "&& は前のコマンドが成功（終了ステータス0）したときだけ次を実行する。|| は前のコマンドが失敗したときだけ次を実行する。; は結果に関係なく順番に実行する。"
  },

  /* ===== 1.07 ネットワークの基本用語 ===== */
  {
    id: 2032, cat: "1.07", sec: "1.07/ネットワークの基本用語", imp: 1,
    q: "WAN の説明として正しいものはどれか。",
    choices: ["地理的に離れた LAN 同士を、通信事業者の回線で結んだ広い範囲のネットワーク", "建物の中だけで自前で構築する狭い範囲のネットワーク", "TCP/IP の技術を使って構築した社内だけのネットワーク", "Wi-Fi だけで構成されるネットワーク"],
    answer: [0],
    exp: "WAN（Wide Area Network）は離れた LAN と LAN を通信事業者（キャリア）の回線で結ぶ広い範囲のネットワーク。建物内の狭い範囲は LAN（Local Area Network）、TCP/IP で作った社内ネットワークはイントラネット。"
  },
  {
    id: 2033, cat: "1.07", sec: "1.07/ネットワークの基本用語", imp: 1,
    q: "1秒間に送ることができるデータ量を表し、単位に bps を使うものはどれか。",
    choices: ["帯域幅", "ジッタ", "輻輳", "レイテンシのばらつき"],
    answer: [0],
    exp: "帯域幅（bandwidth）は1秒間に送れるデータ量で、bps（bits per second）で表す。ジッタは信号の到着時間のゆらぎ、輻輳（ふくそう）は通信が集中してネットワークが混雑すること。1バイトは8ビット。"
  },

  /* ===== 1.07 トポロジと通信の種類 ===== */
  {
    id: 2034, cat: "1.07", sec: "1.07/トポロジと通信の種類", imp: 1,
    q: "ハブを中心に各ノードを接続し、現在の LAN で最も一般的に使われているトポロジはどれか。",
    choices: ["スター型", "バス型", "リング型", "フルメッシュ型"],
    answer: [0],
    exp: "スター型はハブ（集線装置）を中心に接続する形で、扱いやすく拡張しやすいため現在の LAN で最も一般的。バス型は1本の同軸ケーブルにつなぎ両端にターミネータを付ける。リング型はトークンを受け取ったノードだけが送信できる。"
  },
  {
    id: 2035, cat: "1.07", sec: "1.07/トポロジと通信の種類", imp: 1,
    q: "特定のグループに属するノードだけに向けてデータを送る通信方式はどれか。",
    choices: ["マルチキャスト", "ユニキャスト", "ブロードキャスト", "エニーキャスト"],
    answer: [0],
    exp: "マルチキャストは1対特定のグループ、ユニキャストは1対1、ブロードキャストは1対（同じネットワークの）全員への通信。IPv6 にはブロードキャストが無く、マルチキャストで代わりを行う。"
  },

  /* ===== 1.07 OSI参照モデル ===== */
  {
    id: 2036, cat: "1.07", sec: "1.07/OSI参照モデル", imp: 2,
    q: "OSI参照モデルで、IPアドレス（論理アドレス）を使ったエンドツーエンドの通信や経路選択を担う層はどれか。",
    choices: ["第3層 ネットワーク層", "第2層 データリンク層", "第4層 トランスポート層", "第1層 物理層"],
    answer: [0],
    exp: "第3層ネットワーク層が論理アドレス（IPアドレス）と経路選択を担う。第2層データリンク層は隣接ノード間の通信と物理アドレス（MACアドレス）、第4層トランスポート層は通信の信頼性（TCP・UDP）、第1層物理層は電気信号やケーブル。"
  },
  {
    id: 2037, cat: "1.07", sec: "1.07/OSI参照モデル", imp: 2,
    q: "OSI参照モデルの7つの層を、上位（第7層）から正しく並べたものはどれか。",
    choices: [
      "アプリケーション → プレゼンテーション → セッション → トランスポート → ネットワーク → データリンク → 物理",
      "アプリケーション → セッション → プレゼンテーション → トランスポート → ネットワーク → データリンク → 物理",
      "アプリケーション → プレゼンテーション → セッション → ネットワーク → トランスポート → データリンク → 物理",
      "アプリケーション → トランスポート → プレゼンテーション → セッション → ネットワーク → データリンク → 物理"
    ],
    answer: [0],
    exp: "上から アプリケーション・プレゼンテーション・セッション・トランスポート・ネットワーク・データリンク・物理（ア・プ・セ・ト・ネ・デ・ブ）。OSI参照モデルは ISO（国際標準化機構）が策定した。"
  },

  /* ===== 1.07 TCP/IPとカプセル化 ===== */
  {
    id: 2038, cat: "1.07", sec: "1.07/TCP/IPとカプセル化", imp: 2,
    q: "TCP/IP のプロトコル階層はいくつの層で構成されているか。",
    choices: ["4層", "7層", "5層", "3層"],
    answer: [0],
    exp: "TCP/IP はアプリケーション層・トランスポート層・インターネット層・リンク層（ネットワークインターフェイス層）の4層。OSI参照モデルは7層。TCP/IP の仕様は RFC として公開されている。"
  },
  {
    id: 2039, cat: "1.07", sec: "1.07/TCP/IPとカプセル化", imp: 2,
    q: "データリンク層でヘッダとトレーラが付加されたデータの単位（PDU）の呼び名はどれか。",
    choices: ["フレーム", "パケット", "セグメント", "メッセージ"],
    answer: [0],
    exp: "PDU の呼び名は層ごとに変わる。データリンク層はフレーム、ネットワーク（インターネット）層はパケット、トランスポート層は TCP ならセグメント・UDP ならデータグラム。送信時に各層でヘッダを付けていく処理をカプセル化という。"
  },

  /* ===== 1.07 TCPとUDP ===== */
  {
    id: 2040, cat: "1.07", sec: "1.07/TCPとUDP", imp: 3,
    q: "UDP の特徴として正しいものを2つ選べ。",
    choices: ["コネクションレス型で、接続を確立せずにデータを送る", "ヘッダが単純でオーバーヘッドが小さく、高速に通信できる", "確認応答と再送で、データが確実に届くことを保証する", "3ウェイハンドシェイクで通信を始める"],
    answer: [0, 1],
    exp: "UDP（User Datagram Protocol）はコネクションレス型・ベストエフォート型で、ヘッダが単純なため高速。DNS・DHCP・NTP・動画配信などで使う。確認応答・再送・3ウェイハンドシェイクは TCP（コネクション型・信頼性重視）の特徴。"
  },
  {
    id: 2041, cat: "1.07", sec: "1.07/TCPとUDP", imp: 2,
    q: "TCP が通信を始めるときに行う、SYN → SYN+ACK → ACK のやりとりを何と呼ぶか。",
    choices: ["3ウェイハンドシェイク", "カプセル化", "ブロードキャスト", "フロー制御"],
    answer: [0],
    exp: "TCP はコネクション型で、SYN（接続要求）・SYN+ACK（応答）・ACK（確認）の3回のやりとり（3ウェイハンドシェイク）で接続を確立してから送る。切断は FIN、強制切断は RST の制御ビットを使う。"
  },
  {
    id: 2042, cat: "1.07", sec: "1.07/TCPとUDP", imp: 2,
    q: "トランスポート層のプロトコルとして主に UDP を使うサービスを2つ選べ。",
    choices: ["NTP", "DHCP", "SSH", "SMTP"],
    answer: [0, 1],
    exp: "NTP（123番）や DHCP（67・68番）は UDP を使う（DNS も問い合わせは主に UDP）。SSH（22番）や SMTP（25番）は確実に届く必要があるので TCP を使う。速さ重視は UDP、信頼性重視は TCP と覚える。"
  },

  /* ===== 1.07 IPとICMP ===== */
  {
    id: 2043, cat: "1.07", sec: "1.07/IPとICMP", imp: 3,
    q: "ping コマンドが相手に送る ICMP メッセージと、正常なときに返ってくるメッセージの組み合わせはどれか。",
    choices: ["エコー要求（タイプ8）と エコー応答（タイプ0）", "エコー応答（タイプ0）と エコー要求（タイプ8）", "時間超過（タイプ11）と 宛先到達不能（タイプ3）", "エコー要求（タイプ8）と 時間超過（タイプ11）"],
    answer: [0],
    exp: "ping は ICMP のエコー要求（タイプ8）を送り、相手からエコー応答（タイプ0）が返れば通信できると判断する。タイプ3 は宛先到達不能、タイプ11 は時間超過（TTL が0になった）で traceroute が利用する。"
  },
  {
    id: 2044, cat: "1.07", sec: "1.07/IPとICMP", imp: 2,
    q: "traceroute が経路上のルーターを調べるために利用する仕組みとして正しいものはどれか。",
    choices: ["TTL を1ずつ増やして送り、TTL が0になったルーターが返す時間超過メッセージを使う", "ARP で経路上のすべての MAC アドレスを問い合わせる", "DNS の逆引きで経路上のホスト名を順に調べる", "ブロードキャストで全ルーターに一斉に問い合わせる"],
    answer: [0],
    exp: "パケットの TTL（Time To Live）はルーターを1つ通るたびに1減り、0になると破棄されて送信元に ICMP の時間超過（タイプ11）が返る。traceroute は TTL を1、2、3…と増やしながら送ることで、途中のルーターを順に知る。"
  },
  {
    id: 2045, cat: "1.07", sec: "1.07/IPとICMP", imp: 2,
    q: "IPアドレスから MAC アドレスを調べるプロトコルはどれか。",
    choices: ["ARP", "ICMP", "DHCP", "DNS"],
    answer: [0],
    exp: "ARP（Address Resolution Protocol）は IPアドレスから MACアドレス（物理アドレス）を調べる。ICMP はエラー通知や問い合わせ、DHCP は IPアドレスの自動割り当て、DNS はホスト名と IPアドレスの変換。"
  },

  /* ===== 1.07 IPアドレスとサブネット ===== */
  {
    id: 2046, cat: "1.07", sec: "1.07/IPアドレスとサブネット", imp: 3,
    q: "192.168.1.0/24 のネットワークで、ホストに割り当てられる IPアドレスの数はいくつか。",
    choices: ["254", "256", "255", "253"],
    answer: [0],
    exp: "/24 はホスト部が 32−24＝8 ビットなので 2^8＝256 通り。そこからネットワークアドレス（ホスト部が全部0の .0）とブロードキャストアドレス（全部1の .255）の2つを除いた 254 個がホストに使える。"
  },
  {
    id: 2047, cat: "1.07", sec: "1.07/IPアドレスとサブネット", imp: 2,
    q: "192.168.10.0/26 のネットワークのブロードキャストアドレスはどれか。",
    choices: ["192.168.10.63", "192.168.10.64", "192.168.10.255", "192.168.10.62"],
    answer: [0],
    exp: "/26 はホスト部が 6 ビットで 2^6＝64 個のアドレスを持つ。192.168.10.0 から始まるので範囲は .0〜.63 で、最後の .63 がブロードキャストアドレス。ホストに使えるのは .1〜.62 の62個。"
  },
  {
    id: 2048, cat: "1.07", sec: "1.07/IPアドレスとサブネット", imp: 2,
    q: "サブネットマスク 255.255.255.240 を CIDR 表記で表したものはどれか。",
    choices: ["/28", "/24", "/26", "/30"],
    answer: [0],
    exp: "240 は2進数で 11110000 なので、最後のブロックで4ビットが1。8×3＋4＝28 で /28 になる。/24 は 255.255.255.0、/26 は .192、/30 は .252。/28 のホスト数は 2^4−2＝14。"
  },
  {
    id: 2049, cat: "1.07", sec: "1.07/IPアドレスとサブネット", imp: 2,
    q: "IPv4 のアドレス 127.0.0.1 の説明として正しいものはどれか。",
    choices: ["自分自身を表すループバックアドレス", "デフォルトゲートウェイの決まったアドレス", "ブロードキャストアドレス", "DHCP サーバーの決まったアドレス"],
    answer: [0],
    exp: "127.0.0.1 は自分自身を指すループバックアドレスで、ホスト名 localhost に対応する。IPv6 のループバックは ::1。ネットワークに出ずに自分の中で通信を試せる。"
  },

  /* ===== 1.07 プライベートIPアドレスとNAT ===== */
  {
    id: 2050, cat: "1.07", sec: "1.07/プライベートIPアドレスとNAT", imp: 3,
    q: "プライベートIPアドレスに含まれるものを2つ選べ。",
    choices: ["172.20.1.1", "10.1.2.3", "172.32.0.1", "192.169.0.1"],
    answer: [0, 1],
    exp: "プライベートIPアドレスの範囲は 10.0.0.0〜10.255.255.255、172.16.0.0〜172.31.255.255、192.168.0.0〜192.168.255.255（RFC1918）。172.32.0.1 は 172.31 を超えており、192.169.0.1 も範囲外なのでグローバルアドレス。"
  },
  {
    id: 2051, cat: "1.07", sec: "1.07/プライベートIPアドレスとNAT", imp: 2,
    q: "ポート番号も使って、1つのグローバルIPアドレスを複数の端末で共有できるようにするアドレス変換の仕組みはどれか。",
    choices: ["NAPT（IPマスカレード）", "ARP", "DHCP", "ICMP リダイレクト"],
    answer: [0],
    exp: "NAPT（Network Address Port Translation、PAT や IPマスカレードとも呼ぶ）は IPアドレスとポート番号を組み合わせて変換し、1つのグローバルアドレスを複数台で共有できる。アドレスだけを1対1で変換するのが NAT。"
  },

  /* ===== 1.07 IPv6 ===== */
  {
    id: 2052, cat: "1.07", sec: "1.07/IPv6", imp: 2,
    q: "IPv6 アドレスの長さは何ビットか。",
    choices: ["128ビット", "32ビット", "64ビット", "48ビット"],
    answer: [0],
    exp: "IPv6 は 128 ビットで、16ビットずつ8つに区切って16進数で書く。IPv4 は 32 ビット。48 ビットは MAC アドレスの長さ。IPv4 のアドレスが足りなくなる枯渇問題を解決するために作られた。"
  },
  {
    id: 2053, cat: "1.07", sec: "1.07/IPv6", imp: 2,
    q: "IPv6 アドレス 2001:0db8:0000:0000:0000:0000:0000:0001 を正しく省略したものはどれか。",
    choices: ["2001:db8::1", "2001:db8:1", "2001::db8::1", "21:db8::1"],
    answer: [0],
    exp: "各ブロックの先頭の0は省略でき（0db8→db8、0001→1）、0だけのブロックが続く部分は :: にまとめられる。:: は1つのアドレスで1か所しか使えないので 2001::db8::1 は誤り。末尾以外の0（2001の0）は省略できない。"
  },
  {
    id: 2054, cat: "1.07", sec: "1.07/IPv6", imp: 2,
    q: "IPv6 のループバックアドレスはどれか。",
    choices: ["::1", "fe80::1", "127.0.0.1", "ff02::1"],
    answer: [0],
    exp: "IPv6 のループバックは ::1（IPv4 の 127.0.0.1 に相当）。fe80:: で始まるのはリンクローカルアドレス、ff で始まるのはマルチキャストアドレス。127.0.0.1 は IPv4 のループバック。"
  },
  {
    id: 2055, cat: "1.07", sec: "1.07/IPv6", imp: 1,
    q: "IPv6 で fe80:: から始まるアドレスの種類はどれか。",
    choices: ["リンクローカルアドレス", "グローバルユニキャストアドレス", "ループバックアドレス", "ブロードキャストアドレス"],
    answer: [0],
    exp: "fe80::/10 はリンクローカルアドレスで、同じリンク（ルーターを越えない範囲）でだけ使える。インターフェイスごとに自動で付く。IPv6 にはブロードキャストアドレスが存在しない。"
  },

  /* ===== 1.07 ポート番号 ===== */
  {
    id: 2056, cat: "1.07", sec: "1.07/ポート番号（ウェルノウンポート）", imp: 3,
    q: "SSH が標準で使用するポート番号はどれか。",
    choices: ["22", "23", "21", "25"],
    answer: [0],
    exp: "SSH は TCP の22番。23番は暗号化しない遠隔操作の Telnet、21番は FTP（制御）、25番は SMTP。SSH は Telnet と違い通信を暗号化するため、遠隔操作には SSH を使う。"
  },
  {
    id: 2057, cat: "1.07", sec: "1.07/ポート番号（ウェルノウンポート）", imp: 3,
    q: "サービスとポート番号の組み合わせとして正しいものを2つ選べ。",
    choices: ["SMTP ― 25", "POP3 ― 110", "IMAP ― 110", "HTTPS ― 8080"],
    answer: [0, 1],
    exp: "SMTP（メール送信）は25番、POP3（メール受信）は110番。IMAP は143番、HTTPS は443番（8080番は HTTP の代わりによく使われる番号でウェルノウンポートではない）。HTTP は80番、DNS は53番。"
  },
  {
    id: 2058, cat: "1.07", sec: "1.07/ポート番号（ウェルノウンポート）", imp: 2,
    q: "ウェルノウンポートと呼ばれるポート番号の範囲はどれか。",
    choices: ["0〜1023", "0〜255", "1024〜49151", "49152〜65535"],
    answer: [0],
    exp: "ポート番号は16ビット（0〜65535）。0〜1023 がウェルノウンポート（用途が決まっている）、1024〜49151 が登録済みポート、49152〜65535 がダイナミック（プライベート）ポート。"
  },
  {
    id: 2059, cat: "1.07", sec: "1.07/ポート番号（ウェルノウンポート）", imp: 2,
    q: "サービス名とポート番号の対応が記述されているファイルはどれか。",
    choices: ["/etc/services", "/etc/protocols", "/etc/hosts", "/etc/ports"],
    answer: [0],
    exp: "/etc/services にサービス名とポート番号・プロトコル（tcp/udp）の対応が書かれている。/etc/protocols はプロトコル名と番号、/etc/hosts はホスト名と IPアドレスの対応。/etc/ports というファイルは標準では無い。"
  },
  {
    id: 2060, cat: "1.07", sec: "1.07/ポート番号（ウェルノウンポート）", imp: 2,
    q: "DNS と NTP が使うポート番号の組み合わせとして正しいものはどれか。",
    choices: ["DNS ― 53、NTP ― 123", "DNS ― 53、NTP ― 143", "DNS ― 25、NTP ― 123", "DNS ― 123、NTP ― 53"],
    answer: [0],
    exp: "DNS は53番（TCP/UDP）、NTP は123番（UDP）。143番は IMAP、25番は SMTP。ウェルノウンポートは 20/21 FTP、22 SSH、23 Telnet、25 SMTP、53 DNS、80 HTTP、110 POP3、123 NTP、143 IMAP、443 HTTPS を最低限覚える。"
  },

  /* ===== 1.07 ネットワークの設定ファイルとホスト名 ===== */
  {
    id: 2061, cat: "1.07", sec: "1.07/ネットワークの設定ファイルとホスト名", imp: 3,
    q: "DNS を使わずに名前解決するため、ホスト名と IPアドレスの対応を記述するファイルはどれか。",
    choices: ["/etc/hosts", "/etc/hostname", "/etc/resolv.conf", "/etc/nsswitch.conf"],
    answer: [0],
    exp: "/etc/hosts に「IPアドレス 正式なホスト名 別名」の形で書くと、DNS を使わずに名前解決できる。/etc/hostname は自分のホスト名、/etc/resolv.conf は問い合わせる DNS サーバー、/etc/nsswitch.conf は名前解決の順番。"
  },
  {
    id: 2062, cat: "1.07", sec: "1.07/ネットワークの設定ファイルとホスト名", imp: 3,
    q: "systemd を採用したシステムで、ホスト名を server1 に恒久的に変更するコマンドはどれか。",
    choices: ["hostnamectl set-hostname server1", "hostname server1", "hostnamectl hostname --temp server1", "nmcli device hostname server1"],
    answer: [0],
    exp: "hostnamectl set-hostname で /etc/hostname も書き換えられ、再起動後も残る。hostname server1 はその場だけの一時的な変更で、再起動すると元に戻る。NetworkManager なら nmcli general hostname server1 でも変更できる。"
  },
  {
    id: 2063, cat: "1.07", sec: "1.07/ネットワークの設定ファイルとホスト名", imp: 2,
    q: "このコンピュータのホスト名が書かれているファイルはどれか。",
    choices: ["/etc/hostname", "/etc/hosts", "/etc/host.conf", "/etc/sysconfig/hosts"],
    answer: [0],
    exp: "/etc/hostname には自分のホスト名だけが1行で書かれている。/etc/hosts はホスト名と IPアドレスの対応表、/etc/host.conf は古い名前解決の設定。ホスト名の表示は hostname コマンドでもできる。"
  },

  /* ===== 1.07 ネットワーク設定コマンド ===== */
  {
    id: 2064, cat: "1.07", sec: "1.07/ネットワーク設定コマンド（nmcli・ip・ifconfig）", imp: 3,
    q: "ネットワークインターフェイスに設定された IPアドレスを表示できるコマンドを2つ選べ。",
    choices: ["ip addr show", "ifconfig", "ip route show", "route -n"],
    answer: [0, 1],
    exp: "ip addr show（ip a）と ifconfig で IPアドレスを確認できる。ip route show と route -n はルーティングテーブルの表示。ip コマンドは ifconfig・route に代わる新しいコマンドで、ip オブジェクト サブコマンド の形で使う。"
  },
  {
    id: 2065, cat: "1.07", sec: "1.07/ネットワーク設定コマンド（nmcli・ip・ifconfig）", imp: 3,
    q: "NetworkManager で管理されている接続（コネクション）の一覧を表示するコマンドはどれか。",
    choices: ["nmcli connection show", "nmcli device wifi", "nmcli general hostname", "nmcli radio all"],
    answer: [0],
    exp: "nmcli connection show で接続の一覧（--active で使用中だけ）を表示する。nmcli device status はデバイスの状態、nmcli general hostname はホスト名、nmcli radio は無線の有効・無効。接続の有効化は nmcli connection up 接続名。"
  },
  {
    id: 2066, cat: "1.07", sec: "1.07/ネットワーク設定コマンド（nmcli・ip・ifconfig）", imp: 2,
    q: "インターフェイス eth0 を有効にするコマンドとして正しいものを2つ選べ。",
    choices: ["ip link set eth0 up", "ifup eth0", "ip addr eth0 on", "ifconfig eth0 enable"],
    answer: [0, 1],
    exp: "ip link set eth0 up、ifup eth0、ifconfig eth0 up のいずれでも有効にできる（無効は down・ifdown）。NetworkManager を使う環境では ifconfig・ifup・ifdown よりも nmcli や ip が推奨される。"
  },
  {
    id: 2067, cat: "1.07", sec: "1.07/ネットワーク設定コマンド（nmcli・ip・ifconfig）", imp: 2,
    q: "ip addr add 192.168.1.10/24 dev eth0 で設定した IPアドレスについて正しいものはどれか。",
    choices: ["再起動すると消える一時的な設定である", "/etc/hosts に自動で書き込まれる", "DHCP サーバーに登録される", "再起動後も必ず残る"],
    answer: [0],
    exp: "ip や ifconfig で設定した IPアドレスはメモリ上の設定なので、再起動すると消える。恒久的にするには nmcli connection modify や設定ファイルで行う。/etc/hosts は名前解決の表で、IPアドレスの割り当てとは関係ない。"
  },

  /* ===== 1.07 ネットワークの問題解決 ===== */
  {
    id: 2068, cat: "1.07", sec: "1.07/ネットワークの問題解決", imp: 3,
    q: "待ち受け（LISTEN）中の TCP ポートを、数値のままプロセス名と一緒に表示するコマンドはどれか。",
    choices: ["ss -ltnp", "ss -aur", "ping -l", "traceroute -t"],
    answer: [0],
    exp: "ss の -l（listening＝待ち受け）・-t（tcp）・-n（numeric＝数値）・-p（process）を組み合わせる。netstat も同じオプションで使える（netstat -ltnp）。ss は netstat の後継で、最近のディストリビューションでは ss が標準。"
  },
  {
    id: 2069, cat: "1.07", sec: "1.07/ネットワークの問題解決", imp: 3,
    q: "ping で相手のホストにパケットを3回だけ送るオプションはどれか。",
    choices: ["-c 3", "-n 3", "-i 3", "-t 3"],
    answer: [0],
    exp: "Linux の ping は -c（count＝回数）で送信回数を指定する。指定しないと Ctrl+C を押すまで送り続ける。-i は送信間隔（秒）。-n 3 で回数を指定するのは Windows の ping。"
  },
  {
    id: 2070, cat: "1.07", sec: "1.07/ネットワークの問題解決", imp: 3,
    q: "宛先のホストまでに経由するルーター（経路）を表示するコマンドを2つ選べ。",
    choices: ["traceroute", "tracepath", "ping", "nslookup"],
    answer: [0, 1],
    exp: "traceroute と tracepath は経由するルーターを順に表示する（tracepath は root 権限が不要で経路の MTU も表示）。ping は相手と通信できるかの確認、nslookup は DNS の問い合わせ。IPv6 用は traceroute6・tracepath6。"
  },
  {
    id: 2071, cat: "1.07", sec: "1.07/ネットワークの問題解決", imp: 2,
    q: "netstat の後継として、ソケットや待ち受けポートの情報を表示するコマンドはどれか。",
    choices: ["ss", "nc", "ip link", "dig"],
    answer: [0],
    exp: "ss（socket statistics）は netstat の後継で、オプションもほぼ同じ（-a すべて、-l 待ち受け、-n 数値、-t TCP、-u UDP、-p プロセス）。ルーティングテーブルの表示（netstat -r）は ss には無いので ip route を使う。"
  },
  {
    id: 2072, cat: "1.07", sec: "1.07/ネットワークの問題解決", imp: 2,
    q: "nc -l 12345 を実行したときの動作として正しいものはどれか。",
    choices: ["12345番ポートで接続を待ち受け、届いたデータを表示する", "12345番ポートのプロセスを終了する", "ホスト 12345 に ping を送る", "12345 バイトのデータを送信する"],
    answer: [0],
    exp: "nc（netcat）は指定したホスト・ポートとデータをやりとりするコマンド。-l（listen）で待ち受け、相手側は nc ホスト 12345 < ファイル で送る。-u を付けると TCP の代わりに UDP を使う。ポートが開いているかの確認にも使える。"
  },

  /* ===== 1.07 ルーティング ===== */
  {
    id: 2073, cat: "1.07", sec: "1.07/ルーティング", imp: 3,
    q: "ルーティングテーブルを表示するコマンドとして正しいものを2つ選べ。",
    choices: ["route -n", "ip route show", "ip addr show", "ss -r"],
    answer: [0, 1],
    exp: "route（-n で数値表示）、ip route show（ip r）、netstat -r でルーティングテーブルを表示する。ip addr show は IPアドレスの表示。ss には -r でルーティングテーブルを出す機能は無い。"
  },
  {
    id: 2074, cat: "1.07", sec: "1.07/ルーティング", imp: 3,
    q: "ip コマンドで、デフォルトゲートウェイを 192.168.1.1 に設定するものはどれか。",
    choices: ["ip route add default via 192.168.1.1", "ip route add default gw 192.168.1.1", "ip addr add default 192.168.1.1", "ip link add default via 192.168.1.1"],
    answer: [0],
    exp: "ip route ではゲートウェイを via で指定する。route コマンドなら route add default gw 192.168.1.1 と gw で指定する。この違いがよく問われる。宛先 default（0.0.0.0/0）の経路がデフォルトゲートウェイ。"
  },
  {
    id: 2075, cat: "1.07", sec: "1.07/ルーティング", imp: 2,
    q: "route コマンドでデフォルトゲートウェイを 192.168.1.1 に設定するものはどれか。",
    choices: ["route add default gw 192.168.1.1", "route add default via 192.168.1.1", "route set gateway 192.168.1.1", "route -g 192.168.1.1"],
    answer: [0],
    exp: "route add default gw ゲートウェイ で設定する（削除は route del）。via を使うのは ip route の書き方。ルーティングとは、パケットを複数のネットワーク経由で宛先まで届けるための経路を決めること。"
  },

  /* ===== 1.07 クライアント側のDNS設定 ===== */
  {
    id: 2076, cat: "1.07", sec: "1.07/クライアント側のDNS設定", imp: 3,
    q: "問い合わせ先の DNS サーバーを nameserver で指定するファイルはどれか。",
    choices: ["/etc/resolv.conf", "/etc/nsswitch.conf", "/etc/hosts", "/etc/named.conf"],
    answer: [0],
    exp: "/etc/resolv.conf に nameserver DNSサーバーのIP を書く（複数書くと上から順に使う）。search で省略時に補うドメイン、domain で自分のドメインも書ける。/etc/named.conf は DNS サーバー（BIND）側の設定。"
  },
  {
    id: 2077, cat: "1.07", sec: "1.07/クライアント側のDNS設定", imp: 3,
    q: "/etc/hosts と DNS のどちらを先に使って名前解決するかを設定するファイルはどれか。",
    choices: ["/etc/nsswitch.conf", "/etc/resolv.conf", "/etc/hostname", "/etc/services"],
    answer: [0],
    exp: "/etc/nsswitch.conf の hosts: files dns という行で、files（/etc/hosts）→ dns の順に名前解決することを決める。どの DNS サーバーに聞くかは /etc/resolv.conf に書く。"
  },
  {
    id: 2078, cat: "1.07", sec: "1.07/クライアント側のDNS設定", imp: 2,
    q: "dig コマンドで IPアドレス 192.0.2.10 からホスト名を調べる（逆引きする）ものはどれか。",
    choices: ["dig -x 192.0.2.10", "dig -r 192.0.2.10", "dig 192.0.2.10 -t A", "dig @192.0.2.10"],
    answer: [0],
    exp: "dig -x IPアドレス で逆引きする。dig @DNSサーバー ホスト名 タイプ の形で、問い合わせる DNS サーバーやレコードの種類も指定できる。host コマンドなら host 192.0.2.10 のように IPアドレスを渡すだけで逆引きになる。"
  },
  {
    id: 2079, cat: "1.07", sec: "1.07/クライアント側のDNS設定", imp: 2,
    q: "/etc/nsswitch.conf の設定どおり /etc/hosts も含めて名前解決の結果を確認できるコマンドはどれか。",
    choices: ["getent hosts ホスト名", "dig ホスト名", "host ホスト名", "nslookup ホスト名"],
    answer: [0],
    exp: "getent hosts は nsswitch.conf の順番どおり（/etc/hosts や DNS）に名前を引く。dig・host・nslookup は DNS サーバーに直接問い合わせるため /etc/hosts を見ない。getent passwd でユーザー一覧も取得できる。"
  },
  {
    id: 2080, cat: "1.07", sec: "1.07/クライアント側のDNS設定", imp: 2,
    q: "そのドメイン宛てのメールを受け取るメールサーバーを示す DNS レコードはどれか。",
    choices: ["MX", "NS", "PTR", "AAAA"],
    answer: [0],
    exp: "MX（Mail eXchanger）がメールサーバー。NS はそのドメインの DNS サーバー、PTR は逆引き（IP→名前）、A は IPv4・AAAA は IPv6 アドレス、CNAME は別名。host -t mx example.com のように種類を指定して調べる。"
  },

  /* ===== 1.08 ユーザーとグループ ===== */
  {
    id: 2081, cat: "1.08", sec: "1.08/ユーザーとグループ", imp: 3,
    q: "ユーザー neko の UID・GID と所属しているグループを表示するコマンドはどれか。",
    choices: ["id neko", "who neko", "groups -u neko", "whoami neko"],
    answer: [0],
    exp: "id ユーザー名 で UID・プライマリグループの GID・所属するすべてのグループを表示する（省略すると自分）。groups ユーザー名 はグループ名だけを表示。who はログイン中のユーザー、whoami は自分のユーザー名を表示する。"
  },
  {
    id: 2082, cat: "1.08", sec: "1.08/ユーザーとグループ", imp: 2,
    q: "プライマリグループの説明として正しいものはどれか。",
    choices: ["ユーザーが必ず1つ所属する基本のグループで、/etc/passwd の GID 欄に書かれる", "ユーザーが自由に何個でも所属できる追加のグループ", "root だけが所属できる管理用のグループ", "ログイン中のユーザーが自動で入るグループ"],
    answer: [0],
    exp: "ユーザーは必ず1つのプライマリグループに属し、その GID は /etc/passwd の4番目の欄に書かれる。それ以外に所属するグループがサブ（セカンダリ）グループで、/etc/group のメンバー欄に書かれる。ファイルを作ると所有グループはプライマリグループになる。"
  },
  {
    id: 2083, cat: "1.08", sec: "1.08/ユーザーとグループ", imp: 2,
    q: "root ユーザーの UID はどれか。",
    choices: ["0", "1", "100", "1000"],
    answer: [0],
    exp: "root の UID は 0 と決まっている。一般ユーザーは多くのディストリビューションで 1000 から割り当てられる（古い RedHat 系は 500 から）。サービス用のシステムアカウントには小さい番号が使われる。"
  },

  /* ===== 1.08 アカウント情報のファイル ===== */
  {
    id: 2084, cat: "1.08", sec: "1.08/アカウント情報のファイル（passwd・shadow・group）", imp: 3,
    q: "/etc/passwd の各行で、3番目の欄に書かれているものはどれか。",
    choices: ["UID", "GID", "ホームディレクトリ", "暗号化されたパスワード"],
    answer: [0],
    exp: "/etc/passwd は ユーザー名:パスワード(x):UID:GID:コメント:ホームディレクトリ:ログインシェル の7項目。3番目が UID、4番目が GID。パスワード欄は x で、実際の暗号化パスワードは /etc/shadow にある。"
  },
  {
    id: 2085, cat: "1.08", sec: "1.08/アカウント情報のファイル（passwd・shadow・group）", imp: 3,
    q: "暗号化（ハッシュ化）されたパスワードとその有効期限が保存され、root だけが読めるファイルはどれか。",
    choices: ["/etc/shadow", "/etc/passwd", "/etc/group", "/etc/login.defs"],
    answer: [0],
    exp: "/etc/shadow に暗号化されたパスワードと有効期限（最終変更日、最長有効日数など）が入っている。/etc/passwd は誰でも読めるため、パスワードを分けて置く。この仕組みをシャドウパスワードという。"
  },
  {
    id: 2086, cat: "1.08", sec: "1.08/アカウント情報のファイル（passwd・shadow・group）", imp: 3,
    q: "useradd -m でユーザーを作成したとき、ホームディレクトリにコピーされるひな形のファイルが置かれているディレクトリはどれか。",
    choices: ["/etc/skel", "/etc/default", "/home/template", "/usr/share/skel"],
    answer: [0],
    exp: "/etc/skel（skeleton＝骨組み）に置いた .bashrc などが、新しいユーザーのホームディレクトリにコピーされる。全ユーザーに同じ初期設定を配りたいときはここに置く。useradd の既定値は /etc/default/useradd。"
  },
  {
    id: 2087, cat: "1.08", sec: "1.08/アカウント情報のファイル（passwd・shadow・group）", imp: 2,
    q: "/etc/passwd の7番目の欄に /sbin/nologin と書かれているユーザーについて正しいものはどれか。",
    choices: ["対話的にログインできない", "パスワードなしでログインできる", "root 権限でログインする", "ホームディレクトリを持たない"],
    answer: [0],
    exp: "7番目の欄はログインシェル。/sbin/nologin（や /bin/false）が指定されているユーザーはシェルを起動できないためログインできない。サービス用のアカウントによく使われる。"
  },
  {
    id: 2088, cat: "1.08", sec: "1.08/アカウント情報のファイル（passwd・shadow・group）", imp: 2,
    q: "/etc/group の行 animals:x:1001:neko,usagi の説明として正しいものはどれか。",
    choices: ["グループ animals の GID は1001で、neko と usagi がメンバーである", "ユーザー animals の UID は1001である", "neko のプライマリグループの GID は1001ではない", "グループ animals にはパスワードが設定されていない"],
    answer: [0],
    exp: "/etc/group は グループ名:パスワード(x):GID:メンバー の4項目。メンバー欄にはそのグループをサブグループとして持つユーザーがカンマ区切りで並ぶ。x はパスワードが /etc/gshadow にあることを示す。"
  },

  /* ===== 1.08 ユーザー・グループ管理コマンド ===== */
  {
    id: 2089, cat: "1.08", sec: "1.08/ユーザー・グループ管理コマンド", imp: 3,
    q: "ホームディレクトリも作成してユーザー neko を追加するコマンドはどれか。",
    choices: ["useradd -m neko", "useradd -h neko", "usermod -m neko", "useradd -d neko"],
    answer: [0],
    exp: "useradd -m（make home）でホームディレクトリを作成し、/etc/skel の中身をコピーする。-d はホームディレクトリの場所の指定、usermod は既存ユーザーの変更。Debian 系では対話式の adduser も使える。"
  },
  {
    id: 2090, cat: "1.08", sec: "1.08/ユーザー・グループ管理コマンド", imp: 3,
    q: "ユーザー neko を、今所属しているサブグループを残したまま developers グループにも追加するコマンドはどれか。",
    choices: ["usermod -aG developers neko", "usermod -G developers neko", "usermod -g developers neko", "useradd -G developers neko"],
    answer: [0],
    exp: "-a（append＝追加）を -G と一緒に使うと、今のサブグループに追加される。-a を付けない usermod -G は指定したグループだけに置き換わり、他のサブグループから外れてしまう。-g はプライマリグループの変更。"
  },
  {
    id: 2091, cat: "1.08", sec: "1.08/ユーザー・グループ管理コマンド", imp: 3,
    q: "ユーザー neko を削除し、ホームディレクトリもあわせて削除するコマンドはどれか。",
    choices: ["userdel -r neko", "userdel -h neko", "userdel neko", "usermod -d neko"],
    answer: [0],
    exp: "userdel -r（remove）でユーザーとホームディレクトリ（メールスプールも）を削除する。-r を付けない userdel neko ではアカウントだけが消え、ホームディレクトリは残る。"
  },
  {
    id: 2092, cat: "1.08", sec: "1.08/ユーザー・グループ管理コマンド", imp: 3,
    q: "useradd でユーザーを作成するとき、サブグループを指定するオプションはどれか。",
    choices: ["-G", "-g", "-s", "-u"],
    answer: [0],
    exp: "大文字の -G（Groups＝複数）がサブグループ（カンマ区切りで複数可）、小文字の -g がプライマリグループ。-s はログインシェル、-u は UID の指定、-c はコメント、-d はホームディレクトリの場所。"
  },
  {
    id: 2093, cat: "1.08", sec: "1.08/ユーザー・グループ管理コマンド", imp: 2,
    q: "ユーザー neko のパスワードをロックして一時的にログインできなくするコマンドを2つ選べ。",
    choices: ["passwd -l neko", "usermod -L neko", "userdel -l neko", "chage -L neko"],
    answer: [0, 1],
    exp: "passwd -l（lock）と usermod -L（Lock）でパスワードをロックできる（/etc/shadow のパスワードの先頭に ! が付く）。解除は passwd -u・usermod -U。userdel はユーザーの削除で、ロックのオプションは無い。"
  },
  {
    id: 2094, cat: "1.08", sec: "1.08/ユーザー・グループ管理コマンド", imp: 2,
    q: "グループ animals の名前を doubutsu に変更するコマンドはどれか。",
    choices: ["groupmod -n doubutsu animals", "groupmod -g doubutsu animals", "groupadd -n doubutsu animals", "usermod -n doubutsu animals"],
    answer: [0],
    exp: "groupmod -n（new name）新しい名前 元の名前 で変更する。groupmod -g は GID の変更。グループの追加は groupadd、削除は groupdel（プライマリグループとして使われているグループは削除できない）。"
  },
  {
    id: 2095, cat: "1.08", sec: "1.08/ユーザー・グループ管理コマンド", imp: 1,
    q: "新しいグループ animals を作成するコマンドはどれか。",
    choices: ["groupadd animals", "addgroup -n animals", "newgrp animals", "usermod -G animals"],
    answer: [0],
    exp: "groupadd グループ名 でグループを作る（-g で GID を指定）。newgrp は今のシェルのプライマリグループを一時的に切り替えるコマンド。グループの情報は /etc/group と /etc/gshadow に書き込まれる。"
  },

  /* ===== 1.08 ジョブスケジューリング（cron） ===== */
  {
    id: 2096, cat: "1.08", sec: "1.08/ジョブスケジューリング（cron）", imp: 3,
    q: "crontab で「毎週月曜日の9時30分」に実行する指定として正しいものはどれか。",
    choices: ["30 9 * * 1", "9 30 * * 1", "30 9 1 * *", "30 9 * 1 *"],
    answer: [0],
    exp: "crontab の書式は 分 時 日 月 曜日 コマンド。30分・9時・日は*・月は*・曜日は1（月曜）。曜日は0〜7で0と7が日曜。30 9 1 * * は毎月1日、30 9 * 1 * は1月の毎日になる。"
  },
  {
    id: 2097, cat: "1.08", sec: "1.08/ジョブスケジューリング（cron）", imp: 3,
    q: "自分の crontab に登録されている内容を表示するコマンドはどれか。",
    choices: ["crontab -l", "crontab -e", "crontab -r", "crontab -s"],
    answer: [0],
    exp: "crontab -l（list）で一覧表示、-e（edit）で編集、-r（remove）ですべて削除。-e と -r はキーボードで隣どうしなので、間違えて -r を押すと全部消えてしまう点に注意（-i を付けると削除前に確認する）。"
  },
  {
    id: 2098, cat: "1.08", sec: "1.08/ジョブスケジューリング（cron）", imp: 2,
    q: "システム用の /etc/crontab の書式が、ユーザーの crontab と違う点はどれか。",
    choices: ["実行するユーザー名の欄がある", "秒の欄がある", "曜日の欄がない", "コマンドを書く欄がない"],
    answer: [0],
    exp: "/etc/crontab は 分 時 日 月 曜日 ユーザー名 コマンド の形で、どのユーザーとして実行するかの欄が加わる。ユーザーの crontab（crontab -e で編集）にはユーザー名の欄は無い。/etc/cron.d/ の中のファイルも /etc/crontab と同じ書式。"
  },
  {
    id: 2099, cat: "1.08", sec: "1.08/ジョブスケジューリング（cron）", imp: 2,
    q: "/etc/cron.allow と /etc/cron.deny の両方が存在するときの動作として正しいものはどれか。",
    choices: ["cron.allow に書かれたユーザーだけが crontab を使える", "cron.deny に書かれたユーザー以外が使える", "どちらにも書かれていないユーザーだけが使える", "root も含めて誰も使えない"],
    answer: [0],
    exp: "cron.allow があれば、そこに書かれたユーザーだけが使える（allow が優先）。cron.allow が無く cron.deny だけがあるときは、deny に書かれたユーザー以外が使える。at の at.allow・at.deny も同じ考え方。"
  },
  {
    id: 2100, cat: "1.08", sec: "1.08/ジョブスケジューリング（cron）", imp: 2,
    q: "crontab の分の欄に */15 と書いたときの意味はどれか。",
    choices: ["15分ごと", "毎時15分", "15分間だけ", "15時ちょうど"],
    answer: [0],
    exp: "/ は間隔を表し、*/15 は 0・15・30・45 分の15分ごと。毎時15分なら 15、範囲は 1-5 のように - 、列挙は 9,18 のように , で書く。分の値は0〜59。"
  },
  {
    id: 2101, cat: "1.08", sec: "1.08/ジョブスケジューリング（cron）", imp: 1,
    q: "スクリプトを置くだけで1日に1回実行されるディレクトリはどれか。",
    choices: ["/etc/cron.daily/", "/etc/cron.d/", "/var/spool/cron/daily/", "/etc/anacron.d/"],
    answer: [0],
    exp: "/etc/cron.hourly・daily・weekly・monthly に置いた実行可能なスクリプトが、それぞれ1時間・1日・1週間・1か月ごとに実行される。/etc/cron.d/ は crontab 形式のファイルを置く場所。"
  },

  /* ===== 1.08 at と anacron ===== */
  {
    id: 2102, cat: "1.08", sec: "1.08/at と anacron", imp: 3,
    q: "今夜22時に1回だけ backup.sh を実行するよう予約するのに適したコマンドはどれか。",
    choices: ["at", "crontab", "anacron", "batch -r"],
    answer: [0],
    exp: "1回だけの予約は at（例：at -f backup.sh 22:00）。繰り返しの予約は cron（crontab）、電源を切っていた間の定期ジョブを後から実行するのが anacron。at の対話モードは Ctrl+D で登録を終える。"
  },
  {
    id: 2103, cat: "1.08", sec: "1.08/at と anacron", imp: 2,
    q: "登録されている at ジョブの一覧を表示するコマンドを2つ選べ。",
    choices: ["atq", "at -l", "atrm", "at -d"],
    answer: [0, 1],
    exp: "atq（at queue）と at -l で一覧を表示する。削除は atrm ジョブ番号（at -d、at -r も同じ）。at を使えるユーザーは /etc/at.allow と /etc/at.deny で制限する。"
  },
  {
    id: 2104, cat: "1.08", sec: "1.08/at と anacron", imp: 2,
    q: "電源が切れていて実行されなかった日次・週次のジョブを、起動後に実行する仕組みとその設定ファイルの組み合わせはどれか。",
    choices: ["anacron ― /etc/anacrontab", "cron ― /etc/crontab", "at ― /etc/at.allow", "systemd ― /etc/cron.d/"],
    answer: [0],
    exp: "anacron は常時起動していない PC 向けで、実行し損ねた定期ジョブを起動後に実行する。設定は /etc/anacrontab で、周期は日単位（分の指定はできない）。cron は電源が入っていない時刻のジョブを後から実行しない。"
  },

  /* ===== 1.08 ローカライゼーションと国際化 ===== */
  {
    id: 2105, cat: "1.08", sec: "1.08/ローカライゼーションと国際化", imp: 3,
    q: "ロケールの環境変数のうち、他のすべての設定より優先されるものはどれか。",
    choices: ["LC_ALL", "LANG", "LC_CTYPE", "LANGUAGE_DEFAULT"],
    answer: [0],
    exp: "優先順位は LC_ALL ＞ 個別の LC_*（LC_TIME など）＞ LANG。LC_ALL はすべての項目を一括で上書きし、LANG は個別の設定が無い項目の既定値として使われる。"
  },
  {
    id: 2106, cat: "1.08", sec: "1.08/ローカライゼーションと国際化", imp: 2,
    q: "システムで利用できるロケールの一覧を表示するコマンドはどれか。",
    choices: ["locale -a", "locale -m", "localectl status", "echo $LANG"],
    answer: [0],
    exp: "locale -a（all）で利用できるロケールの一覧、locale -m で使える文字コード（キャラクタマップ）の一覧、オプションなしの locale で今の設定を表示する。localectl は systemd でロケールやキーボード配置を表示・設定する。"
  },
  {
    id: 2107, cat: "1.08", sec: "1.08/ローカライゼーションと国際化", imp: 2,
    q: "LANG=C ls /nofile のように、コマンドの前に LANG=C を付けて実行する主な理由はどれか。",
    choices: ["メッセージを英語の標準形式で出し、検索やスクリプトでの処理をしやすくするため", "コマンドを C 言語で再コンパイルするため", "文字コードを Shift_JIS に変換するため", "root 権限で実行するため"],
    answer: [0],
    exp: "LANG=C はその1回のコマンドだけロケールを C（英語・ASCII の標準）にする。エラーメッセージを英語で表示して検索しやすくしたり、日付や数値の出力形式をそろえてスクリプトで扱いやすくしたりするのに使う。"
  },
  {
    id: 2108, cat: "1.08", sec: "1.08/ローカライゼーションと国際化", imp: 1,
    q: "ソフトウェアを多くの言語や地域に対応できる作りにすることを表す略語はどれか。",
    choices: ["i18n", "L10n", "UTF-8", "POSIX"],
    answer: [0],
    exp: "i18n は internationalization（国際化）の略で、i と n の間が18文字。L10n は localization（地域化）で、特定の言語・地域に合わせること。ロケール名は 言語_地域.文字コード（例 ja_JP.UTF-8）の形で書く。"
  },
  {
    id: 2109, cat: "1.08", sec: "1.08/ローカライゼーションと国際化", imp: 2,
    q: "日付や時刻の表示形式を決めるロケールの環境変数はどれか。",
    choices: ["LC_TIME", "LC_COLLATE", "LC_NUMERIC", "LC_MONETARY"],
    answer: [0],
    exp: "LC_TIME が日付・時刻の形式。LC_COLLATE は並び順（ソート順）、LC_NUMERIC は数値の書式、LC_MONETARY は通貨、LC_MESSAGES はメッセージの言語、LC_CTYPE は文字の種類を決める。"
  },

  /* ===== 1.08 文字コードと iconv ===== */
  {
    id: 2110, cat: "1.08", sec: "1.08/文字コードと iconv", imp: 3,
    q: "Shift_JIS で書かれた sjis.txt を UTF-8 に変換して utf8.txt に保存するコマンドはどれか。",
    choices: ["iconv -f SHIFT_JIS -t UTF-8 sjis.txt > utf8.txt", "iconv -f UTF-8 -t SHIFT_JIS sjis.txt > utf8.txt", "iconv -i SHIFT_JIS -o UTF-8 sjis.txt", "locale -t UTF-8 sjis.txt > utf8.txt"],
    answer: [0],
    exp: "iconv -f（from＝変換前）と -t（to＝変換後）で文字コードを指定する。結果は標準出力に出るので > でファイルに保存する。iconv -l で扱える文字コードの一覧を表示できる。"
  },
  {
    id: 2111, cat: "1.08", sec: "1.08/文字コードと iconv", imp: 1,
    q: "7ビットで128種類の英数字・記号を表す文字コードはどれか。",
    choices: ["ASCII", "UTF-8", "ISO-8859-1", "EUC-JP"],
    answer: [0],
    exp: "ASCII は7ビット・128文字。ISO-8859 は8ビットに拡張した欧州向け、UTF-8 は Unicode の符号化方式で1文字を1〜4バイトで表す（ASCII の範囲は1バイトで同じ）。EUC-JP は UNIX 系の日本語。"
  },
  {
    id: 2112, cat: "1.08", sec: "1.08/文字コードと iconv", imp: 1,
    q: "Windows で主に使われてきた日本語の文字コードはどれか。",
    choices: ["Shift_JIS", "EUC-JP", "ISO-2022-JP", "ASCII"],
    answer: [0],
    exp: "Shift_JIS は Windows（マイクロソフト系）、EUC-JP は UNIX 系、ISO-2022-JP（JIS）は電子メールで使われてきた日本語の文字コード。現在は UTF-8 が主流。"
  },

  /* ===== 1.09 システムクロックとハードウェアクロック ===== */
  {
    id: 2113, cat: "1.09", sec: "1.09/システムクロックとハードウェアクロック", imp: 3,
    q: "システムクロックの時刻をハードウェアクロックに書き込むコマンドを2つ選べ。",
    choices: ["hwclock -w", "hwclock --systohc", "hwclock -s", "hwclock --hctosys"],
    answer: [0, 1],
    exp: "-w・--systohc（system to hardware clock）でシステム→ハードウェア。-s・--hctosys（hardware clock to system）はハードウェア→システムで逆向き。hwclock -r（--show）でハードウェアクロックを表示する。"
  },
  {
    id: 2114, cat: "1.09", sec: "1.09/システムクロックとハードウェアクロック", imp: 2,
    q: "コンピュータの電源を切っても時刻が保たれる時計はどれか。",
    choices: ["ハードウェアクロック", "システムクロック", "ソフトウェアタイマー", "カーネルクロック"],
    answer: [0],
    exp: "ハードウェアクロック（RTC）はマザーボード上の電池で動く時計で、電源を切っても消えない。システムクロックはカーネルがメモリ上で管理する時刻で、電源を切ると消える。起動時にハードウェアクロックから読み込まれる。"
  },
  {
    id: 2115, cat: "1.09", sec: "1.09/システムクロックとハードウェアクロック", imp: 1,
    q: "date コマンドの書式指定で、分を表す記号はどれか。",
    choices: ["%M", "%m", "%n", "%H"],
    answer: [0],
    exp: "大文字の %M が分、小文字の %m は月、%H は時、%Y は西暦4桁、%d は日、%S は秒。例：date \"+%Y/%m/%d %H:%M\" で 2022/05/04 12:12 のように表示する。"
  },

  /* ===== 1.09 タイムゾーン ===== */
  {
    id: 2116, cat: "1.09", sec: "1.09/タイムゾーン", imp: 3,
    q: "システムのタイムゾーンを表すファイルで、/usr/share/zoneinfo 以下のファイルのコピーまたはシンボリックリンクになっているものはどれか。",
    choices: ["/etc/localtime", "/etc/timezone.conf", "/etc/sysconfig/clock", "/etc/zoneinfo"],
    answer: [0],
    exp: "/etc/localtime がシステムのタイムゾーン。cp や ln -s で /usr/share/zoneinfo/Asia/Tokyo を /etc/localtime に置いて設定する。systemd の環境では timedatectl set-timezone Asia/Tokyo でも同じことができる。"
  },
  {
    id: 2117, cat: "1.09", sec: "1.09/タイムゾーン", imp: 2,
    q: "timedatectl でタイムゾーンを Asia/Tokyo に設定するコマンドはどれか。",
    choices: ["timedatectl set-timezone Asia/Tokyo", "timedatectl timezone Asia/Tokyo", "timedatectl set-time Asia/Tokyo", "timedatectl -z Asia/Tokyo"],
    answer: [0],
    exp: "set-timezone でタイムゾーンを設定する。set-time は日時の設定、list-timezones は一覧、set-ntp yes は NTP による同期の有効化、status（省略可）は状態の表示。"
  },
  {
    id: 2118, cat: "1.09", sec: "1.09/タイムゾーン", imp: 2,
    q: "システム全体の設定を変えずに、自分のシェルだけタイムゾーンを変更するために使う環境変数はどれか。",
    choices: ["TZ", "LC_TIME", "LANG", "ZONE"],
    answer: [0],
    exp: "環境変数 TZ を設定するとそのユーザー・コマンドだけタイムゾーンが変わる（例：export TZ=\"Asia/Tokyo\"）。LC_TIME は日付の表示形式でタイムゾーンは変わらない。tzselect は選択式でタイムゾーン名を調べるコマンド。"
  },

  /* ===== 1.09 NTP と chrony ===== */
  {
    id: 2119, cat: "1.09", sec: "1.09/NTP と chrony", imp: 2,
    q: "chronyd の設定ファイルはどれか。",
    choices: ["/etc/chrony.conf", "/etc/ntp.conf", "/etc/chronyd/chronyd.conf", "/etc/timesyncd.conf"],
    answer: [0],
    exp: "chronyd の設定は /etc/chrony.conf（Debian 系は /etc/chrony/chrony.conf）、ntpd の設定は /etc/ntp.conf。chronyd と ntpd はどちらか一方だけを使う。chrony は ntp に代わる新しい実装。"
  },
  {
    id: 2120, cat: "1.09", sec: "1.09/NTP と chrony", imp: 2,
    q: "chronyc で、時刻の参照先となっている NTP サーバーの一覧を表示するサブコマンドはどれか。",
    choices: ["sources", "tracking", "activity", "makestep"],
    answer: [0],
    exp: "chronyc sources で参照先の一覧、tracking で現在の同期状態（ずれの大きさなど）、activity でオンライン・オフラインのサーバー数、makestep で時刻を一気に合わせる。サブコマンドを省くと対話モードになる。"
  },
  {
    id: 2121, cat: "1.09", sec: "1.09/NTP と chrony", imp: 1,
    q: "NTP の階層（Stratum）の説明として正しいものはどれか。",
    choices: ["数字が小さいほど原子時計などの基準に近く正確である", "数字が大きいほど正確である", "Stratum は NTP サーバーの台数を表す", "Stratum 1 のサーバーは時刻を他に配れない"],
    answer: [0],
    exp: "原子時計など基準となる時計が Stratum 0、それに直結するサーバーが Stratum 1、そこから時刻を受け取るサーバーが Stratum 2…と下がっていく。数字が小さいほど基準に近い。NTP は UDP の123番を使う。"
  },
  {
    id: 2122, cat: "1.09", sec: "1.09/NTP と chrony", imp: 1,
    q: "NTP サーバー ntp.nict.jp から一度だけ時刻を取得して合わせる、古くからあるコマンドはどれか。",
    choices: ["ntpdate ntp.nict.jp", "ntpq ntp.nict.jp", "hwclock ntp.nict.jp", "date --ntp ntp.nict.jp"],
    answer: [0],
    exp: "ntpdate サーバー で一度だけ時刻を合わせる。常に同期し続けるには ntpd（または chronyd）を起動しておく。ntpq -p は ntpd が参照しているサーバーの状態を表示する。"
  },

  /* ===== 1.09 システムログ（rsyslog） ===== */
  {
    id: 2123, cat: "1.09", sec: "1.09/システムログ（rsyslog）", imp: 3,
    q: "rsyslog の設定ファイルはどれか。",
    choices: ["/etc/rsyslog.conf", "/etc/syslog-ng.conf", "/etc/systemd/journald.conf", "/etc/logrotate.conf"],
    answer: [0],
    exp: "rsyslogd の設定は /etc/rsyslog.conf（追加分は /etc/rsyslog.d/）。journald.conf は systemd-journald、logrotate.conf はログローテーションの設定。rsyslog は昔の syslogd の後継で、他に syslog-ng という実装もある。"
  },
  {
    id: 2124, cat: "1.09", sec: "1.09/システムログ（rsyslog）", imp: 3,
    q: "rsyslog のルールの書式として正しいものはどれか。",
    choices: ["ファシリティ.プライオリティ　出力先", "プライオリティ.ファシリティ　出力先", "出力先　ファシリティ:プライオリティ", "ファシリティ　出力先　プライオリティ"],
    answer: [0],
    exp: "ファシリティ（どこからのログか）.プライオリティ（重要度） 出力先 の形で書く。例：authpriv.* /var/log/secure、mail.err /var/log/maillog。複数の条件は ; でつなぐ（*.info;mail.none など）。"
  },
  {
    id: 2125, cat: "1.09", sec: "1.09/システムログ（rsyslog）", imp: 3,
    q: "rsyslog の設定で mail.=err と書いたときに記録されるログはどれか。",
    choices: ["mail ファシリティの err だけ", "mail ファシリティの err 以上", "mail ファシリティの err 以外すべて", "すべてのファシリティの err"],
    answer: [0],
    exp: "= を付けるとそのプライオリティだけを記録する。mail.err と書くと err 以上（err・crit・alert・emerg）が対象になる。mail.!err は err 以上を除く、mail.none は mail のログを記録しない。"
  },
  {
    id: 2126, cat: "1.09", sec: "1.09/システムログ（rsyslog）", imp: 3,
    q: "rsyslog のプライオリティのうち、最も重要度（緊急度）が高いものはどれか。",
    choices: ["emerg", "crit", "alert", "err"],
    answer: [0],
    exp: "重要度は高い順に emerg・alert・crit・err・warning・notice・info・debug。emerg はシステムが使えない緊急事態。none は「記録しない」の指定でプライオリティの段階ではない。"
  },
  {
    id: 2127, cat: "1.09", sec: "1.09/システムログ（rsyslog）", imp: 3,
    q: "rsyslog で、ログを logserver というホストへ TCP で転送する出力先の書き方はどれか。",
    choices: ["@@logserver", "@logserver", "tcp://logserver", ">logserver"],
    answer: [0],
    exp: "@@ホスト が TCP、@ホスト が UDP での転送。受け取る側の rsyslog では imtcp（TCP）や imudp（UDP）のモジュールを有効にして待ち受ける。syslog は UDP の514番を使う。"
  },
  {
    id: 2128, cat: "1.09", sec: "1.09/システムログ（rsyslog）", imp: 2,
    q: "ログインや su・sudo などの認証に関するログのファシリティはどれか。",
    choices: ["authpriv（auth）", "kern", "daemon", "local0"],
    answer: [0],
    exp: "認証関係は auth・authpriv。kern はカーネル、daemon は各種デーモン、cron は cron、mail はメール、local0〜local7 は独自の用途に割り当てる。RedHat 系では authpriv のログは /var/log/secure に記録される。"
  },
  {
    id: 2129, cat: "1.09", sec: "1.09/システムログ（rsyslog）", imp: 2,
    q: "ファシリティ user・プライオリティ err でテスト用のログを出力するコマンドはどれか。",
    choices: ["logger -p user.err \"test\"", "logger -f user.err \"test\"", "syslog -p user.err \"test\"", "journalctl -p user.err \"test\""],
    answer: [0],
    exp: "logger -p ファシリティ.プライオリティ でログを送る。-t でタグを付けられる。設定したルールどおりに記録されるかの確認に使う。journalctl はログを読むコマンドで、書き込みには使わない。"
  },
  {
    id: 2130, cat: "1.09", sec: "1.09/システムログ（rsyslog）", imp: 2,
    q: "他のホストから送られてくるログを受信するために rsyslog で有効にするモジュールを2つ選べ。",
    choices: ["imudp", "imtcp", "imklog", "imuxsock"],
    answer: [0, 1],
    exp: "imudp（UDP）と imtcp（TCP）が他のホストからのログの受信用。imklog はカーネルのログ、imuxsock はローカルの UNIX ソケット経由のログ、imjournal は systemd-journald からログを受け取る。"
  },

  /* ===== 1.09 systemd-journald と journalctl ===== */
  {
    id: 2131, cat: "1.09", sec: "1.09/systemd-journald と journalctl", imp: 3,
    q: "sshd サービスのログだけを journalctl で表示するオプションはどれか。",
    choices: ["-u sshd", "-s sshd", "-p sshd", "-f sshd"],
    answer: [0],
    exp: "-u（unit）でサービス（ユニット）を指定する。-p はプライオリティでの絞り込み（例 -p err）、-f は追いかけて表示、-b は今回の起動以降、-k はカーネルのメッセージだけ。"
  },
  {
    id: 2132, cat: "1.09", sec: "1.09/systemd-journald と journalctl", imp: 2,
    q: "今回の起動以降に記録されたログだけを journalctl で表示するオプションはどれか。",
    choices: ["-b", "-r", "-e", "-n"],
    answer: [0],
    exp: "-b（boot）で今回の起動以降、-b -1 で前回の起動時のログ。-r は新しい順、-e は末尾から表示、-n 行数 は最新の n 行だけ。期間は --since と --until で指定する。"
  },
  {
    id: 2133, cat: "1.09", sec: "1.09/systemd-journald と journalctl", imp: 2,
    q: "新しく記録されるログを tail -f のように追いかけて表示する journalctl のオプションはどれか。",
    choices: ["-f", "-t", "-x", "-a"],
    answer: [0],
    exp: "-f（follow）で新しいログを追いかけて表示し続ける（Ctrl+C で終了）。ファイルのログなら tail -f /var/log/messages が同じ役割。"
  },
  {
    id: 2134, cat: "1.09", sec: "1.09/systemd-journald と journalctl", imp: 2,
    q: "systemd-journald のログを再起動後も残る（永続化する）ようにする方法として正しいものはどれか。",
    choices: ["/var/log/journal ディレクトリを作成する（または journald.conf で Storage=persistent にする）", "/run/log/journal を削除する", "rsyslog.conf に journal=on と書く", "journalctl --save を実行する"],
    answer: [0],
    exp: "既定ではジャーナルは /run/log/journal（再起動で消える）に保存される。/var/log/journal を作るか、/etc/systemd/journald.conf で Storage=persistent にすると永続化される。容量は journalctl --disk-usage で確認できる。"
  },
  {
    id: 2135, cat: "1.09", sec: "1.09/systemd-journald と journalctl", imp: 2,
    q: "systemd-journald の設定ファイルはどれか。",
    choices: ["/etc/systemd/journald.conf", "/etc/journal.conf", "/etc/rsyslog.d/journal.conf", "/var/log/journal/journald.conf"],
    answer: [0],
    exp: "systemd-journald の設定は /etc/systemd/journald.conf（保存先 Storage、容量の上限 SystemMaxUse など）。rsyslog は imjournal モジュールで journald からログを受け取り、テキストのファイルに書き出せる。"
  },

  /* ===== 1.09 ログローテーション ===== */
  {
    id: 2136, cat: "1.09", sec: "1.09/ログローテーション", imp: 3,
    q: "logrotate の全体の設定ファイルはどれか。",
    choices: ["/etc/logrotate.conf", "/etc/rsyslog.conf", "/etc/cron.daily/logrotate.conf", "/var/log/logrotate"],
    answer: [0],
    exp: "全体の設定は /etc/logrotate.conf、ソフトウェアごとの設定は /etc/logrotate.d/ に置く。logrotate 自体は cron（/etc/cron.daily/logrotate）などから毎日起動される。"
  },
  {
    id: 2137, cat: "1.09", sec: "1.09/ログローテーション", imp: 2,
    q: "logrotate の設定で、古いログを何世代残すかを指定する項目はどれか。",
    choices: ["rotate", "create", "compress", "missingok"],
    answer: [0],
    exp: "rotate 4 なら4世代（messages.1〜messages.4）を残し、それより古いものは削除する。create はリネーム後に新しいファイルを作る、compress は古いログを gzip で圧縮、missingok はログが無くてもエラーにしない。"
  },
  {
    id: 2138, cat: "1.09", sec: "1.09/ログローテーション", imp: 2,
    q: "logrotate の設定で、ローテーションした古いログを gzip で圧縮する項目はどれか。",
    choices: ["compress", "zip", "delaycompress", "archive"],
    answer: [0],
    exp: "compress で圧縮、nocompress で圧縮しない。delaycompress は直前の1世代だけ圧縮を後回しにする（compress と一緒に使う）。周期は daily・weekly・monthly・yearly で指定する。"
  },

  /* ===== 1.09 メールの仕組みとMTA ===== */
  {
    id: 2139, cat: "1.09", sec: "1.09/メールの仕組みとMTA", imp: 2,
    q: "MTA（メール転送エージェント）のソフトウェアを2つ選べ。",
    choices: ["postfix", "exim", "Thunderbird", "dovecot"],
    answer: [0, 1],
    exp: "postfix（sendmail 互換で使いやすい）と exim（Debian 系で標準的）が MTA。他に sendmail・qmail がある。Thunderbird はメールを読み書きする MUA、dovecot は POP3・IMAP サーバー。"
  },
  {
    id: 2140, cat: "1.09", sec: "1.09/メールの仕組みとMTA", imp: 3,
    q: "/etc/aliases を編集した後、その内容を反映させるために実行するコマンドはどれか。",
    choices: ["newaliases", "mailq", "postalias -l", "systemctl reload aliases"],
    answer: [0],
    exp: "newaliases で /etc/aliases からデータベース（/etc/aliases.db）を作り直して反映する。/etc/aliases はシステム全体のメールの別名・転送先、ユーザー個人の転送先は ~/.forward に書く。"
  },
  {
    id: 2141, cat: "1.09", sec: "1.09/メールの仕組みとMTA", imp: 2,
    q: "送信待ちのメールキューの内容を表示するコマンドはどれか。",
    choices: ["mailq", "newaliases", "mail -q", "postqueue -r"],
    answer: [0],
    exp: "mailq で送信待ちのメール（キュー）を表示する（sendmail -bp と同じ）。newaliases はエイリアスの反映、mail は簡単なメールの送受信コマンド。"
  },
  {
    id: 2142, cat: "1.09", sec: "1.09/メールの仕組みとMTA", imp: 2,
    q: "一般ユーザーが、自分宛てのメールを別のアドレスへ転送するために作成するファイルはどれか。",
    choices: ["~/.forward", "/etc/aliases", "~/.mailrc", "/etc/mail/forward"],
    answer: [0],
    exp: "ホームディレクトリに ~/.forward を作って転送先を書くと、そのユーザー宛てのメールが転送される。/etc/aliases はシステム全体の設定で root が編集し、newaliases で反映する。"
  },
  {
    id: 2143, cat: "1.09", sec: "1.09/メールの仕組みとMTA", imp: 1,
    q: "メールの送受信に関わるソフトウェアの説明として正しいものはどれか。",
    choices: ["MTA はメールをメールサーバー間で転送する", "MUA は受け取ったメールをメールボックスに配達する", "MDA はメールを作成して表示する", "MTA は POP3 でメールを受信する"],
    answer: [0],
    exp: "MTA（Mail Transfer Agent）は SMTP でメールをサーバー間で転送する。MUA（Mail User Agent）はメールを書いて読むソフト、MDA（Mail Delivery Agent）は届いたメールをメールボックスに配達する。受信は POP3 や IMAP。"
  },
  {
    id: 2144, cat: "1.09", sec: "1.09/メールの仕組みとMTA", imp: 1,
    q: "どの MTA が動いているかを調べるため、使用しているプロセスを確認するとよいポート番号はどれか。",
    choices: ["25", "110", "143", "53"],
    answer: [0],
    exp: "MTA は SMTP の25番ポートで待ち受けるので、ss -atnp | grep 25 や netstat -atnp | grep 25 で25番を使うプロセスを見ると、動いている MTA がわかる。110 は POP3、143 は IMAP、53 は DNS。"
  },

  /* ===== 1.10 ローカルセキュリティの管理 ===== */
  {
    id: 2145, cat: "1.10", sec: "1.10/ローカルセキュリティの管理", imp: 3,
    q: "SUID が設定されているファイルをシステム全体から探すコマンドはどれか。",
    choices: ["find / -perm -u+s", "find / -type s", "find / -user root -s", "find / -perm -o+w"],
    answer: [0],
    exp: "find の -perm -u+s（-4000 でも同じ）で SUID の付いたファイルを探す。SGID なら -g+s（-2000）。SUID 付きのファイルは所有者（多くは root）の権限で動くため、不要なものが無いか定期的に点検する。-type s はソケットファイルの検索。"
  },
  {
    id: 2146, cat: "1.10", sec: "1.10/ローカルセキュリティの管理", imp: 2,
    q: "ファイル /usr/local/bin/tool から SUID を外すコマンドはどれか。",
    choices: ["chmod u-s /usr/local/bin/tool", "chmod g-s /usr/local/bin/tool", "chmod o-x /usr/local/bin/tool", "chown -s /usr/local/bin/tool"],
    answer: [0],
    exp: "chmod u-s で所有者（user）から SUID（s）を外す。g-s なら SGID を外す。数値で指定するなら先頭の 4（SUID）を除いた値にする（例：4755 → 755）。"
  },

  /* ===== 1.10 パスワードの有効期限（chage） ===== */
  {
    id: 2147, cat: "1.10", sec: "1.10/パスワードの有効期限（chage）", imp: 3,
    q: "ユーザー testuser のパスワードやアカウントの有効期限の情報を表示するコマンドはどれか。",
    choices: ["chage -l testuser", "passwd -e testuser", "chage -E testuser", "usermod -l testuser"],
    answer: [0],
    exp: "chage -l（list）で最終変更日・有効期限・警告日数などを表示する。chage -E はアカウントの失効日の設定、usermod -l はユーザー名の変更。有効期限の情報は /etc/shadow に保存されている。"
  },
  {
    id: 2148, cat: "1.10", sec: "1.10/パスワードの有効期限（chage）", imp: 2,
    q: "testuser のパスワードの最長有効日数を30日にするコマンドはどれか。",
    choices: ["chage -M 30 testuser", "chage -m 30 testuser", "chage -W 30 testuser", "chage -I 30 testuser"],
    answer: [0],
    exp: "大文字の -M（Max）が最長有効日数、小文字の -m（min）が次に変更できるまでの最短日数。-W（Warn）は期限切れの何日前から警告するか、-I（Inactive）は期限切れから何日でロックするか。"
  },
  {
    id: 2149, cat: "1.10", sec: "1.10/パスワードの有効期限（chage）", imp: 1,
    q: "chage でアカウントを無効にする日付（失効日）を設定するオプションはどれか。",
    choices: ["-E", "-d", "-l", "-x"],
    answer: [0],
    exp: "-E（Expire）でアカウントの失効日を設定する。-d は最終変更日の設定で、-d 0 にすると次回ログイン時にパスワードの変更を強制できる。オプションを付けずに chage ユーザー名 とすると対話形式で設定できる。"
  },

  /* ===== 1.10 開いているポートの確認 ===== */
  {
    id: 2150, cat: "1.10", sec: "1.10/開いているポートの確認", imp: 3,
    q: "ネットワーク越しに、指定したホストで開いているポートを調べる（ポートスキャンする）コマンドはどれか。",
    choices: ["nmap", "lsof", "fuser", "who"],
    answer: [0],
    exp: "nmap ホスト で外から開いているポートを調べる（ポートスキャン）。自分の管理するホスト以外に使うと攻撃とみなされる。lsof -i と fuser は自分のホストでポートを使っているプロセスを調べる。"
  },
  {
    id: 2151, cat: "1.10", sec: "1.10/開いているポートの確認", imp: 2,
    q: "自分のホストで、ポートを開いているプロセスを調べるコマンドを2つ選べ。",
    choices: ["lsof -i", "fuser -n tcp 22", "nmap -P", "last -i"],
    answer: [0, 1],
    exp: "lsof -i（list open files）はネットワークを開いているプロセスの一覧、fuser -n tcp 22（fuser 22/tcp）は22番を使っているプロセスの PID を表示する（-k でそのプロセスを終了）。ss -atup も同じ目的で使える。last はログイン履歴。"
  },

  /* ===== 1.10 ログイン状況の確認 ===== */
  {
    id: 2152, cat: "1.10", sec: "1.10/ログイン状況の確認", imp: 3,
    q: "ユーザーのログイン履歴を表示するコマンドはどれか。",
    choices: ["last", "who", "w", "id"],
    answer: [0],
    exp: "last は /var/log/wtmp を読んでログイン・ログアウトの履歴を表示する。who と w は今ログインしているユーザーの表示（w は各ユーザーが実行中の内容も）。失敗したログインの履歴は lastb、最終ログインは lastlog。"
  },
  {
    id: 2153, cat: "1.10", sec: "1.10/ログイン状況の確認", imp: 2,
    q: "ログイン中のユーザーと、それぞれが今実行している処理を表示するコマンドはどれか。",
    choices: ["w", "who", "last", "lastlog"],
    answer: [0],
    exp: "w はログイン中のユーザーに加えて、実行中のコマンドやアイドル時間、システムの負荷平均も表示する。who はログイン中のユーザーと端末・ログイン時刻だけを表示する。"
  },
  {
    id: 2154, cat: "1.10", sec: "1.10/ログイン状況の確認", imp: 1,
    q: "last コマンドが読み込んでいるログイン履歴のファイルはどれか。",
    choices: ["/var/log/wtmp", "/var/log/btmp", "/var/log/secure", "/var/run/utmp"],
    answer: [0],
    exp: "last は /var/log/wtmp（ログイン履歴）を読む。lastb は /var/log/btmp（失敗したログイン）、who は /var/run/utmp（今ログイン中のユーザー）を読む。いずれもバイナリなので cat では読めない。"
  },

  /* ===== 1.10 リソース制限（ulimit） ===== */
  {
    id: 2155, cat: "1.10", sec: "1.10/リソース制限（ulimit）", imp: 2,
    q: "現在設定されているリソースの制限を一覧表示するコマンドはどれか。",
    choices: ["ulimit -a", "ulimit -l", "limits -a", "ulimit --show"],
    answer: [0],
    exp: "ulimit -a（all）で今の制限を一覧表示する。unlimited は制限なし。ulimit はシェルとそこから起動したプロセスに適用され、恒久的に設定するには /etc/security/limits.conf を使う。"
  },
  {
    id: 2156, cat: "1.10", sec: "1.10/リソース制限（ulimit）", imp: 2,
    q: "ulimit で、ユーザーが起動できるプロセス数の上限を設定するオプションはどれか。",
    choices: ["-u", "-n", "-f", "-c"],
    answer: [0],
    exp: "-u（user processes）がプロセス数、-n は同時に開けるファイルの数、-f は作れるファイルの最大サイズ、-c はコアファイルのサイズ（0で作らない）、-v は使える仮想メモリ。"
  },
  {
    id: 2157, cat: "1.10", sec: "1.10/リソース制限（ulimit）", imp: 1,
    q: "ユーザーごとのリソース制限を恒久的に設定するファイルはどれか。",
    choices: ["/etc/security/limits.conf", "/etc/ulimit.conf", "/etc/login.defs", "/etc/profile.d/limits"],
    answer: [0],
    exp: "/etc/security/limits.conf に ユーザー（@グループ） 種類 項目 値 の形で書き、ログイン時に PAM の pam_limits で適用される。/etc/login.defs はパスワードの有効期限や UID の範囲など新規ユーザーの既定値。"
  },

  /* ===== 1.10 su と sudo ===== */
  {
    id: 2158, cat: "1.10", sec: "1.10/su と sudo", imp: 3,
    q: "sudo の設定ファイル /etc/sudoers を、文法チェック付きで安全に編集するコマンドはどれか。",
    choices: ["visudo", "vi /etc/sudoers", "sudo -e", "sudoedit -c"],
    answer: [0],
    exp: "visudo は編集後に文法をチェックし、誤りがあれば保存前に警告する。vi で直接編集して書き間違えると sudo が使えなくなるおそれがある。追加の設定は /etc/sudoers.d/ に置くこともできる。"
  },
  {
    id: 2159, cat: "1.10", sec: "1.10/su と sudo", imp: 3,
    q: "一般ユーザーが sudo でコマンドを実行するときに入力を求められるパスワードはどれか。",
    choices: ["自分（そのユーザー）のパスワード", "root のパスワード", "/etc/sudoers に書かれたパスワード", "パスワードは一切求められない"],
    answer: [0],
    exp: "sudo は自分のパスワードで、/etc/sudoers で許可されたコマンドだけを root などの権限で実行する。su は切り替え先（root）のパスワードが必要。sudoers に NOPASSWD: を書けばパスワード入力を省ける。"
  },
  {
    id: 2160, cat: "1.10", sec: "1.10/su と sudo", imp: 2,
    q: "root のログインシェルとして（root の環境変数やホームディレクトリに切り替えて）root になるコマンドはどれか。",
    choices: ["su -", "su", "sudo -l", "sudo -u root"],
    answer: [0],
    exp: "su -（su -l、su --login）はログインシェルとして切り替え、root の環境変数・ホームディレクトリになる。- を付けない su は今の環境変数のまま root になる。元のユーザーに戻るのは exit。"
  },
  {
    id: 2161, cat: "1.10", sec: "1.10/su と sudo", imp: 2,
    q: "自分が sudo で実行を許可されているコマンドを確認するコマンドはどれか。",
    choices: ["sudo -l", "sudo -i", "sudo -s", "sudo -k"],
    answer: [0],
    exp: "sudo -l（list）で許可されているコマンドを表示する。-u ユーザー で root 以外のユーザーとして実行、-i は対象ユーザーのログインシェルを起動、-s はシェルを起動する。"
  },
  {
    id: 2162, cat: "1.10", sec: "1.10/su と sudo", imp: 2,
    q: "/etc/sudoers で、testuser にパスワードなしで /usr/sbin/shutdown だけを root 権限で実行させる記述はどれか。",
    choices: ["testuser ALL=(ALL) NOPASSWD: /usr/sbin/shutdown", "testuser NOPASSWD=(ALL) /usr/sbin/shutdown", "ALL testuser=(ALL) /usr/sbin/shutdown NOPASS", "testuser: shutdown ALL NOPASSWD"],
    answer: [0],
    exp: "書式は だれが どのホストで=(だれとして) 何を。NOPASSWD: をコマンドの前に書くとパスワードを聞かれない。% を付けるとグループの指定になる（例：%wheel ALL=(ALL) ALL）。編集は visudo で行う。"
  },

  /* ===== 1.10 自動ログアウトとログインの禁止 ===== */
  {
    id: 2163, cat: "1.10", sec: "1.10/自動ログアウトとログインの禁止", imp: 3,
    q: "操作が無いまま一定時間が過ぎたシェルを自動でログアウトさせるために設定する変数はどれか。",
    choices: ["TMOUT", "TIMEOUT", "HISTSIZE", "LOGOUT"],
    answer: [0],
    exp: "TMOUT に秒数を入れる（例：export TMOUT=600 で10分）。~/.bashrc や /etc/profile に書いておけば毎回設定しなくてよい。HISTSIZE はコマンド履歴の件数で、ログアウトとは関係ない。"
  },
  {
    id: 2164, cat: "1.10", sec: "1.10/自動ログアウトとログインの禁止", imp: 3,
    q: "/etc/nologin ファイルが存在するときの動作として正しいものはどれか。",
    choices: ["root 以外のユーザーはログインできなくなる", "root だけがログインできなくなる", "すべてのユーザーがパスワードなしでログインできる", "SSH 以外でのログインだけが禁止される"],
    answer: [0],
    exp: "/etc/nologin があると root 以外の一般ユーザーはログインできない（中身はログインを断るときに表示される）。メンテナンス中に一時的に使い、終わったら削除する。特定ユーザーだけ止めるならログインシェルを /sbin/nologin にする。"
  },

  /* ===== 1.10 不要なサービスの停止 ===== */
  {
    id: 2165, cat: "1.10", sec: "1.10/不要なサービスの停止", imp: 3,
    q: "httpd サービスが次回のシステム起動時から自動で起動しないようにするコマンドはどれか。",
    choices: ["systemctl disable httpd", "systemctl stop httpd", "systemctl kill httpd", "systemctl reload httpd"],
    answer: [0],
    exp: "systemctl disable で次回起動時から自動起動しなくなる。stop は今止めるだけで、自動起動の設定が残っていれば再起動後にまた動く。両方まとめて行うなら systemctl disable --now httpd。"
  },
  {
    id: 2166, cat: "1.10", sec: "1.10/不要なサービスの停止", imp: 2,
    q: "要求が来たときにだけ各サービスを起動する、スーパーサーバーと呼ばれるものを2つ選べ。",
    choices: ["inetd", "xinetd", "httpd", "crond"],
    answer: [0, 1],
    exp: "inetd（設定は /etc/inetd.conf）と xinetd（設定は /etc/xinetd.conf と /etc/xinetd.d/、サービスごとに disable = yes で無効化）がスーパーサーバー。普段は自分だけが待ち受け、要求があったときに各サービスを起動する。"
  },
  {
    id: 2167, cat: "1.10", sec: "1.10/不要なサービスの停止", imp: 1,
    q: "TCP Wrapper で、アクセスを許可するホストを書くファイルはどれか。",
    choices: ["/etc/hosts.allow", "/etc/hosts.deny", "/etc/hosts", "/etc/security/access.conf"],
    answer: [0],
    exp: "TCP Wrapper は /etc/hosts.allow（許可）と /etc/hosts.deny（拒否）でアクセスを制御し、allow が先に調べられる。どちらにも当てはまらなければ許可される。/etc/hosts は名前解決の表。"
  },

  /* ===== 1.10 ファイアウォール ===== */
  {
    id: 2168, cat: "1.10", sec: "1.10/ファイアウォール", imp: 2,
    q: "RedHat 系で標準的に使われ、ゾーン単位で許可するサービスを設定するファイアウォールの仕組みとコマンドの組み合わせはどれか。",
    choices: ["firewalld ― firewall-cmd", "ufw ― ufw", "netfilter ― iptables-save", "xinetd ― xinetd.conf"],
    answer: [0],
    exp: "firewalld は public・home などのゾーンに許可するサービスやポートを設定し、firewall-cmd で操作する（--permanent で恒久化し --reload で反映）。ufw は Ubuntu 向けの簡単なツール。実際の処理はカーネルの netfilter が行う。"
  },
  {
    id: 2169, cat: "1.10", sec: "1.10/ファイアウォール", imp: 1,
    q: "iptables のルールで、パケットを破棄して相手に何も返さない動作（ターゲット）はどれか。",
    choices: ["DROP", "ACCEPT", "REJECT", "FORWARD"],
    answer: [0],
    exp: "DROP は黙って破棄、REJECT は拒否したことを相手に返す、ACCEPT は通過を許可。FORWARD は動作ではなくチェイン（INPUT・OUTPUT・FORWARD）の1つで、自分を経由して転送するパケットを扱う。ルールの一覧は iptables -L。"
  },

  /* ===== 1.10 SSHと公開鍵認証 ===== */
  {
    id: 2170, cat: "1.10", sec: "1.10/SSHと公開鍵認証", imp: 3,
    q: "SSH の公開鍵認証で使う鍵のペア（秘密鍵と公開鍵）を作成するコマンドはどれか。",
    choices: ["ssh-keygen", "ssh-agent", "ssh-add", "ssh-copy-id"],
    answer: [0],
    exp: "ssh-keygen で鍵ペアを作る（-t ed25519・-t rsa・-t ecdsa で種類を指定）。ssh-copy-id は公開鍵を相手に登録、ssh-agent は秘密鍵を預かる常駐プログラム、ssh-add は秘密鍵を ssh-agent に登録する。"
  },
  {
    id: 2171, cat: "1.10", sec: "1.10/SSHと公開鍵認証", imp: 3,
    q: "公開鍵認証でログインできるようにするため、ログイン先のユーザーの公開鍵を登録するファイルはどれか。",
    choices: ["~/.ssh/authorized_keys", "~/.ssh/known_hosts", "~/.ssh/id_rsa", "/etc/ssh/sshd_config"],
    answer: [0],
    exp: "ログイン先の ~/.ssh/authorized_keys に公開鍵を追記する。~/.ssh/known_hosts は接続したサーバーのホスト鍵の記録、~/.ssh/id_rsa は手元の秘密鍵、/etc/ssh/sshd_config は SSH サーバーの設定。"
  },
  {
    id: 2172, cat: "1.10", sec: "1.10/SSHと公開鍵認証", imp: 2,
    q: "秘密鍵を ssh-agent に登録し、接続のたびにパスフレーズを入力しなくて済むようにするコマンドはどれか。",
    choices: ["ssh-add", "ssh-keygen -p", "ssh-copy-id", "scp"],
    answer: [0],
    exp: "ssh-add で秘密鍵を ssh-agent（秘密鍵を預かる常駐プログラム）に登録する。ssh-keygen -p はパスフレーズの変更、ssh-copy-id は公開鍵を相手の authorized_keys に登録する。"
  },
  {
    id: 2173, cat: "1.10", sec: "1.10/SSHと公開鍵認証", imp: 3,
    q: "手元の /etc/hosts を、SSH を使ってリモートホスト server1 の /tmp にコピーするコマンドはどれか。",
    choices: ["scp /etc/hosts server1:/tmp", "scp server1:/tmp /etc/hosts", "ssh -c /etc/hosts server1:/tmp", "cp /etc/hosts server1:/tmp"],
    answer: [0],
    exp: "scp コピー元 コピー先 の順で書き、リモートは ホスト:パス で表す。逆に scp server1:/etc/hosts . なら相手からカレントディレクトリへコピーする。ディレクトリごとなら -r、ポート指定は大文字の -P。"
  },
  {
    id: 2174, cat: "1.10", sec: "1.10/SSHと公開鍵認証", imp: 2,
    q: "SSH で接続したサーバーのホスト鍵が記録され、次回の接続でなりすましが無いかの確認に使われるファイルはどれか。",
    choices: ["~/.ssh/known_hosts", "~/.ssh/authorized_keys", "~/.ssh/config", "/etc/ssh/ssh_host_rsa_key.pub"],
    answer: [0],
    exp: "初めて接続したときにサーバーのホスト鍵が ~/.ssh/known_hosts に記録され、次回からは記録と一致するかを確かめる。一致しないと警告が出る。サーバー側のホスト鍵自体は /etc/ssh/ssh_host_*_key に置かれている。"
  },
  {
    id: 2175, cat: "1.10", sec: "1.10/SSHと公開鍵認証", imp: 1,
    q: "ssh -L 8080:localhost:80 server1 の説明として正しいものはどれか。",
    choices: ["手元の8080番への通信を、SSH 経由で server1 側の80番へ転送する", "server1 の8080番を手元の80番へ転送する", "server1 に80番と8080番の両方で接続する", "8080番で SSH サーバーを起動する"],
    answer: [0],
    exp: "-L（Local）はローカルポート転送で、ローカルポート:転送先ホスト:転送先ポート の形。手元の8080番に接続すると、暗号化された SSH を通って server1 から見た localhost:80 に届く。逆向きの転送は -R（Remote）。"
  },

  /* ===== 1.10 GnuPGによる暗号化 ===== */
  {
    id: 2176, cat: "1.10", sec: "1.10/GnuPGによる暗号化", imp: 2,
    q: "GnuPG で相手だけが読めるようにファイルを暗号化するとき、使う鍵はどれか。",
    choices: ["相手の公開鍵", "自分の秘密鍵", "相手の秘密鍵", "自分の公開鍵"],
    answer: [0],
    exp: "暗号化は相手の公開鍵で行い（gpg -e -r 相手 ファイル）、相手は自分の秘密鍵で復号する（gpg -d）。署名は逆で、自分の秘密鍵で署名し、相手が自分の公開鍵で検証する。"
  },
  {
    id: 2177, cat: "1.10", sec: "1.10/GnuPGによる暗号化", imp: 1,
    q: "GnuPG で鍵のペアを作成するコマンドはどれか。",
    choices: ["gpg --gen-key", "gpg --import", "gpg -d", "gpg --list-keys"],
    answer: [0],
    exp: "gpg --gen-key（詳細に指定するなら --full-generate-key）で鍵ペアを作る。--import は相手の公開鍵の取り込み、--list-keys は公開鍵の一覧、-d は復号、--export で自分の公開鍵を書き出す。鍵は ~/.gnupg/ に保存される。"
  },

  /* ===== 1.10 クラウドセキュリティ ===== */
  {
    id: 2178, cat: "1.10", sec: "1.10/クラウドセキュリティ", imp: 2,
    q: "パブリッククラウドの管理コンソールへの不正ログインを防ぐ対策として最も適切なものはどれか。",
    choices: ["パスワードに加えて多要素認証を使う", "メインアカウントを全員で共有する", "API の認証キーを公開リポジトリに置いて共有する", "管理コンソールのパスワードを短くして覚えやすくする"],
    answer: [0],
    exp: "管理コンソールはクラウドの全資源を操作できるため、パスワードに加えて多要素認証（MFA）を使う。全権限を持つメインアカウントは普段使わず、権限を絞った非特権ユーザーで作業する。API の認証キーは漏れないよう管理する。"
  },
  {
    id: 2179, cat: "1.10", sec: "1.10/クラウドセキュリティ", imp: 1,
    q: "パブリッククラウドの「リージョン」の説明として正しいものはどれか。",
    choices: ["データセンターが置かれている地域", "クラウドの料金プランの種類", "仮想マシンに割り当てる IPアドレスの範囲", "管理コンソールにログインできる時間帯"],
    answer: [0],
    exp: "リージョンはデータセンターのある地域。データを置く国の法律、利用者からの距離（遅延）、障害や災害への備えを考えて選ぶ。1つのリージョンの中に複数のデータセンター（アベイラビリティゾーン）があることが多い。"
  },
  {
    id: 2180, cat: "1.10", sec: "1.10/クラウドセキュリティ", imp: 1,
    q: "クラウドの「責任共有モデル」で、一般に利用者側が責任を持つものはどれか。",
    choices: ["仮想マシン上の Linux の設定やデータ", "データセンターの建物の警備", "物理サーバーの故障部品の交換", "データセンターの電源設備"],
    answer: [0],
    exp: "建物・電源・物理機器などはクラウド事業者が守り、その上で動かす OS（Linux）の設定・アプリ・データは利用者が守る。インスタンスを止めると消える揮発性のストレージもあるので、残したいデータは永続的なストレージに置く。"
  },

  /* ===== 1.11 オープンソースとは ===== */
  {
    id: 2181, cat: "1.11", sec: "1.11/オープンソースとは", imp: 2,
    q: "オープンソースソフトウェアの説明として誤っているものはどれか。",
    choices: ["著作権が放棄されているので、誰の権利も及ばない", "ソースコードが公開されている", "改変して派生ソフトウェアを作ることができる", "再配布や販売をしてもよい"],
    answer: [0],
    exp: "オープンソースでも著作権は放棄されておらず、作者の著作権のもとでライセンスに従って利用する。ソースの公開・改変・再配布（販売も含む）が自由であることがオープンソースの特徴。"
  },
  {
    id: 2182, cat: "1.11", sec: "1.11/オープンソースとは", imp: 1,
    q: "オープンソースの定義（OSD）を定めている団体はどれか。",
    choices: ["OSI（Open Source Initiative）", "ISO（国際標準化機構）", "IETF", "ICANN"],
    answer: [0],
    exp: "OSI（Open Source Initiative）がオープンソースの定義10項目を定め、それに合うライセンスを認定している。フリーソフトウェアを提唱するのは FSF（フリーソフトウェア財団）。ISO は OSI参照モデルを策定した国際標準化機構で別物。"
  },
  {
    id: 2183, cat: "1.11", sec: "1.11/オープンソースとは", imp: 1,
    q: "オープンソースの定義に含まれる内容として正しいものはどれか。",
    choices: ["利用する分野（商用利用など）によって差別してはならない", "商用利用を禁止しなければならない", "改変したソフトウェアの再配布は禁止される", "特定の製品と一緒でなければ使えないようにしてよい"],
    answer: [0],
    exp: "オープンソースの定義には、再頒布の自由・ソースコードの公開・派生ソフトウェアの許可・個人やグループへの差別の禁止・利用分野への差別の禁止（商用利用も認める）・特定製品に限定しないこと、などが含まれる。"
  },

  /* ===== 1.11 オープンソースライセンス ===== */
  {
    id: 2184, cat: "1.11", sec: "1.11/オープンソースライセンス", imp: 2,
    q: "改変した派生ソフトウェアを配布するとき、同じライセンスを引き継いでソースコードも公開することを求める考え方を何と呼ぶか。",
    choices: ["コピーレフト", "パブリックドメイン", "パーミッシブ", "プロプライエタリ"],
    answer: [0],
    exp: "コピーレフトは、派生物にも同じライセンス（ソース公開の義務）を引き継がせる考え方で、GPL が代表。BSD・MIT・Apache のようにソース公開を求めないゆるいライセンスはパーミッシブライセンスと呼ぶ。"
  },
  {
    id: 2185, cat: "1.11", sec: "1.11/オープンソースライセンス", imp: 2,
    q: "ネットワーク越しにソフトウェアを利用させるだけの場合でも、利用者にソースコードを提供することを求めるライセンスはどれか。",
    choices: ["AGPL", "LGPL", "BSD", "MIT"],
    answer: [0],
    exp: "AGPL（Affero GPL）はサーバー向けで、Web サービスのようにネットワーク越しに使わせるだけでもソースの提供が必要。GPL は配布するときに公開が必要、LGPL はライブラリとしてリンクするだけなら公開不要、BSD と MIT は公開不要。"
  },
  {
    id: 2186, cat: "1.11", sec: "1.11/オープンソースライセンス", imp: 2,
    q: "ライブラリとしてリンクして利用するだけなら、利用した側のソフトウェアのソースコードを公開しなくてよいライセンスはどれか。",
    choices: ["LGPL", "GPL", "AGPL", "GPLv3"],
    answer: [0],
    exp: "LGPL（Lesser GPL）はライブラリ向けで、リンクして使うだけなら自分のソフトのソースを公開しなくてよい（LGPL のライブラリ自体を改変したらその部分は公開する）。GPL・AGPL は組み込んだソフト全体にソース公開を求める。"
  },
  {
    id: 2187, cat: "1.11", sec: "1.11/オープンソースライセンス", imp: 2,
    q: "コピーレフトではない（改変版のソースコードを公開しなくてよい）ライセンスを2つ選べ。",
    choices: ["BSD", "MIT", "GPL", "AGPL"],
    answer: [0, 1],
    exp: "BSD（カリフォルニア大学バークレー校）と MIT（マサチューセッツ工科大学）は著作権表示などを守れば改変版のソースを公開しなくてよいパーミッシブライセンス。Apache 2.0 も同様で、特許の利用許諾の条文がある。GPL と AGPL はコピーレフト。"
  },
  {
    id: 2188, cat: "1.11", sec: "1.11/オープンソースライセンス", imp: 1,
    q: "GPL を作成した団体はどれか。",
    choices: ["フリーソフトウェア財団（FSF）／GNUプロジェクト", "Apacheソフトウェア財団", "Mozilla Foundation", "カリフォルニア大学バークレー校"],
    answer: [0],
    exp: "GPL（GNU General Public License）はフリーソフトウェア財団（GNUプロジェクト）が作った。Apache ライセンスは Apacheソフトウェア財団、MPL は Mozilla Foundation、BSD ライセンスはカリフォルニア大学バークレー校。GPLv3 では特許の扱いが明確になった。"
  },

  /* ===== 1.11 オープンソースの開発とコミュニティ ===== */
  {
    id: 2189, cat: "1.11", sec: "1.11/オープンソースの開発とコミュニティ", imp: 1,
    q: "Git の説明として正しいものはどれか。",
    choices: ["Linux カーネルの開発のために作られた分散型のバージョン管理システム", "集中型のバージョン管理システムで、サーバーが無いと履歴を見られない", "オープンソースのライセンスの一種", "ソースコードを自動で翻訳するツール"],
    answer: [0],
    exp: "Git はリーナス・トーバルズが Linux カーネルの開発のために作った分散型のバージョン管理システムで、各自の手元に履歴の全体を持つ。Subversion（SVN）や CVS は集中型。GitHub は Git のリポジトリを公開・共有する開発プラットフォーム。"
  },
  {
    id: 2190, cat: "1.11", sec: "1.11/オープンソースの開発とコミュニティ", imp: 1,
    q: "バージョン番号 3.15.4 で、15 が表しているものはどれか。",
    choices: ["マイナーバージョン", "メジャーバージョン", "リリース（パッチ）バージョン", "ビルド日"],
    answer: [0],
    exp: "メジャー.マイナー.リリース の順。3 が互換性が変わるような大きな変更のメジャー、15 が機能追加のマイナー、4 が不具合修正などのリリース（パッチ）バージョン。"
  },
  {
    id: 2191, cat: "1.11", sec: "1.11/オープンソースの開発とコミュニティ", imp: 1,
    q: "オープンソースのコミュニティへの関わり方として適切でないものはどれか。",
    choices: ["ライセンスの表示を消して自社の製品として販売する", "見つけた不具合を、再現手順を添えて報告する", "ドキュメントの翻訳や改善を手伝う", "ソフトウェアを使い、良さを人に紹介する"],
    answer: [0],
    exp: "ライセンスで求められた著作権表示を消すのはライセンス違反。使う・紹介する・バグを報告する・翻訳や文書を改善する・パッチやプルリクエストでコードを提供する、などが適切な関わり方。情報交換にはメーリングリストやフォーラムが使われる。"
  },

];

QUESTIONS.push(...QUESTIONS_102);
