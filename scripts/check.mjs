import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entryPath = resolve(root, "index.js");
const packagePath = resolve(root, "package.json");
const installerPath = resolve(root, "install.sh");
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
const errors = [];

if (!/^\d+\.\d+\.\d+(?:[-+].*)?$/.test(packageJson.version || "")) {
  errors.push("package.json version is not semver");
}
if (!existsSync(entryPath)) errors.push("index.js is missing; run npm run build");
if (!existsSync(installerPath)) errors.push("install.sh is missing");

if (existsSync(installerPath)) {
  const installer = readFileSync(installerPath, "utf8");
  if (/\$[A-Za-z_][A-Za-z0-9_]*[^\x00-\x7F]/u.test(installer)) {
    errors.push("install.sh has an unbraced variable immediately followed by non-ASCII text");
  }
}

if (existsSync(entryPath)) {
  const source = readFileSync(entryPath, "utf8");
  if (source.includes("__KISATSUTAI_THEME_CSS__")) {
    errors.push("index.js contains an unresolved CSS build token");
  }
  if (source.includes("__KISATSUTAI_CHARACTER_ASSETS__")) {
    errors.push("index.js contains an unresolved asset build token");
  }
  if (!source.includes("__demonSlayerCodexThemeRuntime")) {
    errors.push("index.js is missing the BigPizzaV3 runtime marker");
  }
  if (!source.includes("BigPizzaV3/CodexPlusPlus user script")) {
    errors.push("index.js is missing the BigPizzaV3 platform contract");
  }
  if (source.includes("module.exports")) {
    errors.push("index.js still contains the retired b-nnett CommonJS lifecycle");
  }
  if (!source.includes(`THEME_RUNTIME_VERSION = ${JSON.stringify(packageJson.version)}`)) {
    errors.push("package.json and BigPizzaV3 runtime versions do not match");
  }
  try {
    new Function(source);
  } catch (error) {
    errors.push(`index.js syntax failed: ${error.message}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `error: ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("✓ BigPizzaV3 user script entry, embedded assets, version, and syntax are valid");
}
