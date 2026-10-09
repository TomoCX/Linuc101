# =====================================================================
#  暗記ノート取り込みスクリプト
#  ---------------------------------------------------------------------
#  exams/<試験ID>/ にあるノートの原稿（.md）を読み込んで、
#  同じフォルダに notes.js（addNotes("<試験ID>", "...")）を生成します。
#  ノートを書き換えたら、このスクリプトを実行してください。
#  （_ で始まるフォルダ＝ひな形は対象外）
#
#  使い方: PowerShell で   .\build-notes.ps1
# =====================================================================

$ErrorActionPreference = "Stop"
$dir = $PSScriptRoot
if (-not $dir) { $dir = (Get-Location).Path }

Write-Host ""
foreach ($examDir in Get-ChildItem "$dir\exams" -Directory | Where-Object { $_.Name -notlike "_*" } | Sort-Object Name) {
  $id = $examDir.Name
  $mds = @(Get-ChildItem $examDir.FullName -Filter "*.md")
  if ($mds.Count -ne 1) { throw "exams\$id にノートの原稿（.md）がちょうど1つ必要です（いま $($mds.Count) 個）" }

  $md = [IO.File]::ReadAllText($mds[0].FullName)

  # JSON文字列として安全にエスケープする（改行・引用符・非ASCIIをすべて処理）
  $json = ConvertTo-Json -InputObject $md

  $header = @"
/* =======================================================================
   暗記ノート本文（自動生成ファイル）
   -----------------------------------------------------------------------
   このファイルは編集しないでください。
   内容を変えるときは $($mds[0].Name) を編集して
   build-notes.ps1 を実行し、生成し直してください。
   ======================================================================= */

addNotes("$id",
"@

  $out = Join-Path $examDir.FullName "notes.js"
  [IO.File]::WriteAllText($out, $header + $json + ");`r`n", [Text.UTF8Encoding]::new($false))

  $lines = ($md -split "`n").Count
  $kb = [math]::Round((Get-Item $out).Length / 1KB)
  Write-Host "  exams\$id\notes.js を生成しました（$($mds[0].Name)：${lines} 行 / ${kb} KB）" -ForegroundColor Green
}
Write-Host ""
