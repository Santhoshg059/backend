import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Counts: {
        type: Number,
        required: true
    },
    ReqById: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    returnNotification: {
        type: String,
        
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;