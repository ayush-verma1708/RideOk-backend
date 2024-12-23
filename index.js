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

const corsOptions = {
  origin: 'https://rideok-new.vercel.app', // Allow only your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Use CORS middleware
app.use(cors(corsOptions)); // Use the custom CORS configuration

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
