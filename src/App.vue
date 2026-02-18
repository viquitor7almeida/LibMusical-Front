<template>
  <div class="app-wrapper">
    <div class="background-global-blur"></div>
    
    <nav v-if="false">
      <RouterLink to="/"></RouterLink> 
    </nav>

    <div class="app-content">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
}

.app-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.background-global-blur {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('./assets/home.jpg'); 
  background-size: cover;
  background-position: center;
  filter: blur(8px);
  z-index: -1;
  background-color: rgba(23, 13, 13, 0.6);
  background-blend-mode: darken;
  transform: scale(1.1);
}

.app-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}
</style>