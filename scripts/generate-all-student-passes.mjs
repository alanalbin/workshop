import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import QRCode from 'qrcode';

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
  console.log('🎫 GENERATING OFFICIAL PASSES & QR CODES FOR ALL CANDIDATES');
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

  const manifest = [];

  for (const c of candidates) {
    const safeName = sanitizeFilename(c.fullName);
    const passFilename = `${c.ticketNumber}_${safeName}.png`;
    const qrFilename = `${c.ticketNumber}_QR_${safeName}.png`;

    const passFilePath = path.join(PASSES_DIR, passFilename);
    const qrFilePath = path.join(QRCODES_DIR, qrFilename);

    console.log(`[${c.index}/${candidates.length}] Generating pass for: ${c.fullName} (${c.ticketNumber})...`);

    // 1. Generate Separate QR Code
    // The QR contains complete ticket verification data and web verification URL
    const qrData = JSON.stringify({
      event: 'From Problem to Possibility 2026',
      host: 'KMCTCEEM Kasaragod',
      ticketNumber: c.ticketNumber,
      ticketId: c.p2pTicket,
      name: c.fullName,
      dept: c.course,
      year: c.year,
      phone: c.phone,
      email: c.email,
      paymentId: c.utr,
      verified: true,
      verificationUrl: `https://from-problem-to-possibility.vercel.app/success?registrationId=${encodeURIComponent(c.p2pTicket)}`,
    });

    const qrBuffer = await QRCode.toBuffer(qrData, {
      width: 320,
      margin: 1,
      color: {
        dark: '#1e0508',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    // Write separate standalone QR code image
    fs.writeFileSync(qrFilePath, qrBuffer);

    // Resize QR buffer to 142x142 for the pass template
    const resizedQr = await sharp(qrBuffer).resize(142, 142).toBuffer();

    // 2. Prepare SVG overlay with Ticket ID and Candidate Info
    const displayShortP2p = c.p2pTicket.startsWith('P2P-KMCT-')
      ? c.p2pTicket.split('-').slice(2).join('-')
      : c.p2pTicket;

    const svgOverlay = `
      <svg width="682" height="1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&amp;display=swap');
            .ticket-title {
              font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
              font-size: 15px;
              font-weight: 900;
              fill: #3b0712;
              letter-spacing: 0.5px;
            }
            .candidate-sub {
              font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
              font-size: 11px;
              font-weight: 700;
              fill: #5c141e;
            }
          </style>
        </defs>

        <!-- Clean capsule cover with rounded corners -->
        <rect x="276" y="622" width="318" height="42" rx="21" fill="#FAF5EE" />

        <!-- Ticket Number & Hash -->
        <text x="296" y="642" class="ticket-title">${escapeXml(c.ticketNumber)} • ${escapeXml(displayShortP2p)}</text>
        <!-- Participant Name & Dept -->
        <text x="296" y="656" class="candidate-sub">${escapeXml(c.fullName)} (${escapeXml(c.course)})</text>
      </svg>
    `;

    // 3. Composite onto the Official Pass Template
    const passBuffer = await sharp('public/pass-template.jpg')
      .composite([
        {
          input: resizedQr,
          left: 270,
          top: 673,
        },
        {
          input: Buffer.from(svgOverlay),
          left: 0,
          top: 0,
        },
      ])
      .png({ quality: 95 })
      .toBuffer();

    fs.writeFileSync(passFilePath, passBuffer);

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
    });
  }

  // Write manifest file for the website and passesqr page
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log('\n===========================================================');
  console.log(`🎉 SUCCESS: Generated ${manifest.length} Official Passes and ${manifest.length} QR Codes!`);
  console.log(`Passes Directory: ${PASSES_DIR}`);
  console.log(`QR Codes Directory: ${QRCODES_DIR}`);
  console.log(`Manifest File: ${MANIFEST_PATH}`);
  console.log('===========================================================');
}

main().catch((err) => {
  console.error('Pass generation failed:', err);
  process.exit(1);
});
