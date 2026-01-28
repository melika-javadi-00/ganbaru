import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";
import ConfigForm from "../views/ConfigForm.vue";
import Timer from "../views/Timer.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/configure",
    name: "config",
    component: ConfigForm,
  },
  {
    path: "/timer",
    name: "timer",
    component: Timer,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash
      }
    }
    
    return {
      top: 0,
      behavior: 'instant'
    }
  }
});

export default router;
