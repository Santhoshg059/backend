import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the schema for the Ride model
const rideSchema = new Schema({
  pickup: { type: String, required: true },
  destination: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  availableSeats: { type: Number, required: true },
  price: { type: Number, required: true },
  userName:{ type: String, required: true },
  userMobileNumber:{ type: Number, required: true },
  userId:{ type: String, required: true },
  notifications: [{
    message: String,
    createdAt: { type: Date, default: Date.now() }
}]
});

// Create and export the Ride model
const RideModel = mongoose.model('Ride', rideSchema);
export default RideModel;