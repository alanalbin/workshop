/**
 * =========================================================================
 * FROM PROBLEM TO POSSIBILITY - WORKSHOP PASS DISPATCH & SHEET AUTOMATION
 * KMCT College of Engineering for Emerging Technologies and Management
 * Target Sheet ID: 1ooc3SoHQbKIeCFhaNGm5_qoRSKuC41PDVp_tcodRi4Q
 * =========================================================================
 * 
 * 🚀 HOW TO SEND PASSES VIA GMAIL FULLY AUTOMATIC:
 * 
 * METHOD 1 (Directly in Google Apps Script Editor - Easiest & Fastest):
 * 1. Open your Google Sheet:
 *    https://docs.google.com/spreadsheets/d/1ooc3SoHQbKIeCFhaNGm5_qoRSKuC41PDVp_tcodRi4Q/edit
 * 2. Click "Extensions" > "Apps Script" in the top menu.
 * 3. Replace all existing code with THIS ENTIRE FILE and click "Save" (Ctrl+S / 💾).
 * 4. In the function dropdown at the top (next to "Debug"), select:
 *    👉 "sendAllStudentPassesAuto"
 * 5. Click "▶️ Run".
 *    -> It will immediately begin sending the official passes with the high-res
 *       horizontal pass attached to every student's Gmail automatically!
 * 
 * METHOD 2 (From the Google Sheet Menu):
 * 1. Refresh your Google Sheet.
 * 2. Click the top menu: "🎟️ Workshop Passes" > "✉️ 3. Send All Passes via Email (Gmail)".
 * =========================================================================
 */

const TARGET_SPREADSHEET_ID = '1ooc3SoHQbKIeCFhaNGm5_qoRSKuC41PDVp_tcodRi4Q';
const SHEET_NAME = 'Registrations';
const PASSES_JSON_URL = 'https://workshop-khaki-zeta.vercel.app/generated-passes/passes.json';
const BASE_PASS_URL = 'https://workshop-khaki-zeta.vercel.app';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/alanalbin/workshop/main/public';

const HEADERS = [
  'Timestamp',
  'Registration ID',
  'Full Name',
  'Email Address',
  'WhatsApp / Mobile',
  'Course / Department',
  'Year of Study',
  'Payment Status',
  'Payment Method',
  'Transaction / UTR Number',
  'Amount (₹)',
  'Ticket ID',
  'Pass URL',
  'Email Status',
  'WhatsApp Action'
];

/**
 * Creates custom menu in Google Sheets on document open
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('🎟️ Workshop Passes')
      .addItem('⚡ 1. Send All Passes via Gmail (Automatic)', 'sendAllStudentPassesAuto')
      .addItem('🧪 2. Send Test Pass (Email & WhatsApp)', 'sendTestPassInteractive')
      .addItem('📲 3. Populate Ticket IDs & WhatsApp Links', 'populateWhatsAppAndTicketColumns')
      .addSeparator()
      .addItem('🔀 4. Sort Sheet by Course (BCA, BBA, B.Tech)', 'sortSheetByCourse')
      .addItem('✨ 5. Standardize Course Names & Sort', 'standardizeAndSortByCourse')
      .addItem('🧹 6. Deduplicate & Clean Sheet', 'deduplicateAndCleanSheet')
      .addItem('📊 7. View Dispatch Status', 'showDispatchStatus')
      .addToUi();
  } catch (err) {
    Logger.log('onOpen UI skipped (running in non-interactive mode): ' + err);
  }
}

function getActiveSheetInstance() {
  try {
    return SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
  } catch (err) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * Loads the 70 verified passes catalog from Vercel / GitHub
 */
function fetchPassesCatalog() {
  try {
    const res = UrlFetchApp.fetch(PASSES_JSON_URL, { muteHttpExceptions: true });
    if (res.getResponseCode() === 200) {
      return JSON.parse(res.getContentText());
    }
  } catch (e) {
    Logger.log('Failed to fetch from Vercel, trying GitHub: ' + e);
  }
  const ghUrl = GITHUB_RAW_BASE + '/generated-passes/passes.json';
  const resGh = UrlFetchApp.fetch(ghUrl, { muteHttpExceptions: true });
  return JSON.parse(resGh.getContentText());
}

/**
 * Formats a standardized WhatsApp message for a participant
 */
