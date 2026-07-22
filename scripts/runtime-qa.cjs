"use strict";

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

async function inspectCore(page) {
  return page.evaluate(() => {
    const main = document.querySelector("[data-app-shell-main-content-layout]");
    const transcript = document.querySelector("[data-host-conversation-transcript]");
    const composer = document.querySelector('[data-kisatsutai-composer="true"]');
    const composerShell = document.querySelector('[data-kisatsutai-composer-shell="true"]');
    const editor = composer?.querySelector("textarea, [contenteditable='true']");
    const send = document.querySelector("#composer-action");
    const tool = document.querySelector('[data-testid="tool-search"]');
    const newTask = document.querySelector("aside > button");
    const newTaskAfterStyle = newTask instanceof HTMLElement
      ? getComputedStyle(newTask, "::after")
      : null;
    const headings = Object.fromEntries(Array.from(document.querySelectorAll(
      "[data-kisatsutai-summary-section]",
    )).map((section) => [
      section.dataset.kisatsutaiSummarySection,
      section.querySelector("header button")?.innerText?.replace(/\s+/g, " ").trim() || "",
    ]));
    const mainBeforeStyle = main instanceof HTMLElement ? getComputedStyle(main, "::before") : null;
    const transcriptStyle = transcript instanceof HTMLElement ? getComputedStyle(transcript) : null;
    const composerStyle = composer instanceof HTMLElement ? getComputedStyle(composer) : null;
    const composerBeforeStyle = composer instanceof HTMLElement
      ? getComputedStyle(composer, "::before")
      : null;
    const composerShellStyle = composerShell instanceof HTMLElement
      ? getComputedStyle(composerShell)
      : null;
    const composerShellBeforeStyle = composerShell instanceof HTMLElement
      ? getComputedStyle(composerShell, "::before")
      : null;
    const composerFooter = composer?.closest('[data-thread-scroll-footer="true"]');
    const composerFooterBackdrop = composerFooter?.querySelector(
      '[data-kisatsutai-composer-footer-backdrop="true"]',
    );
    const composerFooterContent = composerFooter?.querySelector(
      ':scope > [data-pip-obstacle="thread-footer"]',
    );
    const composerFooterStyle = composerFooter instanceof HTMLElement
      ? getComputedStyle(composerFooter)
      : null;
    const composerFooterBackdropStyle = composerFooterBackdrop instanceof HTMLElement
      ? getComputedStyle(composerFooterBackdrop)
      : null;
    const editorStyle = editor instanceof HTMLElement ? getComputedStyle(editor) : null;
    const hostIcon = send?.firstElementChild;
    const breathingDock = composer?.querySelector(".kisatsutai-composer-breathing-dock");
    const breathingDockStyle = breathingDock instanceof HTMLElement
      ? getComputedStyle(breathingDock)
      : null;
    const sendStyle = send instanceof HTMLElement ? getComputedStyle(send) : null;
    const duel = document.querySelector(".kisatsutai-strip-duel");
    const versus = duel?.querySelector(".kisatsutai-versus-mark");
    const squad = duel?.querySelector(".kisatsutai-strip-squad");
    const teamAvatar = squad?.querySelector(".kisatsutai-agent-avatar");
    const alliesCopy = duel?.querySelector(".kisatsutai-allies-copy");
    const opponentCopy = duel?.querySelector(".kisatsutai-opponent-copy");
    const allies = duel?.querySelector(".kisatsutai-strip-allies");
    const opponent = duel?.querySelector(".kisatsutai-strip-opponent");
    const opponentDifficulty = duel?.querySelector(".kisatsutai-opponent-difficulty");
    const opponentPortrait = duel?.querySelector(".kisatsutai-opponent-portrait");
    const duelStyle = duel instanceof HTMLElement ? getComputedStyle(duel) : null;
    const alliesStyle = allies instanceof HTMLElement ? getComputedStyle(allies) : null;
    const opponentStyle = opponent instanceof HTMLElement ? getComputedStyle(opponent) : null;
    const opponentDifficultyStyle = opponentDifficulty instanceof HTMLElement
      ? getComputedStyle(opponentDifficulty)
      : null;
    const versusStyle = versus instanceof HTMLElement ? getComputedStyle(versus) : null;
    const versusBeforeStyle = versus instanceof HTMLElement ? getComputedStyle(versus, "::before") : null;
    const versusAfterStyle = versus instanceof HTMLElement ? getComputedStyle(versus, "::after") : null;
    const versusGlyph = versus?.querySelector(".kisatsutai-versus-glyph");
    const versusGlyphStyle = versusGlyph instanceof HTMLElement ? getComputedStyle(versusGlyph) : null;
    const teamAvatarStyle = teamAvatar instanceof HTMLElement ? getComputedStyle(teamAvatar) : null;
    const opponentPortraitStyle = opponentPortrait instanceof HTMLElement
      ? getComputedStyle(opponentPortrait)
      : null;
    const centerX = (element) => {
      if (!(element instanceof HTMLElement)) return null;
      const rect = element.getBoundingClientRect();
      return Math.round((rect.left + rect.right) / 2);
    };
    return {
      surface: document.documentElement.dataset.kisatsutaiSurface || null,
      density: document.documentElement.dataset.kisatsutaiDensity || null,
      readingScrim: mainBeforeStyle ? {
        display: mainBeforeStyle.display,
        backgroundImage: mainBeforeStyle.backgroundImage.slice(0, 360),
        filter: mainBeforeStyle.filter,
        pointerEvents: mainBeforeStyle.pointerEvents,
        readingCore: getComputedStyle(main).getPropertyValue("--ki-main-reading-core").trim(),
        readingEdge: getComputedStyle(main).getPropertyValue("--ki-main-reading-edge").trim(),
        glassCount: document.querySelectorAll(".kisatsutai-conversation-glass").length,
      } : null,
      transcript: transcriptStyle ? {
        color: transcriptStyle.color,
        position: transcriptStyle.position,
        zIndex: transcriptStyle.zIndex,
      } : null,
      composerSurface: composerStyle && editorStyle ? {
        borderTopWidth: composerStyle.borderTopWidth,
        borderRadius: composerStyle.borderRadius,
        overflow: composerStyle.overflow,
        boxShadow: composerStyle.boxShadow,
        filter: composerStyle.filter,
        backdropFilter: composerStyle.backdropFilter,
        backgroundColor: composerStyle.backgroundColor,
        backgroundImage: composerStyle.backgroundImage.slice(0, 260),
        hasLocationImage: composerStyle.backgroundImage.includes("url("),
        nightCore: composerStyle.getPropertyValue("--ki-composer-night-core").trim(),
        locationLabel: composer.dataset.kisatsutaiLocationLabel || null,
        beforeDisplay: composerBeforeStyle?.display || null,
        beforeContent: composerBeforeStyle?.content || null,
        locationColor: composerBeforeStyle?.color || null,
        locationOpacity: composerBeforeStyle?.opacity || null,
        locationFontSize: composerBeforeStyle?.fontSize || null,
        editorBorderTopWidth: editorStyle.borderTopWidth,
        editorBorderRadius: editorStyle.borderRadius,
        editorBoxShadow: editorStyle.boxShadow,
        editorBackgroundColor: editorStyle.backgroundColor,
        editorBackgroundImage: editorStyle.backgroundImage,
      } : null,
      composerShell: composerShellStyle ? {
        markedCount: document.querySelectorAll('[data-kisatsutai-composer-shell="true"]').length,
        backgroundColor: composerShellStyle.backgroundColor,
        backgroundImage: composerShellStyle.backgroundImage,
        boxShadow: composerShellStyle.boxShadow,
        filter: composerShellStyle.filter,
        backdropFilter: composerShellStyle.backdropFilter,
        beforeBackgroundImage: composerShellBeforeStyle?.backgroundImage || null,
        beforeBoxShadow: composerShellBeforeStyle?.boxShadow || null,
        beforeFilter: composerShellBeforeStyle?.filter || null,
      } : null,
      composerFooter: composerFooterStyle && composerFooterBackdropStyle ? {
        markedCount: document.querySelectorAll(
          '[data-kisatsutai-composer-footer="true"]',
        ).length,
        backdropMarkedCount: document.querySelectorAll(
          '[data-kisatsutai-composer-footer-backdrop="true"]',
        ).length,
        contentMarkedAsBackdrop: composerFooterContent?.dataset
          .kisatsutaiComposerFooterBackdrop || null,
        backdropIsDirectSibling: composerFooterBackdrop?.parentElement === composerFooter,
        backgroundColor: composerFooterStyle.backgroundColor,
        backgroundImage: composerFooterStyle.backgroundImage,
        boxShadow: composerFooterStyle.boxShadow,
        filter: composerFooterStyle.filter,
        backdropOpacity: composerFooterBackdropStyle.opacity,
        backdropBackgroundColor: composerFooterBackdropStyle.backgroundColor,
        backdropBackgroundImage: composerFooterBackdropStyle.backgroundImage,
        backdropBoxShadow: composerFooterBackdropStyle.boxShadow,
        backdropFilter: composerFooterBackdropStyle.filter,
      } : null,
      labels: {
        newTask: document.querySelector("aside > button")?.textContent?.trim() || null,
        branch: document.querySelector("aside > button:nth-of-type(2)")?.textContent?.trim() || null,
        sidebarSearch: document.querySelector('aside input[type="search"]')?.getAttribute("placeholder") || null,
        composerPlaceholder: document.querySelector('[data-testid="composer"] textarea')?.getAttribute("placeholder") || null,
        sendAria: send?.getAttribute("aria-label") || null,
        sendTitle: send?.getAttribute("title"),
        headings,
        raven: document.querySelector(".kisatsutai-raven-copy b")?.textContent?.trim() || null,
        tool: tool?.textContent?.replace(/\s+/g, " ").trim() || null,
      },
      newTaskControl: {
        customVariant: newTask instanceof HTMLElement
          ? newTask.dataset.kisatsutaiNewTaskVariant || null
          : null,
        customAdornment: newTaskAfterStyle?.content || null,
      },
      nativeControls: {
        themedSend: send?.dataset.kisatsutaiAction || null,
        nichirin: document.querySelectorAll(".kisatsutai-nichirin-control").length,
        breathingDock: document.querySelectorAll(".kisatsutai-composer-breathing-dock").length,
        hostIconOpacity: hostIcon instanceof HTMLElement ? getComputedStyle(hostIcon).opacity : null,
        activeBreath: breathingDock?.querySelector('[aria-pressed="true"]')?.dataset.kisatsutaiBreath || null,
        dockBorderTopWidth: breathingDockStyle?.borderTopWidth || null,
        dockBackgroundColor: breathingDockStyle?.backgroundColor || null,
        dockBackgroundImage: breathingDockStyle?.backgroundImage || null,
        dockBoxShadow: breathingDockStyle?.boxShadow || null,
        sendWidth: sendStyle?.width || null,
        sendHeight: sendStyle?.height || null,
        toolMarked: tool?.hasAttribute("data-kisatsutai-tool") || false,
      },
      duelLayout: duel instanceof HTMLElement && versusStyle ? {
        count: document.querySelectorAll(".kisatsutai-strip-duel").length,
        childOrder: Array.from(duel.children).map((child) => child.className),
        ariaLabel: duel.getAttribute("aria-label"),
        versusText: versus?.textContent?.replace(/\s+/g, "").trim() || null,
        versusExtraText: versus?.querySelector("small")?.textContent?.trim() || null,
        duelBackgroundImage: duelStyle?.backgroundImage || null,
        alliesBackgroundColor: alliesStyle?.backgroundColor || null,
        alliesBackgroundImage: alliesStyle?.backgroundImage || null,
        opponentBackgroundColor: opponentStyle?.backgroundColor || null,
        opponentBackgroundImage: opponentStyle?.backgroundImage || null,
        difficultyBackgroundColor: opponentDifficultyStyle?.backgroundColor || null,
        difficultyBackgroundImage: opponentDifficultyStyle?.backgroundImage || null,
        versusBorderTopWidth: versusStyle.borderTopWidth,
        versusBackgroundImage: versusStyle.backgroundImage,
        versusFilter: versusStyle.filter,
        versusBeforeDisplay: versusBeforeStyle?.display || null,
        versusBeforeContent: versusBeforeStyle?.content || null,
        versusAfterDisplay: versusAfterStyle?.display || null,
        versusAfterContent: versusAfterStyle?.content || null,
        versusFontFamily: versusGlyphStyle?.fontFamily || null,
        teamAvatarCount: squad?.querySelectorAll(".kisatsutai-agent-avatar").length || 0,
        teamAvatarWidth: teamAvatarStyle?.width || null,
        teamAvatarHeight: teamAvatarStyle?.height || null,
        teamAvatarBackgroundSize: teamAvatarStyle?.backgroundSize || null,
        teamAvatarBackgroundPosition: teamAvatarStyle?.backgroundPosition || null,
        opponentPortraitWidth: opponentPortraitStyle?.width || null,
        opponentPortraitHeight: opponentPortraitStyle?.height || null,
        opponentDisplay: opponentPortraitStyle?.display || null,
        squadCountText: duel.querySelector(".kisatsutai-allies-count")?.textContent?.trim() || null,
        nameLines: (duel.querySelector(".kisatsutai-allies-names")?.textContent || "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        overflowCount: squad?.querySelectorAll(".kisatsutai-agent-overflow").length || 0,
        centers: {
          team: centerX(teamAvatar),
          alliesCopy: centerX(alliesCopy),
          versus: centerX(versus),
          opponentCopy: centerX(opponentCopy),
          opponent: centerX(opponentPortrait),
        },
      } : null,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
}

async function inspectSettingsAppearance(page) {
  return page.evaluate(() => {
    const parseColor = (value) => {
      const channels = String(value).match(/[\d.]+/g)?.map(Number) || [];
      return {
        r: channels[0] || 0,
        g: channels[1] || 0,
        b: channels[2] || 0,
        a: channels.length > 3 ? channels[3] : 1,
      };
    };
    const effectiveBackground = (element) => {
      let current = element;
      while (current instanceof HTMLElement) {
        const color = parseColor(getComputedStyle(current).backgroundColor);
        if (color.a >= 0.98) return color;
        current = current.parentElement;
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    };
    const luminance = ({ r, g, b }) => {
      const channel = (value) => {
        const normalized = value / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      return (0.2126 * channel(r)) + (0.7152 * channel(g)) + (0.0722 * channel(b));
    };
    const contrastFor = (element) => {
      if (!(element instanceof HTMLElement)) return 0;
      const foreground = parseColor(getComputedStyle(element).color);
      const background = effectiveBackground(element);
      const lighter = Math.max(luminance(foreground), luminance(background));
      const darker = Math.min(luminance(foreground), luminance(background));
      return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
    };
    const primary = document.querySelector(
      ".kisatsutai-native-settings-row > div > div:first-child",
    );
    const secondary = document.querySelector(
      ".kisatsutai-native-settings-row > div > div:last-child",
    );
    const select = document.querySelector(".kisatsutai-native-select");
    const reset = document.querySelector(".kisatsutai-native-reset");
    const card = document.querySelector(".kisatsutai-native-settings-card");
    return {
      pageBackground: getComputedStyle(document.body).backgroundColor,
      cardBackground: card ? getComputedStyle(card).backgroundColor : null,
      primaryColor: primary ? getComputedStyle(primary).color : null,
      secondaryColor: secondary ? getComputedStyle(secondary).color : null,
      selectColor: select ? getComputedStyle(select).color : null,
      resetColor: reset ? getComputedStyle(reset).color : null,
      primaryContrast: contrastFor(primary),
      secondaryContrast: contrastFor(secondary),
      selectContrast: contrastFor(select),
      resetContrast: contrastFor(reset),
    };
  });
}

async function inspectNativeOverlay(page, selector) {
  return page.evaluate((targetSelector) => {
    const overlay = document.querySelector(targetSelector);
    const portal = overlay?.closest("[data-host-overlay-portal]");
    const heading = overlay?.querySelector("h2");
    const body = overlay?.querySelector("p");
    const button = overlay?.querySelector("button");
    const mission = document.querySelector('[data-kisatsutai-mission-surface="true"]');
    return {
      found: overlay instanceof HTMLElement,
      nativeSurface: overlay instanceof HTMLElement
        ? overlay.dataset.kisatsutaiNativeSurface || null
        : null,
      portalNativeSurface: portal instanceof HTMLElement
        ? portal.dataset.kisatsutaiNativeSurface || null
        : null,
      backgroundColor: overlay instanceof HTMLElement
        ? getComputedStyle(overlay).backgroundColor
        : null,
      headingColor: heading instanceof HTMLElement ? getComputedStyle(heading).color : null,
      bodyColor: body instanceof HTMLElement ? getComputedStyle(body).color : null,
      buttonColor: button instanceof HTMLElement ? getComputedStyle(button).color : null,
      buttonBackgroundColor: button instanceof HTMLElement
        ? getComputedStyle(button).backgroundColor
        : null,
      editorBackgroundToken: overlay instanceof HTMLElement
        ? getComputedStyle(overlay).getPropertyValue("--color-token-editor-background").trim()
        : null,
      menuBackgroundToken: overlay instanceof HTMLElement
        ? getComputedStyle(overlay).getPropertyValue("--color-token-menu-background").trim()
        : null,
      focusBorderToken: overlay instanceof HTMLElement
        ? getComputedStyle(overlay).getPropertyValue("--color-token-focus-border").trim()
        : null,
      rootMenuBackgroundToken: getComputedStyle(document.documentElement)
        .getPropertyValue("--color-token-menu-background").trim(),
      rootDarkClass: document.documentElement.classList.contains("dark"),
      rootInlineColorOverrideCount: Array.from(document.documentElement.style)
        .filter((property) => property.startsWith("--color-")).length,
      missionMenuBackgroundToken: mission instanceof HTMLElement
        ? getComputedStyle(mission).getPropertyValue("--color-token-menu-background").trim()
        : null,
      inlineColorOverrideCount: overlay instanceof HTMLElement
        ? Array.from(overlay.style).filter((property) => property.startsWith("--color-")).length
        : null,
    };
  }, selector);
}

let browser;

(async () => {
  const { chromium } = loadPlaywright();
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CODEX_CHROMIUM_EXECUTABLE || undefined,
  });
  const harness = path.resolve(__dirname, "../preview/runtime-harness.html");
  const desktopScreenshot = path.resolve(__dirname, "../preview/runtime-qa-v0521.png");
  const readingScreenshot = path.resolve(__dirname, "../preview/conversation-scrim-v0521.png");
  const mobileScreenshot = path.resolve(__dirname, "../preview/conversation-scrim-mobile-v0521.png");
  const composerScreenshot = path.resolve(__dirname, "../preview/composer-surface-v0521.png");
  const composerFooterScreenshot = path.resolve(__dirname, "../preview/composer-footer-v0521.png");
  const singleDuelScreenshot = path.resolve(__dirname, "../preview/duel-single-v0521.png");
  const wideDuelScreenshot = path.resolve(__dirname, "../preview/duel-wide-v0521.png");
  const settingsScreenshot = path.resolve(__dirname, "../preview/native-settings-v0521.png");
  const nativeOverlayScreenshot = path.resolve(__dirname, "../preview/native-overlays-v0521.png");
  const artGalleryScreenshot = path.resolve(__dirname, "../preview/art-gallery-v0521.png");

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(pathToFileURL(harness).href, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const core = await inspectCore(page);
  const bigPizzaRuntime = await page.evaluate(() => ({
    version: window.__demonSlayerCodexThemeRuntime?.version || null,
    platform: window.__demonSlayerCodexThemeRuntime?.platform || null,
    canStop: typeof window.__demonSlayerCodexThemeRuntime?.stop === "function",
    canRestart: typeof window.__demonSlayerCodexThemeRuntime?.start === "function",
    canSetPreference: typeof window.__demonSlayerCodexThemeRuntime?.setPreference === "function",
  }));
  await page.locator('[data-testid="composer"] textarea').fill(
    "请把当前主题推送到 GitHub，并从远程仓库重新安装验证；这是一段用于检查长文本不会与任务地点标签重叠的输入。",
  );
  await page.waitForTimeout(80);
  const focusedComposer = await inspectCore(page);
  await page.locator('[data-kisatsutai-breath="flame"]').click();
  await page.locator("#composer-action").click();
  await page.waitForTimeout(80);
  const breathingInteraction = await page.evaluate(() => {
    const effect = document.querySelector(".kisatsutai-slash-effect");
    return {
      kicker: document.querySelectorAll(".kisatsutai-composer-kicker").length,
      rootTheme: document.documentElement.dataset.kisatsutaiTheme || null,
      rootBreathing: document.documentElement.dataset.kisatsutaiBreathingMode || null,
      activeBreath: document.querySelector('[data-kisatsutai-breath="flame"]')
        ?.getAttribute("aria-pressed") || null,
      effectBreath: effect?.dataset.breath || null,
      effectAction: effect?.dataset.action || null,
      submits: document.body.dataset.composerSubmits || null,
    };
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: desktopScreenshot, fullPage: true });
  await page.locator("[data-app-shell-main-content-layout]").screenshot({ path: readingScreenshot });
  await page.locator('[data-kisatsutai-composer="true"]').screenshot({ path: composerScreenshot });
  await page.locator('[data-thread-scroll-footer="true"]').screenshot({
    path: composerFooterScreenshot,
  });

  await page.evaluate(() => window.__demonSlayerCodexThemeRuntime.setPreference("motion", false));
  await page.waitForTimeout(260);
  const motionOffComposer = await inspectCore(page);
  await page.evaluate(() => window.__demonSlayerCodexThemeRuntime.setPreference("motion", true));
  await page.waitForTimeout(260);
  const motionRestoredComposer = await inspectCore(page);

  await page.evaluate(() => {
    const activeTask = document.querySelector(
      '[data-app-action-sidebar-thread-active="true"]',
    );
    activeTask?.setAttribute("data-subagent-count", "1");
    window.dispatchEvent(new Event("popstate"));
  });
  await page.waitForTimeout(320);
  const singleDuel = await inspectCore(page);
  await page.locator("#kisatsutai-mission-strip").screenshot({ path: singleDuelScreenshot });

  await page.evaluate(() => {
    delete document.body.dataset.kisatsutaiHarness;
    document.querySelector('[data-testid="composer"]')?.remove();
    const main = document.querySelector("main");
    if (main) main.innerHTML = '<h1>Settings</h1><p>Native feature content</p>';
  });
  await page.waitForTimeout(420);
  const nativePage = await page.evaluate(() => ({
    surface: document.documentElement.dataset.kisatsutaiSurface || null,
    strip: !!document.querySelector("#kisatsutai-mission-strip"),
    glassCount: document.querySelectorAll(".kisatsutai-conversation-glass").length,
    raven: !!document.querySelector(".kisatsutai-raven-status"),
    newTask: document.querySelector("aside > button")?.textContent?.trim() || null,
    headings: Array.from(document.querySelectorAll("section header button"))
      .map((button) => button.innerText?.replace(/\s+/g, " ").trim()),
  }));

  const quietPage = await browser.newPage({ viewport: { width: 1100, height: 760 } });
  await quietPage.goto(pathToFileURL(harness).href, { waitUntil: "load" });
  await quietPage.waitForTimeout(500);
  await quietPage.evaluate(() => window.__demonSlayerCodexThemeRuntime.setPreference("density", "quiet"));
  await quietPage.waitForTimeout(260);
  const quiet = await quietPage.evaluate(() => ({
    density: document.documentElement.dataset.kisatsutaiDensity || null,
    glassCount: document.querySelectorAll(".kisatsutai-conversation-glass").length,
    stripDisplay: getComputedStyle(document.querySelector("#kisatsutai-mission-strip")).display,
  }));

  const codexPlusPage = await browser.newPage({ viewport: { width: 1180, height: 780 } });
  await codexPlusPage.goto(pathToFileURL(harness).href, { waitUntil: "load" });
  await codexPlusPage.waitForTimeout(500);
  await codexPlusPage.evaluate(() => {
    const modal = document.createElement("section");
    modal.dataset.codexPlusTestModal = "true";
    modal.dataset.hostNativeOverlay = "true";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = [
      "<h2>Codex++ 用户脚本</h2>",
      "<p>管理、重载或停用已安装的用户脚本。</p>",
      '<button type="button">重新加载用户脚本</button>',
    ].join("");
    document.body.appendChild(modal);
  });
  await codexPlusPage.waitForTimeout(120);
  const codexPlusModal = await inspectNativeOverlay(
    codexPlusPage,
    "[data-codex-plus-test-modal]",
  );
  await codexPlusPage.locator("[data-codex-plus-test-modal]").screenshot({ path: settingsScreenshot });

  const overlayPage = await browser.newPage({ viewport: { width: 980, height: 620 } });
  await overlayPage.goto(pathToFileURL(harness).href, { waitUntil: "load" });
  await overlayPage.waitForTimeout(500);
  await overlayPage.evaluate(() => {
    const portal = document.createElement("div");
    portal.dataset.radixPortal = "true";
    portal.dataset.hostOverlayPortal = "true";
    Object.assign(portal.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483500",
      display: "grid",
      placeItems: "center",
      padding: "24px",
      background: "rgba(0, 0, 0, 0.42)",
    });
    const dialog = document.createElement("section");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "native-dialog-title");
    dialog.dataset.testid = "confirmation-dialog";
    dialog.dataset.hostNativeOverlay = "true";
    dialog.innerHTML = [
      '<h2 id="native-dialog-title">Remove project?</h2>',
      '<p>This removes the project from the app. Files and existing chats remain.</p>',
      '<button type="button" aria-label="Close dialog">Cancel</button>',
    ].join("");
    portal.appendChild(dialog);
    document.body.appendChild(portal);
  });
  await overlayPage.waitForTimeout(260);
  const nativeDialog = await inspectNativeOverlay(
    overlayPage,
    '[data-testid="confirmation-dialog"]',
  );
  await overlayPage.evaluate(() => {
    document.querySelector("[data-host-overlay-portal]")?.remove();
    const portal = document.createElement("div");
    portal.dataset.radixPortal = "true";
    portal.dataset.hostOverlayPortal = "true";
    Object.assign(portal.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483500",
      display: "grid",
      placeItems: "center",
      padding: "24px",
      background: "rgba(0, 0, 0, 0.42)",
    });
    const viewer = document.createElement("section");
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-modal", "true");
    viewer.setAttribute("aria-label", "Image preview");
    viewer.dataset.testid = "image-viewer-fullscreen";
    viewer.dataset.hostNativeOverlay = "true";
    viewer.innerHTML = [
      '<h2>Image preview</h2>',
      '<p>Original viewer controls remain readable.</p>',
      '<div data-host-native-viewer-toolbar>',
      '<a href="#download" aria-label="Download image" data-host-native-viewer-control>\u2193</a>',
      '<button type="button" aria-label="Close image preview" data-host-native-viewer-control>\u00d7</button>',
      '</div>',
    ].join("");
    portal.appendChild(viewer);
    document.body.appendChild(portal);
  });
  await overlayPage.waitForTimeout(260);
  await overlayPage.locator('[aria-label="Close image preview"]').hover();
  const nativeImageViewer = await inspectNativeOverlay(
    overlayPage,
    '[data-testid="image-viewer-fullscreen"]',
  );
  await overlayPage.screenshot({ path: nativeOverlayScreenshot, fullPage: true });

  const widePage = await browser.newPage({ viewport: { width: 2048, height: 420 } });
  await widePage.goto(pathToFileURL(harness).href, { waitUntil: "load" });
  await widePage.waitForTimeout(600);
  const wide = await inspectCore(widePage);
  await widePage.locator("#kisatsutai-mission-strip").screenshot({ path: wideDuelScreenshot });

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(pathToFileURL(harness).href, { waitUntil: "load" });
  await mobilePage.waitForTimeout(600);
  const mobile = await inspectCore(mobilePage);
  await mobilePage.screenshot({ path: mobileScreenshot, fullPage: true });

  const galleryPage = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const gallery = path.resolve(__dirname, "../preview/art-gallery.html");
  await galleryPage.goto(pathToFileURL(gallery).href, { waitUntil: "load" });
  await galleryPage.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map((item) => (
      item.complete
        ? Promise.resolve()
        : new Promise((resolve) => item.addEventListener("load", resolve, { once: true }))
    )));
  });
  await galleryPage.waitForTimeout(700);
  const galleryInventory = await galleryPage.evaluate(() => ({
    characters: document.querySelectorAll(".core-cast figure, .hashira-cast figure").length,
    hashira: document.querySelectorAll(".hashira-cast figure").length,
    opponents: document.querySelectorAll(".opponent-strip figure").length,
    locations: document.querySelectorAll(".location-grid figure").length,
    missions: document.querySelectorAll(".mission-ledger > div > span").length,
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
  }));
  await galleryPage.screenshot({ path: artGalleryScreenshot, fullPage: true });

  const failures = [];
  if (
    galleryInventory.characters !== 13
    || galleryInventory.hashira !== 9
    || galleryInventory.opponents !== 12
    || galleryInventory.locations !== 10
    || galleryInventory.missions !== 12
  ) failures.push(`art gallery inventory is incomplete: ${JSON.stringify(galleryInventory)}`);
  if (core.surface !== "mission" || core.density !== "immersive") {
    failures.push("core conversation did not enter the immersive mission surface");
  }
  if (
    !core.readingScrim
    || core.readingScrim.display === "none"
    || !core.readingScrim.backgroundImage.includes("linear-gradient")
    || core.readingScrim.pointerEvents !== "none"
    || !core.readingScrim.readingCore.includes("0.48")
    || !core.readingScrim.readingEdge.includes("0.2")
    || core.readingScrim.glassCount !== 0
  ) failures.push(`conversation scrim is not a soft background light field: ${JSON.stringify(core.readingScrim)}`);
  if (
    !core.composerSurface
    || core.composerSurface.borderTopWidth !== "0px"
    || core.composerSurface.borderRadius !== "22px"
    || core.composerSurface.overflow !== "hidden"
    || core.composerSurface.boxShadow !== "none"
    || core.composerSurface.filter !== "none"
    || core.composerSurface.backdropFilter !== "none"
    || !core.composerSurface.backgroundImage.includes("linear-gradient")
    || !core.composerSurface.hasLocationImage
    || Number(core.composerSurface.nightCore.match(/,\s*([0-9.]+)\)$/)?.[1] || 0) < 0.92
    || core.composerSurface.beforeDisplay !== "block"
    || !core.composerSurface.beforeContent?.includes("任务地点")
    || !core.composerSurface.locationLabel?.includes("任务地点")
    || !core.composerSurface.locationColor?.includes("0.82")
    || core.composerSurface.locationOpacity !== "1"
    || core.composerSurface.locationFontSize !== "10px"
    || core.composerSurface.editorBorderTopWidth !== "0px"
    || core.composerSurface.editorBorderRadius !== "14px"
    || core.composerSurface.editorBoxShadow !== "none"
    || core.composerSurface.editorBackgroundColor !== "rgba(0, 0, 0, 0)"
    || core.composerSurface.editorBackgroundImage !== "none"
  ) failures.push(`composer is not a single rounded, shadowless location surface: ${JSON.stringify(core.composerSurface)}`);
  if (
    !core.composerShell
    || core.composerShell.markedCount < 1
    || core.composerShell.backgroundColor !== "rgba(0, 0, 0, 0)"
    || core.composerShell.backgroundImage !== "none"
    || core.composerShell.boxShadow !== "none"
    || core.composerShell.filter !== "none"
    || core.composerShell.backdropFilter !== "none"
    || core.composerShell.beforeBackgroundImage !== "none"
    || core.composerShell.beforeBoxShadow !== "none"
    || core.composerShell.beforeFilter !== "none"
  ) failures.push(`composer host shell still leaks side shadow or gradient: ${JSON.stringify(core.composerShell)}`);
  if (
    !core.composerFooter
    || core.composerFooter.markedCount !== 1
    || core.composerFooter.backdropMarkedCount !== 1
    || core.composerFooter.contentMarkedAsBackdrop !== null
    || core.composerFooter.backdropIsDirectSibling !== true
    || core.composerFooter.backgroundColor !== "rgba(0, 0, 0, 0)"
    || core.composerFooter.backgroundImage !== "none"
    || core.composerFooter.boxShadow !== "none"
    || core.composerFooter.filter !== "none"
    || core.composerFooter.backdropOpacity !== "0"
    || core.composerFooter.backdropBackgroundColor !== "rgba(0, 0, 0, 0)"
    || core.composerFooter.backdropBackgroundImage !== "none"
    || core.composerFooter.backdropBoxShadow !== "none"
    || core.composerFooter.backdropFilter !== "none"
  ) failures.push(`global thread footer still paints a dark composer backdrop: ${JSON.stringify(core.composerFooter)}`);
  if (
    !focusedComposer.composerSurface
    || focusedComposer.composerSurface.beforeDisplay !== "none"
    || focusedComposer.composerSurface.beforeContent !== "none"
  ) failures.push(`location label still overlaps active composer text: ${JSON.stringify(focusedComposer.composerSurface)}`);
  const duelCenters = core.duelLayout?.centers;
  if (
    !core.duelLayout
    || core.duelLayout.count !== 1
    || core.duelLayout.childOrder.join("|")
      !== "kisatsutai-strip-allies|kisatsutai-versus-mark|kisatsutai-strip-opponent"
    || !core.duelLayout.ariaLabel?.includes("对决")
    || core.duelLayout.versusText !== "VS"
    || core.duelLayout.versusExtraText !== null
    || !core.duelLayout.duelBackgroundImage?.includes("linear-gradient")
    || core.duelLayout.alliesBackgroundColor !== "rgba(0, 0, 0, 0)"
    || core.duelLayout.alliesBackgroundImage !== "none"
    || core.duelLayout.opponentBackgroundColor !== "rgba(0, 0, 0, 0)"
    || core.duelLayout.opponentBackgroundImage !== "none"
    || core.duelLayout.difficultyBackgroundColor !== "rgba(0, 0, 0, 0)"
    || core.duelLayout.difficultyBackgroundImage !== "none"
    || core.duelLayout.versusBorderTopWidth !== "0px"
    || !core.duelLayout.versusBackgroundImage?.includes("linear-gradient")
    || core.duelLayout.versusFilter !== "none"
    || core.duelLayout.versusBeforeDisplay !== "none"
    || core.duelLayout.versusBeforeContent !== "none"
    || core.duelLayout.versusAfterDisplay !== "none"
    || core.duelLayout.versusAfterContent !== "none"
    || !core.duelLayout.versusFontFamily?.match(/Mincho|Songti|Serif/i)
    || core.duelLayout.teamAvatarCount !== 3
    || core.duelLayout.teamAvatarHeight !== "72px"
    || core.duelLayout.teamAvatarBackgroundSize !== "auto 116%"
    || core.duelLayout.opponentPortraitHeight !== "72px"
    || core.duelLayout.squadCountText !== "出战编成 / 06"
    || core.duelLayout.nameLines.length !== 3
    || core.duelLayout.overflowCount !== 0
    || !duelCenters
    || !(duelCenters.team < duelCenters.alliesCopy
      && duelCenters.alliesCopy < duelCenters.versus
      && duelCenters.versus < duelCenters.opponentCopy
      && duelCenters.opponentCopy < duelCenters.opponent)
  ) failures.push(`desktop duel did not preserve outer portraits, three-line roster, and centered borderless VS: ${JSON.stringify(core.duelLayout)}`);
  if (
    !wide.duelLayout
    || !wide.duelLayout.duelBackgroundImage?.includes("linear-gradient")
    || wide.duelLayout.alliesBackgroundImage !== "none"
    || wide.duelLayout.opponentBackgroundImage !== "none"
    || wide.duelLayout.difficultyBackgroundImage !== "none"
    || !wide.duelLayout.versusBackgroundImage?.includes("linear-gradient")
    || wide.horizontalOverflow
  ) failures.push(`wide duel did not merge both factions into one continuous center gradient: ${JSON.stringify(wide.duelLayout)}`);
  if (
    !singleDuel.duelLayout
    || singleDuel.duelLayout.teamAvatarCount !== 1
    || singleDuel.duelLayout.teamAvatarHeight !== "72px"
    || singleDuel.duelLayout.teamAvatarBackgroundSize !== "auto 116%"
    || singleDuel.duelLayout.versusBeforeDisplay !== "none"
    || singleDuel.duelLayout.versusAfterDisplay !== "none"
    || singleDuel.horizontalOverflow
  ) failures.push(`single-person duel did not keep a full-bleed portrait and text-only VS: ${JSON.stringify(singleDuel.duelLayout)}`);
  if (
    breathingInteraction.kicker !== 0
    || breathingInteraction.rootTheme !== "flame"
    || breathingInteraction.rootBreathing !== "flame"
    || breathingInteraction.activeBreath !== "true"
    || breathingInteraction.effectBreath !== "flame"
    || breathingInteraction.effectAction !== "send"
    || breathingInteraction.submits !== "1"
  ) {
    failures.push(`breathing selection did not drive exactly one matching send effect: ${JSON.stringify(breathingInteraction)}`);
  }
  if (core.labels.newTask !== "接取讨伐") failures.push("core new-task label was not retained");
  if (
    core.newTaskControl.customVariant !== null
    || !["none", "normal"].includes(core.newTaskControl.customAdornment)
  ) failures.push(`new-task control retained themed chrome: ${JSON.stringify(core.newTaskControl)}`);
  if (!core.labels.headings.artifacts?.includes("任务案卷")) failures.push("task dossier label was not retained");
  if (!core.labels.headings["tool-sources"]?.includes("渡鸦情报")) failures.push("raven intel label was not retained");
  if (!core.labels.headings["background-subagents"]?.includes("出战小队")) failures.push("squad label was not retained");
  if (core.labels.raven !== "渡鸦在线") failures.push("raven online status was not retained");
  if (
    core.labels.branch !== "Current branch"
    || core.labels.sidebarSearch !== "Search"
    || core.labels.composerPlaceholder !== "Ask anything"
    || core.labels.sendAria !== "Send"
    || core.labels.sendTitle !== null
    || core.labels.headings.environment !== "Environment"
    || core.labels.tool !== "Web search · 3 sources found"
  ) failures.push(`native labels were unexpectedly replaced: ${JSON.stringify(core.labels)}`);
  if (
    core.nativeControls.themedSend !== "send"
    || core.nativeControls.nichirin !== 1
    || core.nativeControls.breathingDock !== 1
    || core.nativeControls.hostIconOpacity !== "0"
    || core.nativeControls.activeBreath !== "water"
    || core.nativeControls.dockBorderTopWidth !== "0px"
    || core.nativeControls.dockBackgroundColor !== "rgba(0, 0, 0, 0)"
    || core.nativeControls.dockBackgroundImage !== "none"
    || core.nativeControls.dockBoxShadow !== "none"
    || core.nativeControls.sendWidth !== "32px"
    || core.nativeControls.sendHeight !== "32px"
    || core.nativeControls.toolMarked
  ) failures.push(`breathing controls are not mounted as a compact borderless send system: ${JSON.stringify(core.nativeControls)}`);
  if (
    motionOffComposer.nativeControls.themedSend !== null
    || motionOffComposer.nativeControls.nichirin !== 0
    || motionOffComposer.nativeControls.breathingDock !== 0
    || motionOffComposer.nativeControls.hostIconOpacity !== "1"
  ) failures.push(`motion-off did not restore the native send control: ${JSON.stringify(motionOffComposer.nativeControls)}`);
  if (
    motionRestoredComposer.nativeControls.themedSend !== "send"
    || motionRestoredComposer.nativeControls.nichirin !== 1
    || motionRestoredComposer.nativeControls.breathingDock !== 1
  ) failures.push(`re-enabling motion did not restore breathing controls: ${JSON.stringify(motionRestoredComposer.nativeControls)}`);
  if (core.horizontalOverflow) failures.push("desktop core page has horizontal overflow");
  if (
    nativePage.surface !== null
    || nativePage.strip
    || nativePage.glassCount !== 0
    || nativePage.raven
    || nativePage.newTask !== "New task"
    || nativePage.headings.join("|") !== "Outputs|Environment|Sources|Subagents"
  ) failures.push(`non-core page retained themed descriptions: ${JSON.stringify(nativePage)}`);
  if (quiet.density !== "quiet" || quiet.glassCount !== 0 || quiet.stripDisplay !== "none") {
    failures.push(`quiet mode did not remove immersive reading layers: ${JSON.stringify(quiet)}`);
  }
  if (
    bigPizzaRuntime.version !== "0.5.21"
    || bigPizzaRuntime.platform !== "BigPizzaV3/CodexPlusPlus user script"
    || !bigPizzaRuntime.canStop
    || !bigPizzaRuntime.canRestart
    || !bigPizzaRuntime.canSetPreference
  ) failures.push(`BigPizzaV3 runtime contract is incomplete: ${JSON.stringify(bigPizzaRuntime)}`);
  for (const [overlay, label] of [
    [codexPlusModal, "Codex++ user-script modal"],
    [nativeDialog, "confirmation dialog"],
    [nativeImageViewer, "image viewer"],
  ]) {
    if (
      !overlay.found
      || overlay.nativeSurface !== null
      || overlay.portalNativeSurface !== null
      || overlay.backgroundColor !== "rgb(255, 255, 255)"
      || overlay.headingColor !== "rgb(32, 33, 35)"
      || overlay.bodyColor !== "rgb(102, 107, 115)"
      || overlay.buttonColor !== "rgb(32, 33, 35)"
    ) failures.push(`${label} did not retain native host colors: ${JSON.stringify(overlay)}`);
  }
  if (
    nativeImageViewer.buttonBackgroundColor !== "rgb(238, 241, 244)"
    || nativeImageViewer.editorBackgroundToken !== "#ffffff"
    || nativeImageViewer.menuBackgroundToken !== "#eef1f4"
    || nativeImageViewer.focusBorderToken !== "#2f80ed"
    || nativeImageViewer.rootMenuBackgroundToken !== "#eef1f4"
    || nativeImageViewer.rootDarkClass
    || nativeImageViewer.rootInlineColorOverrideCount !== 0
    || nativeImageViewer.missionMenuBackgroundToken !== "rgba(49, 55, 47, 0.98)"
    || nativeImageViewer.inlineColorOverrideCount !== 0
  ) failures.push(
    `image viewer was not isolated from the conversation theme scope: ${JSON.stringify(nativeImageViewer)}`,
  );
  if (
    !mobile.readingScrim
    || mobile.readingScrim.glassCount !== 0
    || mobile.horizontalOverflow
  ) failures.push(`mobile reading scrim did not recompose safely: ${JSON.stringify(mobile.readingScrim)}`);
  if (
    !mobile.duelLayout
    || mobile.duelLayout.teamAvatarCount !== 3
    || mobile.duelLayout.overflowCount !== 0
    || mobile.duelLayout.teamAvatarHeight !== "64px"
    || mobile.duelLayout.opponentPortraitHeight !== "64px"
    || !(mobile.duelLayout.centers.team < mobile.duelLayout.centers.versus
      && mobile.duelLayout.centers.versus < mobile.duelLayout.centers.opponent)
  ) failures.push(`mobile duel did not keep equal-height portraits around VS: ${JSON.stringify(mobile.duelLayout)}`);

  if (failures.length) {
    throw new Error(failures.map((failure) => `- ${failure}`).join("\n"));
  }

  console.log(JSON.stringify({
    desktopScreenshot,
    readingScreenshot,
    mobileScreenshot,
    composerScreenshot,
    composerFooterScreenshot,
    singleDuelScreenshot,
    wideDuelScreenshot,
    settingsScreenshot,
    nativeOverlayScreenshot,
    artGalleryScreenshot,
    galleryInventory,
    bigPizzaRuntime,
    core,
    focusedComposerLabel: focusedComposer.composerSurface && {
      display: focusedComposer.composerSurface.beforeDisplay,
      content: focusedComposer.composerSurface.beforeContent,
    },
    breathingInteraction,
    motionOffComposer: motionOffComposer.nativeControls,
    motionRestoredComposer: motionRestoredComposer.nativeControls,
    singleDuel: singleDuel.duelLayout,
    wideDuel: wide.duelLayout,
    nativePage,
    quiet,
    codexPlusModal,
    nativeDialog,
    nativeImageViewer,
    mobileReadingScrim: mobile.readingScrim,
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await browser?.close();
});
