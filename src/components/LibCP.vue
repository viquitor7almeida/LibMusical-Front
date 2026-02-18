<template>
  <div class="book-container">
    <div class="book-cover">
      <div class="paper">
        <div class="spine-shadow"></div>
        
        <div class="header-actions">
          <button @click="openEditModal({})" class="add-btn">+</button>
        </div>

        <table class="book-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Compositores</th>
              <th>Versos</th>
              <th>Cifra</th>
              <th>Mp3</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="music in paginatedData" :key="music.id">
              <td>{{ music.name }}</td>
              <td>{{ music.composers }}</td>
              <td>
                <button @click="openVerses(music)" class="action-btn">Ver Versos</button>
              </td>
              <td>
                <button @click="openChords(music)" class="action-btn">Ver Cifra</button>
              </td>
              <td>
                <button v-if="music.audioUrl" @click="playAudio(music.audioUrl)" class="audio-btn">
                  {{ playingUrl === music.audioUrl ? '⏸️' : '▶️' }}
                </button>
                <span v-else>-</span>
              </td>
              <td class="row-actions">
                <button @click="openEditModal(music)" class="row-btn edit" title="Editar">✎</button>
                <button @click="handleDelete(music.id)" class="row-btn delete" title="Excluir">✕</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" v-if="musics.length > 0">
          <button :disabled="currentPage === 1" @click="currentPage--" class="page-btn">«</button>
          <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
          <button :disabled="currentPage === totalPages" @click="currentPage++" class="page-btn">»</button>
        </div>
      </div>
    </div>

    <div v-if="activeModal && (activeModal === 'verses' || activeModal === 'chords')" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content paper">
        <button class="close-modal" @click="closeModal">X</button>
        <VersesDisplay v-if="activeModal === 'verses'" :musicId="selectedMusic.id" :musicName="selectedMusic.name" />
        <ChordsDisplay v-if="activeModal === 'chords'" :musicId="selectedMusic.id" :musicName="selectedMusic.name" />
      </div>
    </div>

    <MusicEditModal 
      v-if="activeModal === 'edit'" 
      :musicData="selectedMusic" 
      :loading="submitting"
      @close="closeModal" 
      @save="handleSaveMusic"
    />

    <audio ref="player" @ended="playingUrl = null"></audio>
  </div>
</template>

<script>
import { fetchMusicsByUser, deleteMusic, updateMusic, createMusic, uploadMusicAudio } from './../services/MusicService.js';
import { getUserId } from './../services/AuthService.js';
import VersesDisplay from './VersesCP.vue';
import ChordsDisplay from './ChordSymbolsCP.vue';
import MusicEditModal from './MusicEditCP.vue'; // Importando o novo componente

