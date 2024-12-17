// models/Ride.js
import mongoose from 'mongoose';

const rideSchema = mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    startLocation: {
      type: String,
      required: true,
    },
    endLocation: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    passengers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model for passengers
      },
    ],
    rideDate: {
      type: Date,
      required: true,
    },
    rideTime: {
      // New field to store the time of the ride
      type: Date,
      required: true,
    },
  },

  { timestamps: true }
);

const Ride = mongoose.model('Ride', rideSchema);

export default Ride;
