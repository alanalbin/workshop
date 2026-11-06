import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="50%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="bulbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <radialGradient id="sparkGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </radialGradient>
  </defs>

  <!-- Squircle Base Container -->
  <rect width="64" height="64" rx="16" fill="url(#bgGrad)"/>
  <rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.5"/>

  <!-- Energy Radiance Rays -->
  <g stroke="#fde047" stroke-width="3" stroke-linecap="round">
    <line x1="32" y1="8" x2="32" y2="4"/>
    <line x1="15" y1="15" x2="11" y2="11"/>
    <line x1="49" y1="15" x2="53" y2="11"/>
    <line x1="8" y1="32" x2="4" y2="32"/>
    <line x1="56" y1="32" x2="60" y2="32"/>
  </g>

  <!-- Glowing Idea Bulb Body -->
  <path d="M22 28 C22 22.477 26.477 18 32 18 C37.523 18 42 22.477 42 28 C42 32 39.5 35.5 37 38.5 L37 43 C37 44.1 36.1 45 35 45 L29 45 C27.9 45 27 44.1 27 43 L27 38.5 C24.5 35.5 22 32 22 28 Z" fill="url(#bulbGrad)" filter="drop-shadow(0px 2px 6px rgba(56, 189, 248, 0.4))"/>

  <!-- Golden Core Filament Spark -->
  <circle cx="32" cy="28" r="5" fill="url(#sparkGlow)"/>
  <circle cx="32" cy="28" r="2.2" fill="#ffffff"/>

  <!-- Base Threads -->
  <rect x="28" y="46" width="8" height="2.5" rx="1.2" fill="#cbd5e1"/>
  <rect x="29" y="49.5" width="6" height="2.5" rx="1.2" fill="#94a3b8"/>
  <path d="M30 53 L34 53 C34 54.1 33.1 55 32 55 C30.9 55 30 54.1 30 53 Z" fill="#64748b"/>
</svg>`;

async function generate() {
  console.log('Generating new "Problem to Possibility" icons to replace old Illuminate logo...');

  const root = process.cwd();
  const svgBuf = Buffer.from(svgIcon);

  // 1. Write icon.svg to public/ and src/app/
  fs.writeFileSync(path.join(root, 'public', 'icon.svg'), svgIcon, 'utf-8');
  fs.writeFileSync(path.join(root, 'src', 'app', 'icon.svg'), svgIcon, 'utf-8');
  console.log('✅ Created public/icon.svg and src/app/icon.svg');

  // 2. Generate PNG 32x32 for Favicon ICO
  const png32 = await sharp(svgBuf).resize(32, 32).png().toBuffer();
  const png16 = await sharp(svgBuf).resize(16, 16).png().toBuffer();

  // Create valid 2-image ICO file (16x16 + 32x32)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(2, 4); // 2 images

  const dir16 = Buffer.alloc(16);
  dir16.writeUInt8(16, 0);
  dir16.writeUInt8(16, 1);
  dir16.writeUInt8(0, 2);
  dir16.writeUInt8(0, 3);
  dir16.writeUInt16LE(1, 4);
  dir16.writeUInt16LE(32, 6);
  dir16.writeUInt32LE(png16.length, 8);
  dir16.writeUInt32LE(6 + 32, 12); // offset: 6 + 16*2 = 38

  const dir32 = Buffer.alloc(16);
  dir32.writeUInt8(32, 0);
  dir32.writeUInt8(32, 1);
  dir32.writeUInt8(0, 2);
  dir32.writeUInt8(0, 3);
  dir32.writeUInt16LE(1, 4);
  dir32.writeUInt16LE(32, 6);
  dir32.writeUInt32LE(png32.length, 8);
  dir32.writeUInt32LE(38 + png16.length, 12);

  const icoBuf = Buffer.concat([header, dir16, dir32, png16, png32]);

  // Overwrite favicon.ico in both public/ and src/app/
  fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), icoBuf);
  fs.writeFileSync(path.join(root, 'src', 'app', 'favicon.ico'), icoBuf);
  console.log('✅ Overwrote public/favicon.ico and src/app/favicon.ico with new 16x16/32x32 icon');

  // 3. Generate high-res 192x192 & logo-icon.png
  const png192 = await sharp(svgBuf).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(root, 'public', 'icon-192.png'), png192);
  fs.writeFileSync(path.join(root, 'public', 'logo-icon.png'), png192);
  console.log('✅ Overwrote public/icon-192.png and public/logo-icon.png');

  // 4. Remove illuminate-torch.png if it exists
  const torchPath = path.join(root, 'public', 'logos', 'illuminate-torch.png');
  if (fs.existsSync(torchPath)) {
    fs.unlinkSync(torchPath);
    console.log('✅ Removed obsolete public/logos/illuminate-torch.png');
  }

  console.log('🎉 All tab icons and favicons successfully updated!');
}

generate().catch(err => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
