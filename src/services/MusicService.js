import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL;
const API_BASE = `${API_URL}/musics`;

export async function fetchAllMusics() {
  try {
    const response = await axios.get(API_BASE);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar todas as músicas:", error);
    throw error;
  }
}

export async function fetchMusicsByUserId(userId) {
  try {
    const response = await axios.get(`${API_BASE}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar músicas do usuário ${userId}:`, error);
    throw error;
  }
}

export async function createMusic(musicData) {
  try {
    const response = await axios.post(API_BASE, musicData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar música:", error);
    throw error;
  }
}

export async function updateMusic(id, musicData) {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, musicData);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar música com ID ${id}:`, error);
    throw error;
  }
}

export async function deleteMusic(id) {
  try {
    await axios.delete(`${API_BASE}/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir música com ID ${id}:`, error);
    throw error;
  }
}