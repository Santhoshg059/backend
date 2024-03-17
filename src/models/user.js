// userModel.js

import mongoose from './index.js';
import bcrypt from 'bcryptjs';

const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true, // Ensure uniqueness of email addresses
        validate: {
            validator: validateEmail,
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    
    mobileNumber: {
        type: String,
        // required: [true, "Number is required"]
    },
    vehicleName:{
        type: String,
    },
    vehicleNumber:{
        type: String,
    },
    licenseNumber:{
        type: String,
    },
    profileImage:{
        type: String, 
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
}, {
    collection: 'user',
    versionKey: false
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    next();
});

const UserModel = mongoose.model('user', userSchema);

export default UserModel;
