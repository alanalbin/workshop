import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PASSES_FILE = path.resolve(process.cwd(), 'public/generated-passes/passes.json');
const PASSES_DIR = path.resolve(process.cwd(), 'public/generated-passes/passes');
const STATUS_FILE = path.resolve(process.cwd(), 'public/generated-passes/whatsapp-dispatch-status.json');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function cleanupStaleChromeProcesses() {
  if (process.platform === 'win32') {
    try {
      execSync('powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name = \'chrome.exe\'\\" | Where-Object { $_.CommandLine -like \'*wwebjs_auth*\' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"', { stdio: 'ignore' });
    } catch (_) {}
  }
}

cleanupStaleChromeProcesses();

function ensureUtilsPatch() {
  const utilsPath = path.resolve(process.cwd(), 'node_modules/whatsapp-web.js/src/util/Injected/Utils.js');
  if (fs.existsSync(utilsPath)) {
    let content = fs.readFileSync(utilsPath, 'utf-8');
    if (!content.includes('delete message.__x_id;')) {
      content = content.replace(
        'if (botOptions) {\n            delete message.canonicalUrl;\n        }',
        'if (botOptions) {\n            delete message.canonicalUrl;\n        }\n\n        delete message.__x_id;\n        message.id = newMsgKey;'
      );
      fs.writeFileSync(utilsPath, content, 'utf-8');
      console.log('✅ Applied WhatsApp Web memoization fix to Utils.js');
    }
  }
}

ensureUtilsPatch();

function cleanPhone(raw) {
  const digits = (raw || '').replace(/[^0-9]/g, '');
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.slice(1);
  return digits;
}

function buildMessage(name, ticketId, course, year) {
  return (
    `🎉 *FROM PROBLEM TO POSSIBILITY - WORKSHOP ENTRY PASS* 🎉\n` +
    `*KMCT College of Engineering for Emerging Technologies & Management, Kasaragod*\n` +
    `_Organized by Institution’s Innovation Council (IIC)_\n\n` +
    `Dear *${name}*,\n\n` +
    `Congratulations! Your seat for the hands-on workshop is confirmed. Here is your official entry boarding pass (attached above)!\n\n` +
    `🎟️ *Ticket ID:* ${ticketId}\n` +
    `🎓 *Department:* ${course} (${year})\n` +
    `📅 *Event Date:* Wednesday, 11th November 2026\n` +
    `⏰ *Reporting Time:* 09:00 AM (Workshop starts at 09:30 AM &ndash; 04:00 PM)\n` +
    `📍 *Venue:* Seminar Hall, KMCT CEETM, Kasaragod\n` +
    `🎙️ *Resource Person:* Mr. Muhammed Shayiz K P\n\n` +
    `📲 *Entry Instructions:*\n` +
    `• Keep this attached image pass ready on your phone at entry.\n` +
    `• Scan the QR code at the check-in desk to record your attendance.\n\n` +
    `See you at the workshop!\n\n` +
    `_For inquiries: Alan Albin (+91 8848563266)_`
  );
}

function loadStatus() {
  if (fs.existsSync(STATUS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
    } catch (_) {}
  }
  return { delivered: {}, failed: {} };
}

function saveStatus(status) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2), 'utf-8');
}

