# Codex++ 交互链路笔记

## 它并不直接调用 GPT

Codex++ 的核心不是“做一个新的 ChatGPT 客户端”，也没有代理 OpenAI 账号或模型 API。它修改的是 Codex Desktop 的本地启动链路：

```text
Codex.app
  └─ app.asar 的 package.json#main 被改到一个极小 loader
       ├─ 先加载用户目录中的 Codex++ runtime/main.js
       └─ 无论 Codex++ 是否出错，都继续加载 Codex 原始 main

runtime/main.js
  ├─ 用 session API 追加自己的 preload（不替换 Codex 原 preload）
  ├─ 发现 tweaks 目录
  ├─ 启动 main-scope tweak
  └─ 提供 IPC、存储、窗口、CDP 和 native bridge

renderer preload
  ├─ 从 main 进程读取 tweak 源码字符串
  ├─ 在沙箱 preload 中用 CommonJS 形状执行
  ├─ 调用 start(api)
  ├─ 注入 Settings 页面
  └─ 热重载/关闭时调用 stop()
```

所以“跟 Codex/GPT 打交道”分成两层：

1. **公开稳定层**：Codex++ 的 `api.settings`、`api.storage`、`api.react.waitForElement`、IPC、窗口与 CDP 接口。
2. **宿主 UI 层**：tweak 通过 DOM、ARIA、`data-testid`、表单结构和 `MutationObserver` 感知 Codex 当前界面。Codex 的 React 并不是稳定依赖，fiber 工具只应作为最后手段。

## 为什么可以直接启动 Codex

b-nnett Codex++ 只在 `app.asar` 的主入口放入一个小型 loader。用户点击原来的 `ChatGPT.app` / `Codex.app` 时，loader 自动加载用户目录中的 runtime，再扫描 `~/Library/Application Support/codex-plusplus/tweaks/`。因此主题不需要独立启动器。

修改应用会破坏 OpenAI 的原始代码签名。安装器在 macOS 上固定使用 `install --local` / `repair --force --local`，让 Codex 主进程和 `app.asar.unpacked` 中的原生模块使用同一个稳定本地签名，避免 `better-sqlite3` 因 Team ID 不一致而无法加载。官方 Codex 更新后仍需由 b-nnett watcher 重新应用补丁。

## 本主题使用了什么

本主题的 manifest 明确声明：

```json
{
  "scope": "renderer",
  "permissions": ["settings"]
}
```

实际使用：

- `api.settings.registerPage()`：在 Settings 的 TWEAKS 分组注册队服设置页。
- `api.storage.get/set()`：保存主题开关、呼吸法、动效和氛围密度。
- `api.log`：记录启动和安全降级信息。
- DOM + `MutationObserver`：给输入区、任务链接、操作按钮和工具卡增加幂等标记。
- `data-app-action-sidebar-thread-id`：作为会话稳定键，让左栏编队、正文友方、对手和地点共享同一份 `SessionState`。
- 右侧 `background-subagents` section：在受限节点内只读 React props，以 `conversationId` 去重后推断真实小队人数；不可用时回退到可访问 DOM 信号和已缓存人数。
- 右侧 summary panel：保持原 section、按钮和文件行，只增加可恢复标题、地点简报与任务语义。
- 会话局部颜色作用域：Codex `--color-*` 只写在已标记的会话主容器、会话侧栏和会话摘要面板；不修改 `html` 的宿主主题 class 或根级颜色 token。
- 构建期角色与地点 data URI：十三张本地队员图、十二张对手图和十处动画地点写入 `index.js`，运行时不联网。

运行时没有使用：

- 网络请求（角色素材仅在本地构建时读取）；
- 对话内容上传；
- main-process IPC；
- 文件系统；
- CDP、原生窗口、Metal 或 helper process；
- React 私有状态修改；
- 原按钮事件替换。

## 为什么不拦截按钮

皮肤最危险的做法是 clone/replace 发送按钮后接管 click，因为 Codex 更新后很容易丢失内部状态、快捷键和焦点。这个主题只增加：

- CSS 视觉状态；
- `title` 提示；
- 可恢复的可见文案；
- 不接收指针事件的装饰节点；
- 独立的状态任务条。

点击、提交、审批和取消仍由 Codex 原控件完成。

## 兼容策略

匹配优先级：

1. 稳定 `data-testid`；
2. composer 主动作优先读取原生 `type="submit"`，运行态再读取 Send / Stop / Cancel / Interrupt 的 `aria-label`；
3. `aria-label` / `title` / `role`；
4. 输入框与按钮的表单邻接关系；
5. 受限范围内的可见文案；
6. 仅在已识别的 summary section 内读取只读 React props；
7. 找不到就跳过；绝不把 composer 的任意最后一个按钮当作发送键。

每个注入节点都有 `data-kisatsutai-injected`，每个被增强的宿主节点都有独立 `data-kisatsutai-*` 标记。`stop()` 会断开观察器、取消动画帧、移除监听和注入节点、恢复文案及 placeholder，并删除根主题属性。

非会话页面走无操作退路：运行时会先撤掉现有会话标记与文案，不再装饰其侧栏，也不扫描或修补对话框、图片查看器和其它 Portal。这样原生浮层不需要“恢复主题色”，因为它们从未继承会话局部 token。

## 设计边界

仅靠 renderer DOM 可以做出很好的“任务叙事皮肤”，但不能稳定、完整地读取 Codex 内部任务模型。当前的“追踪中 / 归队 / 受阻”由可访问状态区与停止按钮等公开 UI 信号推断。

小队人数采用同样的渐进增强策略：显式人数信号优先，其次读取已识别 `background-subagents` section 的只读 `backgroundAgents` props 并按会话去重，再统计稳定的 subagent 可访问节点，最后使用该会话缓存或回退为单人。任务文字只用于选择更贴合任务类型的角色编成，不用于伪造真实代理数量。

地点与编队不是挂在短命 DOM 节点上，而是由稳定 thread ID 派生：地点只抽取一次，队员先生成稳定顺序，人数增加时仅追加、不重排；切走再返回同一会话会恢复原状态。

若未来需要百分百准确的任务阶段、代理树或工具调用类型，应该新增一个版本适配层：

- 优先等待 Codex++ 暴露更高层的 task/thread lifecycle API；
- 或在明确版本范围内，用 `api.react.findOwnerByName()` 读取只读 props；
- 不应把 minified React fiber 路径硬编码进主题。
