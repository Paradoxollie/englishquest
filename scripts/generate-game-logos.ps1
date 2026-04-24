Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $repoRoot "public\game-art\logos"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function Convert-HexColor {
  param(
    [Parameter(Mandatory = $true)][string]$Hex,
    [int]$Alpha = 255
  )

  $clean = $Hex.TrimStart("#")
  $r = [Convert]::ToInt32($clean.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($clean.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($clean.Substring(4, 2), 16)
  return [System.Drawing.Color]::FromArgb($Alpha, $r, $g, $b)
}

function New-PointF {
  param([float]$X, [float]$Y)
  return [System.Drawing.PointF]::new($X, $Y)
}

function Draw-FilledPolygon {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.PointF[]]$Points,
    [System.Drawing.Color]$Fill,
    [System.Drawing.Color]$Stroke,
    [float]$StrokeWidth
  )

  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddPolygon($Points)
  $brush = [System.Drawing.SolidBrush]::new($Fill)
  $pen = [System.Drawing.Pen]::new($Stroke, $StrokeWidth)
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $Graphics.FillPath($brush, $path)
  $Graphics.DrawPath($pen, $path)
  $brush.Dispose()
  $pen.Dispose()
  $path.Dispose()
}

function Draw-Halftone {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Color]$Color,
    [int]$Width,
    [int]$Height
  )

  $brush = [System.Drawing.SolidBrush]::new($Color)
  for ($y = 20; $y -lt $Height; $y += 24) {
    for ($x = 18; $x -lt $Width; $x += 24) {
      $distance = [Math]::Sqrt([Math]::Pow($x - ($Width * 0.72), 2) + [Math]::Pow($y - ($Height * 0.24), 2))
      $size = [Math]::Max(2, 9 - ($distance / 70))
      $Graphics.FillEllipse($brush, $x, $y, $size, $size)
    }
  }
  $brush.Dispose()
}

function Draw-SpeedLines {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Color]$Color,
    [int]$Width,
    [int]$Height
  )

  $pen = [System.Drawing.Pen]::new($Color, 5)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  for ($i = -120; $i -le $Width; $i += 54) {
    $Graphics.DrawLine($pen, $i, $Height + 20, $i + 250, -20)
  }
  $pen.Dispose()
}

function Draw-OutlinedText {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$Text,
    [float]$Size,
    [System.Drawing.RectangleF]$Bounds,
    [System.Drawing.Color]$Fill,
    [System.Drawing.Color]$Stroke,
    [float]$StrokeWidth
  )

  $family = [System.Drawing.FontFamily]::new("Arial")
  $format = [System.Drawing.StringFormat]::new()
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddString($Text, $family, [int][System.Drawing.FontStyle]::Bold, $Size, $Bounds, $format)

  $pen = [System.Drawing.Pen]::new($Stroke, $StrokeWidth)
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $brush = [System.Drawing.SolidBrush]::new($Fill)
  $Graphics.DrawPath($pen, $path)
  $Graphics.FillPath($brush, $path)

  $brush.Dispose()
  $pen.Dispose()
  $path.Dispose()
  $format.Dispose()
  $family.Dispose()
}

function Draw-ScrollSymbol {
  param($Graphics, $Primary, $Secondary)

  $dark = Convert-HexColor "#08111f" 238
  $penLight = [System.Drawing.Pen]::new($Secondary, 8)
  $penMain = [System.Drawing.Pen]::new($Primary, 8)
  $brushDark = [System.Drawing.SolidBrush]::new($dark)
  $brushMain = [System.Drawing.SolidBrush]::new($Primary)
  $Graphics.FillRectangle($brushDark, 154, 124, 178, 126)
  $Graphics.DrawRectangle($penLight, 154, 124, 178, 126)
  $Graphics.DrawArc($penMain, 110, 118, 72, 72, 90, 270)
  $Graphics.DrawArc($penMain, 304, 180, 72, 72, -90, 270)
  $Graphics.DrawLine($penLight, 188, 158, 292, 158)
  $Graphics.DrawLine($penLight, 188, 190, 272, 190)
  $Graphics.DrawLine($penLight, 188, 222, 252, 222)
  $penLight.Dispose()
  $penMain.Dispose()
  $brushDark.Dispose()
  $brushMain.Dispose()
}

function Draw-CrosshairSymbol {
  param($Graphics, $Primary, $Secondary)

  $penLight = [System.Drawing.Pen]::new($Secondary, 8)
  $penMain = [System.Drawing.Pen]::new($Primary, 8)
  $brushMain = [System.Drawing.SolidBrush]::new($Primary)
  $Graphics.DrawEllipse($penLight, 154, 108, 204, 204)
  $Graphics.DrawEllipse($penMain, 204, 158, 104, 104)
  $Graphics.FillEllipse($brushMain, 236, 190, 40, 40)
  $Graphics.DrawLine($penLight, 256, 82, 256, 142)
  $Graphics.DrawLine($penLight, 256, 278, 256, 338)
  $Graphics.DrawLine($penLight, 108, 210, 168, 210)
  $Graphics.DrawLine($penLight, 344, 210, 404, 210)
  $penLight.Dispose()
  $penMain.Dispose()
  $brushMain.Dispose()
}

