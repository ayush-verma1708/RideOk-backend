// markExpiredRides.js (for scheduled tasks)
import Ride from '../models/Ride.js';

const checkAndMarkExpiredRides = async () => {
  console.log('function running');
  try {
    const batchSize = 100; // Process 100 rides at a time
    let expiredRides;
    let processed = 0;

    do {
      expiredRides = await Ride.find(
        {
          rideTime: { $lt: new Date() },
          isExpired: false,
        },
        null,
        { limit: batchSize } // Limit to 100 rides at a time
      );

      if (expiredRides.length) {
        await Ride.updateMany(
          { _id: { $in: expiredRides.map((ride) => ride._id) } },
          { $set: { isExpired: true } }
        );
        processed += expiredRides.length;
        console.log(`Processed ${processed} expired rides...`);
      }
    } while (expiredRides.length > 0); // Continue until no more expired rides

    console.log(`Marked a total of ${processed} rides as expired.`);
  } catch (error) {
    console.error('Error in checking expired rides:', error);
  }
};

// Use a cron job or task scheduler to call this function periodically
setInterval(checkAndMarkExpiredRides, 60000); // Runs every minute
