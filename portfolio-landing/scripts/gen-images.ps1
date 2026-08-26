# Generates abstract dark-themed SVG placeholders for the landing page.
# Palette follows the design system accent: #89AACC -> #4E85BF on near-black.
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "..\public\images"
New-Item -ItemType Directory -Force $dir | Out-Null

function New-Image {
    param([string]$Name, [int]$W, [int]$H, [int]$Seed, [string]$Body)

    $header = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {0} {1}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0.9" y2="1">
<stop offset="0" stop-color="#151d28"/>
<stop offset="1" stop-color="#0b0e13"/>
</linearGradient>
<linearGradient id="ac" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#89AACC"/>
<stop offset="1" stop-color="#4E85BF"/>
</linearGradient>
<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="{2}"/><feColorMatrix type="saturate" values="0"/></filter>
<filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="{3}"/></filter>
</defs>
<rect width="{0}" height="{1}" fill="url(#bg)"/>
'@

    $footer = @'
<rect width="{0}" height="{1}" filter="url(#n)" opacity="0.07"/>
</svg>
'@

    $svg = ($header -f $W, $H, $Seed, [math]::Max(20, $W / 18)) `
        + ($Body -replace '\{W\}', $W -replace '\{H\}', $H) `
        + ($footer -f $W, $H)

    $path = Join-Path $dir "$Name.svg"
    [System.IO.File]::WriteAllText($path, $svg)
    Write-Host "wrote $path"
}

# ---- Works (bento cards) ----

New-Image 'work-automotive' 800 500 7 @'
<g filter="url(#soft)" opacity="0.55"><ellipse cx="{W}" cy="170" rx="190" ry="130" fill="#4E85BF"/></g>
<g stroke="#89AACC" stroke-opacity="0.45" stroke-width="1.5">
<line x1="0" y1="330" x2="{W}" y2="240"/>
<line x1="0" y1="380" x2="{W}" y2="290"/>
<line x1="0" y1="430" x2="{W}" y2="340"/>
</g>
<path d="M120 210 L300 210 L360 260 L300 310 L120 310 Z" fill="none" stroke="url(#ac)" stroke-width="3"/>
<circle cx="640" cy="330" r="52" fill="none" stroke="#89AACC" stroke-width="3"/>
<circle cx="640" cy="330" r="14" fill="#4E85BF" opacity="0.8"/>
'@

New-Image 'work-architecture' 800 600 11 @'
<g fill="#89AACC">
<rect x="90"  y="180" width="110" height="420" opacity="0.30"/>
<rect x="230" y="100" width="140" height="500" opacity="0.42" fill="#4E85BF"/>
<rect x="400" y="240" width="90"  height="360" opacity="0.24"/>
<rect x="520" y="150" width="150" height="450" opacity="0.36" fill="#4E85BF"/>
</g>
<g stroke="#89AACC" stroke-opacity="0.35" stroke-width="1">
<line x1="0" y1="480" x2="{W}" y2="480"/>
<line x1="0" y1="560" x2="{W}" y2="560"/>
</g>
<circle cx="640" cy="80" r="46" fill="none" stroke="#89AACC" stroke-width="2" opacity="0.7"/>
'@

New-Image 'work-human' 800 600 21 @'
<g transform="translate(560 300)" fill="none" stroke="#89AACC">
<circle r="60"  stroke-opacity="0.9"  stroke-width="2.5"/>
<circle r="110" stroke-opacity="0.55" stroke-width="2"/>
<circle r="165" stroke-opacity="0.32" stroke-width="1.5"/>
<circle r="225" stroke-opacity="0.16" stroke-width="1"/>
</g>
<circle cx="560" cy="300" r="34" fill="url(#ac)" opacity="0.9"/>
<path d="M0 520 Q 220 430 430 505 T 800 470" fill="none" stroke="#4E85BF" stroke-width="2.5" stroke-opacity="0.6"/>
'@

New-Image 'work-brand' 800 500 33 @'
<g filter="url(#soft)" opacity="0.5"><ellipse cx="250" cy="160" rx="170" ry="120" fill="#4E85BF"/></g>
<rect x="150" y="150" width="220" height="220" rx="48" fill="#89AACC" opacity="0.28" transform="rotate(-12 260 260)"/>
<rect x="300" y="170" width="220" height="220" rx="48" fill="#4E85BF" opacity="0.34" transform="rotate(10 410 280)"/>
<rect x="235" y="215" width="205" height="205" rx="46" fill="none" stroke="url(#ac)" stroke-width="3"/>
'@

# ---- Journal thumbnails (small squares, circular crop) ----

New-Image 'journal-1' 240 240 41 @'
<g transform="translate(120 120)">
<circle r="70" fill="none" stroke="#89AACC" stroke-width="2.5" stroke-opacity="0.8"/>
<circle r="44" fill="#4E85BF" opacity="0.35"/>
<circle r="16" fill="url(#ac)"/>
</g>
'@

New-Image 'journal-2' 240 240 47 @'
<g stroke="#89AACC" stroke-width="2" fill="none">
<path d="M20 170 Q 70 110 120 150 T 220 120" stroke-opacity="0.9"/>
<path d="M20 130 Q 70 70 120 110 T 220 80"  stroke-opacity="0.5"/>
<path d="M20 210 Q 70 150 120 190 T 220 160" stroke-opacity="0.3"/>
</g>
'@

