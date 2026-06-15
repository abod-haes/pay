import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  server: {
    host: true, // allows access from your network
    port: 3000, // optional, you can change port if needed
  },
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: true,
      brotliSize: true,
      filename: "bundle-analysis.html",
      gzipSize: true,
      template: "treemap",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@layout": path.resolve(__dirname, "./src/layout"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@libs": path.resolve(__dirname, "./src/libs"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@reducers": path.resolve(__dirname, "./src/reducers"),
      "@schemas": path.resolve(__dirname, "./src/schemas"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@zustand": path.resolve(__dirname, "./src/zustand"),
      "@tailwind": path.resolve(__dirname, "./tailwind.config.js"),
    },
  },
});