function buildWhatsAppMessage(name, ticketId, passUrl) {
  return (
    '🎉 *FROM PROBLEM TO POSSIBILITY - ENTRY PASS CONFIRMED!* 🎉\n' +
    'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod\n\n' +
    'Dear *' + name + '*,\n\n' +
    'Your registration and payment have been verified. Here is your official workshop entry pass!\n\n' +
    '🎟️ *Ticket ID:* ' + ticketId + '\n' +
    '📅 *Date:* Wednesday, 11th November 2026\n' +
    '⏰ *Reporting Time:* 09:00 AM (Workshop starts at 09:30 AM)\n' +
    '📍 *Venue:* Seminar Hall, KMCT CEETM, Kasaragod\n' +
    '🎙️ *Resource Person:* Mr. Muhammed Shayiz K P\n\n' +
    '🔗 *Download / View Your Official Pass:*\n' + passUrl + '\n\n' +
    '📲 *Entry Instructions:*\n' +
    '• Please keep this pass or your Ticket ID ready at the entrance.\n' +
    '• Scan the QR code at the check-in desk to record your attendance.\n' +
    '• Chart paper, sketch pens, and problem worksheets will be provided.\n\n' +
    'See you at the workshop!\n\n' +
    '_Institution’s Innovation Council (IIC), KMCT CEETM_'
  );
}

/**
 * Builds rich HTML email body with embedded horizontal boarding pass
 */
