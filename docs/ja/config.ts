import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Obakesan",
  description: "制作に集中するための、DMX / Art-Net モニター & コンバーター",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "ホーム", link: "/ja/" },
      { text: "Obakesanとは", link: "/ja/intro" },
      { text: "ドキュメント", link: "/ja/interfaces/artnet" },
      { text: "ダウンロード", link: "/ja/download" },
    ],

    sidebar: [
      {
        text: "はじめに",
        items: [
          {
            text: "Obakesanとは",
            link: "/ja/intro",
          },
          { text: "クイックスタート", link: "/ja/quickstart" },
          { text: "デザインコンセプト", link: "/ja/design" },
        ],
      },
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
