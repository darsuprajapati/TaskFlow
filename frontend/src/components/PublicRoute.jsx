import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            navigate('/dashboard');
        }
    }, [token, navigate]);

    if (token) {
        return null;
    }

    return children;
};

export default PublicRoute; 