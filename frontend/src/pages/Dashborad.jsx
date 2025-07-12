import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ThemeToggle';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
    BookAlert,
    BookMarked,
    Check,
    ClipboardCheck,
    Clock,
    Trash2,
    Pencil,
    Zap,
} from 'lucide-react';
import {
    taskFailure,
    taskStart,
    taskSuccess,
    addTask,
    editTask,
    removeTask,
} from '@/redux/features/task/taskSlice';
import {
    fetchTasksAPI,
    createTaskAPI,
    updateTaskAPI,
    deleteTaskAPI,
} from '@/redux/features/task/taskAPI';
import { logout } from '@/redux/features/auth/authSlice';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Header from '@/components/Header';


const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'completed', label: 'Completed' },
    { key: 'active', label: 'Active' },
    { key: 'high-priority', label: 'High Priority' },
    { key: 'due-soon', label: 'Due Soon' },
];

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, token } = useSelector((state) => state.auth);
    const { tasks, loading, error } = useSelector((state) => state.task);

    // UI state
    const [filter, setFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: null,
    });
    const [editTaskId, setEditTaskId] = useState(null); // Track if editing



    // Fetch tasks on mount
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                dispatch(taskStart());
                const data = await fetchTasksAPI(token);
                console.log("Fetched tasks:", data);
                dispatch(taskSuccess(data));
            } catch (err) {
                console.error("Fetch tasks error:", err);
                dispatch(taskFailure(err.response?.data?.message || err.message));
            }
        };
        if (token) fetchTasks();
    }, [token, dispatch]);

    // Add Task Handler
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) return;
        try {
            dispatch(taskStart());
            const newTask = await createTaskAPI(
                {
                    title: form.title,
                    description: form.description,
                    priority: form.priority,
                    dueDate: form.dueDate ? form.dueDate.toISOString() : undefined,
                },
                token
            );
            dispatch(addTask(newTask));
            setShowModal(false);
            setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
        } catch (err) {
            console.error("Add task error:", err);
            dispatch(taskFailure(err.response?.data?.message || err.message));
        }
    };

    // Delete Task Handler
    const handleDeleteTask = async (id) => {
        try {
            dispatch(taskStart());
            await deleteTaskAPI(id, token);
            dispatch(removeTask(id));
        } catch (err) {
            console.error("Delete task error:", err);
            dispatch(taskFailure(err.response?.data?.message || err.message));
        }
    };

    // Toggle Complete Handler
    const handleToggleComplete = async (task) => {
        try {
            dispatch(taskStart());
            const updated = await updateTaskAPI(
                task._id,
                { ...task, completed: !task.completed },
                token
            );
            dispatch(editTask(updated));
        } catch (err) {
            console.error("Toggle complete error:", err);
            dispatch(taskFailure(err.response?.data?.message || err.message));
        }
    };

    // Update Priority Handler
    const handleUpdatePriority = async (task) => {
        const nextPriority =
            task.priority === 'low'
                ? 'medium'
                : task.priority === 'medium'
                    ? 'high'
                    : 'low';
        try {
            dispatch(taskStart());
            const updated = await updateTaskAPI(
                task._id,
                { ...task, priority: nextPriority },
                token
            );
            dispatch(editTask(updated));
        } catch (err) {
            console.error("Update priority error:", err);
            dispatch(taskFailure(err.response?.data?.message || err.message));
        }
    };

    // Filtering
    const filteredTasks = tasks.filter((task) => {
        if (filter === 'all') return true;
        if (filter === 'completed') return task.completed;
        if (filter === 'active') return !task.completed;
        if (filter === 'high-priority') return task.priority === 'high';
        if (filter === 'due-soon') {
            if (!task.dueDate) return false;
            const today = new Date();
            const dueDate = new Date(task.dueDate);
            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 3 && diffDays >= 0;
        }
        return true;
    });

    // Stats
    const stats = {
        total: tasks.length,
        completed: tasks.filter((t) => t.completed).length,
        active: tasks.filter((t) => !t.completed).length,
        highPriority: tasks.filter((t) => t.priority === 'high').length,
        dueSoon: tasks.filter((t) => {
            if (!t.dueDate) return false;
            const today = new Date();
            const dueDate = new Date(t.dueDate);
            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 3 && diffDays >= 0;
        }).length,
    };

    // Logout
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Open modal for editing
    const handleEditClick = (task) => {
        setEditTaskId(task._id);
        setForm({
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        });
        setShowModal(true);
    };

    // Unified Add/Edit handler
    const handleAddOrEditTask = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) return;
        if (editTaskId) {
            // Editing existing task
            try {
                dispatch(taskStart());
                const updated = await updateTaskAPI(
                    editTaskId,
                    {
                        title: form.title,
                        description: form.description,
                        priority: form.priority,
                        dueDate: form.dueDate || undefined,
                    },
                    token
                );
                dispatch(editTask(updated));
                setShowModal(false);
                setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
                setEditTaskId(null);
            } catch (err) {
                console.error("Edit task error:", err);
                dispatch(taskFailure(err.response?.data?.message || err.message));
            }
        } else {
            // Adding new task
            try {
                dispatch(taskStart());
                const newTask = await createTaskAPI(
                    {
                        title: form.title,
                        description: form.description,
                        priority: form.priority,
                        dueDate: form.dueDate || undefined,
                    },
                    token
                );
                dispatch(addTask(newTask));
                setShowModal(false);
                setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
            } catch (err) {
                console.error("Add task error:", err);
                dispatch(taskFailure(err.response?.data?.message || err.message));
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                            TaskFlow
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">

                        <ThemeToggle />
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* <Header user={user} handleLogout={handleLogout}/> */}


            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className='px-3 text-center mb-5'>
                    <p className="text-xl font-medium text-gray-600 dark:text-gray-400">
                        Welcome back, {user?.name || 'User'}!
                    </p>
                </div>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard label="Total Tasks" value={stats.total} icon={<ClipboardCheck className='w-5 h-5' />} color="blue" />
                    <StatCard label="Completed" value={stats.completed} icon={<Check className='w-5 h-5' />} color="green" />
                    <StatCard label="Active" value={stats.active} icon={<Clock className='w-5 h-5' />} color="yellow" />
                    <StatCard label="High Priority" value={stats.highPriority} icon={<BookMarked className='w-5 h-5' />} color="red" />
                    <StatCard label="Due Soon" value={stats.dueSoon} icon={<BookAlert className='w-5 h-5' />} color="red" />
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <Button
                            key={f.key}
                            variant={filter === f.key ? 'default' : 'outline'}
                            onClick={() => setFilter(f.key)}
                            className={
                                filter === f.key
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                    : ''
                            }
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>

                {/* Add Task Button */}
                <div className="mb-6 flex justify-end">
                    <Button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    >
                        + Add Task
                    </Button>
                </div>

                {/* Loading/Error */}
                {loading && (
                    <div className="flex justify-center my-8">
                        <LoadingSpinner size="lg" />
                    </div>
                )}
                {error && (
                    <div className="p-3 bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 rounded-lg mb-6">
                        <p className="text-red-600 dark:text-red-400 text-sm text-center">{String(error)}</p>
                    </div>
                )}

                {/* Task List */}
                <div className="space-y-4">
                    {filteredTasks.length === 0 && !loading ? (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
                            <p className="text-lg font-medium">No tasks found</p>
                            <p className="text-gray-500 mt-1">Try changing the filter or adding a new task.</p>
                        </div>
                    ) : (
                        filteredTasks.map((task) => (
                            <div
                                key={task._id}
                                className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow  hover:shadow-md transition-all "
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <button
                                            onClick={() => handleToggleComplete(task)}
                                            className={`mt-1 w-5 h-5 rounded border flex-shrink-0 transition-colors duration-200 ${task.completed
                                                ? 'bg-green-500 border-green-500'
                                                : 'border-gray-400 dark:border-gray-600'
                                                }`}
                                            title="Toggle Complete"
                                        >
                                            {task.completed && <Check className="w-4 h-4 text-white" />}
                                        </button>
                                        <div>
                                            <h3
                                                className={`font-medium text-lg ${task.completed ? 'line-through text-gray-400' : ''}`}
                                            >
                                                {task.title}
                                            </h3>
                                            {task.description && (
                                                <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                                            )}
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.priority === 'high'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        : task.priority === 'medium'
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        }`}
                                                >
                                                    {task.priority} priority
                                                </span>
                                                {task.dueDate && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleUpdatePriority(task)}
                                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                            title="Change Priority"
                                        >
                                            <Zap className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(task)}
                                            className="p-1.5 rounded-full text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                            title="Edit Task"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTask(task._id)}
                                            className="p-1.5 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                                            title="Delete Task"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Add Task Modal */}
            {showModal && (
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 ">
                        <DialogHeader>
                            <DialogTitle>{editTaskId ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleAddOrEditTask} className="space-y-4">
                            <Input
                                type="text"
                                placeholder="Task Title"
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium mb-1">Priority</label>
                                <select
                                    value={form.priority}
                                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                                    className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Due Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.dueDate ? format(form.dueDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={form.dueDate}
                                            onSelect={(date) => setForm((f) => ({ ...f, dueDate: date }))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>


                            <DialogFooter className="mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowModal(false);
                                        setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
                                        setEditTaskId(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                    disabled={loading}
                                >
                                    {loading ? <LoadingSpinner size="sm" /> : editTaskId ? 'Update Task' : 'Save Task'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            )}
        </div>
    );
};

// Stat Card Component
function StatCard({ label, value, icon, color }) {
    const colorMap = {
        blue: 'bg-blue-500/10',
        green: 'bg-green-500/10',
        yellow: 'bg-yellow-500/10',
        red: 'bg-red-500/10',
    };
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <div className={`w-10 h-10 ${colorMap[color] || ''} rounded-lg flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;