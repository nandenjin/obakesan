import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Obakesan",
  description: "DMX / Art-Netのシンプルな監視アプリ",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "ホーム", link: "/ja/" },
      { text: "ダウンロード", link: "/ja/download" },
    ],

    sidebar: [
      {
        text: "インターフェース",
        items: [
          { text: "Art-Net", link: "/ja/interfaces/artnet" },
          { text: "FTDI", link: "/ja/interfaces/ftdi" },
        ],
      },
    ],
  },
});
