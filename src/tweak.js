"use strict";

const CSS_TEXT = __KISATSUTAI_THEME_CSS__;
const CHARACTER_ASSETS = __KISATSUTAI_CHARACTER_ASSETS__;

const ROOT_THEME_ATTR = "data-kisatsutai-theme";
const ROOT_BREATHING_MODE_ATTR = "data-kisatsutai-breathing-mode";
const ROOT_SURFACE_ATTR = "data-kisatsutai-surface";
const ROOT_MOTION_ATTR = "data-kisatsutai-motion";
const ROOT_DENSITY_ATTR = "data-kisatsutai-density";
const ROOT_STATE_ATTR = "data-kisatsutai-mission-state";
const ROOT_DIFFICULTY_ATTR = "data-kisatsutai-difficulty";
const STYLE_ID = "kisatsutai-mission-theme-style";
const STRIP_ID = "kisatsutai-mission-strip";
const SESSION_COUNT_STORAGE_KEY = "session-squad-counts-v1";
const SESSION_LOCATION_STORAGE_KEY = "session-location-overrides-v1";
const DEFAULTS = Object.freeze({
  enabled: true,
  narrative: true,
  motion: true,
  breathing: "water",
  density: "immersive",
});
const OBSERVER_OPTIONS = Object.freeze({
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: Object.freeze([
    "aria-label",
    "aria-disabled",
    "aria-valuenow",
    "aria-valuemax",
    "aria-valuetext",
    "title",
    "type",
    "disabled",
    "placeholder",
    "href",
    "aria-current",
    "data-state",
    "data-app-action-sidebar-thread-active",
    "data-app-action-sidebar-thread-id",
    "data-thread-id",
    "data-conversation-id",
    "data-token-remaining",
    "data-token-used",
    "data-token-limit",
    "data-token-total",
    "data-context-limit",
    "data-codexpp-settings-surface",
  ]),
});
const MAX_SESSION_STATES = 160;
const SLASH_EFFECT_DEDUPE_MS = 140;
const THEME_MARK_KEYS = Object.freeze([
  "kisatsutaiComposer",
  "kisatsutaiComposerShell",
  "kisatsutaiComposerFooter",
  "kisatsutaiComposerFooterBackdrop",
  "kisatsutaiQueuedPanel",
  "kisatsutaiTask",
  "kisatsutaiAction",
  "kisatsutaiNewTaskVariant",
  "kisatsutaiProjectAction",
  "kisatsutaiProjectRow",
  "kisatsutaiProjectState",
  "kisatsutaiSendState",
  "kisatsutaiTool",
  "kisatsutaiCopy",
  "kisatsutaiPlaceholder",
  "kisatsutaiSquadCount",
  "kisatsutaiNativeRail",
  "kisatsutaiSession",
  "kisatsutaiMissionSurface",
  "kisatsutaiMissionFrame",
  "kisatsutaiDifficulty",
  "kisatsutaiLocation",
  "kisatsutaiLocationLabel",
  "kisatsutaiAtmosphereLocation",
  "kisatsutaiLocationControl",
  "kisatsutaiSidebar",
  "kisatsutaiSummaryPanel",
  "kisatsutaiSummarySection",
  "kisatsutaiSummaryNativeSquad",
  "kisatsutaiNativeTaskControl",
  "kisatsutaiNativeTaskControlShell",
]);
const BREATHING_OPTIONS = Object.freeze([
  { id: "random", short: "随", label: "随机呼吸" },
  { id: "water", short: "水", label: "水之呼吸" },
  { id: "flame", short: "炎", label: "炎之呼吸" },
  { id: "thunder", short: "雷", label: "雷之呼吸" },
  { id: "insect", short: "虫", label: "虫之呼吸" },
]);
const ANIMATED_BREATHING_IDS = Object.freeze(["water", "flame", "thunder", "insect"]);
const CHARACTER_ROSTER = Object.freeze([
  { id: "tanjiro", name: "灶门炭治郎", specialty: "调查统筹" },
  { id: "nezuko", name: "灶门祢豆子", specialty: "护卫支援" },
  { id: "zenitsu", name: "我妻善逸", specialty: "快速检索" },
  { id: "inosuke", name: "嘴平伊之助", specialty: "探索压测" },
  { id: "giyu", name: "富冈义勇", specialty: "审查执行" },
  { id: "shinobu", name: "蝴蝶忍", specialty: "分析验证" },
  { id: "rengoku", name: "炼狱杏寿郎", specialty: "攻坚交付" },
  { id: "tengen", name: "宇髓天元", specialty: "并行调度" },
  { id: "muichiro", name: "时透无一郎", specialty: "精确重构" },
  { id: "mitsuri", name: "甘露寺蜜璃", specialty: "体验联调" },
  { id: "obanai", name: "伊黑小芭内", specialty: "边界审查" },
  { id: "sanemi", name: "不死川实弥", specialty: "故障攻坚" },
  { id: "gyomei", name: "悲鸣屿行冥", specialty: "稳定验收" },
]);

const CHARACTER_BY_ID = new Map(CHARACTER_ROSTER.map((character) => [character.id, character]));
const CORE_CHARACTER_IDS = Object.freeze(["tanjiro", "nezuko", "zenitsu", "inosuke"]);
const LOCATION_ROSTER = Object.freeze([
  {
    id: "infinity-castle",
    name: "无限城 · 深层回廊",
    region: "异空间",
    position: "50% 42%",
    sidebarPosition: "50% 50%",
  },
  {
    id: "fujikasane",
    name: "藤袭山 · 紫藤林",
    region: "最终选拔场",
    position: "60% 42%",
    sidebarPosition: "76% 50%",
  },
  {
    id: "entertainment-district",
    name: "吉原游郭 · 潜入夜街",
    region: "东京府",
    position: "50% 45%",
    sidebarPosition: "50% 50%",
  },
  {
    id: "butterfly-mansion",
    name: "蝶屋敷 · 修复庭院",
    region: "鬼杀队后方",
    position: "68% 44%",
    sidebarPosition: "84% 50%",
  },
  {
    id: "asakusa",
    name: "浅草 · 夜市鬼迹",
    region: "东京府",
    position: "56% 48%",
    sidebarPosition: "72% 50%",
  },
  {
    id: "natagumo-mountain",
    name: "那田蜘蛛山 · 深林蛛网",
    region: "北北东",
    position: "48% 45%",
    sidebarPosition: "42% 50%",
  },
  {
    id: "hashira-training",
    name: "柱稽古场 · 瀑布修行",
    region: "山奥",
    position: "52% 48%",
    sidebarPosition: "52% 50%",
  },
  {
    id: "ubuyashiki-estate",
    name: "产屋敷宅邸 · 月夜庭院",
    region: "鬼杀队本部",
    position: "54% 44%",
    sidebarPosition: "58% 50%",
  },
  {
    id: "abandoned-castle",
    name: "山顶废城 · 潜入侦察",
    region: "北境山地",
    position: "58% 42%",
    sidebarPosition: "68% 50%",
  },
  {
    id: "snowbound-shrine",
    name: "雪岭神社 · 冬夜结界",
    region: "北境雪岭",
    position: "52% 48%",
    sidebarPosition: "69% 50%",
  },
  {
    id: "bamboo-moon-path",
    name: "竹月古道 · 风鸣林",
    region: "山阴古道",
    position: "50% 48%",
    sidebarPosition: "57% 50%",
  },
  {
    id: "riverside-post-town",
    name: "川雾宿场 · 灯火渡口",
    region: "东海道",
    position: "50% 52%",
    sidebarPosition: "66% 50%",
  },
  {
    id: "hashira-assembly",
    name: "柱合会议 · 柱众集结",
    region: "鬼杀队本部",
    position: "50% 46%",
    sidebarPosition: "50% 46%",
  },
  {
    id: "hashira-night-watch",
    name: "柱合会议 · 决战前夜",
    region: "鬼杀队本部",
    position: "50% 48%",
    sidebarPosition: "50% 48%",
  },
  {
    id: "rengoku-blaze",
    name: "无限列车 · 炎柱先阵",
    region: "夜行列车",
    position: "50% 47%",
    sidebarPosition: "50% 47%",
  },
  {
    id: "mugen-train-rendezvous",
    name: "无限列车 · 车厢会师",
    region: "夜行列车",
    position: "50% 47%",
    sidebarPosition: "50% 47%",
  },
  {
    id: "swordsmith-alliance",
    name: "刀匠村 · 锻刀共战",
    region: "隐世山谷",
    position: "50% 47%",
    sidebarPosition: "50% 47%",
  },
  {
    id: "corps-march",
    name: "柱稽古 · 鬼杀队集结",
    region: "决战前线",
    position: "50% 48%",
    sidebarPosition: "50% 48%",
  },
  {
    id: "entertainment-squad",
    name: "吉原游郭 · 联合作战",
    region: "东京府",
    position: "50% 47%",
    sidebarPosition: "50% 47%",
  },
]);
const LOCATION_BY_ID = new Map(LOCATION_ROSTER.map((location) => [location.id, location]));
const MISSION_ROSTER = Object.freeze([
  { id: "trace", name: "鬼迹追踪", specialty: "调查 / 定位" },
  { id: "rescue", name: "失踪者搜救", specialty: "检索 / 修复" },
  { id: "escort", name: "紫藤护送", specialty: "迁移 / 守护" },
  { id: "review", name: "案卷审查", specialty: "审阅 / 验证" },
  { id: "forge", name: "锻刀构建", specialty: "构建 / 打包" },
  { id: "merge", name: "分支合流", specialty: "合并 / 冲突处理" },
  { id: "regression", name: "结界压测", specialty: "测试 / 回归" },
  { id: "intel", name: "渡鸦情报", specialty: "搜索 / 归纳" },
  { id: "cleanup", name: "依赖清剿", specialty: "升级 / 清理" },
  { id: "route", name: "路由侦察", specialty: "导航 / 排障" },
  { id: "postmortem", name: "故障复盘", specialty: "诊断 / 记录" },
  { id: "delivery", name: "黎明交付", specialty: "发布 / 验收" },
]);
const MISSION_BY_ID = new Map(MISSION_ROSTER.map((mission) => [mission.id, mission]));
const OPPONENT_ROSTER = Object.freeze([
  {
    id: "rui",
    name: "累",
    rank: "下弦之伍",
    technique: "血鬼术 · 刻线牢",
  },
  {
    id: "enmu",
    name: "魇梦",
    rank: "下弦之壹",
    technique: "血鬼术 · 强制昏睡",
  },
  {
    id: "daki",
    name: "堕姬",
    rank: "上弦之陆",
    technique: "血鬼术 · 八重带斩",
  },
  {
    id: "gyutaro",
    name: "妓夫太郎",
    rank: "上弦之陆",
    technique: "血鬼术 · 飞行血镰",
  },
  {
    id: "kaigaku",
    name: "狯岳",
    rank: "上弦之陆",
    technique: "雷之呼吸 · 黑雷",
  },
  {
    id: "gyokko",
    name: "玉壶",
    rank: "上弦之伍",
    technique: "血鬼术 · 水狱钵",
  },
  {
    id: "hantengu",
    name: "半天狗",
    rank: "上弦之肆",
    technique: "血鬼术 · 分裂",
  },
  {
    id: "nakime",
    name: "鸣女",
    rank: "上弦之肆",
    technique: "血鬼术 · 无限城",
  },
  {
    id: "akaza",
    name: "猗窝座",
    rank: "上弦之叁",
    technique: "术式展开 · 破坏杀",
  },
  {
    id: "doma",
    name: "童磨",
    rank: "上弦之贰",
    technique: "血鬼术 · 寒烈白姬",
  },
  {
    id: "kokushibo",
    name: "黑死牟",
    rank: "上弦之壹",
    technique: "月之呼吸",
  },
  {
    id: "muzan-opponent",
    name: "鬼舞辻无惨",
    rank: "鬼之始祖",
    technique: "血鬼术 · 黑血枳棘",
  },
]);

const OPPONENT_BY_ID = new Map(OPPONENT_ROSTER.map((opponent) => [opponent.id, opponent]));
const DIFFICULTY_TIERS = Object.freeze([
  {
    id: "trace",
    maxUsed: 0.15,
    grade: "戊",
    label: "下弦侦察",
    danger: 1,
    opponents: ["rui", "enmu"],
  },
  {
    id: "lower",
    maxUsed: 0.35,
    grade: "丁",
    label: "下弦讨伐",
    danger: 2,
    opponents: ["rui", "enmu"],
  },
  {
    id: "upper-six",
    maxUsed: 0.55,
    grade: "乙",
    label: "上弦末席",
    danger: 3,
    opponents: ["daki", "gyutaro", "kaigaku"],
  },
  {
    id: "upper-mid",
    maxUsed: 0.72,
    grade: "甲",
    label: "上弦中位",
    danger: 4,
    opponents: ["gyokko", "hantengu", "nakime"],
  },
  {
    id: "upper-three",
    maxUsed: 0.9,
    grade: "极",
    label: "上弦前三",
    danger: 5,
    opponents: ["akaza", "doma", "kokushibo"],
  },
  {
    id: "demon-king",
    maxUsed: 1.01,
    grade: "终",
    label: "鬼王终局",
    danger: 5,
    opponents: ["muzan-opponent"],
  },
]);

const THEME_ASSET_BINDINGS = Object.freeze([
  ...CHARACTER_ROSTER.map((character) => ({
    assetId: character.id,
    property: `--ki-character-${character.id}`,
  })),
  { assetId: "muzan-cutout", property: "--ki-character-muzan" },
  ...OPPONENT_ROSTER.map((opponent) => ({
    assetId: `opponent-${opponent.id}`,
    property: `--ki-opponent-${opponent.id}`,
  })),
  ...LOCATION_ROSTER.map((location) => ({
    assetId: `location-${location.id}`,
    property: `--ki-location-${location.id}`,
  })),
  { assetId: "effect-flame", property: "--ki-effect-flame" },
  { assetId: "effect-insect", property: "--ki-effect-insect" },
]);
const THEME_CSS_VARS = THEME_ASSET_BINDINGS.map((binding) => binding.property);

const DISPLAY_COPY = new Map([
  ["new task", "接取讨伐"],
  ["new chat", "接取讨伐"],
  ["new conversation", "接取讨伐"],
  ["新任务", "接取讨伐"],
  ["新建任务", "接取讨伐"],
  ["新对话", "接取讨伐"],
  ["outputs", "任务案卷"],
  ["artifacts", "任务案卷"],
  ["environment", "任务案卷"],
  ["sources", "渡鸦情报"],
  ["鎹鸦情报", "渡鸦情报"],
  ["subagents", "出战小队"],
]);

const ACTION_RULES = [
  {
    kind: "new-task",
    pattern: /(new|start|create)\s+(?:a\s+)?(?:new\s+)?(task|chat|conversation|thread)|新(?:建|增)(?:任务|对话|会话|线程)|创建(?:任务|对话|会话|线程)/i,
    title: "接取讨伐",
  },
];

const PAGE_ICON = [
  '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">',
  '<path d="M4 15.5 14.8 4.2M5.2 4.2 16 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  '<circle cx="10" cy="10" r="3.2" stroke="currentColor" stroke-width="1.2"/>',
  '<path d="M10 6.8c.4 1.8 1.4 2.8 3.2 3.2-1.8.4-2.8 1.4-3.2 3.2-.4-1.8-1.4-2.8-3.2-3.2 1.8-.4 2.8-1.4 3.2-3.2Z" fill="currentColor"/>',
  "</svg>",
].join("");

