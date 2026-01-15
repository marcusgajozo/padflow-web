import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { getLocalIP } from "./scripts/get-local-ip";

const localIP = getLocalIP();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __LOCAL_IP__: JSON.stringify(localIP),
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@audios": path.resolve(__dirname, "./src/assets/audios"),
    },
  },
});
