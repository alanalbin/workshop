/**
 * FROM PROBLEM TO POSSIBILITY - WORKSHOP REGISTRATION SYNC & FORMATTER
 * Sheet ID: 1ooc3SoHQbKIeCFhaNGm5_qoRSKuC41PDVp_tcodRi4Q
 * 
 * Instructions:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1ooc3SoHQbKIeCFhaNGm5_qoRSKuC41PDVp_tcodRi4Q/edit
 * 2. Click on "Extensions" > "Apps Script".
 * 3. Delete existing code and paste this entire script.
 * 4. Run `setupTableFormatting()` once from the editor to format the sheet table with headers, styling, and freeze panes.
 * 5. Click "Deploy" > "New deployment" > Select type "Web app" >
 *    - Description: "Workshop Registration Webhook"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Copy the Web app URL and set as GOOGLE_SHEET_WEBHOOK_URL in your Vercel project environment variables!
 */

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
 * Automatically creates and formats the sheet with a named table and professional styling
 */
function setupTableFormatting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0);
  }

  // Set top row headers
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setValues([HEADERS]);

  // Style Header Row: Dark Slate background, white bold text, centered
  headerRange
    .setFontFamily('Roboto')
    .setFontSize(10)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#0f172a')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(false);

  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  // Column width optimizations
  sheet.setColumnWidth(1, 170); // Timestamp
  sheet.setColumnWidth(2, 230); // Registration ID
  sheet.setColumnWidth(3, 200); // Full Name
  sheet.setColumnWidth(4, 240); // Email Address
  sheet.setColumnWidth(5, 150); // Mobile
  sheet.setColumnWidth(6, 260); // Course / Dept
  sheet.setColumnWidth(7, 120); // Year
  sheet.setColumnWidth(8, 160); // Status
  sheet.setColumnWidth(9, 130); // Method
  sheet.setColumnWidth(10, 220); // Transaction / UTR
  sheet.setColumnWidth(11, 110); // Amount

  // Format Amount column as Currency (INR ₹)
  sheet.getRange(2, 11, sheet.getMaxRows() - 1, 1).setNumberFormat('₹#,##0');

  // Center align ID, Mobile, Year, Status, Method, and Amount columns
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 2, sheet.getMaxRows() - 1, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 5, sheet.getMaxRows() - 1, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 7, sheet.getMaxRows() - 1, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 8, sheet.getMaxRows() - 1, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 9, sheet.getMaxRows() - 1, 1).setHorizontalAlignment('center');
  sheet.getRange(2, 11, sheet.getMaxRows() - 1, 1).setHorizontalAlignment('right');

  // Register Named Range for Table
  try {
    ss.setNamedRange('Workshop_Registrations_Table', sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 2), HEADERS.length));
  } catch (e) {
    Logger.log('Named range note: ' + e);
  }

  Logger.log('Table formatting applied successfully to sheet: ' + SHEET_NAME);
}

/**
 * Webhook endpoint that receives candidate registration payloads from Next.js
 */
function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const data = JSON.parse(rawData);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      setupTableFormatting();
      sheet = ss.getSheetByName(SHEET_NAME);
    }

    const regId = data.registrationNumber || data['Registration ID'] || data.id || 'N/A';
    const email = (data.email || data['Email Address'] || '').toLowerCase().trim();

    // Check for duplicate registration ID or duplicate email to avoid double entries
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const existingData = sheet.getRange(2, 2, lastRow - 1, 3).getValues();
      for (let i = 0; i < existingData.length; i++) {
        const rowRegId = existingData[i][0];
        const rowEmail = String(existingData[i][2]).toLowerCase().trim();
        if (regId && rowRegId === regId) {
          return ContentService.createTextOutput(JSON.stringify({ status: 'duplicate_skipped', id: regId }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    const timestamp = data.timestamp || Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
    const fullName = data.fullName || data['Full Name'] || '';
    const phone = data.phone || data['Phone Number'] || '';
    const course = data.course || data['Course / Department'] || '';
    const yearOfStudy = data.yearOfStudy || data['Year of Study'] || '1st Year';
    const paymentStatus = data.paymentStatus || data['Payment Status'] || 'CONFIRMED / PAID';
    const paymentMethod = data.paymentMethod || data['Payment Method'] || 'Razorpay';
    const utr = data.utr || data.transactionOrUtr || data['Transaction / UTR Number'] || 'N/A';
    const amount = Number(data.amountINR || data['Amount (INR)'] || 100);

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

    // Subtle alternating row color
    if (newRowNum % 2 === 0) {
      appendedRange.setBackground('#f8fafc');
    }

    // Color code verified status
    const statusCell = sheet.getRange(newRowNum, 8);
    if (paymentStatus.includes('CONFIRMED') || paymentStatus.includes('PAID')) {
      statusCell.setFontColor('#15803d').setFontWeight('bold');
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', row: newRowNum, id: regId }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
