import express from "express"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from 'cloudinary'

import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"

import connectMongoDB from "./db/connectMongoDB.js";

const PORT = process.env.PORT || 5000
const app = express()
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


app.get('/', (req, res) => {
    res.send("Hello User!! Welcome to Backend!!")
})

app.use(express.json()) //middleware to parse req.body
app.use(express.urlencoded({extended: true})) //middleware to form data (urlencoded)
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`)
    connectMongoDB()
})

//rakshinjoshi_db_user
//VDUJBFy8yYcoHvPe
//
