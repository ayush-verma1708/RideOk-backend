import Ride from '../models/Ride.js';

// Create a new ride
export const createRide = async (req, res) => {
  const {
    startLocation,
    endLocation,
    price,
    availableSeats,
    rideDate,
    rideTime,
  } = req.body;

  // Input validation
  if (
    !startLocation ||
    !endLocation ||
    !price ||
    !availableSeats ||
    !rideDate ||
    !rideTime
  ) {
    return res
      .status(400)
      .json({ message: 'All fields are required to create a ride.' });
  }

  if (availableSeats <= 0) {
    return res
      .status(400)
      .json({ message: 'Available seats must be at least 1.' });
  }

  if (price <= 0) {
    return res.status(400).json({ message: 'Price must be greater than 0.' });
  }

  try {
    // Check if the user is authenticated
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User not logged in.' });
    }

    // Create a new ride instance
    const newRide = new Ride({
      driver: req.user._id, // User ID of the authenticated user
      startLocation,
      endLocation,
      price,
      availableSeats,
      rideDate,
      rideTime,
    });

    // Save the new ride to the database
    const ride = await newRide.save();

    res.status(201).json({
      message: 'Ride created successfully.',
      ride,
    });
  } catch (error) {
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Validation Error', errors });
    }

    // General error fallback
    console.error('Error creating ride:', error);
    res.status(500).json({
      message: 'An internal server error occurred. Please try again later.',
    });
  }
};

// // Search for rides
export const searchRides = async (req, res) => {
  const { startLocation, endLocation } = req.query;

  try {
    // Get current date and time
    const currentTime = new Date();

    // Search for rides based on locations and future ride time
    const rides = await Ride.find({
      startLocation: { $regex: startLocation, $options: 'i' }, // Case insensitive search
      endLocation: { $regex: endLocation, $options: 'i' },
      rideTime: { $gte: currentTime }, // Filter for rides that are in the future
    }).populate('driver', 'name email');

    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book a ride (with automatic approval)
export const bookRide = async (req, res) => {
  const { rideId } = req.params;
  try {
    const ride = await Ride.findById(rideId);

    // Check if there are available seats
    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: 'No available seats' });
    }

    // Add user to ride's passengers
    ride.passengers.push({
      user: req.user._id,
      phoneNumber: req.user.phoneNumber,
      location: req.user.location,
      approval: true, // Automatically approve the passenger when booking
    });

    // Decrease available seats
    ride.availableSeats -= 1;

    await ride.save();
    res.status(200).json({ message: 'Ride booked successfully', ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a ride
// export const updateRide = async (req, res) => {
//   const { rideId } = req.params;
//   const {
//     startLocation,
//     endLocation,
//     price,
//     availableSeats,
//     rideDate,
//     rideTime,
//   } = req.body;

//   try {
//     const ride = await Ride.findById(rideId);

//     // Only the driver can update the ride
//     if (ride.driver.toString() !== req.user._id.toString()) {
//       return res
//         .status(403)
//         .json({ message: 'You are not the driver of this ride' });
//     }

//     ride.startLocation = startLocation || ride.startLocation;
//     ride.endLocation = endLocation || ride.endLocation;
//     ride.price = price || ride.price;
//     ride.availableSeats = availableSeats || ride.availableSeats;
//     ride.rideDate = rideDate || ride.rideDate;
//     ride.rideTime = rideTime || ride.rideTime;

//     await ride.save();
//     res.status(200).json(ride);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const updateRide = async (req, res) => {
  const { rideId } = req.params;
  const {
    startLocation,
    endLocation,
    price,
    availableSeats,
    rideDate,
    rideTime,
    isExpired, // Adding this to handle expiration status
  } = req.body;

  try {
    // Find the ride by its ID
    const ride = await Ride.findById(rideId);

    // Check if the ride exists
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Only the driver can update the ride
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'You are not the driver of this ride' });
    }

    // Update the ride details, using the incoming data or keeping the current values
    ride.startLocation = startLocation || ride.startLocation;
    ride.endLocation = endLocation || ride.endLocation;
    ride.price = price || ride.price;
    ride.availableSeats = availableSeats || ride.availableSeats;
    ride.rideDate = rideDate || ride.rideDate;
    ride.rideTime = rideTime || ride.rideTime;
    ride.isExpired = isExpired !== undefined ? isExpired : ride.isExpired; // Update the expiration status if provided

    // Save the updated ride
    await ride.save();

    res.status(200).json(ride); // Return the updated ride
  } catch (error) {
    res.status(500).json({ message: error.message }); // Catch and handle errors
  }
};

