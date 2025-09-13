import { defineConfig } from "tsup";
export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["src/ortoni-report.ts", "src/cli.ts"],
  dts: true,
  external: [
    "@playwright/test",
    "playwright-core",
    "sqlite",
    "sqlite3",
    "express",
    "handlebars",
    "ansi-to-html",
    "commander",
  ],
});