const NICHIRIN_CONTROL = [
  '<span class="kisatsutai-nichirin-control" aria-hidden="true">',
  '<span class="kisatsutai-nichirin-icon kisatsutai-nichirin-icon--send">',
  '<svg viewBox="0 0 36 36" fill="none">',
  '<path class="kisatsutai-nichirin-blade" d="M14.5 23.8C20.2 18.7 25.4 12.4 30.1 5.6L32.4 3.5l-1.2 3.8C26.8 14.8 21.5 21 15.8 25.2Z"/>',
  '<path class="kisatsutai-nichirin-edge" d="M16 23.7C21.2 18.6 26.3 12.2 31.5 4.7"/>',
  '<path class="kisatsutai-nichirin-hamon" d="M17.4 22.2c.8.1 1.1.8 1.9.5.9-.3.6-1.2 1.5-1.7.8-.4 1.2.2 2-.3.8-.5.5-1.3 1.5-1.9"/>',
  '<path class="kisatsutai-nichirin-habaki" d="m13.4 23.2 3.4 3.2-1.6 1.5-3.3-3.3Z"/>',
  '<circle class="kisatsutai-nichirin-guard" cx="13.8" cy="25.8" r="2.55"/>',
  '<path class="kisatsutai-nichirin-guard-detail" d="m12.1 24.1 3.5 3.4m-3.6.2 3.6-3.7"/>',
  '<path class="kisatsutai-nichirin-handle" d="m12.1 27.3-5.7 5.6"/>',
  '<path class="kisatsutai-nichirin-wrap" d="m10.7 27.8 1.3 1.3m-3 .1 1.4 1.4m-3 .2 1.2 1.2"/>',
  '<path class="kisatsutai-nichirin-pommel" d="m5.8 32.4 1.2 1.2"/>',
  '<circle class="kisatsutai-nichirin-state-seal" cx="28.8" cy="28.4" r="4.2"/>',
  '<text class="kisatsutai-nichirin-state-glyph" x="28.8" y="30.5" text-anchor="middle">斩</text>',
  "</svg>",
  "</span>",
  '<span class="kisatsutai-nichirin-icon kisatsutai-nichirin-icon--stop">',
  '<svg viewBox="0 0 36 36" fill="none">',
  '<path class="kisatsutai-stop-saya" d="M14.5 24.9C20.2 19.6 25.2 13.4 29.8 6.3"/>',
  '<path class="kisatsutai-stop-saya-edge" d="M15.3 23.8C20.5 18.9 25 13.1 29.1 7"/>',
  '<path class="kisatsutai-stop-kojiri" d="m28.6 7.8 2.1-2.1"/>',
  '<path class="kisatsutai-stop-collar" d="m13.1 23.3 3.2 3.2"/>',
  '<circle class="kisatsutai-stop-guard" cx="13.8" cy="25.9" r="2.65"/>',
  '<path class="kisatsutai-stop-guard-detail" d="m12 24.1 3.7 3.6m-3.8.1 3.8-3.8"/>',
  '<path class="kisatsutai-stop-handle" d="m12.1 27.4-5.8 5.7"/>',
  '<path class="kisatsutai-stop-wrap" d="m10.6 27.9 1.4 1.4m-3.1.2 1.4 1.4m-3 .1 1.2 1.2"/>',
  '<path class="kisatsutai-stop-cord" d="M18.7 19.6c3.9 1 4.7 4.5 2.5 5.6-1.9.9-3-1.4-1.2-2.4 1.2-.6 2.2.5 1.8 1.6"/>',
  '<path class="kisatsutai-stop-pommel" d="m5.7 32.5 1.3 1.2"/>',
  '<circle class="kisatsutai-nichirin-state-seal" cx="28.8" cy="28.4" r="4.2"/>',
  '<text class="kisatsutai-nichirin-state-glyph" x="28.8" y="30.5" text-anchor="middle">收</text>',
  "</svg>",
  "</span>",
  "</span>",
].join("");

const COMPOSER_BREATHING_DOCK = [
  '<span class="kisatsutai-composer-breathing-dock" data-kisatsutai-injected="true">',
  '<span class="kisatsutai-composer-breathing-label" aria-hidden="true">呼吸</span>',
  '<span class="kisatsutai-breathing-switch" role="group" aria-label="发送时使用的呼吸法">',
  ...BREATHING_OPTIONS.map((option) => (
    `<button type="button" data-kisatsutai-breath="${option.id}" `
      + `aria-label="${option.label}" title="${option.label}">${option.short}</button>`
  )),
  "</span>",
  "</span>",
].join("");

const LOCATION_ICON = [
  '<span class="kisatsutai-location-icon" aria-hidden="true">',
  '<svg viewBox="0 0 16 16" fill="none">',
  '<path d="M8 14s4-4.1 4-7.6A4 4 0 1 0 4 6.4C4 9.9 8 14 8 14Z"/>',
  '<circle cx="8" cy="6.2" r="1.35"/>',
  "</svg>",
  "</span>",
].join("");

let apiRef = null;
let preferences = { ...DEFAULTS };
let observer = null;
let styleElement = null;
let settingsHandle = null;
let scheduledFrame = 0;
let navHandler = null;
let resizeHandler = null;
let missionStrip = null;
let textPatches = [];
let attributePatches = [];
let injectedNodes = new Set();
let markedElements = new Set();
let sessionStates = new Map();
let lastActiveSessionKey = "";
let draftSessionCounter = 0;
let navigationClickHandler = null;
let settingsSurfaceHandler = null;
let sendActionHandlers = new Map();
let composerKeyHandlers = new Map();
let breathingControlHandlers = new Map();
let slashTimers = new Set();
let activeSlashEffect = null;
let activeSlashTimer = 0;
let lastSlashEffectAt = -Infinity;
let resolvedRandomBreathing = DEFAULTS.breathing;
let ravenStatus = null;
let assetsApplied = false;

function setAttributeIfChanged(element, name, value) {
  if (!(element instanceof Element)) return;
  const next = String(value);
  if (element.getAttribute(name) !== next) element.setAttribute(name, next);
}

function setDatasetIfChanged(element, key, value) {
  if (!(element instanceof HTMLElement)) return;
  const next = String(value);
  if (element.dataset[key] !== next) element.dataset[key] = next;
}

function setStylePropertyIfChanged(element, name, value) {
  if (!(element instanceof HTMLElement)) return;
  const next = String(value);
  if (element.style.getPropertyValue(name) !== next) element.style.setProperty(name, next);
}

function clearMarkedElement(element) {
  if (!(element instanceof HTMLElement)) return;
  for (const key of THEME_MARK_KEYS) delete element.dataset[key];
  for (const property of [
    "--ki-mission-background",
    "--ki-mission-position",
    "--ki-context-location",
    "--ki-context-position",
    "--ki-native-trailing-rail",
  ]) element.style.removeProperty(property);
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

function isPrimaryCodexRenderer() {
  const root = document.documentElement;
  if (document.body?.dataset.kisatsutaiHarness === "true") return true;
  if (location.protocol !== "app:" || location.pathname !== "/index.html") return false;
  if (root.classList.contains("compact-window")) return false;
  const initialRoute = new URLSearchParams(location.search).get("initialRoute") || "";
  return !/(avatar-overlay|hotkey-window|quick-chat|global-dictation)/i.test(initialRoute);
}

function clampSquadCount(value) {
  const count = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(count)) return 0;
  return Math.min(CHARACTER_ROSTER.length, Math.max(1, count));
}