// Delete a ride
export const deleteRide = async (req, res) => {
  const { rideId } = req.params;

  try {
    const ride = await Ride.findById(rideId);

    // Only the driver can delete the ride
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'You are not the driver of this ride' });
    }

    await ride.remove();
    res.status(200).json({ message: 'Ride deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ride details
export const getRideDetails = async (req, res) => {
  const { rideId } = req.params;

  try {
    const ride = await Ride.findById(rideId).populate('driver', 'name email');
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.status(200).json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all rides
export const getAllRides = async (req, res) => {
  try {
    const currentTime = new Date();

    // Find rides where rideTime is greater than or equal to the current time
    const rides = await Ride.find({
      rideTime: { $gte: currentTime },
      isExpired: false,
    }).populate('driver', 'name email');

    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all rides where the user is either the driver or a passenger
// export const getUserRides = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     if (!userId) {
//       return res.status(400).json({ message: 'User not authenticated' });
//     }

//     const currentTime = new Date();

//     const rides = await Ride.find({
//       $or: [{ driver: userId }, { passengers: userId }],
//       rideTime: { $gte: currentTime },
//     })
//       .populate('driver', 'name email')
//       .populate('passengers', 'name email');

//     if (!rides || rides.length === 0) {
//       return res
//         .status(404)
//         .json({ message: 'No future rides found for this user.' });
//     }

//     return res.status(200).json(rides);
//   } catch (error) {
//     console.error('Error occurred while fetching user rides:', error);
//     return res
//       .status(500)
//       .json({ message: 'An error occurred while fetching rides.' });
//   }
// };
export const getUserRides = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const currentTime = new Date();

    const rides = await Ride.find({
      $or: [
        { driver: userId }, // User is the driver
        { 'passengers.user': userId }, // User is a passenger
        { 'customerRequests.user': userId }, // User has requested a ride
      ],
      rideTime: { $gte: currentTime }, // Only future rides
    })
      .populate('driver', 'name email') // Populate driver details
      .populate('passengers.user', 'name email') // Populate passenger details
      .populate('customerRequests.user', 'name email'); // Populate customer request details

    if (!rides || rides.length === 0) {
      return res
        .status(404)
        .json({ message: 'No future rides found for this user.' });
    }

    return res.status(200).json(rides);
  } catch (error) {
    console.error('Error occurred while fetching user rides:', error);
    return res
      .status(500)
      .json({ message: 'An error occurred while fetching rides.' });
  }
};

// controllers/rideController.js

// // controllers/rideController.js
// import Ride from '../models/Ride.js';

// // Create a new ride
// export const createRide = async (req, res) => {
//   const {
//     startLocation,
//     endLocation,
//     price,
//     availableSeats,
//     rideDate,
//     rideTime,
//   } = req.body;

//   // Input validation
//   if (
//     !startLocation ||
//     !endLocation ||
//     !price ||
//     !availableSeats ||
//     !rideDate ||
//     !rideTime
//   ) {
//     return res
//       .status(400)
//       .json({ message: 'All fields are required to create a ride.' });
//   }

//   if (availableSeats <= 0) {
//     return res
//       .status(400)
//       .json({ message: 'Available seats must be at least 1.' });
//   }

//   if (price <= 0) {
//     return res.status(400).json({ message: 'Price must be greater than 0.' });
//   }

//   try {
//     // Check if the user is authenticated
//     if (!req.user || !req.user._id) {
//       return res
//         .status(401)
//         .json({ message: 'Unauthorized: User not logged in.' });
//     }

//     // Create a new ride instance
//     const newRide = new Ride({
//       driver: req.user._id, // User ID of the authenticated user
//       startLocation,
//       endLocation,
//       price,
//       availableSeats,
//       rideDate,
//       rideTime,
//     });

//     // Save the new ride to the database
//     const ride = await newRide.save();

//     res.status(201).json({
//       message: 'Ride created successfully.',
//       ride,
//     });
//   } catch (error) {
//     // Handle specific validation errors
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map((err) => err.message);
//       return res.status(400).json({ message: 'Validation Error', errors });
//     }

//     // General error fallback
//     console.error('Error creating ride:', error);
//     res.status(500).json({
//       message: 'An internal server error occurred. Please try again later.',
//     });
//   }
// };

// // Book a ride
// export const bookRide = async (req, res) => {
//   const { rideId } = req.params;
//   try {
//     const ride = await Ride.findById(rideId);

//     // Check if there are available seats
//     if (ride.availableSeats <= 0) {
//       return res.status(400).json({ message: 'No available seats' });
//     }

//     // Add user to ride's passengers and decrease available seats
//     ride.passengers.push(req.user._id);
//     ride.availableSeats -= 1;

//     await ride.save();
//     res.status(200).json({ message: 'Ride booked successfully', ride });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update a ride
// export const updateRide = async (req, res) => {
//   const { rideId } = req.params;
//   const {
//     startLocation,
//     endLocation,
//     price,
//     availableSeats,
//     rideDate,
//     rideTime,
//   } = req.body;

//   try {
//     const ride = await Ride.findById(rideId);

//     // Only the driver can update the ride
//     if (ride.driver.toString() !== req.user._id.toString()) {
//       return res
//         .status(403)
//         .json({ message: 'You are not the driver of this ride' });
//     }

//     ride.startLocation = startLocation || ride.startLocation;
//     ride.endLocation = endLocation || ride.endLocation;
//     ride.price = price || ride.price;
//     ride.availableSeats = availableSeats || ride.availableSeats;
//     ride.rideDate = rideDate || ride.rideDate;
//     ride.rideTime = rideTime || ride.rideTime; // Updated with rideTime

//     await ride.save();
//     res.status(200).json(ride);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete a ride
// export const deleteRide = async (req, res) => {
//   const { rideId } = req.params;

//   try {
//     const ride = await Ride.findById(rideId);

//     // Only the driver can delete the ride
//     if (ride.driver.toString() !== req.user._id.toString()) {
//       return res
//         .status(403)
//         .json({ message: 'You are not the driver of this ride' });
//     }

//     await ride.remove();
//     res.status(200).json({ message: 'Ride deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get ride details
// export const getRideDetails = async (req, res) => {
//   const { rideId } = req.params;

//   try {
//     const ride = await Ride.findById(rideId).populate('driver', 'name email');
//     if (!ride) {
//       return res.status(404).json({ message: 'Ride not found' });
//     }

//     res.status(200).json(ride);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // // Get all rides
// // export const getAllRides = async (req, res) => {
// //   try {
// //     const rides = await Ride.find().populate('driver', 'name email');
// //     res.status(200).json(rides);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // Get all rides
// export const getAllRides = async (req, res) => {
//   try {
//     // Get current date and time
//     const currentTime = new Date();

//     // Find rides where rideTime is greater than or equal to the current time
//     const rides = await Ride.find({
//       rideTime: { $gte: currentTime },
//     }).populate('driver', 'name email');

//     res.status(200).json(rides);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Controller to get all rides where the user is either the driver or a passenger
// // export const getUserRides = async (req, res) => {
// //   try {
// //     // Access the logged-in user's ID from the request object (assuming user is authenticated)
// //     const userId = req.user._id; // The user's ID should be set by your authentication middleware

// //     // Check if userId exists
// //     if (!userId) {
// //       console.error('User ID not found in request');
// //       return res.status(400).json({ message: 'User not authenticated' });
// //     }

// //     // Fetch rides where the user is either the driver or a passenger
// //     const rides = await Ride.find({
// //       $or: [
// //         { driver: userId }, // User is the driver
// //         { passengers: userId }, // User is a passenger
// //       ],
// //     })
// //       .populate('driver', 'name email') // Populate the driver's details
// //       .populate('passengers', 'name email'); // Populate the passengers' details

// //     // If no rides are found, return a 404 error
// //     if (!rides || rides.length === 0) {
// //       return res.status(404).json({ message: 'No rides found for this user.' });
// //     }

// //     // Send the rides in the response
// //     return res.status(200).json(rides);
// //   } catch (error) {
// //     // Log the error details for debugging
// //     console.error('Error occurred while fetching user rides:', error);
// //     return res
// //       .status(500)
// //       .json({ message: 'An error occurred while fetching rides.' });
// //   }
// // };
// export const getUserRides = async (req, res) => {
//   try {
//     // Access the logged-in user's ID from the request object (assuming user is authenticated)
//     const userId = req.user._id; // The user's ID should be set by your authentication middleware

//     // Check if userId exists
//     if (!userId) {
//       console.error('User ID not found in request');
//       return res.status(400).json({ message: 'User not authenticated' });
//     }

//     // Get current date and time
//     const currentTime = new Date();

//     // Fetch future rides where the user is either the driver or a passenger
//     const rides = await Ride.find({
//       $or: [
//         { driver: userId }, // User is the driver
//         { passengers: userId }, // User is a passenger
//       ],
//       rideTime: { $gte: currentTime }, // Only fetch rides with a future rideTime
//     })
//       .populate('driver', 'name email') // Populate the driver's details
//       .populate('passengers', 'name email'); // Populate the passengers' details

//     // If no rides are found, return a 404 error
//     if (!rides || rides.length === 0) {
//       return res
//         .status(404)
//         .json({ message: 'No future rides found for this user.' });
//     }

//     // Send the rides in the response
//     return res.status(200).json(rides);
//   } catch (error) {
//     // Log the error details for debugging
//     console.error('Error occurred while fetching user rides:', error);
//     return res
//       .status(500)
//       .json({ message: 'An error occurred while fetching rides.' });
//   }
// };
