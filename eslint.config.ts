// @ts-check

import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import typescriptEslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import eslint from "@eslint/js";

const config = typescriptEslint.config([
  { ignores: ["*.d.ts", "**/coverage", "**/dist", "**/out"] },
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...pluginVue.configs["flat/recommended"],
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
  },
  eslintConfigPrettier,
]);

export default config;
