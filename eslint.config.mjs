import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const config = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // O avatar do perfil é editável e pode apontar para qualquer host;
      // next/image exigiria remotePatterns e quebraria a página em runtime.
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