async function main() {
  const keepAlive = setInterval(() => {}, 15000);
  const args = process.argv.slice(2);
  let trialPhone = '';
  let sendAll = args.includes('--send-all');
  let resendFailed = args.includes('--resend-failed');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--trial' && args[i + 1]) trialPhone = args[i + 1];
  }

  console.log('====================================================');
  console.log('📱 FULLY AUTOMATIC WHATSAPP PASS DISPATCHER');
  console.log('   KMCT CEETM - Problem to Possibility 2026');
  console.log('====================================================\n');

  if (!trialPhone && !sendAll && !resendFailed) {
    console.log('Usage:');
    console.log('  Send Trial WhatsApp:   node scripts/send-whatsapp-auto.mjs --trial 9876543210');
    console.log('  Send to ALL 70:        node scripts/send-whatsapp-auto.mjs --send-all');
    console.log('  Resend to Failed Only: node scripts/send-whatsapp-auto.mjs --resend-failed\n');
    process.exit(0);
  }

  if (!fs.existsSync(PASSES_FILE)) {
    console.error('❌ passes.json not found at:', PASSES_FILE);
    process.exit(1);
  }

  const allPasses = JSON.parse(fs.readFileSync(PASSES_FILE, 'utf-8'));
  console.log(`Loaded ${allPasses.length} participant passes from passes.json.`);

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
      executablePath: CHROME_PATH,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check'
      ]
    }
  });

  client.on('qr', async (qr) => {
    console.log('\n📲 QR CODE RECEIVED! Scan to link your WhatsApp:');
    qrcode.generate(qr, { small: true });

    const qrDataUrl = await QRCode.toDataURL(qr, { width: 450, margin: 2 });
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp Web QR Code - Workshop Dispatch</title>
        <meta http-equiv="refresh" content="12">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #0c0205; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: #1a040b; border: 2px solid #881337; padding: 32px; border-radius: 20px; text-align: center; max-width: 500px; box-shadow: 0 12px 48px rgba(0,0,0,0.8); }
          h2 { margin-top: 0; color: #fda4af; font-size: 22px; }
          ol { text-align: left; margin: 20px 0; padding-left: 20px; line-height: 1.8; color: #fecdd3; font-size: 14px; }
          img { border-radius: 12px; background: white; padding: 14px; max-width: 100%; height: auto; box-shadow: 0 6px 20px rgba(0,0,0,0.5); }
          .hint { color: #fda4af; font-size: 12px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>📱 Link WhatsApp for Auto-Dispatch</h2>
          <ol>
            <li>Open <b>WhatsApp</b> on your phone</li>
            <li>Tap <b>Menu (⋮)</b> or <b>Settings</b> &rarr; <b>Linked Devices</b></li>
            <li>Tap <b>Link a Device</b> and point camera here:</li>
          </ol>
          <img src="${qrDataUrl}" alt="WhatsApp QR Code" />
          <p class="hint">⚡ Auto-refreshes every 12 seconds until scanned.</p>
        </div>
      </body>
      </html>
    `;
    fs.writeFileSync('public/whatsapp-qr.html', html, 'utf-8');
    console.log('📄 Web QR preview saved to: public/whatsapp-qr.html');
    console.log('👉 Open in browser: http://localhost:3000/whatsapp-qr.html\n');
  });

  client.on('authenticated', () => {
    console.log('✅ WhatsApp Authenticated successfully!');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp Auth failure:', msg);
  });

  client.on('ready', async () => {
    console.log('🚀 WhatsApp Client is READY! Starting dispatch...\n');

    // 1. Trial Mode
    if (trialPhone) {
      const cleanTarget = cleanPhone(trialPhone);
      const chatId = `${cleanTarget}@c.us`;
      const sample = allPasses[0];
      const imagePath = path.join(PASSES_DIR, sample.passFilename);

      console.log(`Sending TRIAL WhatsApp pass to: +${cleanTarget}...`);

      try {
        const isRegistered = await client.isRegisteredUser(chatId);
        if (!isRegistered) {
          console.error(`❌ Number +${cleanTarget} is NOT registered on WhatsApp.`);
          await client.destroy();
          process.exit(1);
        }

        const media = MessageMedia.fromFilePath(imagePath);
        const msgText = buildMessage('Organizer Test (Trial)', 'KMCT-WS-TRIAL-0001', 'CSE Innovation Lab', '1st Year');

        await client.sendMessage(chatId, media, { caption: msgText });
        console.log(`✅ Trial WhatsApp pass sent successfully to +${cleanTarget}!`);
        console.log(`   Attached: ${sample.passFilename}`);
        console.log('\n🎉 Check your WhatsApp chat now!');
      } catch (err) {
        console.error('❌ Failed to send trial WhatsApp message:', err.message);
      }

      await new Promise(r => setTimeout(r, 2000));
      await client.destroy();
      process.exit(0);
    }

    // 2. Batch Dispatch Mode
    const status = loadStatus();
    let queue = allPasses;

    if (resendFailed) {
      queue = allPasses.filter(p => !status.delivered[p.ticketNumber]);
      console.log(`🎯 RESEND MODE: ${queue.length} passes remaining to send.\n`);
    } else {
      console.log(`🚀 BATCH DISPATCH: Sending to ${queue.length} participants with antiban delay (3-5s)...\n`);
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < queue.length; i++) {
      const p = queue[i];
      const ticketId = p.ticketNumber;

      // Skip already delivered unless forced
      if (!resendFailed && status.delivered[ticketId]) {
        console.log(`[${i + 1}/${queue.length}] ⏩ Skipping ${ticketId} (Already delivered to +${p.phone})`);
        continue;
      }

      const phone = cleanPhone(p.phone);
      if (!phone || phone.length < 10) {
        console.error(`[${i + 1}/${queue.length}] ❌ Invalid phone "${p.phone}" for ${p.fullName} (${ticketId})`);
        status.failed[ticketId] = { error: 'Invalid phone', phone: p.phone, time: new Date().toISOString() };
        saveStatus(status);
        failCount++;
        continue;
      }

      const chatId = `${phone}@c.us`;
      const imagePath = path.join(PASSES_DIR, p.passFilename);

      if (!fs.existsSync(imagePath)) {
        console.error(`[${i + 1}/${queue.length}] ❌ Image file not found: ${imagePath}`);
        status.failed[ticketId] = { error: 'File missing', time: new Date().toISOString() };
        saveStatus(status);
        failCount++;
        continue;
      }

      try {
        let isRegistered = true;
        try {
          isRegistered = await client.isRegisteredUser(chatId);
        } catch (_) {
          // If isRegisteredUser IQ query fails due to socket busy, continue to sendMessage
        }

        if (isRegistered === false) {
          console.warn(`[${i + 1}/${queue.length}] ⚠️ +${phone} (${p.fullName}) is not on WhatsApp!`);
          status.failed[ticketId] = { error: 'Not on WhatsApp', phone, time: new Date().toISOString() };
          saveStatus(status);
          failCount++;
          continue;
        }

        const media = MessageMedia.fromFilePath(imagePath);
        const caption = buildMessage(p.fullName, ticketId, p.course, p.year);

        // Send with up to 3 retries on socket hiccup
        let sentOk = false;
        let lastError = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await client.sendMessage(chatId, media, { caption });
            sentOk = true;
            break;
          } catch (sendErr) {
            lastError = sendErr;
            console.warn(`    ⚠️ Send attempt ${attempt} failed (${sendErr.message}). Waiting 4s before retry...`);
            await new Promise(r => setTimeout(r, 4000));
          }
        }

        if (!sentOk) throw lastError;

        successCount++;
        status.delivered[ticketId] = { phone, name: p.fullName, time: new Date().toISOString() };
        delete status.failed[ticketId];
        saveStatus(status);

        console.log(`[${i + 1}/${queue.length}] ✅ Sent ${ticketId} to +${phone} (${p.fullName})`);

        // Antiban pacing: 3.5s to 5.5s jittered delay between sends
        const delay = Math.floor(3500 + Math.random() * 2000);
        await new Promise(r => setTimeout(r, delay));
      } catch (err) {
        failCount++;
        console.error(`[${i + 1}/${queue.length}] ❌ Failed ${ticketId} to +${phone}:`, err.message);
        status.failed[ticketId] = { error: err.message, phone, time: new Date().toISOString() };
        saveStatus(status);
        // Cool down 5s if an error occurs
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    console.log('\n====================================================');
    console.log('🎉 WHATSAPP DISPATCH COMPLETED!');
    console.log(`   Successfully Delivered: ${successCount}`);
    console.log(`   Failed / Skipped:       ${failCount}`);
    console.log(`   Logged to:              ${STATUS_FILE}`);
    console.log('====================================================\n');

    await new Promise(r => setTimeout(r, 3000));
    await client.destroy();
    clearInterval(keepAlive);
    process.exit(0);
  });

  client.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp Web disconnected:', reason);
    clearInterval(keepAlive);
  });

  console.log('Initializing browser and connecting to WhatsApp Web...');
  await client.initialize();
}

main().catch(err => {
  console.error('Fatal dispatch error:', err);
  process.exit(1);
});

