"use strict";

const { existsSync, readFileSync } = require("node:fs");
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

async function inspectLocationSwitch(page) {
  return page.evaluate(() => {
    const strip = document.querySelector("#kisatsutai-mission-strip");
    const dossier = document.querySelector(".kisatsutai-location-dossier");
    const button = dossier?.querySelector(".kisatsutai-location-switch");
    const style = button instanceof HTMLElement ? getComputedStyle(button) : null;
    const dossierAfter = dossier instanceof HTMLElement ? getComputedStyle(dossier, "::after") : null;
    return {
      session: strip?.dataset.session || null,
      location: strip?.dataset.location || null,
      dossierLocation: dossier?.dataset.location || null,
      name: dossier?.querySelector(".kisatsutai-location-dossier-name")?.textContent?.trim() || null,
      buttonText: button?.textContent?.replace(/\s+/g, "").trim() || null,
      ariaLabel: button?.getAttribute("aria-label") || null,
      title: button?.getAttribute("title") || null,
      state: button?.dataset.state || null,
      status: dossier?.querySelector(".kisatsutai-location-switch-status")?.textContent?.trim() || null,
      width: style?.width || null,
      height: style?.height || null,
      cursor: style?.cursor || null,
      decoration: dossierAfter ? {
        content: dossierAfter.content,
        display: dossierAfter.display,
        width: dossierAfter.width,
        backgroundColor: dossierAfter.backgroundColor,
      } : null,
    };
  });
}

