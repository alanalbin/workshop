import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

const SHEET_ID = '1ooc3SoHQbKIeCFhaNGm5_qoRSKuC41PDVp_tcodRi4Q';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

const PASSES_DIR = 'public/generated-passes/passes';
const QRCODES_DIR = 'public/generated-passes/qrcodes';
const MANIFEST_PATH = 'public/generated-passes/passes.json';

// Ensure output directories exist
[PASSES_DIR, QRCODES_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function sanitizeFilename(str) {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, 40);
}

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  console.log('===========================================================');
  console.log('🎫 GENERATING 2X ULTRA-HD SCANNABLE PASSES & QR CODES');
  console.log('===========================================================\n');

  console.log('Fetching live confirmed candidates from Google Sheet...');
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`Failed to fetch Google Sheet: ${res.statusText}`);

  const csvText = await res.text();
  const lines = csvText.trim().split('\n');

  const candidates = [];
  const seenEmails = new Set();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 5) continue;

    const email = (cols[3] || '').toLowerCase().trim();
    const fullName = cols[2] || '';
    const phone = cols[4] || '';
    const course = cols[5] || 'Engineering';
    const year = cols[6] || '1st Year';
    const p2pTicket = cols[1] || '';
    const utr = cols[9] || '';

    // STRICT EXCLUSIONS: Kadeejath Mashmooma Gulzar and test records
    if (
      email.includes('kadeejath') ||
      fullName.toLowerCase().includes('kadeejath') ||
      utr === 'pay_TwkHug9cRRmVHo' ||
      utr === 'pay_TjQSIYw4J4tPTW' ||
      email.includes('test_') ||
      email.includes('example.com')
    ) {
      continue;
    }

    if (!email || seenEmails.has(email)) continue;
    seenEmails.add(email);

    candidates.push({
      index: candidates.length + 1,
      ticketNumber: `KMCT-WS-${String(candidates.length + 1).padStart(2, '0')}`,
      p2pTicket: p2pTicket || `P2P-KMCT-AUTO-${String(candidates.length + 1).padStart(2, '0')}`,
      fullName,
      email,
      phone,
      course,
      year,
      utr,
    });
  }

  console.log(`Found ${candidates.length} confirmed candidates to generate passes for.\n`);

  // Pre-load and resize 2x template (1364 x 2048)
  console.log('Preparing 2x Ultra-HD template base (1364 x 2048)...');
  const base2xBuffer = await sharp('public/pass-template.jpg')
    .resize(1364, 2048, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();

  const manifest = [];
  let allScanPassed = true;

  for (const c of candidates) {
    const safeName = sanitizeFilename(c.fullName);
    const passFilename = `${c.ticketNumber}_${safeName}.png`;
    const qrFilename = `${c.ticketNumber}_QR_${safeName}.png`;

    const passFilePath = path.join(PASSES_DIR, passFilename);
    const qrFilePath = path.join(QRCODES_DIR, qrFilename);

    // Ultra-Fast Scannable HTTPS URL Payload
    const scanUrl = `https://from-problem-to-possibility.vercel.app/success?id=${encodeURIComponent(c.p2pTicket)}`;

    // 1. Generate 800x800 Standalone Ultra-HD QR Code PNG
    const standaloneQrBuffer = await QRCode.toBuffer(scanUrl, {
      width: 800,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    fs.writeFileSync(qrFilePath, standaloneQrBuffer);

    // 2. Generate 292x292 Crisp Pass QR Code
    const passQrBuffer = await QRCode.toBuffer(scanUrl, {
      width: 292,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });

    // 3. Prepare 2x SVG Overlay for the Ticket ID capsule and Candidate Details
    const displayShortP2p = c.p2pTicket.startsWith('P2P-KMCT-')
      ? c.p2pTicket.split('-').slice(2).join('-')
      : c.p2pTicket;

    const svgOverlay = `
      <svg width="1364" height="2048" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&amp;display=swap');
            .ticket-title {
              font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
              font-size: 28px;
              font-weight: 900;
              fill: #3b0712;
              letter-spacing: 0.5px;
            }
            .candidate-sub {
              font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
              font-size: 21px;
              font-weight: 700;
              fill: #5c141e;
            }
          </style>
        </defs>

        <!-- 2x Clean capsule cover with rounded corners -->
        <rect x="552" y="1244" width="636" height="84" rx="42" fill="#FAF5EE" />

        <!-- Ticket Number & Hash -->
        <text x="588" y="1282" class="ticket-title">${escapeXml(c.ticketNumber)} • ${escapeXml(displayShortP2p)}</text>
        <!-- Participant Name & Dept -->
        <text x="588" y="1312" class="candidate-sub">${escapeXml(c.fullName)} (${escapeXml(c.course)})</text>
      </svg>
    `;

    // 4. Composite onto 2x Ultra-HD Pass Template
    const passBuffer = await sharp(base2xBuffer)
      .composite([
        {
          input: passQrBuffer,
          left: 536,
          top: 1344,
        },
        {
          input: Buffer.from(svgOverlay),
          left: 0,
          top: 0,
        },
      ])
      .png({ quality: 100 })
      .toBuffer();

    fs.writeFileSync(passFilePath, passBuffer);

    // 5. Automated Verification Test: Ensure the QR code inside the pass scans with 100% accuracy!
    const crop = await sharp(passBuffer)
      .extract({ left: 520, top: 1330, width: 330, height: 330 })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const scanResult = jsQR(new Uint8ClampedArray(crop.data), crop.info.width, crop.info.height);
    const isValidScan = scanResult && scanResult.data === scanUrl;

    if (!isValidScan) {
      console.error(`❌ Scan failed for ${c.ticketNumber} (${c.fullName})`);
      allScanPassed = false;
    } else {
      console.log(`[${c.index}/${candidates.length}] ✅ Verified Scannable Pass: ${c.ticketNumber} • ${c.fullName}`);
    }

    manifest.push({
      index: c.index,
      ticketNumber: c.ticketNumber,
      p2pTicket: c.p2pTicket,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      course: c.course,
      year: c.year,
      passImageUrl: `/generated-passes/passes/${passFilename}`,
      qrImageUrl: `/generated-passes/qrcodes/${qrFilename}`,
      passFilename,
      qrFilename,
      scannable: isValidScan,
      scanUrl,
    });
  }

  // Write manifest file for website
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log('\n===========================================================');
  if (allScanPassed) {
    console.log(`🎉 100% SCAN VERIFICATION SUCCESS: All ${manifest.length} passes scanned and decoded perfectly!`);
  } else {
    console.warn(`⚠️ Some passes failed verification.`);
  }
  console.log(`Passes Directory: ${PASSES_DIR} (1364 x 2048 Ultra-HD)`);
  console.log(`QR Codes Directory: ${QRCODES_DIR} (800 x 800 Ultra-HD)`);
  console.log(`Manifest File: ${MANIFEST_PATH}`);
  console.log('===========================================================');
}

main().catch((err) => {
  console.error('Pass generation failed:', err);
  process.exit(1);
});
