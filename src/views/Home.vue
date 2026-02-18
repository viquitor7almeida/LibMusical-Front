<template>
  <div class="header">
    <HeaderCP />
    
    <main class="lib">
      <BookGrid :dataList="musicas" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import HeaderCP from '../components/HeaderCP.vue';
import BookGrid from '../components/LibCP.vue';

const musicas = ref([]);
</script>

<style scoped>

.content {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.lib{
  padding-top: 20px;
}

</style>