import UserModel from '../models/user.js'

const uploadProfileImage = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const imageUrl = req.file.path;
        user.profileImage = imageUrl;
        await user.save();

        res.status(200).send({ message: 'Profile image updated successfully', imageUrl });
    } catch (error) {
        res.status(500).send({ message: error.message || 'Internal Server Error' });
    }
};

const createRequest = async(req,res)=>{
    try {
        const {name,email,mobilenumber,password,status,createdAt} = req.body
       let request = await UserModel.create({
            name:name,
            email: email,
            password: password,
            mobilenumber: mobilenumber,
            createdAt: createdAt,
        })

        

        res.status(201).send({
            message:"Request Raised Successfully",
            id:request._id
        })

    } catch (error) {
        res.status(500).send({
            message:error.message||"Internal Server Error"
        })
    }
}

export default {
    createRequest,
    uploadProfileImage
}