/**
 * =========================================================================
 * FROM PROBLEM TO POSSIBILITY - WORKSHOP REGISTRATION SYNC & TABLE FORMATTER
 * KMCT College of Engineering for Emerging Technologies and Management
 * Target Sheet ID: 1ooc3SoHQbKIeCFhaNGm5_qoRSKuC41PDVp_tcodRi4Q
 * =========================================================================
 * 
 * SETUP & DEDUPLICATION INSTRUCTIONS:
 * 1. Open your Google Sheet:
 *    https://docs.google.com/spreadsheets/d/1ooc3SoHQbKIeCFhaNGm5_qoRSKuC41PDVp_tcodRi4Q/edit
 * 2. Click on "Extensions" > "Apps Script" in the top menu.
 * 3. Replace the existing code with THIS ENTIRE SCRIPT.
 * 4. In the toolbar dropdown, select "deduplicateAndCleanSheet" and click "Run".
 *    -> This will automatically delete all double entries and remove blacklisted records!
 * 5. Click "Deploy" > "Manage deployments" > Edit (pencil icon) > Version: "New version" > Click "Deploy".
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
 * Removes duplicate payment entries and removes blacklisted candidate (Kadeejath)
 * Run this function directly from the Apps Script toolbar!
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

  // Iterate backwards from the bottom so row deletion indices remain valid
  for (let r = lastRow; r >= 2; r--) {
    const rowValues = data[r - 1];
    const regId = String(rowValues[1] || '').trim();
    const fullName = String(rowValues[2] || '').trim().toLowerCase();
    const email = String(rowValues[3] || '').trim().toLowerCase();
    const paymentId = String(rowValues[9] || '').trim();

    // 1. Remove blacklisted candidate (Kadeejath Mashmooma Gulzar)
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

    // 2. Remove duplicate payments (keep first occurrence)
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

  // Re-apply alternating colors and styling
  const updatedLastRow = sheet.getLastRow();
  for (let r = 2; r <= updatedLastRow; r++) {
    const range = sheet.getRange(r, 1, 1, HEADERS.length);
    sheet.setRowHeight(r, 28);
    range.setBackground(r % 2 === 0 ? '#f8fafc' : '#ffffff');
  }

  Logger.log('Cleaned ' + deletedCount + ' rows. Final confirmed candidates: ' + (updatedLastRow - 1));
  return 'Cleaned ' + deletedCount + ' rows. Final verified count: ' + (updatedLastRow - 1);
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
    .setBackground('#0f172a')
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
  sheet.setColumnWidth(7, 120); // Year
  sheet.setColumnWidth(8, 160); // Payment Status
  sheet.setColumnWidth(9, 130); // Method
  sheet.setColumnWidth(10, 220); // Transaction / UTR
  sheet.setColumnWidth(11, 110); // Amount (₹)

  // Alignments & Number Formats
  const maxRows = Math.max(sheet.getMaxRows() - 1, 100);
  sheet.getRange(2, 1, maxRows, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 2, maxRows, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 5, maxRows, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 7, maxRows, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 8, maxRows, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 9, maxRows, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 11, maxRows, 1).setHorizontalAlignment('right').setNumberFormat('₹#,##0');

  Logger.log('Table formatting applied successfully to sheet: ' + SHEET_NAME);
  return 'Table formatted successfully!';
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

    // Optional remote cleanup action
    if (data.action === 'cleanup' || data.action === 'deduplicate') {
      const res = deduplicateAndCleanSheet();
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', result: res }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = getActiveSheetInstance();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      setupTableFormatting();
      sheet = ss.getSheetByName(SHEET_NAME);
    }

    const regId = data.registrationNumber || data['Registration ID'] || data['Registration Number'] || data.id || 'N/A';
    const email = (data.email || data['Email Address'] || data['Email'] || '').toLowerCase().trim();
    const utr = data.utr || data.transactionOrUtr || data['Transaction / UTR Number'] || data.paymentId || 'N/A';

    // Strict Deduplication check: Avoid double-inserting by Payment ID or Registration ID
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const existingData = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
      for (let i = 0; i < existingData.length; i++) {
        const rowRegId = String(existingData[i][1]).trim();
        const rowEmail = String(existingData[i][3]).toLowerCase().trim();
        const rowUtr = String(existingData[i][9]).trim();

        // 1. Skip if same Payment ID already exists in sheet!
        if (utr !== 'N/A' && utr.indexOf('pay_') === 0 && rowUtr === utr) {
          return ContentService.createTextOutput(JSON.stringify({
            status: 'duplicate_skipped',
            message: 'Payment ID already recorded in sheet: ' + utr,
            id: regId
          })).setMimeType(ContentService.MimeType.JSON);
        }

        // 2. Skip if same Ticket ID already exists
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
