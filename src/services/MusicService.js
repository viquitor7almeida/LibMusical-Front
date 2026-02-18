import axios from 'axios';
import { getToken } from './AuthService.js';

const api = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL
});

api.interceptors.request.use(config => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const API_BASE = `/musics`;

export async function fetchAllMusics() {
    const response = await api.get(API_BASE);
    return response.data;
}

export async function fetchMusicsByUser(userId) {
    const response = await api.get(`${API_BASE}/user/${userId}`);
    return response.data;
}

export async function createMusic(musicData) {
    const response = await api.post(API_BASE, musicData);
    return response.data;
}

export async function uploadMusicAudio(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.patch(`${API_BASE}/${id}/audio`, formData);
    return response.data;
}

export async function updateMusic(id, musicData) {
    const response = await api.put(`${API_BASE}/${id}`, musicData);
    return response.data;
}

export async function deleteMusic(id) {
    await api.delete(`${API_BASE}/${id}`);
}