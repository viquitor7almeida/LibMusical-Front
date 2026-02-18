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

const API_BASE = `/verses`;

export async function createVerse(verseData) {
    try {
        const response = await api.post(API_BASE, verseData);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar verso:", error);
        throw error;
    }
}

export async function fetchAllVerses() {
    try {
        const response = await api.get(API_BASE);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar todos os versos:", error);
        throw error;
    }
}

export async function fetchVersesByMusicId(musicId) {
    try {
        const response = await api.get(`${API_BASE}/${musicId}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar versos da música ${musicId}:`, error);
        throw error;
    }
}

export async function updateVerse(id, verseData) {
    try {
        const response = await api.put(`${API_BASE}/${id}`, verseData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar verso:`, error);
        throw error;
    }
}

export async function deleteVerse(id) {
    try {
        await api.delete(`${API_BASE}/${id}`);
    } catch (error) {
        console.error(`Erro ao excluir verso:`, error);
        throw error;
    }
}