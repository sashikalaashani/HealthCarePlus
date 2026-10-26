import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, /api calls are proxied to the existing Express backend (port 5000), so no CORS setup is needed.
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: { "/api": process.env.VITE_PROXY_TARGET || "http://localhost:5000" }
    }
});
