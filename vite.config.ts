import { defineConfig } from "vite";
import { minfifyAnuTemplate } from "./vite.plugins";

const proxyTarget = process.env.PROXY_TARGET ?? "http://esphome-device.local";

export default defineConfig({
  plugins: [minfifyAnuTemplate()],
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    minify: "oxc",
    cssMinify: "lightningcss",
    modulePreload: {
      polyfill: false,
    },
    rolldownOptions: {
      input: "index.html",
      output: {
        format: "es",
        entryFileNames: "www.js",
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    open: "/",
    host: true,
    proxy: {
      "^/(light|select|cover|switch|button|fan|lock|number|climate|events|text|date|time|valve)":
        proxyTarget,
    },
  },
});
