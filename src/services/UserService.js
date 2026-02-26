import axios from 'axios';
import { getToken } from './AuthService.js';

const api = axios.create({
    baseURL: 'http://localhost:8080'
});

api.interceptors.request.use(config => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const loginUser = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
};

export const updateUserProfile = async (userId, userData) => {
    const profilePayload = {
        name: userData.name,
        email: userData.email 
    };
    
    const response = await api.put(`/users/${userId}`, profilePayload);

    if (userData.password) {
        const passwordPayload = {
            newPassword: userData.password
        };
        
        await api.patch(`/users/${userId}/password`, passwordPayload);
    }

    return response.data;
};

export const fetchMusicsByUser = async (userId) => {
    const response = await api.get(`/musics/user/${userId}`);
    return response.data;
};