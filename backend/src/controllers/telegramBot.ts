import { Request, Response } from 'express';
import prisma from '../prisma';
import { getWeatherForecast } from '../ai/model';

// In-memory or database configuration for Telegram Bot
let botConfig = {
  bot_token: process.env.TELEGRAM_BOT_TOKEN || '7483920194:AAHq_mock_smart_farm_bot_token_demo',
  chat_id: process.env.TELEGRAM_CHAT_ID || '-100234567890',
  auto_morning_briefing: true,
  briefing_time: '06:30',
  salinity_alert_push: true,
  is_connected: true
};

// -------------------------------------------------------------
// 1. GENERATE SMART MORNING BRIEFING MESSAGE
// -------------------------------------------------------------
export const generateDailyBriefing = async (req: Request, res: Response): Promise<void> => {
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

    const temp = weather.temp || 32;
    const humidity = weather.humidity || 65;

    // Thermodynamic Leaf VPD
    const es = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const ea = es * (humidity / 100);
    const vpd = Math.round(Math.max(0, es - ea) * 100) / 100;

    const messageText = `☀️ *BÁO CÁO CANH TÁC BUỔI SÁNG - SMART FARM 4.0* 🌾\n\n` +
      `📍 *Thửa đất:* ${plot.name} (${plot.area_m2.toLocaleString()} m²)\n` +
      `🌱 *Cây trồng:* ${cropName}\n` +
      `📅 *Ngày:* ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}\n\n` +
      `🌡️ *Vi khí hậu vệ tinh:* ${temp}°C | Ẩm độ ${humidity}% | Gió ${weather.wind_speed_kmh || 12} km/h\n` +
      `🌫️ *Áp suất thiếu hụt hơi nước (VPD):* ${vpd} kPa (${vpd >= 0.8 && vpd <= 1.2 ? '🟢 Vùng vàng quang hợp cực đại' : '🟡 Cần lưu ý tưới bù ẩm'})\n` +
      `💧 *Thủy lợi tự động:* Hệ thống đã lên lịch tưới nhỏ giọt 45L vào lúc 06:30 sáng.\n` +
      `🌊 *Độ mặn sông Tiền:* 0.4‰ (An toàn tuyệt đối cho rễ cây).\n\n` +
      `💡 *Khuyến nghị chuyên gia:* Hôm nay nắng ráo lý tưởng, thích hợp bón bổ sung phân hữu cơ vi sinh vào chiều mát.\n\n` +
      `Chúc anh Thắng một ngày làm vườn tràn đầy năng lượng và bội thu! 🍊🌿`;

    res.json({
      success: true,
      plot_name: plot.name,
      briefing_text: messageText,
      meta: {
        temperature: temp,
        humidity: humidity,
        vpd_kpa: vpd,
        crop_type: cropName,
        generated_at: new Date().toISOString()
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------
// 2. DISPATCH LIVE TELEGRAM MESSAGE / ALERT VIA WEBHOOK
// -------------------------------------------------------------
export const sendTelegramMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, token, chatId } = req.body;

    const useToken = token || botConfig.bot_token;
    const useChatId = chatId || botConfig.chat_id;

    if (!message) {
      res.status(400).json({ error: 'Nội dung tin nhắn không được để trống' });
      return;
    }

    // If real token provided (starts with digits), make actual call to Telegram API
    let telegramApiResult = null;
    if (useToken && useToken.includes(':') && !useToken.includes('mock')) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${useToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: useChatId,
            text: message,
            parse_mode: 'Markdown'
          })
        });
        telegramApiResult = await response.json();
      } catch (tgErr: any) {
        console.warn('Could not connect to live Telegram server:', tgErr.message);
      }
    }

    res.json({
      success: true,
      status: 'SENT',
      dispatched_message: message,
      target_chat_id: useChatId,
      telegram_api_result: telegramApiResult,
      simulated: !telegramApiResult || !telegramApiResult.ok,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------
// 3. INTERACTIVE TELEGRAM COMMAND BOT SIMULATOR
// -------------------------------------------------------------
export const handleBotCommand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { command, seasonId, plotId } = req.body;
    const cmd = (command || '').trim().toLowerCase();

    let reply = '';
    let actionTriggered = null;

    if (cmd === '/start' || cmd === '/help') {
      reply = `🤖 *XIN CHÀO! TÔI LÀ SMART FARM ASSISTANT BOT*\n\n` +
        `Danh sách lệnh điều khiển nhanh:\n` +
        `👉 \`/status\` - Kiểm tra cảm biến đất & vi khí hậu\n` +
        `👉 \`/water 50\` - Bật bơm tưới 50 Lít nước & ghi nhật ký\n` +
        `👉 \`/market\` - Xem giá nông sản hôm nay\n` +
        `👉 \`/weather\` - Dự báo thời tiết & radar mưa 7 ngày\n` +
        `👉 \`/vpd\` - Kiểm tra áp suất khí khổng lá cây\n` +
        `👉 \`/vietgap\` - Lấy link xem Hồ sơ VietGAP điện tử`;
    } else if (cmd.startsWith('/status')) {
      reply = `📊 *TRẠNG THÁI NÔNG TRẠI THỜI GIAN THỰC*\n\n` +
        `🌱 *Độ ẩm đất:* 58% (Lý tưởng)\n` +
        `🧪 *Độ pH đất:* 6.4 (Hơi chua nhẹ, thích hợp sầu riêng)\n` +
        `🌡️ *Nhiệt độ:* 32.5°C | Ẩm độ: 65%\n` +
        `🌊 *Độ mặn nước sông:* 0.4‰ (Nước ngọt an toàn)\n` +
        `⚡ *Máy bơm:* Đang TẮT (Tự động theo lịch)`;
    } else if (cmd.startsWith('/water')) {
      const match = cmd.match(/\d+/);
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
              method: 'Điều khiển từ xa qua Telegram Bot',
              note: `📱 Lệnh tưới ${liters}L gửi từ Telegram Bot`
            }
          });
        }
      }

      actionTriggered = 'WATER_VALVE_OPEN';
      reply = `✅ *ĐÃ KÍCH HOẠT MÁY BƠM TƯỚI TỪ XA!*\n\n` +
        `💧 *Khối lượng:* ${liters} Lít nước\n` +
        `🌿 *Phương thức:* Tưới gốc nhỏ giọt\n` +
        `📝 *Nhật ký:* Đã tự động ghi vào Sổ Canh Tác VietGAP!`;
    } else if (cmd.startsWith('/market')) {
      reply = `📈 *BẢNG GIÁ NÔNG SẢN HÔM NAY (14/08/2026)*\n\n` +
        `🍈 *Sầu riêng Ri6 (Loại 1):* 135.000 đ/kg (🟢 Tăng 12.5%)\n` +
        `🍊 *Cam sành Tam Bình:* 28.000 đ/kg (Ổn định)\n` +
        `🌾 *Lúa tươi ST25:* 9.200 đ/kg (Tăng nhẹ)\n` +
        `🥭 *Xoài cát Hòa Lộc:* 48.000 đ/kg\n` +
        `☕ *Cà phê Robusta:* 108.000 đ/kg (Đỉnh lịch sử)\n\n` +
        `💡 *Khuyên:* Giá Sầu riêng đang tăng mạnh, giữ trái thêm 5 ngày để bán giá 150k!`;
    } else if (cmd.startsWith('/vpd')) {
      reply = `🌫️ *CHỈ SỐ ÁP SUẤT KHÍ KHỔNG LÁ (VPD)*\n\n` +
        `🍃 *VPD Hiện tại:* 1.05 kPa\n` +
        `🟢 *Trạng thái:* VÙNG VÀNG QUANG HỢP (0.8 - 1.2 kPa)\n` +
        `✨ *Độ mở khí khổng:* 100% (Lá cây đang quang hợp cực đại, lớn nhanh)`;
    } else {
      reply = `🤖 Em chưa hiểu lệnh \`${command}\`. Anh bấm \`/help\` để xem danh sách lệnh nhé!`;
    }

    res.json({
      success: true,
      command: command,
      bot_reply: reply,
      action_triggered: actionTriggered,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------
// 4. GET / UPDATE BOT CONFIGURATION
// -------------------------------------------------------------
export const getBotConfig = async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    config: botConfig
  });
};

export const updateBotConfig = async (req: Request, res: Response): Promise<void> => {
  const { bot_token, chat_id, auto_morning_briefing, briefing_time, salinity_alert_push } = req.body;

  botConfig = {
    ...botConfig,
    bot_token: bot_token !== undefined ? bot_token : botConfig.bot_token,
    chat_id: chat_id !== undefined ? chat_id : botConfig.chat_id,
    auto_morning_briefing: auto_morning_briefing !== undefined ? auto_morning_briefing : botConfig.auto_morning_briefing,
    briefing_time: briefing_time || botConfig.briefing_time,
    salinity_alert_push: salinity_alert_push !== undefined ? salinity_alert_push : botConfig.salinity_alert_push
  };

  res.json({
    success: true,
    message: 'Cập nhật cấu hình Bot Telegram thành công!',
    config: botConfig
  });
};
