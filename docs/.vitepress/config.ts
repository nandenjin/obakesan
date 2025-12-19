import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Obakesan",
  description: "A simple monitor or converter app for stage lighting system",
  base: process.env.VITEPRESS_BASE || "/",
  cleanUrls: true,
  head: [["link", { rel: "icon", href: "/icon.png" }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: {
      src: "/icon.png",
      alt: "",
    },

    nav: [
      { text: "Home", link: "/" },
      { text: "What is Obakesan?", link: "/intro" },
      { text: "Documentation", link: "/interfaces/artnet" },
      {
        text: "Download",
        link: "/download",
      },
    ],

    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "What is Obakesan?", link: "/intro" },
          { text: "Quick Start", link: "/quickstart" },
          { text: "Design Concept", link: "/design" },
        ],
      },
      {
        text: "Interfaces",
        items: [
          { text: "Art-Net", link: "/interfaces/artnet" },
          { text: "FTDI", link: "/interfaces/ftdi" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/nandenjin/obakesan" },
    ],
  },
  rewrites: {
    "en/:rest*": ":rest*",
  },
  locales: {
    root: {
      label: "English",
      lang: "en",
    },
    ja: {
      label: "日本語",
      lang: "ja",
    },
  },
});
