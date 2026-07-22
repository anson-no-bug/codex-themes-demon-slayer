import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "manifest.json");
const entryPath = resolve(root, "index.js");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const errors = [];

for (const field of ["id", "name", "version", "githubRepo"]) {
  if (typeof manifest[field] !== "string" || !manifest[field]) {
    errors.push(`${field} must be a non-empty string`);
  }
}
if (!/^[a-zA-Z0-9._-]+$/.test(manifest.id || "")) errors.push("id has unsupported characters");
if (!/^\d+\.\d+\.\d+(?:[-+].*)?$/.test(manifest.version || "")) errors.push("version is not semver");
if (!/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(manifest.githubRepo || "")) {
  errors.push("githubRepo must use owner/repo");
}
if (!["renderer", "main", "both"].includes(manifest.scope)) errors.push("scope is invalid");
if (!existsSync(entryPath)) errors.push("index.js is missing; run npm run build");

if (existsSync(entryPath)) {
  const source = readFileSync(entryPath, "utf8");
  if (source.includes("__KISATSUTAI_THEME_CSS__")) errors.push("index.js contains an unresolved build token");
  if (source.includes("__KISATSUTAI_CHARACTER_ASSETS__")) {
    errors.push("index.js contains an unresolved character asset token");
  }
  try {
    const module = { exports: {} };
    new Function("module", "exports", "console", source)(module, module.exports, console);
    if (typeof module.exports.start !== "function") errors.push("index.js does not export start()");
    if (typeof module.exports.stop !== "function") errors.push("index.js does not export stop()");
  } catch (error) {
    errors.push(`index.js syntax/evaluation failed: ${error.message}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `error: ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("✓ manifest shape, entry file, CommonJS lifecycle, and build token are valid");
}
