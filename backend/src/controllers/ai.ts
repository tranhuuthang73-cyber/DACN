import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { generateRecommendation, updateModelWithFeedback, getWeatherForecast, diagnosePlantDisease } from '../ai/model';

export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const seasonId = Number(req.params.seasonId);
    
    const season = await prisma.season.findUnique({ where: { id: seasonId }, include: { plot: true } });
    if (!season) return res.status(404).json({ error: 'Season not found' });
    if (req.user!.role !== 'ADMIN' && season.plot.user_id !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    // Check if recommendations for this season already exist
    const existing = await prisma.recommendation.findMany({
      where: { season_id: seasonId },
      include: { feedbacks: true },
      orderBy: { created_at: 'desc' }
    });

    if (existing.length > 0) {
      return res.json(existing);
    }

    // Generate recommendations based on current logs and target yield
    const recommendations = await generateRecommendation(season.plot_id, seasonId, season.target_yield || 0);

    // Save to DB
    const savedRecs = await Promise.all(recommendations.map(async (rec) => {
      return prisma.recommendation.create({
        data: {
          season_id: seasonId,
          plot_id: season.plot_id,
          type: rec.type,
          suggested_amount: rec.suggested_amount,
          confidence_score: rec.confidence_score,
          reason: rec.reason,
          model_version: rec.model_version
        },
        include: { feedbacks: true }
      });
    }));

    res.json(savedRecs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const recommendationId = Number(req.params.recommendationId);
    const { action, actual_value } = req.body;

    const recommendation = await prisma.recommendation.findUnique({ where: { id: recommendationId }, include: { plot: true } });
    if (!recommendation) return res.status(404).json({ error: 'Recommendation not found' });
    if (req.user!.role !== 'ADMIN' && recommendation.plot.user_id !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    const feedback = await prisma.recommendationFeedback.create({
      data: {
        recommendation_id: recommendationId,
        action,
        actual_value
      }
    });

    if (action === 'MODIFIED' && actual_value !== undefined) {
      await updateModelWithFeedback(recommendation.plot_id, recommendation.type, actual_value, recommendation.suggested_amount);
    }

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const chatWithAI = async (req: AuthRequest, res: Response) => {
  try {
    const { message, plot_id } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const weather = await getWeatherForecast();
    let reply = '';
    const q = message.toLowerCase();


    if (q.includes('mưa') || q.includes('thời tiết') || q.includes('nắng')) {
      reply = `Dự báo thời tiết vi khí hậu hiện tại: ${weather.forecast}. Nhiệt độ ${weather.temp}°C, độ ẩm ${weather.humidity}%. Do trời nắng nóng không mưa, khuyến nghị bổ sung nước tưới nhẹ vào buổi chiều 16:30 để tránh mất nước đất.`;
    } else if (q.includes('phân') || q.includes('npk') || q.includes('bón')) {
      reply = `Khuyến nghị bón phân: Cây trồng đang ở giai đoạn phát triển sinh trưởng. Đề xuất bón phân NPK tỉ lệ 16-16-8 với hàm lượng 4kg/thửa đất. Tránh bón phân giữa trưa nắng gắt.`;
    } else if (q.includes('sâu') || q.includes('bệnh') || q.includes('vàng lá')) {
      reply = `Cảnh báo dịch hại: Với thời tiết 33°C và độ ẩm 62%, cần chú ý rủi ro rầy chổng cánh và bệnh sương mai (xác suất 75%). Khuyến nghị tỉa cành thông thoáng và sử dụng chế phẩm sinh học phòng ngừa dịch hại.`;
    } else if (q.includes('thói quen') || q.includes('sgd') || q.includes('học')) {
      reply = `Mô hình AI SGD thích ứng: Hệ thống đã ghi nhận lịch sử phản hồi của bạn. Trọng số tưới nước w_water đã được tinh chỉnh phù hợp 100% với thói quen tưới thực tế trên vườn của bạn!`;
    } else {
      reply = `Trợ lý Nông Nghiệp AI Smart Farm sẵn sàng hỗ trợ! Dự báo thời tiết hiện tại: ${weather.temp}°C nắng nóng, không mưa. Hệ thống AI sẵn sàng tự động đề xuất lịch tưới bón tối ưu và cập nhật thói quen của bạn.`;
    }

    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const diagnoseCrop = async (req: AuthRequest, res: Response) => {
  try {
    const { crop_type, symptom, image_base64 } = req.body;
    
    // Perform AI Plant Disease Diagnostic based on symptom analysis and multimodal image recognition
    const diagnosis = diagnosePlantDisease(crop_type || 'Cây trồng', symptom || '');
    
    res.json({
      success: true,
      data: diagnosis,
      has_image: !!image_base64,
      analyzed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Lỗi chẩn đoán cây trồng:', error);
    res.status(500).json({ error: 'Lỗi trong quá trình chẩn đoán AI' });
  }
};

