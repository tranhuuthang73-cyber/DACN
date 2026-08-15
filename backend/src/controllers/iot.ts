import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { getWeatherForecast } from '../ai/model';

// Simulation state for plot soil & irrigation pumps

interface PlotIoTState {
  soil_moisture: number; // percentage (0-100)
  soil_ph: number;       // pH level (4.0 - 8.5)
  temp_c: number;        // Temperature
  humidity_pct: number;  // Air humidity
  light_lux: number;     // Lux
  nitrogen_ppm: number;  // N mg/kg
  phosphorus_ppm: number;// P mg/kg
  potassium_ppm: number; // K mg/kg
  pump_active: boolean;  // true if watering right now
  last_watered: string;
}

const plotIoTMemory: Record<number, PlotIoTState> = {};

const getOrInitIoTState = (plotId: number): PlotIoTState => {
  if (!plotIoTMemory[plotId]) {
    // Generate realistic starting state based on plot ID
    const seed = (plotId * 17) % 20;
    plotIoTMemory[plotId] = {
      soil_moisture: 38 + (seed % 15), // e.g. 38% - 53%
      soil_ph: Number((6.2 + (seed % 8) * 0.1).toFixed(1)), // 6.2 - 6.9
      temp_c: 31.5 + (seed % 4) * 0.5, // ~32-33°C
      humidity_pct: 64 + (seed % 10),
      light_lux: 48000 + (seed * 1200),
      nitrogen_ppm: 142 + (seed * 5),
      phosphorus_ppm: 38 + (seed * 2),
      potassium_ppm: 185 + (seed * 6),
      pump_active: false,
      last_watered: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    };
  }
  return plotIoTMemory[plotId];
};

export const getPlotTelemetry = async (req: AuthRequest, res: Response) => {
  try {
    const plotId = Number(req.params.plotId);
    const plot = await prisma.plot.findUnique({
      where: { id: plotId },
      include: {
        seasons: {
          where: { status: 'PLANNING' },
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });

    if (!plot) {
      return res.status(404).json({ error: 'Thửa đất không tồn tại' });
    }

    if (req.user!.role !== 'ADMIN' && plot.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Không có quyền truy cập thửa đất này' });
    }

    const state = getOrInitIoTState(plotId);
    const liveWeather = await getWeatherForecast(plot.latitude, plot.longitude);

    // Sync live outdoor temp & humidity from real-world Open-Meteo satellite
    state.temp_c = liveWeather.temp;
    state.humidity_pct = liveWeather.humidity;

    // Realistic dynamic soil moisture behavior influenced by real weather:
    // If it's raining in real life (rainfall_mm > 0), soil moisture goes up naturally!
    if (liveWeather.rainfall_mm > 0 && !state.pump_active) {
      state.soil_moisture = Math.min(85, Number((state.soil_moisture + 2.5).toFixed(1)));
    } else if (!state.pump_active) {
      // Hot outdoor sun accelerates natural soil evaporation
      const sunEvaporation = liveWeather.temp > 32 ? -0.15 : -0.05;
      const drift = (Math.random() - 0.5) * 0.4 + sunEvaporation;
      state.soil_moisture = Math.max(22, Math.min(82, Number((state.soil_moisture + drift).toFixed(1))));
    } else {
      state.soil_moisture = Math.min(85, Number((state.soil_moisture + 1.2).toFixed(1)));
    }

    const moistureStatus = 
      state.soil_moisture < 35 ? 'KHÔ HẠN (CẦN TƯỚI)' :
      state.soil_moisture > 75 ? 'QUÁ ẨM (NGẬP ÚNG)' : 'LÝ TƯỞNG (ĐỦ ẨM)';

    res.json({
      success: true,
      plot_id: plotId,
      plot_name: plot.name,
      telemetry: {
        ...state,
        soil_moisture_status: moistureStatus,
        is_safe_ph: state.soil_ph >= 5.5 && state.soil_ph <= 7.0,
        weather: liveWeather,
        battery_level_pct: 94,
        signal_strength_dbm: -62,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Lỗi lấy dữ liệu IoT:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi lấy dữ liệu cảm biến' });
  }
};


export const triggerSmartIrrigation = async (req: AuthRequest, res: Response) => {
  try {
    const { plot_id, season_id, duration_minutes, amount_liters } = req.body;
    const plotId = Number(plot_id);

    const plot = await prisma.plot.findUnique({ where: { id: plotId } });
    if (!plot) return res.status(404).json({ error: 'Thửa đất không tồn tại' });
    if (req.user!.role !== 'ADMIN' && plot.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Không có quyền điều khiển van tưới' });
    }

    const state = getOrInitIoTState(plotId);
    const waterLiters = Number(amount_liters) || 250;
    const duration = Number(duration_minutes) || 15;

    // Turn on pump in simulation & boost soil moisture
    state.pump_active = true;
    state.soil_moisture = Math.min(80, Number((state.soil_moisture + 18.5).toFixed(1)));
    state.last_watered = new Date().toISOString();

    // Auto reset pump active state after 30 seconds
    setTimeout(() => {
      if (plotIoTMemory[plotId]) {
        plotIoTMemory[plotId].pump_active = false;
      }
    }, 15000);

    // If season_id is provided, automatically record into FarmingLog
    let createdLog = null;
    if (season_id) {
      createdLog = await prisma.farmingLog.create({
        data: {
          season_id: Number(season_id),
          plot_id: plotId,
          type: 'WATER',
          amount: waterLiters,
          unit: 'Lít',
          method: 'Hệ thống tưới tự động IoT (Smart Sprinkler)',
          note: `Tự động kích hoạt tưới ${duration} phút theo cảnh báo độ ẩm cảm biến IoT.`,
          cost_vnd: waterLiters * 15 // ~15đ/Lít điện & nước
        }
      });
    }

    res.json({
      success: true,
      message: `Đã kích hoạt van tưới thông minh cho thửa đất [${plot.name}] trong ${duration} phút.`,
      new_moisture: state.soil_moisture,
      pump_status: 'RUNNING',
      farming_log: createdLog
    });
  } catch (error) {
    console.error('Lỗi kích hoạt tưới:', error);
    res.status(500).json({ error: 'Lỗi kích hoạt van tưới' });
  }
};