function hashString(value) {
  let hash = 2166136261;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededShuffle(values, seed) {
  const next = [...values];
  let state = (seed >>> 0) || 0x9e3779b9;
  const random = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function normalizeThreadRoute(value) {
  if (!value) return "";
  let decoded = String(value);
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    /* keep the raw route */
  }
  const match = decoded.match(/\/(?:local|thread|conversation|tasks?)\/[a-z0-9_-]+/i);
  return match ? match[0].replace(/\/+$/, "") : "";
}

function getThreadSessionKey(task) {
  if (!(task instanceof HTMLElement)) return "";
  for (const attribute of [
    "data-app-action-sidebar-thread-id",
    "data-thread-id",
    "data-conversation-id",
    "data-task-id",
  ]) {
    const value = task.getAttribute(attribute);
    if (value) return `thread:${value}`;
  }
  const anchor = task.matches("a[href]") ? task : task.querySelector("a[href]");
  const route = normalizeThreadRoute(anchor?.getAttribute("href") || task.getAttribute("href"));
  return route ? `route:${route}` : "";
}

function getActiveThreadRow() {
  return document.querySelector(
    "[data-app-action-sidebar-thread-row][data-app-action-sidebar-thread-active='true'], "
      + "[data-app-action-sidebar-thread-row][aria-current='page'], "
      + "[data-app-action-sidebar-thread-row][data-state='active'], "
      + "[data-kisatsutai-task='true'][data-app-action-sidebar-thread-active='true'], "
      + "[data-kisatsutai-task='true'][aria-current='page'], "
      + "[data-kisatsutai-task='true'][data-state='active']",
  );
}

function ensureSessionState(key) {
  const stableKey = key || "draft:initial";
  const existing = sessionStates.get(stableKey);
  if (existing) return existing;

  while (sessionStates.size >= MAX_SESSION_STATES) {
    const oldestKey = sessionStates.keys().next().value;
    if (oldestKey === undefined) break;
    sessionStates.delete(oldestKey);
  }

  const seed = hashString(`${stableKey}:kisatsutai`);
  const core = seededShuffle(CORE_CHARACTER_IDS, seed ^ 0x4b1d5a77);
  const support = seededShuffle(
    CHARACTER_ROSTER.map((character) => character.id)
      .filter((id) => !CORE_CHARACTER_IDS.includes(id)),
    seed ^ 0xa73c4e21,
  );
  const squadOrder = [
    core[0],
    core[1],
    support[0],
    core[2],
    support[1],
    core[3],
    ...support.slice(2),
  ].filter(Boolean);
  const location = LOCATION_ROSTER[hashString(`${stableKey}:location`) % LOCATION_ROSTER.length];
  const mission = MISSION_ROSTER[hashString(`${stableKey}:mission`) % MISSION_ROSTER.length];
  const storedCounts = apiRef?.storage?.get?.(SESSION_COUNT_STORAGE_KEY, {}) || {};
  const storedLocations = apiRef?.storage?.get?.(SESSION_LOCATION_STORAGE_KEY, {}) || {};
  const storedCount = clampSquadCount(storedCounts[stableKey]);
  const storedLocationId = LOCATION_BY_ID.has(storedLocations[stableKey])
    ? storedLocations[stableKey]
    : location.id;
  const state = {
    key: stableKey,
    seed,
    locationId: storedLocationId,
    missionId: mission.id,
    squadOrder,
    observedSquadCount: storedCount || 1,
    opponentByTier: new Map(),
  };
  sessionStates.set(stableKey, state);
  return state;
}

function rememberSessionLocation(state, locationId) {
  if (!state || !LOCATION_BY_ID.has(locationId) || state.locationId === locationId) return;
  state.locationId = locationId;
  const existing = apiRef?.storage?.get?.(SESSION_LOCATION_STORAGE_KEY, {}) || {};
  const next = { ...existing, [state.key]: locationId };
  const entries = Object.entries(next);
  const bounded = entries.length > 160
    ? Object.fromEntries(entries.slice(entries.length - 160))
    : next;
  apiRef?.storage?.set?.(SESSION_LOCATION_STORAGE_KEY, bounded);
}

function cycleSessionLocation(state) {
  if (!state) return null;
  const order = seededShuffle(
    LOCATION_ROSTER.map((location) => location.id),
    state.seed ^ 0x71c6a4d9,
  );
  const currentIndex = order.indexOf(state.locationId);
  const nextId = order[(currentIndex + 1 + order.length) % order.length] || order[0];
  rememberSessionLocation(state, nextId);
  return LOCATION_BY_ID.get(nextId) || null;
}

function rememberSquadCount(state, count) {
  const nextCount = clampSquadCount(count);
  if (!state || !nextCount || state.observedSquadCount === nextCount) return;
  state.observedSquadCount = nextCount;
  const existing = apiRef?.storage?.get?.(SESSION_COUNT_STORAGE_KEY, {}) || {};
  const next = { ...existing, [state.key]: nextCount };
  const entries = Object.entries(next);
  const bounded = entries.length > 160
    ? Object.fromEntries(entries.slice(entries.length - 160))
    : next;
  apiRef?.storage?.set?.(SESSION_COUNT_STORAGE_KEY, bounded);
}

function getActiveSessionContext() {
  const task = getActiveThreadRow();
  const routeKey = normalizeThreadRoute(location.href);
  const key = getThreadSessionKey(task)
    || (routeKey ? `route:${routeKey}` : "")
    || lastActiveSessionKey
    || "draft:initial";
  lastActiveSessionKey = key;
  return { task, key, state: ensureSessionState(key) };
}

function getSessionCharacters(state, count) {
  const total = clampSquadCount(count) || 1;
  const ids = [];
  let cycle = 0;
  while (ids.length < total) {
    const order = cycle === 0
      ? state.squadOrder
      : seededShuffle(state.squadOrder, state.seed ^ (cycle * 0x45d9f3b));
    ids.push(...order);
    cycle += 1;
  }
  return ids.slice(0, total);
}

function getDeclaredSquadCount(element) {
  if (!(element instanceof HTMLElement)) return 0;
  const carriers = [
    element,
    ...element.querySelectorAll("[data-subagent-count], [data-agent-count], [data-subagents]"),
  ];
  for (const carrier of carriers) {
    const count = clampSquadCount(
      carrier.getAttribute("data-subagent-count")
        || carrier.getAttribute("data-agent-count")
        || carrier.getAttribute("data-subagents"),
    );
    if (count) return count;
  }

  const label = [
    element.getAttribute("aria-label"),
    element.getAttribute("title"),
    element.textContent,
  ].filter(Boolean).join(" ");
  const match = label.match(/(\d{1,2})\s*(?:sub-?agents?|agents?|子代理|代理成员|名队员)/i);
  return match ? clampSquadCount(match[1]) : 0;
}

function detectLiveSquadCount() {
  const summaryCount = getSummarySquadCount();
  if (summaryCount) return summaryCount;

  const surface = document.querySelector("[data-app-shell-main-content-layout]")
    || document.querySelector("main, [role='main']");
  if (!(surface instanceof HTMLElement)) return 0;
  const nodes = Array.from(surface.querySelectorAll(
    "[data-testid='subagent'], [data-testid^='subagent-'], [data-testid*='subagent-card'], [aria-label^='Subagent '], [aria-label^='子代理']",
  )).filter((node) => {
    if (!(node instanceof HTMLElement)) return false;
    if (node.closest("[data-kisatsutai-injected='true'], [aria-hidden='true']")) return false;
    if (node.hidden || getComputedStyle(node).display === "none") return false;
    const rect = node.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  const unique = new Set(nodes.map((node, index) => (
    node.getAttribute("data-subagent-id")
      || node.getAttribute("data-thread-id")
      || node.getAttribute("href")
      || node.getAttribute("aria-label")
      || `node:${index}`
  )));
  return unique.size ? clampSquadCount(unique.size + 1) : 0;
}

function resolveSquadCount(task, state, active = false) {
  const declared = getDeclaredSquadCount(task);
  if (declared) {
    rememberSquadCount(state, declared);
    return declared;
  }
  if (active) {
    const live = detectLiveSquadCount();
    if (live) rememberSquadCount(state, live);
  }
  return clampSquadCount(state.observedSquadCount) || 1;
}

function renderAvatarStack(container, characterIds, totalCount) {
  const taskUsesNativeRail = container.classList.contains("kisatsutai-task-squad")
    && container.closest("[data-kisatsutai-native-rail='true']");
  const isDuelRoster = container.classList.contains("kisatsutai-strip-squad");
  const usesFullMissionRoster = container.classList.contains("kisatsutai-summary-squad");
  const visibleLimit = isDuelRoster
    ? 3
    : (usesFullMissionRoster ? 4 : (taskUsesNativeRail ? 2 : 3));
  const signature = `${visibleLimit}:${totalCount}:${characterIds.join(",")}`;
  if (container.dataset.kisatsutaiSignature === signature) return;
  container.replaceChildren();
  container.dataset.kisatsutaiSignature = signature;
  container.dataset.count = String(Math.min(totalCount, visibleLimit));

  const visibleIds = characterIds.slice(0, visibleLimit);
  visibleIds.forEach((id, index) => {
    const character = CHARACTER_BY_ID.get(id);
    const avatar = document.createElement("span");
    avatar.className = "kisatsutai-agent-avatar";
    avatar.dataset.character = id;
    avatar.dataset.index = String(index);
    avatar.setAttribute("aria-hidden", "true");
    avatar.title = character ? `${character.name} · ${character.specialty}` : id;
    container.appendChild(avatar);
  });

  if (totalCount > visibleLimit && !isDuelRoster) {
    const overflow = document.createElement("span");
    overflow.className = "kisatsutai-agent-overflow";
    overflow.textContent = `+${totalCount - visibleLimit}`;
    overflow.setAttribute("aria-hidden", "true");
    container.appendChild(overflow);
  }

  const names = characterIds
    .slice(0, Math.min(totalCount, 6))
    .map((id) => CHARACTER_BY_ID.get(id)?.name)
    .filter(Boolean);
  const more = totalCount > names.length ? `，另有 ${totalCount - names.length} 名队员` : "";
  container.setAttribute("aria-label", `负责队员：${names.join("、")}${more}`);
}

function isEffectivelyVisibleWithin(node, boundary) {
  let cursor = node;
  while (cursor instanceof HTMLElement && cursor !== boundary) {
    const style = getComputedStyle(cursor);
    if (
      style.display === "none"
      || style.visibility === "hidden"
      || Number.parseFloat(style.opacity || "1") <= 0.05
    ) return false;
    cursor = cursor.parentElement;
  }
  return true;
}

function measureNativeTrailingRail(task) {
  if (!task.hasAttribute("data-app-action-sidebar-thread-row")) return 0;
  let width = 0;
  for (const node of task.querySelectorAll("div, span")) {
    if (!(node instanceof HTMLElement)) continue;
    if (node.closest("[data-kisatsutai-injected='true']")) continue;
    if (node.closest("[data-app-action-sidebar-thread-row]") !== task) continue;
    const style = getComputedStyle(node);
    const right = Number.parseFloat(style.right);
    if (style.position !== "absolute" || !Number.isFinite(right) || Math.abs(right) > 1) continue;
    if (!isEffectivelyVisibleWithin(node, task)) continue;
    const rect = node.getBoundingClientRect();
    if (rect.width >= 20 && rect.height > 0) width = Math.max(width, rect.width);
  }
  const measured = width > 0 ? Math.ceil(Math.min(width, 120)) : 0;
  if (measured > 0) {
    setStylePropertyIfChanged(task, "--ki-native-trailing-rail", `${measured}px`);
    setDatasetIfChanged(task, "kisatsutaiNativeRail", "true");
  } else {
    task.style.removeProperty("--ki-native-trailing-rail");
    setDatasetIfChanged(task, "kisatsutaiNativeRail", "false");
  }
  return measured;
}

function syncTaskSquad(task) {
  const key = getThreadSessionKey(task);
  if (!key) return;
  const state = ensureSessionState(key);
  const active = task === getActiveThreadRow() || task.matches(
    "[aria-current='page'], [data-state='active'], [data-app-action-sidebar-thread-active='true']",
  );
  if (active) lastActiveSessionKey = key;
  const count = resolveSquadCount(task, state, active);
  const characters = getSessionCharacters(state, count);
  let squad = task.querySelector(".kisatsutai-task-squad");
  if (!squad) {
    squad = document.createElement("span");
    squad.className = "kisatsutai-avatar-stack kisatsutai-task-squad";
    squad.dataset.kisatsutaiInjected = "true";
    task.appendChild(squad);
    injectedNodes.add(squad);
  }
  setDatasetIfChanged(task, "kisatsutaiSquadCount", Math.min(count, 4));
  setDatasetIfChanged(task, "kisatsutaiSession", key);
  measureNativeTrailingRail(task);
  renderAvatarStack(squad, characters, count);
}

function applyCharacterAssets() {
  if (assetsApplied) return;
  const root = document.documentElement;
  for (const binding of THEME_ASSET_BINDINGS) {
    const asset = CHARACTER_ASSETS[binding.assetId];
    if (asset) root.style.setProperty(binding.property, `url("${asset}")`);
  }
  assetsApplied = true;
}

function clearCharacterAssets() {
  const root = document.documentElement;
  if (assetsApplied) {
    for (const property of THEME_CSS_VARS) root.style.removeProperty(property);
    assetsApplied = false;
  }
  root.style.removeProperty("--ki-shared-scene");
  root.style.removeProperty("--ki-shared-scene-position");
}

function getPreferences(api) {
  return {
    enabled: true,
    narrative: api.storage.get("narrative", DEFAULTS.narrative) !== false,
    motion: api.storage.get("motion", DEFAULTS.motion) !== false,
    breathing: BREATHING_OPTIONS.some((option) => option.id === api.storage.get("breathing"))
      ? api.storage.get("breathing")
      : DEFAULTS.breathing,
    density: ["immersive", "quiet"].includes(api.storage.get("density"))
      ? api.storage.get("density")
      : DEFAULTS.density,
  };
}

function getActiveBreathing() {
  if (preferences.breathing === "random") return resolvedRandomBreathing;
  return preferences.breathing;
}

function rollRandomBreathing(previous = getActiveBreathing()) {
  const candidates = ANIMATED_BREATHING_IDS.filter((id) => id !== previous);
  const pool = candidates.length ? candidates : ANIMATED_BREATHING_IDS;
  resolvedRandomBreathing = pool[Math.floor(Math.random() * pool.length)] || DEFAULTS.breathing;
  return resolvedRandomBreathing;
}

function savePreferences(next) {
  preferences = { ...preferences, ...next };
  for (const [key, value] of Object.entries(next)) {
    apiRef?.storage.set(key, value);
  }
  applyRootState();
  schedulePatch();
}

function isMissionSurfaceActive() {
  if (document.body?.dataset.kisatsutaiHarness === "true") return true;
  return findComposer() instanceof HTMLElement;
}

function isSettingsSurfaceActive() {
  const root = document.documentElement;
  return root.dataset.codexppSettingsSurface === "true"
    || window.__codexppSettingsSurfaceVisible === true;
}

function isOwnSettingsPageButton(button) {
  if (!(button instanceof HTMLElement)) return false;
  const tweakId = apiRef?.manifest?.id || "dev.local.demon-slayer-codex-theme";
  return String(button.dataset.codexpp || "").includes(`nav-page-${tweakId}:`);
}

function syncSettingsPageShortcutVisibility() {
  const groups = document.querySelectorAll('[data-codexpp="pages-group"]');
  for (const group of groups) {
    if (!(group instanceof HTMLElement)) continue;
    const pageButtons = Array.from(group.querySelectorAll('[data-codexpp^="nav-page-"]'));
    for (const button of pageButtons) {
      if (isOwnSettingsPageButton(button) && !button.hidden) button.hidden = true;
    }
    const onlyOwnPageButtons = pageButtons.length > 0 && pageButtons.every(isOwnSettingsPageButton);
    if (group.hidden !== onlyOwnPageButtons) group.hidden = onlyOwnPageButtons;
  }
}

function restoreSettingsPageShortcutVisibility() {
  for (const group of document.querySelectorAll('[data-codexpp="pages-group"]')) {
    if (!(group instanceof HTMLElement)) continue;
    group.hidden = false;
    for (const button of group.querySelectorAll('[data-codexpp^="nav-page-"]')) {
      if (isOwnSettingsPageButton(button)) button.hidden = false;
    }
  }
}

function removeInjectedThemeDecorations() {
  for (const node of [...injectedNodes]) {
    if (!node || node === styleElement) continue;
    node.remove?.();
    injectedNodes.delete(node);
  }
  missionStrip = null;
  ravenStatus = null;
}

function applySettingsSurfaceState() {
  const root = document.documentElement;
  root.removeAttribute(ROOT_SURFACE_ATTR);
  root.removeAttribute(ROOT_THEME_ATTR);
  root.removeAttribute(ROOT_BREATHING_MODE_ATTR);
  root.removeAttribute(ROOT_MOTION_ATTR);
  root.removeAttribute(ROOT_DENSITY_ATTR);
  root.removeAttribute(ROOT_STATE_ATTR);
  root.removeAttribute(ROOT_DIFFICULTY_ATTR);
  restoreNarrativePatches();
  removeInjectedThemeDecorations();
  clearMarks();
  clearCharacterAssets();
  syncSettingsPageShortcutVisibility();
}

function applyNativeSurfaceState() {
  const root = document.documentElement;
  root.removeAttribute(ROOT_SURFACE_ATTR);
  root.removeAttribute(ROOT_THEME_ATTR);
  root.removeAttribute(ROOT_BREATHING_MODE_ATTR);
  root.removeAttribute(ROOT_MOTION_ATTR);
  root.removeAttribute(ROOT_DENSITY_ATTR);
  root.removeAttribute(ROOT_STATE_ATTR);
  root.removeAttribute(ROOT_DIFFICULTY_ATTR);
  restoreNarrativePatches();
  removeInjectedThemeDecorations();
  clearMarks();
  clearCharacterAssets();
}

function applyMissionSurfaceState() {
  const root = document.documentElement;
  setAttributeIfChanged(root, ROOT_SURFACE_ATTR, "mission");
  setAttributeIfChanged(root, ROOT_THEME_ATTR, getActiveBreathing());
  setAttributeIfChanged(root, ROOT_BREATHING_MODE_ATTR, preferences.breathing);
  setAttributeIfChanged(root, ROOT_MOTION_ATTR, preferences.motion ? "on" : "off");
  setAttributeIfChanged(root, ROOT_DENSITY_ATTR, preferences.density);
  applyCharacterAssets();
}

function applyRootState() {
  const root = document.documentElement;
  if (!preferences.enabled) {
    root.removeAttribute(ROOT_SURFACE_ATTR);
    root.removeAttribute(ROOT_THEME_ATTR);
    root.removeAttribute(ROOT_BREATHING_MODE_ATTR);
    root.removeAttribute(ROOT_MOTION_ATTR);
    root.removeAttribute(ROOT_DENSITY_ATTR);
    root.removeAttribute(ROOT_STATE_ATTR);
    root.removeAttribute(ROOT_DIFFICULTY_ATTR);
    clearCharacterAssets();
    restoreNarrativePatches();
    removeMissionStrip();
    removeRavenStatus();
    clearMarks();
    return;
  }
  if (isSettingsSurfaceActive()) {
    applySettingsSurfaceState();
    return;
  }
  if (isMissionSurfaceActive()) applyMissionSurfaceState();
  else applyNativeSurfaceState();
}

function ensureStyle() {
  styleElement = document.getElementById(STYLE_ID);
  if (styleElement) {
    injectedNodes.add(styleElement);
    return;
  }
  styleElement = document.createElement("style");
  styleElement.id = STYLE_ID;
  styleElement.dataset.kisatsutaiInjected = "true";
  styleElement.textContent = CSS_TEXT;
  document.head.appendChild(styleElement);
  injectedNodes.add(styleElement);
}

function schedulePatch() {
  if (scheduledFrame || !preferences.enabled) return;
  scheduledFrame = requestAnimationFrame(() => {
    scheduledFrame = 0;
    const activeObserver = observer;
    activeObserver?.disconnect();
    try {
      pruneDetachedRuntimeReferences();
      patchDom();
    } catch (error) {
      apiRef?.log.warn("theme patch skipped", String(error));
    } finally {
      if (activeObserver && observer === activeObserver) {
        activeObserver.takeRecords();
        activeObserver.observe(document.documentElement, OBSERVER_OPTIONS);
      }
    }
  });
}

function pruneDetachedRuntimeReferences() {
  for (const [button, binding] of sendActionHandlers) {
    if (button?.isConnected) continue;
    button?.removeEventListener?.("click", binding.handler);
    if (button instanceof HTMLElement) {
      if (binding.originalTitle === null) button.removeAttribute("title");
      else button.setAttribute("title", binding.originalTitle);
      const control = button.querySelector(".kisatsutai-nichirin-control");
      control?.remove();
      injectedNodes.delete(control);
      clearMarkedElement(button);
      markedElements.delete(button);
    }
    sendActionHandlers.delete(button);
  }
  for (const [editor, handler] of composerKeyHandlers) {
    if (editor?.isConnected) continue;
    editor?.removeEventListener?.("keydown", handler, true);
    composerKeyHandlers.delete(editor);
  }
  for (const [button, handler] of breathingControlHandlers) {
    if (button?.isConnected) continue;
    button?.removeEventListener?.("click", handler);
    breathingControlHandlers.delete(button);
  }
  for (const node of injectedNodes) {
    if (node?.isConnected) continue;
    node?.remove?.();
    injectedNodes.delete(node);
  }
  for (const element of markedElements) {
    if (element?.isConnected) continue;
    clearMarkedElement(element);
    markedElements.delete(element);
  }
  textPatches = textPatches.filter((patch) => patch.node?.isConnected);
  attributePatches = attributePatches.filter((patch) => patch.element?.isConnected);
}

function patchDom() {
  if (!preferences.enabled) return;
  syncSettingsPageShortcutVisibility();
  if (isSettingsSurfaceActive()) {
    applySettingsSurfaceState();
    return;
  }
  if (!isMissionSurfaceActive()) {
    applyNativeSurfaceState();
    return;
  }
  applyMissionSurfaceState();
  const composer = decorateComposer();
  decorateMissionSurface(composer);
  decorateSidebarProjects();
  decorateSidebarTasks();
  decorateActions();
  if (preferences.narrative) {
    patchNarrativeCopy();
  } else {
    restoreNarrativePatches();
  }
  updateMissionState();
}

function setAttributePatch(element, name, replacement) {
  if (!(element instanceof Element)) return;
  const current = element.getAttribute(name);
  if (current === replacement) return;
  attributePatches.push({
    element,
    name,
    original: current,
    replacement,
  });
  element.setAttribute(name, replacement);
}

function setTextPatch(node, replacement) {
  if (!(node instanceof Text)) return;
  const current = node.nodeValue || "";
  if (current === replacement) return;
  textPatches.push({ node, original: current, replacement });
  node.nodeValue = replacement;
}

function findMatchingTextNode(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const key = normalizeText(node.nodeValue);
    if (DISPLAY_COPY.has(key)) return { node, replacement: DISPLAY_COPY.get(key) };
    node = walker.nextNode();
  }
  return null;
}

function patchNarrativeCopy(scope = document) {
  const controls = scope.querySelectorAll(
    "button, a, [role='tab'], [role='menuitem'], [role='option']",
  );
  let inspected = 0;
  for (const control of controls) {
    if (inspected++ > 500) break;
    if (control.closest(
      ".kisatsutai-settings, #" + STRIP_ID
        + ", [role='dialog'], [role='alertdialog'], [aria-modal='true'], "
        + "[data-radix-dialog-content], [data-testid*='image-viewer' i], "
        + "[data-testid*='image-preview' i], [data-testid*='lightbox' i], "
        + "[data-testid*='media-viewer' i]",
    )) continue;
    if (control.dataset.kisatsutaiCopy === "true") continue;
    const match = findMatchingTextNode(control);
    if (!match) continue;
    setTextPatch(match.node, match.replacement);
    control.dataset.kisatsutaiCopy = "true";
    markedElements.add(control);
  }
}

function restoreNarrativePatches() {
  for (const patch of textPatches.splice(0)) {
    if (patch.node.isConnected && patch.node.nodeValue === patch.replacement) {
      patch.node.nodeValue = patch.original;
    }
  }
  for (const patch of attributePatches.splice(0)) {
    if (!patch.element.isConnected) continue;
    if (patch.element.getAttribute(patch.name) !== patch.replacement) continue;
    if (patch.original === null) {
      patch.element.removeAttribute(patch.name);
    } else {
      patch.element.setAttribute(patch.name, patch.original);
    }
  }
  for (const element of document.querySelectorAll(
    "[data-kisatsutai-copy], [data-kisatsutai-placeholder], [data-kisatsutai-location]",
  )) {
    delete element.dataset.kisatsutaiCopy;
    delete element.dataset.kisatsutaiPlaceholder;
    delete element.dataset.kisatsutaiLocation;
  }
  for (const icon of document.querySelectorAll(".kisatsutai-location-icon")) {
    icon.remove();
    injectedNodes.delete(icon);
  }
}

function findComposer() {
  const editorSelector = [
    "textarea",
    ".ProseMirror[contenteditable='true']",
    "[contenteditable='true'][role='textbox']",
    "[contenteditable='true'][data-lexical-editor='true']",
    "[contenteditable='true']",
  ].join(", ");
  const resolveComposerRoot = (candidate) => {
    if (!(candidate instanceof HTMLElement)) return null;
    const root = candidate.matches(editorSelector)
      ? candidate.closest("form, .composer-surface-chrome, [data-testid='composer']")
      : candidate.closest(".composer-surface-chrome, form") || candidate;
    if (!(root instanceof HTMLElement)) return null;
    const editor = root.matches(editorSelector) ? root : root.querySelector(editorSelector);
    const hasAction = root.querySelector("button");
    return editor instanceof HTMLElement
      && hasAction instanceof HTMLElement
      && root.getBoundingClientRect().width > 280
      ? root
      : null;
  };

  for (const candidate of document.querySelectorAll(
    "[data-testid='composer'], .composer-surface-chrome",
  )) {
    const root = resolveComposerRoot(candidate);
    if (root) return root;
  }

  for (const candidate of document.querySelectorAll("[data-testid*='composer' i]")) {
    const root = resolveComposerRoot(candidate);
    if (root) return root;
  }

  const editor = document.querySelector(editorSelector);
  if (!(editor instanceof HTMLElement)) return null;
  const explicit = editor.closest("form, .composer-surface-chrome");
  if (explicit instanceof HTMLElement && explicit.getBoundingClientRect().width > 280) {
    return explicit;
  }
  let node = editor;
  for (let depth = 0; depth < 7 && node; depth += 1, node = node.parentElement) {
    const buttons = node.querySelectorAll("button");
    if (buttons.length > 0 && node.getBoundingClientRect().width > 280) return node;
  }
  return editor.parentElement;
}

function decorateComposerShells(composer) {
  if (!(composer instanceof HTMLElement)) return;
  const composerRect = composer.getBoundingClientRect();
  if (composerRect.width <= 0 || composerRect.height <= 0) return;

  const threadFooter = composer.closest("[data-thread-scroll-footer='true']");
  if (threadFooter instanceof HTMLElement) {
    threadFooter.dataset.kisatsutaiComposerFooter = "true";
    markedElements.add(threadFooter);
    const footerContent = Array.from(threadFooter.children).find((layer) => (
      layer instanceof HTMLElement
      && (
        layer.matches("[data-pip-obstacle='thread-footer']")
        || layer.contains(composer)
      )
    ));
    for (const layer of threadFooter.children) {
      if (!(layer instanceof HTMLElement)) continue;
      if (layer === footerContent || layer.contains(composer)) continue;
      layer.dataset.kisatsutaiComposerFooterBackdrop = "true";
      markedElements.add(layer);
    }

    if (footerContent instanceof HTMLElement) {
      const composerWidth = composerRect.width;
      const steerControls = Array.from(footerContent.querySelectorAll("button")).filter((button) => {
        const label = normalizeText([
          button.textContent,
          button.getAttribute("aria-label"),
          button.getAttribute("title"),
        ].filter(Boolean).join(" "));
        return /(^|\s)(steer|引导|插入|调整队列)(\s|$)/i.test(label);
      });
      for (const control of steerControls) {
        let panel = control.parentElement;
        while (panel && panel !== footerContent) {
          if (panel.contains(composer)) break;
          const rect = panel.getBoundingClientRect();
          const style = getComputedStyle(panel);
          const hasVisibleBorder = [
            style.borderTopWidth,
            style.borderRightWidth,
            style.borderLeftWidth,
          ].some((width) => parseFloat(width) > 0);
          const hasVisibleBackground = ![
            "transparent",
            "rgba(0, 0, 0, 0)",
          ].includes(style.backgroundColor);
          const isComposerWidth = rect.width >= composerWidth * 0.72
            && rect.width <= composerWidth + 48;
          const isQueueHeight = rect.height >= 24
            && rect.height <= Math.max(360, window.innerHeight * 0.35);
          const containsQueueActions = steerControls.every((candidate) => panel.contains(candidate));
          if (
            containsQueueActions
            && isComposerWidth
            && isQueueHeight
            && (hasVisibleBorder || hasVisibleBackground)
          ) {
            panel.dataset.kisatsutaiQueuedPanel = "true";
            markedElements.add(panel);
            break;
          }
          panel = panel.parentElement;
        }
      }
    }
  }

  let shell = composer.parentElement;
  for (let depth = 0; depth < 4 && shell; depth += 1) {
    if (shell.matches([
      "html",
      "body",
      "main",
      "[role='main']",
      "[data-app-shell-main-content-layout]",
      "aside",
      "nav",
      "[role='dialog']",
    ].join(", "))) break;

    const shellRect = shell.getBoundingClientRect();
    const isLocalWidth = shellRect.width >= composerRect.width - 4
      && shellRect.width <= composerRect.width + 320;
    const isLocalHeight = shellRect.height >= composerRect.height - 4
      && shellRect.height <= composerRect.height + 240;
    if (!isLocalWidth || !isLocalHeight) break;

    shell.dataset.kisatsutaiComposerShell = "true";
    markedElements.add(shell);
    shell = shell.parentElement;
  }
}

function decorateMissionSurface(composer = findComposer()) {
  const surface = document.querySelector("[data-app-shell-main-content-layout]")
    || composer?.closest(
      "main, [role='main'], [data-testid*='thread' i], [data-testid*='conversation' i]",
    )
    || document.querySelector("main, [role='main']");
  if (!(surface instanceof HTMLElement)) return null;
  if (surface.dataset.kisatsutaiMissionSurface !== "true") {
    surface.dataset.kisatsutaiMissionSurface = "true";
    markedElements.add(surface);
  }

  const frame = surface.parentElement?.closest("main, [role='main']");
  if (frame instanceof HTMLElement && frame !== surface) {
    frame.dataset.kisatsutaiMissionFrame = "true";
    markedElements.add(frame);
  }
  return surface;
}

function removeActiveSlashEffect() {
  if (activeSlashTimer) {
    window.clearTimeout(activeSlashTimer);
    slashTimers.delete(activeSlashTimer);
    activeSlashTimer = 0;
  }
  if (activeSlashEffect) {
    activeSlashEffect.remove();
    injectedNodes.delete(activeSlashEffect);
    activeSlashEffect = null;
  }
}

function createNichirinEffect(button, action = "send") {
  if (!preferences.enabled || !preferences.motion || !(button instanceof HTMLElement)) return;
  const now = performance.now();
  if (now - lastSlashEffectAt < SLASH_EFFECT_DEDUPE_MS) return;
  lastSlashEffectAt = now;
  removeActiveSlashEffect();
  const activeBreathing = getActiveBreathing();
  const bounds = button.getBoundingClientRect();
  const effect = document.createElement("span");
  effect.className = "kisatsutai-slash-effect";
  effect.dataset.breath = activeBreathing;
  effect.dataset.action = action;
  effect.dataset.kisatsutaiInjected = "true";
  effect.setAttribute("aria-hidden", "true");
  effect.style.setProperty("--ki-slash-x", `${bounds.left + bounds.width / 2}px`);
  effect.style.setProperty("--ki-slash-y", `${bounds.top + bounds.height / 2}px`);
  effect.innerHTML = [
    '<span class="kisatsutai-breath-still kisatsutai-breath-still--flame" aria-hidden="true"></span>',
    '<span class="kisatsutai-breath-still kisatsutai-breath-still--insect" aria-hidden="true"></span>',
    '<svg viewBox="0 0 320 210" fill="none">',
    '<g class="kisatsutai-breath-scene kisatsutai-breath-scene--water">',
    '<path class="kisatsutai-water-ribbon" d="M18 181C66 137 72 72 131 57c65-17 93 48 171-20"/>',
    '<path class="kisatsutai-water-crest" d="M20 188c51-38 71-82 119-94 52-13 86 29 157-43"/>',
    '<path class="kisatsutai-water-wave" d="M73 137c16-22 34-23 49-7m46-43c16-19 34-19 47-3m31-17c11-15 23-17 34-12"/>',
    '<path class="kisatsutai-water-curl" d="M67 149c8-23 35-31 51-14 10 11 3 27-13 29-13 1-22-8-17-18 3 8 12 11 19 5"/>',
    '<path class="kisatsutai-water-curl" d="M159 94c7-19 29-25 43-11 9 9 4 22-9 24-11 2-18-6-14-14 3 6 10 8 15 4"/>',
    '<circle class="kisatsutai-water-foam" cx="68" cy="150" r="3.5"/>',
    '<circle class="kisatsutai-water-foam" cx="147" cy="93" r="2.7"/>',
    '<circle class="kisatsutai-water-foam" cx="232" cy="70" r="2.2"/>',
    "</g>",
    '<g class="kisatsutai-breath-scene kisatsutai-breath-scene--flame">',
    '<path class="kisatsutai-flame-body" d="M24 184C81 125 152 70 298 31"/>',
    '<path class="kisatsutai-flame-core" d="M35 188C102 124 174 72 298 37"/>',
    '<path class="kisatsutai-flame-plume" d="M34 184c31-30 36-66 83-93-9 25 2 36 25 39-31 5-48 20-58 42-5-17-20-19-38-3 9-20 6-34-12-43Z"/>',
    '<path class="kisatsutai-flame-plume" d="M118 120c29-43 58-69 101-86-18 22-13 40 12 51-35 8-56 26-72 53-1-21-14-28-39-17Z"/>',
    '<path class="kisatsutai-flame-plume" d="M202 77c29-26 56-40 88-44-19 16-21 31-4 44-30 2-51 13-70 34 2-17-3-27-14-34Z"/>',
    '<path class="kisatsutai-flame-tongue" d="M73 146c24-18 17-39 39-52-5 22 17 24 12 44m39-56c26-15 22-40 47-51-8 22 18 23 11 43m21-24c18-10 18-25 34-31"/>',
    '<circle class="kisatsutai-flame-ember" cx="102" cy="119" r="3"/>',
    '<circle class="kisatsutai-flame-ember" cx="190" cy="70" r="2.5"/>',
    '<circle class="kisatsutai-flame-ember" cx="252" cy="43" r="2"/>',
    "</g>",
    '<g class="kisatsutai-breath-scene kisatsutai-breath-scene--thunder">',
    '<path class="kisatsutai-thunder-bolt" d="m32 183 78-67-18-9 86-44-20 36 121-65-84 91 20 1-104 64 13-33Z"/>',
    '<path class="kisatsutai-thunder-core" d="m43 178 68-56-9-6 73-37-9 18 83-44"/>',
    "</g>",
    '<g class="kisatsutai-breath-scene kisatsutai-breath-scene--insect">',
    '<path class="kisatsutai-insect-thrust" d="M27 187C105 151 194 91 297 26"/>',
    '<path class="kisatsutai-insect-core" d="M43 181C126 137 207 80 297 26"/>',
    '<path class="kisatsutai-insect-wing kisatsutai-insect-wing--left" d="M168 103C139 48 83 40 85 82c1 28 36 39 75 31-34 26-47 57-24 69 27 14 44-26 38-67Z"/>',
    '<path class="kisatsutai-insect-wing kisatsutai-insect-wing--right" d="M177 103c29-55 85-63 83-21-1 28-36 39-75 31 34 26 47 57 24 69-27 14-44-26-38-67Z"/>',
    '<path class="kisatsutai-insect-body" d="M172 80v76m0-69c-9-17-19-22-29-22m29 22c9-17 19-22 29-22"/>',
    '<path class="kisatsutai-insect-swarm" d="M86 139c-12-18-27-9-18 6 6 8 12 5 18-6Zm4 0c12-18 28-9 18 6-6 8-12 5-18-6Zm135-88c-10-15-23-8-15 5 5 7 10 4 15-5Zm4 0c10-15 23-8 15 5-5 7-10 4-15-5Z"/>',
    '<circle class="kisatsutai-insect-poison" cx="74" cy="163" r="3.2"/>',
    '<circle class="kisatsutai-insect-poison" cx="111" cy="133" r="2.5"/>',
    '<circle class="kisatsutai-insect-poison" cx="205" cy="69" r="3"/>',
    '<circle class="kisatsutai-insect-poison" cx="251" cy="47" r="2.2"/>',
    "</g>",
    '<g class="kisatsutai-sheath-scene">',
    '<path class="kisatsutai-sheath-body" d="M72 181C128 145 190 98 260 38"/>',
    '<path class="kisatsutai-sheath-edge" d="M77 177C132 141 192 95 258 41"/>',
    '<path class="kisatsutai-sheath-blade" d="M96 166C148 131 202 90 259 40"/>',
    '<path class="kisatsutai-sheath-guard" d="m82 151 29 31m-30-4 29-29"/>',
    '<circle class="kisatsutai-sheath-lock" cx="103" cy="164" r="5"/>',
    "</g>",
    "</svg>",
  ].join("");
  document.body.appendChild(effect);
  injectedNodes.add(effect);
  activeSlashEffect = effect;
  const timer = window.setTimeout(() => {
    effect.remove();
    injectedNodes.delete(effect);
    slashTimers.delete(timer);
    if (activeSlashEffect === effect) activeSlashEffect = null;
    if (activeSlashTimer === timer) activeSlashTimer = 0;
  }, 900);
  activeSlashTimer = timer;
  slashTimers.add(timer);
}

function getSendButtonState(button) {
  const label = [
    button.getAttribute("aria-label"),
    button.textContent,
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (/(^|\s)(stop|cancel|interrupt|停止|取消|中止)(\s|$)/i.test(label)) return "stop";
  if (button.getAttribute("type") === "submit") return "send";
  return "send";
}

function isComposerPrimaryAction(button) {
  if (!(button instanceof HTMLButtonElement)) return false;
  const label = [
    button.getAttribute("aria-label"),
    button.textContent,
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (/(^|\s)(send|submit|stop|cancel|interrupt|发送|提交|停止|取消|中止)(\s|$)/i.test(label)) {
    return true;
  }
  if (button.getAttribute("type") === "submit") return true;
  const testId = button.getAttribute("data-testid") || "";
  const className = typeof button.className === "string" ? button.className : "";
  return /(send|submit|composer-action)/i.test(testId)
    || (
      /size-token-button-composer/.test(className)
      && !/(attach|upload|voice|dictat|microphone|附件|上传|语音|麦克风)/i.test(label)
    );
}

function composerHasSendableContent(composer, editor) {
  const content = editor instanceof HTMLTextAreaElement || editor instanceof HTMLInputElement
    ? editor.value
    : editor.textContent;
  if (String(content || "").trim()) return true;
  return !!composer.querySelector(
    "[data-testid*='attachment' i], [data-testid*='upload' i], "
      + "[aria-label*='remove attachment' i], [aria-label*='移除附件'], "
      + "[data-attachment-id], [data-file-id]",
  );
}

function ensureSendButton(button) {
  if (!(button instanceof HTMLElement)) return;
  if (!button.querySelector(".kisatsutai-nichirin-control")) {
    button.insertAdjacentHTML("beforeend", NICHIRIN_CONTROL);
    const control = button.querySelector(".kisatsutai-nichirin-control");
    if (control) injectedNodes.add(control);
  }
  if (!sendActionHandlers.has(button)) {
    const originalTitle = button.getAttribute("title");
    const handler = () => {
      if (button.disabled || button.getAttribute("aria-disabled") === "true") return;
      const action = getSendButtonState(button);
      setDatasetIfChanged(button, "kisatsutaiSendState", action);
      createNichirinEffect(button, action);
    };
    button.addEventListener("click", handler);
    sendActionHandlers.set(button, { handler, originalTitle });
  }
  const state = getSendButtonState(button);
  setDatasetIfChanged(button, "kisatsutaiAction", "send");
  setDatasetIfChanged(button, "kisatsutaiSendState", state);
}

function ensureComposerBreathingDock(composer, sendButton) {
  if (!(composer instanceof HTMLElement) || !(sendButton instanceof HTMLElement)) return null;
  let dock = composer.querySelector(".kisatsutai-composer-breathing-dock");
  if (!(dock instanceof HTMLElement)) {
    const template = document.createElement("template");
    template.innerHTML = COMPOSER_BREATHING_DOCK;
    dock = template.content.firstElementChild;
    if (!(dock instanceof HTMLElement)) return null;
    injectedNodes.add(dock);
  }
  if (dock.nextElementSibling !== sendButton) sendButton.before(dock);
  bindBreathingControls(dock);
  return dock;
}

function ensureComposerKeyboardEffect(composer) {
  const editor = composer.querySelector(
    ".ProseMirror[contenteditable='true'], textarea, [contenteditable='true'][role='textbox'], [contenteditable='true']",
  );
  if (!(editor instanceof HTMLElement) || composerKeyHandlers.has(editor)) return;
  const handler = (event) => {
    if (
      event.key !== "Enter"
      || event.shiftKey
      || event.altKey
      || event.ctrlKey
      || event.metaKey
      || event.isComposing
      || event.keyCode === 229
      || event.repeat
    ) return;
    const button = composer.querySelector("[data-kisatsutai-action='send']");
    if (
      !(button instanceof HTMLButtonElement)
      || button.disabled
      || button.getAttribute("aria-disabled") === "true"
      || !composerHasSendableContent(composer, editor)
    ) return;
    createNichirinEffect(button, "send");
  };
  editor.addEventListener("keydown", handler, true);
  composerKeyHandlers.set(editor, handler);
}

function removeLegacyComposerKicker(composer) {
  if (!(composer instanceof HTMLElement)) return;
  for (const node of composer.querySelectorAll(".kisatsutai-composer-kicker")) {
    node.remove();
    injectedNodes.delete(node);
  }
}

function restoreNativeComposerAction(composer, button) {
  if (!(composer instanceof HTMLElement) || !(button instanceof HTMLElement)) return;
  const binding = sendActionHandlers.get(button);
  if (binding) {
    button.removeEventListener("click", binding.handler);
    if (binding.originalTitle === null) button.removeAttribute("title");
    else button.setAttribute("title", binding.originalTitle);
    sendActionHandlers.delete(button);
  }
  const control = button.querySelector(".kisatsutai-nichirin-control");
  if (control) {
    control.remove();
    injectedNodes.delete(control);
  }
  delete button.dataset.kisatsutaiAction;
  delete button.dataset.kisatsutaiSendState;

  const dock = composer.querySelector(".kisatsutai-composer-breathing-dock");
  if (dock instanceof HTMLElement) {
    for (const option of dock.querySelectorAll("[data-kisatsutai-breath]")) {
      const handler = breathingControlHandlers.get(option);
      if (handler) option.removeEventListener("click", handler);
      breathingControlHandlers.delete(option);
    }
    dock.remove();
    injectedNodes.delete(dock);
  }

  const editor = composer.querySelector(
    ".ProseMirror[contenteditable='true'], textarea, [contenteditable='true'][role='textbox'], [contenteditable='true']",
  );
  const keyHandler = composerKeyHandlers.get(editor);
  if (editor instanceof HTMLElement && keyHandler) {
    editor.removeEventListener("keydown", keyHandler, true);
    composerKeyHandlers.delete(editor);
  }
}

function decorateComposer() {
  const composer = findComposer();
  if (!composer) return null;
  if (composer.dataset.kisatsutaiComposer !== "true") {
    composer.dataset.kisatsutaiComposer = "true";
    markedElements.add(composer);
  }
  decorateComposerShells(composer);

  removeLegacyComposerKicker(composer);

  const buttons = Array.from(composer.querySelectorAll("button"));
  const sendButton = buttons.find(isComposerPrimaryAction);
  if (sendButton) {
    if (preferences.motion) {
      ensureSendButton(sendButton);
      ensureComposerBreathingDock(composer, sendButton);
      ensureComposerKeyboardEffect(composer);
    } else {
      restoreNativeComposerAction(composer, sendButton);
    }
    markedElements.add(sendButton);
  }
  return composer;
}

function decorateSidebarTasks() {
  const tasks = document.querySelectorAll(
    "[data-app-action-sidebar-thread-row], "
      + "aside a[href], nav a[href], [data-testid*='sidebar'] a[href]",
  );
  for (const task of tasks) {
    if (!(task instanceof HTMLElement)) continue;
    const isNativeThreadRow = task.hasAttribute("data-app-action-sidebar-thread-row");
    const href = task.getAttribute("href") || "";
    if (!isNativeThreadRow && !/(\/local\/|\/thread\/|\/conversation\/|\/tasks?\/)/i.test(href)) {
      continue;
    }
    if (normalizeText(task.getAttribute("data-app-action-sidebar-thread-title") || task.textContent).length < 2) {
      continue;
    }
    const sidebar = task.closest("aside");
    if (sidebar instanceof HTMLElement) {
      sidebar.dataset.kisatsutaiSidebar = "true";
      markedElements.add(sidebar);
    }
    if (task.dataset.kisatsutaiTask !== "true") {
      task.dataset.kisatsutaiTask = "true";
      const rank = document.createElement("span");
      rank.className = "kisatsutai-task-rank";
      rank.dataset.kisatsutaiInjected = "true";
      rank.setAttribute("aria-hidden", "true");
      task.prepend(rank);
      injectedNodes.add(rank);
      markedElements.add(task);
    }
    syncTaskSquad(task);
  }
}

function decorateSidebarProjects() {
  const projectRows = document.querySelectorAll(
    "[data-app-action-sidebar-project-row], "
      + "aside [role='button'][class*='group/folder-row']",
  );
  for (const projectRow of projectRows) {
    if (!(projectRow instanceof HTMLElement)) continue;
    if (projectRow.hasAttribute("data-app-action-sidebar-thread-row")) continue;
    const sidebar = projectRow.closest("aside");
    if (!(sidebar instanceof HTMLElement)) continue;

    sidebar.dataset.kisatsutaiSidebar = "true";
    projectRow.dataset.kisatsutaiProjectRow = "true";
    setDatasetIfChanged(projectRow, "kisatsutaiProjectState", (
      projectRow.getAttribute("aria-disabled") === "true"
        ? "unavailable"
        : "ready"
    ));
    markedElements.add(sidebar);
    markedElements.add(projectRow);
  }
}

function classifyNewTaskControl(control) {
  const projectRow = control.closest("[data-app-action-sidebar-project-row]");
  if (!(projectRow instanceof HTMLElement)) return;
  control.dataset.kisatsutaiNewTaskVariant = "project";
  control.dataset.kisatsutaiProjectAction = "true";
  markedElements.add(control);
  if (!control.getAttribute("title")) {
    setAttributePatch(control, "title", "接取讨伐");
  }
}

function decorateActions() {
  const controls = document.querySelectorAll("button, [role='button']");
  for (const control of controls) {
    if (!(control instanceof HTMLElement)) continue;
    if (control.dataset.kisatsutaiAction) {
      if (control.dataset.kisatsutaiAction === "new-task") classifyNewTaskControl(control);
      continue;
    }
    const label = [
      control.getAttribute("aria-label"),
      control.getAttribute("title"),
      control.textContent,
    ].filter(Boolean).join(" ").trim();
    if (!label || label.length > 80) continue;
    const rule = ACTION_RULES.find((candidate) => candidate.pattern.test(label));
    if (!rule) continue;
    control.dataset.kisatsutaiAction = rule.kind;
    if (rule.kind === "new-task") {
      classifyNewTaskControl(control);
    }
    if (!control.getAttribute("title")) setAttributePatch(control, "title", rule.title);
    markedElements.add(control);
  }
}

function getSummaryPanel() {
  const panel = document.querySelector('[data-pip-obstacle="thread-summary-panel"]');
  return panel instanceof HTMLElement ? panel : null;
}

function getSummarySectionKey(section) {
  if (!(section instanceof HTMLElement)) return "";
  try {
    let fiber = apiRef?.react?.getFiber?.(section) || null;
    for (let depth = 0; fiber && depth < 8; depth += 1, fiber = fiber.return) {
      const key = fiber.memoizedProps?.sectionKey;
      if (typeof key === "string") return key;
    }
  } catch {
    /* use the accessible heading fallback below */
  }

  const heading = normalizeText(
    section.querySelector("header button[aria-expanded], button[aria-expanded]")?.textContent,
  );
  if (/(outputs?|artifacts?|任务案卷|产物|输出)/i.test(heading)) return "artifacts";
  if (/(environment|任务地点|环境)/i.test(heading)) return "environment";
  if (/(sources?|渡鸦情报|鎹鸦情报|来源|情报)/i.test(heading)) return "tool-sources";
  if (/(subagents?|出战小队|代理|队员)/i.test(heading)) return "background-subagents";
  return "";
}

function getSummarySections(panel = getSummaryPanel()) {
  if (!panel) return [];
  return Array.from(panel.querySelectorAll("section"))
    .filter((section) => section instanceof HTMLElement)
    .map((section) => ({ section, key: getSummarySectionKey(section) }))
    .filter((entry) => entry.key);
}

function findBackgroundAgents(section) {
  if (!(section instanceof HTMLElement)) return { found: false, agents: [] };
  let fiber = null;
  try {
    fiber = apiRef?.react?.getFiber?.(section) || null;
  } catch {
    return { found: false, agents: [] };
  }
  const roots = [];
  for (let depth = 0, cursor = fiber; cursor && depth < 5; depth += 1, cursor = cursor.return) {
    roots.push(cursor);
  }
  const seen = new Set();
  const queue = [...roots];
  let best = null;
  while (queue.length && seen.size < 600) {
    const current = queue.shift();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    const agents = current.memoizedProps?.backgroundAgents;
    if (Array.isArray(agents) && (!best || agents.length > best.length)) best = agents;
    if (current.child) queue.push(current.child);
    if (current.sibling) queue.push(current.sibling);
  }
  return best ? { found: true, agents: best } : { found: false, agents: [] };
}

function getSummarySquadCount() {
  const entry = getSummarySections().find(({ key }) => key === "background-subagents");
  if (!entry) return 0;
  const result = findBackgroundAgents(entry.section);
  if (!result.found) return 0;
  const identities = new Set();
  result.agents.forEach((agent, index) => {
    identities.add(
      agent?.conversationId
        || agent?.threadId
        || agent?.id
        || agent?.name
        || `agent:${index}`,
    );
  });
  return clampSquadCount(identities.size + 1);
}

function patchSummaryHeading(section, key) {
  if (!preferences.narrative) return;
  const configuration = {
    artifacts: {
      title: "任务案卷",
      mark: "卷",
      aliases: /^(outputs?|artifacts?|任务案卷|输出|产物)$/i,
    },
    environment: {
      title: "任务案卷",
      mark: "卷",
      aliases: /^(environment|任务案卷|任务地点|环境)$/i,
    },
    "tool-sources": {
      title: "渡鸦情报",
      mark: "情",
      aliases: /^(sources?|渡鸦情报|鎹鸦情报|来源|情报)$/i,
    },
    "background-subagents": {
      title: "出战小队",
      mark: "队",
      aliases: /^(subagents?|出战小队|代理|队员)$/i,
    },
  }[key];
  if (!configuration) return;
  const button = section.querySelector(":scope > header button[aria-expanded], header button[aria-expanded]");
  if (!(button instanceof HTMLElement)) return;

  const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const current = String(node.nodeValue || "").trim();
    if (configuration.aliases.test(current)) {
      setTextPatch(node, configuration.title);
      break;
    }
    node = walker.nextNode();
  }

  if (!button.querySelector(".kisatsutai-summary-mark")) {
    const mark = document.createElement("span");
    mark.className = "kisatsutai-summary-mark";
    mark.dataset.kisatsutaiInjected = "true";
    mark.textContent = configuration.mark;
    mark.setAttribute("aria-hidden", "true");
    button.prepend(mark);
    injectedNodes.add(mark);
  }
}

function getEnvironmentBranchControl(section) {
  if (!(section instanceof HTMLElement)) return null;
  const direct = section.querySelector(
    'button[title="Switch branch"], button[title*="branch" i], button[title*="分支"]',
  );
  if (direct instanceof HTMLButtonElement) return direct;
  for (const button of section.querySelectorAll("button")) {
    if (!(button instanceof HTMLButtonElement)) continue;
    try {
      let fiber = apiRef?.react?.getFiber?.(button) || null;
      for (let depth = 0; fiber && depth < 7; depth += 1, fiber = fiber.return) {
        const props = fiber.memoizedProps || {};
        if (
          "gitRoot" in props
          && "hostConfig" in props
          && "renderControl" in props
          && "localConversationId" in props
        ) return button;
      }
    } catch {
      /* skip this candidate */
    }
  }
  return null;
}

function syncLocationDossier(
  panel,
  hostSection,
  environmentSection,
  locationData,
  missionData,
  squadCount,
  sessionKey,
) {
  if (!panel || !locationData) return;
  const host = hostSection || environmentSection || panel;
  let dossier = panel.querySelector(".kisatsutai-location-dossier");
  if (!dossier) {
    dossier = document.createElement("div");
    dossier.className = "kisatsutai-location-dossier";
    dossier.dataset.kisatsutaiInjected = "true";
    dossier.setAttribute("role", "note");
    dossier.innerHTML = [
      '<span class="kisatsutai-location-dossier-image" aria-hidden="true"></span>',
      '<span class="kisatsutai-location-dossier-copy">',
      '<small class="kisatsutai-location-dossier-type">任务地点 / MISSION AREA</small>',
      '<b class="kisatsutai-location-dossier-name"></b>',
      '<em class="kisatsutai-location-dossier-route"></em>',
      "</span>",
      '<span class="kisatsutai-location-dossier-actions">',
      '<span class="kisatsutai-location-dossier-party"></span>',
      '<button class="kisatsutai-location-switch" type="button">',
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">',
      '<path d="M3.2 5.3h7.9l-1.8-1.8M12.8 10.7H4.9l1.8 1.8"/>',
      '<path d="m11.1 3.5 1.7 1.8-1.7 1.8M4.9 12.5l-1.7-1.8 1.7-1.8"/>',
      "</svg>",
      '<span>换景</span>',
      "</button>",
      "</span>",
      '<span class="kisatsutai-visually-hidden kisatsutai-location-switch-status" role="status" aria-live="polite" aria-atomic="true"></span>',
    ].join("");
    const switchButton = dossier.querySelector(".kisatsutai-location-switch");
    switchButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      const activeState = getActiveSessionContext().state;
      const nextLocation = cycleSessionLocation(activeState);
      if (!nextLocation || !(switchButton instanceof HTMLButtonElement)) return;
      switchButton.dataset.state = "changed";
      const status = dossier.querySelector(".kisatsutai-location-switch-status");
      setTextIfChanged(status, `当前任务背景已切换为${nextLocation.name}`);
      schedulePatch();
      const timer = window.setTimeout(() => {
        switchButton.removeAttribute("data-state");
        slashTimers.delete(timer);
      }, 480);
      slashTimers.add(timer);
    });
    injectedNodes.add(dossier);
  }

  if (dossier.dataset.session && dossier.dataset.session !== sessionKey) {
    dossier.querySelector(".kisatsutai-location-switch")?.removeAttribute("data-state");
    setTextIfChanged(dossier.querySelector(".kisatsutai-location-switch-status"), "");
  }
  setDatasetIfChanged(dossier, "session", sessionKey);

  if (hostSection || environmentSection) {
    const header = host.querySelector(":scope > header") || host.firstElementChild;
    if (header) {
      if (header.nextSibling !== dossier) header.after(dossier);
    } else if (dossier.parentElement !== host) {
      host.prepend(dossier);
    }
  } else if (dossier.parentElement !== host) {
    host.prepend(dossier);
  }

  setDatasetIfChanged(dossier, "location", locationData.id);
  setStylePropertyIfChanged(
    dossier,
    "--ki-dossier-location",
    `var(--ki-location-${locationData.id})`,
  );
  setTextIfChanged(
    dossier.querySelector(".kisatsutai-location-dossier-type"),
    missionData ? `${missionData.name} / MISSION` : "任务地点 / MISSION AREA",
  );
  setTextIfChanged(dossier.querySelector(".kisatsutai-location-dossier-name"), locationData.name);
  const switchButton = dossier.querySelector(".kisatsutai-location-switch");
  if (switchButton instanceof HTMLButtonElement) {
    const label = `更换当前任务背景，当前为${locationData.name}`;
    setAttributeIfChanged(switchButton, "aria-label", label);
    setAttributeIfChanged(switchButton, "title", label);
  }
  setTextIfChanged(
    dossier.querySelector(".kisatsutai-location-dossier-party"),
    `${String(squadCount).padStart(2, "0")} 人编成`,
  );

  const branchControl = getEnvironmentBranchControl(environmentSection);
  let branch = "";
  if (branchControl) {
    const branchParts = [];
    const walker = document.createTreeWalker(branchControl, NodeFilter.SHOW_TEXT);
    let branchNode = walker.nextNode();
    while (branchNode) {
      if (!branchNode.parentElement?.closest("[data-kisatsutai-injected='true']")) {
        branchParts.push(branchNode.nodeValue || "");
      }
      branchNode = walker.nextNode();
    }
    branch = branchParts.join(" ").replace(/\s+/g, " ").trim();
    setDatasetIfChanged(branchControl, "kisatsutaiLocationControl", "true");
    markedElements.add(branchControl);
    if (!branchControl.querySelector(".kisatsutai-summary-location-mark")) {
      const mark = document.createElement("span");
      mark.className = "kisatsutai-summary-location-mark";
      mark.dataset.kisatsutaiInjected = "true";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = "⌖";
      branchControl.prepend(mark);
      injectedNodes.add(mark);
    }
  }
  setTextIfChanged(
    dossier.querySelector(".kisatsutai-location-dossier-route"),
    branch ? `${locationData.region} · ${branch}` : locationData.region,
  );
  setAttributeIfChanged(
    dossier,
    "aria-label",
    `任务地点 ${locationData.name}，${squadCount} 人编成`,
  );
}

function getNativeSummaryAgentTargets(section, card) {
  if (!(section instanceof HTMLElement)) return [];
  const targets = [];
  const seen = new Set();
  const interactiveSelector = [
    "a[href]",
    "button:not([aria-expanded])",
    "[role='button']",
    "[data-thread-id]",
    "[data-conversation-id]",
  ].join(", ");

  const addTarget = (candidate) => {
    if (!(candidate instanceof HTMLElement)) return;
    if (candidate === card || card?.contains(candidate)) return;
    if (candidate.closest("header")) return;
    if (candidate.closest("[data-kisatsutai-injected='true']")) return;
    if (candidate.matches(":disabled") || candidate.getAttribute("aria-disabled") === "true") return;
    if (seen.has(candidate)) return;
    seen.add(candidate);
    targets.push(candidate);
  };

  for (const root of Array.from(section.children)) {
    if (!(root instanceof HTMLElement) || root === card || root.tagName === "HEADER") continue;
    if (root.matches(interactiveSelector)) {
      addTarget(root);
      continue;
    }
    const rows = root.matches("ul, ol")
      ? Array.from(root.children)
      : Array.from(root.querySelectorAll(":scope > li, :scope > [data-thread-id], :scope > [data-conversation-id]"));
    if (rows.length) {
      for (const row of rows) {
        if (!(row instanceof HTMLElement)) continue;
        addTarget(row.matches(interactiveSelector) ? row : row.querySelector(interactiveSelector) || row);
      }
      continue;
    }
    const nested = Array.from(root.querySelectorAll(interactiveSelector))
      .filter((candidate) => candidate instanceof HTMLElement);
    const outermost = nested.filter((candidate) => (
      !nested.some((other) => other !== candidate && other.contains(candidate))
    ));
    for (const candidate of outermost) addTarget(candidate);
  }
  return targets;
}

function activateNativeSummaryAgent(card) {
  if (!(card instanceof HTMLElement)) return;
  const section = card.closest("section");
  const targets = getNativeSummaryAgentTargets(section, card);
  const target = targets[0];
  if (!(target instanceof HTMLElement)) return;
  target.click();
}

function syncSummarySquadInteractions(section, card) {
  if (!(section instanceof HTMLElement) || !(card instanceof HTMLElement)) return;
  const targets = getNativeSummaryAgentTargets(section, card);
  const avatars = Array.from(card.querySelectorAll(".kisatsutai-summary-squad .kisatsutai-agent-avatar"));
  avatars.forEach((avatar) => {
    if (!(avatar instanceof HTMLElement)) return;
    delete avatar.dataset.kisatsutaiNativeAgentIndex;
    delete avatar.dataset.kisatsutaiSummaryAgentAction;
    avatar.setAttribute("aria-hidden", "true");
    avatar.removeAttribute("role");
    avatar.removeAttribute("tabindex");
  });

  setDatasetIfChanged(card, "kisatsutaiHasNativeAgents", targets.length ? "true" : "false");
  if (targets.length) {
    setAttributeIfChanged(card, "role", "button");
    setAttributeIfChanged(card, "tabindex", "0");
    setAttributeIfChanged(card, "aria-label", "打开出战小队 Agent");
    setAttributeIfChanged(card, "title", "查看出战小队 Agent");
  } else {
    card.setAttribute("role", "group");
    card.removeAttribute("tabindex");
    card.removeAttribute("aria-label");
    card.removeAttribute("title");
  }
  if (card.dataset.kisatsutaiInteractionBound === "true") return;
  card.dataset.kisatsutaiInteractionBound = "true";
  card.addEventListener("click", (event) => {
    if (card.dataset.kisatsutaiHasNativeAgents !== "true") return;
    event.preventDefault();
    event.stopPropagation();
    activateNativeSummaryAgent(card);
  });
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target !== card || card.dataset.kisatsutaiHasNativeAgents !== "true") return;
    event.preventDefault();
    activateNativeSummaryAgent(card);
  });
}

