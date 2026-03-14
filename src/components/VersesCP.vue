<template>
  <div class="verses-container">
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
          <span class="subtitle">Estrutura e Acordes</span>
        </div>
        <button @click="toggleForm" class="back-btn">
          {{ showForm ? 'Cancelar' : 'Adicionar Parte' }}
        </button>
      </header>

      <div class="lyrics-content">
        <transition name="fade-slide">
          <div v-if="showForm" class="verse-form verse-card">
            <div class="form-row-inline">
              <div class="form-group flex-2">
                <label>Identificação da Parte (Letra) *</label>
                <input 
                  v-model="newVerse.lyrics" 
                  placeholder="Ex: Refrão, Intro, Estrofe 1..." 
                  class="form-input section-name-input"
                />
              </div>
            </div>
            <div class="form-group">
              <label>Sequência de Acordes</label>
              <input 
                v-model="newVerse.chords" 
                placeholder="Ex: G | D | Em | C" 
                class="form-input chords-input"
              />
            </div>
            <button @click="handleSubmit" :disabled="submitting" class="save-btn">
              {{ submitting ? 'Salvando...' : (isEditing ? 'Atualizar Estrutura' : 'Confirmar Estrutura') }}
            </button>
          </div>
        </transition>

        <div v-if="loading" class="status-msg">Carregando estrutura...</div>
        
        <div v-else-if="verses && verses.length > 0">
          <draggable 
            v-model="verses" 
            item-key="id" 
            handle=".drag-handle"
            @end="handleDragEnd"
            ghost-class="ghost-card"
            :animation="300"
          >
            <template #item="{ element }">
              <div class="verse-row">
                <div class="verse-card item-display-card">
                  <div class="drag-handle" title="Arraste para reordenar">⠿</div>
                  
                  <div class="verse-actions">
                    <button @click="editVerse(element)" class="action-btn edit" title="Editar">✎</button>
                    <button @click="handleDelete(element.id)" class="action-btn delete" title="Excluir">✕</button>
                  </div>

                  <div class="section-label">{{ element.lyrics }}</div>
                  <pre v-if="element.chords" class="chords-line">{{ element.chords }}</pre>
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <div v-else-if="!showForm" class="status-msg">
          Nenhuma estrutura definida para esta música.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import { fetchVersesByMusicId, createVerse, updateVerse, deleteVerse } from './../services/VersesService.js';
import { fetchChordsByMusic } from './../services/MusicChordsService.js';
import MiniChordsCP from './MiniChordsCP.vue';

