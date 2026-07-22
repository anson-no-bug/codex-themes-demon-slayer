# BigPizzaV3 Codex++ 交互链路

## 加载方式

[BigPizzaV3/CodexPlusPlus](https://github.com/BigPizzaV3/CodexPlusPlus) 是独立启动器和管理工具，不修改 Codex Desktop 的 `app.asar`：

```text
Codex++.app
  ├─ 启动原版 Codex Desktop 并开放本机 CDP 调试端口
  ├─ 注入 Codex++ renderer 增强
  └─ 读取 ~/.config/Codex++/user_scripts/*.js
       └─ 在 Codex renderer 页面上下文直接执行主题脚本
```

管理工具维护用户脚本总开关、单脚本开关、重载状态和错误信息。脚本执行状态记录在 `window.__codexPlusUserScripts`；新发现的顶层 `.js` 默认启用。

## 本主题的运行时

`index.js` 是可直接执行的 BigPizzaV3 用户脚本，不需要 `manifest.json`、CommonJS 导出或旧版 CLI：

- `window.__demonSlayerCodexThemeRuntime` 提供版本、平台、启停和偏好切换状态。
- 重载脚本前先停止旧实例，断开观察器、移除监听和装饰节点，再启动新实例，避免重复注入。
- 偏好保存到 renderer 的 `localStorage`，不依赖 Codex++ 私有设置 API。
- DOM、ARIA、稳定 `data-*` 和 `MutationObserver` 用于识别会话、Composer、任务行和摘要区。
- 会话 thread id 派生稳定角色、地点、任务和对手；React 私有 fiber 不作为 BigPizza 运行时依赖。
- 所有角色、对手和地点素材在构建期嵌入 `index.js`，运行时不联网。

## 作用域和安全边界

主题颜色只写入已识别的会话主容器、会话侧栏、摘要面板和任务条。`html` 根节点不覆盖 Codex 的 `--color-*`，因此 Codex++ 管理弹窗、确认框、图片查看器和其它 Portal 不会继承会话黑色样式。

主题不替换原生发送、停止、附件、语音、审批或取消事件，只叠加视觉层和可恢复文案。找不到可靠目标时直接跳过；离开会话页时撤销主题标记和文案。

## 兼容顺序

1. 稳定 `data-testid` / `data-app-action-*`。
2. 原生按钮类型、ARIA、title 和 role。
3. Composer 与按钮的表单关系。
4. 受限范围内的可见文案与显式 subagent 数量。
5. 当前会话缓存。
6. 无可靠信号时不修改。

若 Codex 更新导致 DOM 变化，只更新识别层，不扩大到全局选择器，也不接管宿主事件。
