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
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the User model for passengers
        },
        phoneNumber: {
          type: String, // Store phone number directly in the passengers array
          // required: true,
        },
        location: {
          type: String, // Store location directly in the passengers array
          // required: true,
        },
        approval: {
          type: Boolean,
          default: false, // Initially, passengers are not approved
        },
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
    isExpired: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

const Ride = mongoose.model('Ride', rideSchema);

export default Ride;
