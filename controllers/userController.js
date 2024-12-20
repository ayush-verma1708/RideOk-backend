import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Register User
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    // Generate JWT token after registration
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION || '30d',
    });

    res.status(201).json({
      token, // Include token in the response
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    // Improved error handling
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

// Login User
// Login User (Controller - backend)
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION || '30d',
    });

    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.remove();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};
// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

// Add phone number
export const updatePhoneNumber = async (req, res) => {
  const { userId, phoneNumber } = req.body;
  console.log(userId, phoneNumber);

  if (!userId || !phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'User ID and phone number are required.',
    });
  }

  try {
    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }

    // Update the phone number
    user.phoneNumber = phoneNumber;
    await user.save(); // Save the updated user document

    // Return a success response with the updated user data or a success message
    res.status(200).json({
      success: true,
      message: 'Phone number updated successfully.',
    });
  } catch (error) {
    console.error('Error updating phone number:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// export const updatePhoneNumber = async (req, res) => {
//   const { userId, phoneNumber } = req.body;
//   console.log(userId, phoneNumber);
//   if (!userId || !phoneNumber) {
//     return res.status(400).json({
//       success: false,
//       message: 'User ID and phone number are required.',
//     });
//   }

//   try {
//     // Update the phone number in your database (this example assumes MongoDB with Mongoose)
//     const user = await User.findById(userId);
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'User not found.' });
//     }

//     user.phoneNumber = phoneNumber;
//     await user.save();

//     res.status(200);
//   } catch (error) {
//     console.error('Error updating phone number:', error);
//     res.status(500).json({ success: false, message: 'Internal server error.' });
//   }
// };

// Controller to update user's phone number
// export const updatePhoneNumber = async (req, res) => {
//   const { userId, phoneNumber } = req.body;

//   try {
//     // Find the user by userId
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     // Update the user's phone number
//     user.phoneNumber = phoneNumber;
//     await user.save();

//     // Respond with success
//     return res
//       .status(200)
//       .json({ message: 'Phone number updated successfully.' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Server error.' });
//   }
// };
