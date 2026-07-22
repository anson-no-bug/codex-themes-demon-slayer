"use strict";

const assert = require("node:assert/strict");
const { existsSync } = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

function loadPlaywright() {
  try {
    return require("playwright");
  } catch (error) {
    const bundled = process.env.CODEX_BUNDLED_NODE_MODULES;
    if (!bundled) throw error;
    return require(path.join(bundled, "playwright"));
  }
}

function resolveBrowserExecutable() {
  if (process.env.CODEX_CHROMIUM_EXECUTABLE) return process.env.CODEX_CHROMIUM_EXECUTABLE;
  return [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ].find(existsSync);
}

function metricMap(result) {
  return Object.fromEntries(result.metrics.map(({ name, value }) => [name, value]));
}

async function countButtons(cdp) {
  await cdp.send("HeapProfiler.collectGarbage");
  const prototype = await cdp.send("Runtime.evaluate", {
    expression: "HTMLButtonElement.prototype",
  });
  const objects = await cdp.send("Runtime.queryObjects", {
    prototypeObjectId: prototype.result.objectId,
  });
  const counts = await cdp.send("Runtime.callFunctionOn", {
    objectId: objects.objects.objectId,
    returnByValue: true,
    functionDeclaration: `function () {
      return this.reduce((result, button) => {
        const connected = Boolean(button && button.isConnected);
        const themeTagged = Boolean(
          button?.dataset?.kisatsutaiAction === "send"
          || button?.querySelector?.(".kisatsutai-nichirin-control")
        );
        if (connected) result.connected += 1;
        else result.detached += 1;
        if (themeTagged && connected) result.themeConnected += 1;
        if (themeTagged && !connected) result.themeDetached += 1;
        return result;
      }, { connected: 0, detached: 0, themeConnected: 0, themeDetached: 0 });
    }`,
  });
  await cdp.send("Runtime.releaseObject", { objectId: objects.objects.objectId });
  await cdp.send("Runtime.releaseObject", { objectId: prototype.result.objectId });
  return counts.result.value;
}

let browser;

