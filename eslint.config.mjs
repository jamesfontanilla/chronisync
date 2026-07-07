import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "next-env.d.ts",
      "**/.next/**",
      "**/node_modules/**",
      "**/dist/**",
      "public/sw.js",
      "public/sw.js.map",
      "public/swe-worker-*.js",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];

export default eslintConfig;