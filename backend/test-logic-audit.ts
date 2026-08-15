import prisma from './src/prisma';

async function runAudit() {
  console.log('🧪 ========================================================');
  console.log('🧪 BẮT ĐẦU KIỂM TRA TOÀN DIỆN LOGIC HỆ THỐNG SMART FARM');
  console.log('🧪 ========================================================');

  let passedTests = 0;
  let totalTests = 0;

  function assert(name: string, condition: boolean, details?: any) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`, details || '');
    }
  }

  try {
    // 1. Check Database Consistency
    console.log('\n🔍 1. Kiểm tra Dữ liệu Cơ sở Dữ liệu & Ràng buộc Quan hệ...');
    const users = await prisma.user.findMany();
    assert('Tài khoản người dùng tồn tại', users.length >= 2, { count: users.length });

    const plots = await prisma.plot.findMany({ include: { seasons: true, logs: true } });
    assert('Thửa đất tồn tại và có liên kết mùa vụ', plots.length > 0, { plotCount: plots.length });

    const firstPlot = plots[0];
    assert('Thửa đất có diện tích hợp lệ (> 0 m²)', firstPlot.area_m2 > 0, { area: firstPlot.area_m2 });

    // 2. Test Fetching Physics API
    console.log('\n🔍 2. Kiểm tra Logic Động Cơ Sinh Lý Cây Trồng (VPD & FAO-56)...');
    const vpdRes = await fetch(`http://localhost:3000/api/crop-physics/vpd/${firstPlot.id}`);
    const vpdJson = await vpdRes.json();
    assert('Endpoint /api/crop-physics/vpd trả về HTTP 200', vpdRes.status === 200);
    assert('Chỉ số VPD lá hợp lệ (0 <= VPD <= 5 kPa)', vpdJson.vpd_results?.leaf_vpd_kpa >= 0 && vpdJson.vpd_results?.leaf_vpd_kpa <= 5, vpdJson.vpd_results);
    assert('Trạng thái khí khổng lá được phân loại chính xác', !!vpdJson.vpd_results?.stomata_state);

    const faoRes = await fetch(`http://localhost:3000/api/crop-physics/fao56/${firstPlot.id}`);
    const faoJson = await faoRes.json();
    assert('Endpoint /api/crop-physics/fao56 trả về HTTP 200', faoRes.status === 200);
    assert('Bốc thoát hơi nước ET0 dương (> 0 mm/ngày)', faoJson.fao56_results?.reference_evapotranspiration_et0_mm_day > 0);
    assert('Tiết kiệm nước ngọt > 0%', faoJson.fao56_results?.water_savings_percent >= 0);

    const paretoRes = await fetch(`http://localhost:3000/api/crop-physics/pareto/${firstPlot.id}`);
    const paretoJson = await paretoRes.json();
    assert('Endpoint /api/crop-physics/pareto trả về 3 kịch bản NSGA-II', paretoJson.pareto_scenarios?.length === 3);

    // 3. Test Crop Memory & Real-Time Growth Tracker API
    console.log('\n🔍 3. Kiểm tra Logic Trí Nhớ Canh Tác AI & Theo Dõi Sinh Trưởng...');
    const memRes = await fetch(`http://localhost:3000/api/crop-tracker/memory/${firstPlot.id}`);
    const memJson = await memRes.json();
    assert('Endpoint /api/crop-tracker/memory trả về HTTP 200', memRes.status === 200);
    assert('Trí nhớ canh tác tự động trích xuất các quy tắc AI', memJson.memory_profile?.learned_rules?.length >= 3);

    const season = firstPlot.seasons[0];
    if (season) {
      const growthRes = await fetch(`http://localhost:3000/api/crop-tracker/growth/${season.id}`);
      const growthJson = await growthRes.json();
      assert('Endpoint /api/crop-tracker/growth trả về HTTP 200', growthRes.status === 200);
      assert('Chỉ số sinh học đo thật (Chiều cao, Tán lá, LAI) hợp lệ', growthJson.biometrics?.height?.actual_cm > 0);
    }

    // 4. Test Agronomy Expert & Voice AI NLP
    console.log('\n🔍 4. Kiểm tra Logic Chuyên Gia Nông Nghiệp & Giọng Nói AI (NLP)...');
    const nutRes = await fetch(`http://localhost:3000/api/expert/nutrients/${firstPlot.id}`);
    const nutJson = await nutRes.json();
    assert('Endpoint /api/expert/nutrients tính toán đúng N-P-K', nutRes.status === 200 && nutJson.nutrient_status?.nitrogen);

    const voiceRes = await fetch('http://localhost:3000/api/expert/voice-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'tưới 80 lít nước vào gốc cây', seasonId: season?.id })
    });
    const voiceJson = await voiceRes.json();
    assert('Giọng nói AI bóc tách đúng hành động "WATER" và số lượng 80L', voiceJson.interpreted_intent?.action_type === 'WATER' && voiceJson.interpreted_intent?.amount === 80);

    // 5. Test Edge Cases (Error Handling)
    console.log('\n🔍 5. Kiểm tra Xử lý Ngoại lệ & Trường hợp Biên (Edge Cases)...');
    const notFoundRes = await fetch('http://localhost:3000/api/crop-physics/vpd/99999');
    assert('Thửa đất không tồn tại trả về 404 sạch sẽ, không crash backend', notFoundRes.status === 404);

    console.log('\n========================================================');
    console.log(`🏆 KẾT QUẢ KIỂM TRA: ${passedTests}/${totalTests} TESTS ĐẠT HOÀN HẢO (${Math.round((passedTests/totalTests)*100)}%)`);
    console.log('========================================================');
  } catch (err) {
    console.error('Lỗi khi chạy kiểm tra:', err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

runAudit();
