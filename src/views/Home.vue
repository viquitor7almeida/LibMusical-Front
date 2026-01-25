<template>
  <div class="header">
    <HeaderCP />
    
    <main class="lib">
      <BookGrid :dataList="musicas" />
    </main>
  </div>
</template>

<script>
import HeaderCP from '../components/HeaderCP.vue';
import BookGrid from '../components/LibCP.vue';

export default {
  name: 'HomePage',
  components: {
    HeaderCP,
    BookGrid
  },
  data() {
    return {
      musicas: []
    };
  }
};
</script>

<style scoped>

.content {
  padding: 20px;
  display: flex;
  justify-content: center;
}

</style>