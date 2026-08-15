import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const createLog = async (req: AuthRequest, res: Response) => {
  try {
    const { season_id, type, amount, unit, method, note, logged_at } = req.body;
    
    const season = await prisma.season.findUnique({ where: { id: season_id }, include: { plot: true } });
    if (!season) return res.status(404).json({ error: 'Season not found' });
    if (req.user!.role !== 'ADMIN' && season.plot.user_id !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    let costVnd = 0;
    if (type === 'WATER') costVnd = amount * 10;
    else if (type === 'FERTILIZER') costVnd = amount * 25000;
    else costVnd = (amount || 1) * 50000;

    const log = await prisma.farmingLog.create({
      data: {
        season_id,
        plot_id: season.plot_id,
        type,
        amount,
        unit,
        method,
        note,
        cost_vnd: costVnd,
        logged_at: logged_at ? new Date(logged_at) : undefined
      }
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getLogsBySeason = async (req: AuthRequest, res: Response) => {
  try {
    const seasonId = Number(req.params.seasonId);
    
    const season = await prisma.season.findUnique({ where: { id: seasonId }, include: { plot: true } });
    if (!season) return res.status(404).json({ error: 'Season not found' });
    if (req.user!.role !== 'ADMIN' && season.plot.user_id !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    const logs = await prisma.farmingLog.findMany({
      where: { season_id: seasonId },
      orderBy: { logged_at: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