function syncSummarySquad(section, state, squadCount) {
  if (!(section instanceof HTMLElement) || !state) return;
  let card = section.querySelector(":scope > .kisatsutai-summary-squad-card");
  if (!card) {
    card = document.createElement("div");
    card.className = "kisatsutai-summary-squad-card";
    card.dataset.kisatsutaiInjected = "true";
    card.setAttribute("role", "group");
    card.innerHTML = [
      '<span class="kisatsutai-summary-squad-copy">',
      '<small>当前任务编成 / <span class="kisatsutai-summary-squad-count"></span></small>',
      '<b>鬼杀队出战名册</b>',
      '<em class="kisatsutai-summary-squad-names"></em>',
      "</span>",
      '<span class="kisatsutai-avatar-stack kisatsutai-summary-squad" role="img"></span>',
    ].join("");
    const header = section.querySelector(":scope > header") || section.firstElementChild;
    if (header) header.after(card);
    else section.prepend(card);
    injectedNodes.add(card);
  }

  for (const child of Array.from(section.children)) {
    if (child === card || child.tagName === "HEADER") continue;
    child.dataset.kisatsutaiSummaryNativeSquad = "true";
    markedElements.add(child);
  }

  const characters = getSessionCharacters(state, squadCount);
  const squad = card.querySelector(".kisatsutai-summary-squad");
  if (squad) renderAvatarStack(squad, characters, squadCount);
  syncSummarySquadInteractions(section, card);
  setTextIfChanged(
    card.querySelector(".kisatsutai-summary-squad-count"),
    String(squadCount).padStart(2, "0"),
  );
  setTextIfChanged(
    card.querySelector(".kisatsutai-summary-squad-names"),
    characters
      .slice(0, 4)
      .map((id) => CHARACTER_BY_ID.get(id)?.name)
      .filter(Boolean)
      .join(" / "),
  );
  setDatasetIfChanged(card, "count", Math.min(squadCount, 4));
}

