const { execSync } = require('child_process');

const tests = [
  'tests/test_end_to_end_lifecycle.sql',
  'tests/test_sp_create_rental_order.sql',
  'tests/test_concurrency_race_condition.sql',
  'tests/test_constraints_and_integrity.sql',
  'tests/test_sp_harvest_and_qr.sql',
  'tests/test_audit_and_security.sql'
];

for (let round = 1; round <= 3; round++) {
  console.log('\n==================================================');
  console.log('       KIỂM THỬ LẶP LẠI VÒNG ' + round + ' / 3');
  console.log('==================================================');
  
  for (const t of tests) {
    try {
      const output = execSync('sqlcmd -S .\\SQLEXPRESS01 -d SmartMushroomDB -E -C -I -i ' + t, { encoding: 'utf8' });
      const failMatch = output.match(/\[FAIL\]|Nguy hiểm!|Thất bại/);
      
      if (failMatch) {
        console.error('❌ [FAIL] ' + t + ': phát hiện từ khóa lỗi!');
        console.error(output);
        process.exit(1);
      } else {
        console.log('✅ [PASS 100%] ' + t);
      }
    } catch (err) {
      console.error('💥 [ERROR] ' + t + ':', err.message);
      process.exit(1);
    }
  }
}

console.log('\n🎉 TOÀN BỘ 3 VÒNG KIỂM THỬ TẤT CẢ 6 KỊCH BẢN ĐÃ VƯỢT QUA 100%!');
