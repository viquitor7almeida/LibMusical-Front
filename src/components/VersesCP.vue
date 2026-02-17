<template>
  <div class="verses-container">
    <div class="notebook-page">
      <header class="page-header">
        <div class="title-group">
          <h1>{{ musicName }}</h1>
          <span class="subtitle">Estrutura e Acordes</span>
        </div>
        <button class="back-btn" @click="$emit('back')">Voltar</button>
      </header>

      <div class="lyrics-content">
        <div v-if="loading" class="status-msg">Carregando estrutura...</div>
        
        <div v-else-if="verses && verses.length > 0">
          <div v-for="verse in verses" :key="verse.id" class="verse-row">
            <div class="verse-card">
              <pre v-if="verse.chords" class="chords-line">{{ verse.chords }}</pre>
              <pre v-if="verse.lyrics" class="lyrics-text">{{ verse.lyrics }}</pre>
            </div>
          </div>
        </div>

        <div v-else class="status-msg">
          Nenhuma estrutura cadastrada para esta música.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchVersesByMusicId } from './../services/VersesService.js';

export default {
  name: 'VersesDisplay',
  props: {
    musicId: { type: Number, required: true },
    musicName: { type: String, default: 'Música' }
  },
  data() {
    return {
      verses: [],
      loading: false
    };
  },
  methods: {
    async loadVerses() {
      if (!this.musicId) return;
      this.loading = true;
      try {
        this.verses = await fetchVersesByMusicId(this.musicId);
      } catch (error) {
        console.error("Erro ao carregar versos:", error);
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    musicId: { immediate: true, handler: 'loadVerses' }
  }
};
</script>

<style scoped>
.verses-container {
  max-width: 800px;
  margin: 10px auto;
}

.notebook-page {
  /* Fundo carvão profundo igual ao livro */
  background: #1e1a17; 
  background-image: linear-gradient(rgba(74, 63, 53, 0.3) 1px, transparent 1px);
  background-size: 100% 32px;
  padding: 50px 40px 40px 60px;
  min-height: 80vh;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  /* Margem vertical em tom de madeira/vinho escuro */
  border-left: 5px double #4d1212;
  position: relative;
  border-radius: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  padding-bottom: 15px;
  border-bottom: 2px solid #3d3128;
}

h1 {
  font-family: 'Crimson Text', 'Georgia', serif;
  margin: 0;
  color: #d1c5a5; /* Dourado envelhecido */
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 1.5rem;
}

.subtitle {
  font-size: 0.9rem;
  color: #a68b6d; /* Bronze */
  font-style: italic;
}

.back-btn {
  background: #3d3128;
  color: #d1c5a5;
  border: 1px solid #4a3f35;
  padding: 8px 18px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.back-btn:hover {
  background: #4a3f35;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
}

.verse-row {
  margin-bottom: 25px;
}

.verse-card {
  background: rgba(44, 36, 30, 0.4);
  border-left: 3px solid #a68b6d; /* Detalhe em bronze */
  padding: 12px 20px;
  border-radius: 0 4px 4px 0;
}

pre {
  white-space: pre-wrap;
  font-family: 'Courier New', Courier, monospace;
  margin: 0;
}

.chords-line {
  font-size: 1.2rem;
  font-weight: bold;
  color: #d1c5a5; /* Acordes em dourado */
  margin-bottom: 4px;
}

.lyrics-text {
  font-weight: normal;
  font-size: 1.1rem;
  color: #e0d8c3; /* Letra em bege claro para leitura suave */
}

.status-msg {
  text-align: center;
  margin-top: 100px;
  color: #5c4b3c;
  font-style: italic;
}
</style>