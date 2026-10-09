# =====================================================================
#  データの整合性チェック
#  ---------------------------------------------------------------------
#  exams/<試験ID>/ ごとに、問題・単語帳・ノート・重要マークのデータが
#  お互いに矛盾していないかを機械的に調べます。試験を足しても、このファイルを
#  直す必要はありません（_ で始まるフォルダ＝ひな形は対象外）。
#  build-single-file.ps1 から自動で呼ばれるほか、単独でも実行できます。
#
#  使い方: PowerShell で   .\check-data.ps1
#  異常があれば一覧を出して終了コード 1、なければ 0 を返します。
# =====================================================================

$ErrorActionPreference = "Stop"
$dir = $PSScriptRoot
if (-not $dir) { $dir = (Get-Location).Path }

$errors = New-Object System.Collections.Generic.List[string]
$infos  = New-Object System.Collections.Generic.List[string]

function ReadUtf8($path) { [IO.File]::ReadAllText($path, [Text.Encoding]::UTF8) }

$indexHtml = ReadUtf8 "$dir\index.html"
$loaded = [regex]::Matches($indexHtml, '<script src="([^"]+)"></script>') | ForEach-Object { $_.Groups[1].Value }

# 問題 = { id: N, cat: "..", sec: "..", imp: N, q: "..", choices: [..], answer: [..], exp: ".." }
$qRe = '(?s)\{\s*id:\s*(\d+),\s*cat:\s*"([^"]+)"(?:,\s*sec:\s*"([^"]+)")?(?:,\s*imp:\s*\d)?,\s*q:\s*"((?:[^"\\]|\\.)*)",\s*choices:\s*\[(.*?)\],\s*answer:\s*\[([^\]]*)\],\s*exp:\s*"((?:[^"\\]|\\.)*)"\s*\}'
# 単語帳 = { id: N, sec: "..", term: "..", mean: ".." }
$cRe = '\{\s*id:\s*(\d+),\s*sec:\s*"([^"]+)",\s*term:\s*"((?:[^"\\]|\\.)*)",\s*mean:\s*"((?:[^"\\]|\\.)*)"\s*\}'

$allQIds    = @{}     # 問題ID → 試験ID（全試験で重ならないこと）
$allCardIds = @{}
$themeOwner = @{}     # 主題の番号 → 試験ID（全試験で重ならないこと）
$posCount = @(0, 0, 0, 0, 0, 0, 0, 0)

$examDirs = Get-ChildItem "$dir\exams" -Directory | Where-Object { $_.Name -notlike "_*" } | Sort-Object Name
if (-not $examDirs) { $errors.Add("exams フォルダに試験がありません") }

