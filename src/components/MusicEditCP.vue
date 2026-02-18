<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="notebook-page edit-modal">
      <header class="page-header">
        <div class="title-group">
          <h1>{{ musicData.id ? 'Editar Música' : 'Nova Música' }}</h1>
          <span class="subtitle">Ficha Técnica</span>
        </div>
        <button class="close-x" @click="$emit('close')">✕</button>
      </header>

      <div class="form-content">
        <div class="form-group">
          <label>Título da Obra</label>
          <input 
            v-model="localMusic.name" 
            type="text" 
            placeholder="Nome da música..." 
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Compositores / Artista</label>
          <input 
            v-model="localMusic.composers" 
            type="text" 
            placeholder="Ex: Lennon & McCartney" 
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Arquivo de Áudio (MP3)</label>
          <div class="file-input-wrapper">
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileChange" 
              accept="audio/*"
              class="hidden-file"
            />
            <button type="button" class="file-custom-btn" @click="$refs.fileInput.click()">
              {{ selectedFile ? selectedFile.name : 'Selecionar arquivo...' }}
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button @click="$emit('close')" class="btn-cancel">Descartar</button>
          <button @click="handleSave" :disabled="loading" class="btn-save">
            {{ loading ? 'Gravando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicEditModal',
  props: {
    musicData: {
      type: Object,
      default: () => ({ name: '', composers: '' })
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localMusic: { ...this.musicData },
      selectedFile: null
    };
  },
  methods: {
    handleFileChange(e) {
      this.selectedFile = e.target.files[0];
    },
    handleSave() {
      if (!this.localMusic.name.trim()) {
        alert("O título é obrigatório.");
        return;
      }
      this.$emit('save', {
        music: this.localMusic,
        file: this.selectedFile
      });
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.edit-modal {
  width: 90%;
  max-width: 500px;
  background: #1e1a17;
  background-image: linear-gradient(rgba(74, 63, 53, 0.3) 1px, transparent 1px);
  background-size: 100% 32px;
  padding: 40px 40px 40px 60px;
  border-left: 5px double #4d1212;
  border-radius: 4px;
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  border-bottom: 2px solid #3d3128;
  padding-bottom: 10px;
}

h1 {
  font-family: 'Crimson Text', serif;
  color: #d1c5a5;
  text-transform: uppercase;
  font-size: 1.4rem;
  margin: 0;
  letter-spacing: 1px;
}

.subtitle {
  color: #a68b6d;
  font-size: 0.8rem;
  font-style: italic;
}

.close-x {
  background: none;
  border: none;
  color: #5c4b3c;
  font-size: 1.2rem;
  cursor: pointer;
}

.close-x:hover { color: #ff4d4d; }

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  color: #a68b6d;
  font-size: 0.7rem;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-input {
  width: 100%;
  background: rgba(18, 15, 13, 0.8);
  border: 1px solid #4a3f35;
  color: #f0e6d2;
  padding: 10px;
  border-radius: 4px;
  font-family: inherit;
  box-sizing: border-box;
}

.file-input-wrapper {
  position: relative;
}

.hidden-file {
  display: none;
}

.file-custom-btn {
  width: 100%;
  background: #2c241e;
  border: 1px dashed #4a3f35;
  color: #d1c5a5;
  padding: 10px;
  cursor: pointer;
  text-align: left;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 40px;
}

.btn-save {
  flex: 2;
  background: #4d1212;
  color: #d1c5a5;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
}

.btn-cancel {
  flex: 1;
  background: transparent;
  color: #5c4b3c;
  border: 1px solid #3d3128;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save:hover:not(:disabled) { background: #631717; color: #fff; }
.btn-cancel:hover { background: #3d3128; color: #d1c5a5; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
</style>