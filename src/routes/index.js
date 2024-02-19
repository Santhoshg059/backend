import express from 'express'
import UserRoutes from './user.js'
const router=express.Router()
router.get('/',(req,res)=>res.status(200).send(`<h1>backend implementation<h1/>`))
router.use('/user',UserRoutes)

export default router