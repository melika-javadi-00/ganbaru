import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  pluginVue.configs["flat/strongly-recommended"],
  eslintConfigPrettier,
  {
    rules: {
      "vue/multi-word-component-names": [
        "error",
        {
          ignores: ["Navigation", "Footer", "Timer"],
        },
      ],
    },
  },
]);
