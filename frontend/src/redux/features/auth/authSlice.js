import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem('token');

const initialState = {
    user: null,
    token: token || null,
    loading: false,
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        authSuccess: (state, action) => {
            state.loading = false;
            state.user = action.payload.user || action.payload;
            state.token = action.payload.token;
            state.error = null;
        },
        authFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.token = localStorage.getItem('token');
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem('token');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
})

export const { authStart, authSuccess, authFailure, setUser, logout, clearError } = authSlice.actions

export default authSlice.reducer