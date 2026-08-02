# =====================================================================
#  暗記ノート取り込みスクリプト
#  ---------------------------------------------------------------------
#  LinuC101_暗記まとめ.md を読み込んで notes.js を生成します。
#  ノートを書き換えたら、このスクリプトを実行してください。
#
#  使い方: PowerShell で   .\build-notes.ps1
# =====================================================================

$ErrorActionPreference = "Stop"
$dir = $PSScriptRoot
if (-not $dir) { $dir = (Get-Location).Path }

$src = "$dir\LinuC101_暗記まとめ.md"
if (-not (Test-Path $src)) { throw "$src が見つかりません" }

$md = [IO.File]::ReadAllText($src)

# JSON文字列として安全にエスケープする（改行・引用符・非ASCIIをすべて処理）
$json = ConvertTo-Json -InputObject $md

$header = @"
/* =======================================================================
   暗記ノート本文（自動生成ファイル）
   -----------------------------------------------------------------------
   このファイルは編集しないでください。
   内容を変えるときは LinuC101_暗記まとめ.md を編集して
   build-notes.ps1 を実行し、生成し直してください。
   ======================================================================= */

const NOTES_MD =
"@

[IO.File]::WriteAllText("$dir\notes.js", $header + $json + ";`r`n", [Text.UTF8Encoding]::new($false))

$lines = ($md -split "`n").Count
$kb = [math]::Round((Get-Item "$dir\notes.js").Length / 1KB)
Write-Host ""
Write-Host "  notes.js を生成しました（${lines} 行 / ${kb} KB）" -ForegroundColor Green
Write-Host ""
