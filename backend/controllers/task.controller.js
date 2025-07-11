import Task from '../models/task.model.js'

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id })
        res.status(200).json({
            message: "Tasks fetched successfully ✅",
            tasks
        })
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            message: 'Server error, please try again later ❌'
        });
    }
}

export const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body
        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            user: req.user._id
        })
        res.status(201).json({
            message: 'Task create successfully✅',
            task
        })
    } catch (error) {
        console.error('Error create tasks:', error);
        res.status(500).json({
            message: 'Server error, please try again later ❌'
        });
    }
}

export const updateTask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id })
        if (!task) {
            return res.status(404).json({
                message: "Task not found ❌"
            })
        }

        Object.assign(task, req.body)
        await task.save();
        res.status(200).json({
            message: 'Task update successfully ✅',
            task
        })

    } catch (error) {
        console.error('Error update tasks:', error);
        res.status(500).json({
            message: 'Server error, please try again later ❌'
        });
    }
}

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id })
        if (!task) {
            return res.status(404).json({
                message: "Task not found ❌"
            })
        }
        res.json({ message: "Task deleted successfully ✅" });
    } catch (error) {
        console.error('Error delete tasks:', error);
        res.status(500).json({
            message: 'Server error, please try again later ❌'
        });
    }
}