function decorateSummaryPanel(state, squadCount) {
  const panel = getSummaryPanel();
  if (!panel || !state) return;
  setDatasetIfChanged(panel, "kisatsutaiSummaryPanel", "true");
  markedElements.add(panel);
  const sections = getSummarySections(panel);
  let artifactsSection = null;
  let environmentSection = null;
  let squadSection = null;
  for (const { section, key } of sections) {
    setDatasetIfChanged(section, "kisatsutaiSummarySection", key);
    markedElements.add(section);
    patchSummaryHeading(section, key);
    if (key === "artifacts") artifactsSection = section;
    if (key === "environment") environmentSection = section;
    if (key === "background-subagents") squadSection = section;
  }
  syncLocationDossier(
    panel,
    artifactsSection || environmentSection,
    environmentSection,
    LOCATION_BY_ID.get(state.locationId),
    MISSION_BY_ID.get(state.missionId),
    squadCount,
    state.key,
  );
  syncSummarySquad(squadSection, state, squadCount);
}

function ensureMissionStrip() {
  if (
    missionStrip?.isConnected
    && missionStrip.querySelector(".kisatsutai-strip-duel > .kisatsutai-versus-mark")
  ) return missionStrip;
  if (missionStrip?.isConnected) {
    missionStrip.remove();
    injectedNodes.delete(missionStrip);
    missionStrip = null;
  }
  missionStrip = document.getElementById(STRIP_ID);
  if (
    missionStrip
    && missionStrip.querySelector(".kisatsutai-strip-duel > .kisatsutai-versus-mark")
  ) return missionStrip;
  if (missionStrip) {
    missionStrip.remove();
    injectedNodes.delete(missionStrip);
    missionStrip = null;
  }

  missionStrip = document.createElement("div");
  missionStrip.id = STRIP_ID;
  missionStrip.className = "kisatsutai-mission-strip";
  missionStrip.dataset.kisatsutaiInjected = "true";
  missionStrip.setAttribute("role", "region");
  missionStrip.setAttribute("aria-label", "鬼杀队任务情报");
  missionStrip.innerHTML = [
    '<span class="kisatsutai-strip-command">',
    '<span class="kisatsutai-strip-crest" aria-hidden="true"></span>',
    '<span class="kisatsutai-strip-copy">',
    '<span class="kisatsutai-strip-eyebrow">鬼杀队 · <span class="kisatsutai-strip-mission">任务待命</span> · <span class="kisatsutai-strip-location">地点待命</span></span>',
    '<span class="kisatsutai-strip-status" role="status" aria-live="polite">等待鎹鸦回报</span>',
    "</span>",
    '<span class="kisatsutai-strip-rank" aria-label="任务等级待定">—</span>',
    "</span>",
    '<span class="kisatsutai-strip-duel" role="group" aria-label="鬼杀队对决当前恶鬼">',
    '<span class="kisatsutai-strip-allies">',
    '<span class="kisatsutai-avatar-stack kisatsutai-strip-squad" aria-label="负责队员"></span>',
    '<span class="kisatsutai-allies-copy">',
    '<small class="kisatsutai-allies-count">出战编成 / 01</small>',
    '<b class="kisatsutai-allies-names">队员待命</b>',
    '<em class="kisatsutai-allies-specialties">等待鎹鸦派遣</em>',
    "</span>",
    "</span>",
    '<span class="kisatsutai-versus-mark" role="img" aria-label="鬼杀队对决当前恶鬼">',
    '<span class="kisatsutai-versus-glyph" aria-hidden="true"><i>V</i><i>S</i></span>',
    "</span>",
    '<span class="kisatsutai-strip-opponent" data-state="unknown">',
    '<span class="kisatsutai-opponent-copy">',
    '<small class="kisatsutai-opponent-rank">当前对手 / 待锁定</small>',
    '<b class="kisatsutai-opponent-name">鬼迹未明</b>',
    '<em class="kisatsutai-opponent-technique">等待鬼迹判定</em>',
    "</span>",
    '<span class="kisatsutai-opponent-difficulty">',
    '<strong class="kisatsutai-difficulty-grade">—</strong>',
    '<small class="kisatsutai-difficulty-label">任务等级</small>',
    "</span>",
    '<span class="kisatsutai-opponent-portrait" aria-hidden="true"></span>',
    "</span>",
    "</span>",
    '<span class="kisatsutai-invasion-meter" data-kisatsutai-invasion="true" data-state="unknown">',
    '<span class="kisatsutai-invasion-figure" aria-hidden="true"></span>',
    '<span class="kisatsutai-invasion-body">',
    '<span class="kisatsutai-invasion-heading">',
    '<b>鬼王侵蚀</b>',
    '<strong class="kisatsutai-invasion-value">—</strong>',
    "</span>",
    '<span class="kisatsutai-invasion-dots" aria-hidden="true">',
    "<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>",
    "</span>",
    "</span>",
    "</span>",
  ].join("");
  injectedNodes.add(missionStrip);
  mountMissionStrip(missionStrip);
  return missionStrip;
}

