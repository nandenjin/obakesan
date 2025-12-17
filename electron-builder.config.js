module.exports = {
  appId: "com.nandenjin.obakesan",
  productName: "obakesan",
  directories: {
    buildResources: "build",
  },
  files: [
    "!**/.vscode/*",
    "!src/*",
    "!electron.vite.config.{js,ts,mjs,cjs}",
    "!{.eslintignore,.eslintrc.cjs,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}",
    "!{.env,.env.*,.npmrc,pnpm-lock.yaml}",
    "!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}",
  ],
  asarUnpack: ["resources/**"],
  // afterSign: 'build/notarize.js',
  win: {
    target: ["zip"],
    artifactName: "obakesan-${version}-win.${ext}",
  },
  mac: {
    notarize: !!process.env.ENABLE_APPLE_NOTARIZATION,
    icon: "build/icon_mac.png",
    artifactName: "obakesan-${version}-mac.${ext}",
  },
  dmg: {
    artifactName: "obakesan-${version}-mac.${ext}",
  },
  linux: {
    executableName: "obakesan",
    artifactName: "obakesan-${version}-linux.${ext}",
    target: ["AppImage", "snap", "deb"],
    maintainer: "Kazumi Inada <hello@nandenjin.com>",
    category: "Utility",
  },
  appImage: {
    artifactName: "obakesan-${version}-linux.${ext}",
  },
  npmRebuild: false,
};
