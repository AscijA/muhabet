import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  envPrefix: ["VITE_", "REACT_APP_"],
  plugins: [react()],
  css: { preprocessorOptions: { scss: { api: "modern-compiler" } } },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/firebase") || id.includes("node_modules/@firebase")) return "firebase";
          if (id.includes("node_modules/react") || id.includes("node_modules/@reduxjs") || id.includes("node_modules/react-redux")) return "react-vendors";
        },
      },
    },
  },
  resolve: { alias: { src: fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    exclude: ["e2e/**", "functions/**", "node_modules/**", "dist/**"],
  },
});
