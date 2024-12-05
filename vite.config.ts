import path from "path";
import { defineConfig } from "vite";

import Vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { createHtmlPlugin } from "vite-plugin-html";
import Unocss from "unocss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "~/": `${path.resolve(__dirname, "src")}/`,
    },
  },
  build: {
    outDir: "Electron/src",
    rollupOptions: {
      external: ["electron"],
    },
    target: "esnext",
    // sourcemap: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~/styles/element/index.scss" as *;`,
        api: "modern-compiler",
      },
    },
  },

  plugins: [
    Vue(),

    // https://github.com/posva/unplugin-vue-router
    VueRouter({
      extensions: [".vue", ".md"],
      dts: "src/typed-router.d.ts",
    }),

    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ["vue", "md"],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        ElementPlusResolver({
          importStyle: "sass",
        }),
      ],
      dts: "src/components.d.ts",
    }),

    // https://github.com/antfu/unocss
    // see uno.config.ts for config
    Unocss(),

    createHtmlPlugin({
      inject: {
        data: {
          // 在 HTML 中用占位符 {{title}} 动态设置标题
          title: "My Vite App",
        },
        tags: [
          {
            tag: "script",
            attrs: {
              src: "./../render.js",
            },
            injectTo: "head",
          },
        ],
      },
    }),
  ],
});
