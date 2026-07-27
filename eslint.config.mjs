import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Flat config. Next 16 removed the `next lint` command and ESLint 9 ignores
 * `.eslintrc.json`, so the project's `npm run lint` was reporting nothing at
 * all — it exited on a "no such directory: lint" error that looked like a
 * path typo rather than a dead quality gate.
 *
 * @type {import("eslint").Linter.Config[]}
 */
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "coverage/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default config;
