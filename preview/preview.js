"use strict";

const root = document.documentElement;
const strip = document.getElementById("kisatsutai-mission-strip");
const stripStatus = strip.querySelector(".kisatsutai-strip-status");
const missionChip = document.querySelector(".preview-mission-chip");
const missionCast = document.getElementById("mission-cast");
const missionLead = document.getElementById("mission-lead");
const stripSquad = document.getElementById("strip-squad");
const squadGrid = document.getElementById("squad-grid");
const missionList = document.getElementById("mission-list");
const stateCopy = {
  idle: ["等待鎹鸦回报", "等待指令"],
  tracking: ["全集中 · 深夜追踪", "深夜追踪"],
  blocked: ["紫藤警戒 · 任务受阻", "任务受阻"],
  returned: ["收刀 · 斩鬼归队", "斩鬼归队"],
};

const characters = [
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
];
const characterById = new Map(characters.map((character) => [character.id, character]));
const opponents = [
  { id: "rui", name: "累", rank: "下弦之伍", technique: "血鬼术 · 刻线牢" },
  { id: "enmu", name: "魇梦", rank: "下弦之壹", technique: "血鬼术 · 强制昏睡" },
  { id: "daki", name: "堕姬", rank: "上弦之陆", technique: "血鬼术 · 八重带斩" },
  { id: "gyutaro", name: "妓夫太郎", rank: "上弦之陆", technique: "血鬼术 · 飞行血镰" },
  { id: "kaigaku", name: "狯岳", rank: "上弦之陆", technique: "雷之呼吸 · 黑雷" },
  { id: "gyokko", name: "玉壶", rank: "上弦之伍", technique: "血鬼术 · 水狱钵" },
  { id: "hantengu", name: "半天狗", rank: "上弦之肆", technique: "血鬼术 · 分裂" },
  { id: "nakime", name: "鸣女", rank: "上弦之肆", technique: "血鬼术 · 无限城" },
  { id: "akaza", name: "猗窝座", rank: "上弦之叁", technique: "术式展开 · 破坏杀" },
  { id: "doma", name: "童磨", rank: "上弦之贰", technique: "血鬼术 · 寒烈白姬" },
  { id: "kokushibo", name: "黑死牟", rank: "上弦之壹", technique: "月之呼吸" },
  { id: "muzan-opponent", name: "鬼舞辻无惨", rank: "鬼之始祖", technique: "血鬼术 · 黑血枳棘" },
];
const opponentById = new Map(opponents.map((opponent) => [opponent.id, opponent]));
const difficultyTiers = [
  { id: "trace", maxUsed: 0.15, grade: "戊", label: "下弦侦察", danger: 1, opponents: ["rui", "enmu"] },
  { id: "lower", maxUsed: 0.35, grade: "丁", label: "下弦讨伐", danger: 2, opponents: ["rui", "enmu"] },
  { id: "upper-six", maxUsed: 0.55, grade: "乙", label: "上弦末席", danger: 3, opponents: ["daki", "gyutaro", "kaigaku"] },
  { id: "upper-mid", maxUsed: 0.72, grade: "甲", label: "上弦中位", danger: 4, opponents: ["gyokko", "hantengu", "nakime"] },
  { id: "upper-three", maxUsed: 0.9, grade: "极", label: "上弦前三", danger: 5, opponents: ["akaza", "doma", "kokushibo"] },
  { id: "demon-king", maxUsed: 1.01, grade: "终", label: "鬼王终局", danger: 5, opponents: ["muzan-opponent"] },
];
const taskAssignments = new WeakMap();
const opponentAssignments = new WeakMap();
let lastSlashAt = 0;

