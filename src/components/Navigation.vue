<script setup>
import "tailwindcss";
</script>

<template>
  <div class="navbar bg-base-100 shadow-sm">
    <div class="flex-1">
      <router-link to="/" class="btn btn-ghost text-xl"> Ganbaru </router-link>
    </div>
  </div>
</template>

<style scoped>
.nav-box {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  cursor: pointer;
}

.nav-icon {
  background-color: rgb(83, 9, 133);
}
</style>
