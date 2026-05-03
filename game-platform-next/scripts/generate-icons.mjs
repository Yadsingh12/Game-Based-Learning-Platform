import sharp from 'sharp'
import fs from 'fs'

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

fs.mkdirSync('public/icons', { recursive: true })

const createSVG = (size) => {
  const pad     = size * 0.08
  const w       = size - pad * 2
  const cx      = size / 2
  
  // Font sizes scale with icon size
  const islSize    = size * 0.32
  const learnSize  = size * 0.13
  const signSize   = size * 0.155

  // Vertical positions
  const islY       = size * 0.48
  const signY      = size * 0.72
  const learnY     = size * 0.86

  // Blue underline under ISL
  const lineY      = size * 0.54
  const lineW      = size * 0.62
  const lineH      = size * 0.025
  const lineX      = cx - lineW / 2

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">

  <!-- White background -->
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="white"/>

  <!-- Blue border -->
  <rect width="${size}" height="${size}" rx="${size * 0.18}"
    fill="none" stroke="#2563eb" stroke-width="${size * 0.04}"/>

  <!-- ISL — bold blue -->
  <text
    x="${cx}" y="${islY}"
    text-anchor="middle"
    font-family="Arial Black, Arial, sans-serif"
    font-weight="900"
    font-size="${islSize}"
    fill="#2563eb"
    letter-spacing="${size * 0.02}"
  >ISL</text>

  <!-- Underline below ISL -->
  <rect x="${lineX}" y="${lineY}" width="${lineW}" height="${lineH}"
    rx="${lineH / 2}" fill="#2563eb"/>

  <!-- Sign — medium blue -->
  <text
    x="${cx}" y="${signY}"
    text-anchor="middle"
    font-family="Arial, sans-serif"
    font-weight="700"
    font-size="${signSize}"
    fill="#1d4ed8"
  >Sign</text>

  <!-- Learn — lighter blue -->
  <text
    x="${cx}" y="${learnY}"
    text-anchor="middle"
    font-family="Arial, sans-serif"
    font-weight="700"
    font-size="${learnSize}"
    fill="#3b82f6"
    letter-spacing="${size * 0.01}"
  >Learn</text>

</svg>
`
}

for (const size of sizes) {
  const svg = createSVG(size)
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`)
  console.log(`✓ Generated ${size}x${size}`)
}

// Also generate a favicon.ico sized one at 32x32
const faviconSvg = createSVG(32)
await sharp(Buffer.from(faviconSvg))
  .resize(32, 32)
  .png()
  .toFile('public/favicon.png')

console.log('✓ Generated favicon.png')
console.log('\n🎉 All icons generated in public/icons/')