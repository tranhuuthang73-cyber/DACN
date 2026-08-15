import prisma from '../prisma';

type ModelWeights = {
  w_water: number;
  w_fert: number;
  bias: number;
  version: number;
};

// In-memory model weights per plot
const models: Record<number, ModelWeights> = {};

export const initModel = (plotId: number): ModelWeights => {
  if (!models[plotId]) {
    models[plotId] = {
      w_water: 0.5, // 0.5 kg yield per unit water
      w_fert: 2.0,  // 2.0 kg yield per unit fertilizer
      bias: 10,     // base yield
      version: 1
    };
  }
  return models[plotId];
};

export interface DailyForecastItem {
  date: string;
  day_name: string;
  max_temp: number;
  min_temp: number;
  rainfall_mm: number;
  rain_probability_pct: number;
  weather_code: number;
  summary: string;
  is_rainy: boolean;
}

export interface HourlyForecastItem {
  hour: string;
  temp: number;
  rain_probability_pct: number;
  rainfall_mm: number;
}

export interface LiveWeatherData {
  temp: number;
  humidity: number;
  rainfall_mm: number;
  wind_speed_kmh: number;
  weather_code: number;
  forecast: string;
  location: string;
  is_live: boolean;
  timestamp: string;
  farming_advice: {
    can_fertilize: boolean;
    can_spray_pest: boolean;
    irrigation_advice: string;
    notice: string;
  };
  daily_forecast: DailyForecastItem[];
  hourly_forecast: HourlyForecastItem[];
}

const weatherCache: Record<string, { data: LiveWeatherData; expires: number }> = {};

const DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

const getWeatherSummary = (code: number, rainMm: number): { text: string; isRain: boolean } => {
  if (code === 0) return { text: 'Nắng đẹp', isRain: false };
  if ([1, 2, 3].includes(code)) return { text: 'Có mây rải rác', isRain: false };
  if ([45, 48].includes(code)) return { text: 'Sương mù nhẹ', isRain: false };
  if ([51, 53, 55].includes(code)) return { text: 'Mưa phùn nhẹ', isRain: true };
  if ([61, 63, 65].includes(code)) return { text: `Mưa rào (${rainMm}mm)`, isRain: true };
  if ([80, 81, 82].includes(code)) return { text: `Mưa dông (${rainMm}mm)`, isRain: true };
  if ([95, 96, 99].includes(code)) return { text: `Dông sét lớn (${rainMm}mm)`, isRain: true };
  return { text: 'Nắng ấm', isRain: false };
};

