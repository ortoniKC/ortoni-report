// src/helpers/templateLoader.ts
import fs from "fs";
import path from "path";

/**
 * Read the bundled index.html template.
 *
 * Resolution order:
 *  1) require.resolve('<pkgName>/dist/index.html') via require (synchronous; CJS fast path)
 *  2) createRequire(resolve) via dynamic import('module') (async ESM fallback)
 *  3) relative to this file: ../dist/index.html (dev/run-from-repo)
 *  4) node_modules/<pkgName>/dist/index.html from process.cwd()
 *  5) process.cwd()/dist/index.html
 *
 * Returns the template string. Throws a helpful Error if not found.
 *
 * NOTE: This function is async because dynamic import('module') is async in ESM.
 */
export async function readBundledTemplate(
  pkgName = "ortoni-report"
): Promise<string> {
  const packagedRel = "dist/index.html";

  // 1) Sync CJS fast-path: if `require` exists (typical for CJS consumers)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    if (typeof require === "function") {
      // Use require.resolve to reliably find the file inside installed package
      const resolved = require.resolve(`${pkgName}/${packagedRel}`);
      if (fs.existsSync(resolved)) {
        return fs.readFileSync(resolved, "utf-8");
      }
    }
  } catch {
    // ignore and continue to async fallback
  }

  // 2) Async ESM-safe createRequire via dynamic import (no eval)
  try {
    // dynamic import of 'module' works in ESM environments
    const moduleNS: any = await import("module");
    if (moduleNS && typeof moduleNS.createRequire === "function") {
      const createRequire = moduleNS.createRequire;
      // createRequire needs a filename/URL; use this file (works for both ESM and CJS)
      const req = createRequire(
        // @ts-ignore
        typeof __filename !== "undefined" ? __filename : import.meta.url
      );
      const resolved = req.resolve(`${pkgName}/${packagedRel}`);
      if (fs.existsSync(resolved)) {
        return fs.readFileSync(resolved, "utf-8");
      }
    }
  } catch {
    // ignore and try file fallbacks below
  }

  // 3) Relative to this module (useful in dev or mono-repo)
  try {
    const here = path.resolve(__dirname, "../dist/index.html");
    if (fs.existsSync(here)) return fs.readFileSync(here, "utf-8");
  } catch {
    // ignore
  }

  // 4) node_modules lookup from process.cwd()
  try {
    const nm = path.join(process.cwd(), "node_modules", pkgName, packagedRel);
    if (fs.existsSync(nm)) return fs.readFileSync(nm, "utf-8");
  } catch {
    // ignore
  }

  // 5) fallback to process.cwd()/dist/index.html
  try {
    const alt = path.join(process.cwd(), "dist", "index.html");
    if (fs.existsSync(alt)) return fs.readFileSync(alt, "utf-8");
  } catch {
    // ignore
  }

  // Helpful error for maintainers / users
  throw new Error(
    `ortoni-report template not found (tried:\n` +
      `  - require.resolve('${pkgName}/${packagedRel}')\n` +
      `  - import('module').createRequire(...).resolve('${pkgName}/${packagedRel}')\n` +
      `  - relative ../dist/index.html\n` +
      `  - ${path.join(
        process.cwd(),
        "node_modules",
        pkgName,
        packagedRel
      )}\n` +
      `  - ${path.join(process.cwd(), "dist", "index.html")}\n` +
      `Ensure 'dist/index.html' is present in the published package and package.json 'files' includes 'dist/'.`
  );
}
