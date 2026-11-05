/**
 * =========================================================================
 * FROM PROBLEM TO POSSIBILITY - WORKSHOP REGISTRATION SYNC & TABLE FORMATTER
 * KMCT College of Engineering for Emerging Technologies and Management
 * Target Sheet ID: 1ooc3SoHQbKIeCFhaNGm5_qoRSKuC41PDVp_tcodRi4Q
 * =========================================================================
 * 
 * SETUP INSTRUCTIONS (Takes less than 1 minute):
 * 1. Open your target Google Sheet:
 *    https://docs.google.com/spreadsheets/d/1ooc3SoHQbKIeCFhaNGm5_qoRSKuC41PDVp_tcodRi4Q/edit
 * 2. Click on "Extensions" > "Apps Script" in the top menu.
 * 3. Delete any existing code and PASTE THIS ENTIRE SCRIPT.
 * 4. In the toolbar, select "setupTableFormatting" from the dropdown and click "Run".
 *    (Google will ask for permission; click "Advanced" > "Go to Untitled project (unsafe)" > "Allow").
 *    This will instantly create and format your "Registrations" table with professional styling!
 * 5. Click "Deploy" > "New deployment":
 *    - Click the gear icon (Select type) > Choose "Web app"
 *    - Description: "Workshop Auto Sync Webhook"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"  <-- CRITICAL!
 *    - Click "Deploy".
 * 6. Copy the resulting Web app URL (starts with https://script.google.com/macros/s/.../exec).
 * 7. Paste that Web app URL into your Vercel Project Settings > Environment Variables as:
 *    GOOGLE_SHEET_WEBHOOK_URL
 *    (and in your local .env.local file).
 * =========================================================================
 */

const TARGET_SPREADSHEET_ID = '1ooc3SoHQbKIeCFhaNGm5_qoRSKuC41PDVp_tcodRi4Q';
const SHEET_NAME = 'Registrations';

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
  'Amount (₹)'
];

/**
 * Helper to obtain the target spreadsheet instance
 */
function getActiveSheetInstance() {
  try {
    return SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
  } catch (err) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * Run this function once from the Apps Script editor to format the sheet table
 */
function setupTableFormatting() {
  const ss = getActiveSheetInstance();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0);
  }

  // Header Row Setup
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setValues([HEADERS]);

  // Modern Dark Institutional Styling for Table Header
  headerRange
    .setFontFamily('Roboto')
    .setFontSize(10)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#0f172a') // Dark Slate / Midnight
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(false);

  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);

  // Optimized Column Widths
  sheet.setColumnWidth(1, 175); // Timestamp
  sheet.setColumnWidth(2, 240); // Registration ID
  sheet.setColumnWidth(3, 220); // Full Name
  sheet.setColumnWidth(4, 250); // Email Address
  sheet.setColumnWidth(5, 150); // Mobile
  sheet.setColumnWidth(6, 260); // Course / Dept
  sheet.setColumnWidth(7, 120); // Year (1st Year)
  sheet.setColumnWidth(8, 160); // Payment Status
  sheet.setColumnWidth(9, 130); // Method
  sheet.setColumnWidth(10, 220); // Transaction / UTR
  sheet.setColumnWidth(11, 110); // Amount (₹)

  // Alignments & Number Formats
  const maxRows = Math.max(sheet.getMaxRows() - 1, 100);
  sheet.getRange(2, 1, maxRows, 1).setHorizontalAlignment('center'); // Timestamp
  sheet.getRange(2, 2, maxRows, 1).setHorizontalAlignment('center'); // ID
  sheet.getRange(2, 5, maxRows, 1).setHorizontalAlignment('center'); // Mobile
  sheet.getRange(2, 7, maxRows, 1).setHorizontalAlignment('center'); // Year
  sheet.getRange(2, 8, maxRows, 1).setHorizontalAlignment('center'); // Status
  sheet.getRange(2, 9, maxRows, 1).setHorizontalAlignment('center'); // Method
  sheet.getRange(2, 11, maxRows, 1).setHorizontalAlignment('right').setNumberFormat('₹#,##0'); // Amount

  // Register Named Range for Table
  try {
    const tableRange = sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 2), HEADERS.length);
    ss.setNamedRange('Workshop_Registrations_Table', tableRange);
  } catch (e) {
    Logger.log('Named table range note: ' + e);
  }

  Logger.log('Table formatting applied successfully to sheet: ' + SHEET_NAME);
  return 'Table formatted successfully!';
}

/**
 * Health check & diagnostic endpoint (visit URL in browser)
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
 * Webhook receiver for candidate registration sync (POST)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rawData = e.postData.contents;
    const data = JSON.parse(rawData);

    const ss = getActiveSheetInstance();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      setupTableFormatting();
      sheet = ss.getSheetByName(SHEET_NAME);
    }

    const regId = data.registrationNumber || data['Registration ID'] || data['Registration Number'] || data.id || 'N/A';
    const email = (data.email || data['Email Address'] || data['Email'] || '').toLowerCase().trim();

    // Deduplication check: Avoid double-inserting the same Ticket ID or verified candidate
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const existingData = sheet.getRange(2, 2, lastRow - 1, 3).getValues();
      for (let i = 0; i < existingData.length; i++) {
        const rowRegId = String(existingData[i][0]).trim();
        const rowEmail = String(existingData[i][2]).toLowerCase().trim();
        if (regId !== 'N/A' && rowRegId === regId) {
          return ContentService.createTextOutput(JSON.stringify({
            status: 'duplicate_skipped',
            message: 'Registration ID already recorded in sheet',
            id: regId
          })).setMimeType(ContentService.MimeType.JSON);
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
    const utr = data.utr || data.transactionOrUtr || data['Transaction / UTR Number'] || data.paymentId || 'N/A';
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
    const appendedRange = sheet.getRange(newRowNum, 1, 1, HEADERS.length);
    appendedRange.setFontFamily('Roboto').setFontSize(10).setVerticalAlignment('middle');
    sheet.setRowHeight(newRowNum, 28);

    // Subtle alternating row shading
    if (newRowNum % 2 === 0) {
      appendedRange.setBackground('#f8fafc');
    } else {
      appendedRange.setBackground('#ffffff');
    }

    // Bold Green text for Confirmed / Paid status
    const statusCell = sheet.getRange(newRowNum, 8);
    statusCell.setFontColor('#15803d').setFontWeight('bold');

    // Amount column formatting
    const amountCell = sheet.getRange(newRowNum, 11);
    amountCell.setNumberFormat('₹#,##0');

    // Update named range for the table
    try {
      ss.setNamedRange('Workshop_Registrations_Table', sheet.getRange(1, 1, newRowNum, HEADERS.length));
    } catch (e) {}

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      row: newRowNum,
      id: regId,
      email: email
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
