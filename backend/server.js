import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import { fileURLToPath } from 'url'

import connectDB from './config/db.js'
import MainRouter from './routes/main.routes.js'
import { errorHandler } from './middleware/error.middleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
connectDB()

const app = express()

app.use(express.json())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)

const swaggerDoc = YAML.load(path.join(__dirname, 'openapi.yaml'))

app.use('/api', MainRouter)
app.use('/api-docs', swaggerUi.serve)
app.get('/api-docs', swaggerUi.setup(swaggerDoc))


app.use(errorHandler)

// const PORT = process.env.PORT || 8080
// app.listen(PORT, () => {
//     console.log(`Server running on port http://localhost:${PORT}`)
// })

export default app

