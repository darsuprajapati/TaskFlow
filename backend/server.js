import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import YAML from 'yamljs'
import { fileURLToPath } from 'url'

// Utils to resolve __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env vars
dotenv.config()

// Connect to DB
import connectDB from './config/db.js'
connectDB()

// Create Express app
const app = express()

// Middleware
app.use(express.json())
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://task-flow-bay-tau.vercel.app'],
  credentials: true
}))

// Routes
import MainRouter from './routes/main.routes.js'
import { errorHandler } from './middleware/error.middleware.js'
app.use('/api', MainRouter)

// Serve Swagger static assets
app.use('/swagger', express.static(path.join(__dirname, 'public/swagger')))

// Load OpenAPI YAML
const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'))

// Swagger JSON endpoint
app.get('/swagger/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerDocument)
})

// Swagger UI HTML page
app.get('/api-docs', (req, res) => {
  const swaggerHTML = fs.readFileSync(path.join(__dirname, 'swagger-template.html'), 'utf8')
  const renderedHTML = swaggerHTML.replace('SWAGGER_JSON_URL', '/swagger/swagger.json')
  res.send(renderedHTML)
})

// Global error handler
app.use(errorHandler)

// ✅ Export app for Vercel

export default app

// app.listen(8080,()=>{

// })

