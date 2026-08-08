# =====================================================================
#  1ファイル版ビルドスクリプト
#  ---------------------------------------------------------------------
#  index.html / style.css / questions.js / commands.js / app.js を
#  1つの HTML にまとめて LinuC101-1file.html を作ります。
#
#  使い方: このファイルを右クリック →「PowerShell で実行」
#          または PowerShell で   .\build-single-file.ps1
#
#  できあがった LinuC101-1file.html を iCloud Drive などに置けば、
#  iPhone の「ファイル」アプリから開くだけで動きます。
# =====================================================================

$ErrorActionPreference = "Stop"
$dir = $PSScriptRoot
if (-not $dir) { $dir = (Get-Location).Path }

$html  = [IO.File]::ReadAllText("$dir\index.html")
$css   = [IO.File]::ReadAllText("$dir\style.css")
$q     = [IO.File]::ReadAllText("$dir\questions.js")
$qsec  = [IO.File]::ReadAllText("$dir\questions-sec.js")
$cmd   = [IO.File]::ReadAllText("$dir\commands.js")
$notes = [IO.File]::ReadAllText("$dir\notes.js")
$nview = [IO.File]::ReadAllText("$dir\notes-view.js")
$cards = [IO.File]::ReadAllText("$dir\cards.js")
$cview = [IO.File]::ReadAllText("$dir\cards-view.js")
$gloss = [IO.File]::ReadAllText("$dir\glossary.js")
$app   = [IO.File]::ReadAllText("$dir\app.js")

$html = $html.Replace('<link rel="stylesheet" href="style.css">', "<style>`n$css`n</style>")
$html = $html.Replace('<script src="questions.js"></script>',     "<script>`n$q`n</script>")
$html = $html.Replace('<script src="questions-sec.js"></script>',  "<script>`n$qsec`n</script>")
$html = $html.Replace('<script src="commands.js"></script>',      "<script>`n$cmd`n</script>")
$html = $html.Replace('<script src="notes.js"></script>',         "<script>`n$notes`n</script>")
$html = $html.Replace('<script src="notes-view.js"></script>',    "<script>`n$nview`n</script>")
$html = $html.Replace('<script src="cards.js"></script>',         "<script>`n$cards`n</script>")
$html = $html.Replace('<script src="cards-view.js"></script>',    "<script>`n$cview`n</script>")
$html = $html.Replace('<script src="glossary.js"></script>',      "<script>`n$gloss`n</script>")
$html = $html.Replace('<script src="app.js"></script>',           "<script>`n$app`n</script>")

# スマホの「ファイル」アプリから開いても文字化けしないよう BOM 付き UTF-8 で保存
$out = "$dir\LinuC101-1file.html"
[IO.File]::WriteAllText($out, $html, [Text.UTF8Encoding]::new($true))

$kb = [math]::Round((Get-Item $out).Length / 1KB)
Write-Host ""
Write-Host "  LinuC101-1file.html を作成しました（${kb} KB）" -ForegroundColor Green
Write-Host "  $out"
Write-Host ""
Write-Host "  このファイル1つで動きます。iCloud Drive に置いて" -ForegroundColor Cyan
Write-Host "  iPhone の「ファイル」アプリから開いてください。" -ForegroundColor Cyan
Write-Host ""
