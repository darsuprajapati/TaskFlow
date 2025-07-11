import axios from "axios";

const API = axios.create({
    baseURL: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/tasks`,
})

export const fetchTasksAPI  = async (token) =>{
    const res = await API.get("/",{
        headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.tasks
}

export const createTaskAPI = async (taskData,token) =>{
    const res = await API.post("/",taskData,{
        headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.task
}

export const updateTaskAPI = async (id,taskData,token) =>{
    const res = await API.put(`/${id}`,taskData,{
        headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.task
}

export const deleteTaskAPI = async (id, token) => {
    const res = await API.delete(`/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};
