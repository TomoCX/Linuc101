# =====================================================================
#  1ファイル版ビルドスクリプト
#  ---------------------------------------------------------------------
#  index.html が読み込んでいる CSS / JS をすべて埋め込んで
#  LinuC101-1file.html を作ります。
#
#  使い方: PowerShell で   .\build-single-file.ps1
# =====================================================================

$ErrorActionPreference = "Stop"
$dir = $PSScriptRoot
if (-not $dir) { $dir = (Get-Location).Path }
$html  = [IO.File]::ReadAllText("$dir\index.html")
$css   = [IO.File]::ReadAllText("$dir\style.css")
$html = $html.Replace('<link rel="stylesheet" href="style.css">', "<style>`n$css`n</style>")
foreach ($f in @('auth.js', 'core.js', 'questions.js', 'questions-sec.js', 'commands.js', 'notes.js', 'cards.js', 'notes-view.js', 'cards-view.js', 'glossary.js', 'review-view.js', 'help-view.js', 'sync-view.js', 'app.js')) {
  $js = [IO.File]::ReadAllText("$dir\$f")
  $html = $html.Replace("<script src=""$f""></script>", "<script>`n$js`n</script>")
}
# 取り込み漏れがないか確認する
$left = ([regex]::Matches($html, '<script src=|<link rel="stylesheet"')).Count
if ($left -gt 0) { throw "$left 件の外部参照が埋め込まれていません" }

# スマホの「ファイル」アプリから開いても文字化けしないよう BOM 付き UTF-8 で保存
$out = "$dir\LinuC101-1file.html"
[IO.File]::WriteAllText($out, $html, [Text.UTF8Encoding]::new($true))

$kb = [math]::Round((Get-Item $out).Length / 1KB)
Write-Host ""
Write-Host "  LinuC101-1file.html を作成しました（${kb} KB）" -ForegroundColor Green
Write-Host "  $out"
Write-Host ""