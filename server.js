import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import DriverControlRoutes from './routes/DriverControlsRoutes.js';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Use CORS middleware
app.use(cors());

// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Use User Routes
app.use('/api/users', userRoutes);
// Routes
app.use('/api/rides', rideRoutes);

app.use('/api/driver', DriverControlRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
