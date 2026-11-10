import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const STATUS_FILE = path.resolve(process.cwd(), 'public/cancellation-status.json');
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

const CANCELLED_PARTICIPANTS = [
  {
    name: 'Manar Ul Haque',
    phone: '9400440315',
    ticket: 'KMCT-WS-0040',
    email: 'manarulhaqe315@gmail.com',
    dept: 'B.Tech',
    year: '1st Year'
  },
  {
    name: 'afra mahak',
    phone: '8156959766',
    ticket: 'KMCT-WS-0048',
    email: 'aframahak@gmail.com',
    dept: 'B.Tech CSE',
    year: '1st Year'
  },
  {
    name: 'Haamid Zihan',
    phone: '8590208185',
    ticket: 'KMCT-WS-0025',
    email: 'zihanhaamid@gmail.com',
    dept: 'B.Tech AI&DS',
    year: '1st Year'
  },
  {
    name: 'Fathimath Sa-ada B A',
    phone: '8089096043',
    ticket: 'KMCT-WS-0021',
    email: 'ranashada098@gmail.com',
    dept: 'B.Tech CSE',
    year: '1st Year'
  },
  {
    name: 'Abdul khader Shuhail P.M',
    phone: '8590334011',
    ticket: 'KMCT-WS-0063',
    email: 'abdulkhadershuhail@gmail.com',
    dept: 'B.Tech CSE-A',
    year: '1st Year'
  },
  {
    name: 'Salman Fariz',
    phone: '9746004808',
    ticket: 'KMCT-WS-0041',
    email: 'salmanfariz4322@gmail.com',
    dept: 'B.Tech CSE-B',
    year: '1st Year'
  }
];

function cleanPhone(raw) {
  const digits = (raw || '').replace(/[^0-9]/g, '');
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.slice(1);
  return digits;
}

function buildCancellationMessage(name, ticketId) {
  return (
    `⚠️ *BOOKING CANCELLATION NOTICE* ⚠️\n` +
    `*FROM PROBLEM TO POSSIBILITY WORKSHOP*\n` +
    `_KMCT College of Engineering for Emerging Technologies and Management, Kasaragod_\n` +
    `_Organized by Institution’s Innovation Council (IIC)_\n\n` +
    `Dear *${name}*,\n\n` +
    `This is an official communication regarding your registration for the hands-on *From Problem to Possibility* workshop scheduled for Wednesday, 11th November 2026.\n\n` +
    `🚫 *Status: Booking Cancelled*\n` +
    `• *Participant:* ${name}\n` +
    `• *Ticket ID:* ${ticketId || 'N/A'}\n` +
    `• *Event:* From Problem to Possibility\n` +
    `• *Venue:* Seminar Hall, KMCT CEETM, Kasaragod\n\n` +
    `Please be informed that your seat/booking for this workshop has been **cancelled**. Any previously issued entry pass or QR code for this ticket is no longer active for event entry.\n\n` +
    `If you have any queries, require assistance, or believe this was done in error, please contact the coordinator directly:\n` +
    `📞 *Mr. Abdul Mujeeb MS:* +91 94474 38228\n` +
    `✉️ *Email:* abdulmujeeb@kmct.edu.in\n\n` +
    `Thank you,\n` +
    `_Institution’s Innovation Council (IIC), KMCT CEETM_`
  );
}

