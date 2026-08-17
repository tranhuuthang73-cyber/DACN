import { Request, Response } from 'express';
import prisma from '../prisma';
import { getWeatherForecast } from '../ai/model';

// In-memory or Database state for Zalo OA
let zaloConfig = {
  oa_id: '38294719284729184',
  app_id: '4820193847291',
  secret_key: 'zalo_sec_mock_492048102948',
  access_token: 'zalo_access_token_official_account_vietnam_2026',
  webhook_url: 'https://smartfarm.vn/api/zalo-bot/webhook',
  auto_morning_zns: true,
  zns_time: '06:30',
  salinity_zns_push: true,
  is_connected: true
};

// -------------------------------------------------------------
// 1. GENERATE ZALO ZNS TEMPLATE MESSAGE (Bản tin Zalo OA)
// -------------------------------------------------------------
export const generateZaloDailyZNS = async (req: Request, res: Response): Promise<void> => {
  try {
    const { plotId } = req.params;
    const plot = await prisma.plot.findUnique({
      where: { id: parseInt(plotId || '1') },
      include: {
        seasons: {
          orderBy: { created_at: 'desc' },
          include: { logs: true }
        }
      }
    });

    if (!plot) {
      res.status(404).json({ error: 'Không tìm thấy thửa đất' });
      return;
    }

    const activeSeason = plot.seasons[0];
    const cropName = activeSeason?.crop_type || 'Sầu riêng Ri6';
    const weather = await getWeatherForecast(plot.latitude || 10.36, plot.longitude || 106.36);

    const temp = weather.temp || 32.5;
    const humidity = weather.humidity || 65;

    // VPD thermodynamic calculation
    const es = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const ea = es * (humidity / 100);
    const vpd = Math.round(Math.max(0, es - ea) * 100) / 100;

    const znsCard = {
      template_id: 'ZNS_AGRI_DAILY_01',
      title: 'BẢN TIN NÔNG NGHIỆP SÁNG - ZALO OA SMART FARM',
      plot_name: plot.name,
      crop_type: cropName,
      date_string: new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
      weather: `${temp}°C • Độ ẩm ${humidity}% • Gió ${weather.wind_speed_kmh || 12} km/h`,
      vpd_status: `${vpd} kPa (${vpd >= 0.8 && vpd <= 1.2 ? '🟢 Vùng vàng quang hợp đỉnh cao' : '🟡 Cần tưới bù ẩm'})`,
      irrigation_plan: 'Đã kích hoạt tưới nhỏ giọt 45 Lít lúc 06:30 sáng',
      river_salinity: '0.4‰ (Nguồn nước sông Tiền ngọt an toàn)',
      advice: 'Thời tiết hôm nay nắng ráo, chỉ số quang hợp tối đa. Thích hợp tưới xả gốc và bón phân hữu cơ vi sinh vào 16:30 chiều.',
      market_highlight: '🍈 Sầu riêng Ri6 xuất khẩu: 135.000đ/kg (Tăng 12%)'
    };

    res.json({
      success: true,
      zns_card: znsCard,
      raw_text: `🌾 [ZALO OA] Chào anh Thắng! Bản tin sáng nay: ${plot.name} (${cropName}) nhiệt độ ${temp}°C, VPD ${vpd} kPa quang hợp lý tưởng. Hệ thống đã tự động tưới 45L nước.`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------
// 2. DISPATCH ZALO ZNS MESSAGE VIA WEBHOOK
// -------------------------------------------------------------
export const sendZaloZNSNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, message, templateId } = req.body;

    const targetPhone = phone || '0987654321';
    const msg = message || 'Thông báo tự động từ Hệ thống Nông Nghiệp Thông Minh qua Zalo OA';

    // Simulate sending Zalo ZNS API Call (https://business.openapi.zalo.me/message/template)
    res.json({
      success: true,
      status: 'DELIVERED',
      phone: targetPhone,
      template_id: templateId || 'ZNS_AGRI_DAILY_01',
      dispatched_content: msg,
      sent_at: new Date().toLocaleTimeString('vi-VN'),
      zalo_msg_id: `zns_msg_${Date.now()}`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------
// 3. INTERACTIVE ZALO CHATBOT ENGINE
// -------------------------------------------------------------
export const handleZaloChatMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, seasonId, plotId } = req.body;
    const text = (message || '').trim().toLowerCase();

    let reply = '';
    let quickActions: string[] = [];

    if (text.includes('chào') || text.includes('help') || text.includes('bắt đầu') || text.includes('menu')) {
      reply = `Dạ em chào anh Thắng! 🍊🌾 Em là **Trợ lý Nông Nghiệp Zalo OA** của vườn mình.\n\nAnh có thể nhắn tin bằng tiếng Việt tự nhiên hoặc chọn các chức năng bên dưới nhé:`;
      quickActions = ['💧 Bơm tưới 40L', '📊 Cảm biến đất & vi khí hậu', '🍈 Giá sầu riêng hôm nay', '☀️ Dự báo thời tiết'];
    } else if (text.includes('cảm biến') || text.includes('độ ẩm') || text.includes('ph') || text.includes('status')) {
      reply = `📊 **THÔNG SỐ THỬA ĐẤT THỜI GIAN THỰC (ZALO IOT):**\n\n` +
        `🌱 • **Độ ẩm đất:** 58% (Rất tốt, rễ cây đang hút nước mạnh)\n` +
        `🧪 • **Độ pH đất:** 6.4 (Thích hợp cho cây ăn trái)\n` +
        `🌡️ • **Nhiệt độ không khí:** 32.5°C | Độ ẩm: 65%\n` +
        `🌊 • **Độ mặn sông Tiền:** 0.4‰ (Nước ngọt an toàn)\n` +
        `⚡ • **Máy bơm:** Đang TẮT (Tự động theo lịch)`;
      quickActions = ['💧 Bơm tưới ngay 50L', '🌫️ Kiểm tra VPD lá'];
    } else if (text.includes('tưới') || text.includes('bơm nước') || text.includes('water')) {
      const match = text.match(/\d+/);
      const liters = match ? parseInt(match[0]) : 40;

      if (seasonId) {
        const season = await prisma.season.findUnique({ where: { id: parseInt(seasonId) } });
        if (season) {
          await prisma.farmingLog.create({
            data: {
              season_id: season.id,
              plot_id: season.plot_id,
              type: 'WATER',
              amount: liters,
              unit: 'Lít',
              method: 'Điều khiển từ xa qua Zalo OA Chatbot',
              note: `📱 Lệnh tưới ${liters}L gửi trực tiếp từ tin nhắn Zalo`
            }
          });
        }
      }

      reply = `✅ **ĐÃ BẬT MÁY BƠM TƯỚI NƯỚC TỪ XA QUA ZALO!**\n\n` +
        `💧 • **Khối lượng tưới:** ${liters} Lít nước\n` +
        `🌿 • **Chế độ:** Tưới nhỏ giọt tiết kiệm nước FAO-56\n` +
        `📝 • **Nhật ký:** Đã tự động lưu vào Sổ Canh Tác VietGAP điện tử!`;
      quickActions = ['📊 Xem lại cảm biến', '🍈 Xem giá nông sản'];
    } else if (text.includes('giá') || text.includes('thị trường') || text.includes('tiền') || text.includes('bán')) {
      reply = `📈 **BẢNG GIÁ NÔNG SẢN HÔM NAY (CẬP NHẬT ZALO AGRI):**\n\n` +
        `🍈 • **Sầu riêng Ri6 (Loại 1):** 135.000 đ/kg (🟢 Tăng 12.5%)\n` +
        `🍊 • **Cam sành Tam Bình:** 28.000 đ/kg (Ổn định)\n` +
        `🌾 • **Lúa tươi ST25:** 9.200 đ/kg\n` +
        `🥭 • **Xoài cát Hòa Lộc:** 48.000 đ/kg\n\n` +
        `💡 *Khuyên:* Các vựa thu mua Tiền Giang đang tìm mua sầu riêng số lượng lớn, giữ thêm 3-5 ngày để cắt lứa đẹp nhất nhé anh!`;
      quickActions = ['💧 Bơm tưới 40L', '☀️ Dự báo thời tiết'];
    } else if (text.includes('thời tiết') || text.includes('mưa') || text.includes('nắng')) {
      reply = `☀️ **DỰ BÁO THỜI TIẾT KHU VỰC VƯỜN:**\n\n` +
        `🌤️ • Hôm nay: Nắng ráo, nhiệt độ 32.5°C, chiều có mây dông nhẹ (xác suất mưa 20%).\n` +
        `🌧️ • Ngày mai: Mưa rào rải rác lúc 15h, lượng mưa ~12mm.\n` +
        `💡 *Khuyên:* Tạm hoãn phun phân bón lá vào chiều nay để tránh mưa rửa trôi.`;
      quickActions = ['💧 Bơm tưới 40L', '📊 Cảm biến đất'];
    } else if (text.includes('vpd') || text.includes('lá')) {
      reply = `🌫️ **CHỈ SỐ ÁP SUẤT THIẾU HỤT HƠI NƯỚC (VPD LÁ):**\n\n` +
        `🍃 • **VPD Hiện tại:** 1.05 kPa\n` +
        `🟢 • **Trạng thái:** VÙNG VÀNG QUANG HỢP (0.8 - 1.2 kPa)\n` +
        `✨ • Khí khổng lá đang mở 100%, cây hấp thu CO2 và dinh dưỡng tối đa.`;
      quickActions = ['💧 Bơm tưới 40L', '🍈 Giá sầu riêng'];
    } else {
      reply = `Dạ em đã nhận tin nhắn: "${message}". Anh có thể bấm các nút bên dưới để em phục vụ nhanh nhất nhé! 👇`;
      quickActions = ['💧 Bơm tưới 40L', '📊 Cảm biến đất', '🍈 Giá nông sản', '☀️ Thời tiết'];
    }

    res.json({
      success: true,
      user_message: message,
      reply: reply,
      quick_actions: quickActions,
      sent_time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------
// 4. GET / UPDATE ZALO OA CONFIGURATION
// -------------------------------------------------------------
export const getZaloConfig = async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    config: zaloConfig
  });
};

export const updateZaloConfig = async (req: Request, res: Response): Promise<void> => {
  const { oa_id, app_id, secret_key, access_token, auto_morning_zns, zns_time, salinity_zns_push } = req.body;

  zaloConfig = {
    ...zaloConfig,
    oa_id: oa_id || zaloConfig.oa_id,
    app_id: app_id || zaloConfig.app_id,
    secret_key: secret_key || zaloConfig.secret_key,
    access_token: access_token || zaloConfig.access_token,
    auto_morning_zns: auto_morning_zns !== undefined ? auto_morning_zns : zaloConfig.auto_morning_zns,
    zns_time: zns_time || zaloConfig.zns_time,
    salinity_zns_push: salinity_zns_push !== undefined ? salinity_zns_push : zaloConfig.salinity_zns_push
  };

  res.json({
    success: true,
    message: 'Cập nhật cấu hình Zalo Official Account thành công!',
    config: zaloConfig
  });
};
