import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import eslintPlugin from "vite-plugin-eslint"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    eslintPlugin({
      fix: true,
      emitWarning: true,
      emitError: true,
      overrideConfigFile: "./.eslintrc.cjs",
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        includePaths: ["./src/app/index.scss"],
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
})