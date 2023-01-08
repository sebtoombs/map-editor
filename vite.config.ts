import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          chakra: ["@chakra-ui/react", "@emotion/react", "@emotion/styled"],
          konva: ["konva"],
          dnd: ["react-dnd", "react-dnd-html5-backend"],
        },
      },
    },
  },
});
