# =====================================================================
#  暗記ノート取り込みスクリプト
#  ---------------------------------------------------------------------
#  ノートの原稿（.md）を読み込んで、アプリが読む .js を生成します。
#    LinuC101_暗記まとめ.md → notes.js    （NOTES_MD）
#    LinuC102_暗記まとめ.md → notes102.js （NOTES_MD_102）
#  ノートを書き換えたら、このスクリプトを実行してください。
#
#  使い方: PowerShell で   .\build-notes.ps1
# =====================================================================

$ErrorActionPreference = "Stop"
$dir = $PSScriptRoot
if (-not $dir) { $dir = (Get-Location).Path }

function Build-Notes($srcName, $outName, $varName) {
  $src = "$dir\$srcName"
  if (-not (Test-Path $src)) { throw "$src が見つかりません" }

  $md = [IO.File]::ReadAllText($src)

  # JSON文字列として安全にエスケープする（改行・引用符・非ASCIIをすべて処理）
  $json = ConvertTo-Json -InputObject $md

  $header = @"
/* =======================================================================
   暗記ノート本文（自動生成ファイル）
   -----------------------------------------------------------------------
   このファイルは編集しないでください。
   内容を変えるときは $srcName を編集して
   build-notes.ps1 を実行し、生成し直してください。
   ======================================================================= */

const $varName =
"@

  [IO.File]::WriteAllText("$dir\$outName", $header + $json + ";`r`n", [Text.UTF8Encoding]::new($false))

  $lines = ($md -split "`n").Count
  $kb = [math]::Round((Get-Item "$dir\$outName").Length / 1KB)
  Write-Host "  $outName を生成しました（${lines} 行 / ${kb} KB）" -ForegroundColor Green
}

Write-Host ""
Build-Notes "LinuC101_暗記まとめ.md" "notes.js"    "NOTES_MD"
Build-Notes "LinuC102_暗記まとめ.md" "notes102.js" "NOTES_MD_102"
Write-Host ""
