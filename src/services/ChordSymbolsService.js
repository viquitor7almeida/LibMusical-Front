import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL;
const API_BASE = `${API_URL}/chordsymbols`;

export async function createChord(chordData) {
  try {
    const response = await axios.post(API_BASE, chordData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar cifra:", error);
    throw error;
  }
}

export async function fetchAllChords() {
  try {
    const response = await axios.get(API_BASE);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar cifras:", error);
    throw error;
  }
}

export async function fetchChordsByMusicId(musicId) {
  try {
    const response = await axios.get(`${API_BASE}/user/${musicId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar cifras da música ${musicId}:`, error);
    throw error;
  }
}

export async function updateChord(id, chordData) {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, chordData);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar cifra:`, error);
    throw error;
  }
}

export async function deleteChord(id) {
  try {
    await axios.delete(`${API_BASE}/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir cifra:`, error);
    throw error;
  }
}