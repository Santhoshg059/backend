// server.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import UserModel from './src/models/user.js';
import bcrypt from 'bcryptjs';
import RideModel from './src/models/ride.js';
import jwt from 'jsonwebtoken'; // Import jwt library for backend
import NotificationModel from './src/models/notification.js';
import multer from 'multer';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();
app.use(cors());
app.use(express.json());
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect("mongodb+srv://santhoshg059:admin059@cluster0.uesuzwj.mongodb.net/comrade");

const generateToken = (userId, name) => {
    return jwt.sign(
        { userId, name },
        process.env.JWT_SECRET,
        { expiresIn: '1d' } // Set expiry time for 1 day
    );
};

app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(401).json({ error: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Incorrect password' });

        // Generate JWT token with user ID and name
        const token = generateToken(user._id, user.name);
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post('/user', async (req, res) => {
    const { name, mobileNumber, email, password } = req.body;
    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json("User already exists");
        }
        const newUser = await UserModel.create({ name, mobileNumber, email, password });
        res.json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json("Internal Server Error");
    }
});

app.get('/user/:userId', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create a new ride
app.post('/rides', async (req, res) => {
    const { pickup, destination, date, time, personCount, price, userId, userName, userMobileNumber } = req.body;
    
    try {
        // Create the ride document with user details
        const newRide = await RideModel.create({
            pickup,
            destination,
            date,
            time,
            availableSeats: personCount,
            price,
            userId,
            userName,
            userMobileNumber
        });

        res.status(201).json(newRide);
    } catch (error) {
        console.error("Error creating ride:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/search', async (req, res) => {
    const { from, to, date, personCount } = req.query;
    
    try {
        const rides = await RideModel.find({
            pickup: { $regex: new RegExp(from, "i") },
            destination: { $regex: new RegExp(to, "i") },
            date: { $gte: new Date(date) },
            availableSeats: { $gte: personCount }
        });
        
        res.json(rides);
    } catch (error) {
        console.error("Error searching for rides:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/published-rides', async (req, res) => {
    const userId = req.query.userId;

    try {
        const publishedRides = await RideModel.find({ userId });
        res.json(publishedRides);
    } catch (error) {
        console.error('Error fetching published rides:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/published-rides/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedRide = await RideModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedRide) {
            return res.status(404).json({ error: 'Ride not found' });
        }
        res.json(updatedRide);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a ride
app.delete('/published-rides/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRide = await RideModel.findByIdAndDelete(id);
        if (!deletedRide) {
            return res.status(404).json({ error: 'Ride not found' });
        }
        res.json({ message: 'Ride deleted successfully' });
    } catch (error) {
        console.error('Error deleting ride:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post('/send-request', async (req, res) => {
    const { rideId, pickup, destination, userId, name ,personCounts} = req.body;
  
    try {
        // Find the ride by ID
        const ride = await RideModel.findById(rideId);
        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        // Create a notification for the ride owner with requester details
        const notificationMessage = `Request from ${name} for ride from ${pickup} to ${destination}`;
        const notification = new NotificationModel({
            rideId,
            userId: ride.userId, // Ride owner's ID
            Counts: personCounts,
            ReqById: userId,
            message: notificationMessage,
            returnNotification: 'none'
            
            

        });
        await notification.save();
  
        res.status(201).json({ message: 'Request sent successfully' });
    } catch (error) {
        console.error('Error sending request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/notifications/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch notifications for the specified user ID
        const notifications = await NotificationModel.find({ userId });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/notifications/:notificationId/accept', async (req, res) => {
    const { notificationId } = req.params;
    
    try {
        const notification = await NotificationModel.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        await NotificationModel.findByIdAndUpdate(notificationId, { returnNotification: 'accepted' });

        // Update ride's availableSeats if notification is accepted
        const ride = await RideModel.findById(notification.rideId);
        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        const updatedAvailableSeats = ride.availableSeats - notification.Counts;
        if (updatedAvailableSeats < 0) {
            return res.status(400).json({ error: 'Not enough available seats' });
        }

        await RideModel.findByIdAndUpdate(notification.rideId, { availableSeats: updatedAvailableSeats });

        res.status(200).json({ message: 'Notification accepted successfully' });
    } catch (error) {
        console.error('Error accepting notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT route to decline a notification
app.put('/notifications/:notificationId/decline', async (req, res) => {
    const { notificationId } = req.params;
    
    try {
        const notification = await NotificationModel.findByIdAndUpdate(notificationId, { returnNotification: 'declined' }, { new: true });
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        res.status(200).json({ message: 'Notification declined successfully', notification });
    } catch (error) {
        console.error('Error declining notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/user-notifications/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch notifications where ReqById matches userId
        const notifications = await NotificationModel.find({ ReqById: userId });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching ride notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Fetch details of a specific ride
app.get('/rides/:rideId', async (req, res) => {
    const rideId = req.params.rideId;
    try {
        const ride = await RideModel.findById(rideId);
        if (ride) {
            res.json(ride);
        } else {
            res.status(404).json({ error: 'Ride not found' });
        }
    } catch (error) {
        console.error('Error fetching ride details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// server.js (or your backend file)

app.get('/user/mobile/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await UserModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ mobileNumber: user.mobileNumber });
    } catch (error) {
        console.error('Error fetching user mobile number:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


 
app.post('/user/:userId/details', async (req, res) => {
    const userId = req.params.userId;
    const { vehicleName, vehicleNumber, licenseNumber } = req.body;

    try {
        // Find the user by ID and update the vehicle details
        const updatedUser = await UserModel.findByIdAndUpdate(userId, {
            vehicleName,
            vehicleNumber,
            licenseNumber
        }, { new: true }); // Set { new: true } to return the updated document

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error saving user details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// API route for uploading user image
app.post('/user/:userId/image-upload', upload.single('image'), (req, res) => {
    const userId = req.params.userId;
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    UserModel.findByIdAndUpdate(userId, { profileImage: imageUrl }, { new: true })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({ imageUrl });
        })
        .catch(err => {
            console.error('Error updating user image:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
});
app.get('/user/:userId/vehicle-details', async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ vehicleName: user.vehicleName, vehicleNumber: user.vehicleNumber });
    } catch (error) {
        console.error('Error fetching user vehicle details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.listen(PORT, () => console.log(`App listening to ${PORT}`));