function shuffle(values) {
  const next = [...values];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function getTaskTitle(task) {
  return task?.querySelector("b")?.textContent?.trim() || "未命名讨伐";
}

function getTaskCharacterIds(task, count, force = false) {
  const existing = taskAssignments.get(task);
  if (!force && existing?.count === count) return existing.ids;
  const roster = characters.map((character) => character.id);
  let ids = [];
  while (ids.length < count) ids.push(...shuffle(roster));
  ids = ids.slice(0, count);
  if (force && existing && ids.join(",") === existing.ids.join(",") && ids.length > 1) {
    ids = [...ids.slice(1), ids[0]];
  }
  taskAssignments.set(task, { count, ids });
  return ids;
}

function createAvatar(id) {
  const avatar = document.createElement("span");
  avatar.className = "kisatsutai-agent-avatar";
  avatar.dataset.character = id;
  avatar.setAttribute("aria-hidden", "true");
  return avatar;
}

function renderAvatarStack(container, ids, count) {
  container.replaceChildren();
  container.dataset.count = String(Math.min(count, 4));
  for (const id of ids.slice(0, 3)) container.appendChild(createAvatar(id));
  if (count > 3) {
    const overflow = document.createElement("span");
    overflow.className = "kisatsutai-agent-overflow";
    overflow.textContent = `+${count - 3}`;
    overflow.setAttribute("aria-hidden", "true");
    container.appendChild(overflow);
  }
  const names = ids.slice(0, Math.min(count, 6)).map((id) => characterById.get(id).name);
  container.setAttribute("aria-label", `负责队员：${names.join("、")}`);
}

function renderTaskCard(task) {
  const count = Number(task.dataset.subagentCount || 1);
  task.dataset.kisatsutaiSquadCount = String(Math.min(count, 4));
  const ids = getTaskCharacterIds(task, count);
  let stack = task.querySelector(".kisatsutai-task-squad");
  if (!stack) {
    stack = document.createElement("span");
    stack.className = "kisatsutai-avatar-stack kisatsutai-task-squad";
    task.appendChild(stack);
  }
  renderAvatarStack(stack, ids, count);
}

function getActiveTask() {
  return missionList.querySelector("a[aria-current='page']") || missionList.querySelector("a");
}

function renderMissionCast(ids, count) {
  missionCast.replaceChildren();
  missionCast.dataset.count = String(count);
  for (const id of ids.slice(0, 3)) {
    const character = characterById.get(id);
    const card = document.createElement("span");
    card.className = "mission-cast-card";
    card.dataset.character = id;
    const name = document.createElement("span");
    name.textContent = character.name;
    card.appendChild(name);
    missionCast.appendChild(card);
  }
  if (count > 3) {
    const overflow = document.createElement("span");
    overflow.className = "mission-cast-overflow";
    overflow.textContent = `+${count - 3}`;
    overflow.setAttribute("aria-hidden", "true");
    missionCast.appendChild(overflow);
  }
  const names = ids.slice(0, Math.min(count, 6)).map((id) => characterById.get(id).name);
  missionCast.setAttribute("aria-label", `本次出战：${names.join("、")}`);
  missionLead.textContent = characterById.get(ids[0]).name;
}

function renderSquadBoard(ids, count) {
  squadGrid.replaceChildren();
  ids.slice(0, Math.min(count, 6)).forEach((id, index) => {
    const character = characterById.get(id);
    const article = document.createElement("article");
    article.dataset.character = id;

    const portrait = document.createElement("span");
    portrait.className = "squad-member-avatar";
    portrait.dataset.character = id;
    portrait.setAttribute("aria-hidden", "true");

    const copy = document.createElement("span");
    const name = document.createElement("b");
    name.textContent = character.name;
    const detail = document.createElement("small");
    detail.textContent = index === 0
      ? `主任务 · ${character.specialty}`
      : `subagent ${String(index).padStart(2, "0")} · ${character.specialty}`;
    copy.append(name, detail);

    const status = document.createElement("em");
    status.dataset.squadStatus = index === count - 1 ? "done" : "tracking";
    const dot = document.createElement("i");
    status.append(dot, index === count - 1 ? "采样完成" : "追踪中");
    article.append(portrait, copy, status);
    squadGrid.appendChild(article);
  });
}

function syncSquadControls(count) {
  document.querySelectorAll("[data-squad-size]").forEach((button) => {
    const target = Number(button.dataset.squadSize);
    button.setAttribute("aria-pressed", String(target === Math.min(count, 4)));
  });
}

function renderActiveSquad(force = false) {
  const activeTask = getActiveTask();
  if (!activeTask) return;
  const count = Math.max(1, Number(activeTask.dataset.subagentCount || 1));
  const title = getTaskTitle(activeTask);
  const ids = getTaskCharacterIds(activeTask, count, force);
  renderMissionCast(ids, count);
  renderSquadBoard(ids, count);
  renderAvatarStack(stripSquad, ids, count);
  renderTaskCard(activeTask);
  syncSquadControls(count);
  document.querySelector(".preview-header__title strong").textContent = title;
  const location = title.split(" · ")[0];
  document.getElementById("mission-location").textContent = location;
  document.getElementById("header-mission-location").textContent = `任务地点 · ${location}`;
}

function renderAllTaskCards() {
  missionList.querySelectorAll("a").forEach(renderTaskCard);
  renderActiveSquad();
}

function setMissionState(state) {
  const [stripText, chipText] = stateCopy[state] || stateCopy.idle;
  root.dataset.kisatsutaiMissionState = state;
  strip.dataset.state = state;
  stripStatus.textContent = stripText;
  missionChip.lastChild.textContent = chipText;
  document.querySelectorAll("[data-mission-state]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.missionState === state));
  });
}