function bindBreathingControls(strip) {
  if (!(strip instanceof HTMLElement)) return;
  for (const button of strip.querySelectorAll("[data-kisatsutai-breath]")) {
    if (!(button instanceof HTMLButtonElement)) continue;
    const breathing = button.dataset.kisatsutaiBreath;
    if (!BREATHING_OPTIONS.some((option) => option.id === breathing)) continue;
    if (!breathingControlHandlers.has(button)) {
      const handler = (event) => {
        event.stopPropagation();
        if (breathing === "random") {
          rollRandomBreathing();
          savePreferences({ breathing });
          return;
        }
        if (preferences.breathing !== breathing) savePreferences({ breathing });
      };
      button.addEventListener("click", handler);
      breathingControlHandlers.set(button, handler);
    }
    const active = preferences.breathing === breathing;
    setDatasetIfChanged(button, "active", active ? "true" : "false");
    setAttributeIfChanged(button, "aria-pressed", active);
    if (breathing === "random") {
      const resolved = BREATHING_OPTIONS.find((option) => option.id === resolvedRandomBreathing);
      const label = `随机呼吸 · 当前${resolved?.label || "呼吸法"}`;
      setAttributeIfChanged(button, "title", label);
      setAttributeIfChanged(button, "aria-label", label);
    }
  }
}

