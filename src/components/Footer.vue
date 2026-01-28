<script setup>
import "tailwindcss";
</script>
<template>
  <footer
    class="footer footer-horizontal footer-center bg-[#f8edeb] text-primary-content p-10 gap-y-4"
  >
    <aside>
      <img
        src="/images/logo/ganbaru-cropped.png"
        alt="logo"
        class="w-55 h-12"
      />
    </aside>

    <p class="">
      Copyright © {{ new Date().getFullYear() }} Ganbaru - All rights reserved
    </p>
  </footer>
</template>
<style scoped></style>
