import express from 'express'
import { createTask, deleteTask, getTasks, updateTask } from '../controllers/task.controller.js'
const router = express.Router()

// @desc get Task
// @route GET /api/tasks
// @access Private
router.get('/', getTasks)

// @desc create Task 
// @route POST /api/tasks
// @access Private
router.post('/',createTask)

// @desc update Task
// @route PUT /api/tasks/:id
// @acess Private
router.put("/:id",updateTask)

// @desc delete Task
// @route DELETE /api/tasks/:id
// @access Private
router.delete("/:id",deleteTask)

export default router