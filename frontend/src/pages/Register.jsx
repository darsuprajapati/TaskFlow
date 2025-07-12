import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerUserAPI } from '@/redux/features/auth/authAPI';
import { authFailure, authStart, authSuccess, clearError } from '@/redux/features/auth/authSlice';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import LoadingSpinner from '@/components/LoadingSpinner';
import ThemeToggle from '@/components/ThemeToggle';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [errors, setErrors] = useState({});
    const { loading, error } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // Clear error when component mounts
    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user starts typing
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        dispatch(authStart());
        try {
            const data = await registerUserAPI(formData);
            localStorage.setItem('token', data.token)
            dispatch(authSuccess(data))
            navigate('/dashboard')
        } catch (error) {
            dispatch(authFailure(error.response?.data?.message || 'Registration failed'));
        }
    }

    return (
        <div className=" px-5 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            
            <div className="w-full max-w-md p-5 space-y-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Join us and start managing your tasks</p>
                </div>
                
                {error && (
                    <div className="p-3 bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input 
                            name="name" 
                            type="text"
                            placeholder="Full Name" 
                            value={formData.name}
                            onChange={handleChange}
                            className={`${errors.name ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                        />
                        {errors.name && <p className="text-red-500 dark:text-red-400 text-xs">{errors.name}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Input 
                            name="email" 
                            type="email"
                            placeholder="Email Address" 
                            value={formData.email}
                            onChange={handleChange}
                            className={`${errors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                        />
                        {errors.email && <p className="text-red-500 dark:text-red-400 text-xs">{errors.email}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Input 
                            name="password" 
                            type="password"
                            placeholder="Password" 
                            value={formData.password}
                            onChange={handleChange}
                            className={`${errors.password ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                        />
                        {errors.password && <p className="text-red-500 dark:text-red-400 text-xs">{errors.password}</p>}
                    </div>
                    
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <LoadingSpinner size="sm" />
                                Creating Account...
                            </div>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>
                
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register