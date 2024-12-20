import Ride from '../models/Ride.js';
import mongoose from 'mongoose';

// Approve a passenger
export const approvePassenger = async (req, res) => {
  const { rideId, passengerId } = req.params;

  try {
    const ride = await Ride.findById(rideId);

    // Only the driver can approve passengers
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'You are not the driver of this ride' });
    }

    const passenger = ride.passengers.id(passengerId);

    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }

    passenger.approval = true; // Approve the passenger
    await ride.save();
    res.status(200).json({ message: 'Passenger approved', ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a passenger
export const rejectPassenger = async (req, res) => {
  const { rideId, passengerId } = req.params;

  try {
    const ride = await Ride.findById(rideId);

    // Only the driver can reject passengers
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'You are not the driver of this ride' });
    }

    const passengerIndex = ride.passengers.findIndex(
      (p) => p.user.toString() === passengerId
    );

    if (passengerIndex === -1) {
      return res.status(404).json({ message: 'Passenger not found' });
    }

    ride.passengers.splice(passengerIndex, 1); // Remove passenger from ride
    await ride.save();
    res.status(200).json({ message: 'Passenger rejected', ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addPassenger = async (req, res) => {
  try {
    const { rideId, passengerData } = req.body; // Destructure rideId and passengerData from the request body

    // Validate the rideId to ensure it is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({ message: 'Invalid rideId format' });
    }

    // Check if the ride exists in the database
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Create a new passenger entry to be added to the ride
    const newPassenger = {
      user: passengerData.user, // Get the user from the request object (assuming the user is authenticated)
      location: passengerData.location,
      phoneNumber: passengerData.phoneNumber,
    };

    // Add the new passenger to the ride's passenger list
    ride.customerRequests.push(newPassenger);

    // Save the updated ride
    await ride.save();

    // Respond with success message
    return res
      .status(200)
      .json({ message: 'Passenger added successfully', ride });
  } catch (error) {
    console.error('Error adding passenger:', error);
    return res.status(500).json({ message: 'Failed to add passenger' });
  }
};