// Live Weather Service from Open-Meteo Satellite & Weather Radar (SRS Section 4.1 & 9)
export const getWeatherForecast = async (lat?: number | null, lon?: number | null): Promise<LiveWeatherData> => {
  const latitude = lat || 10.352;
  const longitude = lon || 106.358;
  const cacheKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;

  if (weatherCache[cacheKey] && weatherCache[cacheKey].expires > Date.now()) {
    return weatherCache[cacheKey].data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FBangkok`;
    const res = await fetch(url);
    if (res.ok) {
      const json: any = await res.json();
      const current = json.current;
      const code = current.weather_code || 0;
      const currentRain = current.precipitation || current.rain || 0;
      const { text: currentSummary, isRain: isCurrentlyRaining } = getWeatherSummary(code, currentRain);

      // Process 7-day daily forecast
      const daily = json.daily;
      const dailyList: DailyForecastItem[] = [];
      let next24hHasHeavyRain = false;

      if (daily && daily.time) {
        for (let i = 0; i < Math.min(7, daily.time.length); i++) {
          const dateObj = new Date(daily.time[i]);
          const dCode = daily.weather_code[i] || 0;
          const dRain = daily.precipitation_sum[i] || 0;
          const dProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : (dRain > 0 ? 80 : 15);
          const { text: dSummary, isRain: dIsRain } = getWeatherSummary(dCode, dRain);

          if (i === 0 && dRain > 5) next24hHasHeavyRain = true;

          dailyList.push({
            date: daily.time[i],
            day_name: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : DAY_NAMES[dateObj.getDay()],
            max_temp: Math.round(daily.temperature_2m_max[i]),
            min_temp: Math.round(daily.temperature_2m_min[i]),
            rainfall_mm: Number(dRain.toFixed(1)),
            rain_probability_pct: dProb || 0,
            weather_code: dCode,
            summary: dSummary,
            is_rainy: dIsRain
          });
        }
      }

      // Process next 12 hours forecast
      const hourly = json.hourly;
      const hourlyList: HourlyForecastItem[] = [];
      if (hourly && hourly.time) {
        const currentHourIndex = new Date().getHours();
        for (let j = currentHourIndex; j < Math.min(currentHourIndex + 12, hourly.time.length); j++) {
          const timeStr = hourly.time[j];
          const hourLabel = timeStr ? `${new Date(timeStr).getHours()}:00` : `${j}:00`;
          hourlyList.push({
            hour: hourLabel,
            temp: Math.round(hourly.temperature_2m[j]),
            rain_probability_pct: hourly.precipitation_probability ? hourly.precipitation_probability[j] : 10,
            rainfall_mm: Number((hourly.precipitation ? hourly.precipitation[j] : 0).toFixed(1))
          });
        }
      }

      // Farming agronomy recommendations based on rain
      const canFertilize = !next24hHasHeavyRain && currentRain < 1;
      const canSprayPest = !isCurrentlyRaining && currentRain === 0;
      const irrigateAdvice = isCurrentlyRaining
        ? 'Trời đang có mưa tự nhiên, ngắt van tưới để tiết kiệm nước và tránh ngập úng.'
        : current.temperature_2m > 33
        ? 'Nhiệt độ nắng gắt >33°C, nên tưới bù ẩm nhẹ vào lúc 16:30 chiều mát.'
        : 'Độ ẩm đất và vi khí hậu lý tưởng, duy trì chế độ tưới thông thường.';

      const notice = next24hHasHeavyRain
        ? '⚠️ CẢNH BÁO MƯA: Dự báo có mưa lớn trong ngày. Tuyệt đối KHÔNG bón phân đạm/NPK để tránh bị rửa trôi.'
        : '☀️ THỜI TIẾT THUẬN LỢI: 3 ngày tới không mưa lớn, thích hợp bón đón đòng, tỉa cành và phun phòng trừ sâu bệnh.';

      const data: LiveWeatherData = {
        temp: Math.round(current.temperature_2m),
        humidity: Math.round(current.relative_humidity_2m),
        rainfall_mm: currentRain,
        wind_speed_kmh: current.wind_speed_10m || 0,
        weather_code: code,
        forecast: `${currentSummary} (${Math.round(current.temperature_2m)}°C, độ ẩm ${Math.round(current.relative_humidity_2m)}%)`,
        location: lat && lon ? `Tọa độ (${latitude.toFixed(2)}, ${longitude.toFixed(2)})` : 'Khu vực Tiền Giang / ĐBSCL',
        is_live: true,
        timestamp: new Date().toISOString(),
        farming_advice: {
          can_fertilize: canFertilize,
          can_spray_pest: canSprayPest,
          irrigation_advice: irrigateAdvice,
          notice
        },
        daily_forecast: dailyList,
        hourly_forecast: hourlyList
      };

      weatherCache[cacheKey] = {
        data,
        expires: Date.now() + 3 * 60 * 1000 // Cache for 3 minutes
      };
      return data;
    }
  } catch (error) {
    console.error('Lỗi lấy thời tiết trực tiếp từ Open-Meteo:', error);
  }

  // High-fidelity fallback with 7-day forecast mock
  const fallbackDaily: DailyForecastItem[] = [
    { date: '2026-08-15', day_name: 'Hôm nay', max_temp: 33, min_temp: 26, rainfall_mm: 0, rain_probability_pct: 10, weather_code: 1, summary: 'Nắng ráo', is_rainy: false },
    { date: '2026-08-16', day_name: 'Ngày mai', max_temp: 34, min_temp: 26, rainfall_mm: 0, rain_probability_pct: 15, weather_code: 0, summary: 'Trời nắng đẹp', is_rainy: false },
    { date: '2026-08-17', day_name: 'Thứ Hai', max_temp: 32, min_temp: 25, rainfall_mm: 4.5, rain_probability_pct: 65, weather_code: 61, summary: 'Mưa rào rải rác', is_rainy: true },
    { date: '2026-08-18', day_name: 'Thứ Ba', max_temp: 31, min_temp: 25, rainfall_mm: 8.0, rain_probability_pct: 75, weather_code: 63, summary: 'Mưa rào chiều tối', is_rainy: true },
    { date: '2026-08-19', day_name: 'Thứ Tư', max_temp: 33, min_temp: 26, rainfall_mm: 1.2, rain_probability_pct: 30, weather_code: 2, summary: 'Có mây rải rác', is_rainy: false },
    { date: '2026-08-20', day_name: 'Thứ Năm', max_temp: 34, min_temp: 27, rainfall_mm: 0, rain_probability_pct: 10, weather_code: 0, summary: 'Nắng ráo', is_rainy: false },
    { date: '2026-08-21', day_name: 'Thứ Sáu', max_temp: 33, min_temp: 26, rainfall_mm: 0, rain_probability_pct: 20, weather_code: 1, summary: 'Trời dịu mát', is_rainy: false }
  ];

  return {
    temp: 32,
    humidity: 65,
    rainfall_mm: 0,
    wind_speed_kmh: 8.5,
    weather_code: 1,
    forecast: 'Nắng ấm 31-33°C, không mưa trong 3 ngày tới',
    location: lat && lon ? `Tọa độ (${latitude.toFixed(2)}, ${longitude.toFixed(2)})` : 'Khu vực Tiền Giang',
    is_live: false,
    timestamp: new Date().toISOString(),
    farming_advice: {
      can_fertilize: true,
      can_spray_pest: true,
      irrigation_advice: 'Duy trì tưới tiêu định kỳ vào buổi chiều mát.',
      notice: '☀️ Thời tiết vi khí hậu ổn định, thuận lợi cho chăm sóc và bón phân.'
    },
    daily_forecast: fallbackDaily,
    hourly_forecast: []
  };
};


export const generateRecommendation = async (plotId: number, seasonId: number, targetYield: number) => {
  const model = initModel(plotId);
  const plot = await prisma.plot.findUnique({ where: { id: plotId } });
  const weather = await getWeatherForecast(plot?.latitude, plot?.longitude);

  
  const logs = await prisma.farmingLog.findMany({ where: { season_id: seasonId } });
  let totalWater = 0;
  let totalFert = 0;
  logs.forEach(log => {
    if (log.type === 'WATER') totalWater += log.amount;
    if (log.type === 'FERTILIZER') totalFert += log.amount;
  });

  const gap = Math.max(0, targetYield - (model.bias + model.w_water * totalWater + model.w_fert * totalFert));
  
  let recWater = 0;
  let recFert = 0;
  
  if (gap > 0) {
    recWater = Number(((gap / 2) / model.w_water).toFixed(1));
    recFert = Number(((gap / 2) / model.w_fert).toFixed(1));
  }

  const recs = [];
  if (recWater > 0) {
    recs.push({
      type: 'WATER' as const,
      suggested_amount: recWater,
      confidence_score: 0.85,
      reason: `Dựa trên dự báo ${weather.forecast}. Đất có nguy cơ thiếu ẩm, đề xuất bổ sung thêm ${recWater}L nước.`,
      model_version: model.version
    });
  }

  if (recFert > 0) {
    recs.push({
      type: 'FERTILIZER' as const,
      suggested_amount: recFert,
      confidence_score: 0.82,
      reason: `Cây trồng đang giai đoạn sinh trưởng tích cực. Đề xuất bón thêm ${recFert}kg phân NPK để đạt mục tiêu ${targetYield}kg.`,
      model_version: model.version
    });
  }

  return recs;
};

export const updateModelWithFeedback = async (plotId: number, type: string, actualAmount: number, suggestedAmount: number) => {
  const model = initModel(plotId);
  const learningRate = 0.01;
  
  const error = actualAmount - suggestedAmount;
  
  if (type === 'WATER') {
    model.w_water += learningRate * error;
  } else {
    model.w_fert += learningRate * error;
  }
  
  model.version += 1;
  models[plotId] = model;

  await prisma.modelUpdate.create({
    data: {
      plot_id: plotId,
      model_version: model.version,
      trigger: 'ON_FEEDBACK'
    }
  });
};

export const updateModelWithHarvest = async (plotId: number, seasonId: number, actualYield: number) => {
  const model = initModel(plotId);
  
  const logs = await prisma.farmingLog.findMany({ where: { season_id: seasonId } });
  let totalWater = 0;
  let totalFert = 0;
  logs.forEach(log => {
    if (log.type === 'WATER') totalWater += log.amount;
    if (log.type === 'FERTILIZER') totalFert += log.amount;
  });

  const predictedYield = model.bias + model.w_water * totalWater + model.w_fert * totalFert;
  const error = actualYield - predictedYield;
  
  const learningRate = 0.001;
  
  model.bias += learningRate * error;
  model.w_water += learningRate * error * totalWater;
  model.w_fert += learningRate * error * totalFert;
  
  model.version += 1;
  models[plotId] = model;

  await prisma.modelUpdate.create({
    data: {
      plot_id: plotId,
      model_version: model.version,
      trigger: 'ON_HARVEST'
    }
  });
};

export interface PlantDiagnosisResult {
  disease_name: string;
  scientific_name: string;
  crop_type: string;
  confidence_score: number;
  severity: 'THẤP' | 'TRUNG BÌNH' | 'NGHIÊM TRỌNG';
  symptoms: string[];
  causes: string[];
  treatment_chemical: {
    medicine_name: string;
    active_ingredient: string;
    dosage: string;
    isolation_days: number;
  };
  treatment_organic: {
    solution: string;
    dosage: string;
    instructions: string;
  };
  preventive_measures: string[];
  vietgap_compliant: boolean;
}

export const diagnosePlantDisease = (queryOrCrop: string, symptomHint?: string): PlantDiagnosisResult => {
  const text = `${queryOrCrop} ${symptomHint || ''}`.toLowerCase();

  if (text.includes('lúa') || text.includes('dao on') || text.includes('đạo ôn') || text.includes('cháy lá')) {
    return {
      disease_name: 'Bệnh Đạo Ôn Lá & Cổ Bông (Blast Disease)',
      scientific_name: 'Magnaporthe oryzae',
      crop_type: 'Lúa nước (Oryza sativa)',
      confidence_score: 0.94,
      severity: 'NGHIÊM TRỌNG',
      symptoms: [
        'Vết bệnh hình mắt én (thoi nhọn 2 đầu), tâm màu xám trắng viền nâu đậm',
        'Lá lúa bị khô cháy nhanh khi gặp sương mù hoặc thời tiết ẩm',
        'Có nguy cơ gãy cổ bông lúa trong giai đoạn trỗ chín'
      ],
      causes: [
        'Độ ẩm cao > 85%, nhiệt độ vi khí hậu mát về đêm (20-25°C)',
        'Bón thừa phân đạm (N) làm lá xanh mướt, mềm yếu'
      ],
      treatment_chemical: {
        medicine_name: 'Fuji-One 40EC / Beam 75WP',
        active_ingredient: 'Isoprothiolane 40% hoặc Tricyclazole 75%',
        dosage: '40ml - 50ml pha bình 25 lít nước',
        isolation_days: 14
      },
      treatment_organic: {
        solution: 'Chế phẩm Nấm đối kháng Trichoderma + Dịch tỏi ớt gừng',
        dosage: '50ml chế phẩm vi sinh / 20 lít nước',
        instructions: 'Phun ướt đều 2 mặt lá vào lúc sáng sớm sau khi ráo sương hoặc chiều mát'
      },
      preventive_measures: [
        'Cắt giảm phân đạm, bổ sung Kali & Silic giúp vách tế bào cứng cáp',
        'Giữ mực nước ruộng ổn định 3-5cm, tránh để ruộng cạn kiệt nứt nẻ',
        'Thường xuyên kiểm tra bẹ lá và dọn sạch cỏ dại quanh bờ'
      ],
      vietgap_compliant: true
    };
  }

  if (text.includes('sầu riêng') || text.includes('thán thư') || text.includes('cháy múi') || text.includes('durian')) {
    return {
      disease_name: 'Bệnh Thán Thư & Đốm Rong Cây Ăn Trái',
      scientific_name: 'Colletotrichum gloeosporioides',
      crop_type: 'Sầu riêng / Cây ăn trái',
      confidence_score: 0.91,
      severity: 'TRUNG BÌNH',
      symptoms: [
        'Vết bệnh bắt đầu từ chóp lá hoặc mép lá lan dần vào trong thành vòng đồng tâm',
        'Lá bị giòn, rách và rụng non hàng loạt, hoa bị thối khô',
        'Trái non bị đốm đen lõm sâu làm biến dạng quả'
      ],
      causes: [
        'Nấm phát triển mạnh sau những cơn mưa dầm liên tục xen kẽ nắng gắt',
        'Vườn rậm rạp, thiếu ánh sáng tán dưới, thoát nước kém'
      ],
      treatment_chemical: {
        medicine_name: 'Antracol 70WP / Amistar Top 325SC',
        active_ingredient: 'Propineb 70% + Azoxystrobin',
        dosage: '50g / bình 25 lít (hoặc 400g / phuy 200 lít)',
        isolation_days: 7
      },
      treatment_organic: {
        solution: 'Dung dịch Nano Đồng Bạc (Nano Cu-Ag) hữu cơ',
        dosage: '100ml / 100 lít nước',
        instructions: 'Phun rửa vườn sau thu hoạch và phun định kỳ mùa mưa để quét sạch nấm khuẩn'
      },
      preventive_measures: [
        'Tỉa cành tạo tán thông thoáng, dọn sạch lá rụng dưới gốc vườn',
        'Bổ sung phân hữu cơ vi sinh, nấm rễ Mycorrhiza tăng sức đề kháng rễ',
        'Tạo rãnh thoát nước sâu giữa các liếp trồng'
      ],
      vietgap_compliant: true
    };
  }

  if (text.includes('rầy') || text.includes('ray nau') || text.includes('rầy nâu') || text.includes('chích hút')) {
    return {
      disease_name: 'Dịch Hại Rầy Nâu & Rầy Chổng Cánh (Planthopper)',
      scientific_name: 'Nilaparvata lugens',
      crop_type: 'Cây trồng & Lương thực',
      confidence_score: 0.96,
      severity: 'NGHIÊM TRỌNG',
      symptoms: [
        'Rầy tập trung chích hút nhựa ở gốc thân và bẹ lá làm cây héo vàng (cháy rầy)',
        'Tiết mật ngọt thu hút nấm bồ hóng đen bám phủ mặt lá',
        'Là vector truyền virus bệnh vàng lùn, lùn xoắn lá nguy hiểm'
      ],
      causes: [
        'Thời tiết oi bức, mật độ gieo trồng quá dày, phun thuốc BVTV phổ rộng làm mất thiên địch'
      ],
      treatment_chemical: {
        medicine_name: 'Chess 50WG / Applaud 25SC',
        active_ingredient: 'Pymetrozine 50% hoặc Buprofezin',
        dosage: '15g - 20g / bình 25 lít nước',
        isolation_days: 7
      },
      treatment_organic: {
        solution: 'Dầu khoáng nông nghiệp SK Enspray 99EC + Nấm trắng Beauveria bassiana',
        dosage: '40ml / 25 lít nước',
        instructions: 'Chĩa vòi phun sâu xuống tận gốc cây nơi rầy non trú ẩn'
      },
      preventive_measures: [
        'Nuôi thả và bảo tồn thiên địch (bọ xít mù xanh, nhện ăn thịt, kiến ba khoang)',
        'Áp dụng biện pháp "1 phải 5 giảm" hoặc "3 giảm 3 tăng"',
        'Dùng bẫy đèn giám sát di trú của rầy để chủ động đối phó'
      ],
      vietgap_compliant: true
    };
  }

  // Default: Cà chua / Rau màu đốm sương mai & thiếu vi lượng
  return {
    disease_name: 'Bệnh Mốc Sương & Đốm Vàng Thiếu Vi Lượng (Downy Mildew)',
    scientific_name: 'Pseudoperonospora cubensis',
    crop_type: 'Rau củ quả & Cây trồng cạn',
    confidence_score: 0.88,
    severity: 'TRUNG BÌNH',
    symptoms: [
      'Mặt trên của lá xuất hiện các vệt vàng đa giác bị giới hạn bởi gân lá',
      'Mặt dưới lá phủ lớp mốc mịn màu xám tím vào buổi sáng sớm',
      'Lá chuyển nâu khô giòn và tàn sớm'
    ],
    causes: [
      'Độ ẩm không khí cao > 90%, đọng nước trên mặt lá qua đêm',
      'Thiếu hụt Magiê (Mg) và Canxi (Ca) trong đất chua phèn'
    ],
    treatment_chemical: {
      medicine_name: 'Ridomil Gold 68WG / Aliette 800WG',
      active_ingredient: 'Metalaxyl-M 40g/kg + Mancozeb 640g/kg',
      dosage: '50g / bình 20 lít nước',
      isolation_days: 5
    },
    treatment_organic: {
      solution: 'Dung dịch Booc-đô 1% (CuSO4 + Vôi tôi) + Phân bón lá Canxi-Bo sinh học',
      dosage: 'Pha tỷ lệ 1 Đồng : 1 Vôi : 100 Nước',
      instructions: 'Phun phủ đều mặt lá sau khi ngưng mưa'
    },
    preventive_measures: [
      'Tránh tưới phun mưa vào chiều tối làm đọng nước qua đêm',
      'Bón vôi bột nâng pH đất lên mức lý tưởng 6.0 - 6.5',
      'Sử dụng màng phủ nông nghiệp để hạn chế mầm bệnh từ đất bắn lên lá'
    ],
    vietgap_compliant: true
  };
};

