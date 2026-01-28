<script setup>
import ConfigForm from "./ConfigForm.vue";
</script>

<template>
  <div
    class="hero min-h-screen items-start bg-[url(/images/cozy-studying-girl.png)]"
  >
    <div class="hero-overlay bg-[#3E2BCD]/50"></div>
    <div class="hero-content text-[#E1E5F2] text-center pt-17">
      <div class="max-w-md">
        <p
          class="mb-5 text-5xl font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]"
        >
          Heyya!
        </p>

        <p class="mb-5 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
          Find your flow in this calm corner of the internet. A space dedicated
          to Ganbaru (頑張る) — the gentle art of doing one's best. Settle in,
          let the distractions melt away, and give your full attention to the
          task at hand. We'll keep the time.
        </p>
        <a class="btn btn-neutral text-base-content" href="#config"
          >Get Started</a
        >
      </div>
    </div>
  </div>
  <config-form />
</template>
<style scoped></style>
