import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL;
const API_BASE = `${API_URL}/verses`;

export async function createVerse(verseData) {
  try {
    const response = await axios.post(API_BASE, verseData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar verso:", error);
    throw error;
  }
}

export async function fetchAllVerses() {
  try {
    const response = await axios.get(API_BASE);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar todos os versos:", error);
    throw error;
  }
}

export async function fetchVersesByMusicId(musicId) {
  try {
    const response = await axios.get(`${API_BASE}/${musicId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar versos da música ${musicId}:`, error);
    throw error;
  }
}

export async function updateVerse(id, verseData) {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, verseData);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar verso:`, error);
    throw error;
  }
}

export async function deleteVerse(id) {
  try {
    await axios.delete(`${API_BASE}/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir verso:`, error);
    throw error;
  }
}