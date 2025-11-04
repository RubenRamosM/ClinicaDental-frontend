import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: '0.0.0.0', // 🌐 Permite acceso desde subdominios
        port: 5173,
        strictPort: true,
        // 🔧 Permitir subdominios en desarrollo local
        allowedHosts: [
            'localhost',
            '.localhost',
            'norte.localhost',
            'sur.localhost',
            'este.localhost',
            'oeste.localhost',
            'clinica1.localhost',
            'clinica2.localhost',
            '.psicoadmin.xyz',
        ],
        proxy: {
            "/api": {
                target: "http://localhost:8001",
                changeOrigin: true,
                secure: false,
                rewrite: (path: string) => path.replace(/^\/api/, '/api/v1')
            },
        },
    },
});
