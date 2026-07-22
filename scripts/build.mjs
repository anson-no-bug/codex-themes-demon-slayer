import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "src/tweak.js");
const cssPath = resolve(root, "src/theme.css");
const outputPath = resolve(root, "index.js");
const cssToken = "__KISATSUTAI_THEME_CSS__";
const assetToken = "__KISATSUTAI_CHARACTER_ASSETS__";
const assetFiles = {
  tanjiro: "assets/characters/canon/tanjiro.jpg",
  nezuko: "assets/characters/canon/nezuko.jpg",
  zenitsu: "assets/characters/canon/zenitsu.jpg",
  inosuke: "assets/characters/canon/inosuke.jpg",
  giyu: "assets/characters/canon/giyu.jpg",
  shinobu: "assets/characters/canon/shinobu.jpg",
  rengoku: "assets/characters/canon/rengoku.jpg",
  tengen: "assets/characters/canon/tengen.jpg",
  muichiro: "assets/characters/canon/muichiro.jpg",
  mitsuri: "assets/characters/canon/mitsuri.jpg",
  obanai: "assets/characters/canon/obanai.jpg",
  sanemi: "assets/characters/canon/sanemi.jpg",
  gyomei: "assets/characters/canon/gyomei.jpg",
  muzan: "assets/characters/canon/muzan-cutout.png",
  "opponent-rui": "assets/opponents/canon/rui.jpg",
  "opponent-enmu": "assets/opponents/canon/enmu.jpg",
  "opponent-daki": "assets/opponents/canon/daki.jpg",
  "opponent-gyutaro": "assets/opponents/canon/gyutaro.jpg",
  "opponent-kaigaku": "assets/opponents/canon/kaigaku.jpg",
  "opponent-gyokko": "assets/opponents/canon/gyokko.jpg",
  "opponent-hantengu": "assets/opponents/canon/hantengu.jpg",
  "opponent-nakime": "assets/opponents/canon/nakime.jpg",
  "opponent-akaza": "assets/opponents/canon/akaza.jpg",
  "opponent-doma": "assets/opponents/canon/doma.jpg",
  "opponent-kokushibo": "assets/opponents/canon/kokushibo.jpg",
  "opponent-muzan-opponent": "assets/opponents/canon/muzan.jpg",
  "location-infinity-castle": "assets/backgrounds/infinity-castle.jpg",
  "location-fujikasane": "assets/backgrounds/fujikasane.jpg",
  "location-entertainment-district": "assets/backgrounds/entertainment-district.jpg",
  "location-butterfly-mansion": "assets/backgrounds/butterfly-mansion.jpg",
  "location-asakusa": "assets/backgrounds/asakusa.jpg",
  "location-natagumo-mountain": "assets/backgrounds/natagumo-mountain.jpg",
  "location-swordsmith-village": "assets/backgrounds/swordsmith-village.jpg",
  "location-hashira-training": "assets/backgrounds/hashira-training.jpg",
  "location-ubuyashiki-estate": "assets/backgrounds/ubuyashiki-estate.jpg",
  "location-abandoned-castle": "assets/backgrounds/abandoned-castle.jpg",
  "effect-flame": "assets/effects/canon/rengoku-flame-action.jpg",
  "effect-insect": "assets/effects/canon/shinobu-insect.jpg",
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
    const mime = filename.endsWith(".png") ? "image/png" : "image/jpeg";
    return [id, `data:${mime};base64,${data}`];
  }),
);

const output = source
  .replace(cssToken, JSON.stringify(css))
  .replace(assetToken, JSON.stringify(characterAssets));
writeFileSync(outputPath, output, "utf8");
console.log(`Built ${outputPath}`);
