<template>
  <div class="mini-chords-belt">
    <div v-if="chords.length === 0" class="empty-belt">
      Nenhum acorde registrado nesta página
    </div>

    <draggable 
      v-model="chords" 
      item-key="id" 
      class="chords-belt-grid"
      @end="handleReorder"
      ghost-class="ghost-chord"
    >
      <template #item="{ element }">
        <div class="mini-chord-card">
          <button @click="removeChord(element.id)" class="btn-quick-remove" title="Remover shape">
            ✕
          </button>
          
          <div class="chord-image-wrapper">
            <img v-if="element.photoUrl" :src="getImageUrl(element.photoUrl)" :alt="element.chordName">
            <div v-else class="no-image-mini">
              {{ getChordAbbreviation(element.chordName) }}
            </div>
          </div>

          <div class="chord-name-mini">
            {{ element.chordName }}
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { updateChord, deleteChord } from './../services/MusicChordsService.js';

const props = defineProps({
  modelValue: { type: Array, required: true }, 
  musicId: { type: Number, required: true }
});

const emit = defineEmits(['update:modelValue']);
const chords = ref([...props.modelValue]);

watch(() => props.modelValue, (newVal) => {
  chords.value = [...newVal].sort((a, b) => a.position - b.position);
});

const getImageUrl = (path) => `${import.meta.env.VITE_APP_API_URL}/uploads/${path}`;
const getChordAbbreviation = (name) => name.substring(0, 2);

const handleReorder = async () => {
  const updates = chords.value.map((chord, index) => {
    chord.position = index;
    return updateChord(chord.id, {
      chordName: chord.chordName,
      position: index,
      musicId: props.musicId
    });
  });
  
  emit('update:modelValue', chords.value);
  await Promise.all(updates);
};

const removeChord = async (id) => {
  if (confirm('Remover este acorde permanentemente?')) {
    await deleteChord(id);
    chords.value = chords.value.filter(c => c.id !== id);
    emit('update:modelValue', chords.value);
  }
};
</script>

<style scoped>
.mini-chords-belt {
  background: #1a140f;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #3d3128;
  box-shadow: inset 0 0 25px rgba(0,0,0,0.7);
  overflow-x: auto;
  margin-bottom: 20px;
}

.mini-chords-belt::-webkit-scrollbar {
  height: 10px;
}
.mini-chords-belt::-webkit-scrollbar-track {
  background: #0d0906;
  border-radius: 5px;
}
.mini-chords-belt::-webkit-scrollbar-thumb {
  background: #5e4d3f;
  border-radius: 5px;
  border: 2px solid #0d0906;
}

.empty-belt {
  text-align: center;
  color: #8c7662;
  font-family: 'Crimson Text', serif;
  font-style: italic;
  font-size: 1.1rem;
  padding: 20px 0;
}

.chords-belt-grid {
  display: flex;
  gap: 18px;
  padding: 10px 5px;
}

.mini-chord-card {
  flex: 0 0 110px; 
  height: 140px;
  background: #f4ecd8; 
  border: 3px solid #a68b6d;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  cursor: grab; 
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 5px 5px 15px rgba(0,0,0,0.5);
}

.mini-chord-card:hover {
  transform: translateY(-8px) scale(1.05);
  border-color: #d1c5a5;
  box-shadow: 0 12px 25px rgba(0,0,0,0.7);
}

.mini-chord-card:active {
  cursor: grabbing;
}

.btn-quick-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #8e1d1d;
  color: #fff;
  border: 1px solid #5a0c0c;
  width: 24px;
  height: 24px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  display: flex; 
  align-items: center; 
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
  border-radius: 4px;
}

.mini-chord-card:hover .btn-quick-remove {
  opacity: 1;
}

.chord-image-wrapper {
  height: 105px;
  display: flex; 
  align-items: center; 
  justify-content: center;
  background: #3d3128; 
  border-bottom: 2px solid #a68b6d;
  padding: 5px;
}

.chord-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain; 
  filter: sepia(0.2) contrast(1.1) brightness(0.95); 
}

.no-image-mini {
  color: #3d3128;
  font-size: 2.2rem;
  font-weight: 900;
  font-family: 'Crimson Text', serif;
  text-shadow: 1px 1px 0px rgba(255,255,255,0.5);
}

.chord-name-mini {
  background: #3d3128; 
  color: #d1c7b0;
  font-size: 0.95rem;
  font-weight: 800;
  text-align: center;
  padding: 6px 2px;
  font-family: 'Crimson Text', serif;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ghost-chord {
  opacity: 0.15;
  transform: scale(0.9);
  border: 3px dashed #f4ecd8;
  background: transparent !important;
}
</style>