// Generate an offline 1-click HTML fallback
function generateHtmlFallback() {
  const rows = CANCELLED_PARTICIPANTS.map((p, idx) => {
    const phone = cleanPhone(p.phone);
    const msg = buildCancellationMessage(p.name, p.ticket);
    const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
    return `
      <tr style="border-bottom: 1px solid #3d0714;">
        <td style="padding: 12px; font-weight: bold; color: #fda4af; font-family: monospace;">${p.ticket}</td>
        <td style="padding: 12px; font-weight: 600; color: #fff;">${p.name}</td>
        <td style="padding: 12px; font-family: monospace; color: #fed7aa;">+${phone}</td>
        <td style="padding: 12px; color: #fecdd3;">${p.dept} (${p.year})</td>
        <td style="padding: 12px; text-align: center;">
          <a href="${waUrl}" target="_blank" style="display: inline-block; background: #e11d48; color: white; padding: 8px 16px; border-radius: 9999px; text-decoration: none; font-size: 13px; font-weight: bold;">
            📲 Send WhatsApp Notice
          </a>
        </td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Workshop Booking Cancellations - WhatsApp Dispatch</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0205; color: #fdf2f4; margin: 0; padding: 24px; }
        .container { max-width: 1000px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #3b0714 0%, #61091a 50%, #20040b 100%); padding: 24px; border-radius: 16px; border: 1px solid #9f1239; margin-bottom: 24px; }
        h1 { margin: 0 0 8px 0; font-size: 24px; color: #fff; }
        .table-wrap { background: #170308; border-radius: 12px; border: 1px solid #4c0519; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #24050d; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #fda4af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Booking Cancellation Notice Dispatcher</h1>
          <p style="margin: 0; color: #fda4af; font-size: 14px;">Direct 1-Click WhatsApp Cancellation Dispatcher for 6 Target Participants</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Participant</th>
                <th>WhatsApp Phone</th>
                <th>Department</th>
                <th style="text-align: center;">WhatsApp Action</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;
  fs.writeFileSync('public/cancellation-dispatch.html', html, 'utf-8');
}

generateHtmlFallback();

async function main() {
  const args = process.argv.slice(2);
  let trialPhone = '';
  let sendAll = args.includes('--send') || args.includes('--send-all');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--trial' && args[i + 1]) trialPhone = args[i + 1];
  }

  console.log('====================================================');
  console.log('⚠️ AUTOMATED WHATSAPP CANCELLATION DISPATCHER');
  console.log('   KMCT CEETM - Problem to Possibility 2026');
  console.log('====================================================\n');

  if (!trialPhone && !sendAll) {
    console.log('Targets (6 participants):');
    CANCELLED_PARTICIPANTS.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.name} (+91 ${p.phone}) [${p.ticket}]`);
    });
    console.log('\nUsage:');
    console.log('  Send Trial WhatsApp:   node scripts/send-whatsapp-cancellation.mjs --trial 8848563266');
    console.log('  Send to all 6:         node scripts/send-whatsapp-cancellation.mjs --send\n');
    console.log('📄 Offline 1-Click HTML Fallback: public/cancellation-dispatch.html');
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
        <title>WhatsApp Web QR Code - Cancellation Dispatch</title>
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
          <h2>📱 Link WhatsApp for Auto-Dispatch</h2>
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
    console.log('🚀 WhatsApp Client is READY! Starting cancellation dispatch...\n');

    // Trial Mode
    if (trialPhone) {
      const cleanTarget = cleanPhone(trialPhone);
      const chatId = `${cleanTarget}@c.us`;
      const msg = buildCancellationMessage('Organizer Preview', 'KMCT-WS-TRIAL-CANCEL');

      console.log(`Sending TRIAL cancellation message to: +${cleanTarget}...`);
      try {
        await client.sendMessage(chatId, msg);
        console.log(`✅ Trial cancellation message sent successfully to +${cleanTarget}!`);
      } catch (err) {
        console.error('❌ Failed to send trial message:', err.message);
      }

      await new Promise(r => setTimeout(r, 2000));
      await client.destroy();
      clearInterval(keepAlive);
      process.exit(0);
    }

    // Send All 6
    let sentCount = 0;
    let failCount = 0;
    const logData = [];

    for (let i = 0; i < CANCELLED_PARTICIPANTS.length; i++) {
      const p = CANCELLED_PARTICIPANTS[i];
      const phone = cleanPhone(p.phone);
      const chatId = `${phone}@c.us`;
      const msg = buildCancellationMessage(p.name, p.ticket);

      console.log(`[${i + 1}/${CANCELLED_PARTICIPANTS.length}] Sending cancellation notice to ${p.name} (+${phone})...`);

      let sentOk = false;
      let lastErr = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await client.sendMessage(chatId, msg);
          sentOk = true;
          break;
        } catch (err) {
          lastErr = err;
          console.warn(`    ⚠️ Attempt ${attempt} failed (${err.message}). Retrying in 3s...`);
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      if (sentOk) {
        sentCount++;
        console.log(`[${i + 1}/${CANCELLED_PARTICIPANTS.length}] ✅ Successfully sent to ${p.name} (+${phone})`);
        logData.push({ name: p.name, phone, ticket: p.ticket, status: 'DELIVERED', time: new Date().toISOString() });
      } else {
        failCount++;
        console.error(`[${i + 1}/${CANCELLED_PARTICIPANTS.length}] ❌ Failed to send to ${p.name} (+${phone}):`, lastErr?.message);
        logData.push({ name: p.name, phone, ticket: p.ticket, status: 'FAILED', error: lastErr?.message, time: new Date().toISOString() });
      }

      // Safe jittered pacing: 3-5 seconds between messages
      const delay = Math.floor(3000 + Math.random() * 2000);
      await new Promise(r => setTimeout(r, delay));
    }

    fs.writeFileSync(STATUS_FILE, JSON.stringify(logData, null, 2), 'utf-8');

    console.log('\n====================================================');
    console.log('🎉 CANCELLATION DISPATCH FINISHED!');
    console.log(`   Successfully Sent: ${sentCount}/${CANCELLED_PARTICIPANTS.length}`);
    console.log(`   Failed:            ${failCount}`);
    console.log(`   Logged to:         ${STATUS_FILE}`);
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
