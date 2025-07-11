import express from 'express'
const router = express.Router()

import userRouter from './auth.routes.js'
import taskRouter from './task.routes.js'
import { protect } from '../middleware/auth.middleware.js';

// @desc Mounts all user-related routes
// @route /api/auth
// @access Public or Protected (depending on the user.routes.js)
router.use('/auth', userRouter);

// @desc Mounts all user Task realated routes
// @route /api/tasks
// @access Private Protected (depending on the user.routes.js)
router.use('/tasks',protect, taskRouter)


export default router