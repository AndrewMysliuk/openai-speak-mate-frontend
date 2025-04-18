import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import fs from "fs"
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
    https: {
      key: fs.readFileSync("./certs/server.key"),
      cert: fs.readFileSync("./certs/server.crt"),
    },
    host: "0.0.0.0",
    port: 3000,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
})
