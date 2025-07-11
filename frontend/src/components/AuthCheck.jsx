import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/redux/features/auth/authSlice';
import { getProfileAPI } from '@/redux/features/auth/authAPI';

const AuthCheck = ({ children }) => {
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken && !token) {
                try {
                    const userData = await getProfileAPI(storedToken);
                    dispatch(setUser(userData));
                } catch (error) {
                    // Token is invalid, remove it
                    localStorage.removeItem('token');
                }
            }
        };

        checkAuth();
    }, [dispatch, token]);

    return children;
};

export default AuthCheck; 