import { configureStore, createSlice } from '@reduxjs/toolkit';
import React, { useState } from 'react';

// Initial Tasks Slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState: [],
  reducers: {
    addTask: (state, action) => {
      return [action.payload, ...state];
    },
    deleteTask: (state, action) => {
      return state.filter(task => task.id !== action.payload);
    },
    toggleComplete: (state, action) => {
      return state.map(task =>
        task.id === action.payload ? { ...task, completed: !task.completed } : task
      );
    },
    updatePriority: (state, action) => {
      const { id, priority } = action.payload;
      return state.map(task =>
        task.id === id ? { ...task, priority } : task
      );
    },
  },
});

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
  },
  reducers: {
    login: (state, action) => {
      localStorage.setItem('user', JSON.stringify(action.payload));
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      localStorage.removeItem('user');
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

// Store
const store = configureStore({
  reducer: {
    tasks: tasksSlice.reducer,
    auth: authSlice.reducer,
  },
});

// Actions
const { addTask, deleteTask, toggleComplete, updatePriority } = tasksSlice.actions;
const { login, logout } = authSlice.actions;

export default function Test() {
  const [state, dispatch] = useRedux(store);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Filter states
  const [filter, setFilter] = useState('all');

  // Stats calculation
  const stats = {
    total: state.tasks.length,
    completed: state.tasks.filter(t => t.completed).length,
    active: state.tasks.filter(t => !t.completed).length,
    highPriority: state.tasks.filter(t => t.priority === 'high').length,
    dueSoon: state.tasks.filter(t => {
      if (!t.dueDate) return false;
      const today = new Date();
      const dueDate = new Date(t.dueDate);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0;
    }).length,
  };

  const filteredTasks = state.tasks.filter(task => {
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

  const handleLogin = () => {
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    const storedUser = localStorage.getItem(`user_${username}`);
    if (!storedUser) {
      setError('User not found. Please register first.');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.password !== password) {
      setError('Incorrect password.');
      return;
    }

    dispatch(login({ username }));
    setError('');
    setUsername('');
    setPassword('');
  };

  const handleRegister = () => {
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    if (localStorage.getItem(`user_${username}`)) {
      setError('Username already taken.');
      return;
    }

    localStorage.setItem(`user_${username}`, JSON.stringify({ username, password }));
    dispatch(login({ username }));
    setError('');
    setUsername('');
    setPassword('');
  };

  const handleAddTask = () => {
    if (!newTitle.trim()) return;

    const task = {
      id: Date.now(),
      title: newTitle,
      description: newDescription,
      completed: false,
      createdAt: new Date().toISOString(),
      priority: newPriority,
      dueDate,
    };

    dispatch(addTask(task));
    setNewTitle('');
    setNewDescription('');
    setNewPriority('medium');
    setDueDate('');
    setShowModal(false);
  };

  if (!state.auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-gray-900">
          <h2 className="text-2xl font-bold mb-6 text-center">{isRegistering ? 'Register' : 'Login'}</h2>
          {error && <p className="text-red-400 mb-4 text-sm text-center">{error}</p>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 mb-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mb-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={isRegistering ? handleRegister : handleLogin}
            className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90 transition-opacity"
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-blue-400 hover:underline"
            >
              {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">TaskFlow</h1>
          <div className="flex space-x-4 items-center">
            <span className="text-sm font-medium">Welcome, {state.auth.user.username}</span>
            <button
              onClick={() => dispatch(logout())}
              className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-500 capitalize">{key.replace('-', ' ')}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'completed', 'active', 'high-priority', 'due-soon'].map(option => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                filter === option
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {option.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Add Task Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Add New Task
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
              <p className="text-lg font-medium">No tasks found</p>
              <p className="text-gray-500 mt-1">Try changing the filter or adding a new task.</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => dispatch(toggleComplete(task.id))}
                      className={`mt-1 w-5 h-5 rounded border flex-shrink-0 ${
                        task.completed ? 'bg-green-500 border-green-500' : 'border-gray-400 dark:border-gray-600'
                      }`}
                    >
                      {task.completed && <CheckIcon />}
                    </button>
                    <div>
                      <h3 className={`font-medium text-lg ${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </h3>
                      {task.description && <p className="mt-1 text-sm text-gray-500">{task.description}</p>}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'high' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                            : task.priority === 'medium' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
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
                      onClick={() => dispatch(updatePriority({ id: task.id, priority: task.priority === 'low' ? 'medium' : task.priority === 'medium' ? 'high' : 'low' }))}
                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <PriorityIcon priority={task.priority} />
                    </button>
                    <button
                      onClick={() => dispatch(deleteTask(task.id))}
                      className="p-1.5 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Task</h2>
            <input
              type="text"
              placeholder="Task Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded border dark:bg-gray-700 dark:border-gray-600"
            />
            <textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 mb-4 rounded border dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded hover:opacity-90"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Hook for Redux
function useRedux(store) {
  const [state, setState] = React.useState(store.getState());
  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });
    return unsubscribe;
  }, []);
  return [state, store.dispatch];
}

// Icons
function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function PriorityIcon({ priority }) {
  let colorClass;
  switch(priority) {
    case 'high': colorClass = 'text-red-500'; break;
    case 'medium': colorClass = 'text-yellow-500'; break;
    default: colorClass = 'text-green-500';
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}