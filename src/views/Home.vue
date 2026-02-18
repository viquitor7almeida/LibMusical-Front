<template>
  <HeaderCP />
  <div class="page">
    <main class="lib">
      <BookGrid 
        :dataList="musicas" 
        :currentPlayingUrl="playingUrl"
        @play-music="handlePlay"
      />
    </main>

    <MusicPlayerFooter 
      v-if="playingUrl"
      :audioUrl="playingUrl"
      :musicName="currentPlayingName"
      @close="resetPlayer"
      @ended="resetPlayer"
      class="music-player"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import HeaderCP from '../components/HeaderCP.vue';
import BookGrid from '../components/LibCP.vue';
import MusicPlayerFooter from '../components/MusicPlayerFooterCP.vue';

const musicas = ref([]);
const playingUrl = ref(null);
const currentPlayingName = ref('');

const handlePlay = (music) => {
  if (!music.audioUrl || (playingUrl.value === music.audioUrl)) {
    resetPlayer();
  } else {
    playingUrl.value = music.audioUrl;
    currentPlayingName.value = music.name;
  }
};

const resetPlayer = () => {
  playingUrl.value = null;
  currentPlayingName.value = '';
};
</script>

<style scoped>

.page {
  min-height: 100vh; 
  display: flex;
  flex-direction: column;
  padding-bottom: 110px; 
}

.lib {
  padding-top: 20px;
  flex: 1;
}

.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 90px;
  z-index: 9999;
}
</style>