foreach ($examDir in $examDirs) {
  $id = $examDir.Name
  $p = $examDir.FullName
  $tag0 = "[$id]"

  # ---------------- 試験の定義（exam.js） ----------------
  if (-not (Test-Path "$p\exam.js")) { $errors.Add("$tag0 exam.js がありません"); continue }
  $examJs = ReadUtf8 "$p\exam.js"
  $defId = [regex]::Match($examJs, 'id:\s*"([^"]+)"').Groups[1].Value
  if ($defId -ne $id) { $errors.Add("$tag0 exam.js の id「$defId」がフォルダ名と違う") }
  $catBody = [regex]::Match($examJs, '(?s)categories:\s*\{(.*?)\}').Groups[1].Value
  $cats = [regex]::Matches($catBody, '"([^"]+)":\s*"') | ForEach-Object { $_.Groups[1].Value }
  if (-not $cats) { $errors.Add("$tag0 exam.js に categories（主題）がありません") }
  $introM = [regex]::Match($examJs, 'intro:\s*"([^"]+)"')
  $intro = if ($introM.Success) { $introM.Groups[1].Value } else { $id }
  foreach ($t in @($cats) + $intro) {
    if ($themeOwner.ContainsKey($t)) { $errors.Add("$tag0 主題の番号「$t」が試験 $($themeOwner[$t]) と重なっている") } else { $themeOwner[$t] = $id }
  }
  $themes = @($cats) + $intro

  # index.html から、このフォルダのファイルがすべて読み込まれているか
  foreach ($f in Get-ChildItem $p -Filter "*.js") {
    $src = "exams/$id/$($f.Name)"
    if ($loaded -notcontains $src) { $errors.Add("$tag0 index.html に <script src=""$src""> がありません") }
  }
  $firstOfExam = $loaded | Where-Object { $_ -like "exams/$id/*" } | Select-Object -First 1
  if ($firstOfExam -and $firstOfExam -ne "exams/$id/exam.js") { $errors.Add("$tag0 index.html では exam.js をこの試験のいちばん先に読み込むこと") }

  # ---------------- ノートの節（"主題/見出し"） ----------------
  $mds = @(Get-ChildItem $p -Filter "*.md")
  if ($mds.Count -ne 1) { $errors.Add("$tag0 ノートの原稿（.md）がちょうど1つ必要（いま $($mds.Count) 個）"); continue }
  $noteKeys = New-Object System.Collections.Generic.HashSet[string]
  $theme = $intro; $inFence = $false; $first = $true
  foreach ($line in ((ReadUtf8 $mds[0].FullName) -split "`r?`n")) {
    if ($line -match '^```') { $inFence = -not $inFence }
    if ($inFence) { continue }
    if ($line -match '^#\s+(.+)$') {
      $title = $Matches[1].Trim()
      $theme = if ($title -match '主題\s*(\d+\.\d+)') { $Matches[1] } else { $intro }
      if ($themes -notcontains $theme) { $errors.Add("$tag0 ノートの「$title」の主題 $theme が exam.js の categories に無い") }
      # ノート冒頭（大見出しの直後の本文）は「主題/大見出し」として扱われる（notes-view.js と同じ）
      if ($first) { [void]$noteKeys.Add("$theme/$title"); $first = $false }
      continue
    }
    if ($line -match '^##\s+(.+)$') { [void]$noteKeys.Add("$theme/" + $Matches[1].Trim()) }
  }
  if (-not (Test-Path "$p\notes.js")) { $errors.Add("$tag0 notes.js がありません（build-notes.ps1 を実行）") }

  # ---------------- 問題 ----------------
  $qs = New-Object System.Collections.Generic.List[object]
  $secMap = @{}
  foreach ($f in Get-ChildItem $p -Filter "questions*.js" | Sort-Object Name) {
    $js = ReadUtf8 $f.FullName
    foreach ($m in [regex]::Matches($js, $qRe)) {
      $choices = [regex]::Matches($m.Groups[5].Value, '"((?:[^"\\]|\\.)*)"') | ForEach-Object { $_.Groups[1].Value }
      $answer  = $m.Groups[6].Value -split '\s*,\s*' | Where-Object { $_ -ne "" } | ForEach-Object { [int]$_ }
      $qs.Add([pscustomobject]@{
        id = [int]$m.Groups[1].Value; cat = $m.Groups[2].Value; sec = $m.Groups[3].Value
        q = $m.Groups[4].Value; choices = @($choices); answer = @($answer); exp = $m.Groups[7].Value
      })
    }
    # SECTION_MAP（節を後から割り当てた問題。101 の旧問題で使用）
    $mapBody = [regex]::Match($js, '(?s)const SECTION_MAP = \{(.*?)\};').Groups[1].Value
    foreach ($m in [regex]::Matches($mapBody, '(\d+):\s*"([^"]+)"')) { $secMap[[int]$m.Groups[1].Value] = $m.Groups[2].Value }
  }

  $untied = New-Object System.Collections.Generic.List[int]
  $usedSecs = New-Object System.Collections.Generic.HashSet[string]
  foreach ($q in $qs) {
    $tag = "$tag0 問題 #$($q.id)"
    if ($allQIds.ContainsKey($q.id)) { $errors.Add("$tag のIDが重複（試験 $($allQIds[$q.id]) にもある）") } else { $allQIds[$q.id] = $id }
    if ($cats -notcontains $q.cat) { $errors.Add("$tag のカテゴリ「$($q.cat)」が exam.js の categories に無い") }
    if ($q.choices.Count -ne 4) { $errors.Add("$tag の選択肢が $($q.choices.Count) 個（4個が前提）") }
    if ($q.answer.Count -lt 1) { $errors.Add("$tag に正解がない") }
    foreach ($a in $q.answer) {
      if ($a -lt 0 -or $a -ge $q.choices.Count) { $errors.Add("$tag の正解番号 $a が選択肢の範囲外") }
    }
    if ($q.exp.Length -lt 60) { $errors.Add("$tag の解説が短すぎる（$($q.exp.Length) 文字）") }
    if ($q.q -notmatch '(か。|べ。|か\?|か？|。)$') { $infos.Add("$tag の問題文が「〜か。」で終わっていない: $($q.q.Substring(0, [Math]::Min(30, $q.q.Length)))…") }
    $sec = if ($q.sec) { $q.sec } elseif ($secMap.ContainsKey($q.id)) { $secMap[$q.id] } else { $null }
    if ($sec -and -not $noteKeys.Contains($sec)) { $errors.Add("$tag の節「$sec」がノートに無い") }
    if ($sec) { [void]$usedSecs.Add($sec) } else { $untied.Add($q.id) }
    if ($q.answer.Count -eq 1) { $posCount[$q.answer[0]]++ }
  }
  if ($untied.Count) { $infos.Add("$tag0 どの節にも紐づいていない問題（ノートから解けない）: " + ($untied -join ", ")) }

  # ---------------- 単語帳 ----------------
  $cardCount = 0
  foreach ($f in Get-ChildItem $p -Filter "cards*.js") {
    foreach ($m in [regex]::Matches((ReadUtf8 $f.FullName), $cRe)) {
      $cardCount++
      $cid = [int]$m.Groups[1].Value; $sec = $m.Groups[2].Value
      if ($allCardIds.ContainsKey($cid)) { $errors.Add("$tag0 単語帳IDが重複: $cid（試験 $($allCardIds[$cid]) にもある）") } else { $allCardIds[$cid] = $id }
      if (-not $noteKeys.Contains($sec)) { $errors.Add("$tag0 単語帳 #$cid の節「$sec」がノートに無い") }
      if ($m.Groups[3].Value.Trim() -eq "" -or $m.Groups[4].Value.Trim() -eq "") { $errors.Add("$tag0 単語帳 #$cid の語または意味が空") }
      [void]$usedSecs.Add($sec)
    }
  }

  # ---------------- 重要マーク ----------------
  if (Test-Path "$p\keypoints.js") {
    $starsBody = [regex]::Match((ReadUtf8 "$p\keypoints.js"), '(?s)addNoteStars\(\{(.*?)\}\);').Groups[1].Value
    foreach ($m in [regex]::Matches($starsBody, '"([^"]+)":\s*(\d)')) {
      if (-not $noteKeys.Contains($m.Groups[1].Value)) { $errors.Add("$tag0 重要マークの節「$($m.Groups[1].Value)」がノートに無い") }
    }
  }

  # ノートにあって問題も単語帳も無い節（作りかけの目安。エラーにはしない）
  $lonely = $noteKeys | Where-Object { -not $usedSecs.Contains($_) -and $_ -notlike "$intro/*" }
  if ($lonely) { $infos.Add("$tag0 問題も単語帳も無い節: " + ($lonely -join " / ")) }

  $infos.Add("$tag0 ノートの節 $($noteKeys.Count) ・ 問題 $($qs.Count) ・ 単語帳 $cardCount")
}

$infos.Add("正解の位置（単一解答・データ上）: A=$($posCount[0]) B=$($posCount[1]) C=$($posCount[2]) D=$($posCount[3])  ※表示時にシャッフルされる")

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
