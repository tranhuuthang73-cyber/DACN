import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { generateRecommendation, updateModelWithFeedback } from '../ai/model';

export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const seasonId = Number(req.params.seasonId);
    
    const season = await prisma.season.findUnique({ where: { id: seasonId }, include: { plot: true } });
    if (!season) return res.status(404).json({ error: 'Season not found' });
    if (req.user!.role !== 'ADMIN' && season.plot.user_id !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

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
          model_version: rec.model_version
        }
      });
    }));

    res.json(savedRecs);
  } catch (error) {
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
