<script setup>
import { ref, watch, computed, onUnmounted, onMounted } from "vue";
import { useRoute } from "vue-router";
import { confetti } from "@tsparticles/confetti";
import ThemesPicker from "../components/themes-picker.vue";
import { themes } from "../utils";
import { useRouter } from "vue-router";

const setupReloadPrevention = () => {
  const handleBeforeUnload = (e) => {
    // Only show warning if timer has been used or sessions are in progress
    if (hasTimerBeenUsed.value || completedSessions.value > 0) {
      e.preventDefault();
      e.returnValue = ""; // Chrome requires returnValue to be set
      return ""; // Some browsers use the return value
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
};

const route = useRoute();
const router = useRouter();
const congratsModal = ref(null);
const notifSound = ref(null);
const successSound = ref(null);
const muteSounds = ref(route.query.muted === "true");
const focusDuration = ref(parseInt(route.query.focus * 60) || 25 * 60);
const breakDuration = ref(parseInt(route.query.break * 60) || 5 * 60);
const totalSessions = ref(parseInt(route.query.sessions) || 4);
const currentTheme = ref(
  themes.find((theme) => theme.id === +route.query.theme) ?? themes[0]
);
const totalSecondsLeft = ref(focusDuration.value);
const confirmationPopup = ref(false);
const completedSessions = ref(0);
const currentMode = ref("pomodoro");
const activeStepIndex = ref(0);
const isRunning = ref(false);
const cycleFinished = ref(false);

const currentPomodoro = computed(() =>
  timelineSteps.value[completedSessions.value].type === "pomodoro"
    ? timelineSteps.value[completedSessions.value]
    : timelineSteps.value[completedSessions.value - 1]
);
const totalTimeLeft = computed(() => {
  const totalOriginalTime =
    focusDuration.value * totalSessions.value +
    (totalSessions.value - 1) * breakDuration.value;

  // Calculate how much time is in the steps we already finished
  // Sum up the durations of all steps where index < activeStepIndex
  let timeFinished = 0;
  for (let i = 0; i < activeStepIndex.value; i++) {
    const step = timelineSteps.value[i];
    timeFinished +=
      step.type === "pomodoro" ? focusDuration.value : breakDuration.value;
    console.log(
      "steppppp and time finisheddddd --> " + step.value + " , " + timeFinished
    );
  }

  console.log(
    "total original time - time finished - time spent in current step: (???) --> " +
      totalOriginalTime +
      " - " +
      timeFinished
  );
  return totalOriginalTime - timeFinished;
});
const formattedTotalLeft = computed(() => {
  const hours = Math.floor(totalTimeLeft.value / 3600);
  const minutes = Math.floor((totalTimeLeft.value % 3600) / 60);
  return `${hours ? hours.toString().padStart(2, "0") : ""} ${hours ? "hour" : ""}${hours > 1 ? "s" : ""} ${minutes ? minutes.toString().padStart(2, "0") : ""} ${minutes ? "min" : ""}`;
});
const currentSessionDuration = computed(() =>
  currentMode.value === "pomodoro" ? focusDuration.value : breakDuration.value
);
const leftMinutes = computed(() => Math.floor(totalSecondsLeft.value / 60));
const leftSeconds = computed(() => totalSecondsLeft.value % 60);
const timelineSteps = computed(() => {
  const steps = [];
  let i = 1;
  for (i; i <= totalSessions.value; i++) {
    steps.push({
      idx: i - 1,
      type: "pomodoro",
      label: `Pomodoro ${i}/${totalSessions.value}`,
    });

    // if it's not the last session, add a break
    if (i < totalSessions.value) {
      steps.push({
        type: "break",
        label: "Break",
      });
    }
  }
  return steps;
});
const totalDur = computed(
  () =>
    focusDuration.value * totalSessions.value +
    (totalSessions.value - 1) * breakDuration.value
);
const hasTimerBeenUsed = computed(() => {
  return totalSecondsLeft.value < currentSessionDuration.value;
});
const buttonText = computed(() => {
  if (!hasTimerBeenUsed.value) {
    return "Start";
  }

  return isRunning.value ? "Pause" : "Resume";
});
const dashOffset = computed(() => {
  const progress = totalSecondsLeft.value / currentSessionDuration.value;
  return circumference * (1 - progress);
});

watch(timelineSteps, (newSteps) => {
  console.log("Timeline steps have been updated:");
  console.table(newSteps);
});

watch(
  () => isRunning.value,
  (newVal) => {
    if (newVal) {
      startCountdown();
    } else {
      stopCountdown();
    }
  }
);

let cleanupReloadPrevention = null;
onMounted(() => {
  console.log(
    "Configuration data has been transferred successfully to pomodoro page: " +
      +route.query.focus +
      ", " +
      +route.query.break +
      ", " +
      +route.query.sessions
  );

  console.log("Initially selected theme: " + themes[+route.query.theme]);

  cleanupReloadPrevention = setupReloadPrevention();
});

onUnmounted(() => {
  stopCountdown();
  cleanupReloadPrevention?.();
});

const emit = defineEmits([
  "toggle-timer",
  "reset-timer",
  "timer-finished",
  "cycle-finished",
]);

const size = 240;
const radius = (size - 16) / 2; // size - stroke
const circumference = 2 * Math.PI * radius;
let interval = -1;

const toggleTimer = () => {
  isRunning.value = !isRunning.value;
};

const startCountdown = () => {
  clearInterval(interval);

  const countDown = () => {
    if (totalSecondsLeft.value > 0) {
      totalSecondsLeft.value--;
      console.log(
        "Session timer: " +
          leftMinutes.value +
          ":" +
          leftSeconds.value.toString().padStart(2, "0")
      );
    } else {
      console.log("Timer has reached 0.");
      stopCountdown();
      isRunning.value = false; // Stop the timer

      emit("timer-finished");

      if (completedSessions.value < timelineSteps.value.length) {
        completedSessions.value++;
        activeStepIndex.value++;
        console.log(
          "Total duration: " +
            totalDur.value +
            " Completed sessions: " +
            completedSessions.value
        );
        console.log(
          "Current step mode: " +
            currentMode.value +
            " duration: " +
            (currentMode.value === "pomodoro"
              ? focusDuration.value
              : breakDuration.value) +
            " then: " +
            (totalDur.value -
              (currentMode.value === "pomodoro"
                ? focusDuration.value
                : breakDuration.value))
        );
        console.log("Formatted total left: " + formattedTotalLeft.value);
      }

      // Check if the entire cycle is finished
      if (completedSessions.value >= timelineSteps.value.length) {
        console.log("Full Pomodoro cycle complete!");
        if (successSound.value) {
          successSound.value.play().catch((err) => {
            console.log("Audio play failed:", err);
          });
        }
        emit("cycle-finished");
        cycleFinished.value = true;
        celebrate(); // confetti
        congratsModal.value.showModal();
        return;
      }

      if (notifSound.value) {
        notifSound.value.play().catch((err) => {
          console.log("Audio play failed:", err);
        });
      }

      const nextStep = timelineSteps.value[completedSessions.value];

      // Update the current mode and set the timer for the next session
      currentMode.value = nextStep.type;
      if (nextStep.type === "pomodoro") {
        console.log(
          "Moving on to next pomodoro session ------>" + nextStep.label
        );

        console.log(timelineSteps.value[completedSessions.value].label);
        totalSecondsLeft.value = currentSessionDuration.value;
      } else {
        // It's a break
        totalSecondsLeft.value = breakDuration.value;
      }
    }
  };

  interval = setInterval(countDown, 1000);
};

const stopCountdown = () => {
  clearInterval(interval);
  interval = null;
};

const resetTimer = () => {
  if (totalSecondsLeft.value === 0 && cycleFinished.value) {
    confirmationPopup.value?.showModal();
  } else {
    console.log("Resetting timer internally...");
    stopCountdown();
    totalSecondsLeft.value = currentSessionDuration.value; // reset the time
    isRunning.value = false;
  }
};

const confirmReset = () => {
  cycleFinished.value = false;

  if (completedSessions.value > 0) {
    console.log(
      "resetting completed sessions to 0: " + completedSessions.value
    );

    completedSessions.value = 0;
  }

  stopCountdown();
  totalSecondsLeft.value = currentSessionDuration.value;
};

const celebrate = () => {
  const duration = 15 * 1000,
    animationEnd = Date.now() + duration,
    defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // since particles fall down, start a bit higher than random
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
    );

    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    );
  }, 250);
};

