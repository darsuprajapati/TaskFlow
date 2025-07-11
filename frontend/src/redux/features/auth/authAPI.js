import axios from 'axios'

const API = axios.create({
    baseURL: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/auth`,
})

export const registerUserAPI = async (userData) => {
    const res = await API.post('/register', userData)
    return res.data
}

export const loginUserAPI = async (userData) => {
    const res = await API.post('/login', userData)
    return res.data
}

export const getProfileAPI = async (token) => {
    const res = await API.get('/profile', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};