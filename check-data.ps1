# =====================================================================
#  データの整合性チェック
#  ---------------------------------------------------------------------
#  問題・単語帳・ノート・重要マークのデータが、お互いに矛盾していないかを
#  機械的に調べます。build-single-file.ps1 から自動で呼ばれるほか、
#  単独でも実行できます。
#
#  使い方: PowerShell で   .\check-data.ps1
#  異常があれば一覧を出して終了コード 1、なければ 0 を返します。
# =====================================================================

$ErrorActionPreference = "Stop"
$dir = $PSScriptRoot
if (-not $dir) { $dir = (Get-Location).Path }

$errors = New-Object System.Collections.Generic.List[string]
$infos  = New-Object System.Collections.Generic.List[string]

function ReadUtf8($name) { [IO.File]::ReadAllText("$dir\$name", [Text.Encoding]::UTF8) }

# ---------------- ノートの節（"主題/見出し"） ----------------
$md = ReadUtf8 "LinuC101_暗記まとめ.md"
$noteKeys = New-Object System.Collections.Generic.HashSet[string]
$theme = "00"; $inFence = $false
foreach ($line in ($md -split "`r?`n")) {
  if ($line -match '^```') { $inFence = -not $inFence }
  if ($inFence) { continue }
  if ($line -match '^#\s+(.+)$') {
    $theme = if ($Matches[1] -match '主題\s*(\d+\.\d+)') { $Matches[1] } else { "00" }
    continue
  }
  if ($line -match '^##\s+(.+)$') { [void]$noteKeys.Add("$theme/" + $Matches[1].Trim()) }
}
# ノート冒頭（大見出しの直後の本文）は「00/大見出し」として扱われる
[void]$noteKeys.Add("00/LinuC レベル1 101試験 暗記まとめ")
$infos.Add("ノートの節: $($noteKeys.Count)")

# ---------------- 問題 ----------------
$qs = New-Object System.Collections.Generic.List[object]
foreach ($file in @("questions.js", "questions-sec.js")) {
  $js = ReadUtf8 $file
  # 1問 = { id: N, ... exp: "..." } のかたまり
  foreach ($m in [regex]::Matches($js, '(?s)\{\s*id:\s*(\d+),\s*cat:\s*"([^"]+)"(?:,\s*sec:\s*"([^"]+)")?(?:,\s*imp:\s*\d)?,\s*q:\s*"((?:[^"\\]|\\.)*)",\s*choices:\s*\[(.*?)\],\s*answer:\s*\[([^\]]*)\],\s*exp:\s*"((?:[^"\\]|\\.)*)"\s*\}')) {
    $choices = [regex]::Matches($m.Groups[5].Value, '"((?:[^"\\]|\\.)*)"') | ForEach-Object { $_.Groups[1].Value }
    $answer  = $m.Groups[6].Value -split '\s*,\s*' | Where-Object { $_ -ne "" } | ForEach-Object { [int]$_ }
    $qs.Add([pscustomobject]@{
      file = $file; id = [int]$m.Groups[1].Value; cat = $m.Groups[2].Value; sec = $m.Groups[3].Value
      q = $m.Groups[4].Value; choices = @($choices); answer = @($answer); exp = $m.Groups[7].Value
    })
  }
}
$infos.Add("問題: $($qs.Count)")

# SECTION_MAP（旧問題 → 節）
$secMap = @{}
$secJs = ReadUtf8 "questions-sec.js"
$mapBody = [regex]::Match($secJs, '(?s)const SECTION_MAP = \{(.*?)\};').Groups[1].Value
foreach ($m in [regex]::Matches($mapBody, '(\d+):\s*"([^"]+)"')) { $secMap[[int]$m.Groups[1].Value] = $m.Groups[2].Value }

# 重複ID
$dup = $qs | Group-Object id | Where-Object { $_.Count -gt 1 }
foreach ($g in $dup) { $errors.Add("問題IDが重複: $($g.Name)") }