const toggleMute = () => {
  muteSounds.value = !muteSounds.value;
  updateUrlSearchParams();
};

const updateUrlSearchParams = () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      theme: currentTheme.value.id,
      muted: muteSounds.value,
    },
  });
};
</script>

<template>
  <div
    :data-theme="currentTheme.theme"
    class="hero min-h-screen flex flex-col items-center justify-start gap-4 pt-16"
    :style="{ backgroundImage: `url(${currentTheme.imgUrl})` }"
  >
    <template v-if="!muteSounds">
      <audio ref="notifSound" src="/sounds/chime.wav" preload="auto"></audio>

      <audio
        ref="successSound"
        src="/sounds/cycle-ended.mp3"
        preload="auto"
      ></audio>
    </template>

    <!-- menu -->
    <div class="absolute left-4 top-5">
      <ul
        class="menu bg-neutral/65 hover:bg-neutral transition-colors duration-400 rounded-box w-34 p-0"
      >
        <li>
          <router-link to="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home
          </router-link>
        </li>
        <li>
          <router-link to="/#config">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            Configure
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Theme selection icon -->
    <div class="dropdown dropdown-end absolute top-5 right-4">
      <div
        tabindex="0"
        role="button"
        class="btn m-1 bg-neutral/65 hover:bg-neutral border-transparent rounded-xl pl-2! pr-2! transition-colors duration-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
          />
        </svg>
      </div>

      <ul
        tabindex="-1"
        class="dropdown-content bg-neutral/65 rounded-box z-1 w-120 p-2 shadow-sm"
      >
        <li>
          <ThemesPicker
            :selected-theme-id="currentTheme.id"
            @change-theme="
              (newTheme) => {
                currentTheme = newTheme;
                updateUrlSearchParams();
              }
            "
          />
        </li>
      </ul>
    </div>

    <!-- Sound alert icon -->
    <label
      class="swap absolute top-5 right-17 btn m-1 bg-neutral/65 hover:bg-neutral border-transparent transition-colors duration-400 rounded-xl pl-2! pr-2!"
    >
      <input :checked="!muteSounds" type="checkbox" @click="toggleMute()" />

      <!-- volume on icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="swap-on"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
        />
      </svg>

      <!-- volume off icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="swap-off"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9.143 17.082a24.248 24.248 0 0 0 3.844.148m-3.844-.148a23.856 23.856 0 0 1-5.455-1.31 8.964 8.964 0 0 0 2.3-5.542m3.155 6.852a3 3 0 0 0 5.667 1.97m1.965-2.277L21 21m-4.225-4.225a23.81 23.81 0 0 0 3.536-1.003A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53"
        />
      </svg>
    </label>

    <!-- content -->
    <div
      class="hero-content text-secondary text-center flex flex-col items-center"
    >
      <div class="timer-circle">
        <svg class="progress-ring" :width="size" :height="size">
          <defs>
            <pattern
              id="decorativePattern"
              width="150"
              height="150"
              patternUnits="userSpaceOnUse"
            ></pattern>
          </defs>
          <circle
            class="timer-circle-fill-bg fill-neutral/50"
            :r="radius"
            :cx="size / 2"
            :cy="size / 2"
          />
          <circle
            class="progress-ring-bg stroke-primary"
            :r="radius"
            :cx="size / 2"
            :cy="size / 2"
            fill="url(#decorativePattern)"
          />
          <circle
            class="progress-ring-progress stroke-secondary"
            :r="radius"
            :cx="size / 2"
            :cy="size / 2"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
        </svg>

        <div
          class="select-none flex items-center gap-2 [&_.countdown_::before,&_.countdown_::after]:[transition-property:top,transform]"
          style="--digits: 2"
        >
          <span class="countdown font-mono text-6xl">
            <span :style="{ '--value': leftMinutes }"></span>
          </span>
          <span class="font-mono text-6xl z-0">:</span>
          <span class="countdown font-mono text-6xl">
            <span :style="{ '--value': leftSeconds }"></span>
          </span>
        </div>
      </div>

      <div class="flex gap-4 mt-5">
        <button
          v-if="!cycleFinished"
          class="btn bg-secondary border-secondary text-neutral"
          @click="toggleTimer()"
        >
          <span
            v-if="isRunning && !hasTimerBeenUsed"
            class="loading loading-spinner"
          ></span>
          <template v-else>{{ buttonText }}</template>
        </button>

        <button
          v-if="hasTimerBeenUsed"
          class="btn bg-accent border-accent text-neutral"
          @click="resetTimer()"
        >
          Reset
        </button>
      </div>
    </div>

    <div class="w-full max-w-3xl mx-auto flex flex-col items-center">
      <!-- Pomodoro Labels (ABOVE) -->
      <div class="w-11/12 flex items-center mb-2">
        <template v-for="(step, index) in timelineSteps" :key="`top-${index}`">
          <div class="flex justify-center shrink-0" style="width: 20px">
            <div
              v-if="step.type === 'pomodoro'"
              class="select-none timeline-box bg-neutral/65 border-transparent text-base-content whitespace-nowrap"
            >
              {{ step.label }}
            </div>
          </div>
          <div v-if="index < timelineSteps.length - 1" class="flex-1"></div>
        </template>
      </div>

      <!-- The progress track with checkmarks (MIDDLE) -->
      <div class="w-11/12 flex items-center">
        <template v-for="(step, index) in timelineSteps" :key="step.label">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="h-5 w-5 shrink-0"
            :class="
              index < completedSessions ? 'text-accent' : 'text-secondary'
            "
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd"
            />
          </svg>
          <div
            v-if="index < timelineSteps.length - 1"
            class="h-1 flex-1 rounded-full"
            :class="index < completedSessions ? 'bg-accent' : 'bg-secondary'"
          ></div>
        </template>
      </div>

      <!-- Break Labels (BELOW) -->
      <div class="w-11/12 flex items-center mt-2">
        <template
          v-for="(step, index) in timelineSteps"
          :key="`bottom-${index}`"
        >
          <div class="flex justify-center shrink-0" style="width: 20px">
            <div
              v-if="step.type === 'break'"
              class="select-none timeline-box bg-base-100/65 border-transparent text-base-content whitespace-nowrap"
            >
              {{ step.label }}
            </div>
          </div>
          <div v-if="index < timelineSteps.length - 1" class="flex-1"></div>
        </template>
      </div>
    </div>

    <div
      class="flex flex-col items-center text-xl font-semibold font-mono bg-neutral/45 rounded-box px-5 py-2 mt-33"
    >
      <p class="text-base-content">
        {{ currentPomodoro.label }}
      </p>
      <p class="text-base-content">Total time left: {{ formattedTotalLeft }}</p>
    </div>

    <!-- Confirmation modal popup -->
    <dialog ref="confirmationPopup" id="confirmation" class="modal">
      <div class="modal-box bg-neutral">
        <p class="py-4">
          You have already finished this session. Are you sure you want to reset
          the timer?
        </p>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-primary" cursor-pointer>Never mind</button>
            <button
              class="btn btn-accent text-neutral"
              @click="confirmReset"
              cursor-pointer
            >
              Yes, reset.
            </button>
          </form>
        </div>
      </div>
    </dialog>

    <!-- Congrats window -->
    <dialog class="modal" ref="congratsModal">
      <div
        class="modal-box w-lg max-w-lg h-sm max-h-sm bg-neutral text-base-content"
      >
        <b class="text-lg font-bold">🎉 You're on a roll! 🎉</b>
        <p class="py-4">
          Your brain is basically a productivity powerhouse. Now go grab that
          snack, stretch those legs, or do a little victory dance.
        </p>
        <p>We won't judge - you deserve it!</p>

        <div class="flex justify-center mt-4">
          <img
            src="/images/yarncat-nobg.png"
            alt="img 1"
            class="w-64 h-auto rouned-lg"
          />
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
.timer-component {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 5rem 0;
}

.timer-circle {
  position: relative;
  width: 15rem;
  height: 15rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-90deg); /* start at top */
}

.progress-ring-bg {
  stroke-width: 10;
  fill: none;
}

.progress-ring-progress {
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

.countdown-text {
  color: #333;
  font-family: Roboto, Oxygen, Ubuntu, sans-serif;
  font-size: 3rem;
  z-index: 0;
}

.button-container {
  margin-top: 2rem;
  display: flex;
  gap: 15px;
}

.btn {
  margin: 3px;
  padding: 10px 20px;
  cursor: pointer;
}
</style>
