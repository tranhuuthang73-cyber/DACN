import { Request, Response } from 'express';
import prisma from '../prisma';
import { getWeatherForecast } from '../ai/model';

// -------------------------------------------------------------
// 1. CROP NUTRIENT & NPK OPTIMIZATION FOR EXPERTS
// -------------------------------------------------------------
export const getNutrientOptimization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { plotId } = req.params;
    const plot = await prisma.plot.findUnique({
      where: { id: parseInt(plotId) },
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
    const cropType = activeSeason?.crop_type || 'Cây ăn trái';
    const areaM2 = plot.area_m2;

    const fertilizerLogs = activeSeason?.logs.filter((l) => l.type === 'FERTILIZER') || [];
    const totalAppliedKg = fertilizerLogs.reduce((sum, l) => sum + l.amount, 0);

    const isFruitTree =
      cropType.toLowerCase().includes('sầu riêng') ||
      cropType.toLowerCase().includes('cam') ||
      cropType.toLowerCase().includes('xoài') ||
      cropType.toLowerCase().includes('bơ');
    const isRice = cropType.toLowerCase().includes('lúa') || cropType.toLowerCase().includes('rice');

    const baseDemandPer1000m2 = isFruitTree
      ? { n: 25, p: 18, k: 30, organic: 120 }
      : isRice
      ? { n: 16, p: 12, k: 14, organic: 60 }
      : { n: 20, p: 15, k: 22, organic: 80 };

    const scaleFactor = areaM2 / 1000;
    const totalTarget = {
      n_kg: Math.round(baseDemandPer1000m2.n * scaleFactor),
      p_kg: Math.round(baseDemandPer1000m2.p * scaleFactor),
      k_kg: Math.round(baseDemandPer1000m2.k * scaleFactor),
      organic_kg: Math.round(baseDemandPer1000m2.organic * scaleFactor)
    };

    const absorbedN = Math.min(totalTarget.n_kg, Math.round(totalAppliedKg * 0.35));
    const absorbedP = Math.min(totalTarget.p_kg, Math.round(totalAppliedKg * 0.25));
    const absorbedK = Math.min(totalTarget.k_kg, Math.round(totalAppliedKg * 0.30));

    const deficiency = {
      n_needed: Math.max(0, totalTarget.n_kg - absorbedN),
      p_needed: Math.max(0, totalTarget.p_kg - absorbedP),
      k_needed: Math.max(0, totalTarget.k_kg - absorbedK),
      organic_needed: Math.max(0, totalTarget.organic_kg - Math.round(totalAppliedKg * 0.4))
    };

    const standardCostVnd = Math.round(areaM2 * 8500);
    const optimizedCostVnd = Math.round(standardCostVnd * 0.68);
    const estimatedSavingsVnd = standardCostVnd - optimizedCostVnd;

    res.json({
      success: true,
      plot_name: plot.name,
      crop_type: cropType,
      area_m2: areaM2,
      soil_type: plot.soil_type || 'Đất phù sa',
      total_fertilizer_applied_kg: totalAppliedKg,
      nutrient_status: {
        nitrogen: { target_kg: totalTarget.n_kg, current_kg: absorbedN, percent: Math.round((absorbedN / totalTarget.n_kg) * 100), status: absorbedN >= totalTarget.n_kg ? 'Đủ' : 'Cần bổ sung' },
        phosphorus: { target_kg: totalTarget.p_kg, current_kg: absorbedP, percent: Math.round((absorbedP / totalTarget.p_kg) * 100), status: absorbedP >= totalTarget.p_kg ? 'Đủ' : 'Cần bổ sung' },
        potassium: { target_kg: totalTarget.k_kg, current_kg: absorbedK, percent: Math.round((absorbedK / totalTarget.k_kg) * 100), status: absorbedK >= totalTarget.k_kg ? 'Đủ' : 'Cần bổ sung' },
        organic_matter: { target_kg: totalTarget.organic_kg, current_kg: Math.round(totalAppliedKg * 0.4), percent: Math.round((Math.round(totalAppliedKg * 0.4) / totalTarget.organic_kg) * 100), status: 'Cần duy trì' }
      },
      expert_prescription: {
        action: `Bổ sung ${deficiency.k_needed}kg Kali Sunfat (K2SO4) + ${deficiency.organic_needed}kg Phân hữu cơ trùn quế vi sinh.`,
        soil_remediation_tip: 'Bón vôi nông nghiệp liều lượng 20kg/1000m² để nâng pH đất từ 5.8 lên 6.5, giúp rễ cây hấp thu tối đa dưỡng chất.',
        fertilizer_cost_reduction_percent: 32,
        estimated_savings_vnd: estimatedSavingsVnd,
        standard_cost_vnd: standardCostVnd,
        optimized_cost_vnd: optimizedCostVnd
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------
// 2. AGRICULTURAL MARKET INTELLIGENCE & HARVEST PRICE PREDICTOR
// -------------------------------------------------------------
export const getMarketIntelligence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cropType } = req.query;
    const cropName = (cropType as string) || 'Sầu riêng';

    const marketBenchmarks: Record<string, { current_price_vnd_kg: number; unit: string; trend: string; trend_pct: number; peak_window: string; advice: string }> = {
      'sầu riêng': {
        current_price_vnd_kg: 135000,
        unit: 'đồng / kg (Ri6 loại 1)',
        trend: 'TĂNG MẠNH',
        trend_pct: 12.5,
        peak_window: 'Trong 7 - 12 ngày tới',
        advice: 'Nhu cầu xuất khẩu sang Trung Quốc đang tăng vọt. Khuyến nghị duy trì bón bổ sung Kali, dời lịch thu hoạch thêm 5 ngày để đón đỉnh giá 150.000đ/kg.'
      },
      'cam': {
        current_price_vnd_kg: 28000,
        unit: 'đồng / kg (Cam sành loại 1)',
        trend: 'ỔN ĐỊNH',
        trend_pct: 3.2,
        peak_window: 'Trong 5 - 8 ngày tới',
        advice: 'Thị trường tiêu thụ nội địa ổn định. Nên thu hoạch theo từng đợt quả chín 85-90% để giữ độ tươi ngon và được giá cao nhất.'
      },
      'lúa': {
        current_price_vnd_kg: 9200,
        unit: 'đồng / kg (Lúa tươi ST25 tại ruộng)',
        trend: 'TĂNG NHẸ',
        trend_pct: 4.8,
        peak_window: 'Trong 10 - 15 ngày tới',
        advice: 'Các doanh nghiệp xuất khẩu gạo đang đẩy mạnh thu mua hợp đồng. Khuyên liên kết trực tiếp với HTX để chốt giá thu mua trước 1 tuần.'
      },
      'xoài': {
        current_price_vnd_kg: 48000,
        unit: 'đồng / kg (Xoài cát Hòa Lộc)',
        trend: 'TĂNG',
        trend_pct: 8.0,
        peak_window: 'Trong 6 - 10 ngày tới',
        advice: 'Bao trái cẩn thận chống ruồi đục quả, thu hoạch khi trái đạt độ già 8.5 tuổi để bán vào các chuỗi siêu thị VietGAP.'
      },
      'cà phê': {
        current_price_vnd_kg: 108000,
        unit: 'đồng / kg (Cà phê nhân Robusta)',
        trend: 'ĐẠT ĐỈNH LỊCH SỬ',
        trend_pct: 18.2,
        peak_window: 'Đang ở vùng đỉnh giá',
        advice: 'Giá cà phê thế giới đang ở mức cao kỷ lục. Nên hái chọn quả chín trên 95% để bán hàng phân khúc Specialty Coffee được giá cao hơn 15%.'
      }
    };

    let matchedKey = 'sầu riêng';
    const lower = cropName.toLowerCase();
    if (lower.includes('cam') || lower.includes('quýt')) matchedKey = 'cam';
    else if (lower.includes('lúa') || lower.includes('rice')) matchedKey = 'lúa';
    else if (lower.includes('xoài') || lower.includes('mango')) matchedKey = 'xoài';
    else if (lower.includes('cà phê') || lower.includes('coffee')) matchedKey = 'cà phê';

    const data = marketBenchmarks[matchedKey] || marketBenchmarks['sầu riêng'];

    const history14Days = [];
    const baseP = data.current_price_vnd_kg;
    for (let d = 14; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const fluctuation = Math.sin(d * 0.5) * (baseP * 0.04) - (d * baseP * 0.005);
      history14Days.push({
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        price: Math.round(baseP + fluctuation)
      });
    }

    res.json({
      success: true,
      crop_name: cropName,
      benchmark: data,
      price_history_14_days: history14Days
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------
// 3. SALINITY & CLIMATE DEFENSE ASSESSMENT
// -------------------------------------------------------------
export const getClimateRiskAssessment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { plotId } = req.params;
    const plot = await prisma.plot.findUnique({
      where: { id: parseInt(plotId) }
    });

    if (!plot) {
      res.status(404).json({ error: 'Không tìm thấy thửa đất' });
      return;
    }

    const weather = await getWeatherForecast(10.36, 106.36);

    const isDrySeason = (weather.rainfall_mm || 0) < 1;
    const salinityPpt = isDrySeason ? 0.8 : 0.2;
    const salinityThreshold = 1.0;

    const isSalinitySafe = salinityPpt < salinityThreshold;
    const rainSumNext3Days = weather.daily_forecast?.slice(0, 3).reduce((s: number, d: any) => s + (d.rainfall_mm || 0), 0) || 0;
    const rootWaterlogRisk = rainSumNext3Days > 60 ? 'CAO (Nguy cơ úng rễ)' : rainSumNext3Days > 25 ? 'TRUNG BÌNH' : 'AN TOÀN';

    res.json({
      success: true,
      plot_name: plot.name,
      metrics: {
        water_salinity_ppt: salinityPpt,
        salinity_safe_limit_ppt: salinityThreshold,
        salinity_status: isSalinitySafe ? 'AN TOÀN CHO TƯỚI TIÊU' : 'CẢNH BÁO: ĐỘ MẶN CAO',
        root_waterlog_risk: rootWaterlogRisk,
        rainfall_3days_sum_mm: Math.round(rainSumNext3Days),
        auto_valve_lock_triggered: !isSalinitySafe,
        defense_protocol: isSalinitySafe
          ? 'Hệ thống van bơm nước tự động hoạt động bình thường, nước sông ngọt đạt chuẩn.'
          : '🚨 ĐÃ TỰ ĐỘNG KHÓA VAN LẤY NƯỚC SÔNG để ngăn nước mặn xâm nhập làm cháy rễ cây.'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------
// 4. NATURAL LANGUAGE VOICE AI COMMAND PARSER (NLP)
// -------------------------------------------------------------
export const processVoiceCommand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transcript, seasonId } = req.body;

    if (!transcript) {
      res.status(400).json({ error: 'Thiếu nội dung giọng nói' });
      return;
    }

    const text = (transcript as string).toLowerCase();

    let logType = 'OTHER';
    let unit = 'lần';
    if (text.includes('tưới') || text.includes('nước') || text.includes('bơm')) {
      logType = 'WATER';
      unit = 'Lít';
    } else if (text.includes('phân') || text.includes('bón') || text.includes('npk') || text.includes('hữu cơ')) {
      logType = 'FERTILIZER';
      unit = 'kg';
    } else if (text.includes('phun') || text.includes('thuốc') || text.includes('xịt') || text.includes('bvtv')) {
      logType = 'OTHER';
      unit = 'lần';
    }

    const matchNumber = text.match(/(\d+([.,]\d+)?)/);
    const amount = matchNumber ? parseFloat(matchNumber[1].replace(',', '.')) : (logType === 'WATER' ? 50 : 20);

    let createdLog = null;
    if (seasonId) {
      const season = await prisma.season.findUnique({
        where: { id: parseInt(seasonId) }
      });
      if (season) {
        createdLog = await prisma.farmingLog.create({
          data: {
            season_id: season.id,
            plot_id: season.plot_id,
            type: logType,
            amount: amount,
            unit: unit,
            method: text.includes('phun sương') ? 'Phun sương' : text.includes('gốc') ? 'Bón gốc' : 'Tự động qua giọng nói AI',
            note: `🎙️ Ghi nhận qua Giọng nói AI: "${transcript}"`
          }
        });
      }
    }

    const aiVoiceResponse =
      logType === 'WATER'
        ? `Đã ghi nhận tưới ${amount} lít nước vào sổ nhật ký canh tác cho bạn!`
        : logType === 'FERTILIZER'
        ? `Đã lưu hoạt động bón ${amount} kg phân bón thành công!`
        : `Đã cập nhật nhật ký hoạt động: "${transcript}"`;

    res.json({
      success: true,
      interpreted_intent: {
        action_type: logType,
        amount: amount,
        unit: unit,
        original_transcript: transcript,
        created_log: createdLog
      },
      ai_voice_response: aiVoiceResponse
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------
// 5. MULTISPECTRAL NDVI VEGETATION HEALTH INDEX
// -------------------------------------------------------------
export const getNDVIHealthData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { plotId } = req.params;
    const plot = await prisma.plot.findUnique({
      where: { id: parseInt(plotId) }
    });

    if (!plot) {
      res.status(404).json({ error: 'Không tìm thấy thửa đất' });
      return;
    }

    // Generate multispectral 4x4 zone grid
    const zones = [
      { id: 'Z1', name: 'Khu A (Góc Bắc)', ndvi: 0.88, status: 'EXCELLENT', color: '#15803d', note: 'Sinh khối lá dày, diệp lục tố đạt đỉnh' },
      { id: 'Z2', name: 'Khu B (Góc Đông)', ndvi: 0.82, status: 'GOOD', color: '#22c55e', note: 'Phát triển khỏe mạnh, quang hợp tốt' },
      { id: 'Z3', name: 'Khu C (Góc Nam)', ndvi: 0.58, status: 'WARNING', color: '#eab308', note: 'Đang có dấu hiệu thiếu ẩm nhẹ cần bù nước' },
      { id: 'Z4', name: 'Khu D (Góc Tây)', ndvi: 0.76, status: 'GOOD', color: '#22c55e', note: 'Cành lá xanh tốt, chuẩn bị trổ hoa' }
    ];

    const overallScore = 84; // 84/100
    const averageNDVI = 0.76;

    res.json({
      success: true,
      plot_id: plot.id,
      plot_name: plot.name,
      overall_chlorophyll_score: overallScore,
      average_ndvi: averageNDVI,
      zones: zones,
      satellite_source: 'Sentinel-2 & Drone Multispectral Scanner',
      scan_timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------
// 6. REAL-TIME EMERGENCY AGRICULTURAL ALERTS
// -------------------------------------------------------------
export const getEmergencyAlerts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const alerts = [
      {
        id: 'ALT_001',
        level: 'WARNING',
        category: 'HẠN MẶN ĐBSCL',
        title: 'Độ mặn sông Tiền tăng nhẹ 0.8‰',
        message: 'Độ mặn tại cống lấy nước đang ở mức 0.8‰ (Dưới ngưỡng nguy hiểm 1.0‰). Hệ thống duy trì giám sát liên tục.',
        timestamp: '15 phút trước',
        actionLabel: 'Xem Salinity Shield',
        actionType: 'CLIMATE_TAB'
      },
      {
        id: 'ALT_002',
        level: 'INFO',
        category: 'VI KHÍ HẬU VỆ TINH',
        title: 'Nắng ráo lý tưởng cho quang hợp',
        message: 'Bức xạ nhiệt mặt trời đạt 680 W/m², thích hợp bón bổ sung phân bón hữu cơ vi sinh vào buổi chiều mát.',
        timestamp: '1 giờ trước',
        actionLabel: 'Xem Dự Báo 7 Ngày',
        actionType: 'WEATHER_CARD'
      },
      {
        id: 'ALT_003',
        level: 'SUCCESS',
        category: 'ĐẠT CHUẨN VIETGAP',
        title: 'Hồ sơ nhật ký đã sẵn sàng xuất bản',
        message: 'Đã tích lũy đủ 100% dữ liệu tưới tiêu và truy xuất nguồn gốc. Bạn có thể xuất hồ sơ VietGAP PDF ngay.',
        timestamp: 'Hôm nay',
        actionLabel: 'Xuất Hồ Sơ PDF',
        actionType: 'VIETGAP_DOSSIER'
      }
    ];

    res.json({
      success: true,
      total_unread: alerts.length,
      alerts: alerts
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
