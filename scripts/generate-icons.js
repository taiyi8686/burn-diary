// Generate simple SVG-based PNG icons using sharp or inline SVG data
// This script creates placeholder icons. For production, replace with actual design.

const fs = require('fs');
const path = require('path');

function createSVG(size) {
  const fontSize = Math.floor(size * 0.4);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#12121c"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </linearGradient>
    <linearGradient id="flame" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#63d297"/>
      <stop offset="100%" stop-color="#4ecdc4"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.2)}" fill="url(#bg)"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize}" font-family="sans-serif">🔥</text>
</svg>`;
}

// Write SVG files that can be converted
const publicDir = path.join(__dirname, '..', 'public');

[192, 512].forEach(size => {
  const svg = createSVG(size);
  const svgPath = path.join(publicDir, `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`Created ${svgPath}`);
});

console.log('Icon SVGs created. Convert to PNG for production use.');