function Draw-BoltSymbol {
  param($Graphics, $Primary, $Secondary)

  $points = @(
    (New-PointF 268 92),
    (New-PointF 174 226),
    (New-PointF 246 226),
    (New-PointF 218 330),
    (New-PointF 340 178),
    (New-PointF 264 178)
  )
  Draw-FilledPolygon $Graphics $points $Primary (Convert-HexColor "#ffffff" 238) 7

  $pen = [System.Drawing.Pen]::new($Secondary, 8)
  $Graphics.DrawLine($pen, 118, 154, 188, 154)
  $Graphics.DrawLine($pen, 96, 198, 176, 198)
  $Graphics.DrawLine($pen, 118, 242, 166, 242)
  $pen.Dispose()
}

function Draw-TilesSymbol {
  param($Graphics, $Primary, $Secondary)

  $brushMain = [System.Drawing.SolidBrush]::new($Primary)
  $brushLight = [System.Drawing.SolidBrush]::new($Secondary)
  $pen = [System.Drawing.Pen]::new((Convert-HexColor "#ffffff" 230), 6)
  $Graphics.FillRectangle($brushMain, 148, 104, 80, 80)
  $Graphics.DrawRectangle($pen, 148, 104, 80, 80)
  $Graphics.FillRectangle($brushLight, 246, 148, 80, 80)
  $Graphics.DrawRectangle($pen, 246, 148, 80, 80)
  $Graphics.FillRectangle($brushMain, 190, 248, 88, 88)
  $Graphics.DrawRectangle($pen, 190, 248, 88, 88)
  $Graphics.DrawLine($pen, 118, 358, 390, 358)
  $brushMain.Dispose()
  $brushLight.Dispose()
  $pen.Dispose()
}

function Draw-ArrowsSymbol {
  param($Graphics, $Primary, $Secondary)

  $penMain = [System.Drawing.Pen]::new($Primary, 16)
  $penLight = [System.Drawing.Pen]::new($Secondary, 16)
  $penMain.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $penMain.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $penLight.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $penLight.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $Graphics.DrawLine($penMain, 118, 168, 332, 168)
  $Graphics.DrawLine($penMain, 332, 168, 288, 124)
  $Graphics.DrawLine($penMain, 332, 168, 288, 212)
  $Graphics.DrawLine($penLight, 394, 260, 180, 260)
  $Graphics.DrawLine($penLight, 180, 260, 224, 216)
  $Graphics.DrawLine($penLight, 180, 260, 224, 304)
  $penMain.Dispose()
  $penLight.Dispose()
}

function Draw-MemorySymbol {
  param($Graphics, $Primary, $Secondary)

  $brushMain = [System.Drawing.SolidBrush]::new($Primary)
  $brushDark = [System.Drawing.SolidBrush]::new((Convert-HexColor "#08111f" 235))
  $penLight = [System.Drawing.Pen]::new($Secondary, 7)
  $Graphics.FillRectangle($brushDark, 142, 118, 104, 142)
  $Graphics.DrawRectangle($penLight, 142, 118, 104, 142)
  $Graphics.FillRectangle($brushMain, 214, 90, 104, 142)
  $Graphics.DrawRectangle($penLight, 214, 90, 104, 142)
  $Graphics.FillRectangle($brushDark, 278, 138, 104, 142)
  $Graphics.DrawRectangle($penLight, 278, 138, 104, 142)
  $Graphics.DrawArc($penLight, 152, 270, 208, 96, 0, 180)
  $Graphics.FillEllipse($brushMain, 236, 296, 42, 42)
  $brushMain.Dispose()
  $brushDark.Dispose()
  $penLight.Dispose()
}

function Draw-Symbol {
  param($Graphics, $Symbol, $Primary, $Secondary)

  switch ($Symbol) {
    "scroll" { Draw-ScrollSymbol $Graphics $Primary $Secondary }
    "crosshair" { Draw-CrosshairSymbol $Graphics $Primary $Secondary }
    "bolt" { Draw-BoltSymbol $Graphics $Primary $Secondary }
    "tiles" { Draw-TilesSymbol $Graphics $Primary $Secondary }
    "arrows" { Draw-ArrowsSymbol $Graphics $Primary $Secondary }
    "memory" { Draw-MemorySymbol $Graphics $Primary $Secondary }
  }
}

