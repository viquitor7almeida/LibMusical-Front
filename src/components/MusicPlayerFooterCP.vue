<template>
  <transition name="player-slide">
    <div v-if="audioUrl" class="player-static-footer">
      <div class="player-wrapper">
        <div class="music-info">
          <div class="vinyl-container">
            <img 
              :src="playerIcon" 
              alt="Disco" 
              class="vinyl-img" 
              :class="{ 'paused': !isPlaying }"
            />
          </div>
          <div class="details">
            <p class="title">{{ musicName }}</p>
            <p class="status">
              <span v-if="isPlaying" class="wave-icon">
                <span></span><span></span><span></span>
              </span>
              {{ isPlaying ? 'Reproduzindo' : 'Pausado' }}
            </p>
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
          
          <button @click="togglePlay" class="play-btn" :class="{ 'btn-playing': isPlaying }">
            <span class="icon">{{ isPlaying ? '⏸' : '▶' }}</span>
          </button>

          <div class="progress-area">
            <span class="time-label">{{ formatTime(currentTime) }}</span>
            <div class="bar-container">
              <div class="bar-bg" @click="seek">
                <div class="bar-fill" :style="{ width: progress + '%' }">
                  <div class="bar-handle"></div>
                </div>
              </div>
            </div>
            <span class="time-label">{{ formatTime(duration) }}</span>
          </div>
        </div>

        <div class="close-area">
          <button class="minimal-close" @click="$emit('close')" title="Fechar Player">
            <span class="close-icon">✕</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import playerIcon from './../assets/player.png';

export default {
  props: ['audioUrl', 'musicName'],
  data() {
    return { 
      playerIcon,
      isPlaying: true, 
      currentTime: 0, 
      duration: 0, 
      progress: 0 
    };
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

<style scoped>
.player-static-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: linear-gradient(to top, #0f0a07, #1a140f);
  border-top: 3px solid #4d1212;
  display: flex;
  align-items: center;
  z-index: 9999;
  box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
}

.player-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 30px;
}

.music-info {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 250px;
}

.vinyl-container {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: spin 4s linear infinite;
  filter: drop-shadow(0 0 8px rgba(0,0,0,0.6));
}

.vinyl-img.paused {
  animation-play-state: paused;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.details .title {
  color: #f4ecd8;
  font-family: 'Crimson Text', serif;
  font-weight: 700;
  font-size: 1.1rem;
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.details .status {
  color: #a68b6d;
  font-size: 0.8rem;
  font-style: italic;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.wave-icon {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
}

.wave-icon span {
  width: 3px;
  background: #4d1212;
  animation: wave 1s ease-in-out infinite;
}

.wave-icon span:nth-child(2) { animation-delay: 0.2s; }
.wave-icon span:nth-child(3) { animation-delay: 0.4s; }

@keyframes wave {
  0%, 100% { height: 4px; }
  50% { height: 12px; }
}

.player-controls {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.play-btn {
  background: #4d1212;
  border: 2px solid #6e1a1a;
  color: #f4ecd8;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
}

.play-btn:hover {
  transform: scale(1.1);
  background: #6e1a1a;
  box-shadow: 0 0 15px rgba(110, 26, 26, 0.5);
}

.play-btn .icon {
  font-size: 1.4rem;
  margin-left: 2px;
}

.btn-playing .icon {
  margin-left: 0;
}

.progress-area {
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.bar-container {
  flex: 1;
  padding: 10px 0;
  cursor: pointer;
}

.bar-bg {
  height: 6px;
  background: #241c15;
  border-radius: 10px;
  position: relative;
  overflow: visible;
  border: 1px solid #3d3128;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4d1212, #8e1d1d);
  border-radius: 10px;
  position: relative;
  transition: width 0.1s linear;
}

.bar-handle {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  background: #f4ecd8;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0,0,0,0.8);
  opacity: 0;
  transition: opacity 0.2s;
}

.bar-container:hover .bar-handle {
  opacity: 1;
}

.time-label {
  color: #8c7662;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  font-weight: bold;
  min-width: 45px;
}

.close-area {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.minimal-close {
  background: #1a140f;
  border: 1px solid #3d3128;
  color: #5c4b3c;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.minimal-close:hover {
  background: #4d1212;
  color: #f4ecd8;
  border-color: #6e1a1a;
}

.player-slide-enter-active, .player-slide-leave-active {
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s;
}

.player-slide-enter-from, .player-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>