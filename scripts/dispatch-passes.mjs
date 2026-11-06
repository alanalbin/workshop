import fs from 'fs';
import path from 'path';

const PASSES_FILE = path.resolve(process.cwd(), 'public/generated-passes/passes.json');
const BASE_URL = 'https://workshop-khaki-zeta.vercel.app';
const WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbx2l5e8mo6ul32UJXW6ZUGpoKILI964H5jpb2OY_eTSjPUPjfPArCP32-QJJB3wmVKqzQ/exec';

function buildWhatsAppMessage(name, ticketId, passUrl) {
  return (
    `🎉 *FROM PROBLEM TO POSSIBILITY - ENTRY PASS CONFIRMED!* 🎉\n` +
    `KMCT College of Engineering for Emerging Technologies and Management, Kasaragod\n\n` +
    `Dear *${name}*,\n\n` +
    `Your registration and payment have been verified. Here is your official workshop entry pass!\n\n` +
    `🎟️ *Ticket ID:* ${ticketId}\n` +
    `📅 *Date:* Wednesday, 11th November 2026\n` +
    `⏰ *Reporting Time:* 09:00 AM (Workshop starts at 09:30 AM)\n` +
    `📍 *Venue:* Seminar Hall, KMCT CEETM, Kasaragod\n` +
    `🎙️ *Resource Person:* Mr. Muhammed Shayiz K P\n\n` +
    `🔗 *Download / View Your Official Pass:*\n` +
    `${passUrl}\n\n` +
    `📲 *Entry Instructions:*\n` +
    `• Keep this pass or your Ticket ID ready at the entrance.\n` +
    `• Scan the QR code at the check-in desk to record your attendance.\n` +
    `• Chart paper, sketch pens, and problem worksheets will be provided.\n\n` +
    `See you at the workshop!\n\n` +
    `_Institution’s Innovation Council (IIC), KMCT CEETM_`
  );
}