async function inspectCore(page) {
  return page.evaluate(() => {
    const main = document.querySelector("[data-app-shell-main-content-layout]");
    const sidebar = document.querySelector('aside[data-kisatsutai-sidebar="true"]');
    const summaryPanel = document.querySelector('[data-kisatsutai-summary-panel="true"]');
    const transcript = document.querySelector("[data-host-conversation-transcript]");
    const composer = document.querySelector('[data-kisatsutai-composer="true"]');
    const composerShell = document.querySelector('[data-kisatsutai-composer-shell="true"]');
    const editor = composer?.querySelector("textarea, [contenteditable='true']");
    const send = document.querySelector("#composer-action");
    const tool = document.querySelector('[data-testid="tool-search"]');
    const titlebar = document.querySelector('[data-app-shell-header-edge-scroll="true"]');
    const titlebarThreadLabel = titlebar?.querySelector('[data-host-titlebar-thread-label]');
    const titlebarCodexTrigger = titlebar?.querySelector('[data-codex-plus-trigger-installed]');
    const newTask = document.querySelector("aside > button");
    const projectRow = document.querySelector("[data-app-action-sidebar-project-row]");
    const activeTaskRow = document.querySelector(
      '[data-app-action-sidebar-thread-row][data-app-action-sidebar-thread-active="true"]',
    );
    const inactiveTaskRow = document.querySelector(
      '[data-app-action-sidebar-thread-row]:not([data-app-action-sidebar-thread-active="true"])',
    );
    const sidebarSection = document.querySelector("[data-app-action-sidebar-section-toggle]");
    const emptyProject = document.querySelector("[data-host-empty-project]");
    const projectList = document.querySelector("[data-app-action-sidebar-project-list-id]");
    const newTaskAfterStyle = newTask instanceof HTMLElement
      ? getComputedStyle(newTask, "::after")
      : null;
    const titlebarStyle = titlebar instanceof HTMLElement ? getComputedStyle(titlebar) : null;
    const titlebarThreadLabelStyle = titlebarThreadLabel instanceof HTMLElement
      ? getComputedStyle(titlebarThreadLabel)
      : null;
    const titlebarCodexTriggerStyle = titlebarCodexTrigger instanceof HTMLElement
      ? getComputedStyle(titlebarCodexTrigger)
      : null;
    const sidebarPaint = (element) => {
      if (!(element instanceof HTMLElement)) return null;
      const style = getComputedStyle(element);
      return {
        color: style.color,
        backgroundImage: style.backgroundImage,
        boxShadow: style.boxShadow,
        textShadow: style.textShadow,
        opacity: style.opacity,
      };
    };
    const headings = Object.fromEntries(Array.from(document.querySelectorAll(
      "[data-kisatsutai-summary-section]",
    )).map((section) => [
      section.dataset.kisatsutaiSummarySection,
      section.querySelector("header button")?.innerText?.replace(/\s+/g, " ").trim() || "",
    ]));
    const mainBeforeStyle = main instanceof HTMLElement ? getComputedStyle(main, "::before") : null;
    const bodyBeforeStyle = getComputedStyle(document.body, "::before");
    const sidebarStyle = sidebar instanceof HTMLElement ? getComputedStyle(sidebar) : null;
    const summaryPanelStyle = summaryPanel instanceof HTMLElement
      ? getComputedStyle(summaryPanel)
      : null;
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
    const queuedPanel = composerFooter?.querySelector(
      '[data-kisatsutai-queued-panel="true"]',
    );
    const composerFooterStyle = composerFooter instanceof HTMLElement
      ? getComputedStyle(composerFooter)
      : null;
    const composerFooterBackdropStyle = composerFooterBackdrop instanceof HTMLElement
      ? getComputedStyle(composerFooterBackdrop)
      : null;
    const queuedPanelStyle = queuedPanel instanceof HTMLElement
      ? getComputedStyle(queuedPanel)
      : null;
    const editorStyle = editor instanceof HTMLElement ? getComputedStyle(editor) : null;
    const hostIcon = send?.firstElementChild;
    const breathingDock = composer?.querySelector(".kisatsutai-composer-breathing-dock");
    const breathingDockStyle = breathingDock instanceof HTMLElement
      ? getComputedStyle(breathingDock)
      : null;
    const sendStyle = send instanceof HTMLElement ? getComputedStyle(send) : null;
    const missionStrip = document.querySelector("#kisatsutai-mission-strip");
    const missionStripStyle = missionStrip instanceof HTMLElement ? getComputedStyle(missionStrip) : null;
    const missionCrest = missionStrip?.querySelector(".kisatsutai-strip-crest");
    const missionCrestStyle = missionCrest instanceof HTMLElement ? getComputedStyle(missionCrest) : null;
    const missionCrestBeforeStyle = missionCrest instanceof HTMLElement
      ? getComputedStyle(missionCrest, "::before")
      : null;
    const missionCrestAfterStyle = missionCrest instanceof HTMLElement
      ? getComputedStyle(missionCrest, "::after")
      : null;
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
      sharedScene: {
        backgroundImage: bodyBeforeStyle.backgroundImage.slice(0, 360),
        imageCount: (bodyBeforeStyle.backgroundImage.match(/url\(/g) || []).length,
        content: bodyBeforeStyle.content,
        display: bodyBeforeStyle.display,
        pointerEvents: bodyBeforeStyle.pointerEvents,
        position: bodyBeforeStyle.position,
        rootScene: document.documentElement.style.getPropertyValue("--ki-shared-scene"),
        rootPosition: document.documentElement.style.getPropertyValue("--ki-shared-scene-position"),
        localImages: {
          main: (mainBeforeStyle?.backgroundImage.match(/url\(/g) || []).length,
          sidebar: (sidebarStyle?.backgroundImage.match(/url\(/g) || []).length,
          composer: (composerStyle?.backgroundImage.match(/url\(/g) || []).length,
          summary: (summaryPanelStyle?.backgroundImage.match(/url\(/g) || []).length,
        },
      },
      titlebarReadability: titlebarStyle ? {
        backgroundImage: titlebarStyle.backgroundImage,
        color: titlebarStyle.color,
        threadColor: titlebarThreadLabelStyle?.color || null,
        codexTriggerColor: titlebarCodexTriggerStyle?.color || null,
        codexTriggerBackground: titlebarCodexTriggerStyle?.backgroundColor || null,
      } : null,
      sidebarHierarchy: {
        project: sidebarPaint(projectRow),
        activeTask: sidebarPaint(activeTaskRow),
        inactiveTask: sidebarPaint(inactiveTaskRow),
        section: sidebarPaint(sidebarSection),
        emptyProject: sidebarPaint(emptyProject),
        projectGuide: projectList instanceof HTMLElement ? (() => {
          const style = getComputedStyle(projectList, "::before");
          return {
            backgroundImage: style.backgroundImage,
            width: style.width,
          };
        })() : null,
      },
      missionStripLayout: missionStripStyle && main instanceof HTMLElement ? (() => {
        const stripRect = missionStrip.getBoundingClientRect();
        const mainRect = main.getBoundingClientRect();
        const nativePicker = document.querySelector("[data-host-native-titlebar-picker]");
        const nativePickerRect = nativePicker instanceof HTMLElement
          ? nativePicker.getBoundingClientRect()
          : null;
        return {
          containerWidth: Math.round(mainRect.width),
          marginTop: missionStripStyle.marginTop,
          topInset: Math.round(stripRect.top - mainRect.top),
          top: Math.round(stripRect.top),
          toolbarClearance: missionStrip.dataset.kisatsutaiToolbarClearance === "true",
          nativePickerOverlap: nativePickerRect ? !(
            stripRect.right <= nativePickerRect.left
            || stripRect.left >= nativePickerRect.right
            || stripRect.bottom <= nativePickerRect.top
            || stripRect.top >= nativePickerRect.bottom
          ) : null,
        };
      })() : null,
      missionCrest: missionCrestStyle ? {
        beforeContent: missionCrestBeforeStyle?.content || null,
        beforeFontFamily: missionCrestBeforeStyle?.fontFamily || null,
        backgroundImage: missionCrestStyle.backgroundImage,
        borderRadius: missionCrestStyle.borderRadius,
        afterBorderRadius: missionCrestAfterStyle?.borderRadius || null,
        afterTransform: missionCrestAfterStyle?.transform || null,
      } : null,
      readingScrim: mainBeforeStyle ? {
        display: mainBeforeStyle.display,
        backgroundImage: mainBeforeStyle.backgroundImage.slice(0, 360),
        hasLocationImage: mainBeforeStyle.backgroundImage.includes("url("),
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
        queuedPanelMarkedCount: document.querySelectorAll(
          '[data-kisatsutai-queued-panel="true"]',
        ).length,
        queuedPanelBorderTopWidth: queuedPanelStyle?.borderTopWidth || null,
        queuedPanelBorderLeftWidth: queuedPanelStyle?.borderLeftWidth || null,
        queuedPanelBorderRadius: queuedPanelStyle?.borderRadius || null,
        queuedPanelBackgroundImage: queuedPanelStyle?.backgroundImage || null,
        queuedPanelBoxShadow: queuedPanelStyle?.boxShadow || null,
        queuedPanelBackdropFilter: queuedPanelStyle?.backdropFilter || null,
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
    executablePath: resolveBrowserExecutable(),
  });
  const harness = path.resolve(__dirname, "../preview/runtime-harness.html");
  const manifest = JSON.parse(readFileSync(path.resolve(__dirname, "../manifest.json"), "utf8"));
  const screenshotTag = `v${manifest.version.replace(/\D/g, "")}`;
  const screenshotPath = (name) => path.resolve(__dirname, `../preview/${name}-${screenshotTag}.png`);
  const desktopScreenshot = screenshotPath("runtime-qa");
  const readingScreenshot = screenshotPath("conversation-scrim");
  const mobileScreenshot = screenshotPath("conversation-scrim-mobile");
  const composerScreenshot = screenshotPath("composer-surface");
  const composerFooterScreenshot = screenshotPath("composer-footer");
  const singleDuelScreenshot = screenshotPath("duel-single");
  const wideDuelScreenshot = screenshotPath("duel-wide");
  const settingsScreenshot = screenshotPath("native-settings");
  const nativeOverlayScreenshot = screenshotPath("native-overlays");
  const artGalleryScreenshot = screenshotPath("art-gallery");

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(pathToFileURL(harness).href, { waitUntil: "load" });
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const aside = document.querySelector("aside");
    const firstProject = document.querySelector("[data-app-action-sidebar-project-row]");
    if (!(aside instanceof HTMLElement) || !(firstProject instanceof HTMLElement)) return;

    const section = document.createElement("button");
    section.type = "button";
    section.dataset.appActionSidebarSectionToggle = "";
    section.textContent = "Projects";
    firstProject.before(section);

    const list = document.createElement("div");
    list.dataset.appActionSidebarProjectListId = "runtime-empty-project";
    const empty = document.createElement("div");
    empty.dataset.hostEmptyProject = "true";
    empty.className = "text-token-description-foreground opacity-50 px-8 py-1 text-base";
    empty.textContent = "No chats";
    list.appendChild(empty);
    firstProject.after(list);
  });
  await page.waitForTimeout(80);
  const core = await inspectCore(page);
  const locationSwitchInitial = await inspectLocationSwitch(page);
  await page.locator(".kisatsutai-location-switch").click();
  await page.waitForTimeout(120);
  const locationSwitchChanged = await inspectLocationSwitch(page);
  await page.locator('[data-app-action-sidebar-thread-id="test-task-2"]').click();
  await page.waitForTimeout(160);
  const locationSwitchOtherInitial = await inspectLocationSwitch(page);
  await page.locator(".kisatsutai-location-switch").click();
  await page.waitForTimeout(120);
  const locationSwitchOtherChanged = await inspectLocationSwitch(page);
  await page.locator('[data-app-action-sidebar-thread-id="test-task"]').click();
  await page.waitForTimeout(160);
  const locationSwitchRestored = await inspectLocationSwitch(page);
  await page.locator("#restart-tweak").click();
  await page.waitForTimeout(420);
  const locationSwitchRestarted = await inspectLocationSwitch(page);
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

  await page.locator('[aria-label="启用状态动效"]').click();
  await page.waitForTimeout(260);
  const motionOffComposer = await inspectCore(page);
  await page.locator('[aria-label="启用状态动效"]').click();
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
  await quietPage.selectOption('[aria-label="选择界面氛围"]', "quiet");
  await quietPage.waitForTimeout(260);
  const quiet = await quietPage.evaluate(() => ({
    density: document.documentElement.dataset.kisatsutaiDensity || null,
    glassCount: document.querySelectorAll(".kisatsutai-conversation-glass").length,
    stripDisplay: getComputedStyle(document.querySelector("#kisatsutai-mission-strip")).display,
    sharedSceneDisplay: getComputedStyle(document.body, "::before").display,
    sharedSceneImageCount: (
      getComputedStyle(document.body, "::before").backgroundImage.match(/url\(/g) || []
    ).length,
  }));

  const settingsPage = await browser.newPage({ viewport: { width: 1180, height: 780 } });
  await settingsPage.goto(pathToFileURL(harness).href, { waitUntil: "load" });
  await settingsPage.waitForTimeout(500);
  await settingsPage.evaluate(() => {
    const group = document.createElement("div");
    group.dataset.codexpp = "pages-group";
    const heading = document.createElement("div");
    heading.textContent = "Tweaks";
    const pageButton = document.createElement("button");
    pageButton.type = "button";
    pageButton.dataset.codexpp = "nav-page-dev.local.demon-slayer-codex-theme:uniform";
    pageButton.textContent = "鬼杀队任务中枢";
    group.append(heading, pageButton);
    document.body.prepend(group);
    document.documentElement.dataset.codexppSettingsSurface = "true";
    window.__codexppSettingsSurfaceVisible = true;
    window.dispatchEvent(new CustomEvent("codexpp:settings-surface", {
      detail: { visible: true, reason: "runtime-qa" },
    }));
  });
  await settingsPage.waitForTimeout(360);
  const nativeSettings = await settingsPage.evaluate(() => ({
    theme: document.documentElement.dataset.kisatsutaiTheme || null,
    surface: document.documentElement.dataset.kisatsutaiSurface || null,
    ownPageShortcutHidden: document.querySelector(
      '[data-codexpp="nav-page-dev.local.demon-slayer-codex-theme:uniform"]',
    )?.hidden || false,
    pagesGroupHidden: document.querySelector('[data-codexpp="pages-group"]')?.hidden || false,
    missionStrip: !!document.querySelector("#kisatsutai-mission-strip"),
    raven: !!document.querySelector(".kisatsutai-raven-status"),
    customDecorations: document.querySelectorAll(
      '[data-kisatsutai-injected="true"]:not(style)',
    ).length,
    settingsRows: document.querySelectorAll(".kisatsutai-native-settings-row").length,
    hasLegacyEnableSwitch: !!document.querySelector('[aria-label="启用鬼杀队主题"]'),
  }));
  const lightSettingsAppearance = await inspectSettingsAppearance(settingsPage);
  await settingsPage.locator("#settings-root").screenshot({ path: settingsScreenshot });
  await settingsPage.evaluate(() => {
    const darkHostTokens = {
      "--color-background": "#101214",
      "--color-background-primary": "#101214",
      "--color-background-surface": "#15191d",
      "--color-background-secondary": "#12161a",
      "--color-token-bg-primary": "#15191d",
      "--color-token-side-bar-background": "#12161a",
      "--color-token-input-background": "#181c20",
      "--color-token-text-primary": "#e7eaee",
      "--color-token-text-secondary": "#a8b0b8",
      "--color-token-conversation-body": "#e7eaee",
      "--color-text-foreground": "#e7eaee",
      "--color-text-foreground-secondary": "#a8b0b8",
      "--color-token-button-foreground": "#e7eaee",
      "--color-token-foreground": "#e7eaee",
      "--color-token-border": "#394049",
      "--color-token-border-light": "#394049",
    };
    for (const [name, value] of Object.entries(darkHostTokens)) {
      document.documentElement.style.setProperty(name, value);
    }
  });
  await settingsPage.waitForTimeout(80);
  const darkSettingsAppearance = await inspectSettingsAppearance(settingsPage);
  await settingsPage.evaluate(() => {
    document.documentElement.dataset.codexppSettingsSurface = "false";
    window.__codexppSettingsSurfaceVisible = false;
    window.dispatchEvent(new CustomEvent("codexpp:settings-surface", {
      detail: { visible: false, reason: "runtime-qa" },
    }));
  });
  await settingsPage.waitForTimeout(360);
  const missionRestoredAfterSettings = await settingsPage.evaluate(() => ({
    theme: document.documentElement.dataset.kisatsutaiTheme || null,
    surface: document.documentElement.dataset.kisatsutaiSurface || null,
    missionStrip: !!document.querySelector("#kisatsutai-mission-strip"),
  }));

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

  const titlebarPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await titlebarPage.goto(pathToFileURL(harness).href, { waitUntil: "load" });
  await titlebarPage.waitForTimeout(500);
  await titlebarPage.evaluate(() => {
    const main = document.querySelector("[data-app-shell-main-content-layout]");
    if (!(main instanceof HTMLElement)) return;
    main.style.top = "-107px";
    const picker = document.createElement("button");
    picker.type = "button";
    picker.dataset.hostNativeTitlebarPicker = "true";
    picker.style.cssText = [
      "position: fixed",
      "z-index: 999",
      "top: 22px",
      "right: 335px",
      "width: 105px",
      "height: 56px",
    ].join(";");
    document.body.append(picker);
    window.dispatchEvent(new Event("resize"));
  });
  await titlebarPage.waitForTimeout(320);
  const titlebarCollision = await inspectCore(titlebarPage);

  const missionFramePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await missionFramePage.goto(pathToFileURL(harness).href, { waitUntil: "load" });
  await missionFramePage.waitForTimeout(500);
  await missionFramePage.evaluate(() => {
    const surface = document.querySelector("[data-app-shell-main-content-layout]");
    if (!(surface instanceof HTMLElement) || !(surface.parentElement instanceof HTMLElement)) return;
    const frame = document.createElement("div");
    frame.setAttribute("role", "main");
    frame.dataset.hostNativeMainFrame = "true";
    frame.style.backgroundColor = "rgb(255, 255, 255)";
    surface.parentElement.insertBefore(frame, surface);
    frame.appendChild(surface);
  });
  await missionFramePage.waitForTimeout(360);
  const missionFrameActive = await missionFramePage.evaluate(() => {
    const frame = document.querySelector("[data-host-native-main-frame]");
    return frame instanceof HTMLElement ? {
      marked: frame.dataset.kisatsutaiMissionFrame || null,
      backgroundColor: getComputedStyle(frame).backgroundColor,
    } : null;
  });
  await missionFramePage.evaluate(() => {
    delete document.body.dataset.kisatsutaiHarness;
    document.querySelector('[data-testid="composer"]')?.remove();
    const surface = document.querySelector("[data-app-shell-main-content-layout]");
    if (surface) surface.innerHTML = "<h1>Settings</h1><p>Native feature content</p>";
  });
  await missionFramePage.waitForTimeout(420);
  const missionFrameNative = await missionFramePage.evaluate(() => {
    const frame = document.querySelector("[data-host-native-main-frame]");
    return frame instanceof HTMLElement ? {
      marked: frame.dataset.kisatsutaiMissionFrame || null,
      backgroundColor: getComputedStyle(frame).backgroundColor,
    } : null;
  });

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
    || galleryInventory.locations !== 19
    || galleryInventory.missions !== 12
  ) failures.push(`art gallery inventory is incomplete: ${JSON.stringify(galleryInventory)}`);
  if (core.surface !== "mission" || core.density !== "immersive") {
    failures.push("core conversation did not enter the immersive mission surface");
  }
  if (
    core.sharedScene.imageCount !== 1
    || core.sharedScene.content === "none"
    || core.sharedScene.display === "none"
    || core.sharedScene.pointerEvents !== "none"
    || core.sharedScene.position !== "fixed"
    || !core.sharedScene.rootScene.includes("--ki-location-")
    || !core.sharedScene.rootPosition
    || Object.values(core.sharedScene.localImages).some((count) => count !== 0)
  ) failures.push(`mission modules do not share one stitched viewport scene: ${JSON.stringify(core.sharedScene)}`);
  if (
    !core.titlebarReadability
    || !core.titlebarReadability.backgroundImage.includes("linear-gradient")
    || core.titlebarReadability.threadColor !== "rgb(231, 235, 230)"
    || core.titlebarReadability.codexTriggerColor !== "rgb(231, 235, 230)"
    || core.titlebarReadability.codexTriggerBackground === "rgba(0, 0, 0, 0)"
  ) failures.push(`native titlebar remained unreadable on the shared scene: ${JSON.stringify(core.titlebarReadability)}`);
  if (
    !core.sidebarHierarchy.project
    || core.sidebarHierarchy.project.backgroundImage !== "none"
    || core.sidebarHierarchy.project.color !== "rgb(237, 241, 237)"
    || core.sidebarHierarchy.project.boxShadow !== "none"
  ) failures.push(`project headings still looked like selected cards: ${JSON.stringify(core.sidebarHierarchy.project)}`);
  if (
    !core.sidebarHierarchy.inactiveTask
    || !core.sidebarHierarchy.inactiveTask.backgroundImage.includes("rgba(34, 43, 36, 0.58)")
    || !core.sidebarHierarchy.activeTask?.backgroundImage.includes("rgba(61, 94, 72, 0.9)")
    || !core.sidebarHierarchy.projectGuide?.backgroundImage.includes("rgba(213, 181, 108, 0.26)")
    || core.sidebarHierarchy.projectGuide.width !== "1px"
  ) failures.push(`task rows did not retain distinct inactive and active levels: ${JSON.stringify(core.sidebarHierarchy)}`);
  if (
    !core.sidebarHierarchy.emptyProject
    || core.sidebarHierarchy.emptyProject.color !== "rgb(194, 193, 183)"
    || core.sidebarHierarchy.emptyProject.opacity !== "0.78"
    || core.sidebarHierarchy.project.textShadow.includes("0.94")
  ) failures.push(`sidebar secondary copy remained muddy or over-shadowed: ${JSON.stringify(core.sidebarHierarchy)}`);
  if (
    !core.readingScrim
    || core.readingScrim.display === "none"
    || !core.readingScrim.backgroundImage.includes("linear-gradient")
    || core.readingScrim.hasLocationImage
    || core.readingScrim.pointerEvents !== "none"
    || !(
      core.readingScrim.readingCore.includes("0.48")
      || core.readingScrim.readingCore.includes("0.34")
    )
    || !(
      core.readingScrim.readingEdge.includes("0.2")
      || core.readingScrim.readingEdge.includes("0.12")
    )
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
    || core.composerSurface.hasLocationImage
    || Number(core.composerSurface.nightCore.match(/,\s*([0-9.]+)\)$/)?.[1] || 0) < 0.80
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
  ) failures.push(`composer is not a shadowless reading overlay on the shared scene: ${JSON.stringify(core.composerSurface)}`);
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
    || core.composerFooter.queuedPanelMarkedCount !== 1
    || core.composerFooter.queuedPanelBorderTopWidth !== "0px"
    || core.composerFooter.queuedPanelBorderLeftWidth !== "0px"
    || core.composerFooter.queuedPanelBorderRadius !== "0px"
    || !core.composerFooter.queuedPanelBackgroundImage.includes("rgba(13, 15, 13, 0.42)")
    || core.composerFooter.queuedPanelBoxShadow !== "none"
    || !core.composerFooter.queuedPanelBackdropFilter.includes("blur(8px)")
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
  if (!core.labels.headings.environment?.includes("任务案卷")) failures.push("environment dossier label was not localized");
  if (!core.labels.headings["tool-sources"]?.includes("渡鸦情报")) failures.push("raven intel label was not retained");
  if (!core.labels.headings["background-subagents"]?.includes("出战小队")) failures.push("squad label was not retained");
  if (core.labels.raven !== "渡鸦在线") failures.push("raven online status was not retained");
  if (
    !locationSwitchInitial.location
    || locationSwitchInitial.location !== locationSwitchInitial.dossierLocation
    || locationSwitchInitial.buttonText !== "换景"
    || !locationSwitchInitial.ariaLabel?.includes(locationSwitchInitial.name)
    || locationSwitchInitial.title !== locationSwitchInitial.ariaLabel
    || Number.parseFloat(locationSwitchInitial.width) < 46
    || locationSwitchInitial.height !== "32px"
    || locationSwitchInitial.cursor !== "pointer"
    || !locationSwitchInitial.decoration
    || locationSwitchInitial.decoration.content !== "none"
  ) failures.push(`location switch was not a stable accessible utility: ${JSON.stringify(locationSwitchInitial)}`);
  if (
    locationSwitchChanged.location === locationSwitchInitial.location
    || locationSwitchChanged.location !== locationSwitchChanged.dossierLocation
    || !locationSwitchChanged.status?.includes(locationSwitchChanged.name)
    || locationSwitchChanged.state !== "changed"
  ) failures.push(`location switch did not change the active session background: ${JSON.stringify({ locationSwitchInitial, locationSwitchChanged })}`);
  if (
    locationSwitchOtherInitial.session === locationSwitchInitial.session
    || locationSwitchOtherInitial.status !== null
    || locationSwitchOtherChanged.location === locationSwitchOtherInitial.location
    || locationSwitchRestored.session !== locationSwitchInitial.session
    || locationSwitchRestored.location !== locationSwitchChanged.location
    || locationSwitchRestored.status !== null
  ) failures.push(`location switch leaked across session boundaries: ${JSON.stringify({ locationSwitchOtherInitial, locationSwitchOtherChanged, locationSwitchRestored })}`);
  if (
    locationSwitchRestarted.session !== locationSwitchChanged.session
    || locationSwitchRestarted.location !== locationSwitchChanged.location
  ) failures.push(`location switch was not restored from session storage: ${JSON.stringify({ locationSwitchChanged, locationSwitchRestarted })}`);
  if (
    core.labels.branch !== "Current branch"
    || core.labels.sidebarSearch !== "Search"
    || core.labels.composerPlaceholder !== "Ask anything"
    || core.labels.sendAria !== "Send"
    || core.labels.sendTitle !== null
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
    !core.missionStripLayout
    || core.missionStripLayout.toolbarClearance
    || core.missionStripLayout.marginTop !== "56px"
  ) failures.push(`ordinary embedded mission strip retained unnecessary titlebar clearance: ${JSON.stringify(core.missionStripLayout)}`);
  if (
    !core.missionCrest
    || !core.missionCrest.beforeContent?.includes("滅")
    || !core.missionCrest.beforeFontFamily?.includes("Mincho")
    || core.missionCrest.backgroundImage.includes("transparent 45%")
    || core.missionCrest.borderRadius !== "50%"
    || core.missionCrest.afterBorderRadius !== "50%"
    || core.missionCrest.afterTransform !== "none"
  ) failures.push(`mission crest did not retain the transformed corps emblem: ${JSON.stringify(core.missionCrest)}`);
  if (
    !wide.missionStripLayout
    || wide.missionStripLayout.containerWidth <= 1100
    || wide.missionStripLayout.toolbarClearance
    || wide.missionStripLayout.marginTop !== "56px"
  ) failures.push(`wide mission strip retained unnecessary titlebar clearance: ${JSON.stringify(wide.missionStripLayout)}`);
  if (
    !titlebarCollision.missionStripLayout
    || titlebarCollision.missionStripLayout.containerWidth > 1100
    || !titlebarCollision.missionStripLayout.toolbarClearance
    || parseFloat(titlebarCollision.missionStripLayout.marginTop) < 128
    || titlebarCollision.missionStripLayout.top < 80
    || titlebarCollision.missionStripLayout.nativePickerOverlap
  ) failures.push(`narrow mission strip did not clear the native titlebar picker: ${JSON.stringify(titlebarCollision.missionStripLayout)}`);
  if (
    !missionFrameActive
    || missionFrameActive.marked !== "true"
    || missionFrameActive.backgroundColor !== "rgba(0, 0, 0, 0)"
  ) failures.push(`native mission frame did not expose the shared scene: ${JSON.stringify(missionFrameActive)}`);
  if (
    !missionFrameNative
    || missionFrameNative.marked !== null
    || missionFrameNative.backgroundColor !== "rgb(255, 255, 255)"
  ) failures.push(`native frame did not restore after leaving the mission surface: ${JSON.stringify(missionFrameNative)}`);
  if (
    nativePage.surface !== null
    || nativePage.strip
    || nativePage.glassCount !== 0
    || nativePage.raven
    || nativePage.newTask !== "New task"
    || nativePage.headings.join("|") !== "Outputs|Environment|Sources|Subagents"
  ) failures.push(`non-core page retained themed descriptions: ${JSON.stringify(nativePage)}`);
  if (
    quiet.density !== "quiet"
    || quiet.glassCount !== 0
    || quiet.stripDisplay !== "none"
    || quiet.sharedSceneDisplay !== "none"
  ) {
    failures.push(`quiet mode did not remove immersive reading layers: ${JSON.stringify(quiet)}`);
  }
  if (
    nativeSettings.theme !== null
    || nativeSettings.surface !== null
    || !nativeSettings.ownPageShortcutHidden
    || !nativeSettings.pagesGroupHidden
    || nativeSettings.missionStrip
    || nativeSettings.raven
    || nativeSettings.customDecorations !== 0
    || nativeSettings.settingsRows !== 3
    || nativeSettings.hasLegacyEnableSwitch
  ) failures.push(`settings did not return fully to the native Codex surface: ${JSON.stringify(nativeSettings)}`);
  for (const [appearance, state] of [
    [lightSettingsAppearance, "light"],
    [darkSettingsAppearance, "dark"],
  ]) {
    const minimumContrast = Math.min(
      appearance.primaryContrast,
      appearance.secondaryContrast,
      appearance.selectContrast,
      appearance.resetContrast,
    );
    if (minimumContrast < 4.5) {
      failures.push(`${state} settings contrast fell below 4.5:1: ${JSON.stringify(appearance)}`);
    }
  }
  if (
    missionRestoredAfterSettings.surface !== "mission"
    || !missionRestoredAfterSettings.theme
    || !missionRestoredAfterSettings.missionStrip
  ) failures.push(`mission theme did not recover after leaving settings: ${JSON.stringify(missionRestoredAfterSettings)}`);
  for (const [overlay, label] of [
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
    core,
    locationSwitch: {
      initial: locationSwitchInitial,
      changed: locationSwitchChanged,
      otherSessionInitial: locationSwitchOtherInitial,
      otherSessionChanged: locationSwitchOtherChanged,
      restored: locationSwitchRestored,
      restarted: locationSwitchRestarted,
    },
    focusedComposerLabel: focusedComposer.composerSurface && {
      display: focusedComposer.composerSurface.beforeDisplay,
      content: focusedComposer.composerSurface.beforeContent,
    },
    breathingInteraction,
    motionOffComposer: motionOffComposer.nativeControls,
    motionRestoredComposer: motionRestoredComposer.nativeControls,
    singleDuel: singleDuel.duelLayout,
    wideDuel: wide.duelLayout,
    titlebarCollision: titlebarCollision.missionStripLayout,
    missionFrameActive,
    missionFrameNative,
    nativePage,
    quiet,
    nativeSettings,
    lightSettingsAppearance,
    darkSettingsAppearance,
    missionRestoredAfterSettings,
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
