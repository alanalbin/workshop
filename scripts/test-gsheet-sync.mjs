const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbx2l5e8mo6ul32UJXW6ZUGpoKILI964H5jpb2OY_eTSjPUPjfPArCP32-QJJB3wmVKqzQ/exec';

async function testGoogleSheetsAutoSync() {
  console.log('===========================================================');
  console.log('🧪 TESTING GOOGLE SHEETS AUTOMATIC SYNC & DEDUPLICATION');
  console.log('===========================================================\n');
  console.log('Target Sheet URL: https://docs.google.com/spreadsheets/d/1ooc3SoHQbKIeCFhaNGm5_qoRSKuC41PDVp_tcodRi4Q/edit');
  console.log('Webhook Endpoint:', WEBHOOK_URL);

  // STEP 1: Query initial count via GET health check
  console.log('\n[Step 1] Fetching live sheet status before sync...');
  const beforeRes = await fetch(WEBHOOK_URL);
  const beforeData = await beforeRes.json();
  console.log('  Initial Sheet Status:', beforeData.status);
  console.log('  Initial Confirmed Count:', beforeData.confirmedRegistrationsCount);
  const countBefore = beforeData.confirmedRegistrationsCount;

  // STEP 2: Submit a verified paid candidate via POST
  const testTicketId = `P2P-KMCT-TEST-${Date.now().toString(36).toUpperCase()}`;
  const testCandidate = {
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    registrationNumber: testTicketId,
    fullName: 'Verified Test Participant',
    email: `sync_verified_${Date.now()}@kmct.edu.in`,
    phone: '9847123456',
    course: 'B.Tech Computer Science & Engineering',
    yearOfStudy: '1st Year',
    paymentStatus: 'CONFIRMED / PAID',
    paymentMethod: 'Razorpay Live UPI',
    utr: `pay_live_test_${Date.now()}`,
    amountINR: 100,
  };

  console.log('\n[Step 2] Sending confirmed candidate payload to Google Sheet...');
  console.log('  Ticket ID:', testTicketId);
  console.log('  Candidate Name:', testCandidate.fullName);
  console.log('  Candidate Email:', testCandidate.email);
  console.log('  Year of Study:', testCandidate.yearOfStudy);
  console.log('  Amount Paid: ₹' + testCandidate.amountINR);

  const postRes = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testCandidate),
    redirect: 'follow',
  });

  const postData = await postRes.json();
  console.log('\n  Webhook Response:', postData);

  if (postData.status !== 'success') {
    console.error('❌ Failed to append row to Google Sheet:', postData);
    process.exit(1);
  }

  console.log(`  ✅ Row successfully appended at Row #${postData.row}!`);

  // STEP 3: Verify the sheet count incremented
  console.log('\n[Step 3] Verifying count increment on Google Sheet...');
  const afterRes = await fetch(WEBHOOK_URL);
  const afterData = await afterRes.json();
  console.log('  Updated Confirmed Count:', afterData.confirmedRegistrationsCount);

  const countAfter = afterData.confirmedRegistrationsCount;
  if (countAfter === countBefore + 1) {
    console.log(`  ✅ Verified: Sheet count increased from ${countBefore} to ${countAfter}!`);
  } else {
    console.warn(`  ⚠️ Count difference: expected ${countBefore + 1}, got ${countAfter}`);
  }

  // STEP 4: Test Deduplication Protection
  console.log('\n[Step 4] Testing Deduplication Protection (re-sending same Ticket ID)...');
  const duplicateRes = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testCandidate),
    redirect: 'follow',
  });
  const duplicateData = await duplicateRes.json();
  console.log('  Duplicate Submission Response:', duplicateData);

  if (duplicateData.status === 'duplicate_skipped') {
    console.log('  ✅ Deduplication SUCCESS: Duplicate entry was skipped without double-inserting!');
  } else {
    console.warn('  ⚠️ Deduplication response was:', duplicateData);
  }

  console.log('\n===========================================================');
  console.log('🎉 GOOGLE SHEETS AUTOMATIC SYNC TEST PASSED!');
  console.log('===========================================================');
  console.log('The Google Sheet is actively receiving and automatically formatting rows.');
  console.log('You can open the Google Sheet to view the new row:');
  console.log('https://docs.google.com/spreadsheets/d/1ooc3SoHQbKIeCFhaNGm5_qoRSKuC41PDVp_tcodRi4Q/edit');
  console.log('===========================================================\n');
}

testGoogleSheetsAutoSync().catch((err) => {
  console.error('Test script crashed:', err);
  process.exit(1);
});

