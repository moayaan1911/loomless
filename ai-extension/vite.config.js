import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  envPrefix: ["VITE_", "NVIDIA_", "TAVILY_", "TRAVILY_"],
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
