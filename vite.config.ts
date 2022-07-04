import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import jsx from "@vitejs/plugin-vue-jsx";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), jsx()],
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  build: {
    rollupOptions: {
      input: {
        record: resolve(__dirname, "./record/index.html"),
        replay: resolve(__dirname, "./replay/index.html"),
      },
    },
  },
});