(async () => {
  const { chromium } = loadPlaywright();
  browser = await chromium.launch({
    headless: true,
    executablePath: resolveBrowserExecutable(),
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const cdp = await page.context().newCDPSession(page);
  const harness = path.resolve(__dirname, "../preview/runtime-harness.html");
  await page.goto(pathToFileURL(harness).href, { waitUntil: "load" });
  await page.waitForFunction(() => document.body.dataset.harnessState === "started");

  const backgroundComposition = await page.evaluate(() => {
    const surface = document.querySelector('[data-kisatsutai-mission-surface="true"]');
    const sidebar = document.querySelector('aside[data-kisatsutai-sidebar="true"]');
    const composer = document.querySelector('[data-kisatsutai-composer="true"]');
    const summaryPanel = document.querySelector('[data-kisatsutai-summary-panel="true"]');
    const before = surface ? getComputedStyle(surface, "::before") : null;
    const after = surface ? getComputedStyle(surface, "::after") : null;
    const bodyBefore = getComputedStyle(document.body, "::before");
    const imageCount = (value) => (value?.match(/url\(/g) || []).length;
    return {
      surfaceFound: Boolean(surface),
      sharedSceneBackground: bodyBefore.backgroundImage.slice(0, 360),
      sharedSceneUrls: imageCount(bodyBefore.backgroundImage),
      sharedScenePosition: bodyBefore.position,
      rootSharedScene: document.documentElement.style.getPropertyValue("--ki-shared-scene"),
      rootSharedScenePosition: document.documentElement.style
        .getPropertyValue("--ki-shared-scene-position"),
      localSceneUrls: {
        main: imageCount(before?.backgroundImage),
        sidebar: imageCount(sidebar ? getComputedStyle(sidebar).backgroundImage : ""),
        composer: imageCount(composer ? getComputedStyle(composer).backgroundImage : ""),
        summary: imageCount(summaryPanel ? getComputedStyle(summaryPanel).backgroundImage : ""),
      },
      afterContent: after?.content || "",
      afterBackgroundImage: after?.backgroundImage || "",
      activeCharacter: surface?.style.getPropertyValue("--ki-active-character") || "",
      activeOpponent: surface?.style.getPropertyValue("--ki-active-opponent") || "",
      invasionFigures: document.querySelectorAll(".kisatsutai-invasion-figure").length,
      muzanCutoutVariable: getComputedStyle(document.documentElement)
        .getPropertyValue("--ki-character-muzan")
        .trim(),
    };
  });
  assert.equal(backgroundComposition.surfaceFound, true, "mission background surface was not found");
  assert.equal(
    backgroundComposition.sharedSceneUrls,
    1,
    `mission viewport did not paint exactly one shared scene: ${JSON.stringify(backgroundComposition)}`,
  );
  assert.equal(
    backgroundComposition.sharedScenePosition,
    "fixed",
    `shared scene is not viewport-aligned: ${JSON.stringify(backgroundComposition)}`,
  );
  assert.ok(
    backgroundComposition.rootSharedScene.includes("--ki-location-")
      && backgroundComposition.rootSharedScenePosition,
    `shared scene variables were not initialized: ${JSON.stringify(backgroundComposition)}`,
  );
  assert.deepEqual(
    backgroundComposition.localSceneUrls,
    { main: 0, sidebar: 0, composer: 0, summary: 0 },
    `mission modules still repaint independently cropped scenes: ${JSON.stringify(backgroundComposition)}`,
  );
  assert.ok(
    !backgroundComposition.afterContent || backgroundComposition.afterContent === "none",
    `mission surface still renders an overlay pseudo-element: ${JSON.stringify(backgroundComposition)}`,
  );
  assert.ok(
    !backgroundComposition.afterBackgroundImage || backgroundComposition.afterBackgroundImage === "none",
    `mission surface still renders a second background: ${JSON.stringify(backgroundComposition)}`,
  );
  assert.equal(backgroundComposition.activeCharacter, "", "mission surface retained an active character image");
  assert.equal(backgroundComposition.activeOpponent, "", "mission surface retained an active opponent image");
  assert.equal(backgroundComposition.invasionFigures, 1, "Muzan invasion indicator is missing or duplicated");
  assert.match(
    backgroundComposition.muzanCutoutVariable,
    /^url\("data:image\/webp;base64,/,
    "Muzan invasion indicator is not using the optimized embedded asset",
  );

  // Tracking indicators are intentionally finite; wait until their two pulses finish.
  await page.waitForTimeout(4300);
  await cdp.send("Performance.enable");
  const idleStart = metricMap(await cdp.send("Performance.getMetrics"));
  await page.waitForTimeout(2000);
  const idleEnd = metricMap(await cdp.send("Performance.getMetrics"));
  const idle = {
    taskSeconds: idleEnd.TaskDuration - idleStart.TaskDuration,
    scriptSeconds: idleEnd.ScriptDuration - idleStart.ScriptDuration,
  };
  assert.ok(idle.scriptSeconds < 0.25, `idle script time is too high: ${idle.scriptSeconds}s / 2s`);
  assert.ok(idle.taskSeconds < 0.55, `idle task time is too high: ${idle.taskSeconds}s / 2s`);

  const assetWrites = await page.evaluate(async () => {
    const nativeSetProperty = CSSStyleDeclaration.prototype.setProperty;
    let count = 0;
    CSSStyleDeclaration.prototype.setProperty = function (property, ...args) {
      if (/^--ki-(?:(?:character|opponent|location|effect)-|shared-scene)/.test(String(property))) {
        count += 1;
      }
      return nativeSetProperty.call(this, property, ...args);
    };
    try {
      const signal = document.querySelector("[data-token-remaining]");
      for (let index = 0; index < 20; index += 1) {
        signal?.setAttribute("aria-label", `Token remaining 99840 / 128000 · ${index}`);
        await new Promise((resolve) => setTimeout(resolve, 24));
      }
      await new Promise((resolve) => setTimeout(resolve, 80));
      return count;
    } finally {
      CSSStyleDeclaration.prototype.setProperty = nativeSetProperty;
    }
  });
  assert.equal(assetWrites, 0, "embedded image variables were rewritten after initialization");

  await page.evaluate(async () => {
    for (let index = 0; index < 50; index += 1) {
      const current = document.querySelector("#composer-action");
      const replacement = document.createElement("button");
      replacement.id = "composer-action";
      replacement.type = "submit";
      replacement.setAttribute("aria-label", "Send");
      replacement.innerHTML = '<span aria-hidden="true">➤</span>';
      current.replaceWith(replacement);
      await new Promise((resolve) => setTimeout(resolve, 28));
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  const buttons = await countButtons(cdp);
  assert.equal(buttons.themeConnected, 1, "the live composer should have one themed send button");
  assert.ok(
    buttons.themeDetached <= 1,
    `detached themed send buttons were retained: ${JSON.stringify(buttons)}`,
  );

  const effects = await page.evaluate(async () => {
    const button = document.querySelector("#composer-action");
    for (let index = 0; index < 30; index += 1) button.click();
    const peak = document.querySelectorAll(".kisatsutai-slash-effect").length;
    await new Promise((resolve) => setTimeout(resolve, 980));
    return {
      peak,
      afterCleanup: document.querySelectorAll(".kisatsutai-slash-effect").length,
    };
  });
  assert.equal(effects.peak, 1, "rapid sends stacked multiple slash effects");
  assert.equal(effects.afterCleanup, 0, "slash effect did not release its DOM node");

  console.log(JSON.stringify({ backgroundComposition, idle, assetWrites, buttons, effects }, null, 2));
})()
  .finally(async () => {
    if (browser) await browser.close();
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
