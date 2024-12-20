import express from 'express';
import {
  addPassenger,
  approvePassenger,
  rejectPassenger,
} from '../controllers/DriverControlsController.js'; // Import the controller functions
import { protect } from '../middleware/authMiddleware.js'; // Authentication middleware

const router = express.Router();

// Apply authentication middleware to all routes (optional, only if you want all of them protected)
// router.use(protect);

// Route to add a passenger to a ride (PUT request)
router.put('/add-passenger', addPassenger);

// Route to approve a passenger (PUT request)
router.put('/approve-passenger/:rideId/:passengerId', approvePassenger);

// Route to reject a passenger (DELETE request)
router.delete('/reject-passenger/:rideId/:passengerId', rejectPassenger);

export default router;
