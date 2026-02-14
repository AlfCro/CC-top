<script setup>
import { ref } from 'vue'
import Crayon from './Crayon.vue'

const crayons = ref([
  { id: 1, name: 'Red', color: '#EE204D' },
  { id: 2, name: 'Blue', color: '#1F75FE' },
  { id: 3, name: 'Green', color: '#1CAC78' },
  { id: 4, name: 'Yellow', color: '#FCE883' },
  { id: 5, name: 'Orange', color: '#FF7538' },
  { id: 6, name: 'Purple', color: '#926EAE' },
  { id: 7, name: 'Brown', color: '#B4674D' },
  { id: 8, name: 'Black', color: '#232323' },
])

const selected = ref(null)

function selectCrayon(crayon) {
  selected.value = selected.value?.id === crayon.id ? null : crayon
}
</script>

<template>
  <div class="crayon-box">
    <div class="crayons">
      <Crayon
        v-for="crayon in crayons"
        :key="crayon.id"
        :name="crayon.name"
        :color="crayon.color"
        :active="selected?.id === crayon.id"
        @click="selectCrayon(crayon)"
      />
    </div>
    <div v-if="selected" class="preview" :style="{ backgroundColor: selected.color }">
      <p :style="{ color: selected.name === 'Yellow' ? '#333' : '#fff' }">
        You picked <strong>{{ selected.name }}</strong>!
      </p>
    </div>
    <p v-else class="hint">Click a crayon to pick it</p>
  </div>
</template>

<style scoped>
.crayon-box {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.crayons {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.preview {
  padding: 1.5rem;
  border-radius: 12px;
  transition: background-color 0.3s;
}

.preview p {
  font-size: 1.25rem;
}

.hint {
  color: #999;
  font-size: 1rem;
}
</style>
