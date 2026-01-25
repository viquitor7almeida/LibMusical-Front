<template>
  <div class="book-container">
    <div class="paper">
      <table class="book-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Versos</th>
            <th>Cifra</th>
            <th>Mp3</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedData" :key="index">
            <td>{{ item.titulo }}</td>
            <td>{{ item.versos }}</td>
            <td>
              <a v-if="item.cifra" :href="item.cifra" target="_blank">📄</a>
            </td>
            <td>
              <button v-if="item.mp3" @click="playAudio(item.mp3)">▶️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="currentPage--">Anterior</button>
      <span>Página {{ currentPage }} de {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="currentPage++">Próxima</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookGrid',
  props: {
    items: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 20
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.items.length / this.itemsPerPage);
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.items.slice(start, end);
    }
  },
  methods: {
    playAudio(url) {
      console.log('Tocando:', url);
    }
  }
};
</script>

<style scoped>
.book-container {
  max-width: 900px;
  margin: 20px auto;
  font-family: 'Georgia', serif;
}

.paper {
  background: #fff;
  background-image: repeating-linear-gradient(
    #000000 0px,
    #000000 39px,
    #94acd4 40px
  );
  padding: 40px 20px 0 60px;
  position: relative;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  min-height: 840px; /* Garante espaço para as 20 linhas */
  border-left: 2px solid #ffadad; /* Margem do caderno */
}

.book-table {
  width: 100%;
  border-collapse: collapse;
  line-height: 40px; /* Mesma altura das pautas */
}

.book-table th {
  text-align: left;
  color: #555;
  border-bottom: 2px solid #555;
  height: 40px;
}

.book-table td {
  padding: 0 10px;
  height: 40px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

button {
  padding: 8px 16px;
  cursor: pointer;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>