function mountMissionStrip(strip) {
  if (!(strip instanceof HTMLElement)) return;
  const mount = document.querySelector("[data-app-shell-main-content-layout]");
  if (mount instanceof HTMLElement) {
    if (strip.parentElement !== mount) mount.prepend(strip);
    const mountRect = mount.getBoundingClientRect();
    setDatasetIfChanged(
      strip,
      "kisatsutaiToolbarClearance",
      mountRect.top < 0 && mountRect.width <= 1100,
    );
    return;
  }
  delete strip.dataset.kisatsutaiToolbarClearance;
  if (strip.parentElement !== document.body) document.body.appendChild(strip);
}

function ensureRavenStatus() {
  if (ravenStatus?.isConnected) return ravenStatus;
  const nativeTask = document.querySelector("[data-app-action-sidebar-thread-row]");
  const taskSidebar = nativeTask?.closest("aside");
  const sidebar = taskSidebar instanceof HTMLElement
    ? taskSidebar
    : document.querySelector('aside[data-kisatsutai-sidebar="true"]');
  if (!(sidebar instanceof HTMLElement)) return null;
  setDatasetIfChanged(sidebar, "kisatsutaiSidebar", "true");
  markedElements.add(sidebar);
  ravenStatus = document.createElement("div");
  ravenStatus.className = "kisatsutai-raven-status";
  ravenStatus.dataset.kisatsutaiInjected = "true";
  ravenStatus.dataset.state = "idle";
  ravenStatus.setAttribute("role", "status");
  ravenStatus.setAttribute("aria-live", "polite");
  ravenStatus.innerHTML = [
    '<span class="kisatsutai-raven-icon" aria-hidden="true">',
    '<svg viewBox="0 0 36 36" fill="none">',
    '<path d="M5 24c4.8-1.3 7.7-5.1 8.8-11.4 3.5 4.2 7.2 5.5 15.2 4.6-3 2.7-5.4 5.4-7.1 9.1-5-1.9-9.3-1.7-15.2.9 1.4-1.2 1.1-2.2-1.7-3.2Z"/>',
    '<path d="m14 13-2.1-4.6 5.2 3.4M24.8 17.8l4.7-3.3-.9 5.5"/>',
    '<circle cx="20.5" cy="15.1" r="1"/>',
    "</svg>",
    "</span>",
    '<span class="kisatsutai-raven-copy">',
    '<b>渡鸦在线</b>',
    '<small>本地任务记录已同步</small>',
    "</span>",
    '<i class="kisatsutai-raven-signal" aria-hidden="true"></i>',
  ].join("");
  sidebar.appendChild(ravenStatus);
  injectedNodes.add(ravenStatus);
  return ravenStatus;
}

function updateRavenStatus(state) {
  if (!preferences.narrative) {
    removeRavenStatus();
    return;
  }
  const status = ensureRavenStatus();
  if (!status) return;
  const copy = {
    idle: ["渡鸦在线", "本地任务记录已同步"],
    tracking: ["渡鸦在线", "小队信号持续回传"],
    returned: ["渡鸦在线", "战报同步完成"],
    blocked: ["渡鸦在线", "等待重新派遣"],
  }[state] || ["渡鸦在线", "本地任务记录已同步"];
  setDatasetIfChanged(status, "state", state);
  setTextIfChanged(status.querySelector("b"), copy[0]);
  setTextIfChanged(status.querySelector("small"), copy[1]);
}

function clampRatio(value) {
  return Math.min(1, Math.max(0, Number(value) || 0));
}

function parseTokenNumber(value) {
  const match = String(value || "")
    .replace(/,/g, "")
    .match(/(\d+(?:\.\d+)?)\s*([kmb]?)/i);
  if (!match) return 0;
  const multiplier = { k: 1e3, m: 1e6, b: 1e9 }[match[2].toLocaleLowerCase()] || 1;
  return Number(match[1]) * multiplier;
}

function getTokenSignalFromElement(element) {
  if (!(element instanceof HTMLElement)) return null;
  if (element.closest("#" + STRIP_ID) || element.closest("[data-kisatsutai-invasion='true']")) return null;

  const remaining = parseTokenNumber(element.getAttribute("data-token-remaining"));
  const total = parseTokenNumber(
    element.getAttribute("data-token-limit")
      || element.getAttribute("data-token-total")
      || element.getAttribute("data-context-limit"),
  );
  const used = parseTokenNumber(element.getAttribute("data-token-used"));
  if (total > 0 && (remaining > 0 || element.hasAttribute("data-token-remaining"))) {
    return { ratio: clampRatio(remaining / total), remaining, total, confidence: 100 };
  }
  if (total > 0 && (used > 0 || element.hasAttribute("data-token-used"))) {
    return { ratio: clampRatio(1 - used / total), remaining: Math.max(0, total - used), total, confidence: 98 };
  }

  const ariaNow = Number(element.getAttribute("aria-valuenow"));
  const ariaMax = Number(element.getAttribute("aria-valuemax"));
  const text = [
    element.getAttribute("aria-label"),
    element.getAttribute("aria-valuetext"),
    element.getAttribute("title"),
    element.textContent,
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim().slice(0, 320);
  if (!/(token|context|上下文|额度|余量)/i.test(text)) return null;

  if (Number.isFinite(ariaNow) && Number.isFinite(ariaMax) && ariaMax > 0) {
    const ratio = clampRatio(ariaNow / ariaMax);
    const meansRemaining = /(remaining|left|available|剩余|余量|可用)/i.test(text);
    return {
      ratio: meansRemaining ? ratio : 1 - ratio,
      remaining: meansRemaining ? ariaNow : ariaMax - ariaNow,
      total: ariaMax,
      confidence: 94,
    };
  }

  const remainingPercent = text.match(
    /(?:(?:remaining|left|available|剩余|余量|可用)[^\d]{0,16})?(\d+(?:\.\d+)?)\s*%(?:[^\d]{0,16}(?:remaining|left|available|剩余|余量|可用))?/i,
  );
  if (remainingPercent && /(remaining|left|available|剩余|余量|可用)/i.test(text)) {
    return { ratio: clampRatio(Number(remainingPercent[1]) / 100), confidence: 90 };
  }

  const usedPercent = text.match(
    /(?:(?:used|consumed|已使用|已消耗|消耗)[^\d]{0,16})?(\d+(?:\.\d+)?)\s*%(?:[^\d]{0,16}(?:used|consumed|已使用|已消耗|消耗))?/i,
  );
  if (usedPercent && /(used|consumed|已使用|已消耗|消耗)/i.test(text)) {
    return { ratio: clampRatio(1 - Number(usedPercent[1]) / 100), confidence: 88 };
  }

  const ratioMatch = text.match(
    /(\d[\d,.]*\s*[kmb]?)\s*\/\s*(\d[\d,.]*\s*[kmb]?)(?:\s*(?:tokens?|上下文|额度))?/i,
  );
  if (ratioMatch) {
    const current = parseTokenNumber(ratioMatch[1]);
    const limit = parseTokenNumber(ratioMatch[2]);
    if (limit > 0) {
      const meansRemaining = /(remaining|left|available|剩余|余量|可用)/i.test(text);
      const remainingTokens = meansRemaining ? current : Math.max(0, limit - current);
      return {
        ratio: clampRatio(remainingTokens / limit),
        remaining: remainingTokens,
        total: limit,
        confidence: meansRemaining ? 84 : 76,
      };
    }
  }
  return null;
}

function extractTokenSignal() {
  const candidates = Array.from(document.querySelectorAll([
    "[data-token-remaining]",
    "[data-token-used]",
    "[data-token-limit]",
    "[data-context-limit]",
    "[role='progressbar']",
    "[data-testid*='token' i]",
    "[data-testid*='context' i]",
    "[aria-label*='token' i]",
    "[aria-label*='context' i]",
    "[aria-label*='上下文']",
    "[title*='token' i]",
    "[title*='context' i]",
    "button",
  ].join(", "))).slice(0, 160);
  const signals = candidates.map(getTokenSignalFromElement).filter(Boolean);
  signals.sort((left, right) => right.confidence - left.confidence);
  if (signals[0]) return signals[0];

  const thread = document.querySelector("[data-app-shell-main-content-layout]");
  if (!(thread instanceof HTMLElement)) return null;
  const contentLength = Math.max(
    0,
    String(thread.textContent || "").replace(/\s+/g, "").length - 160,
  );
  const usedRatio = clampRatio(0.08 + contentLength / 36000);
  return {
    ratio: clampRatio(1 - usedRatio),
    confidence: 12,
    estimated: true,
  };
}

function setTextIfChanged(element, value) {
  if (element && element.textContent !== value) element.textContent = value;
}

function updateInvasionMeter(strip, signal) {
  const meter = strip.querySelector(".kisatsutai-invasion-meter");
  if (!meter) return;
  const dots = meter.querySelectorAll(".kisatsutai-invasion-dots i");
  const nextState = signal ? "known" : "unknown";
  if (meter.dataset.state !== nextState) meter.dataset.state = nextState;

  if (!signal) {
    dots.forEach((dot) => delete dot.dataset.active);
    setTextIfChanged(meter.querySelector(".kisatsutai-invasion-value"), "—");
    const label = "鬼王侵蚀：未知";
    if (meter.getAttribute("aria-label") !== label) meter.setAttribute("aria-label", label);
    return;
  }

  const percent = Math.round(clampRatio(signal.ratio) * 100);
  const activeDots = Math.ceil(percent / 10);
  dots.forEach((dot, index) => {
    if (index < activeDots) dot.dataset.active = "true";
    else delete dot.dataset.active;
  });
  setTextIfChanged(meter.querySelector(".kisatsutai-invasion-value"), `${percent}%`);
  const label = `鬼王侵蚀 ${percent}%`;
  if (meter.getAttribute("aria-label") !== label) meter.setAttribute("aria-label", label);
}

function getDifficultyTier(signal) {
  if (!signal) return null;
  const usedRatio = clampRatio(1 - signal.ratio);
  return DIFFICULTY_TIERS.find((tier) => usedRatio <= tier.maxUsed) || DIFFICULTY_TIERS.at(-1);
}

function getAssignedOpponent(state, tier) {
  if (!state || !tier) return null;
  let opponentId = state.opponentByTier.get(tier.id);
  if (!tier.opponents.includes(opponentId)) {
    const index = hashString(`${state.key}:opponent:${tier.id}`) % tier.opponents.length;
    opponentId = tier.opponents[index];
    state.opponentByTier.set(tier.id, opponentId);
  }
  return OPPONENT_BY_ID.get(opponentId) || null;
}

function updateDifficultyAndOpponent(strip, signal, activeTask, state) {
  const root = document.documentElement;
  const opponentCard = strip.querySelector(".kisatsutai-strip-opponent");
  const rankBadge = strip.querySelector(".kisatsutai-strip-rank");
  const tier = getDifficultyTier(signal);
  if (!tier || !opponentCard) {
    root.removeAttribute(ROOT_DIFFICULTY_ATTR);
    if (activeTask) delete activeTask.dataset.kisatsutaiDifficulty;
    opponentCard?.removeAttribute("data-opponent");
    if (opponentCard) setDatasetIfChanged(opponentCard, "state", "unknown");
    setTextIfChanged(rankBadge, "—");
    if (rankBadge) setAttributeIfChanged(rankBadge, "aria-label", "任务等级待定");
    setTextIfChanged(opponentCard?.querySelector(".kisatsutai-opponent-rank"), "当前对手 / 待锁定");
    setTextIfChanged(opponentCard?.querySelector(".kisatsutai-opponent-name"), "鬼迹未明");
    setTextIfChanged(
      opponentCard?.querySelector(".kisatsutai-opponent-technique"),
      "等待鬼迹判定",
    );
    setTextIfChanged(opponentCard?.querySelector(".kisatsutai-difficulty-grade"), "—");
    setTextIfChanged(opponentCard?.querySelector(".kisatsutai-difficulty-label"), "任务等级");
    return null;
  }

  const opponent = getAssignedOpponent(state, tier);
  if (!opponent) return null;
  setAttributeIfChanged(root, ROOT_DIFFICULTY_ATTR, tier.id);
  if (activeTask) setDatasetIfChanged(activeTask, "kisatsutaiDifficulty", tier.id);
  setDatasetIfChanged(opponentCard, "state", "known");
  setDatasetIfChanged(opponentCard, "opponent", opponent.id);
  setTextIfChanged(
    opponentCard.querySelector(".kisatsutai-opponent-rank"),
    `${opponent.rank} / ${tier.label}`,
  );
  setTextIfChanged(opponentCard.querySelector(".kisatsutai-opponent-name"), opponent.name);
  setTextIfChanged(opponentCard.querySelector(".kisatsutai-opponent-technique"), opponent.technique);
  setTextIfChanged(opponentCard.querySelector(".kisatsutai-difficulty-grade"), tier.grade);
  setTextIfChanged(opponentCard.querySelector(".kisatsutai-difficulty-label"), tier.label);
  setTextIfChanged(rankBadge, tier.grade);
  if (rankBadge) setAttributeIfChanged(rankBadge, "aria-label", `任务等级 ${tier.grade}，${tier.label}`);
  setAttributeIfChanged(
    opponentCard,
    "aria-label",
    `当前对手 ${opponent.name}，${opponent.rank}，${tier.label}`,
  );
  return opponent;
}

function updateMissionState() {
  const strip = ensureMissionStrip();
  mountMissionStrip(strip);
  const composer = findComposer();
  const composerDock = composer?.querySelector(".kisatsutai-composer-breathing-dock");
  if (composerDock instanceof HTMLElement) bindBreathingControls(composerDock);
  const { task: activeTask, state: sessionState } = getActiveSessionContext();
  const squadCount = resolveSquadCount(activeTask, sessionState, true);
  const assignedCharacters = getSessionCharacters(sessionState, squadCount);
  if (activeTask instanceof HTMLElement) syncTaskSquad(activeTask);
  const stripSquad = strip.querySelector(".kisatsutai-strip-squad");
  if (stripSquad) {
    renderAvatarStack(
      stripSquad,
      assignedCharacters,
      squadCount,
    );
  }
  const locationData = LOCATION_BY_ID.get(sessionState.locationId) || LOCATION_ROSTER[0];
  const missionData = MISSION_BY_ID.get(sessionState.missionId) || MISSION_ROSTER[0];
  const locationImage = `var(--ki-location-${locationData.id})`;
  setStylePropertyIfChanged(document.documentElement, "--ki-shared-scene", locationImage);
  setStylePropertyIfChanged(
    document.documentElement,
    "--ki-shared-scene-position",
    locationData.position,
  );
  if (composer instanceof HTMLElement) {
    setDatasetIfChanged(composer, "kisatsutaiLocationLabel", `任务地点 · ${locationData.name}`);
    markedElements.add(composer);
  }
  setDatasetIfChanged(strip, "session", sessionState.key);
  setDatasetIfChanged(strip, "location", locationData.id);
  setDatasetIfChanged(strip, "mission", missionData.id);
  setTextIfChanged(strip.querySelector(".kisatsutai-strip-mission"), missionData.name);
  setTextIfChanged(strip.querySelector(".kisatsutai-strip-location"), locationData.name);
  setAttributeIfChanged(strip, "aria-label", `${missionData.name}，任务地点 ${locationData.name}`);
  const atmosphereTargets = [
    document.querySelector('aside[data-kisatsutai-sidebar="true"]'),
    findComposer(),
    getSummaryPanel(),
  ];
  for (const target of atmosphereTargets) {
    if (!(target instanceof HTMLElement)) continue;
    setDatasetIfChanged(target, "kisatsutaiAtmosphereLocation", locationData.id);
    markedElements.add(target);
  }
  setTextIfChanged(
    strip.querySelector(".kisatsutai-allies-count"),
    `出战编成 / ${String(squadCount).padStart(2, "0")}`,
  );
  const assignedNames = assignedCharacters
    .slice(0, 3)
    .map((id) => CHARACTER_BY_ID.get(id)?.name)
    .filter(Boolean);
  setTextIfChanged(
    strip.querySelector(".kisatsutai-allies-names"),
    assignedNames.join("\n"),
  );
  setTextIfChanged(
    strip.querySelector(".kisatsutai-allies-specialties"),
    assignedCharacters
      .slice(0, 3)
      .map((id) => CHARACTER_BY_ID.get(id)?.specialty)
      .filter(Boolean)
      .join(" · "),
  );
  const tokenSignal = extractTokenSignal();
  updateInvasionMeter(strip, tokenSignal);
  const opponent = updateDifficultyAndOpponent(strip, tokenSignal, activeTask, sessionState);
  setAttributeIfChanged(
    strip.querySelector(".kisatsutai-strip-duel"),
    "aria-label",
    `鬼杀队 ${assignedNames.join("、") || "队员待命"} 对决 ${opponent?.name || "未知恶鬼"}`,
  );
  const surface = decorateMissionSurface();
  if (surface) {
    setDatasetIfChanged(surface, "kisatsutaiLocation", locationData.id);
  }
  decorateSummaryPanel(sessionState, squadCount);
  const liveText = Array.from(
    document.querySelectorAll("[role='status']:not(#" + STRIP_ID + "), [aria-live]:not(#" + STRIP_ID + ")"),
  )
    .filter((node) => !node.closest("[data-kisatsutai-injected='true']"))
    .slice(-20)
    .map((node) => node.textContent || "")
    .join(" ");
  const controls = Array.from(document.querySelectorAll("button"));
  const hasStop = controls.some((button) => {
    const label = [
      button.getAttribute("aria-label"),
      button.getAttribute("title"),
      button.textContent,
    ].join(" ");
    return /(^|\s)(stop|cancel|停止|取消)(\s|$)/i.test(label);
  });

  let state = "idle";
  let copy = "等待鎹鸦回报";
  if (/(error|failed|failure|出错|失败|无法完成)/i.test(liveText)) {
    state = "blocked";
    copy = "紫藤警戒 · 任务受阻";
  } else if (hasStop || /(thinking|working|running|searching|执行中|思考中|运行中|搜索中)/i.test(liveText)) {
    state = "tracking";
    copy = "全集中 · 深夜追踪";
  } else if (/(completed|complete|done|success|已完成|完成|成功)/i.test(liveText)) {
    state = "returned";
    copy = "收刀 · 斩鬼归队";
  }

  setAttributeIfChanged(document.documentElement, ROOT_STATE_ATTR, state);
  setDatasetIfChanged(strip, "state", state);
  updateRavenStatus(state);
  const status = strip.querySelector(".kisatsutai-strip-status");
  if (status && status.textContent !== copy) status.textContent = copy;
}

function clearMarks() {
  for (const element of markedElements) {
    clearMarkedElement(element);
  }
  markedElements.clear();
}

function removeMissionStrip() {
  missionStrip?.remove();
  missionStrip = null;
}

function removeRavenStatus() {
  ravenStatus?.remove();
  ravenStatus = null;
}

function titleBlock(title, description) {
  const wrap = document.createElement("div");
  wrap.className = "kisatsutai-settings-title";
  const eyebrow = document.createElement("div");
  eyebrow.className = "kisatsutai-settings-eyebrow";
  eyebrow.textContent = "KISATSUTAI / UNIFORM";
  const heading = document.createElement("div");
  heading.className = "text-base font-medium text-token-text-primary kisatsutai-settings-heading";
  heading.textContent = title;
  const body = document.createElement("div");
  body.className = "text-token-text-secondary text-sm kisatsutai-settings-description";
  body.textContent = description;
  wrap.append(eyebrow, heading, body);
  return wrap;
}

function card() {
  const element = document.createElement("div");
  element.className = "kisatsutai-native-settings-card";
  return element;
}

function row(label, description, control) {
  const element = document.createElement("div");
  element.className = "kisatsutai-native-settings-row";
  const left = document.createElement("div");
  left.className = "flex min-w-0 flex-col gap-1";
  const name = document.createElement("div");
  name.className = "min-w-0 text-sm text-token-text-primary";
  name.textContent = label;
  const detail = document.createElement("div");
  detail.className = "text-token-text-secondary min-w-0 text-sm";
  detail.textContent = description;
  left.append(name, detail);
  element.append(left, control);
  return element;
}

function switchControl(value, label, onChange) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "kisatsutai-native-switch";
  button.setAttribute("role", "switch");
  button.setAttribute("aria-label", label);
  const track = document.createElement("span");
  track.className = "kisatsutai-native-switch-track";
  const thumb = document.createElement("span");
  thumb.className = "kisatsutai-native-switch-thumb";
  track.appendChild(thumb);
  button.appendChild(track);

  let current = !!value;
  const sync = () => {
    button.setAttribute("aria-checked", String(current));
    button.dataset.on = String(current);
  };
  button.addEventListener("click", () => {
    current = !current;
    sync();
    onChange(current);
  });
  sync();
  return button;
}

