<template>
  <nav>
    <RouterLink to="/"></RouterLink> 
  </nav>

  <RouterView />
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
  background-color: #000;
  color: #fff; 
}

#app {
  min-height: 100vh;
  background-color: #000;
}

</style>