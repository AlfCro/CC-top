<script setup>
defineProps({
  name: String,
  color: String,
  active: Boolean,
})
</script>

<template>
  <button
    class="crayon"
    :class="{ active }"
    :style="{ '--crayon-color': color }"
    :title="name"
  >
    <div class="tip"></div>
    <div class="body">
      <span class="label">{{ name }}</span>
    </div>
  </button>
</template>

<style scoped>
.crayon {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
  transition: transform 0.2s;
}

.crayon:hover {
  transform: translateY(-8px);
}

.crayon.active {
  transform: translateY(-12px) scale(1.1);
}

.tip {
  width: 20px;
  height: 24px;
  background: var(--crayon-color);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.body {
  width: 36px;
  height: 100px;
  background: var(--crayon-color);
  border-radius: 0 0 4px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 1px;
}
</style>
