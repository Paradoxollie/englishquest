# English Quest - nettoyage du depot (2026-10-10)
# A lancer une seule fois depuis la racine du projet, dans PowerShell :
#   Set-Location D:\Englishquest\englishquest
#   .\cleanup.ps1
# Le script ne supprime rien d'irremplacable : les notes de depannage et les
# scripts SQL historiques sont deplaces dans des dossiers d'archive.

$ErrorActionPreference = "Stop"
$root = Get-Location

function Remove-IfExists($path) {
    $full = Join-Path $root $path
    if (Test-Path $full) {
        Remove-Item -LiteralPath $full -Recurse -Force
        Write-Host "supprime : $path"
    }
}

function Move-IfExists($path, $destDir) {
    $full = Join-Path $root $path
    if (Test-Path $full) {
        $dest = Join-Path $root $destDir
        New-Item -ItemType Directory -Force -Path $dest | Out-Null
        Move-Item -LiteralPath $full -Destination $dest -Force
        Write-Host "archive  : $path -> $destDir"
    }
}

# 1. Copies completes de decembre 2025 (deja dans l'historique git)
Remove-IfExists "ancienne version"

# 2. Fichiers sans rapport avec le site ou generes par des outils
Remove-IfExists "grammar_dump.txt"
Remove-IfExists "last_touch.txt"
Remove-IfExists "test-supabase.js"
Remove-IfExists "progress.md"
Remove-IfExists "lib\courses\lessons.tsx.bak"
Remove-IfExists "lib\games\words\english-words.json"
Remove-IfExists "lib\games\words\wordfall-dictionary.json"
Remove-IfExists "scripts\extract_pdf.js"
Remove-IfExists "scripts\extract_courses.js"
Remove-IfExists "scripts\generate_lessons_index.js"
Remove-IfExists "tsconfig.tsbuildinfo"

# 3. Notes de depannage : archivees, pas supprimees
$notes = @(
    "ADMIN_SHOP_MANAGEMENT.md", "AVATAR_CROP_GUIDE.md", "CLEANUP_VISITS_GUIDE.md",
    "DIAGNOSTIC.md", "ENIGMA_SCROLL_WORDLE_COMPARISON.md", "FIX_STORAGE_RECURSION.md",
    "SHOP_SYSTEM_SETUP.md", "SUPABASE_SETUP.md", "SUPABASE_SPEED_VERB_SETUP.md",
    "SUPABASE_WORDFALL_SETUP.md", "TROUBLESHOOTING_SESSION.md", "TROUBLESHOOTING_SHOP.md",
    "UPLOAD_IMAGES_SETUP.md", "VISITOR_TRACKING_SETUP.md"
)
foreach ($n in $notes) { Move-IfExists $n "docs\archive" }
Move-IfExists "lib\games\words\MANUAL-WORD-ADDITION.md" "docs\archive"
Move-IfExists "lib\games\words\README-WORDFALL.md" "docs\archive"
Move-IfExists "lib\games\words\README.md" "docs\archive"

# 4. Scripts SQL historiques : archives. Le schema de reference vit dans supabase\migrations.
Get-ChildItem -Path (Join-Path $root "supabase") -Filter *.sql -File | ForEach-Object {
    Move-IfExists ("supabase\" + $_.Name) "supabase\archive"
}

# 5. Dossier public\robots.txt en double avec app\robots.ts
Remove-IfExists "public\robots.txt"

# 6. Composants et pages remplaces par la nouvelle interface (sequences 1 a 4)
$dead = @(
    "components\quest\campaign-treasure-map.tsx", "components\quest\campaign-map-node.tsx",
    "components\courses\course-experience-panel.tsx", "components\ui\particle-effects.tsx",
    "components\ui\comic-card.tsx", "components\ui\avatar-preview.tsx",
    "components\play\game-emblem.tsx", "components\play\game-recommendation-card.tsx",
    "app\play\[slug]",
    "app\play\enigma-scroll\get-top-scores.ts", "app\play\enigma-scroll\leaderboard.tsx",
    "app\play\enigma-scroll\leaderboard", "app\play\enigma-scroll\top-scores-display.tsx",
    "app\play\flash-translation\leaderboard.tsx", "app\play\flash-translation\top-scores-display.tsx",
    "app\play\flashback\flashback-effects.tsx", "app\play\flashback\leaderboard.tsx",
    "app\play\flashback\top-scores-display.tsx",
    "app\play\space-lex\get-top-scores.ts", "app\play\space-lex\leaderboard-avatar.tsx",
    "app\play\space-lex\leaderboard.tsx", "app\play\space-lex\top-scores-display.tsx",
    "app\play\speed-verb-challenge\get-top-scores.ts", "app\play\speed-verb-challenge\leaderboard-avatar.tsx",
    "app\play\speed-verb-challenge\leaderboard.tsx", "app\play\speed-verb-challenge\top-scores-display.tsx",
    "app\play\wordfall\get-top-scores.ts", "app\play\wordfall\leaderboard.tsx",
    "app\play\wordfall\personal-best-display.tsx", "app\play\wordfall\top-scores-display.tsx"
)
foreach ($d in $dead) { Remove-IfExists $d }

# 7. Anciens visuels generes (style abandonne). Les nouveaux vont dans public\art\.
Remove-IfExists "public\game-art"
Remove-IfExists "public\page-art"
Remove-IfExists "public\file.svg"
Remove-IfExists "public\globe.svg"
Remove-IfExists "public\next.svg"
Remove-IfExists "public\vercel.svg"
Remove-IfExists "public\window.svg"

Write-Host ""
Write-Host "Termine. Verifie avec 'git status', puis :"
Write-Host "  git add -A"
Write-Host "  git commit -m 'Securisation et nettoyage du depot'"
Write-Host "  git push"
