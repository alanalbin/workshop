const WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbx2l5e8mo6ul32UJXW6ZUGpoKILI964H5jpb2OY_eTSjPUPjfPArCP32-QJJB3wmVKqzQ/exec';

async function main() {
  console.log('====================================================');
  console.log('🚀 TRIGGERING AUTOMATED GMAIL DISPATCH VIA APPS SCRIPT');
  console.log('====================================================\n');
  console.log(`Webhook Endpoint: ${WEBHOOK_URL}\n`);
  console.log('Triggering remote batch email dispatch...');

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_all' }),
    });

    const data = await res.json();
    console.log('\n✅ Webhook Response Received:');
    console.log(JSON.stringify(data, null, 2));

    if (data.status === 'success' && data.result) {
      console.log('\n====================================================');
      console.log('🎉 DISPATCH COMPLETED SUCCESSFULLY!');
      console.log(`Total Verified Candidates: ${data.result.totalVerified}`);
      console.log(`Emails Sent:               ${data.result.sentCount}`);
      console.log(`Skipped / Already Sent:    ${data.result.skippedCount}`);
      console.log('====================================================');
    }
  } catch (err) {
    console.error('❌ Error triggering webhook:', err.message);
    console.log('\n💡 Note: You can also execute the dispatch directly inside Google Apps Script:');
    console.log('1. Open your Google Sheet > Extensions > Apps Script');
    console.log('2. Select "sendAllStudentPassesAuto" from the function dropdown');
    console.log('3. Click "▶️ Run"');
  }
}

main();