function selectControl(value, label, options, onChange) {
  const select = document.createElement("select");
  select.className = "kisatsutai-native-select";
  select.setAttribute("aria-label", label);
  for (const option of options) {
    const node = document.createElement("option");
    node.value = option.value;
    node.textContent = option.label;
    node.selected = option.value === value;
    select.appendChild(node);
  }
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

function renderPreview() {
  const preview = document.createElement("section");
  preview.className = "kisatsutai-settings-preview";
  preview.setAttribute("aria-label", "主题预览");

  const header = document.createElement("div");
  header.className = "kisatsutai-preview-header";
  const mission = document.createElement("div");
  mission.innerHTML = [
    '<span class="kisatsutai-preview-kicker">讨伐令 / NO. 0147</span>',
    '<strong>西北山道 · 失踪案调查</strong>',
  ].join("");
  const rank = document.createElement("span");
  rank.className = "kisatsutai-preview-rank";
  rank.textContent = "甲";
  header.append(mission, rank);

  const route = document.createElement("div");
  route.className = "kisatsutai-preview-route";
  for (const [state, label] of [
    ["done", "受命"],
    ["done", "侦察"],
    ["active", "追踪"],
    ["pending", "归档"],
  ]) {
    const step = document.createElement("span");
    step.dataset.state = state;
    step.innerHTML = '<i aria-hidden="true"></i><b>' + label + "</b>";
    route.appendChild(step);
  }

  const squad = document.createElement("div");
  squad.className = "kisatsutai-preview-squad";
  squad.innerHTML = [
    '<span class="kisatsutai-squad-label">出战小队</span>',
    '<span class="kisatsutai-avatar-stack" aria-label="负责队员：灶门炭治郎、我妻善逸">',
    '<i class="kisatsutai-agent-avatar" data-character="tanjiro" aria-hidden="true"></i>',
    '<i class="kisatsutai-agent-avatar" data-character="zenitsu" aria-hidden="true"></i>',
    "</span>",
    "<span>炭治郎统筹 · 善逸侦察</span>",
  ].join("");

  preview.append(header, route, squad);
  return preview;
}

function renderSettings(root) {
  root.innerHTML = "";
  root.classList.remove("kisatsutai-settings");
  root.classList.add("kisatsutai-native-settings");

  const appearance = card();
  appearance.append(
    row(
      "界面氛围",
      "沉浸使用会话地点背景与中央阅读光场；安静恢复 Codex 原生背景。",
      selectControl(
        preferences.density,
        "选择界面氛围",
        [
          { value: "immersive", label: "沉浸（默认）" },
          { value: "quiet", label: "安静（原生背景）" },
        ],
        (density) => savePreferences({ density }),
      ),
    ),
    row(
      "剧情化文案",
      "只在核心会话页保留接取讨伐、任务案卷、出战小队与渡鸦情报等核心名称。",
      switchControl(preferences.narrative, "启用剧情化文案", (narrative) => savePreferences({ narrative })),
    ),
    row(
      "状态动效",
      "控制核心会话页的任务状态、呼吸选择与发送斩击反馈；关闭后恢复 Codex 原生发送控件。",
      switchControl(preferences.motion, "启用状态动效", (motion) => savePreferences({ motion })),
    ),
  );

  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "kisatsutai-native-reset";
  reset.textContent = "恢复默认（沉浸）";
  reset.addEventListener("click", () => {
    savePreferences({ ...DEFAULTS });
    renderSettings(root);
  });

  const footer = document.createElement("div");
  footer.className = "kisatsutai-native-settings-footer";
  const note = document.createElement("p");
  note.textContent = "发送、终端、文件、分支与搜索等操作始终使用 Codex 原生名称和控件。";
  footer.append(note, reset);

  root.append(appearance, footer);
  return () => root.classList.remove("kisatsutai-native-settings");
}

function startObserver() {
  if (observer) return;
  observer = new MutationObserver(schedulePatch);
  observer.observe(document.documentElement, OBSERVER_OPTIONS);
  navHandler = schedulePatch;
  window.addEventListener("popstate", navHandler);
  window.addEventListener("hashchange", navHandler);
  resizeHandler = schedulePatch;
  window.addEventListener("resize", resizeHandler);
  settingsSurfaceHandler = schedulePatch;
  window.addEventListener("codexpp:settings-surface", settingsSurfaceHandler);
  navigationClickHandler = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const task = target?.closest(
      "[data-app-action-sidebar-thread-row], aside a[href], nav a[href]",
    );
    const taskKey = getThreadSessionKey(task);
    if (taskKey) {
      lastActiveSessionKey = taskKey;
      schedulePatch();
      return;
    }
    const action = target?.closest("[data-kisatsutai-action='new-task']");
    if (action) {
      draftSessionCounter += 1;
      lastActiveSessionKey = `draft:${Date.now().toString(36)}:${draftSessionCounter}`;
      ensureSessionState(lastActiveSessionKey);
      schedulePatch();
    }
  };
  document.addEventListener("click", navigationClickHandler, true);
}

function cleanup() {
  observer?.disconnect();
  observer = null;
  if (scheduledFrame) cancelAnimationFrame(scheduledFrame);
  scheduledFrame = 0;
  if (navHandler) {
    window.removeEventListener("popstate", navHandler);
    window.removeEventListener("hashchange", navHandler);
  }
  navHandler = null;
  if (resizeHandler) window.removeEventListener("resize", resizeHandler);
  resizeHandler = null;
  if (settingsSurfaceHandler) {
    window.removeEventListener("codexpp:settings-surface", settingsSurfaceHandler);
  }
  settingsSurfaceHandler = null;
  if (navigationClickHandler) {
    document.removeEventListener("click", navigationClickHandler, true);
  }
  navigationClickHandler = null;
  for (const [button, binding] of sendActionHandlers) {
    button?.removeEventListener?.("click", binding.handler);
    if (button?.isConnected) {
      if (binding.originalTitle === null) button.removeAttribute("title");
      else button.setAttribute("title", binding.originalTitle);
    }
  }
  sendActionHandlers.clear();
  for (const [editor, handler] of composerKeyHandlers) {
    editor?.removeEventListener?.("keydown", handler, true);
  }
  composerKeyHandlers.clear();
  for (const [button, handler] of breathingControlHandlers) {
    button?.removeEventListener?.("click", handler);
  }
  breathingControlHandlers.clear();
  removeActiveSlashEffect();
  for (const timer of slashTimers) window.clearTimeout(timer);
  slashTimers.clear();
  restoreNarrativePatches();
  clearMarks();
  for (const node of injectedNodes) node?.remove?.();
  injectedNodes.clear();
  removeMissionStrip();
  removeRavenStatus();
  restoreSettingsPageShortcutVisibility();
  settingsHandle?.unregister?.();
  settingsHandle = null;
  document.documentElement.removeAttribute(ROOT_THEME_ATTR);
  document.documentElement.removeAttribute(ROOT_BREATHING_MODE_ATTR);
  document.documentElement.removeAttribute(ROOT_SURFACE_ATTR);
  document.documentElement.removeAttribute(ROOT_MOTION_ATTR);
  document.documentElement.removeAttribute(ROOT_DENSITY_ATTR);
  document.documentElement.removeAttribute(ROOT_STATE_ATTR);
  document.documentElement.removeAttribute(ROOT_DIFFICULTY_ATTR);
  clearCharacterAssets();
  sessionStates = new Map();
  lastActiveSessionKey = "";
  draftSessionCounter = 0;
  resolvedRandomBreathing = DEFAULTS.breathing;
  lastSlashEffectAt = -Infinity;
  styleElement = null;
  apiRef = null;
}

module.exports = {
  start(api) {
    if (api.process !== "renderer" || !api.settings) return;
    if (!isPrimaryCodexRenderer()) {
      api.log.debug("skipping non-primary Codex renderer", location.href);
      return;
    }
    apiRef = api;
    api.storage.delete("enabled");
    preferences = getPreferences(api);
    if (preferences.breathing === "random") rollRandomBreathing("");
    ensureStyle();
    applyRootState();
    settingsHandle = api.settings.registerPage({
      id: "uniform",
      title: "鬼杀队任务中枢",
      description: "任务页氛围、剧情文案与状态反馈。",
      iconSvg: PAGE_ICON,
      render: renderSettings,
    });
    startObserver();
    schedulePatch();
    api.log.info("鬼杀队任务中枢已就位", preferences);
  },
  stop() {
    cleanup();
  },
};