function getDifficultyTier(remainingPercent) {
  const usedRatio = 1 - remainingPercent / 100;
  return difficultyTiers.find((tier) => usedRatio <= tier.maxUsed) || difficultyTiers.at(-1);
}

function getTaskOpponent(task, tier) {
  let taskPool = opponentAssignments.get(task);
  if (!taskPool) {
    taskPool = new Map();
    opponentAssignments.set(task, taskPool);
  }
  let opponentId = taskPool.get(tier.id);
  if (!tier.opponents.includes(opponentId)) {
    opponentId = tier.opponents[Math.floor(Math.random() * tier.opponents.length)];
    taskPool.set(tier.id, opponentId);
  }
  return opponentById.get(opponentId);
}

function renderDifficulty(remainingPercent) {
  const activeTask = getActiveTask();
  if (!activeTask) return;
  const tier = getDifficultyTier(remainingPercent);
  const opponent = getTaskOpponent(activeTask, tier);
  root.dataset.kisatsutaiDifficulty = tier.id;
  activeTask.dataset.kisatsutaiDifficulty = tier.id;
  const taskGrade = activeTask.querySelector(":scope > em");
  if (taskGrade) taskGrade.textContent = tier.grade;

  document.querySelectorAll(".kisatsutai-strip-rank").forEach((badge) => {
    badge.textContent = tier.grade;
    badge.setAttribute("aria-label", `任务等级 ${tier.grade}，${tier.label}`);
  });
  document.getElementById("mission-grade").textContent = tier.grade;
  document.getElementById("mission-grade-label").textContent = tier.label;
  document.querySelector(".mission-brief__stamp").setAttribute(
    "aria-label",
    `任务等级 ${tier.grade}，${tier.label}`,
  );
  const danger = document.querySelector(".danger-bars");
  danger.dataset.dangerLevel = String(tier.danger);
  danger.setAttribute("aria-label", `${tier.danger}级危险`);

  document.querySelectorAll(".kisatsutai-strip-opponent").forEach((card) => {
    card.dataset.state = "known";
    card.dataset.opponent = opponent.id;
    card.querySelector(".kisatsutai-opponent-rank").textContent =
      `${opponent.rank} / ${tier.label}`;
    card.querySelector(".kisatsutai-opponent-name").textContent = opponent.name;
    card.querySelector(".kisatsutai-opponent-technique").textContent = opponent.technique;
    card.querySelector(".kisatsutai-difficulty-grade").textContent = tier.grade;
    card.querySelector(".kisatsutai-difficulty-label").textContent = tier.label;
    card.setAttribute(
      "aria-label",
      `当前对手 ${opponent.name}，${opponent.rank}，${tier.label}`,
    );
  });
}

function setTokenRemaining(value) {
  const percent = Math.min(100, Math.max(0, Number(value) || 0));
  document.getElementById("token-remaining-output").value = `${percent}%`;
  document.querySelectorAll("[data-kisatsutai-invasion='true']").forEach((meter) => {
    meter.dataset.state = "known";
    const activeDots = Math.ceil(percent / 10);
    meter.querySelectorAll(".kisatsutai-invasion-dots i").forEach((dot, index) => {
      dot.toggleAttribute("data-active", index < activeDots);
    });
    meter.querySelector(".kisatsutai-invasion-value").textContent = `${percent}%`;
    meter.setAttribute("aria-label", `鬼王侵蚀 ${percent}%`);
  });
  renderDifficulty(percent);
}