$posCount = @(0, 0, 0, 0, 0, 0, 0, 0)
$untied = New-Object System.Collections.Generic.List[int]
foreach ($q in $qs) {
  $tag = "問題 #$($q.id)"
  if ($q.choices.Count -ne 4) { $errors.Add("$tag の選択肢が $($q.choices.Count) 個（4個が前提）") }
  if ($q.answer.Count -lt 1) { $errors.Add("$tag に正解がない") }
  foreach ($a in $q.answer) {
    if ($a -lt 0 -or $a -ge $q.choices.Count) { $errors.Add("$tag の正解番号 $a が選択肢の範囲外") }
  }
  if ($q.exp.Length -lt 60) { $errors.Add("$tag の解説が短すぎる（$($q.exp.Length) 文字）") }
  if ($q.q -notmatch '(か。|べ。|か\?|か？|。)$') { $infos.Add("$tag の問題文が「〜か。」で終わっていない: $($q.q.Substring(0, [Math]::Min(30, $q.q.Length)))…") }
  $sec = if ($q.sec) { $q.sec } elseif ($secMap.ContainsKey($q.id)) { $secMap[$q.id] } else { $null }
  if ($sec -and -not $noteKeys.Contains($sec)) { $errors.Add("$tag の節「$sec」がノートに無い") }
  if (-not $sec) { $untied.Add($q.id) }
  if ($q.answer.Count -eq 1) { $posCount[$q.answer[0]]++ }
}
if ($untied.Count) { $infos.Add("どの節にも紐づいていない問題（ノートから解けない）: " + ($untied -join ", ")) }
$infos.Add("正解の位置（単一解答・データ上）: A=$($posCount[0]) B=$($posCount[1]) C=$($posCount[2]) D=$($posCount[3])  ※表示時にシャッフルされる")

# ---------------- 単語帳 ----------------
$cards = [regex]::Matches((ReadUtf8 "cards.js"), '\{\s*id:\s*(\d+),\s*sec:\s*"([^"]+)",\s*term:\s*"((?:[^"\\]|\\.)*)",\s*mean:\s*"((?:[^"\\]|\\.)*)"\s*\}')
$infos.Add("単語帳: $($cards.Count)")
$cardIds = @{}
foreach ($m in $cards) {
  $id = [int]$m.Groups[1].Value; $sec = $m.Groups[2].Value
  if ($cardIds.ContainsKey($id)) { $errors.Add("単語帳IDが重複: $id") } else { $cardIds[$id] = 1 }
  if (-not $noteKeys.Contains($sec)) { $errors.Add("単語帳 #$id の節「$sec」がノートに無い") }
  if ($m.Groups[3].Value.Trim() -eq "" -or $m.Groups[4].Value.Trim() -eq "") { $errors.Add("単語帳 #$id の語または意味が空") }
}

# ---------------- 重要マーク ----------------
$kp = ReadUtf8 "keypoints.js"
$starsBody = [regex]::Match($kp, '(?s)const NOTE_STARS = \{(.*?)\};').Groups[1].Value
foreach ($m in [regex]::Matches($starsBody, '"([^"]+)":\s*(\d)')) {
  if (-not $noteKeys.Contains($m.Groups[1].Value)) { $errors.Add("NOTE_STARS の節「$($m.Groups[1].Value)」がノートに無い") }
}

# ノートにあって問題も単語帳も無い節（作りかけの目安。エラーにはしない）
$usedSecs = New-Object System.Collections.Generic.HashSet[string]
foreach ($q in $qs) { $s = if ($q.sec) { $q.sec } elseif ($secMap.ContainsKey($q.id)) { $secMap[$q.id] } else { "" }; if ($s) { [void]$usedSecs.Add($s) } }
foreach ($m in $cards) { [void]$usedSecs.Add($m.Groups[2].Value) }
$lonely = $noteKeys | Where-Object { -not $usedSecs.Contains($_) -and $_ -notlike "00/*" }
if ($lonely) { $infos.Add("問題も単語帳も無い節: " + ($lonely -join " / ")) }

# ---------------- 結果 ----------------
Write-Host ""
foreach ($i in $infos) { Write-Host "  - $i" -ForegroundColor DarkGray }
if ($errors.Count) {
  Write-Host ""
  Write-Host "  データに問題があります（$($errors.Count) 件）" -ForegroundColor Red
  foreach ($e in $errors) { Write-Host "  × $e" -ForegroundColor Red }
  Write-Host ""
  exit 1
}
Write-Host ""
Write-Host "  データチェック OK" -ForegroundColor Green
Write-Host ""
exit 0
