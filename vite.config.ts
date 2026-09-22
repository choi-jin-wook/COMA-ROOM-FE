import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    strictPort: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/oci-images": {
        target: "https://objectstorage.ap-tokyo-1.oraclecloud.com",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/oci-images/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
