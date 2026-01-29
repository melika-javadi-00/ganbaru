<script setup>
import { themeCategories } from "../utils";

defineProps({
  selectedThemeId: {
    type: Number,
    required: true,
  },
});
defineEmits(["changeTheme"]);
</script>

<template>
  <div class="text-base-content p-8 max-h-80 overflow-scroll">
    <div class="flex flex-col gap-8 pb-16">
      <div v-for="category in themeCategories" :key="category.id">
        <div class="flex justify-between items-center mb-6">
          <!-- Category Header -->
          <div class="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 ml-0.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
              />
            </svg>
            <h2 class="text-xl font-semibold">{{ category.name }}</h2>
          </div>
        </div>

        <!-- image Grid -->
        <div
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 w-full"
        >
          <div
            v-for="image in category.images"
            :key="image.id"
            class="group cursor-pointer flex flex-col items-center"
          >
            <!-- image Thumbnail -->
            <div
              class="relative w-15 h-15 rounded-xl overflow-hidden aspect-image mb-3"
              @click="
                selectedThemeId !== image.id && $emit('changeTheme', image)
              "
            >
              <img
                :src="image.thumbnail"
                :alt="image.title"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <div
                class="hidden absolute top-1/2 left-1/2 -translate-1/2 rounded-full bg-white p-1 opacity-50 data-[active=true]:block"
                :data-active="image.id === selectedThemeId"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="3"
                  stroke="currentColor"
                  class="w-5 h-5 ml-0.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </div>

              <!-- Overlay -->
              <div
                class="absolute bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300"
              ></div>
            </div>

            <!-- image Title -->
            <h3
              class="text-xs text-center font-medium group-hover:text-base-content/80 transition-colors"
            >
              {{ image.title }}
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
