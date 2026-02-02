<template>
  <div class="chords-container">
    <div class="notebook-page">
      <header class="page-header">
        <div class="title-group">
          <h1>{{ musicName }}</h1>
          <span class="tag">Cifra Completa</span>
        </div>
        <button class="back-btn" @click="$emit('back')">Voltar</button>
      </header>

      <div class="chords-content">
        <div v-if="loading" class="status-msg">Carregando cifra...</div>
        
        <div v-else-if="chords && chords.length > 0">
          <div v-for="chordEntry in chords" :key="chordEntry.id" class="chord-block">
            <pre class="sheet">{{ chordEntry.fullSheet }}</pre>
          </div>
        </div>

        <div v-else class="status-msg">
          Nenhuma cifra cadastrada para esta música.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchChordsByMusicId } from './../services/ChordSymbolsService.js';

export default {
  name: 'ChordsDisplay',
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
      chords: [],
      loading: false
    };
  },
  methods: {
    async loadChords() {
      if (!this.musicId) return;
      this.loading = true;
      try {
        this.chords = await fetchChordsByMusicId(this.musicId);
      } catch (error) {
        console.error("Erro ao carregar cifra:", error);
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    musicId: {
      immediate: true,
      handler: 'loadChords'
    }
  }
};
</script>

<style scoped>
.chords-container {
  max-width: 900px;
  margin: 20px auto;
}

.notebook-page {
  background: #fff;
  background-image: 
    linear-gradient(90deg, transparent 79px, #ffadad 79px, #ffadad 81px, transparent 81px),
    linear-gradient(#eee 0.1em, transparent 0.1em);
  background-size: 100% 1.5em;
  padding: 60px 40px 40px 100px;
  min-height: 100vh;
  box-shadow: 5px 5px 20px rgba(0,0,0,0.2);
  border-radius: 2px;
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
}

h1 {
  font-family: 'Georgia', serif;
  margin: 0;
  font-size: 1.8rem;
  color: #1a1a1a;
}

.tag {
  font-size: 0.8rem;
  background: #333;
  color: #fff;
  padding: 2px 8px;
  border-radius: 3px;
  text-transform: uppercase;
}

.back-btn {
  background: transparent;
  border: 1px solid #333;
  padding: 5px 15px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #000000;
  color: #fff;
}

.sheet {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.15rem;
  line-height: 1.5;
  color: #2c3e50;
  white-space: pre-wrap;
  margin: 0;
  font-weight: 600;
}

.status-msg {
  text-align: center;
  margin-top: 50px;
  font-family: sans-serif;
  color: #888;
}
</style>