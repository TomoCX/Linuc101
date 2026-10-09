# =====================================================================
#  新しい試験を追加するスクリプト
#  ---------------------------------------------------------------------
#  ひな形（exams\_template）をコピーして exams\<試験ID>\ を作り、
#  index.html にその試験のファイルの読み込みを追加します。
#  そのあと notes.js を生成し、データチェックまで行います。
#
#  使い方（PowerShell）:
#    .\new-exam.ps1 -Id 201 -Title "LinuC レベル2 201試験" -Category 2.01
#      -Id       : 試験ID（フォルダ名になる。英数字）
#      -Title    : 表示名
#      -Category : 最初の主題の番号（「数字.数字」。ほかの試験と重ならないこと）
#                  省略すると、試験IDが数字なら「<試験ID>.01」
#
#  できたら、exams\<試験ID>\ の各ファイルを書き換えていく（README の
#  「新しい試験を追加するには」を参照）。
# =====================================================================

param(
  [Parameter(Mandatory = $true)][string]$Id,
  [Parameter(Mandatory = $true)][string]$Title,
  [string]$Category
)

$ErrorActionPreference = "Stop"
$dir = $PSScriptRoot
if (-not $dir) { $dir = (Get-Location).Path }
$utf8 = [Text.UTF8Encoding]::new($false)

function ReadUtf8($path) { [IO.File]::ReadAllText($path, [Text.Encoding]::UTF8) }

# ---------------- 入力の確認 ----------------
if ($Id -notmatch '^[0-9A-Za-z_-]+$' -or $Id -like "_*") { throw "試験ID「$Id」は英数字で指定してください（_ で始めない）" }
$target = "$dir\exams\$Id"
if (Test-Path $target) { throw "exams\$Id はすでにあります" }

if (-not $Category) {
  if ($Id -match '^\d+$') { $Category = "$Id.01" }
  else { throw "-Category で最初の主題の番号（例: 2.01）を指定してください" }
}
if ($Category -notmatch '^\d+\.\d+$') { throw "主題の番号「$Category」は「数字.数字」の形にしてください（例: 2.01）" }

# ほかの試験の主題番号・試験IDと重ならないか
$used = @{}
foreach ($e in Get-ChildItem "$dir\exams" -Directory | Where-Object { $_.Name -notlike "_*" }) {
  $js = ReadUtf8 "$($e.FullName)\exam.js"
  $body = [regex]::Match($js, '(?s)categories:\s*\{(.*?)\}').Groups[1].Value
  foreach ($m in [regex]::Matches($body, '"([^"]+)":\s*"')) { $used[$m.Groups[1].Value] = $e.Name }
  $intro = [regex]::Match($js, 'intro:\s*"([^"]+)"')
  $used[$(if ($intro.Success) { $intro.Groups[1].Value } else { $e.Name })] = $e.Name
}
if ($used.ContainsKey($Category)) { throw "主題の番号 $Category は試験 $($used[$Category]) で使われています" }
if ($used.ContainsKey($Id)) { throw "試験ID $Id は、試験 $($used[$Id]) の主題の番号と重なります" }

# 問題・単語帳の ID は、いまの最大値の次の千の位から始める（例：2191 → 3001）
$maxId = 0
foreach ($f in Get-ChildItem "$dir\exams" -Recurse -Include "questions*.js", "cards*.js" | Where-Object { $_.Directory.Name -notlike "_*" }) {
  foreach ($m in [regex]::Matches((ReadUtf8 $f.FullName), '\bid:\s*(\d+)')) { $maxId = [Math]::Max($maxId, [int]$m.Groups[1].Value) }
}
$base = ([Math]::Floor($maxId / 1000) + 1) * 1000 + 1

# ---------------- ひな形をコピーする ----------------
New-Item -ItemType Directory -Path $target | Out-Null
$files = New-Object System.Collections.Generic.List[string]
foreach ($f in Get-ChildItem "$dir\exams\_template" -File) {
  $name = $f.Name.Replace("__ID__", $Id)
  $text = (ReadUtf8 $f.FullName).Replace("__ID__", $Id).Replace("__TITLE__", $Title).Replace("__CAT__", $Category).Replace("__BASE__", "$base")
  [IO.File]::WriteAllText("$target\$name", $text, $utf8)
  $files.Add($name)
}

# ---------------- index.html に読み込みを足す ----------------
$marker = "<!-- /試験のデータ -->"
$index = ReadUtf8 "$dir\index.html"
if (-not $index.Contains($marker)) { throw "index.html に「$marker」の行がありません" }
$order = @("exam.js", "questions.js", "notes.js", "cards.js", "keypoints.js", "commands.js")
$lines = @("<!-- 試験：$Id -->") + ($order | ForEach-Object { "<script src=""exams/$Id/$_""></script>" })
$index = $index.Replace($marker, ($lines -join "`n") + "`n" + $marker)
[IO.File]::WriteAllText("$dir\index.html", $index, $utf8)

# ---------------- ノートの生成とチェック ----------------
& "$dir\build-notes.ps1"
& "$dir\check-data.ps1"

Write-Host ""
Write-Host "  試験 $Id（$Title）を追加しました：exams\$Id\" -ForegroundColor Green
Write-Host "  問題・単語帳の ID は $base から振ってください。" -ForegroundColor Green
Write-Host "  次にすること：exam.js（主題）→ ノート（.md）→ build-notes.ps1 → questions.js・cards.js・keypoints.js・commands.js" -ForegroundColor Green
Write-Host ""
