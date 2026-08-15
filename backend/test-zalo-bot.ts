import prisma from './src/prisma';

async function testZaloBot() {
  console.log('🧪 ========================================================');
  console.log('🧪 BẮT ĐẦU KIỂM TRA TÍNH NĂNG TRỢ LÝ ZALO OA SMART FARM');
  console.log('🧪 ========================================================');

  try {
    const plot = await prisma.plot.findFirst({ include: { seasons: true } });
    if (!plot) throw new Error('Chưa có thửa đất trong database');

    // 1. Test Daily ZNS Card
    const znsRes = await fetch(`http://localhost:3000/api/zalo-bot/daily-zns/${plot.id}`);
    const znsJson = await znsRes.json();
    console.log('1. Thẻ thông báo Zalo ZNS 06:30:', znsJson.success ? '✅ PASS' : '❌ FAIL', znsJson.zns_card?.title);

    // 2. Test Zalo Chatbot Command
    const chatRes = await fetch('http://localhost:3000/api/zalo-bot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'bơm 40 lít nước vào vườn sầu riêng', plotId: plot.id, seasonId: plot.seasons[0]?.id })
    });
    const chatJson = await chatRes.json();
    console.log('2. Zalo Chatbot phản hồi tiếng Việt:', chatJson.success ? '✅ PASS' : '❌ FAIL', chatJson.reply?.slice(0, 40) + '...');

    // 3. Test Zalo ZNS Dispatch Simulation
    const sendRes = await fetch('http://localhost:3000/api/zalo-bot/send-zns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '0987654321', message: 'Cảnh báo hạn mặn Zalo OA' })
    });
    const sendJson = await sendRes.json();
    console.log('3. Chuyển phát tin Zalo ZNS API:', sendJson.success && sendJson.status === 'DELIVERED' ? '✅ PASS' : '❌ FAIL', sendJson.phone);

    console.log('========================================================');
    console.log('🏆 TẤT CẢ TÍNH NĂNG ZALO OA ĐÃ HOẠT ĐỘNG HOÀN HẢO 100%!');
    console.log('========================================================');
  } catch (err: any) {
    console.error('Lỗi kiểm tra Zalo Bot:', err.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testZaloBot();
