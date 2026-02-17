<template>
  <div class="chords-container">
    <div class="notebook-page">
      <header class="page-header">
        <div class="title-group">
          <h1>{{ musicName }}</h1>
          <span class="tag">Cifra Completa</span>
        </div>
        <div class="actions">
          <button v-if="!isEditing" class="edit-btn" @click="startEdit">Editar</button>
          <div v-else class="edit-actions">
            <button class="cancel-btn" @click="cancelEdit">Cancelar</button>
            <button class="save-btn" @click="saveChords">Salvar</button>
          </div>
        </div>
      </header>

      <div class="chords-content">
        <div v-if="loading" class="status-msg">Carregando cifra...</div>
        
        <div v-else>
          <div v-if="isEditing" class="edit-area">
            <textarea 
              v-model="editableText" 
              class="sheet-editor" 
              placeholder="Digite a cifra aqui (Acordes em cima das letras)..."
            ></textarea>
          </div>

          <div v-else-if="chords && chords.length > 0">
            <div v-for="chordEntry in chords" :key="chordEntry.id" class="chord-block">
              <pre class="sheet">{{ chordEntry.fullSheet }}</pre>
            </div>
          </div>

          <div v-else class="status-msg">
            Nenhuma cifra cadastrada para esta música. Clique em editar para adicionar.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchChordsByMusicId, createChord, updateChord } from './../services/ChordSymbolsService.js';

export default {
  name: 'ChordsDisplay',
  props: {
    musicId: { type: Number, required: true },
    musicName: { type: String, default: 'Música' }
  },
  data() {
    return {
      chords: [], 
      loading: false,
      isEditing: false,
      editableText: ''
    };
  },
  methods: {
    async loadChords() {
      if (!this.musicId) return;
      this.loading = true;
      try {
        const data = await fetchChordsByMusicId(this.musicId);
        this.chords = Array.isArray(data) ? data : (data ? [data] : []);
      } catch (error) {
        console.error("Erro ao carregar cifra:", error);
      } finally {
        this.loading = false;
      }
    },

    startEdit() {
      this.editableText = this.chords.length > 0 ? this.chords[0].fullSheet : '';
      this.isEditing = true;
    },

    cancelEdit() {
      this.isEditing = false;
      this.editableText = '';
    },

    async saveChords() {
      this.loading = true;
      try {
        const payload = { fullSheet: this.editableText };
        
        if (this.chords.length > 0 && this.chords[0].id) {
          await updateChord(this.chords[0].id, payload);
        } else {
          await createChord(this.musicId, payload);
        }
        
        this.isEditing = false;
        await this.loadChords(); 
      } catch (error) {
        alert("Erro ao salvar cifra. Verifique o console.");
        console.error(error);
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    musicId: { immediate: true, handler: 'loadChords' }
  }
};
</script>

<style scoped>
.chords-container { 
  max-width: 900px; 
  margin: 10px auto; 
}

.notebook-page {
  background: #1e1a17; 
  background-image: 
    linear-gradient(90deg, transparent 79px, #4d1212 79px, #4d1212 81px, transparent 81px),
    linear-gradient(rgba(74, 63, 53, 0.3) 0.1em, transparent 0.1em);
  background-size: 100% 1.55em; 
  padding: 60px 40px 40px 100px;
  min-height: 80vh;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border-radius: 4px;
  position: relative;
  border: 1px solid #2c241e;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 2px solid #3d3128;
  padding-bottom: 10px;
}

h1 {
  font-family: 'Crimson Text', serif;
  color: #d1c5a5; 
  font-size: 1.6rem;
  margin: 0;
}

.tag {
  font-size: 0.7rem;
  background: #3d3128;
  color: #a68b6d;
  padding: 2px 8px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sheet-editor {
  width: 100%;
  min-height: 500px;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.15rem;
  line-height: 1.55em;
  color: #e0d8c3; 
  resize: vertical;
  font-weight: 600;
}

.sheet {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.15rem;
  line-height: 1.55em; 
  color: #ffffff; 
  white-space: pre-wrap;
  margin: 0;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.edit-actions { display: flex; gap: 10px; }

.edit-btn, .save-btn, .cancel-btn {
  padding: 6px 16px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  border: 1px solid #4a3f35;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.edit-btn { background: #2c241e; color: #a68b6d; }
.save-btn { background: #a68b6d; color: #1e1a17; border: none; }
.cancel-btn { background: transparent; color: #cc0000; border-color: #4d1212; }

.edit-btn:hover { background: #4a3f35; color: #d1c5a5; }
.save-btn:hover { background: #d1c5a5; color: #000; }
.cancel-btn:hover { background: #4d1212; color: #fff; }

.status-msg { 
  text-align: center; 
  margin-top: 50px; 
  color: #5c4b3c; 
  font-style: italic; 
}
</style>