// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
    integrations: [mdx()],
    vite: {
        plugins: [tailwindcss()],
        // windows 側にディレクトリを置いているとき、hot reload が効かないので、以下の設定を追加する
        // server: {
        //     watch: {
        //         usePolling: true,
        //     },
        // },
    },
});
