import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  updatePhoneNumber,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register User
router.post('/register', registerUser);

// Login User
router.post('/login', loginUser);

// Get User Profile
router.get('/me', protect, getUserProfile);

// Update User Profile
router.put('/profile', protect, updateUserProfile);

// Delete User
router.delete('/profile', protect, deleteUser);

// Add phone number
router.put('/updatePhoneNumber', updatePhoneNumber);

export default router;
