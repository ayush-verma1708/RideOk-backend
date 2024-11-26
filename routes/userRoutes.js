import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register User
router.post('/register', registerUser);

// Login User
router.post('/login', loginUser);

// Get User Profile
router.get('/profile', protect, getUserProfile);

// Update User Profile
router.put('/profile', protect, updateUserProfile);

// Delete User
router.delete('/profile', protect, deleteUser);

export default router;