document.querySelectorAll(".breath-option").forEach((button) => {
  button.addEventListener("click", () => {
    root.dataset.kisatsutaiTheme = button.dataset.breath;
    document.querySelectorAll(".breath-option").forEach((candidate) => {
      candidate.setAttribute("aria-pressed", String(candidate === button));
    });
  });
});

document.querySelectorAll("[data-mission-state]").forEach((button) => {
  button.addEventListener("click", () => setMissionState(button.dataset.missionState));
});

document.querySelectorAll("[data-squad-size]").forEach((button) => {
  button.addEventListener("click", () => {
    const activeTask = getActiveTask();
    if (!activeTask) return;
    activeTask.dataset.subagentCount = button.dataset.squadSize;
    renderTaskCard(activeTask);
    renderActiveSquad();
  });
});

document.querySelector(".preview-motion-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const next = button.getAttribute("aria-checked") !== "true";
  button.setAttribute("aria-checked", String(next));
  button.textContent = next ? "动效：开" : "动效：关";
  root.dataset.kisatsutaiMotion = next ? "on" : "off";
});

document.getElementById("token-remaining").addEventListener("input", (event) => {
  setTokenRemaining(event.currentTarget.value);
});

const missionSearch = document.getElementById("mission-search");
const missionLinks = Array.from(document.querySelectorAll("#mission-list a"));
const missionCount = document.getElementById("mission-count");

missionSearch.addEventListener("input", () => {
  const query = missionSearch.value.trim().toLocaleLowerCase();
  let visible = 0;
  for (const link of missionLinks) {
    const matches = !query || getTaskTitle(link).toLocaleLowerCase().includes(query);
    link.hidden = !matches;
    if (matches) visible += 1;
  }
  missionCount.textContent = String(visible).padStart(2, "0");
});

missionList.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  missionList.querySelectorAll("a").forEach((item) => item.removeAttribute("aria-current"));
  link.setAttribute("aria-current", "page");
  const statusText = link.querySelector("small")?.textContent || "";
  if (/受阻/.test(statusText)) setMissionState("blocked");
  else if (/归档/.test(statusText)) setMissionState("returned");
  else setMissionState("tracking");
  renderActiveSquad();
  setTokenRemaining(document.getElementById("token-remaining").value);
});

document.querySelector(".preview-new-task").addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = "#mission-new";
  link.dataset.kisatsutaiTask = "true";
  link.dataset.subagentCount = "1";
  link.innerHTML = [
    '<span class="kisatsutai-task-rank" aria-hidden="true"></span>',
    "<span><b>未命名讨伐</b><small>等待下令 · 刚刚</small></span>",
    "<em>癸</em>",
  ].join("");
  missionList.querySelectorAll("a").forEach((item) => item.removeAttribute("aria-current"));
  link.setAttribute("aria-current", "page");
  missionList.prepend(link);
  missionLinks.unshift(link);
  missionCount.textContent = String(missionLinks.length).padStart(2, "0");
  renderTaskCard(link);
  renderActiveSquad();
  setTokenRemaining(document.getElementById("token-remaining").value);
  setMissionState("idle");
  document.getElementById("crow-message").focus();
});

document.getElementById("dispatch-squad").addEventListener("click", (event) => {
  const dispatchButton = event.currentTarget;
  renderActiveSquad(true);
  const statuses = Array.from(document.querySelectorAll("[data-squad-status]"));
  statuses.forEach((status, index) => {
    status.dataset.squadStatus = "tracking";
    status.lastChild.textContent = index === 0 ? "统筹中" : "执行中";
  });
  dispatchButton.textContent = "小队已出发";
  setMissionState("tracking");
  window.setTimeout(() => {
    statuses.forEach((status) => {
      status.dataset.squadStatus = "done";
      status.lastChild.textContent = "任务完成";
    });
    dispatchButton.textContent = "重新编队";
    setMissionState("returned");
  }, 1400);
});

