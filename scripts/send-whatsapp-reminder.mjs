import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PASSES_FILE = path.resolve(process.cwd(), 'public/generated-passes/passes.json');
const STATUS_FILE = path.resolve(process.cwd(), 'public/generated-passes/reminder-dispatch-status.json');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function cleanupStaleChromeProcesses() {
  if (process.platform === 'win32') {
    try {
      execSync(
        'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name = \'chrome.exe\'\\" | Where-Object { $_.CommandLine -like \'*wwebjs_auth*\' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"',
        { stdio: 'ignore' }
      );
    } catch (_) {}
  }
}

cleanupStaleChromeProcesses();

function cleanPhone(raw) {
  const digits = (raw || '').replace(/[^0-9]/g, '');
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.slice(1);
  return digits;
}

function buildReminderMessage(name, ticketId) {
  return (
    `🚨 *REMINDER: WORKSHOP TOMORROW!* 🚨\n` +
    `*FROM PROBLEM TO POSSIBILITY*\n` +
    `_Turn Real-World Challenges into Pitch-Ready Innovations!_\n` +
    `*KMCT College of Engineering for Emerging Technologies & Management, Kasaragod*\n\n` +
    `Dear *${name}*,\n\n` +
    `This is an official reminder that your hands-on innovation workshop **From Problem to Possibility** is happening **tomorrow, Wednesday, 11th November 2026**!\n\n` +
    `🎟️ *Your Ticket ID:* ${ticketId}\n` +
    `📅 *Date:* Tomorrow, Wednesday, 11th November 2026\n` +
    `⏰ *Reporting Time:* 09:00 AM sharp (Session: 09:30 AM – 04:00 PM)\n` +
    `📍 *Venue:* Seminar Hall, KMCT CEETM, Kasaragod\n` +
    `🎙️ *Resource Person:* Mr. Muhammed Shayiz K P\n` +
    `_(Senior Software Engineer, Doodleblue Innovations & Co-founder, Shine Technologies)_\n\n` +
    `📲 *Check-In & Entry Checklist:*\n` +
    `1. Keep your digital entry pass or Ticket ID ready on your phone at entry.\n` +
    `2. Please report by *09:00 AM* to complete registration & attendance verification.\n` +
    `3. Problem worksheets, chart materials, and lunch/refreshments will be provided.\n` +
    `4. Laptops / notebooks are optional but welcome for team ideation.\n\n` +
    `See you tomorrow morning! 🚀\n\n` +
    `📞 *Helpdesk / Queries:*\n` +
    `Alan Albin: +91 8848563266\n` +
    `_Institution’s Innovation Council (IIC), KMCT CEETM_`
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
  const args = process.argv.slice(2);
  let trialPhone = '';
  let sendAll = args.includes('--send') || args.includes('--send-all');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--trial' && args[i + 1]) trialPhone = args[i + 1];
  }

  console.log('====================================================');
  console.log('🔔 WHATSAPP EVENT REMINDER DISPATCHER (TOMORROW)');
  console.log('   KMCT CEETM - Problem to Possibility 2026');
  console.log('====================================================\n');

  if (!fs.existsSync(PASSES_FILE)) {
    console.error('❌ passes.json not found at:', PASSES_FILE);
    process.exit(1);
  }

  const allPasses = JSON.parse(fs.readFileSync(PASSES_FILE, 'utf-8'));
  const activeParticipants = allPasses;

  console.log(`Loaded ${allPasses.length} total participants.`);
  console.log(`Active participants to notify: ${activeParticipants.length}\n`);

  if (!trialPhone && !sendAll) {
    console.log('Usage:');
    console.log('  Send Trial Reminder: node scripts/send-whatsapp-reminder.mjs --trial 8848563266');
    console.log(`  Send to All (${activeParticipants.length}): node scripts/send-whatsapp-reminder.mjs --send\n`);
    process.exit(0);
  }

  const keepAlive = setInterval(() => {}, 15000);

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
        <title>WhatsApp Web QR Code - Reminder Dispatch</title>
        <meta http-equiv="refresh" content="12">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #0c0205; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: #1a040b; border: 2px solid #881337; padding: 32px; border-radius: 20px; text-align: center; max-width: 500px; box-shadow: 0 12px 48px rgba(0,0,0,0.8); }
          h2 { margin-top: 0; color: #fda4af; font-size: 22px; }
          ol { text-align: left; margin: 20px 0; padding-left: 20px; line-height: 1.8; color: #fecdd3; font-size: 14px; }
          img { border-radius: 12px; background: white; padding: 14px; max-width: 100%; height: auto; box-shadow: 0 6px 20px rgba(0,0,0,0.5); }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>📱 Link WhatsApp for Reminder Dispatch</h2>
          <ol>
            <li>Open <b>WhatsApp</b> on your phone</li>
            <li>Tap <b>Menu (⋮)</b> or <b>Settings</b> &rarr; <b>Linked Devices</b></li>
            <li>Tap <b>Link a Device</b> and point camera here:</li>
          </ol>
          <img src="${qrDataUrl}" alt="WhatsApp QR Code" />
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

  client.on('ready', async () => {
    console.log('🚀 WhatsApp Client is READY! Starting reminder dispatch...\n');

    // Trial Mode
    if (trialPhone) {
      const cleanTarget = cleanPhone(trialPhone);
      const chatId = `${cleanTarget}@c.us`;
      const msg = buildReminderMessage('Organizer Preview', 'KMCT-WS-TRIAL-0001');

      console.log(`Sending TRIAL reminder message to: +${cleanTarget}...`);
      try {
        await client.sendMessage(chatId, msg);
        console.log(`✅ Trial reminder sent successfully to +${cleanTarget}!`);
      } catch (err) {
        console.error('❌ Failed to send trial message:', err.message);
      }

      await new Promise(r => setTimeout(r, 2000));
      await client.destroy();
      clearInterval(keepAlive);
      process.exit(0);
    }

    // Batch Dispatch Mode
    const status = loadStatus();
    let sentCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < activeParticipants.length; i++) {
      const p = activeParticipants[i];
      const ticketId = p.ticketNumber;

      // Skip already delivered
      if (status.delivered[ticketId]) {
        skippedCount++;
        console.log(`[${i + 1}/${activeParticipants.length}] ⏩ Skipping ${ticketId} (${p.fullName} - Already delivered)`);
        continue;
      }

      const phone = cleanPhone(p.phone);
      if (!phone || phone.length < 10) {
        console.error(`[${i + 1}/${activeParticipants.length}] ❌ Invalid phone "${p.phone}" for ${p.fullName} (${ticketId})`);
        status.failed[ticketId] = { error: 'Invalid phone', phone: p.phone, time: new Date().toISOString() };
        saveStatus(status);
        failCount++;
        continue;
      }

      const chatId = `${phone}@c.us`;
      const msg = buildReminderMessage(p.fullName, ticketId);

      console.log(`[${i + 1}/${activeParticipants.length}] Sending reminder to ${p.fullName} (+${phone})...`);

      let sentOk = false;
      let lastErr = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await client.sendMessage(chatId, msg);
          sentOk = true;
          break;
        } catch (err) {
          lastErr = err;
          console.warn(`    ⚠️ Attempt ${attempt} failed (${err.message}). Retrying in 3.5s...`);
          await new Promise(r => setTimeout(r, 3500));
        }
      }

      if (sentOk) {
        sentCount++;
        console.log(`[${i + 1}/${activeParticipants.length}] ✅ Successfully sent to ${p.fullName} (+${phone}) [${ticketId}]`);
        status.delivered[ticketId] = { name: p.fullName, phone, time: new Date().toISOString() };
        delete status.failed[ticketId];
        saveStatus(status);
      } else {
        failCount++;
        console.error(`[${i + 1}/${activeParticipants.length}] ❌ Failed to send to ${p.fullName} (+${phone}):`, lastErr?.message);
        status.failed[ticketId] = { name: p.fullName, phone, error: lastErr?.message, time: new Date().toISOString() };
        saveStatus(status);
      }

      // Safe pacing: 2.5s to 4.5s jittered delay between sends
      const delay = Math.floor(2500 + Math.random() * 2000);
      await new Promise(r => setTimeout(r, delay));
    }

    console.log('\n====================================================');
    console.log('🎉 TOMORROW REMINDER DISPATCH COMPLETED!');
    console.log(`   Successfully Delivered: ${sentCount}`);
    console.log(`   Skipped (Already Sent): ${skippedCount}`);
    console.log(`   Failed:                 ${failCount}`);
    console.log(`   Logged to:              ${STATUS_FILE}`);
    console.log('====================================================\n');

    await new Promise(r => setTimeout(r, 2000));
    await client.destroy();
    clearInterval(keepAlive);
    process.exit(0);
  });

  console.log('Initializing browser and connecting to WhatsApp Web...');
  await client.initialize();
}

main().catch(err => {
  console.error('Fatal dispatch error:', err);
  process.exit(1);
});

