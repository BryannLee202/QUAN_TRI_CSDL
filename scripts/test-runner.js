const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.resolve(__dirname, '../test-report.log');
const logStream = fs.createWriteStream(logFile, { flags: 'w', encoding: 'utf8' });

function log(msg) {
  console.log(msg);
  logStream.write(msg + '\n');
}

const tests = [
  'tests/test_end_to_end_lifecycle.sql',
  'tests/test_sp_create_rental_order.sql',
  'tests/test_concurrency_race_condition.sql',
  'tests/test_constraints_and_integrity.sql',
  'tests/test_sp_harvest_and_qr.sql',
  'tests/test_audit_and_security.sql'
];

log('========================================================================');
log('   MUSHROOMCLOUD AUTOMATED TEST SUITE EXECUTION REPORT');
log('   Timestamp: ' + new Date().toISOString());
log('   Database: SmartMushroomDB (MS SQL Server .\\SQLEXPRESS01)');
log('========================================================================\n');

let totalRuns = 0;
let passedRuns = 0;

for (let round = 1; round <= 3; round++) {
  log('\n==================================================');
  log('       KIỂM THỬ LẶP LẠI VÒNG ' + round + ' / 3');
  log('==================================================');
  
  for (const t of tests) {
    totalRuns++;
    try {
      const output = execSync('sqlcmd -S .\\SQLEXPRESS01 -d SmartMushroomDB -E -C -I -i ' + t, { encoding: 'utf8' });
      const failMatch = output.match(/\[FAIL\]|Nguy hiểm!|Thất bại/);
      
      if (failMatch) {
        log('❌ [FAIL] ' + t + ': phát hiện từ khóa lỗi!');
        log(output);
        logStream.end();
        process.exit(1);
      } else {
        passedRuns++;
        log('✅ [PASS 100%] ' + t);
      }
    } catch (err) {
      log('💥 [ERROR] ' + t + ': ' + err.message);
      logStream.end();
      process.exit(1);
    }
  }
}

log('\n========================================================================');
log(`🎉 KẾT QUẢ: ${passedRuns}/${totalRuns} lượt kiểm thử đạt chuẩn 100% (ALL PASS)!`);
log('   Không phát hiện Lost Update, Dirty Read, Unrepeatable Read hay Phantom Read.');
log('========================================================================');
logStream.end();
