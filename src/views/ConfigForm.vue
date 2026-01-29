<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import ThemesPicker from "../components/ThemesPicker.vue";
import { themes } from "../utils";

const router = useRouter();
const themesModal = ref(null);
const currentTheme = ref(themes[0]);
const configData = ref({
  focus: 25,
  break: 5,
  sessions: 4,
});

const messages = ref([]);

watch([() => configData.value], ({ newFocus, newBreak, newSessions }) => {
  const newMessages = [];

  if (newFocus < 15) {
    console.log("Focus duration is below defined minimum limit: " + newFocus);
    newMessages.push({
      type: "error",
      text: "Error: Focus duration should be at least 15 minutes!",
    });
  } else if (newFocus < newBreak) {
    newMessages.push({
      type: "error",
      text: "Error: Focus duration cannot be shorter than break duration!",
    });
  } else if (newBreak <= 0) {
    newMessages.push({
      type: "error",
      text: "Error: Break duration cannot be 0!",
    });
  } else if (newSessions <= 0) {
    newMessages.push({
      type: "error",
      text: "Error: There needs to be at least 1 pomodoro session!",
    });
  }

  if (newBreak > 0 && newBreak < 5) {
    newMessages.push({
      type: "tip",
      text: "We recommend at least 5 minutes of break to avoid fatigue.",
    });
  }
  messages.value = newMessages;
});

const popupIcons = {
  error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  tip: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", // This is a standard "info" icon
};

const hasErrors = computed(() =>
  messages.value.some((msg) => msg.type === "error")
);

// transfer configuration data to pomodoro page:
function goToPomodoro() {
  console.log("Switching to pomodoro page...");
  router.push({
    path: "/timer",
    query: {
      ...configData.value,
      theme: currentTheme.value.id,
    },
  });
}
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row" id="config">
    <div
      class="w-full aspect-256/389 max-w-2/5 relative min-h-[50vh] hidden lg:block"
    >
      <img
        src="/images/clock.png"
        alt="a clock"
        class="absolute inset-0 w-full h-full object-cover"
      />
    </div>

    <div class="hero min-h-screen bg-[#BB6567]">
      <form @submit.prevent>
        <fieldset
          class="fieldset border-[#893F45] rounded-box w-full lg:w-lg border p-4 bg-[#893F45]"
        >
          <label
            class="label text-xl text-[#DCC1BC] mt-5"
            for="pomodoro-duration"
            >Pomodoro duration <span class="text-xs">(in minutes)</span>
          </label>
          <input
            type="number"
            id="pomodoro-duration"
            name="pomodoro-duration"
            v-model.number="configData.focus"
            class="input bg-[#945758] text-[#DCC1BC]"
            placeholder="e.g. 25 minutes"
            value="25"
            min="15"
            required
          />

          <label class="label text-xl text-[#DCC1BC] mt-5" for="break-duration"
            >Break duration<span class="text-xs">(in minutes)</span></label
          >
          <input
            type="number"
            id="break-duration"
            name="break-duration"
            v-model.number="configData.break"
            class="input bg-[#945758] text-[#DCC1BC]"
            placeholder="e.g. 10 minutes"
            value="5"
            min="5"
            required
          />

          <label class="label text-xl text-[#DCC1BC] mt-5" for="sessions"
            >Number of pomodoros</label
          >
          <input
            type="number"
            id="sessions"
            name="sessions"
            v-model.number="configData.sessions"
            class="input bg-[#945758] text-[#DCC1BC] mb-3"
            placeholder="e.g. 4 sessions"
            value="3"
            min="1"
            required
          />

          <TransitionGroup>
            <div
              v-for="msg in messages"
              :key="msg.text"
              role="alert"
              class="alert m-1"
              :class="{
                'alert-error bg-[#fcf76b] border-[#fcf76b]':
                  msg.type === 'error',
                'alert-info bg-[#6bdafc] border-[#6bdafc]': msg.type === 'tip',
              }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="popupIcons[msg.type]"
                />
              </svg>

              <span> {{ msg.text }} </span>
            </div>
          </TransitionGroup>

          <!-- Theme selection -->
          <div class="flex items-center gap-4 mt-5">
            <label class="label text-xl text-[#DCC1BC]" for="change-theme">
              Pomodoro Theme:
            </label>

            <div class="flex items-center gap-2">
              <div class="size-10 flex items-center">
                <img
                  :src="currentTheme.thumbnail"
                  :alt="currentTheme.title"
                  class="w-full h-full object-cover rounded-full"
                />
              </div>

              <button
                id="change-theme"
                class="btn btn-xs btn-neutral"
                @click="themesModal.showModal()"
              >
                Change theme
              </button>
            </div>
          </div>

          <!-- configure button -->
          <button
            class="btn bg-[#580a21] border-[#580a21] text-[#DCC1BC] transition-colors w-50 m-auto mt-7 disabled:bg-[#7a656a] disabled:border-[#7a656a] disabled:text-[#8d7a77]"
            :disabled="hasErrors"
            @click="goToPomodoro()"
          >
            Save configuration
          </button>

          <!-- themes modal -->
          <dialog class="modal" ref="themesModal">
            <div class="modal-box w-full max-w-lg bg-neutral text-base-content">
              <form method="dialog">
                <button
                  class="btn bg-transparent border-transparent text-base-content btn-sm btn-circle btn-ghost absolute right-2 top-2 hover:scale-120 transition-transform duration-300"
                >
                  ✕
                </button>
              </form>
              <b
                class="block text-lg font-bold pb-2 border-b-2 border-b-base-content"
                >Themes</b
              >

              <themes-picker
                :selected-theme-id="currentTheme.id"
                @change-theme="
                  (newTheme) => {
                    currentTheme = newTheme;
                    themesModal.close('theme-changed');
                  }
                "
              />
            </div>
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </fieldset>
      </form>
    </div>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.6s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
