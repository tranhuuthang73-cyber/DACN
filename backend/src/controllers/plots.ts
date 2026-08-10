import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const createPlot = async (req: AuthRequest, res: Response) => {
  try {
    const { name, area_m2, soil_type, latitude, longitude } = req.body;
    const plot = await prisma.plot.create({
      data: {
        name,
        area_m2,
        soil_type,
        latitude,
        longitude,
        user_id: req.user!.id
      }
    });
    res.status(201).json(plot);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPlots = async (req: AuthRequest, res: Response) => {
  try {
    const plots = await prisma.plot.findMany({
      where: req.user!.role === 'ADMIN' ? undefined : { user_id: req.user!.id }
    });
    res.json(plots);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPlotById = async (req: AuthRequest, res: Response) => {
  try {
    const plot = await prisma.plot.findUnique({
      where: { id: Number(req.params.id) },
      include: { seasons: true }
    });
    
    if (!plot) return res.status(404).json({ error: 'Plot not found' });
    if (req.user!.role !== 'ADMIN' && plot.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json(plot);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePlot = async (req: AuthRequest, res: Response) => {
  try {
    const plot = await prisma.plot.findUnique({ where: { id: Number(req.params.id) } });
    if (!plot) return res.status(404).json({ error: 'Plot not found' });
    if (req.user!.role !== 'ADMIN' && plot.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedPlot = await prisma.plot.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(updatedPlot);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deletePlot = async (req: AuthRequest, res: Response) => {
  try {
    const plot = await prisma.plot.findUnique({ where: { id: Number(req.params.id) } });
    if (!plot) return res.status(404).json({ error: 'Plot not found' });
    if (req.user!.role !== 'ADMIN' && plot.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.plot.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Plot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
