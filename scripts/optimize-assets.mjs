import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(root, "assets");
const outputRoot = resolve(sourceRoot, "runtime");
const magick = [
  process.env.KISATSUTAI_MAGICK,
  "/opt/homebrew/bin/magick",
  "/usr/local/bin/magick",
  "magick",
].filter(Boolean).find((candidate) => {
  try {
    execFileSync(candidate, ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
});

if (!magick) {
  throw new Error("ImageMagick is required to regenerate runtime assets (brew install imagemagick)");
}

const groups = [
  {
    source: "backgrounds",
    output: "backgrounds",
    geometry: "1280x720>",
    quality: "52",
  },
  {
    source: "characters/canon",
    output: "characters",
    geometry: "640x420>",
    quality: "48",
  },
  {
    source: "opponents/canon",
    output: "opponents",
    geometry: "640x420>",
    quality: "48",
  },
  {
    source: "effects/canon",
    output: "effects",
    geometry: "640x420>",
    quality: "48",
  },
];

const compactOfficialBackgrounds = new Set([
  "official-corps-march.webp",
  "official-entertainment-squad.webp",
  "official-hashira-assembly.webp",
  "official-hashira-night-watch.webp",
  "official-mugen-train-rendezvous.webp",
  "official-rengoku-blaze.webp",
  "official-swordsmith-alliance.webp",
]);

const outputs = [];
for (const group of groups) {
  const inputDir = resolve(sourceRoot, group.source);
  const outputDir = resolve(outputRoot, group.output);
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });
  for (const name of readdirSync(inputDir).sort()) {
    const input = resolve(inputDir, name);
    if (!statSync(input).isFile() || !/[.](?:jpe?g|png|webp)$/i.test(name)) continue;
    const output = resolve(outputDir, `${name.slice(0, -extname(name).length)}.webp`);
    const args = [input, "-auto-orient"];
    const compactOfficialBackground = group.source === "backgrounds"
      && compactOfficialBackgrounds.has(name);
    if (group.source === "backgrounds" && name === "infinity-castle.jpg") {
      args.push("-resize", "1280x720^", "-gravity", "center", "-extent", "1280x720");
    } else if (compactOfficialBackground) {
      args.push("-resize", "1024x576>");
    } else {
      args.push("-resize", group.geometry);
    }
    args.push(
      "-strip",
      "-quality", compactOfficialBackground ? "34" : group.quality,
      "-define", "webp:method=6",
      "-define", "webp:thread-level=1",
      output,
    );
    execFileSync(magick, args, { stdio: "inherit" });
    outputs.push(output);
  }
}

const totalBytes = outputs.reduce((total, file) => total + statSync(file).size, 0);
const budgetBytes = 2 * 1024 * 1024;
if (totalBytes > budgetBytes) {
  throw new Error(`runtime asset budget exceeded: ${(totalBytes / 1048576).toFixed(2)} MiB > 2 MiB`);
}

console.log(
  `Optimized ${outputs.length} runtime assets: ${(totalBytes / 1048576).toFixed(2)} MiB`,
);