const composer = document.getElementById("crow-composer");
const messageInput = document.getElementById("crow-message");
const sendButton = document.getElementById("crow-send");
const liveMessages = document.getElementById("live-messages");

function createNichirinSlash() {
  if (root.dataset.kisatsutaiMotion !== "on") return;
  const bounds = sendButton.getBoundingClientRect();
  const effect = document.createElement("span");
  effect.className = "kisatsutai-slash-effect";
  effect.dataset.breath = root.dataset.kisatsutaiTheme;
  effect.setAttribute("aria-hidden", "true");
  effect.style.setProperty("--ki-slash-x", `${bounds.left + bounds.width / 2}px`);
  effect.style.setProperty("--ki-slash-y", `${bounds.top + bounds.height / 2}px`);
  effect.innerHTML = [
    '<svg viewBox="0 0 320 210" fill="none">',
    '<path class="kisatsutai-slash-arc kisatsutai-slash-arc--wide" d="M25 178C92 58 202 24 296 40"></path>',
    '<path class="kisatsutai-slash-arc kisatsutai-slash-arc--edge" d="M38 191C120 72 214 44 292 50"></path>',
    '<path class="kisatsutai-slash-lightning" d="m38 177 74-62-18-8 83-42-20 34 116-61-82 86 18 1-98 60 12-31Z"></path>',
    '<path class="kisatsutai-slash-petal" d="M126 70c13-22 31-20 31 0-12 9-22 9-31 0Zm55 22c10-18 26-15 25 2-10 7-18 6-25-2Zm-85 37c9-17 24-14 24 2-9 7-17 6-24-2Z"></path>',
    '<circle class="kisatsutai-slash-spark" cx="94" cy="150" r="3"></circle>',
    '<circle class="kisatsutai-slash-spark" cx="180" cy="91" r="2.5"></circle>',
    '<circle class="kisatsutai-slash-spark" cx="242" cy="62" r="2"></circle>',
    "</svg>",
  ].join("");
  document.body.appendChild(effect);
  lastSlashAt = performance.now();
  window.setTimeout(() => effect.remove(), 760);
}

sendButton.addEventListener("click", createNichirinSlash);

composer.addEventListener("submit", (event) => {
  event.preventDefault();
  if (performance.now() - lastSlashAt > 160) createNichirinSlash();
  const message = messageInput.value.trim();
  if (!message || sendButton.getAttribute("aria-busy") === "true") return;

  const order = document.createElement("article");
  order.className = "mission-message mission-message--order generated-message";
  order.innerHTML = [
    '<div class="message-avatar message-avatar--seal" aria-hidden="true">令</div>',
    '<div class="message-body"><header><b>追加指令</b><time>刚刚</time></header><p></p></div>',
  ].join("");
  order.querySelector("p").textContent = message;
  liveMessages.appendChild(order);
  order.scrollIntoView({
    behavior: root.dataset.kisatsutaiMotion === "on" ? "smooth" : "auto",
    block: "nearest",
  });

  messageInput.value = "";
  sendButton.setAttribute("aria-busy", "true");
  sendButton.setAttribute("aria-label", "鎹鸦飞行中");
  setMissionState("tracking");

  window.setTimeout(() => {
    const activeTask = getActiveTask();
    const count = Number(activeTask?.dataset.subagentCount || 1);
    const reply = document.createElement("article");
    reply.className = "mission-message mission-message--assistant generated-message";
    reply.innerHTML = [
      '<div class="message-avatar message-avatar--crow" aria-hidden="true">◆</div>',
      '<div class="message-body"><header><b>鎹鸦回报</b><time>刚刚</time></header>',
      `<p>指令已送达 ${count} 名出战队员。调查记录与修改结果会在完成后归入鬼杀队案卷。</p></div>`,
    ].join("");
    liveMessages.appendChild(reply);
    reply.scrollIntoView({
      behavior: root.dataset.kisatsutaiMotion === "on" ? "smooth" : "auto",
      block: "nearest",
    });
    sendButton.removeAttribute("aria-busy");
    sendButton.setAttribute("aria-label", "挥刀传令");
    setMissionState("returned");
  }, 1100);
});

messageInput.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    composer.requestSubmit();
  }
});

renderAllTaskCards();
setTokenRemaining(document.getElementById("token-remaining").value);
