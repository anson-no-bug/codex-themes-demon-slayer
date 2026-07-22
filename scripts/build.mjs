import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "src/tweak.js");
const cssPath = resolve(root, "src/theme.css");
const outputPath = resolve(root, "index.js");
const userScriptOutputPath = resolve(root, "demon-slayer-codex-theme.user.js");
const manifest = JSON.parse(readFileSync(resolve(root, "manifest.json"), "utf8"));
const cssToken = "__KISATSUTAI_THEME_CSS__";
const assetToken = "__KISATSUTAI_CHARACTER_ASSETS__";
const assetFiles = {
  tanjiro: "assets/runtime/characters/tanjiro.webp",
  nezuko: "assets/runtime/characters/nezuko.webp",
  zenitsu: "assets/runtime/characters/zenitsu.webp",
  inosuke: "assets/runtime/characters/inosuke.webp",
  giyu: "assets/runtime/characters/giyu.webp",
  shinobu: "assets/runtime/characters/shinobu.webp",
  rengoku: "assets/runtime/characters/rengoku.webp",
  tengen: "assets/runtime/characters/tengen.webp",
  muichiro: "assets/runtime/characters/muichiro.webp",
  mitsuri: "assets/runtime/characters/mitsuri.webp",
  obanai: "assets/runtime/characters/obanai.webp",
  sanemi: "assets/runtime/characters/sanemi.webp",
  gyomei: "assets/runtime/characters/gyomei.webp",
  "muzan-cutout": "assets/runtime/characters/muzan-cutout.webp",
  "opponent-rui": "assets/runtime/opponents/rui.webp",
  "opponent-enmu": "assets/runtime/opponents/enmu.webp",
  "opponent-daki": "assets/runtime/opponents/daki.webp",
  "opponent-gyutaro": "assets/runtime/opponents/gyutaro.webp",
  "opponent-kaigaku": "assets/runtime/opponents/kaigaku.webp",
  "opponent-gyokko": "assets/runtime/opponents/gyokko.webp",
  "opponent-hantengu": "assets/runtime/opponents/hantengu.webp",
  "opponent-nakime": "assets/runtime/opponents/nakime.webp",
  "opponent-akaza": "assets/runtime/opponents/akaza.webp",
  "opponent-doma": "assets/runtime/opponents/doma.webp",
  "opponent-kokushibo": "assets/runtime/opponents/kokushibo.webp",
  "opponent-muzan-opponent": "assets/runtime/opponents/muzan.webp",
  "location-infinity-castle": "assets/runtime/backgrounds/infinity-castle.webp",
  "location-fujikasane": "assets/runtime/backgrounds/fujikasane.webp",
  "location-entertainment-district": "assets/runtime/backgrounds/entertainment-district.webp",
  "location-butterfly-mansion": "assets/runtime/backgrounds/butterfly-mansion.webp",
  "location-asakusa": "assets/runtime/backgrounds/asakusa.webp",
  "location-natagumo-mountain": "assets/runtime/backgrounds/natagumo-mountain.webp",
  "location-hashira-training": "assets/runtime/backgrounds/hashira-training.webp",
  "location-ubuyashiki-estate": "assets/runtime/backgrounds/ubuyashiki-estate.webp",
  "location-abandoned-castle": "assets/runtime/backgrounds/abandoned-castle.webp",
  "location-snowbound-shrine": "assets/runtime/backgrounds/snowbound-shrine.webp",
  "location-bamboo-moon-path": "assets/runtime/backgrounds/bamboo-moon-path.webp",
  "location-riverside-post-town": "assets/runtime/backgrounds/riverside-post-town.webp",
  "location-hashira-assembly": "assets/runtime/backgrounds/official-hashira-assembly.webp",
  "location-hashira-night-watch": "assets/runtime/backgrounds/official-hashira-night-watch.webp",
  "location-rengoku-blaze": "assets/runtime/backgrounds/official-rengoku-blaze.webp",
  "location-mugen-train-rendezvous": "assets/runtime/backgrounds/official-mugen-train-rendezvous.webp",
  "location-swordsmith-alliance": "assets/runtime/backgrounds/official-swordsmith-alliance.webp",
  "location-corps-march": "assets/runtime/backgrounds/official-corps-march.webp",
  "location-entertainment-squad": "assets/runtime/backgrounds/official-entertainment-squad.webp",
  "effect-flame": "assets/runtime/effects/rengoku-flame-action.webp",
  "effect-insect": "assets/runtime/effects/shinobu-insect.webp",
};

const source = readFileSync(sourcePath, "utf8");
const css = readFileSync(cssPath, "utf8");

if (!source.includes(cssToken) || !source.includes(assetToken)) {
  throw new Error(`build token missing from ${sourcePath}`);
}

const characterAssets = Object.fromEntries(
  Object.entries(assetFiles).map(([id, filename]) => {
    const file = resolve(root, filename);
    const data = readFileSync(file).toString("base64");
    const mime = filename.endsWith(".png")
      ? "image/png"
      : filename.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";
    return [id, `data:${mime};base64,${data}`];
  }),
);

const output = source
  .replace(cssToken, JSON.stringify(css))
  .replace(assetToken, JSON.stringify(characterAssets));
writeFileSync(outputPath, output, "utf8");
console.log(`Built ${outputPath}`);

const userScript = `"use strict";

(() => {
  const runtimeKey = "__demonSlayerCodexTheme";
  const storagePrefix = "demon-slayer-codex-theme:";
  const previous = window[runtimeKey];
  if (previous && typeof previous.stop === "function") {
    try { previous.stop(); } catch (error) { console.warn("[鬼杀队主题] 旧实例清理失败", error); }
  }

  const storage = {
    get(key, fallback) {
      try {
        const value = window.localStorage.getItem(storagePrefix + key);
        return value === null ? fallback : JSON.parse(value);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try { window.localStorage.setItem(storagePrefix + key, JSON.stringify(value)); } catch {}
      return value;
    },
    delete(key) {
      try { window.localStorage.removeItem(storagePrefix + key); } catch {}
    },
  };

  const api = {
    process: "renderer",
    manifest: { id: "dev.local.demon-slayer-codex-theme" },
    storage,
    settings: {
      registerPage() {
        return { unregister() {} };
      },
    },
    log: {
      debug(...args) { console.debug("[鬼杀队主题]", ...args); },
      info(...args) { console.info("[鬼杀队主题]", ...args); },
      warn(...args) { console.warn("[鬼杀队主题]", ...args); },
    },
    react: {
      getFiber(node) {
        if (!node || typeof node !== "object") return null;
        const key = Object.keys(node).find((name) => name.startsWith("__reactFiber$"));
        return key ? node[key] : null;
      },
    },
  };

  const module = { exports: {} };
  const exports = module.exports;
${output}

  const theme = module.exports;
  if (!theme || typeof theme.start !== "function" || typeof theme.stop !== "function") {
    throw new Error("鬼杀队主题构建产物缺少 start/stop 生命周期");
  }

  theme.start(api);
  window[runtimeKey] = {
    version: ${JSON.stringify(manifest.version)},
    stop() { theme.stop(); },
    configure(next = {}) {
      for (const [key, value] of Object.entries(next)) storage.set(key, value);
      theme.stop();
      theme.start(api);
    },
  };
})();
`;

writeFileSync(userScriptOutputPath, userScript, "utf8");
console.log(`Built ${userScriptOutputPath}`);
