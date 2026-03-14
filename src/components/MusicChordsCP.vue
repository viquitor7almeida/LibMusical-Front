<template>
  <div class="verses-container">
    <div class="notebook-page">
      <header class="page-header">
        <div class="title-group">
          <h1>{{ musicName }}</h1>
          <span class="subtitle">Dicionário de Shapes</span>
        </div>
        <button @click="toggleForm" class="back-btn">
          {{ showForm ? 'Cancelar' : 'Novo Shape' }}
        </button>
      </header>

      <div class="lyrics-content">
        <transition name="fade-slide">
          <div v-if="showForm" class="verse-form verse-card">
            <div class="form-row-inline">
              <div class="form-group flex-2">
                <label>Nome do Acorde *</label>
                <input 
                  v-model="newChord.chordName" 
                  placeholder="Ex: C#m7, G/B, Asus4..." 
                  class="form-input section-name-input"
                />
              </div>
            </div>
            <div class="form-group">
              <label>Imagem do Shape</label>
              <div class="custom-file-upload">
                <label class="file-label">
                  <input 
                    type="file" 
                    @change="handleFileSelect" 
                    accept="image/*"
                    class="hidden-input"
                  />
                  <span class="file-custom-btn">
                    {{ selectedFile ? '📷 ' + selectedFile.name : 'Selecionar Imagem' }}
                  </span>
                </label>
              </div>
            </div>
            <button @click="handleSubmit" :disabled="submitting" class="save-btn">
              {{ submitting ? 'Salvando...' : (isEditing ? 'Atualizar Shape' : 'Confirmar Shape') }}
            </button>
          </div>
        </transition>

        <div v-if="loading" class="status-msg">Carregando shapes...</div>
        
        <div v-else-if="chords && chords.length > 0" class="chords-grid-layout">
          <draggable 
            v-model="chords" 
            item-key="id" 
            handle=".drag-handle"
            @end="handleDragEnd"
            ghost-class="ghost-card"
            class="grid-wrapper"
            :animation="300"
          >
            <template #item="{ element }">
              <div class="chord-item-container">
                <div class="verse-card chord-display-card">
                  <div class="drag-handle">⠿</div>
                  
                  <div class="verse-actions">
                    <button @click="editChord(element)" class="action-btn edit" title="Editar">✎</button>
                    <button @click="handleDelete(element.id)" class="action-btn delete" title="Excluir">✕</button>
                  </div>

                  <div class="section-label">{{ element.chordName }}</div>
                  
                  <div class="shape-image-wrapper">
                    <div class="image-inner-container">
                      <img v-if="element.photoUrl" :src="getImageUrl(element.photoUrl)" :alt="element.chordName">
                      <div v-else class="no-shape-placeholder">
                        <span>Sem Foto</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <div v-else-if="!showForm" class="status-msg">
          Nenhum shape de acorde cadastrado para esta música.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import { 
  fetchChordsByMusic, 
  createChord, 
  uploadChordPhoto, 
  updateChord, 
  deleteChord 
} from './../services/MusicChordsService.js';

