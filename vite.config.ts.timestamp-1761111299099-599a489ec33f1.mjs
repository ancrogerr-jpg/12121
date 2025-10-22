// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { nodePolyfills } from "file:///home/project/node_modules/vite-plugin-node-polyfills/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["stream", "crypto", "util", "buffer", "process", "events", "string_decoder", "inherits", "http", "https", "zlib", "vm"],
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      protocolImports: true
    })
  ],
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: ["@web3auth/base", "@web3auth/modal", "@web3auth/ethereum-provider", "stream-browserify", "util"],
    esbuildOptions: {
      define: {
        global: "globalThis"
      }
    }
  },
  resolve: {
    alias: {
      stream: "stream-browserify",
      util: "util",
      process: "process/browser",
      buffer: "buffer"
    }
  },
  define: {
    "process.env": {},
    "process.version": JSON.stringify("v18.0.0"),
    global: "globalThis"
  },
  build: {
    rollupOptions: {
      external: []
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbm9kZVBvbHlmaWxscyh7XG4gICAgICBpbmNsdWRlOiBbJ3N0cmVhbScsICdjcnlwdG8nLCAndXRpbCcsICdidWZmZXInLCAncHJvY2VzcycsICdldmVudHMnLCAnc3RyaW5nX2RlY29kZXInLCAnaW5oZXJpdHMnLCAnaHR0cCcsICdodHRwcycsICd6bGliJywgJ3ZtJ10sXG4gICAgICBnbG9iYWxzOiB7XG4gICAgICAgIEJ1ZmZlcjogdHJ1ZSxcbiAgICAgICAgZ2xvYmFsOiB0cnVlLFxuICAgICAgICBwcm9jZXNzOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHByb3RvY29sSW1wb3J0czogdHJ1ZSxcbiAgICB9KSxcbiAgXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICBpbmNsdWRlOiBbJ0B3ZWIzYXV0aC9iYXNlJywgJ0B3ZWIzYXV0aC9tb2RhbCcsICdAd2ViM2F1dGgvZXRoZXJldW0tcHJvdmlkZXInLCAnc3RyZWFtLWJyb3dzZXJpZnknLCAndXRpbCddLFxuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICBkZWZpbmU6IHtcbiAgICAgICAgZ2xvYmFsOiAnZ2xvYmFsVGhpcycsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgc3RyZWFtOiAnc3RyZWFtLWJyb3dzZXJpZnknLFxuICAgICAgdXRpbDogJ3V0aWwnLFxuICAgICAgcHJvY2VzczogJ3Byb2Nlc3MvYnJvd3NlcicsXG4gICAgICBidWZmZXI6ICdidWZmZXInLFxuICAgIH0sXG4gIH0sXG4gIGRlZmluZToge1xuICAgICdwcm9jZXNzLmVudic6IHt9LFxuICAgICdwcm9jZXNzLnZlcnNpb24nOiBKU09OLnN0cmluZ2lmeSgndjE4LjAuMCcpLFxuICAgIGdsb2JhbDogJ2dsb2JhbFRoaXMnLFxuICB9LFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbXSxcbiAgICB9LFxuICAgIGNvbW1vbmpzT3B0aW9uczoge1xuICAgICAgdHJhbnNmb3JtTWl4ZWRFc01vZHVsZXM6IHRydWUsXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsU0FBUyxxQkFBcUI7QUFHOUIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLFVBQVUsVUFBVSxRQUFRLFVBQVUsV0FBVyxVQUFVLGtCQUFrQixZQUFZLFFBQVEsU0FBUyxRQUFRLElBQUk7QUFBQSxNQUNoSSxTQUFTO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixRQUFRO0FBQUEsUUFDUixTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0EsaUJBQWlCO0FBQUEsSUFDbkIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsSUFDeEIsU0FBUyxDQUFDLGtCQUFrQixtQkFBbUIsK0JBQStCLHFCQUFxQixNQUFNO0FBQUEsSUFDekcsZ0JBQWdCO0FBQUEsTUFDZCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixNQUFNO0FBQUEsTUFDTixTQUFTO0FBQUEsTUFDVCxRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLGVBQWUsQ0FBQztBQUFBLElBQ2hCLG1CQUFtQixLQUFLLFVBQVUsU0FBUztBQUFBLElBQzNDLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUM7QUFBQSxJQUNiO0FBQUEsSUFDQSxpQkFBaUI7QUFBQSxNQUNmLHlCQUF5QjtBQUFBLElBQzNCO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
