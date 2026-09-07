import express from "express"
import authRoutes from "./routes/auth.routes.js"
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js";

const PORT = process.env.PORT || 5000
const app = express()
dotenv.config()


app.get('/', (req, res) => {
    res.send("Hello User!! Welcome to Backend!!")
})

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`)
    connectMongoDB()
})

//rakshinjoshi_db_user
//VDUJBFy8yYcoHvPe
//
