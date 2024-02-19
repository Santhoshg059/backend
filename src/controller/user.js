import UserModel from '../models/user.js'

const createRequest = async(req,res)=>{
    try {
        const {email,name,password,status,createdAt,role} = req.body
       let request = await UserModel.create({
            name:name,
            email: email,
            password: password,
            status: status,
            role: role,
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
    createRequest
}