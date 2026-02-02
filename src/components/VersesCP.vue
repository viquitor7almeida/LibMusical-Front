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
              <pre v-if="verse.chords">{{ verse.chords }}</pre>
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
    musicId: {
      type: Number,
      required: true
    },
    musicName: {
      type: String,
      default: 'Música'
    }
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
    musicId: {
      immediate: true,
      handler: 'loadVerses'
    }
  }
};
</script>

<style scoped>
.verses-container {
  max-width: 800px;
  margin: 20px auto;
}

.notebook-page {
  background: #fdfdfd;
  background-image: linear-gradient(#e1e1e1 1px, transparent 1px);
  background-size: 100% 32px;
  padding: 50px 40px 40px 60px;
  min-height: 80vh;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  border-left: 5px double #ffadad;
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  padding-bottom: 10px;
  border-bottom: 2px solid #2c3e50;
}

h1 {
  font-family: 'Georgia', serif;
  margin: 0;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.back-btn {
  background: #000000;
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
}

.verse-row {
  margin-bottom: 20px;
}

.verse-card {
  background: rgba(255, 255, 255, 0.7);
  border-left: 3px solid #94acd4;
  padding: 10px 15px;
}

pre {
  white-space: pre-wrap;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.lyrics-text {
  font-weight: normal;
  font-size: 1.1rem;
  margin-top: 5px;
  color: #444;
}

.status-msg {
  text-align: center;
  margin-top: 100px;
  color: #999;
}
</style>