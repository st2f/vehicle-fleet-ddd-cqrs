import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "reports/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,cjs,mjs,ts}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.node,
      sourceType: "commonjs",
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["eslint.config.mjs"],
    languageOptions: {
      sourceType: "module",
    },
  },
);
