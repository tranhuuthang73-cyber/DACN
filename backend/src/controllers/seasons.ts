import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { updateModelWithHarvest } from '../ai/model';

export const createSeason = async (req: AuthRequest, res: Response) => {
  try {
    const { plot_id, crop_type, planted_date, expected_harvest_date, target_yield } = req.body;
    
    // verify plot ownership
    const plot = await prisma.plot.findUnique({ where: { id: plot_id } });
    if (!plot) return res.status(404).json({ error: 'Plot not found' });
    if (req.user!.role !== 'ADMIN' && plot.user_id !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    const season = await prisma.season.create({
      data: {
        plot_id,
        crop_type,
        planted_date: new Date(planted_date),
        expected_harvest_date: expected_harvest_date ? new Date(expected_harvest_date) : null,
        target_yield
      }
    });
    res.status(201).json(season);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSeasons = async (req: AuthRequest, res: Response) => {
  try {
    const plotId = Number(req.params.plotId);
    const plot = await prisma.plot.findUnique({ where: { id: plotId } });
    if (!plot) return res.status(404).json({ error: 'Plot not found' });
    if (req.user!.role !== 'ADMIN' && plot.user_id !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    const seasons = await prisma.season.findMany({ where: { plot_id: plotId }, orderBy: { created_at: 'desc' } });
    res.json(seasons);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateSeason = async (req: AuthRequest, res: Response) => {
  try {
    const seasonId = Number(req.params.id);
    const { actual_yield, actual_harvest_date, status } = req.body;

    const season = await prisma.season.findUnique({ where: { id: seasonId }, include: { plot: true } });
    if (!season) return res.status(404).json({ error: 'Season not found' });
    if (req.user!.role !== 'ADMIN' && season.plot.user_id !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.season.update({
      where: { id: seasonId },
      data: {
        actual_yield,
        actual_harvest_date: actual_harvest_date ? new Date(actual_harvest_date) : undefined,
        status
      }
    });

    // If harvest data is added, trigger AI update
    if (actual_yield && actual_yield > 0) {
      await updateModelWithHarvest(season.plot_id, seasonId, actual_yield);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
