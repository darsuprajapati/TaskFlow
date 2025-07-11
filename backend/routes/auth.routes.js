import express from 'express'
import { getProfile, login, register } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
const router = express.Router()

// @desc Register User
// @route POST /api/auth/register
// @acess Public

router.post('/register', register)

// @desc Login User
// @route POST /api/auth/login
// @acess Public

router.post('/login', login)

// @desc getProfile 
// @route GET /api/auth/profile
// @access Private

router.get('/profile', protect, getProfile)


export default router