export default {
  name: 'VersesDisplay',
  components: { draggable, MiniChordsCP },
  props: {
    musicId: { type: Number, required: true },
    musicName: { type: String, default: 'Música' }
  },
  data() {
    return {
      verses: [],
      chordShapes: [],
      loading: false,
      showForm: false,
      showBelt: false,
      submitting: false,
      isEditing: false,
      editingId: null,
      newVerse: {
        lyrics: '', 
        chords: '',
        musicId: null
      }
    };
  },
  methods: {
    async loadVerses() {
      if (!this.musicId) return;
      this.loading = true;
      try {
        const [versesData, shapesData] = await Promise.all([
          fetchVersesByMusicId(this.musicId),
          fetchChordsByMusic(this.musicId)
        ]);

        this.verses = versesData.sort((a, b) => (a.position || 0) - (b.position || 0));
        this.chordShapes = Array.isArray(shapesData) ? shapesData : (shapesData?.content || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        this.loading = false;
      }
    },
    toggleForm() {
      if (this.showForm) {
        this.resetForm();
      } else {
        this.showForm = true;
      }
    },
    async handleDragEnd() {
      try {
        const updates = this.verses.map((verse, index) => {
          return updateVerse(verse.id, { ...verse, position: index });
        });
        await Promise.all(updates);
      } catch (error) {
        console.error("Erro ao salvar nova ordem:", error);
      }
    },
    editVerse(verse) {
      this.isEditing = true;
      this.editingId = verse.id;
      this.newVerse = { ...verse };
      this.showForm = true;
    },
    async handleSubmit() {
      if (!this.newVerse.lyrics.trim()) {
        alert("A identificação da parte é obrigatória.");
        return;
      }
      this.submitting = true;
      try {
        if (this.isEditing) {
          await updateVerse(this.editingId, this.newVerse);
        } else {
          const position = this.verses.length;
          await createVerse({ ...this.newVerse, musicId: this.musicId, position });
        }
        this.resetForm();
        await this.loadVerses();
      } catch (error) {
        console.error("Erro ao processar verso:", error);
      } finally {
        this.submitting = false;
      }
    },
    async handleDelete(id) {
      if (!confirm("Excluir esta parte?")) return;
      try {
        await deleteVerse(id);
        await this.loadVerses();
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
    },
    resetForm() {
      this.newVerse = { lyrics: '', chords: '', musicId: null };
      this.showForm = false;
      this.isEditing = false;
      this.editingId = null;
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

.toggle-belt-btn.active {
  background: #6e1a1a;
  border-color: #8e1d1d;
  color: #fff;
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
  transform: translateY(-20px);
}

.notebook-page {
  background: #1e1a17; 
  background-image: linear-gradient(rgba(74, 63, 53, 0.3) 1px, transparent 1px);
  background-size: 100% 32px;
  padding: 50px 40px 40px 60px;
  min-height: 80vh;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border-left: 5px double #4d1212;
  position: relative;
  border-radius: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center; 
  margin-bottom: 40px;
  padding-bottom: 15px;
  border-bottom: 2px solid #3d3128;
}

.title-group {
  flex: 1; 
}

h1 {
  font-family: 'Crimson Text', serif;
  margin: 0;
  color: #d1c5a5; 
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 1.5rem;
}

.subtitle {
  font-size: 0.9rem;
  color: #a68b6d; 
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
  text-transform: uppercase;
  white-space: nowrap; 
  margin-left: 20px; 
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #4a3f35;
  transform: translateY(-2px);
}

.verse-row {
  margin-bottom: 25px;
}

.verse-card {
  background: rgba(44, 36, 30, 0.6);
  border-left: 4px solid #4d1212; 
  padding: 15px 25px 15px 45px;
  border-radius: 0 8px 8px 0;
  position: relative;
  transition: all 0.3s ease;
}

.item-display-card:hover {
  transform: translateX(5px);
  background: rgba(54, 46, 40, 0.8);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.drag-handle {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: grab;
  color: #5c4b3c;
  font-size: 1.5rem;
  user-select: none;
}

.ghost-card {
  opacity: 0.3;
  background: #4d1212 !important;
}

.verse-actions {
  position: absolute;
  top: 10px;
  right: 15px;
  display: flex;
  gap: 15px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #5c4b3c;
  transition: all 0.2s ease;
}

.action-btn.edit:hover { color: #d1c5a5; }
.action-btn.delete:hover { color: #ff4d4d; }

.section-label {
  color: #a68b6d;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  border-bottom: 1px dashed #3d3128;
  display: inline-block;
}

.chords-line {
  font-family: 'Courier New', monospace;
  font-size: 1.3rem;
  font-weight: bold;
  color: #f0e6d2; 
  margin: 0;
  white-space: pre-wrap;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.verse-form {
  margin-bottom: 40px;
  border-left: 4px solid #d1c5a5;
  background: rgba(61, 49, 40, 0.3);
  padding: 20px;
}

.form-group label {
  display: block;
  color: #d1c5a5;
  font-size: 0.75rem;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.form-input {
  width: 100%;
  background: #120f0d;
  border: 1px solid #4a3f35;
  color: #e0d8c3;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
  box-sizing: border-box;
}

.save-btn {
  background: #4d1212;
  color: #d1c5a5;
  border: none;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  text-transform: uppercase;
}

.status-msg {
  text-align: center;
  margin-top: 50px;
  color: #5c4b3c;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>