import prisma from '../prisma';

type ModelWeights = {
  w_water: number;
  w_fert: number;
  bias: number;
  version: number;
};

// In-memory model weights per plot
const models: Record<number, ModelWeights> = {};

const initModel = (plotId: number): ModelWeights => {
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

export const generateRecommendation = async (plotId: number, seasonId: number, targetYield: number) => {
  const model = initModel(plotId);
  
  // Calculate remaining needs
  // For simplicity, we just recommend a static calculated amount minus what's already applied
  const logs = await prisma.farmingLog.findMany({ where: { season_id: seasonId } });
  let totalWater = 0;
  let totalFert = 0;
  logs.forEach(log => {
    if (log.type === 'WATER') totalWater += log.amount;
    if (log.type === 'FERTILIZER') totalFert += log.amount;
  });

  // A very basic inverse function for demo purposes
  // targetYield = bias + w_water * totalWater + w_fert * totalFert
  // We recommend to split the remaining gap 50/50 between water and fert impacts
  const gap = Math.max(0, targetYield - (model.bias + model.w_water * totalWater + model.w_fert * totalFert));
  
  let recWater = 0;
  let recFert = 0;
  
  if (gap > 0) {
    recWater = (gap / 2) / model.w_water;
    recFert = (gap / 2) / model.w_fert;
  }

  const recs = [];
  if (recWater > 0) recs.push({ type: 'WATER' as const, suggested_amount: recWater, confidence_score: 0.8, model_version: model.version });
  if (recFert > 0) recs.push({ type: 'FERTILIZER' as const, suggested_amount: recFert, confidence_score: 0.8, model_version: model.version });

  return recs;
};

export const updateModelWithFeedback = async (plotId: number, type: 'WATER' | 'FERTILIZER', actualAmount: number, suggestedAmount: number) => {
  const model = initModel(plotId);
  const learningRate = 0.01;
  
  // Simple gradient update: if farmer applied more than suggested, it implies the weight was too low, so we adjust.
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
  
  // Gradient descent
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
