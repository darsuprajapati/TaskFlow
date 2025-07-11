import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors'
import swaggerUi from "swagger-ui-express"
import YAML from 'yamljs'

import connectDB from './config/db.js';
import MainRouter from "./routes/main.routes.js"
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();
connectDB()

// Create an Express application
const app = express()

// global middleware
app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))

// Error handling middleware
app.use(errorHandler)

const swaggerDoc = YAML.load('./openapi.yaml')

// api route end Point
app.use("/api", MainRouter)
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerDoc))

// Start the server
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`)
})

export default app