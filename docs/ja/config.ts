import { defineConfig } from "vitepress";

const host = process.env.VITEPRESS_HOST_WITH_BASE || "https://example.com";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "ja",
  title: "Obakesan",
  description: "クリエイターのための、DMX / Art-Net モニター & コンバーター",
  head: [
    ["meta", { property: "og:title", content: "Obakesan" }],
    [
      "meta",
      {
        property: "og:description",
        content: "クリエイターのための、DMX / Art-Net モニター & コンバーター",
      },
    ],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:image", content: `${host}/ogp-ja.png` }],
  ],
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
