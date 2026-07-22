import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "manifest.json");
const packagePath = resolve(root, "package.json");
const entryPath = resolve(root, "index.js");
const userScriptPath = resolve(root, "demon-slayer-codex-theme.user.js");
const installerPath = resolve(root, "install.sh");
const buildScriptPath = resolve(root, "scripts/build.mjs");
const runtimeAssetsPath = resolve(root, "assets/runtime");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
const errors = [];
const RUNTIME_BUDGET_BYTES = 2 * 1024 * 1024;

function listFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

for (const field of ["id", "name", "version", "githubRepo"]) {
  if (typeof manifest[field] !== "string" || !manifest[field]) {
    errors.push(`${field} must be a non-empty string`);
  }
}
if (!/^[a-zA-Z0-9._-]+$/.test(manifest.id || "")) errors.push("id has unsupported characters");
if (!/^\d+\.\d+\.\d+(?:[-+].*)?$/.test(manifest.version || "")) errors.push("version is not semver");
if (packageJson.version !== manifest.version) errors.push("package.json and manifest.json versions differ");
if (!/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(manifest.githubRepo || "")) {
  errors.push("githubRepo must use owner/repo");
}
if (manifest.runtime !== "BigPizzaV3/CodexPlusPlus") errors.push("runtime must target BigPizzaV3/CodexPlusPlus");
if (manifest.delivery !== "user-script") errors.push("delivery must be user-script");
if (manifest.scope !== "renderer") errors.push("scope must be renderer");
if (manifest.main !== "demon-slayer-codex-theme.user.js") errors.push("main must point to the user script");
if (!existsSync(entryPath)) errors.push("index.js is missing; run npm run build");
if (!existsSync(userScriptPath)) errors.push("BigPizzaV3 user script is missing; run npm run build");
if (!existsSync(installerPath)) errors.push("install.sh is missing");

const runtimeAssets = listFiles(runtimeAssetsPath);
const runtimeAssetBytes = runtimeAssets.reduce((total, file) => total + statSync(file).size, 0);
if (!runtimeAssets.length) errors.push("optimized runtime assets are missing; run npm run optimize:assets");
if (runtimeAssets.some((file) => !file.endsWith(".webp"))) {
  errors.push("runtime asset directory must contain WebP files only");
}
if (runtimeAssetBytes > RUNTIME_BUDGET_BYTES) {
  errors.push(
    `runtime assets exceed 2 MiB: ${(runtimeAssetBytes / 1048576).toFixed(2)} MiB`,
  );
}

const buildSource = readFileSync(buildScriptPath, "utf8");
const declaredRuntimeAssets = new Set(
  Array.from(buildSource.matchAll(/"(assets\/runtime\/[^"']+[.]webp)"/g), (match) => match[1]),
);
const actualRuntimeAssets = new Set(
  runtimeAssets.map((file) => relative(root, file).split("\\").join("/")),
);
for (const asset of declaredRuntimeAssets) {
  if (!actualRuntimeAssets.has(asset)) errors.push(`declared runtime asset is missing: ${asset}`);
}
for (const asset of actualRuntimeAssets) {
  if (!declaredRuntimeAssets.has(asset)) errors.push(`unused runtime asset should be removed: ${asset}`);
}
if (declaredRuntimeAssets.size !== 47) {
  errors.push(`runtime asset inventory should contain 47 files, found ${declaredRuntimeAssets.size}`);
}

if (existsSync(installerPath)) {
  const installer = readFileSync(installerPath, "utf8");
  try {
    execFileSync("sh", ["-n", installerPath], { stdio: "pipe" });
  } catch (error) {
    errors.push(`install.sh syntax check failed: ${error.stderr?.toString().trim() || error.message}`);
  }
  for (const required of [
    "BigPizzaV3/CodexPlusPlus",
    'CODEXPP_APPLICATIONS_DIR=${CODEXPLUSPLUS_APPLICATIONS_DIR:-"/Applications"}',
    'CODEXPP_LAUNCHER="$CODEXPP_APPLICATIONS_DIR/Codex++.app"',
    'CODEXPP_MANAGER="$CODEXPP_APPLICATIONS_DIR/Codex++ 管理工具.app"',
    ".config/Codex++",
    "user_scripts",
    "demon-slayer-codex-theme.user.js",
    "api.github.com/repos/${CODEXPP_REPO}/releases/latest",
    "browser_download_url",
    "digest",
    'arm64) CODEXPP_RELEASE_ARCH="arm64"',
    'x86_64) CODEXPP_RELEASE_ARCH="x64"',
    "shasum -a 256",
    "hdiutil verify",
    "hdiutil attach -readonly",
    "xattr -dr com.apple.quarantine",
    "sudo -v",
    'launchctl print "gui/$(id -u)/com.codexplusplus.watcher"',
    "--purge",
    "purge_codexplusplus",
    "validate_theme_script",
    "2097152",
    'pgrep -x CodexPlusPlus',
    '已删除 ${label}：${target_path}',
  ]) {
    if (!installer.includes(required)) errors.push(`install.sh is missing required flow: ${required}`);
  }
  for (const forbidden of [
    "b-nnett/codex-plusplus",
    "repair --force",
    "install --local",
    "validate-tweak",
    "codesign --force",
    "app.asar",
    "launchctl bootstrap",
    "StartInterval",
  ]) {
    if (installer.includes(forbidden)) errors.push(`install.sh still references invasive legacy flow: ${forbidden}`);
  }
}

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

if (existsSync(userScriptPath)) {
  const userScriptBytes = statSync(userScriptPath).size;
  if (userScriptBytes > RUNTIME_BUDGET_BYTES) {
    errors.push(`user script exceeds 2 MiB: ${(userScriptBytes / 1048576).toFixed(2)} MiB`);
  }
  const source = readFileSync(userScriptPath, "utf8");
  if (!source.includes(`version: ${JSON.stringify(manifest.version)}`)) {
    errors.push(`user script version does not match manifest: ${manifest.version}`);
  }
  if (source.includes("__KISATSUTAI_THEME_CSS__")) errors.push("user script contains an unresolved CSS token");
  if (source.includes("__KISATSUTAI_CHARACTER_ASSETS__")) {
    errors.push("user script contains an unresolved character asset token");
  }
  for (const required of [
    "__demonSlayerCodexTheme",
    "demon-slayer-codex-theme:",
    "theme.start(api)",
    "theme.stop()",
  ]) {
    if (!source.includes(required)) errors.push(`user script is missing runtime adapter: ${required}`);
  }
  try {
    new Function(source);
  } catch (error) {
    errors.push(`user script syntax check failed: ${error.message}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `error: ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `✓ BigPizzaV3 runtime is valid; ${runtimeAssets.length} WebP assets use `
      + `${(runtimeAssetBytes / 1048576).toFixed(2)} MiB within the 2 MiB budget`,
  );
}