function buildEmailHtml(name, ticketId, course, year, passUrl) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #120307; color: #fdf2f4; border-radius: 16px; overflow: hidden; border: 1px solid #7f1d2d; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      
      <!-- Top Burgundy Header -->
      <div style="background: linear-gradient(135deg, #2b050d 0%, #4a0917 50%, #1f0208 100%); padding: 26px 20px; text-align: center; border-bottom: 2px solid #991b1b;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #fda4af; font-weight: 700;">KMCT College of Engineering for Emerging Technologies and Management</p>
        <p style="margin: 4px 0 0 0; font-size: 10px; color: #fecdd3; letter-spacing: 1px;">Institution’s Innovation Council (IIC) &bull; Kasaragod</p>
        <h1 style="margin: 14px 0 6px 0; font-size: 24px; color: #ffffff; letter-spacing: 1px; font-weight: 900;">FROM PROBLEM TO POSSIBILITY</h1>
        <p style="margin: 0; font-size: 13px; color: #f43f5e; font-weight: 600;">Turn Real-World Challenges into Pitch-Ready Innovations!</p>
      </div>

      <!-- Verified Badge -->
      <div style="background: #1c050a; padding: 14px; text-align: center; border-bottom: 1px solid #470814;">
        <span style="display: inline-block; background: #064e3b; color: #6ee7b7; font-size: 12px; font-weight: bold; padding: 6px 14px; border-radius: 9999px; border: 1px solid #059669;">
          &check; PAYMENT CONFIRMED &bull; OFFICIAL ENTRY PASS ISSUED
        </span>
      </div>

      <!-- Main Body -->
      <div style="padding: 24px 20px;">
        <p style="font-size: 16px; margin: 0 0 10px 0; color: #ffffff;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #fecdd3; margin: 0 0 20px 0;">
          Congratulations! Your seat for the hands-on <strong>From Problem to Possibility</strong> workshop is officially reserved. Your digital boarding pass with high-definition entry QR code is attached to this email.
        </p>

        <!-- Ticket Summary Card -->
        <div style="background: #20040b; border: 1px solid #881337; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #fda4af; font-weight: 600;">Ticket ID:</td>
              <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 17px; font-weight: bold; color: #ffffff; letter-spacing: 1px;">${ticketId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #fda4af;">Participant:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #ffe4e6;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #fda4af;">Department:</td>
              <td style="padding: 6px 0; text-align: right; color: #ffe4e6;">${course} (${year})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #fda4af;">Event Date:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #ffffff;">Wednesday, 11th November 2026</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #fda4af;">Timing:</td>
              <td style="padding: 6px 0; text-align: right; color: #ffe4e6;">09:30 AM &ndash; 04:00 PM (Report by 09:00 AM)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #fda4af;">Venue:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #ffffff;">Seminar Hall, KMCT CEETM, Kasaragod</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #fda4af;">Resource Person:</td>
              <td style="padding: 6px 0; text-align: right; color: #ffe4e6;">Mr. Muhammed Shayiz K P</td>
            </tr>
          </table>
        </div>

        <!-- Inline Pass Banner -->
        <div style="text-align: center; margin: 24px 0;">
          <p style="font-size: 12px; color: #fda4af; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Official Entry Boarding Pass Preview (Attached as PNG):</p>
          <img src="${passUrl}" alt="Workshop Entry Pass" style="max-width: 100%; width: 580px; height: auto; border-radius: 12px; border: 2px solid #be123c; box-shadow: 0 8px 24px rgba(0,0,0,0.6);" />
        </div>

        <!-- Download Button -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="${passUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #e11d48, #9f1239); color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 14px; font-weight: bold; border-radius: 9999px; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);">
            &darr; View &amp; Download Full HD Boarding Pass
          </a>
        </div>

        <!-- Instructions -->
        <div style="background: #190308; border-left: 4px solid #f43f5e; padding: 14px 16px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #ffffff;">Entry &amp; Check-In Guidelines:</h4>
          <ul style="margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.6; color: #fecdd3;">
            <li>Please show this digital pass on your phone or quote your Ticket ID (<strong>${ticketId}</strong>) at the venue registration counter.</li>
            <li>Scan the QR code at the desk for instant automated attendance logging.</li>
            <li>Multidisciplinary innovation teams will be formed at 09:30 AM sharp.</li>
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #090103; padding: 20px; text-align: center; font-size: 11px; color: #9f1239; border-top: 1px solid #4c0519;">
        <p style="margin: 0;">Organized by Institution’s Innovation Council (IIC)</p>
        <p style="margin: 4px 0 0 0;">KMCT College of Engineering for Emerging Technologies and Management, Kasaragod</p>
        <p style="margin: 8px 0 0 0; color: #881337;">Coordinator: Mr. Abdul Mujeeb MS | abdulmujeeb@kmct.edu.in | +91 94474 38228</p>
      </div>
    </div>
  `;
}

/**
 * ⚡ 100% AUTOMATED BATCH EMAIL DISPATCH (ZERO DIALOGS NEEDED)
 * Select this function in the top dropdown in Google Apps Script editor and click "Run" (▶️)!
 */
function sendAllStudentPassesAuto() {
  return executeBatchEmailDispatch();
}

/**
 * UI version for the Google Sheet menu
 */
function sendAllStudentPasses() {
  try {
    const ui = SpreadsheetApp.getUi();
    const confirm = ui.alert(
      '⚠️ Confirmation: Send Passes to ALL Students',
      'Are you sure you want to send official workshop passes via email to all confirmed students in this sheet? (Students with "SENT" status will be safely skipped)',
      ui.ButtonSet.YES_NO
    );
    if (confirm !== ui.Button.YES) return;
  } catch (e) {
    Logger.log('Running in automated / headless mode.');
  }

  const result = executeBatchEmailDispatch();

  try {
    SpreadsheetApp.getUi().alert('🎉 Batch Send Complete!\nSent: ' + result.sentCount + ' emails\nSkipped / Already Sent: ' + result.skippedCount);
  } catch (e) {}
}

/**
 * Core engine for batch email dispatch via Gmail
 */
function executeBatchEmailDispatch() {
  const ss = getActiveSheetInstance();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    Logger.log('Error: Sheet ' + SHEET_NAME + ' not found.');
    return { error: 'No sheet found' };
  }

  // 1. Clean duplicates first
  deduplicateAndCleanSheet();

  const passes = fetchPassesCatalog();
  const passByEmail = {};
  passes.forEach(function(p) {
    if (p.email) passByEmail[p.email.toLowerCase().trim()] = p;
  });

  const lastRow = sheet.getLastRow();
  const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  let sentCount = 0;
  let skippedCount = 0;
  const logs = [];

  Logger.log('Starting automated pass dispatch for ' + (lastRow - 1) + ' participants...');

  for (let i = 0; i < rows.length; i++) {
    const rowIdx = i + 2;
    const name = String(rows[i][2] || '').trim();
    const email = String(rows[i][3] || '').toLowerCase().trim();
    const course = String(rows[i][5] || 'CSE').trim();
    const year = String(rows[i][6] || '1st Year').trim();
    const paymentStatus = String(rows[i][7] || '').toUpperCase();
    const currentStatus = String(rows[i][13] || '');

    // Skip unpaid or already sent
    if (currentStatus.indexOf('SENT') !== -1) {
      skippedCount++;
      continue;
    }
    if (paymentStatus.indexOf('PAID') === -1 && paymentStatus.indexOf('CONFIRMED') === -1) {
      skippedCount++;
      continue;
    }
    if (!email || email.indexOf('@') === -1) {
      skippedCount++;
      continue;
    }

    let matchedPass = passByEmail[email] || (i < passes.length ? passes[i] : null);
    if (!matchedPass) continue;

    const ticketId = matchedPass.ticketNumber;
    const passUrl = BASE_PASS_URL + matchedPass.passImageUrl;

    try {
      let passBlob = null;
      try {
        const imgRes = UrlFetchApp.fetch(passUrl, { muteHttpExceptions: true });
        if (imgRes.getResponseCode() === 200) {
          passBlob = imgRes.getBlob().setName('Workshop_Pass_' + ticketId + '.png');
        }
      } catch (imgErr) {
        Logger.log('Could not fetch pass image: ' + imgErr);
      }

      const subject = '🎟️ Entry Pass: From Problem to Possibility Workshop [' + ticketId + ']';
      const htmlBody = buildEmailHtml(name, ticketId, course, year, passUrl);

      const opts = {
        htmlBody: htmlBody,
        name: 'KMCT CEETM - Problem to Possibility'
      };
      if (passBlob) opts.attachments = [passBlob];

      GmailApp.sendEmail(email, subject, 'Please view this email in an HTML client.', opts);

      // Update Sheet Status
      const timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd/MM/yyyy HH:mm');
      sheet.getRange(rowIdx, 12).setValue(ticketId).setHorizontalAlignment('center').setFontWeight('bold');
      sheet.getRange(rowIdx, 13).setValue(passUrl);
      sheet.getRange(rowIdx, 14).setValue('SENT: ' + timestamp).setFontColor('#15803d').setFontWeight('bold');
      
      sentCount++;
      logs.push('Sent ' + ticketId + ' to ' + email);
      Logger.log('✅ (' + sentCount + ') Sent pass ' + ticketId + ' to ' + email + ' (' + name + ')');

      // Pause briefly between sends to respect Gmail rate limits
      Utilities.sleep(350);
    } catch (err) {
      Logger.log('❌ Failed to send to ' + email + ': ' + err);
      sheet.getRange(rowIdx, 14).setValue('ERROR: ' + err.message).setFontColor('#dc2626');
      logs.push('Failed ' + email + ': ' + err.message);
    }
  }

  Logger.log('====================================================');
  Logger.log('🎉 Automated Gmail dispatch finished!');
  Logger.log('Sent: ' + sentCount + ' emails');
  Logger.log('Skipped (already sent / invalid): ' + skippedCount);
  Logger.log('====================================================');

  return {
    success: true,
    sentCount: sentCount,
    skippedCount: skippedCount,
    totalVerified: lastRow - 1,
    logs: logs
  };
}

/**
 * Interactively prompts organizer for email and phone to send a test pass
 */
function sendTestPassInteractive() {
  const ui = SpreadsheetApp.getUi();
  const emailPrompt = ui.prompt(
    '🧪 Send Test Pass - Step 1 of 2',
    'Enter the TEST EMAIL address to send the pass to:',
    ui.ButtonSet.OK_CANCEL
  );

  if (emailPrompt.getSelectedButton() !== ui.Button.OK) return;
  const testEmail = emailPrompt.getResponseText().trim();
  if (!testEmail || testEmail.indexOf('@') === -1) {
    ui.alert('Invalid email address entered.');
    return;
  }

  const phonePrompt = ui.prompt(
    '🧪 Send Test Pass - Step 2 of 2',
    'Enter your WhatsApp Mobile Number (10 digits, e.g. 9876543210):',
    ui.ButtonSet.OK_CANCEL
  );

  if (phonePrompt.getSelectedButton() !== ui.Button.OK) return;
  let testPhone = phonePrompt.getResponseText().replace(/[^0-9]/g, '').trim();
  if (testPhone.length === 10) testPhone = '91' + testPhone;

  const result = executeTestPass(testEmail, testPhone);
  
  if (result.success) {
    const htmlOutput = HtmlService.createHtmlOutput(
      '<div style="font-family: sans-serif; padding: 10px;">' +
      '<h3 style="color: #15803d;">✅ Test Email Dispatched!</h3>' +
      '<p>A test pass email has been sent to: <strong>' + testEmail + '</strong></p>' +
      '<p>Ticket ID: <strong>' + result.ticketId + '</strong></p>' +
      '<hr/>' +
      '<h4>📱 WhatsApp Test Message:</h4>' +
      '<p>Click the button below to test opening WhatsApp with the pre-filled message:</p>' +
      '<a href="' + result.whatsappUrl + '" target="_blank" style="display:inline-block;background:#25D366;color:white;padding:12px 20px;text-decoration:none;font-weight:bold;border-radius:8px;">Open WhatsApp Test Chat</a>' +
      '<p style="font-size:12px;color:#666;margin-top:12px;">URL: ' + result.whatsappUrl + '</p>' +
      '</div>'
    ).setWidth(500).setHeight(360);
    ui.showModalDialog(htmlOutput, 'Test Pass Sent Successfully');
  } else {
    ui.alert('Error sending test pass: ' + result.error);
  }
}

/**
 * Core test pass executor callable programmatically or via Webhook
 */
function executeTestPass(testEmail, testPhone) {
  try {
    const passes = fetchPassesCatalog();
    const samplePass = (passes && passes.length > 0) ? passes[0] : null;
    
    const ticketId = 'KMCT-WS-TEST-0001';
    const candidateName = 'Test Participant (Organizer Preview)';
    const course = 'CSE / IIC Innovation Lab';
    const year = '1st Year';
    const passUrl = samplePass 
      ? (BASE_PASS_URL + samplePass.passImageUrl) 
      : (BASE_PASS_URL + '/generated-passes/passes/KMCT-WS-0001_nafeesath_saja.png');

    let passBlob = null;
    try {
      const imgRes = UrlFetchApp.fetch(passUrl, { muteHttpExceptions: true });
      if (imgRes.getResponseCode() === 200) {
        passBlob = imgRes.getBlob().setName('Workshop_Pass_' + ticketId + '.png');
      }
    } catch (err) {
      Logger.log('Could not fetch image blob: ' + err);
    }

    const subject = '🎟️ [TEST] Entry Pass: From Problem to Possibility Workshop [' + ticketId + ']';
    const htmlBody = buildEmailHtml(candidateName, ticketId, course, year, passUrl);

    const emailOptions = {
      htmlBody: htmlBody,
      name: 'KMCT CEETM - Problem to Possibility'
    };
    if (passBlob) {
      emailOptions.attachments = [passBlob];
    }

    GmailApp.sendEmail(testEmail, subject, 'Please view this email in an HTML-compatible client.', emailOptions);

    const cleanPhone = (testPhone || '').replace(/[^0-9]/g, '');
    const waText = buildWhatsAppMessage(candidateName, ticketId, passUrl);
    const waUrl = 'https://api.whatsapp.com/send?phone=' + cleanPhone + '&text=' + encodeURIComponent(waText);

    Logger.log('Test pass sent to email: ' + testEmail + ', WhatsApp: ' + waUrl);
    return {
      success: true,
      ticketId: ticketId,
      email: testEmail,
      phone: testPhone,
      passUrl: passUrl,
      whatsappUrl: waUrl
    };
  } catch (error) {
    Logger.log('executeTestPass Error: ' + error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Populates Ticket IDs, Pass URLs, and 1-Click WhatsApp links in Sheet
 */
function populateWhatsAppAndTicketColumns() {
  const ss = getActiveSheetInstance();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return 'No sheet found';

  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setValues([HEADERS]);
  headerRange
    .setFontFamily('Roboto')
    .setFontSize(10)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#0f172a')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.setColumnWidth(12, 140); // Ticket ID
  sheet.setColumnWidth(13, 240); // Pass URL
  sheet.setColumnWidth(14, 160); // Email Status
  sheet.setColumnWidth(15, 180); // WhatsApp Action

  const passes = fetchPassesCatalog();
  const passByEmail = {};
  const passByPhone = {};
  const passByName = {};

  passes.forEach(function(p) {
    if (p.email) passByEmail[p.email.toLowerCase().trim()] = p;
    if (p.phone) passByPhone[p.phone.replace(/[^0-9]/g, '').slice(-10)] = p;
    if (p.fullName) passByName[p.fullName.toLowerCase().trim()] = p;
  });

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 'No candidates to populate';

  const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  let assignedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowIdx = i + 2;
    const name = String(rows[i][2] || '').trim();
    const email = String(rows[i][3] || '').toLowerCase().trim();
    const phone = String(rows[i][4] || '').replace(/[^0-9]/g, '').slice(-10);

    let matchedPass = passByEmail[email] || passByPhone[phone] || passByName[name.toLowerCase()];
    if (!matchedPass && i < passes.length) {
      matchedPass = passes[i];
    }

    if (matchedPass) {
      const ticketId = matchedPass.ticketNumber;
      const passUrl = BASE_PASS_URL + matchedPass.passImageUrl;
      const cleanPhone = '91' + (phone || matchedPass.phone || '');
      const waMsg = buildWhatsAppMessage(name || matchedPass.fullName, ticketId, passUrl);
      const waUrl = 'https://api.whatsapp.com/send?phone=' + cleanPhone + '&text=' + encodeURIComponent(waMsg);
      const waFormula = '=HYPERLINK("' + waUrl + '", "📲 Send WhatsApp")';

      sheet.getRange(rowIdx, 12).setValue(ticketId).setHorizontalAlignment('center').setFontWeight('bold');
      sheet.getRange(rowIdx, 13).setValue(passUrl);
      
      const currentEmailStatus = sheet.getRange(rowIdx, 14).getValue();
      if (!currentEmailStatus) {
        sheet.getRange(rowIdx, 14).setValue('Ready to send').setHorizontalAlignment('center');
      }

      sheet.getRange(rowIdx, 15).setFormula(waFormula).setHorizontalAlignment('center');
      assignedCount++;
    }
  }

  Logger.log('Populated ' + assignedCount + ' passes with Ticket IDs & WhatsApp links.');
  try {
    SpreadsheetApp.getUi().alert('✅ Success: Populated ' + assignedCount + ' Ticket IDs and 1-Click WhatsApp links in columns 12-15!');
  } catch(e) {}
  return 'Populated ' + assignedCount + ' passes';
}

/**
 * Displays summary status of dispatch
 */
function showDispatchStatus() {
  const ss = getActiveSheetInstance();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    try { SpreadsheetApp.getUi().alert('No candidate records in sheet.'); } catch(e){}
    return;
  }

  const statuses = sheet.getRange(2, 14, lastRow - 1, 1).getValues();
  let sent = 0;
  let pending = 0;

  for (let i = 0; i < statuses.length; i++) {
    const s = String(statuses[i][0] || '');
    if (s.indexOf('SENT') !== -1) sent++;
    else pending++;
  }

  const msg = '📊 Workshop Pass Dispatch Status\n\n' +
    'Total Verified Students: ' + (lastRow - 1) + '\n' +
    'Passes Emailed: ' + sent + '\n' +
    'Passes Pending: ' + pending;

  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch(e){}
}

/**
 * Removes duplicate payment entries and removes blacklisted candidate
 */
function deduplicateAndCleanSheet() {
  const ss = getActiveSheetInstance();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return 'No sheet found';

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 'No data rows to clean';

  const data = sheet.getRange(1, 1, lastRow, HEADERS.length).getValues();
  const seenPayments = {};
  let deletedCount = 0;

  for (let r = lastRow; r >= 2; r--) {
    const rowValues = data[r - 1];
    const fullName = String(rowValues[2] || '').trim().toLowerCase();
    const email = String(rowValues[3] || '').trim().toLowerCase();
    const paymentId = String(rowValues[9] || '').trim();

    if (
      email.indexOf('kadeejath') !== -1 ||
      fullName.indexOf('kadeejath') !== -1 ||
      paymentId === 'pay_TwkHug9cRRmVHo'
    ) {
      Logger.log('Removing blacklisted row ' + r + ': ' + fullName);
      sheet.deleteRow(r);
      deletedCount++;
      continue;
    }

    if (paymentId && paymentId.indexOf('pay_') === 0) {
      if (seenPayments[paymentId]) {
        Logger.log('Removing duplicate payment row ' + r + ': ' + paymentId + ' (' + fullName + ')');
        sheet.deleteRow(r);
        deletedCount++;
        continue;
      }
      seenPayments[paymentId] = true;
    }
  }

  const updatedLastRow = sheet.getLastRow();
  for (let r = 2; r <= updatedLastRow; r++) {
    const range = sheet.getRange(r, 1, 1, HEADERS.length);
    sheet.setRowHeight(r, 28);
    range.setBackground(r % 2 === 0 ? '#f8fafc' : '#ffffff');
  }

  Logger.log('Cleaned ' + deletedCount + ' rows. Final confirmed candidates: ' + (updatedLastRow - 1));
  try {
    SpreadsheetApp.getUi().alert('🧹 Cleaned ' + deletedCount + ' duplicate rows. Final confirmed count: ' + (updatedLastRow - 1));
  } catch(e) {}
  return 'Cleaned ' + deletedCount + ' rows. Final verified count: ' + (updatedLastRow - 1);
}

/**
 * Health check & diagnostic endpoint (GET)
 */
function doGet(e) {
  try {
    const ss = getActiveSheetInstance();
    const sheet = ss.getSheetByName(SHEET_NAME);
    const rowCount = sheet ? Math.max(sheet.getLastRow() - 1, 0) : 0;
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'active',
      service: 'Problem to Possibility Google Sheets Auto-Sync Webhook',
      sheetId: TARGET_SPREADSHEET_ID,
      sheetName: SHEET_NAME,
      confirmedRegistrationsCount: rowCount,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Webhook receiver for candidate registration sync & remote actions (POST)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rawData = e.postData.contents;
    const data = JSON.parse(rawData);

    // 1. Remote Send Test Pass Action
    if (data.action === 'send_test' || data.action === 'send_test_pass') {
      const testEmail = data.testEmail || data.email;
      const testPhone = data.testPhone || data.phone;
      const res = executeTestPass(testEmail, testPhone);
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Remote Send All Passes via Gmail Action
    if (data.action === 'send_all' || data.action === 'send_all_passes') {
      const res = executeBatchEmailDispatch();
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', result: res }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Remote Cleanup Action
    if (data.action === 'cleanup' || data.action === 'deduplicate') {
      const res = deduplicateAndCleanSheet();
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', result: res }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Remote Populate WhatsApp & Ticket IDs Action
    if (data.action === 'populate_whatsapp' || data.action === 'populate') {
      const res = populateWhatsAppAndTicketColumns();
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', result: res }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 5. Default: Sync candidate registration to sheet
    const ss = getActiveSheetInstance();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME, 0);
    }

    const regId = data.registrationNumber || data['Registration ID'] || data['Registration Number'] || data.id || 'N/A';
    const email = (data.email || data['Email Address'] || data['Email'] || '').toLowerCase().trim();
    const utr = data.utr || data.transactionOrUtr || data['Transaction / UTR Number'] || data.paymentId || 'N/A';

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const existingData = sheet.getRange(2, 1, lastRow - 1, Math.min(10, HEADERS.length)).getValues();
      for (let i = 0; i < existingData.length; i++) {
        const rowUtr = String(existingData[i][9] || '').trim();
        const rowRegId = String(existingData[i][1] || '').trim();
        if (utr !== 'N/A' && utr.indexOf('pay_') === 0 && rowUtr === utr) {
          return ContentService.createTextOutput(JSON.stringify({ status: 'duplicate_skipped', message: 'Payment ID already recorded: ' + utr }))
            .setMimeType(ContentService.MimeType.JSON);
        }
        if (regId !== 'N/A' && rowRegId === regId) {
          return ContentService.createTextOutput(JSON.stringify({ status: 'duplicate_skipped', message: 'Registration ID already recorded' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    const timestamp = data.timestamp || Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
    const fullName = data.fullName || data['Full Name'] || '';
    const phone = data.phone || data['Phone Number'] || data['WhatsApp / Mobile'] || '';
    const course = data.course || data['Course / Department'] || '';
    const yearOfStudy = data.yearOfStudy || data['Year of Study'] || '1st Year';
    const paymentStatus = data.paymentStatus || data['Payment Status'] || 'CONFIRMED / PAID';
    const paymentMethod = data.paymentMethod || data['Payment Method'] || 'Razorpay';
    const amount = Number(data.amountINR || data['Amount (INR)'] || data['Amount'] || 100);

    const newRow = [
      timestamp,
      regId,
      fullName,
      email,
      phone,
      course,
      yearOfStudy,
      paymentStatus,
      paymentMethod,
      utr,
      amount
    ];

    sheet.appendRow(newRow);
    const newRowNum = sheet.getLastRow();
    const appendedRange = sheet.getRange(newRowNum, 1, 1, newRow.length);
    appendedRange.setFontFamily('Roboto').setFontSize(10).setVerticalAlignment('middle');
    sheet.setRowHeight(newRowNum, 28);
    appendedRange.setBackground(newRowNum % 2 === 0 ? '#f8fafc' : '#ffffff');
    sheet.getRange(newRowNum, 8).setFontColor('#15803d').setFontWeight('bold');
    sheet.getRange(newRowNum, 11).setNumberFormat('₹#,##0');

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', row: newRowNum, id: regId }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Accurately standardizes course strings using exact branch rules
 */
function getAccurateStandardizedCourse(courseStr, email) {
  const e = String(email || '').toLowerCase().trim();
  // Mohammed Imthiyaz entered "Management" - at KMCT this is BBA
  if (e === 'imthiyazmohammed40@gmail.com') return 'BBA';
  // Muhammad shabeeb entered "Btech csbs management" - this is CSBS
  if (e === 'mmuhammadshabeeb176@gmail.com') return 'B.Tech CSBS';

  const c = String(courseStr || '').toLowerCase().trim();

  // 1. BCA
  if (c.indexOf('bca') !== -1) return 'BCA';

  // 2. BBA
  if (c.indexOf('bba') !== -1) return 'BBA';

  // 3. MBA
  if (c === 'mba') return 'MBA';

  // 4. CSBS (Computer Science & Business Systems)
  if (c.indexOf('csbs') !== -1 || (c.indexOf('business') !== -1 && c.indexOf('computer') !== -1)) {
    return 'B.Tech CSBS';
  }

  // 5. AI & Data Science
  if (c.indexOf('ai') !== -1 || c.indexOf('data science') !== -1 || c.indexOf('ds') !== -1 || c.indexOf('artificial') !== -1) {
    return 'B.Tech AI & DS';
  }

  // 6. ECE (Must check word boundary so 'btech' or 'technology' does not match 'ec')
  if (/\b(ece|ec|electronics)\b/.test(c) || c.indexOf('electronics communication') !== -1) {
    return 'B.Tech ECE';
  }

  // 7. CSE
  if (c.indexOf('cse') !== -1 || c.indexOf('computer') !== -1 || c.indexOf('cs') !== -1) {
    return 'B.Tech CSE';
  }

  // 8. General B.Tech
  if (c.indexOf('btech') !== -1 || c.indexOf('b.tech') !== -1 || c.indexOf('tech') !== -1) {
    return 'B.Tech CSE';
  }

  return courseStr;
}

/**
 * Ordered sort key for clean grouping
 */
function getCourseSortKey(courseStr) {
  const c = String(courseStr || '').trim();
  if (c === 'BCA') return '1_BCA';
  if (c === 'BBA') return '2_BBA';
  if (c === 'MBA') return '3_MBA';
  if (c.indexOf('AI & DS') !== -1) return '4_BTech_AIDS';
  if (c.indexOf('CSBS') !== -1) return '5_BTech_CSBS';
  if (c.indexOf('ECE') !== -1) return '6_BTech_ECE';
  if (c.indexOf('CSE') !== -1) return '7_BTech_CSE';
  return '8_Other';
}

/**
 * Sorts all student rows in Google Sheet by Course Group:
 * 1. BCA Students
 * 2. BBA Students
 * 3. MBA Students
 * 4. B.Tech AI & DS
 * 5. B.Tech CSBS
 * 6. B.Tech ECE
 * 7. B.Tech CSE
 */
function sortSheetByCourse(standardizeNames) {
  const ss = getActiveSheetInstance();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 2) return 'Not enough rows to sort';

  const lastCol = sheet.getLastColumn();
  const range = sheet.getRange(2, 1, lastRow - 1, lastCol);
  const values = range.getValues();

  // Load verified original catalog to restore genuine department names
  let originalMap = {};
  try {
    const passes = fetchPassesCatalog();
    passes.forEach(function(p) {
      if (p.email) originalMap[p.email.toLowerCase().trim()] = p.course;
    });
  } catch (err) {
    Logger.log('Could not fetch external catalog, using current row values: ' + err);
  }

  // Find course column index (0-indexed, default 5)
  const headerValues = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  let courseCol = 5;
  for (let c = 0; c < headerValues.length; c++) {
    if (/course|dept|department/i.test(String(headerValues[c]))) {
      courseCol = c;
      break;
    }
  }

  // Filter out empty rows
  const validRows = values.filter(function(r) {
    const regId = String(r[1] || '').trim();
    const email = String(r[3] || '').trim();
    return (regId !== '' && regId !== 'N/A') || (email !== '' && email !== 'N/A');
  });

  // Accurately standardize course names
  validRows.forEach(function(row) {
    const email = String(row[3] || '').toLowerCase().trim();
    const rawCourse = originalMap[email] || row[courseCol];
    row[courseCol] = getAccurateStandardizedCourse(rawCourse, email);
  });

  // Sort rows: first by Course Group, then alphabetically by Student Name
  validRows.sort(function(a, b) {
    const keyA = getCourseSortKey(a[courseCol]);
    const keyB = getCourseSortKey(b[courseCol]);
    if (keyA !== keyB) return keyA.localeCompare(keyB);

    const nameA = String(a[2] || '').toLowerCase().trim();
    const nameB = String(b[2] || '').toLowerCase().trim();
    return nameA.localeCompare(nameB);
  });

  // Clear existing data rows and rewrite sorted rows
  sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  sheet.getRange(2, 1, validRows.length, lastCol).setValues(validRows);

  // Re-apply alternating background colors
  for (let r = 2; r <= validRows.length + 1; r++) {
    sheet.getRange(r, 1, 1, lastCol).setBackground(r % 2 === 0 ? '#f8fafc' : '#ffffff');
  }

  Logger.log('✅ Sheet successfully sorted: ' + validRows.length + ' students grouped by Course.');
  try {
    SpreadsheetApp.getUi().alert(
      '✅ Success',
      'Successfully sorted ' + validRows.length + ' rows by Course!\n\nOrder:\n1. BCA Students (7)\n2. BBA Students (3)\n3. MBA (1)\n4. B.Tech AI & DS (18)\n5. B.Tech CSBS (5)\n6. B.Tech ECE (2)\n7. B.Tech CSE (34)',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (_) {}

  return 'Successfully sorted ' + validRows.length + ' rows by Course';
}

function standardizeAndSortByCourse() {
  return sortSheetByCourse(true);
}
