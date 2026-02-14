<script setup>
import CrayonBox from './components/CrayonBox.vue'
</script>

<template>
  <div class="app">
    <h1>My Crayon Collection</h1>
    <CrayonBox />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fdf6e3;
  min-height: 100vh;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 2rem;
}
</style>
