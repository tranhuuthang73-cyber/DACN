import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const getFinancialSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    // Fetch user's plots
    const plots = await prisma.plot.findMany({
      where: isAdmin ? {} : { user_id: userId },
      include: {
        seasons: {
          include: {
            logs: true
          }
        }
      }
    });

    let totalRevenue = 0;
    let totalExpense = 0;
    let totalWaterCost = 0;
    let totalFertilizerCost = 0;
    let totalOtherCost = 0;
    let totalAreaM2 = 0;

    plots.forEach((plot) => {
      totalAreaM2 += plot.area_m2;
      plot.seasons.forEach((season) => {
        // Estimated revenue calculation (50,000 VND / kg if actual_yield exists)
        const unitPrice = season.unit_price_vnd || 45000;
        const revenue = (season.actual_yield || 0) * unitPrice;
        totalRevenue += revenue;

        season.logs.forEach((log) => {
          const cost = log.cost_vnd || 0;
          totalExpense += cost;
          if (log.type === 'WATER') totalWaterCost += cost;
          else if (log.type === 'FERTILIZER') totalFertilizerCost += cost;
          else totalOtherCost += cost;
        });
      });
    });

    const netProfit = totalRevenue - totalExpense;
    const roi = totalExpense > 0 ? Number(((netProfit / totalExpense) * 100).toFixed(1)) : 0;
    const costPerM2 = totalAreaM2 > 0 ? Number((totalExpense / totalAreaM2).toFixed(0)) : 0;

    res.json({
      totalRevenue,
      totalExpense,
      netProfit,
      roi,
      costPerM2,
      totalAreaM2,
      breakdown: {
        water: totalWaterCost,
        fertilizer: totalFertilizerCost,
        other: totalOtherCost
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
