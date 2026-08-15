import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import plotRoutes from './routes/plots';
import seasonRoutes from './routes/seasons';
import logRoutes from './routes/logs';
import aiRoutes from './routes/ai';
import adminRoutes from './routes/admin';
import financialsRoutes from './routes/financials';
import iotRoutes from './routes/iot';
import expertRoutes from './routes/expert';
import cropTrackerRoutes from './routes/cropTracker';
import cropPhysicsRoutes from './routes/cropPhysics';
import telegramBotRoutes from './routes/telegramBot';
import zaloBotRoutes from './routes/zaloBot';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plots', plotRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/financials', financialsRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/expert', expertRoutes);
app.use('/api/crop-tracker', cropTrackerRoutes);
app.use('/api/crop-physics', cropPhysicsRoutes);
app.use('/api/telegram-bot', telegramBotRoutes);
app.use('/api/zalo-bot', zaloBotRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
