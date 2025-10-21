const fs = require('fs');
const path = require('path');

// SVGアイコンを作成
function createSVGIcon(size, text = 'SM') {
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="${size}" height="${size}" fill="#3b82f6"/>
  
  <!-- 白い円 -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/3.5}" fill="#ffffff"/>
  
  <!-- テキスト -->
  <text 
    x="${size/2}" 
    y="${size/2}" 
    font-size="${size/4}" 
    font-weight="bold" 
    font-family="sans-serif" 
    fill="#3b82f6" 
    text-anchor="middle" 
    dominant-baseline="central"
  >${text}</text>
</svg>`.trim();
}

// publicディレクトリに保存
const publicDir = path.join(__dirname, 'public');

// 各サイズのSVGを作成
const sizes = [
  { size: 192, name: 'icon-192x192.svg' },
  { size: 512, name: 'icon-512x512.svg' },
  { size: 180, name: 'apple-touch-icon.svg' },
];

sizes.forEach(({ size, name }) => {
  const svg = createSVGIcon(size);
  const filePath = path.join(publicDir, name);
  fs.writeFileSync(filePath, svg);
  console.log(`✓ Created ${name}`);
});

console.log('\n✨ All icons created successfully!');
console.log('📝 Note: SVG icons are generated. For PNG, you can:');
console.log('   1. Use the generated SVG files directly (most modern browsers support this)');
console.log('   2. Convert to PNG using an online tool like https://cloudconvert.com/svg-to-png');
console.log('   3. Or use a tool like sharp: pnpm add -D sharp && node convert-svg-to-png.js');