export default {
  name: 'MusicChordsCP',
  components: { draggable },
  props: {
    musicId: { type: Number, required: true },
    musicName: { type: String, default: 'Música' }
  },
  data() {
    return {
      chords: [],
      loading: false,
      showForm: false,
      submitting: false,
      isEditing: false,
      editingId: null,
      selectedFile: null,
      newChord: {
        chordName: '',
        position: 0,
        musicId: null
      }
    };
  },
  methods: {
    getImageUrl(path) {
      return `${import.meta.env.VITE_APP_API_URL}/uploads/${path}`;
    },
    async loadChords() {
      if (!this.musicId) return;
      this.loading = true;
      try {
        const data = await fetchChordsByMusic(this.musicId);
        this.chords = data.sort((a, b) => (a.position || 0) - (b.position || 0));
      } catch (error) {
        console.error(error);
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
    handleFileSelect(event) {
      this.selectedFile = event.target.files[0];
    },
    async handleDragEnd() {
      try {
        const updates = this.chords.map((chord, index) => {
          return updateChord(chord.id, { ...chord, position: index, musicId: this.musicId });
        });
        await Promise.all(updates);
        this.$emit('updated');
      } catch (error) {
        console.error(error);
      }
    },
    editChord(chord) {
      this.isEditing = true;
      this.editingId = chord.id;
      this.newChord = { ...chord };
      this.showForm = true;
    },
    async handleSubmit() {
      if (!this.newChord.chordName.trim()) {
        alert("O nome do acorde é obrigatório.");
        return;
      }
      this.submitting = true;
      try {
        let savedChord;
        if (this.isEditing) {
          savedChord = await updateChord(this.editingId, { ...this.newChord, musicId: this.musicId });
        } else {
          const position = this.chords.length;
          savedChord = await createChord({ ...this.newChord, musicId: this.musicId, position });
        }

        if (this.selectedFile && savedChord.id) {
          await uploadChordPhoto(savedChord.id, this.selectedFile);
        }

        this.resetForm();
        await this.loadChords();
        this.$emit('updated');
      } catch (error) {
        console.error(error);
      } finally {
        this.submitting = false;
      }
    },
    async handleDelete(id) {
      if (!confirm("Excluir este shape permanentemente?")) return;
      try {
        await deleteChord(id);
        await this.loadChords();
        this.$emit('updated');
      } catch (error) {
        console.error(error);
      }
    },
    resetForm() {
      this.newChord = { chordName: '', position: 0, musicId: null };
      this.selectedFile = null;
      this.showForm = false;
      this.isEditing = false;
      this.editingId = null;
    }
  },
  watch: {
    musicId: { immediate: true, handler: 'loadChords' }
  }
};
</script>

<style scoped>
.verses-container {
  max-width: 800px;
  margin: 10px auto;
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

.chords-grid-layout {
  margin-top: 20px;
}

.grid-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.chord-item-container {
  margin-bottom: 10px;
  transition: transform 0.3s ease;
}

.chord-item-container:hover {
  transform: translateY(-5px);
}

.chord-display-card {
  height: 240px;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.3s ease;
}

.chord-display-card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.4);
}

.verse-card {
  background: rgba(44, 36, 30, 0.6);
  border-left: 4px solid #4d1212; 
  padding: 15px 15px 15px 40px;
  border-radius: 0 8px 8px 0;
  position: relative;
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
  transition: color 0.2s;
}

.drag-handle:hover {
  color: #d1c5a5;
}

.drag-handle:active {
  cursor: grabbing;
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
  gap: 12px;
  z-index: 5;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #5c4b3c;
  transition: all 0.2s ease;
}

.action-btn.edit:hover { 
  color: #d1c5a5; 
  transform: scale(1.2);
}

.action-btn.delete:hover { 
  color: #ff4d4d; 
  transform: scale(1.2);
}

.section-label {
  color: #a68b6d;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
  border-bottom: 1px dashed #3d3128;
  display: block;
  width: fit-content;
}

.shape-image-wrapper {
  flex: 1;
  background: #120f0d;
  border: 1px solid #3d3128;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.image-inner-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  box-sizing: border-box;
}

.image-inner-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.image-inner-container img:hover {
  transform: scale(1.05);
}

.no-shape-placeholder {
  color: #3d3128;
  font-style: italic;
  font-size: 0.8rem;
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
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #d1c5a5;
  outline: none;
}

.custom-file-upload {
  margin-bottom: 15px;
}

.file-label {
  cursor: pointer;
  display: block;
}

.hidden-input {
  display: none;
}

.file-custom-btn {
  display: block;
  width: 100%;
  background: #120f0d;
  border: 1px dashed #4a3f35;
  color: #a68b6d;
  padding: 12px;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.file-custom-btn:hover {
  background: #1e1a17;
  border-color: #d1c5a5;
  color: #d1c5a5;
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
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  background: #6e1a1a;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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