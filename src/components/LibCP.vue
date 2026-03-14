<template>
  <div class="book-container">
    <div class="book-cover">
      <div class="paper">
        <div class="spine-shadow"></div>
        
        <div class="header-actions">
          <div class="header-center">
            <transition name="fade" mode="out-in">
              <h2 class="grid-title" :key="currentType">
                {{ currentType === 'COMPOSITION' ? 'Minhas Composições' : 'Cifras & Covers' }}
              </h2>
            </transition>
            <button @click="openEditModal({ type: currentType })" class="add-btn">+</button>
          </div>
          
          <button @click="toggleType" class="switch-grid-btn">
            Ver {{ currentType === 'COMPOSITION' ? 'Covers' : 'Composições' }}
          </button>
        </div>

        <table class="book-table">
          <thead>
            <tr>
              <th class="col-titulo">Título</th>
              <th class="col-compositores">Compositores</th>
              <th class="col-btn">Versos</th>
              <th class="col-btn">Cifra</th>
              <th class="col-btn">Acordes</th>
              <th class="col-mp3">Mp3</th>
              <th class="col-acoes">Ações</th>
            </tr>
          </thead>
          <transition-group name="list" tag="tbody">
            <tr v-for="music in paginatedData" :key="music.id" class="table-row">
              <td class="col-titulo">
                <span class="text-truncate" :title="music.name">{{ music.name }}</span>
              </td>
              <td class="col-compositores">
                <span class="text-truncate" :title="music.composers">{{ music.composers }}</span>
              </td>
              <td class="col-btn">
                <button @click="openVerses(music)" class="action-btn">Ver Versos</button>
              </td>
              <td class="col-btn">
                <button @click="openChords(music)" class="action-btn">Ver Cifra</button>
              </td>
              <td class="col-btn">
                <button @click="openMusicChords(music)" class="action-btn">Ver Acordes</button>
              </td>
              <td class="col-mp3">
                <div v-if="music.audioUrl" class="audio-cell">
                  <button @click="playAudio(music)" class="audio-btn">
                    {{ currentPlayingUrl === music.audioUrl ? '||' : '►' }}
                  </button>
                </div>
                <div v-else class="audio-cell">
                  <label class="inline-add-btn" :class="{ 'loading-spinner': submittingId === music.id }">
                    <input 
                      type="file" 
                      accept="audio/*" 
                      @change="handleDirectUpload($event, music.id)" 
                      hidden
                      :disabled="submittingId === music.id"
                    >
                    {{ submittingId === music.id ? '...' : '+' }}
                  </label>
                </div>
              </td>
              <td class="col-acoes">
                <div class="row-actions">
                  <button @click="openEditModal(music)" class="row-btn edit" title="Editar">✎</button>
                  <button @click="handleDelete(music.id)" class="row-btn delete" title="Excluir">✕</button>
                </div>
              </td>
            </tr>
          </transition-group>
        </table>

        <div class="pagination" v-if="musics.length > 0">
          <button :disabled="currentPage === 1" @click="currentPage--" class="page-btn">«</button>
          <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
          <button :disabled="currentPage === totalPages" @click="currentPage++" class="page-btn">»</button>
        </div>
      </div>
    </div>

    <transition name="modal-fade">
      <div v-if="activeModal && (activeModal === 'verses' || activeModal === 'chords' || activeModal === 'music-chords')" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content paper">
          <button class="close-modal" @click="closeModal">X</button>
          <VersesDisplay v-if="activeModal === 'verses'" :musicId="selectedMusic.id" :musicName="selectedMusic.name" />
          <ChordsDisplay v-if="activeModal === 'chords'" :musicId="selectedMusic.id" :musicName="selectedMusic.name" />
          <MusicChordsCP v-if="activeModal === 'music-chords'" :musicId="selectedMusic.id" :musicName="selectedMusic.name" @updated="loadMusics" />
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <MusicEditModal 
        v-if="activeModal === 'edit'" 
        :musicData="selectedMusic" 
        :loading="submitting"
        @close="closeModal" 
        @save="handleSaveMusic"
      />
    </transition>
  </div>
</template>

<script>
import { fetchMusicsByUser, deleteMusic, updateMusic, createMusic, uploadMusicAudio } from './../services/MusicService.js';
import { getUserId } from './../services/AuthService.js';
import VersesDisplay from './VersesCP.vue';
import ChordsDisplay from './ChordSymbolsCP.vue';
import MusicEditModal from './MusicEditCP.vue';
import MusicChordsCP from './MusicChordsCP.vue';