export default {
  name: 'LibCP',
  components: { VersesDisplay, ChordsDisplay, MusicEditModal },
  data() {
    return {
      musics: [],
      currentPage: 1,
      itemsPerPage: 15, 
      playingUrl: null,
      activeModal: null, 
      selectedMusic: null,
      submitting: false
    };
  },
  computed: {
    totalPages() {
      if (!this.musics || this.musics.length === 0) return 1;
      return Math.ceil(this.musics.length / this.itemsPerPage);
    },
    paginatedData() {
      if (!this.musics || this.musics.length === 0) return [];
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.musics.slice(start, end);
    }
  },
  methods: {
    async loadMusics() {
      try {
        const userId = getUserId();
        if (!userId) {
          this.$router.push('/login');
          return;
        }
        const response = await fetchMusicsByUser(userId);
        this.musics = response?.content || (Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Erro na requisição LibCP:", error);
      }
    },
    async handleDelete(id) {
      if (!confirm("Excluir esta música permanentemente?")) return;
      try {
        await deleteMusic(id);
        await this.loadMusics();
      } catch (error) {
        console.error("Erro ao excluir música:", error);
      }
    },
    async handleSaveMusic({ music, file }) {
      this.submitting = true;
      try {
        let savedMusic;
        if (music.id) {
          savedMusic = await updateMusic(music.id, music);
        } else {
          const userId = getUserId();
          savedMusic = await createMusic({ ...music, userId });
        }

        if (file && savedMusic.id) {
          await uploadMusicAudio(savedMusic.id, file);
        }

        await this.loadMusics();
        this.closeModal();
      } catch (error) {
        console.error("Erro ao salvar música:", error);
        alert("Erro ao salvar dados.");
      } finally {
        this.submitting = false;
      }
    },
    openVerses(music) {
      this.selectedMusic = music;
      this.activeModal = 'verses';
    },
    openChords(music) {
      this.selectedMusic = music;
      this.activeModal = 'chords';
    },
    openEditModal(music) {
      this.selectedMusic = { ...music }; // Cópia para não alterar a lista antes de salvar
      this.activeModal = 'edit';
    },
    closeModal() {
      this.activeModal = null;
      this.selectedMusic = null;
    },
    playAudio(url) {
      const audio = this.$refs.player;
      if (this.playingUrl === url) {
        audio.pause();
        this.playingUrl = null;
      } else {
        this.playingUrl = url;
        audio.src = url;
        audio.play();
      }
    }
  },
  mounted() {
    this.loadMusics();
  }
};
</script>

<style scoped>
.book-container {
  max-width: 950px;
  margin: 40px auto;
  perspective: 1000px;
}

.book-cover {
  background-color: #1a120b; 
  padding: 15px 15px 15px 30px;
  border-radius: 5px 15px 15px 5px;
  box-shadow: 15px 15px 30px rgba(0,0,0,0.6), inset 8px 0 15px rgba(0,0,0,0.5);
  position: relative;
}

.paper {
  background-color: #2c241e; 
  background-image: 
    linear-gradient(90deg, rgba(0,0,0,0.2) 0%, transparent 5%), 
    repeating-linear-gradient(transparent 0px, transparent 34px, rgba(74, 63, 53, 0.5) 35px);
  padding: 50px 40px;
  min-height: 700px;
  border-radius: 2px 10px 10px 2px;
  position: relative;
  box-shadow: inset 4px 0 10px rgba(0,0,0,0.3);
  font-family: 'Crimson Text', 'Georgia', serif;
}

.spine-shadow {
  position: absolute; left: 0; top: 0; bottom: 0; width: 45px;
  background: linear-gradient(90deg, rgba(0,0,0,0.4) 0%, transparent 100%);
  pointer-events: none;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.add-btn {
  background: #3d3128;
  color: #6e6448;
  border: 1px solid #4a3f35;
  padding: 3px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  font-size: large;
  text-transform: uppercase;
  transition: all 0.3s;
}

.add-btn:hover {
  background: #4a3f35;
  color: #fff;
}

.book-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }

.book-table th { 
  text-align: left; 
  font-variant: small-caps; 
  font-size: 1.1rem; 
  color: #d1c5a5; 
  border-bottom: 2px solid #4a3f35; 
  padding-bottom: 8px; 
  letter-spacing: 1px;
}

.book-table td { 
  padding: 14px 8px; 
  color: #e0d8c3; 
  border-bottom: 1px solid rgba(74, 63, 53, 0.4); 
}

.action-btn { 
  background: none; 
  border: none; 
  color: #a68b6d; 
  font-style: italic; 
  font-weight: bold; 
  cursor: pointer; 
  transition: all 0.3s; 
}

.action-btn:hover { 
  color: #d1c5a5; 
  text-shadow: 0 0 8px rgba(209, 197, 165, 0.4);
}

.row-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.row-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #5c4b3c;
  transition: color 0.2s;
}

.row-btn.edit:hover { color: #d1c5a5; }
.row-btn.delete:hover { color: #ff4d4d; }

.audio-btn { 
  background: none; 
  border: none; 
  cursor: pointer; 
  font-size: 1.2rem; 
  filter: sepia(1) brightness(0.8); 
}

.pagination { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  gap: 20px; 
  margin-top: auto; 
  padding-top: 20px; 
}

.page-btn { 
  background: transparent; 
  border: 1px solid #4a3f35; 
  color: #d1c5a5; 
  font-size: 1.1rem; 
  border-radius: 50%; 
  width: 35px; 
  height: 35px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #4a3f35;
  color: #f4ecd8;
}

.page-btn:disabled { opacity: 0.2; }
.page-info { font-style: italic; color: #a68b6d; }

.modal-overlay { 
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
  background: rgba(0, 0, 0, 0.9); 
  display: flex; justify-content: center; align-items: center; 
  z-index: 1000; backdrop-filter: blur(5px); 
}

.modal-content { 
  width: 90%; 
  max-width: 800px; 
  max-height: 85vh; 
  border: 10px solid #1a120b; 
  overflow-y: auto; 
  background-color: #2c241e;
}

.close-modal { 
  position: absolute; top: 15px; right: 15px; 
  background: #4a3f35; 
  color: #d1c5a5; 
  border: none; padding: 5px 12px; 
  cursor: pointer; border-radius: 3px; 
  z-index: 10;
}
</style>