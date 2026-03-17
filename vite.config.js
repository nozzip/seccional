import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/seccional/",
  plugins: [react()],
  resolve: {
    alias: {},
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          mui: ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
          supabase: ["@supabase/supabase-js"],
          charts: ["recharts"],
          utils: ["xlsx", "jspdf", "date-fns", "framer-motion"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false,
    minify: "esbuild",
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@mui/material", "@supabase/supabase-js"],
  },
});
