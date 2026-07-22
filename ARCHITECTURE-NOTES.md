# Codex++ 交互链路笔记

## 当前方案：外部启动与 CDP 注入

本主题使用 [BigPizzaV3/CodexPlusPlus](https://github.com/BigPizzaV3/CodexPlusPlus)，不再使用修改 `app.asar` 的 b-nnett 方案。

```text
Codex++.app
  ├─ 启动未修改、保持 OpenAI 签名的官方 Codex
  ├─ 只在 loopback 上启用 Chromium DevTools Protocol
  ├─ 启动 Codex++ 本地辅助服务
  └─ 读取 ~/.config/Codex++/user_scripts/*.js
       ├─ Runtime.evaluate：注入当前页面
       └─ Page.addScriptToEvaluateOnNewDocument：覆盖后续页面
```

代价也很明确：主题只在通过 `Codex++.app` 启动时存在；直接打开官方 Codex 不会加载主题。

## 系统边界

当前方案不会：

- 修改官方 `ChatGPT.app` / `Codex.app` 或其 `app.asar`；
- 重签名官方 App；
- 创建官方 App 备份；
- 安装 `com.codexplusplus.watcher` 或每五分钟自动修补；
- 创建本地代码签名证书；
- 改变 `better-sqlite3` 等原生模块的 Team ID。

BigPizzaV3 自身会安装两个 App，并使用 `~/.config/Codex++/` 保存用户脚本配置。它的状态与日志还可能位于 `~/.codex-session-delete/`；这些是外部启动器的数据，不是对官方 App 的补丁。

## 主题运行时

构建产物 `demon-slayer-codex-theme.user.js` 是一个自包含浏览器脚本：CSS、十三张队员图、一个无惨侵蚀指标、十二张对手图、十九个任务背景和两张效果图都在构建期转为 data URI，因此运行时不联网。所有实际使用的图片统一缩放并转为 WebP；七张官方人物横版素材额外限制为 `1024×576 / WebP q34`，`npm run check` 会拒绝超过 `2 MiB` 的素材目录或用户脚本。

任务页只消费一个当前地点变量，并把它写到根级 `--ki-shared-scene`：`body::before` 在 viewport 上只解码、绘制一张静态地点图，正文、左栏、Composer 与右侧案卷都只叠加不含 `url()` 的局部阅读渐变。因此这些区域像同一场景上的窗口连续对齐，也避免同一图片被四个模块分别裁切和绘制。旧版低透明度队员大图和未使用的正文对手变量已经移除；无惨小人物仅作为“鬼王侵蚀”的固定尺寸指标保留，队员与其他恶鬼图片只用于内容清晰的编队头像和当前对手卡，不再参与整页背景合成。

原始素材只用于维护和重新生成，不会进入 BigPizzaV3 用户脚本。维护者如需重新生成压缩资源可执行 `npm run optimize:assets`，该命令需要 ImageMagick；普通用户安装预构建脚本，不需要 Node.js、Homebrew 或 ImageMagick。

适配层只提供主题需要的最小能力：

- `localStorage` 命名空间：保存呼吸法、动效、氛围密度、会话编队缓存和当前会话的手动换景选择；
- `console`：记录启动与安全降级信息；
- 只读 React fiber 查找：仅用于受限节点的真实 subagent 数量推断，失败时回退到可访问 DOM；
- 可重复加载生命周期：新脚本实例启动前先调用旧实例的 `stop()`，清理观察器、监听器、样式和注入节点。

BigPizzaV3 的用户脚本列表负责启停脚本。主题不注册独立设置页；呼吸法控件保留在 Composer，其它偏好写入主题自己的命名空间存储。

## UI 兼容策略

主题只装饰 Codex 会话区域，并按以下优先级识别宿主结构：

1. 稳定 `data-testid`；
2. 原生 `type="submit"` 和 Send / Stop / Cancel / Interrupt 的可访问名称；
3. `aria-label` / `title` / `role`；
4. 输入框与按钮的表单邻接关系；
5. 受限范围内的可见文案；
6. 已识别 summary / background-subagents section 的只读 React props；
7. 找不到就跳过，不猜测任意按钮。

每个注入节点和宿主标记都有独立的 `data-kisatsutai-*` 属性。图片 data URI 只在进入任务页时写入一次；补丁运行期间会暂时断开 `MutationObserver`，因此主题自己的属性更新不会形成“写入 → 观察 → 下一帧再写入”的反馈循环。每次补丁还会清除已脱离 DOM 的发送按钮、编辑器和呼吸控件引用；同一时刻最多保留一个发送斩击节点，短时动效结束后立即释放。

`stop()` 会断开 `MutationObserver`、取消动画帧和定时器、移除监听与注入节点、恢复文案及 placeholder，并删除根主题属性。会话状态内存缓存上限为 160 条，持久化缓存同样有界。

点击、提交、审批、取消和原按钮事件始终由 Codex 控件处理。主题不代理模型请求、不上传对话、不读取 API Key，也不直接访问文件系统或 SQLite。

## 长期维护边界

官方 Codex 的 DOM 和 React 结构仍会变化，所以 BigPizzaV3 只能解决“不要侵入 App 包与签名”的稳定性问题，不能消除 UI 适配工作。每次 Codex Desktop 大版本更新后仍应运行项目检查与真实界面截图验收。

性能回归使用 `npm run runtime-qa:performance`：检查整窗背景恰好一个 `url()`、四个内容模块各自为零张地点图、空闲脚本时间、图片变量零重复写入、50 次发送按钮替换后的 detached 引用，以及 30 次快速发送下的动效单实例和自动清理。