New-Image 'journal-3' 240 240 53 @'
<rect x="55" y="55" width="90" height="90" rx="20" fill="#89AACC" opacity="0.30" transform="rotate(-14 100 100)"/>
<rect x="95" y="95" width="90" height="90" rx="20" fill="#4E85BF" opacity="0.34" transform="rotate(12 140 140)"/>
'@

New-Image 'journal-4' 240 240 59 @'
<text x="120" y="158" font-family="Georgia, serif" font-style="italic" font-size="120" fill="none" stroke="#89AACC" stroke-width="1.6" text-anchor="middle">Aa</text>
<circle cx="185" cy="70" r="10" fill="#4E85BF" opacity="0.85"/>
'@

# ---- Explorations (parallax gallery squares) ----

New-Image 'explore-1' 640 640 61 @'
<g stroke="#89AACC" fill="none" stroke-width="2">
<path d="M0 320 Q 160 220 320 320 T 640 320" stroke-opacity="0.8"/>
<path d="M0 400 Q 160 300 320 400 T 640 400" stroke-opacity="0.5"/>
<path d="M0 480 Q 160 380 320 480 T 640 480" stroke-opacity="0.3"/>
<path d="M0 240 Q 160 140 320 240 T 640 240" stroke-opacity="0.5"/>
</g>
<circle cx="480" cy="180" r="56" fill="#4E85BF" opacity="0.4"/>
'@

# Precompute dot rows (single-quoted here-strings do NOT expand subexpressions)
$dotSpecs = @(
    @{ y = 200; r = 10; base = 0.15; step = 0.10; fill = '' },
    @{ y = 320; r = 14; base = 0.70; step = -0.07; fill = '#4E85BF' },
    @{ y = 440; r = 10; base = 0.15; step = 0.08; fill = '' }
)
$explore2Circles = foreach ($spec in $dotSpecs) {
    0..7 | ForEach-Object {
        $x = 80 + $_ * 68
        $op = [math]::Round($spec.base + $_ * $spec.step, 2)
        $fillAttr = if ($spec.fill) { " fill=`"$($spec.fill)`"" } else { "" }
        "<circle cx=`"$x`" cy=`"$($spec.y)`" r=`"$($spec.r)`" opacity=`"$op`"$fillAttr/>"
    }
}
New-Image 'explore-2' 640 640 67 ("<g fill=`"#89AACC`">`n" + ($explore2Circles -join "`n") + "`n</g>")

New-Image 'explore-3' 640 640 71 @'
<g transform="translate(320 340)" fill="none" stroke="#89AACC">
<circle r="70"  stroke-width="2.5" stroke-opacity="0.85"/>
<circle r="130" stroke-width="2"   stroke-opacity="0.5"/>
<circle r="195" stroke-width="1.5" stroke-opacity="0.3"/>
<circle r="265" stroke-width="1"   stroke-opacity="0.15"/>
</g>
<circle cx="320" cy="340" r="26" fill="url(#ac)"/>
'@

New-Image 'explore-4' 640 640 73 @'
<g fill="#4E85BF">
<polygon points="320,120 470,400 170,400" opacity="0.30"/>
<polygon points="320,210 415,395 225,395" fill="#89AACC" opacity="0.38"/>
</g>
<g stroke="#89AACC" stroke-opacity="0.4" stroke-width="1.5">
<line x1="60"  y1="470" x2="580" y2="470"/>
<line x1="100" y1="520" x2="540" y2="520"/>
</g>
'@

New-Image 'explore-5' 640 640 79 @'
<g transform="translate(320 320)" fill="none">
<circle r="60"  stroke="#89AACC" stroke-width="14" stroke-opacity="0.75"/>
<circle r="115" stroke="#4E85BF" stroke-width="14" stroke-opacity="0.45"/>
<circle r="170" stroke="#89AACC" stroke-width="14" stroke-opacity="0.22"/>
</g>
'@

# Precompute mesh lines (same here-string limitation)
$meshH = 0..6 | ForEach-Object {
    $y = 100 + $_ * 74
    "<line x1=`"60`" y1=`"$y`" x2=`"580`" y2=`"$($y - 30)`"/>"
}
$meshV = 0..6 | ForEach-Object {
    $x = 80 + $_ * 80
    "<line x1=`"$x`" y1=`"80`" x2=`"$($x + 40)`" y2=`"560`"/>"
}
$explore6Body = "<g stroke=`"#89AACC`" stroke-opacity=`"0.28`" stroke-width=`"1`">`n" `
    + ($meshH -join "`n") + "`n" + ($meshV -join "`n") `
    + "`n</g>`n<g fill=`"#4E85BF`" opacity=`"0.8`">`n<circle cx=`"240`" cy=`"252`" r=`"9`"/>`n<circle cx=`"400`" cy=`"326`" r=`"9`"/>`n<circle cx=`"160`" cy=`"478`" r=`"9`"/>`n</g>"
New-Image 'explore-6' 640 640 83 $explore6Body

Write-Host "done: $((Get-ChildItem $dir -Filter *.svg).Count) svgs"
