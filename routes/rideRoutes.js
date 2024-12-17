// routes/rideRoutes.js
import express from 'express';
import {
  createRide,
  searchRides,
  bookRide,
  updateRide,
  deleteRide,
  getRideDetails,
  getAllRides,
  getUserRides,
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

// Get a ride by ID
router.get('/rideId/:rideId', getRideDetails);

// Get all rides
router.get('/', getAllRides);

// get all rides where the user is either the driver or a passenger
router.get('/user-rides', protect, getUserRides);

export default router;
