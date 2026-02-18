<template>
  <transition name="fade">
    <div v-if="audioUrl" class="player-static-footer">
      <div class="player-wrapper">
        <div class="music-info">
          <span class="vinyl">💿</span>
          <div class="details">
            <p class="title">{{ musicName }}</p>
            <p class="status">Executando agora</p>
          </div>
        </div>

        <div class="player-controls">
          <audio 
            ref="audioSource" 
            :src="audioUrl" 
            @timeupdate="updateProgress" 
            @ended="$emit('ended')"
            autoplay
          ></audio>
          
          <button @click="togglePlay" class="play-btn">
            {{ isPlaying ? '⏸' : '▶' }}
          </button>

          <div class="progress-area">
            <span class="time-label">{{ formatTime(currentTime) }}</span>
            <div class="bar-bg" @click="seek">
              <div class="bar-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <span class="time-label">{{ formatTime(duration) }}</span>
          </div>
        </div>

        <div class="close-area">
          <button class="minimal-close" @click="$emit('close')" title="Fechar Player">✕</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: ['audioUrl', 'musicName'],
  data() {
    return { isPlaying: true, currentTime: 0, duration: 0, progress: 0 };
  },
  watch: {
    audioUrl() {
      this.isPlaying = true;
    }
  },
  methods: {
    togglePlay() {
      const audio = this.$refs.audioSource;
      if (this.isPlaying) audio.pause(); else audio.play();
      this.isPlaying = !this.isPlaying;
    },
    updateProgress() {
      const audio = this.$refs.audioSource;
      if (!audio) return;
      this.currentTime = audio.currentTime;
      this.duration = audio.duration || 0;
      this.progress = (this.currentTime / this.duration) * 100;
    },
    seek(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      this.$refs.audioSource.currentTime = pos * this.duration;
    },
    formatTime(s) {
      if (!s) return '0:00';
      const m = Math.floor(s / 60);
      const r = Math.floor(s % 60);
      return `${m}:${r.toString().padStart(2, '0')}`;
    }
  }
};
</script>

<style>
.player-static-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 90px;
  background: #120d08;
  border-top: 2px solid #4d1212;
  display: flex;
  align-items: center;
  z-index: 9999;
}

.player-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1400px; 
  margin: 0 auto;
  padding: 0 20px;
}

.music-info {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0; 
  flex: 1;
}

.vinyl { font-size: 1.6rem; filter: sepia(1); animation: spin 4s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.details { min-width: 0; }
.details .title {
  color: #d1c5a5;
  font-weight: bold;
  font-size: 1rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.details .status { color: #6e6448; font-size: 0.75rem; font-style: italic; margin: 0; }

.player-controls {
  flex: 2;
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
  min-width: 0;
}

.play-btn {
  background: none;
  border: 1px solid #4a3f35;
  color: #d1c5a5;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s;
}
.play-btn:hover { background: #4a3f35; color: #fff; }

.progress-area {
  flex: 1;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-bg {
  flex: 1;
  height: 6px;
  background: #2c241e;
  border-radius: 3px;
  cursor: pointer;
}

.bar-fill {
  height: 100%;
  background: #4d1212;
  border-radius: 3px;
  transition: width 0.1s linear;
}

.time-label { color: #6e6448; font-family: 'Courier New', Courier, monospace; font-size: 0.8rem; min-width: 35px; }

.close-area { display: flex; justify-content: flex-end; }
.minimal-close {
  background: none;
  border: none;
  color: #4a3f35;
  font-size: 1.3rem;
  cursor: pointer;
  transition: 0.2s;
}
.minimal-close:hover { color: #ff4d4d; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>