import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react()];

  // Only load lovable-tagger plugin during dev, never during build to avoid ESM require issue
  if (mode === "development") {
    try {
      // Use require with conditional loading to keep esbuild happy
      const LovableTagger = require("lovable-tagger");
      if (LovableTagger?.componentTagger) {
        plugins.push(LovableTagger.componentTagger());
      }
    } catch (e) {
      // Silently skip if lovable-tagger is not available
      console.warn("⚠️ lovable-tagger not available, skipping component tagging");
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
        },
        "/uploads": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
        },
      },
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
    build: {
      sourcemap: false,
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover', 'framer-motion', 'lucide-react'],
            'vendor-three': ['three', '@react-three/fiber', '@react-three/drei']
          }
        }
      }
    }
  };
});
