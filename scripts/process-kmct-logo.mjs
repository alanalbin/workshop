import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const userImagePath = 'C:/Users/User/.gemini/antigravity/brain/1b15e168-eed8-4075-b563-3d7c4d69b1fd/.user_uploaded/media_1793932986080_ae5e75cb.jpg';

async function processLogo() {
  console.log('Processing uploaded KMCT logo...');

  // 1. Trim outer whitespace from the full banner
  const trimmedFullBuffer = await sharp(userImagePath)
    .trim({ background: '#ffffff', threshold: 15 })
    .png()
    .toBuffer();

  const meta = await sharp(trimmedFullBuffer).metadata();
  console.log('Trimmed banner dimensions:', meta.width, 'x', meta.height);

  // 2. Make white background transparent for the full banner logo so it looks gorgeous on any background!
  // In the image, the background is pure white #ffffff / rgb(255,255,255).
  // Let's create a transparent PNG version and a clean white-padded version.
  const rawPixels = await sharp(trimmedFullBuffer).ensureAlpha().raw().toBuffer();
  const transparentBuffer = Buffer.from(rawPixels);

  for (let i = 0; i < transparentBuffer.length; i += 4) {
    const r = transparentBuffer[i];
    const g = transparentBuffer[i + 1];
    const b = transparentBuffer[i + 2];
    // If pixel is near white
    if (r > 245 && g > 245 && b > 245) {
      transparentBuffer[i + 3] = 0; // Alpha 0 (transparent)
    } else if (r > 230 && g > 230 && b > 230) {
      // Smooth edge antialiasing
      const diff = 255 - Math.max(r, g, b);
      transparentBuffer[i + 3] = Math.min(255, Math.round((diff / 25) * 255));
    }
  }

  const transparentBannerPng = await sharp(transparentBuffer, {
    raw: {
      width: meta.width,
      height: meta.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();

  // Save the full KMCT logo banner with transparency
  const destKmctPath = path.join(process.cwd(), 'public', 'logos', 'kmct-college.png');
  fs.writeFileSync(destKmctPath, transparentBannerPng);
  console.log('✅ Updated public/logos/kmct-college.png with official new banner');

  // Also update public/logo.png
  fs.writeFileSync(path.join(process.cwd(), 'public', 'logo.png'), transparentBannerPng);
  console.log('✅ Updated public/logo.png');

  // 3. Extract the round blue emblem on the left!
  // The icon is within the left portion of the banner (approx width = height = 78px)
  // Let's find the exact width of the icon by scanning from x=0
  const iconCropWidth = meta.height; // Square icon
  const iconCroppedBuffer = await sharp(trimmedFullBuffer)
    .extract({
      left: 0,
      top: 0,
      width: iconCropWidth,
      height: meta.height,
    })
    .png()
    .toBuffer();

  // Make background transparent for the round blue icon
  const iconMeta = await sharp(iconCroppedBuffer).metadata();
  const iconRaw = await sharp(iconCroppedBuffer).ensureAlpha().raw().toBuffer();
  const iconTrans = Buffer.from(iconRaw);

  for (let i = 0; i < iconTrans.length; i += 4) {
    const r = iconTrans[i];
    const g = iconTrans[i + 1];
    const b = iconTrans[i + 2];
    if (r > 240 && g > 240 && b > 240) {
      iconTrans[i + 3] = 0;
    } else if (r > 225 && g > 225 && b > 225) {
      const diff = 255 - Math.max(r, g, b);
      iconTrans[i + 3] = Math.min(255, Math.round((diff / 30) * 255));
    }
  }

  const transparentIconPng = await sharp(iconTrans, {
    raw: {
      width: iconMeta.width,
      height: iconMeta.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();

  // Save the round blue emblem as public/logos/kmct-icon.png and public/logo-icon.png
  const destIconPath = path.join(process.cwd(), 'public', 'logos', 'kmct-icon.png');
  fs.writeFileSync(destIconPath, transparentIconPng);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'logo-icon.png'), transparentIconPng);
  console.log('✅ Created public/logos/kmct-icon.png and public/logo-icon.png');

  // 4. Generate high-res 192x192 icon for mobile homescreens and favicons
  const icon192 = await sharp(transparentIconPng)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(process.cwd(), 'public', 'icon-192.png'), icon192);

  // 5. Generate dual 16x16 / 32x32 Favicon ICO with the new blue emblem!
  const png32 = await sharp(transparentIconPng)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const png16 = await sharp(transparentIconPng)
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(2, 4);

  const dir16 = Buffer.alloc(16);
  dir16.writeUInt8(16, 0);
  dir16.writeUInt8(16, 1);
  dir16.writeUInt8(0, 2);
  dir16.writeUInt8(0, 3);
  dir16.writeUInt16LE(1, 4);
  dir16.writeUInt16LE(32, 6);
  dir16.writeUInt32LE(png16.length, 8);
  dir16.writeUInt32LE(6 + 32, 12);

  const dir32 = Buffer.alloc(16);
  dir32.writeUInt8(32, 0);
  dir32.writeUInt8(32, 1);
  dir32.writeUInt8(0, 2);
  dir32.writeUInt8(0, 3);
  dir32.writeUInt16LE(1, 4);
  dir32.writeUInt16LE(32, 6);
  dir32.writeUInt32LE(png32.length, 8);
  dir32.writeUInt32LE(38 + png16.length, 12);

  const icoBuf = Buffer.concat([icoHeader, dir16, dir32, png16, png32]);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), icoBuf);
  fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'favicon.ico'), icoBuf);
  console.log('✅ Overwrote favicon.ico with the official blue KMCT emblem');

  // Also convert to SVG / copy into src/app/icon.png
  fs.writeFileSync(path.join(process.cwd(), 'public', 'icon.png'), png32);
  fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'icon.png'), png32);
  console.log('✅ Created icon.png');
}

processLogo().catch(err => {
  console.error('Error processing logo:', err);
  process.exit(1);
});