function cleanPhone(phone) {
  const digits = (phone || '').replace(/[^0-9]/g, '');
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

async function run() {
  const args = process.argv.slice(2);
  let isTest = args.includes('--test');
  let testEmail = '';
  let testPhone = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) testEmail = args[i + 1];
    if (args[i] === '--phone' && args[i + 1]) testPhone = args[i + 1];
  }

  const passes = JSON.parse(fs.readFileSync(PASSES_FILE, 'utf-8'));

  // Test mode
  if (isTest || testEmail || testPhone) {
    const candidateName = 'Organizer Test Preview';
    const ticketId = 'KMCT-WS-TEST-0001';
    const samplePass = passes[0];
    const passUrl = `${BASE_URL}${samplePass.passImageUrl}`;
    const formattedPhone = cleanPhone(testPhone || '9876543210');
    const waText = buildWhatsAppMessage(candidateName, ticketId, passUrl);
    const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(waText)}`;

    console.log('====================================================');
    console.log('🧪 WORKSHOP PASS DISPATCH - TEST PREVIEW');
    console.log('====================================================');
    console.log(`Ticket ID:    ${ticketId}`);
    console.log(`Participant:  ${candidateName}`);
    console.log(`Pass URL:     ${passUrl}`);
    if (testEmail) console.log(`Test Email:   ${testEmail}`);
    if (testPhone) console.log(`Test Phone:   ${formattedPhone} (Cleaned: +${formattedPhone})`);
    console.log('----------------------------------------------------');
    console.log('📱 WhatsApp Click-to-Send URL:');
    console.log(waUrl);
    console.log('----------------------------------------------------');
    console.log('💬 WhatsApp Message Body:');
    console.log(waText);
    console.log('====================================================');

    // Generate HTML preview for testing
    const previewHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Workshop Pass Test Dispatch</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #0c0205; color: #fff; padding: 24px; }
          .card { max-width: 600px; margin: 0 auto; background: #1a040b; border: 1px solid #881337; border-radius: 16px; padding: 28px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
          .btn-wa { display: block; text-align: center; background: #25D366; color: white; padding: 14px 24px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 20px 0; }
          .btn-wa:hover { background: #1ebe5d; }
          pre { background: #090103; padding: 14px; border-radius: 8px; border: 1px solid #4c0519; color: #fecdd3; white-space: pre-wrap; font-size: 13px; }
          img { max-width: 100%; border-radius: 12px; border: 2px solid #be123c; margin: 16px 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="color: #fda4af; margin-top: 0;">🧪 Workshop Pass Test Preview</h2>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>Test Email:</strong> ${testEmail || 'Not specified'}</p>
          <p><strong>Test WhatsApp Phone:</strong> +${formattedPhone}</p>
          
          <a class="btn-wa" href="${waUrl}" target="_blank">
            📲 Open in WhatsApp &amp; Send Test Pass
          </a>

          <h3 style="color: #fda4af; font-size: 15px;">Generated Pass Preview:</h3>
          <img src="${samplePass.passImageUrl}" alt="Test Pass">

          <h3 style="color: #fda4af; font-size: 15px;">WhatsApp Message Preview:</h3>
          <pre>${waText}</pre>
        </div>
      </body>
      </html>
    `;
    fs.writeFileSync(path.resolve(process.cwd(), 'public/test-dispatch-preview.html'), previewHtml, 'utf-8');
    console.log('📄 Saved visual test runner at: public/test-dispatch-preview.html');

    // Trigger webhook test email if testEmail was provided
    if (testEmail) {
      console.log(`\n⏳ Attempting to dispatch test email to ${testEmail} via Google Apps Script Webhook...`);
      try {
        const resp = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send_test',
            testEmail,
            testPhone: formattedPhone
          })
        });
        const json = await resp.json();
        console.log('✅ Webhook Response:', json);
      } catch (err) {
        console.log('ℹ️ Webhook dispatch note:', err.message);
        console.log('To send via Google Apps Script directly, use the "🎟️ Workshop Passes" menu in Google Sheets.');
      }
    }

    return;
  }

  // Dashboard generation for all 70 participants
  console.log(`Generating 1-click WhatsApp Dispatcher Dashboard for ${passes.length} participants...`);
  const rowsHtml = passes.map((p, idx) => {
    const phone = cleanPhone(p.phone);
    const passUrl = `${BASE_URL}${p.passImageUrl}`;
    const waMsg = buildWhatsAppMessage(p.fullName, p.ticketNumber, passUrl);
    const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(waMsg)}`;
    return `
      <tr style="border-bottom: 1px solid #3d0714;">
        <td style="padding: 12px; font-weight: bold; color: #fda4af; font-family: monospace;">${p.ticketNumber}</td>
        <td style="padding: 12px; font-weight: 600; color: #fff;">${p.fullName}</td>
        <td style="padding: 12px; color: #fecdd3;">${p.email}</td>
        <td style="padding: 12px; font-family: monospace; color: #fed7aa;">+${phone}</td>
        <td style="padding: 12px; color: #cbd5e1; font-size: 12px;">${p.course}</td>
        <td style="padding: 12px; text-align: center;">
          <a href="${waUrl}" target="_blank" style="display: inline-block; background: #25D366; color: white; padding: 6px 14px; border-radius: 9999px; text-decoration: none; font-size: 12px; font-weight: bold;">
            📲 Send WhatsApp
          </a>
        </td>
        <td style="padding: 12px; text-align: center;">
          <a href="${p.passImageUrl}" target="_blank" style="color: #f43f5e; font-size: 12px; text-decoration: none; font-weight: 600;">
            View Pass &rarr;
          </a>
        </td>
      </tr>
    `;
  }).join('');

  const dashboardHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Workshop Passes - 1-Click WhatsApp & Email Dispatcher</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0205; color: #fdf2f4; margin: 0; padding: 24px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #2b050d 0%, #4a0917 50%, #1f0208 100%); padding: 24px; border-radius: 16px; border: 1px solid #881337; margin-bottom: 24px; }
        h1 { margin: 0 0 6px 0; font-size: 24px; color: #fff; }
        .table-wrap { background: #170308; border-radius: 12px; border: 1px solid #4c0519; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #24050d; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #fda4af; }
        .search-box { width: 100%; max-width: 400px; padding: 10px 14px; border-radius: 8px; border: 1px solid #881337; background: #1f040c; color: white; margin-bottom: 16px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎟️ From Problem to Possibility - Pass Dispatch Hub</h1>
          <p style="margin: 0; color: #fda4af; font-size: 14px;">Instant 1-Click WhatsApp &amp; Email Dispatcher for all 70 Confirmed Participants</p>
        </div>

        <input type="text" id="filter" class="search-box" placeholder="🔍 Search by name, ticket ID, phone, or department..." onkeyup="filterTable()" />

        <div class="table-wrap">
          <table id="passTable">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Participant</th>
                <th>Email Address</th>
                <th>WhatsApp Phone</th>
                <th>Department</th>
                <th style="text-align: center;">WhatsApp Action</th>
                <th style="text-align: center;">HD Pass</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <script>
        function filterTable() {
          const q = document.getElementById('filter').value.toLowerCase();
          const rows = document.querySelectorAll('#passTable tbody tr');
          rows.forEach(r => {
            const text = r.textContent.toLowerCase();
            r.style.display = text.includes(q) ? '' : 'none';
          });
        }
      </script>
    </body>
    </html>
  `;

  fs.writeFileSync(path.resolve(process.cwd(), 'public/whatsapp-dispatch.html'), dashboardHtml, 'utf-8');
  console.log('✅ Generated public/whatsapp-dispatch.html with 1-click WhatsApp buttons for all 70 students.');
}

run();

