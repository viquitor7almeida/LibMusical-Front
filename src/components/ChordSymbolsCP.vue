<template>
  <div class="chords-container">
    <div class="belt-control">
      <button 
        class="toggle-belt-btn" 
        :class="{ 'active': showBelt }" 
        @click="showBelt = !showBelt"
      >
        <span class="icon">{{ showBelt ? '✕' : '♫' }}</span>
        <span class="text">{{ showBelt ? 'Fechar Esteira' : 'Ver Acordes' }}</span>
      </button>
    </div>

    <transition name="slide-belt">
      <div v-if="showBelt" class="belt-wrapper">
        <MiniChordsCP 
          v-model="chordShapes" 
          :musicId="musicId" 
        />
      </div>
    </transition>

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
import { fetchChordsByMusic } from './../services/MusicChordsService.js';
import MiniChordsCP from './MiniChordsCP.vue';

export default {
  name: 'ChordsDisplay',
  components: { MiniChordsCP },
  props: {
    musicId: { type: Number, required: true },
    musicName: { type: String, default: 'Música' }
  },
  data() {
    return {
      chords: [], 
      chordShapes: [], 
      loading: false,
      isEditing: false,
      showBelt: false,
      editableText: ''
    };
  },
  methods: {
    async loadChords() {
      if (!this.musicId) return;
      this.loading = true;
      try {
        const [cifraData, shapesData] = await Promise.all([
          fetchChordsByMusicId(this.musicId),
          fetchChordsByMusic(this.musicId)
        ]);

        this.chords = Array.isArray(cifraData) ? cifraData : (cifraData ? [cifraData] : []);
        this.chordShapes = Array.isArray(shapesData) ? shapesData : (shapesData?.content || []);
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

.belt-control {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.toggle-belt-btn {
  background: #2c241e;
  border: 2px solid #a68b6d;
  color: #d1c5a5;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Crimson Text', serif;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 4px 4px 0px #1a140f;
}

.toggle-belt-btn:hover {
  background: #3d3128;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px #1a140f;
}

.toggle-belt-btn:active {
  transform: translate(0, 0);
  box-shadow: 2px 2px 0px #1a140f;
}

.toggle-belt-btn.active {
  background: #6e1a1a;
  border-color: #8e1d1d;
  color: #fff;
}

.toggle-belt-btn .icon {
  font-size: 1.2rem;
}

.belt-wrapper {
  margin-bottom: 15px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 5px 15px rgba(0,0,0,0.4);
}

.slide-belt-enter-active, .slide-belt-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 300px;
  opacity: 1;
}

.slide-belt-enter-from, .slide-belt-leave-to {
  max-height: 0;
  opacity: 0;
  margin-bottom: 0;
  transform: translateY(-20px);
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