function Export-GameLogo {
  param([hashtable]$Logo)

  $bitmap = [System.Drawing.Bitmap]::new(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $primary = Convert-HexColor $Logo.Primary
  $secondary = Convert-HexColor $Logo.Secondary
  $accent = Convert-HexColor $Logo.Accent
  $black = Convert-HexColor "#000000" 245
  $navy = Convert-HexColor "#07111f" 245

  Draw-SpeedLines $graphics (Convert-HexColor $Logo.Primary 95) 512 512
  Draw-Halftone $graphics (Convert-HexColor "#ffffff" 32) 512 512

  $shadow = @(
    (New-PointF 256 34),
    (New-PointF 444 114),
    (New-PointF 476 326),
    (New-PointF 344 476),
    (New-PointF 126 466),
    (New-PointF 44 300),
    (New-PointF 72 112)
  )
  Draw-FilledPolygon $graphics $shadow (Convert-HexColor "#000000" 185) $black 5

  $frame = @(
    (New-PointF 256 20),
    (New-PointF 430 92),
    (New-PointF 466 306),
    (New-PointF 338 456),
    (New-PointF 112 448),
    (New-PointF 40 286),
    (New-PointF 70 92)
  )
  Draw-FilledPolygon $graphics $frame $primary $black 12

  $inner = @(
    (New-PointF 256 50),
    (New-PointF 400 108),
    (New-PointF 432 292),
    (New-PointF 322 420),
    (New-PointF 132 414),
    (New-PointF 76 276),
    (New-PointF 100 112)
  )
  Draw-FilledPolygon $graphics $inner $navy (Convert-HexColor "#ffffff" 52) 3

  Draw-Symbol $graphics $Logo.Symbol $primary $secondary

  $barBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Rectangle]::new(82, 344, 348, 92),
    (Convert-HexColor "#020617" 245),
    (Convert-HexColor $Logo.Primary 235),
    0
  )
  $barPen = [System.Drawing.Pen]::new($black, 7)
  $graphics.FillRectangle($barBrush, 82, 344, 348, 92)
  $graphics.DrawRectangle($barPen, 82, 344, 348, 92)
  $barBrush.Dispose()
  $barPen.Dispose()

  Draw-OutlinedText $graphics $Logo.Title1 43 ([System.Drawing.RectangleF]::new(84, 350, 344, 42)) (Convert-HexColor "#ffffff") $black 6
  Draw-OutlinedText $graphics $Logo.Title2 43 ([System.Drawing.RectangleF]::new(84, 392, 344, 42)) $accent $black 6
  Draw-OutlinedText $graphics $Logo.Mark 46 ([System.Drawing.RectangleF]::new(178, 28, 156, 64)) (Convert-HexColor "#ffffff") $black 6

  $path = Join-Path $outDir "$($Logo.Slug)-logo.png"
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

$logos = @(
  @{ Slug = "enigma-scroll"; Title1 = "ENIGMA"; Title2 = "SCROLL"; Mark = "ES"; Primary = "#22c55e"; Secondary = "#86efac"; Accent = "#facc15"; Symbol = "scroll" },
  @{ Slug = "space-lex"; Title1 = "LEXICON"; Title2 = "BLASTER"; Mark = "LB"; Primary = "#8b5cf6"; Secondary = "#c4b5fd"; Accent = "#67e8f9"; Symbol = "crosshair" },
  @{ Slug = "speed-verb-challenge"; Title1 = "SPEED VERB"; Title2 = "CHALLENGE"; Mark = "SV"; Primary = "#f59e0b"; Secondary = "#fde68a"; Accent = "#ffffff"; Symbol = "bolt" },
  @{ Slug = "wordfall"; Title1 = "WORD"; Title2 = "FALL"; Mark = "WF"; Primary = "#06b6d4"; Secondary = "#67e8f9"; Accent = "#ffffff"; Symbol = "tiles" },
  @{ Slug = "flash-translation"; Title1 = "FLASH"; Title2 = "TRANSLATE"; Mark = "FT"; Primary = "#f97316"; Secondary = "#fdba74"; Accent = "#ffffff"; Symbol = "arrows" },
  @{ Slug = "flashback"; Title1 = "FLASH"; Title2 = "BACK"; Mark = "FB"; Primary = "#7c3aed"; Secondary = "#c4b5fd"; Accent = "#67e8f9"; Symbol = "memory" }
)

foreach ($logo in $logos) {
  Export-GameLogo $logo
}

$wordmark = [System.Drawing.Bitmap]::new(1200, 380, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$wg = [System.Drawing.Graphics]::FromImage($wordmark)
$wg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$wg.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$wg.Clear([System.Drawing.Color]::Transparent)
Draw-SpeedLines $wg (Convert-HexColor "#06b6d4" 88) 1200 380
Draw-Halftone $wg (Convert-HexColor "#ffffff" 30) 1200 380
Draw-OutlinedText $wg "ENGLISH QUEST" 108 ([System.Drawing.RectangleF]::new(26, 30, 1148, 135)) (Convert-HexColor "#ffffff") (Convert-HexColor "#000000") 12
Draw-OutlinedText $wg "GAME ARENA" 94 ([System.Drawing.RectangleF]::new(96, 160, 1008, 126)) (Convert-HexColor "#facc15") (Convert-HexColor "#000000") 12
Draw-OutlinedText $wg "PLAY SMART. HIT HARD." 36 ([System.Drawing.RectangleF]::new(100, 294, 1000, 58)) (Convert-HexColor "#67e8f9") (Convert-HexColor "#000000") 6
$wordmark.Save((Join-Path $outDir "englishquest-games-logo.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$wg.Dispose()
$wordmark.Dispose()
