<template>
  <div class="book-container">
    <div class="book-cover">
      <div class="paper">
        <div class="spine-shadow"></div>
        
        <table class="book-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Compositores</th>
              <th>Versos</th>
              <th>Cifra</th>
              <th>Mp3</th>
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

    <div v-if="activeModal && selectedMusic" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content paper">
        <button class="close-modal" @click="closeModal">X</button>
        <VersesDisplay v-if="activeModal === 'verses'" :musicId="selectedMusic.id" :musicName="selectedMusic.name" />
        <ChordsDisplay v-if="activeModal === 'chords'" :musicId="selectedMusic.id" :musicName="selectedMusic.name" />
      </div>
    </div>

    <audio ref="player" @ended="playingUrl = null"></audio>
  </div>
</template>

<script>
import { fetchMusicsByUser } from './../services/MusicService.js';
import { getUserId } from './../services/AuthService.js';
import VersesDisplay from './VersesCP.vue';
import ChordsDisplay from './ChordSymbolsCP.vue';

export default {
  name: 'LibCP',
  components: { VersesDisplay, ChordsDisplay },
  data() {
    return {
      musics: [],
      currentPage: 1,
      itemsPerPage: 15, 
      playingUrl: null,
      activeModal: null, 
      selectedMusic: null
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
    openVerses(music) {
      this.selectedMusic = music;
      this.activeModal = 'verses';
    },
    openChords(music) {
      this.selectedMusic = music;
      this.activeModal = 'chords';
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
  background-color: #5c3d2e; 
  padding: 15px 15px 15px 30px;
  border-radius: 5px 15px 15px 5px;
  box-shadow: 10px 10px 20px rgba(0,0,0,0.4), inset 5px 0 10px rgba(0,0,0,0.5);
  position: relative;
}
.paper {
  background-color: #f4ecd8; 
  background-image: linear-gradient(90deg, rgba(0,0,0,0.05) 0%, transparent 5%), repeating-linear-gradient(transparent 0px, transparent 34px, #d1c5a5 35px);
  padding: 50px 40px;
  min-height: 700px;
  border-radius: 2px 10px 10px 2px;
  position: relative;
  box-shadow: inset 2px 0 5px rgba(0,0,0,0.1);
  font-family: 'Crimson Text', 'Georgia', serif;
}
.spine-shadow {
  position: absolute; left: 0; top: 0; bottom: 0; width: 40px;
  background: linear-gradient(90deg, rgba(0,0,0,0.2) 0%, transparent 100%);
  pointer-events: none;
}
.book-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
.book-table th { text-align: left; font-variant: small-caps; font-size: 1.2rem; color: #5d4037; border-bottom: 2px solid #bdae93; padding-bottom: 5px; }
.book-table td { padding: 12px 8px; color: #3e2723; border-bottom: 1px solid rgba(189, 174, 147, 0.4); }
.action-btn { background: none; border: 1px solid transparent; color: #795548; font-style: italic; font-weight: bold; cursor: pointer; transition: all 0.3s; }
.action-btn:hover { color: #3e2723; text-decoration: underline; }
.audio-btn { background: none; border: none; cursor: pointer; font-size: 1.3rem; filter: sepia(1); }
.pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: auto; padding-top: 20px; }
.page-btn { background: transparent; border: 1px solid #bdae93; color: #5d4037; font-size: 1.2rem; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; }
.page-btn:disabled { opacity: 0.3; }
.page-info { font-style: italic; color: #8d6e63; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(3px); }
.modal-content { width: 85%; max-width: 700px; max-height: 85vh; border: 8px solid #5c3d2e; overflow-y: auto; }
.close-modal { position: absolute; top: 15px; right: 15px; background: #5c3d2e; color: #f4ecd8; border: none; padding: 5px 12px; cursor: pointer; border-radius: 3px; font-weight: bold; }
</style>