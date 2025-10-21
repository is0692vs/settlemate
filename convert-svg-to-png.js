const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, 'public');

// SVGファイルをPNGに変換
async function convertSVGtoPNG() {
  const conversions = [
    { svg: 'icon-192x192.svg', png: 'icon-192x192.png', size: 192 },
    { svg: 'icon-512x512.svg', png: 'icon-512x512.png', size: 512 },
    { svg: 'apple-touch-icon.svg', png: 'apple-touch-icon.png', size: 180 },
  ];

  for (const { svg, png, size } of conversions) {
    const svgPath = path.join(publicDir, svg);
    const pngPath = path.join(publicDir, png);
    
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    
    console.log(`✓ Converted ${svg} → ${png}`);
  }

  console.log('\n✨ All PNG icons created successfully!');
}

convertSVGtoPNG().catch(console.error);
