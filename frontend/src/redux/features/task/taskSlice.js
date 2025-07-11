import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    tasks: [],
    loading: false,
    error: null,
}

const taskSlice = createSlice({
    name: 'task',
    initialState,
    reducers: {
        taskStart: (state) => {
            state.loading = false,
                state.error = null
        },
        taskSuccess: (state, action) => {
            state.loading = false;
            state.tasks = action.payload;
            state.error = null;
        },
        taskFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload || "Unknown error";
        },
        addTask: (state, action) => {
            state.tasks.push(action.payload)
        },
        editTask: (state, action) => {
            const index = state.tasks.findIndex(t => t._id === action.payload._id);
            if (index !== -1) state.tasks[index] = action.payload;
        },
        removeTask: (state, action) => {
            state.tasks = state.tasks.filter(t => t._id !== action.payload);
        },
        clearTaskError: (state) => {
            state.error = null;
        }
    }
})

export const {
    taskStart, taskSuccess, taskFailure,
    addTask, editTask, removeTask, clearTaskError
} = taskSlice.actions;

export default taskSlice.reducer;