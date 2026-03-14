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

const API_BASE = `/chords`;

export async function fetchChordsByMusic(musicId) {
    const response = await api.get(`${API_BASE}/music/${musicId}`);
    return response.data;
}

export async function createChord(chordData) {
    const response = await api.post(API_BASE, chordData);
    return response.data;
}

export async function uploadChordPhoto(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.patch(`${API_BASE}/${id}/photo`, formData);
    return response.data;
}

export async function updateChord(id, chordData) {
    const response = await api.put(`${API_BASE}/${id}`, chordData);
    return response.data;
}

export async function deleteChord(id) {
    await api.delete(`${API_BASE}/${id}`);
}