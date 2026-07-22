"use strict";

const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const harness = path.resolve(root, "preview/runtime-harness.html");
const userScript = path.resolve(root, "demon-slayer-codex-theme.user.js");
const manifest = JSON.parse(readFileSync(path.resolve(root, "manifest.json"), "utf8"));

function resolveBrowserExecutable() {
  if (process.env.CODEX_CHROMIUM_EXECUTABLE) return process.env.CODEX_CHROMIUM_EXECUTABLE;
  return [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ].find(existsSync);
}

let browser;

(async () => {
  browser = await chromium.launch({
    headless: true,
    executablePath: resolveBrowserExecutable(),
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(pathToFileURL(harness).href, { waitUntil: "load" });
  await page.waitForTimeout(300);

  await page.evaluate(() => window.module.exports.stop());
  await page.addScriptTag({ path: userScript });
  await page.waitForTimeout(300);

  const first = await page.evaluate(() => ({
    version: window.__demonSlayerCodexTheme?.version,
    surface: document.documentElement.dataset.kisatsutaiSurface,
    stripCount: document.querySelectorAll("#kisatsutai-mission-strip").length,
    styleCount: document.querySelectorAll("#kisatsutai-mission-theme-style").length,
    dockCount: document.querySelectorAll(".kisatsutai-composer-breathing-dock").length,
  }));
  assert.deepEqual(first, {
    version: manifest.version,
    surface: "mission",
    stripCount: 1,
    styleCount: 1,
    dockCount: 1,
  });

  await page.addScriptTag({ path: userScript });
  await page.waitForTimeout(300);
  const reloaded = await page.evaluate(() => ({
    stripCount: document.querySelectorAll("#kisatsutai-mission-strip").length,
    styleCount: document.querySelectorAll("#kisatsutai-mission-theme-style").length,
    dockCount: document.querySelectorAll(".kisatsutai-composer-breathing-dock").length,
  }));
  assert.deepEqual(reloaded, { stripCount: 1, styleCount: 1, dockCount: 1 });

  await page.evaluate(() => window.__demonSlayerCodexTheme.configure({ motion: false, density: "quiet" }));
  await page.waitForTimeout(300);
  const configured = await page.evaluate(() => ({
    density: document.documentElement.dataset.kisatsutaiDensity,
    dockCount: document.querySelectorAll(".kisatsutai-composer-breathing-dock").length,
    storedMotion: JSON.parse(localStorage.getItem("demon-slayer-codex-theme:motion")),
  }));
  assert.deepEqual(configured, { density: "quiet", dockCount: 0, storedMotion: false });

  await page.evaluate(() => window.__demonSlayerCodexTheme.stop());
  await page.waitForTimeout(100);
  const stopped = await page.evaluate(() => ({
    surface: document.documentElement.dataset.kisatsutaiSurface || null,
    stripCount: document.querySelectorAll("#kisatsutai-mission-strip").length,
    styleCount: document.querySelectorAll("#kisatsutai-mission-theme-style").length,
  }));
  assert.deepEqual(stopped, { surface: null, stripCount: 0, styleCount: 0 });

  console.log(JSON.stringify({ first, reloaded, configured, stopped }, null, 2));
})()
  .finally(async () => {
    if (browser) await browser.close();
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
