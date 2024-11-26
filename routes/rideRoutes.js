// routes/rideRoutes.js
import express from 'express';
import {
  createRide,
  searchRides,
  bookRide,
  updateRide,
  deleteRide,
} from '../controllers/rideController.js';
import { protect } from '../middleware/authMiddleware.js'; // Protect routes with authentication

const router = express.Router();

// Create a new ride
router.post('/create', protect, createRide);

// Search for rides
router.get('/search', searchRides);

// Book a ride
router.post('/book/:rideId', protect, bookRide);

// Update a ride (only the driver can update)
router.put('/update/:rideId', protect, updateRide);

// Delete a ride (only the driver can delete)
router.delete('/delete/:rideId', protect, deleteRide);

export default router;
