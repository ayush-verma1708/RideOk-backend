// controllers/rideController.js
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
  try {
    const newRide = new Ride({
      driver: req.user._id, // Assume user is authenticated and req.user contains user details
      startLocation,
      endLocation,
      price,
      availableSeats,
      rideDate,
      rideTime, // Added rideTime here
    });

    const ride = await newRide.save();
    res.status(201).json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search for rides
export const searchRides = async (req, res) => {
  const { startLocation, endLocation } = req.query;
  try {
    const rides = await Ride.find({
      startLocation: { $regex: startLocation, $options: 'i' }, // Case insensitive search
      endLocation: { $regex: endLocation, $options: 'i' },
    }).populate('driver', 'name email');

    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book a ride
export const bookRide = async (req, res) => {
  const { rideId } = req.params;
  try {
    const ride = await Ride.findById(rideId);

    // Check if there are available seats
    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: 'No available seats' });
    }

    // Add user to ride's passengers and decrease available seats
    ride.passengers.push(req.user._id);
    ride.availableSeats -= 1;

    await ride.save();
    res.status(200).json({ message: 'Ride booked successfully', ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a ride
export const updateRide = async (req, res) => {
  const { rideId } = req.params;
  const {
    startLocation,
    endLocation,
    price,
    availableSeats,
    rideDate,
    rideTime,
  } = req.body;

  try {
    const ride = await Ride.findById(rideId);

    // Only the driver can update the ride
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'You are not the driver of this ride' });
    }

    ride.startLocation = startLocation || ride.startLocation;
    ride.endLocation = endLocation || ride.endLocation;
    ride.price = price || ride.price;
    ride.availableSeats = availableSeats || ride.availableSeats;
    ride.rideDate = rideDate || ride.rideDate;
    ride.rideTime = rideTime || ride.rideTime; // Updated with rideTime

    await ride.save();
    res.status(200).json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const rides = await Ride.find().populate('driver', 'name email');
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get all rides where the user is either the driver or a passenger
export const getUserRides = async (req, res) => {
  try {
    // Access the logged-in user's ID from the request object (assuming user is authenticated)
    const userId = req.user._id; // The user's ID should be set by your authentication middleware

    // Check if userId exists
    if (!userId) {
      console.error('User ID not found in request');
      return res.status(400).json({ message: 'User not authenticated' });
    }

    // Fetch rides where the user is either the driver or a passenger
    const rides = await Ride.find({
      $or: [
        { driver: userId }, // User is the driver
        { passengers: userId }, // User is a passenger
      ],
    })
      .populate('driver', 'name email') // Populate the driver's details
      .populate('passengers', 'name email'); // Populate the passengers' details

    // If no rides are found, return a 404 error
    if (!rides || rides.length === 0) {
      console.log('No rides found for this user.');
      return res.status(404).json({ message: 'No rides found for this user.' });
    }

    // Send the rides in the response
    return res.status(200).json(rides);
  } catch (error) {
    // Log the error details for debugging
    console.error('Error occurred while fetching user rides:', error);
    return res
      .status(500)
      .json({ message: 'An error occurred while fetching rides.' });
  }
};