export default {
  name: 'LibCP',
  components: { VersesDisplay, ChordsDisplay, MusicEditModal, MusicChordsCP },
  props: {
    currentPlayingUrl: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      musics: [],
      currentType: 'COMPOSITION',
      currentPage: 1,
      itemsPerPage: 15, 
      activeModal: null, 
      selectedMusic: null,
      submitting: false,
      submittingId: null
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
        const response = await fetchMusicsByUser(userId, this.currentType);
        this.musics = response?.content || (Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Erro na requisição LibCP:", error);
      }
    },
    toggleType() {
      this.currentType = this.currentType === 'COMPOSITION' ? 'COVER' : 'COMPOSITION';
      this.currentPage = 1;
      this.loadMusics();
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
    async handleDirectUpload(event, musicId) {
      const file = event.target.files[0];
      if (!file) return;
      this.submittingId = musicId;
      try {
        await uploadMusicAudio(musicId, file);
        await this.loadMusics();
      } catch (error) {
        alert("Erro ao subir arquivo de áudio.");
        console.error(error);
      } finally {
        this.submittingId = null;
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
          savedMusic = await createMusic({ ...music, userId, type: music.type });
        }
        
        if (file && savedMusic.id) {
          await uploadMusicAudio(savedMusic.id, file);
        }

        if (this.currentType !== music.type) {
          this.currentType = music.type;
        }

        await this.loadMusics();
        this.closeModal();
      } catch (error) {
        console.error("Erro ao salvar música:", error);
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
    openMusicChords(music) {
      this.selectedMusic = music;
      this.activeModal = 'music-chords';
    },
    openEditModal(music) {
      this.selectedMusic = { ...music, type: music.type || this.currentType };
      this.activeModal = 'edit';
    },
    closeModal() {
      this.activeModal = null;
      this.selectedMusic = null;
    },
    playAudio(music) {
      if (this.currentPlayingUrl === music.audioUrl) {
        this.$emit('play-music', { audioUrl: null, name: '' });
      } else {
        this.$emit('play-music', music);
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
  max-width: 90%;
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
  min-height: 950px;
  border-radius: 2px 10px 10px 2px;
  position: relative;
  box-shadow: inset 4px 0 10px rgba(0,0,0,0.3);
  font-family: 'Crimson Text', 'Georgia', serif;
}

.spine-shadow {
  position: absolute; 
  left: 0; 
  top: 0; 
  bottom: 0; 
  width: 45px;
  background: linear-gradient(90deg, rgba(0,0,0,0.4) 0%, transparent 100%);
  pointer-events: none;
}

.header-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid #4a3f35;
  padding-bottom: 15px;
  position: relative;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 20px;
}

.grid-title {
  color: #d1c5a5;
  font-family: 'Crimson Text', serif;
  font-variant: small-caps;
  margin: 0;
  font-size: 2.2rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.add-btn {
  background: #3d3128;
  color: #d1c5a5;
  border: 1px solid #4a3f35;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1.4rem;
  transition: all 0.3s;
}

.add-btn:hover {
  background: #4a3f35;
  color: #fff;
  transform: scale(1.1);
}

.switch-grid-btn {
  position: absolute;
  right: 0;
  background: transparent;
  border: 1px solid #4a3f35;
  color: #a68b6d;
  padding: 5px 12px;
  cursor: pointer;
  font-family: 'Crimson Text', serif;
  font-style: italic;
  font-size: 0.9rem;
  transition: all 0.3s;
  border-radius: 4px;
}

.switch-grid-btn:hover {
  background: #4a3f35;
  color: #d1c5a5;
}

.book-table { 
  width: 100%; 
  border-collapse: collapse; 
  margin-bottom: 30px; 
  table-layout: fixed;
}

.book-table th, .book-table td {
  text-align: center;
  vertical-align: middle;
  padding: 12px 5px;
}

.book-table th { 
  font-variant: small-caps; 
  font-size: 1.1rem; 
  color: #d1c5a5; 
  border-bottom: 2px solid #4a3f35; 
  padding-bottom: 10px;
}

.book-table td { 
  color: #e0d8c3; 
  border-bottom: 1px solid rgba(74, 63, 53, 0.4); 
}

.col-titulo { width: 22%; }
.col-compositores { width: 18%; }
.col-btn { width: 13%; }
.col-mp3 { width: 8%; }
.col-acoes { width: 13%; }

.text-truncate {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.audio-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.audio-btn { 
  background: none; 
  border: none; 
  cursor: pointer; 
  font-size: 1.2rem; 
  color: #d1c5a5;
  transition: transform 0.2s;
}

.audio-btn:hover {
  transform: scale(1.2);
}

.inline-add-btn {
  background: #6f5c4d;
  color: #d5d5d5;
  border: 1px solid #8a827b;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.inline-add-btn:hover {
  background: #4a3f35;
  color: #fff;
}

.action-btn { 
  background: none; 
  border: none; 
  color: #a68b6d; 
  font-style: italic; 
  font-weight: bold; 
  cursor: pointer; 
  transition: all 0.3s; 
  white-space: nowrap; 
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
  transition: 0.2s;
}

.row-btn.edit:hover { color: #d1c5a5; }
.row-btn.delete:hover { color: #ff4d4d; }

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
  border-radius: 50%; 
  width: 35px; 
  height: 35px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer;
}

.page-btn:hover:not(:disabled) {
  background: #4a3f35;
  color: #f4ecd8;
}

.page-btn:disabled { opacity: 0.2; }
.page-info { font-style: italic; color: #a68b6d; }

.modal-overlay { 
  position: fixed; 
  inset: 0;
  background: rgba(0, 0, 0, 0.9); 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 1000; 
  backdrop-filter: blur(5px); 
}

.modal-content { 
  width: 90%; 
  max-width: 800px; 
  max-height: 85vh; 
  border: 10px solid #1a120b; 
  overflow-y: auto; 
  background-color: #2c241e;
  position: relative;
}

.close-modal { 
  position: absolute; 
  top: 15px; 
  right: 15px; 
  background: #4a3f35; 
  color: #d1c5a5; 
  border: none; 
  padding: 5px 12px; 
  cursor: pointer; 
}

.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from { opacity: 0; transform: translateY(15px); }
.list-leave-to { opacity: 0; transform: translateY(-15px); }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>