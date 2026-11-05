import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import foodRoutes from './routes/food.js';
import requestRoutes from './routes/requests.js';
import wasteRoutes from './routes/waste.js';
import analyticsRoutes from './routes/analytics.js';
import notifRoutes from './routes/notifications.js';
import './jobs/expiry.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notifRoutes);

app.listen(process.env.PORT, () => console.log(`API on :${process.env.PORT}`));