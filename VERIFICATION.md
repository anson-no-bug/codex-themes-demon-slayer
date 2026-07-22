# 验证记录

日期：2026-07-22
Codex++ 源码提交：`f98e7e9`
Codex++ 版本：`1.0.0`

## 构建与清单

```text
✓ CSS、十三张队员图、十二张对手图、十处任务地点背板与无惨透明 PNG 已嵌入 index.js
✓ manifest 必填字段、semver、scope、permissions 与 CommonJS 生命周期有效
✓ Codex++ 官方 validate-tweak：demon-slayer-codex-theme is a valid Codex++ tweak
```

## 0.5.20 当前基线：输入时收起地点标签与 GitHub 安装验证

- Composer 的“任务地点”原先由绝对定位 `::before` 绘制，不参与原生编辑器排版；长文本进入右侧区域时必然发生重叠。
- 地点标签现在只在 Composer 空闲时提供环境提示；编辑器获得焦点后直接停止绘制该伪元素，输入文字继续使用 Codex 原生宽度、换行和 padding，不注入额外占位或几何补丁。
- runtime harness 会向 Composer 填入一段跨行长文本，断言聚焦态地点伪元素的 `display/content` 均为 `none`，同时保留失焦态地点标签和地点背景。
- README 只引用本版本的四张截图；GitHub 安装文档把仓库 clone 到 Codex++ 独立源码目录，避免再次误连到开发仓库的上级产物目录。

## 0.5.19 基线：按 Thread Footer 结构清除残留暗带

- 直接核对当前 Codex Desktop 打包源码，确认 `data-thread-scroll-footer="true"` 只有两个直属分支：`data-pip-obstacle="thread-footer"` 是 Step、Queued/Steer 与 Composer 的内容分支；另一个直属兄弟是全宽 `from-token-main-surface-primary` 渐变背景分支。
- 根因是旧实现通过 `getComputedStyle(layer).pointerEvents === "none"` 猜测背景层，把 DOM 结构识别错误地绑定到了宿主 CSS 的加载时机；样式未就绪时背景分支会漏标，最终只在较窄的 Step pill 两侧露出直角黑条。
- 当前实现先用 `data-pip-obstacle="thread-footer"` 或“包含当前 Composer”确定内容分支，再只标记其直属兄弟；不读取颜色、坐标、尺寸、类名或 computed style，Queued/Steer、计划进度和 Composer 内容均不受影响。
- runtime harness 增加了真实宽度关系的 Step pill 与 Queued/Steer 行，并故意不给背景分支提供 `pointer-events: none` 提示。断言确认背景直属兄弟恰好标记 1 个、内容分支未误标、背景 opacity 为 `0`；近景见 `preview/composer-footer-v0519.png`。
- 本机 Codex++ 开发链接此前仍指向仓库上一级的旧 `0.5.16` 产物目录；现已切换到当前 Git 仓库，链接清单读取为 `0.5.19 / anson-no-bug/codex-themes-demon-slayer`，运行时不再继续加载旧构建。
- `npm run build`、`npm run check`、Codex++ `validate-tweak` 与 `scripts/runtime-qa.cjs` 全部通过；原生图片查看器 hover 仍为 `rgb(238, 241, 244)`，根级颜色覆盖数为 0。

## 0.5.18 基线：完整九柱、十处地点与主题美术集

- 角色池扩充为主角四人加完整九柱，共 13 人；编队上限与稳定出战顺序同步扩到 13，人数组合不再遗漏宇髓天元、时透无一郎、甘露寺蜜璃、伊黑小芭内、不死川实弥与悲鸣屿行冥。
- 会话地点由 4 处扩充到 10 处，并增加 12 类稳定任务语义；任务类型与地点都由 thread key 派生，React 重挂载与会话切换不改变结果。
- 新增 `preview/art-gallery-v0518.png`，浏览器自动断言 13 位角色、9 位柱、12 位对手、10 个地点与 12 类任务全部入图。
- README 只保留主题效果、实际截图和一句话 AI 安装入口；详细执行步骤集中在 `INSTALL.md`，原 PPT 已移除。
- `npm run build`、`npm run check` 与 `scripts/runtime-qa.cjs` 通过。图片查看器关闭按钮 hover 仍为 `rgb(238, 241, 244)`，根级颜色覆盖数为 0；专项截图见 `preview/native-overlays-v0518.png`，整页与输入区截图见 `preview/runtime-qa-v0518.png`、`preview/composer-surface-v0518.png`。

## 0.5.17 当前基线：主题只作用于会话页

- 根因不是关闭按钮本身，而是主题曾在 `html` 上强制 dark class 和整组 Codex `--color-*`；当前图片查看器 hover 使用 `--color-token-menu-background`，因此 Portal 也继承到了任务页的黑色菜单底。
- 已删除根级 host dark/颜色强制覆盖和“识别浮层后再恢复”的补丁逻辑。鬼杀队 `--color-*` 现在只挂在已识别的会话主容器、会话侧栏、会话摘要面板与任务条；主题自用的 `--ki-*` 留在根级，但 Codex 原生组件不会消费它们。
- 离开核心会话页后直接移除主题根属性、会话标记、剧情文案和注入节点；Pull requests、Sites、Scheduled、Plugins、设置、确认框、Radix Dialog、图片查看器及其它 Portal 不再被主题扫描或改写。
- runtime harness 同时保留原生根 token 与不同的会话局部 token。关闭按钮 hover 为 `rgb(238, 241, 244)`；查看器没有主题标记、没有内联颜色覆盖，根/查看器 token 仍为 `#ffffff / #eef1f4 / #2f80ed`，而会话内部 menu token 独立为 `rgba(49, 55, 47, 0.98)`。专项截图见 `preview/native-overlays-v0517.png`，整页截图见 `preview/runtime-qa-v0517.png`。

## 0.5.16 基线：真实 Thread Footer 全局暗带归零

- 根据当前 Codex Desktop 的真实渲染结构，确认 Composer 外围暗块来自 `[data-thread-scroll-footer="true"]` 内独立的 `bg-gradient-to-t from-token-main-surface-primary via-token-main-surface-primary` 背景层，不属于 Composer 本体或其局部包裹层。
- 运行时只标记包含当前 Composer 的 thread footer，以及其中不承载交互内容的 `pointer-events: none` 背景兄弟层；footer 内容、排队消息、Steer 操作和 Composer 原生交互层保持不变。
- footer 本体 computed `background-image / box-shadow / filter` 为 `none`；背景兄弟层 opacity 为 `0`，不会再在 Composer 上方和左侧露出直角黑块。
- 测试夹具现在复刻真实 thread footer 的整组渐变与左右投影，并新增全局 footer 近景截图 `preview/composer-footer-v0516.png`；整页截图见 `preview/runtime-qa-v0516.png`。

## 0.5.15 基线：对决区连续阵营渐变

- 删除面向所有 `[role="dialog"]` 的深色主题覆盖；确认框、`alertdialog`、Radix Dialog、图片预览、lightbox 与 media viewer 会连同 Portal 容器恢复启动时捕获的 Codex 原生色彩变量。
- 原生弹窗不再被主题强制改写标题、说明或按钮颜色；亮色验证结果为白色背景、`rgb(32, 33, 35)` 主文字、`rgb(102, 107, 115)` 说明文字，确认框与全屏图片查看器专项截图见 `preview/native-overlays-v0515.png`。
- 对决区背景由单一 `linear-gradient` 负责：左侧墨绿、中央 `46%–54%` 中性黑场、右侧暗红，`VS` 仅叠加无边界黑色羽化层。
- 友方区、鬼方区和“任务等级”区 computed `background-image` 均为 `none`、`background-color` 均透明，不再出现独立黑块或颜色硬切。
- 高难度只增强父级渐变的鬼方暗红变量，不再给鬼方子区域重新铺底。
- 新增 2048px 宽屏专项截图与断言，见 `preview/duel-wide-v0515.png`；桌面和移动端仍无横向溢出。

## 0.5.14 基线：Composer 宿主暗带归零与地点可读性

- 运行时按几何范围标记 Composer 上方最多四层局部宿主包裹；遇到 `main`、正文主布局、侧栏或弹窗立即停止，避免把清理扩大到聊天页面。
- 被标记的宿主层及其伪元素 computed `background-image / box-shadow / filter / backdrop-filter` 均为 `none`，左右暗带不再依赖宿主版本的类名。
- “任务地点”使用 `10px / 700` 浅和纸色，默认 alpha 为 `0.82`；Composer 聚焦时整体 opacity 保持 `0.78`，不再降到不可读的 `0.28`。
- 测试夹具主动模拟了外层左右投影、渐变和伪元素暗影；主题启用后全部归零。截图见 `preview/composer-surface-v0514.png`。

## 0.5.13 基线：满高友方肖像与纯文字 VS

- 顶部友方肖像在对决区使用 `background-size: auto 116%` 与顶部主体裁切，单人和多人状态都贴满 72px 高度；移动端回落为与恶鬼一致的 64px。
- `VS` 的 `::before` / `::after` 均为 `content: none; display: none`，已删除两道斜线及其循环动效；字标本体不使用 `filter`，只保留旧金 `V`、血鬼赤 `S` 和明朝体笔锋。
- 单人对决新增独立截图与回归断言，见 `preview/duel-single-v0513.png`。

## 0.5.12 基线：圆角地点 Composer

- 新建任务控件只保留“接取讨伐”剧情文字，不挂载自定义 primary variant，也不生成“令”字伪元素；图标、边框、尺寸、hover、focus 与点击逻辑均由 Codex 原生控件负责。
- Composer 根面固定为 `22px` 圆角并统一 `overflow: hidden`；根面、编辑器与呼吸控件均无外阴影，Composer 本身不使用 `filter` / `backdrop-filter`，不会再露出左右硬直角或叠出多层框。
- 当前会话地点图作为 Composer 的第三层本地背景恢复，使用 `cover` 与会话焦点裁切；两层深墨保证输入文字对比，背景不固定到 viewport。
- “任务地点 · 地点名”由根面的背景伪元素显示，不新增 DOM 卡片、不改变 Composer 高度，聚焦时降低存在感。

## 0.5.11 基线：鬼杀队 VS 恶鬼对决构图

- 设置配置卡与会话主题使用独立样式作用域；打开设置时不再残留深灰任务卡底色，卡片、下拉框、开关和恢复按钮直接继承 Codex 当前外观。
- 设置页亮色模式的主文字 / 说明文字对比度为 `16.11:1 / 5.36:1`，暗色模式为 `15.56:1 / 8.55:1`；下拉框与恢复按钮在两种外观下也均高于 `4.5:1`。配置近景见 `preview/native-settings-v0512.png`。
- 顶部任务条存在且只存在一个对决区，DOM 与视觉顺序均为“鬼杀队肖像 → 友方文字 → VS → 鬼方文字 → 恶鬼肖像”；可访问名称同步包含双方姓名与“对决”。
- 6 人测试任务只渲染前三名队员，不追加 `+N` 肖像；“出战编成 / 06”保留总数，前三名姓名以三行小字完整展示。
- 桌面端友方与恶鬼肖像 computed height 均为 72px，移动端均为 64px；移动端仍显示双方肖像和 VS，不再隐藏恶鬼，且没有横向溢出。
- `VS` 只显示两个字母，不含额外“対”字；自身 border 为 `0`、background 为 `none`，使用原创金赤字形表达对抗，不使用第三方游戏标识或徽章轮廓。
- `npm run build`、`npm run check` 与 `scripts/runtime-qa.cjs` 通过；桌面、Composer 与移动端截图见 `preview/runtime-qa-v0512.png`、`preview/composer-surface-v0512.png` 与 `preview/conversation-scrim-mobile-v0512.png`。

## 0.5.10 无边界 Composer 与呼吸法发送恢复

- Composer 外层 computed style 为 `border: 0`、`border-radius: 0`、`box-shadow: none`、透明底色；唯一背景是中央 `0.94`、边缘降至 `0` 的径向夜色暗场。
- 编辑区没有第二层容器：border、圆角和阴影均为 `0 / none`，背景透明；焦点态只加深暗场，不生成高亮描边。
- 外框、编辑框、左侧竖线、底部刀光线、附件/语音自定义描边全部取消；呼吸选择器自身也没有外层边框、底板或阴影。
- 随机 / 水 / 炎 / 雷 / 虫五段选择、日轮发送 / 收刀状态和四式斩击完整恢复；实测选择“炎”后根主题、选中态与发送特效均为 `flame`，原生 form submit 恰好触发一次。
- 关闭“状态动效”后呼吸选择和日轮层归零、宿主图标 opacity 恢复为 `1`；重新开启后两者各恢复为单实例，发送按钮始终保持 32×32px。
- 主题配置不再占用设置左侧的独立页面入口，只保留 Codex++ Tweaks 管理列表里的原生 `Configure` 按钮；点击后显示三行必要配置与恢复默认。
- 设置界面打开时移除主题根属性、地点资源、任务条、渡鸦和任务头像装饰，左右设置区域使用 Codex 原生颜色与布局；离开设置后当前会话主题自动恢复。
- `npm run build`、`npm run check` 与 `scripts/runtime-qa.cjs` 通过；整页、正文、移动端、Composer 与设置配置近景分别见 `preview/runtime-qa-v0510.png`、`preview/conversation-scrim-v0510.png`、`preview/conversation-scrim-mobile-v0510.png`、`preview/composer-surface-v0510.png` 与 `preview/native-settings-v0510.png`。

## 0.5.8 阅读光场、核心页作用域与原生控件

- 正文没有毛玻璃节点、固定高度面板、边框或圆角框；背景伪元素使用中央 `0.48`、羽化边缘 `0.20` 的墨色横向光场，文字层不受滤镜影响。
- 核心页保留“接取讨伐 / 任务案卷 / 渡鸦情报 / 出战小队 / 渡鸦在线”；Environment、分支、搜索、终端、文件、Composer placeholder、发送和停止均保持 Codex 原生名称。
- 日轮刀替换层、呼吸选择、动态 Composer kicker 与工具卡角标均不再挂载；原生 Send 图标 opacity 为 `1`，标题与提交事件不被主题覆盖。
- 离开核心会话页后，任务条、渡鸦状态和剧情文案全部移除或还原；Outputs / Environment / Sources / Subagents 与 New task 恢复原生文本。
- 沉浸与安静模式、390px 移动端均无横向溢出；安静模式不显示地点背板、任务条或额外阅读层。
- `npm run build`、`npm run check` 与 `scripts/runtime-qa.cjs` 通过；截图见 `preview/runtime-qa-v058.png`、`preview/conversation-scrim-v058.png` 与 `preview/conversation-scrim-mobile-v058.png`。

以下 0.4.x–0.5.19 内容保留为演进记录，不代表 0.5.20 当前行为。

## 0.5.7 之前的历史 entry 生命周期记录

`preview/runtime-harness.html` 使用 mock renderer API 直接加载生成后的 `index.js`。

本节验证的是 tweak 的 entry 生命周期、DOM 标记、状态同步与计算样式，不等同于对所有 ChatGPT / Codex Desktop 版本和私有 DOM 的全量验收。

启动后：

```text
styleCount       1
composerMarked   1
kickerCount      1
taskMarked       1
taskSquad        3 / 4 / 1
taskAvatars      3 / 4 / 1
sendMarked       1
sendSword        1
toolMarked       1
stripCount       1
summaryPanel     1
summarySections  artifacts / environment / tool-sources / background-subagents
opponent         会话难度池内固定
difficulty       lower
locationCopy     吉原游郭 · 潜入夜街
sidebarLocation  与 locationCopy 相同
composerLocation 与 locationCopy 相同
composerKicker   当前地点 · 任务指令
theme            water
missionState     tracking
```

执行 `stop()` 后：

```text
styleCount       0
composerMarked   0
kickerCount      0
taskMarked       0
sendMarked       0
stripCount       0
squadCount       0
theme            null
characterVar     空
opponentVar      空
backgroundVar    空
slashEffect      0
可见文案          接取讨伐 → New task
任务地点          → Current branch
placeholder      向鎹鸦下达任务… → Ask anything
```

再次启动后，style、kicker、任务条、日轮刀和地点图标都保持单实例，证明热重载路径幂等。

## 0.5.7 之前的历史交互与响应式记录

- 每个会话以 `data-app-action-sidebar-thread-id` 建立统一 `SessionState`；React 重挂载、普通重渲染和 Token 档位变化不会重新抽取地点或队员。
- 运行时在会话 A / B / A 间切换后，会话 A 的地点与完整队员顺序均精确恢复；会话 B 使用另一处地点和另一支小队。
- 活动任务从 3 人切到 1 人时，主简报、友方阵列、状态条和左侧任务卡均同步为单人。
- 活动任务切到 4 人时，正文展示 4 名队员；左侧卡显示 3 张角色图加 `+1`，不挤压任务标题。
- 左侧任务条的 1 / 2 / 3 / 4+ 人状态分别使用 54 / 82 / 106 / 124px 编队槽；头像以斜切叠放表达 `x/x/x/+n`，不使用圆形卡片或占宽分隔符。
- 编队优先保证炭治郎、祢豆子、善逸、伊之助主角组进入稳定候选顺序，再按实际 subagent 数量补入柱；右侧 `background-subagents` 的 React 只读 props 可提供精确人数，失败时安全回退。
- 地点按会话稳定哈希从无限城、藤袭山、吉原游郭、蝶屋敷中抽取；正文、左栏、输入区和右侧案卷读取同一个地点状态，同一会话不跳景，新会话使用自己的地点，切回后恢复。
- 四个地点在左侧窄栏使用各自的焦点裁切；地点图处于深墨遮罩下，绿色市松边与紫藤细节不覆盖任务文字，导航与任务标题仍保持高对比。
- Token 余量 95% → 50% → 20% → 5% 分别得到：`戊/下弦侦察`、`乙/上弦末席`、`极/上弦前三`、`终/鬼王终局`；对手均来自对应池。
- Token 余量从 78% 调整到 20% 后，侵蚀点阵从 8 个亮点变为 2 个；组件保持 228×60px，不发生宽高变化。
- 无惨资源为 328×512 RGBA PNG；界面中按 36×52px 完整人物比例固定在点阵侧边，不再沿轨道移动或挤压。
- 侵蚀组件正文仅包含“鬼王侵蚀”和百分比；不存在 Token 换算、余量详情或解释性长文案。
- 当前任务对手卡与悬浮任务条同步展示对手图、原著位阶、招式和任务档位。
- 四处任务背板均使用独立暗色遮罩、低饱和和模糊；友方人物与对手使用分离图层，不再发生“对手覆盖队友”的情况。
- 右侧原生 summary panel 保留折叠、文件打开、添加来源与分支切换事件，仅把四个 section 映射成“任务案卷 / 任务地点 / 鎹鸦情报 / 出战小队”，并插入与当前会话同步的地点简报。
- 水、炎、雷、虫切换会改变日轮刀按钮色系与斩击结构；雷呼吸实测显示折线闪击，动效关闭时不生成斩击节点。
- 日轮刀跟随 composer action token，harness 实测为 32×32px；发送与停止状态切换前后宽高完全一致，不再放大成 38–44px 圆币。
- 发送态只显示银刃、金色刀镡与缠柄；停止态交叉淡出银刃并只显示圆钝暗赤刀鞘、鞘口、刀柄与下绪，宿主原图标保持隐藏。
- `type="submit"` 的 Send 与 `type="button"` 的 Stop 均正确识别；composer 末尾追加麦克风按钮后没有发生误注入。
- 输入框有内容时按 Enter 恰好生成一个 send 斩击；点击停止态恰好生成一个 sheathing 收刀效果，两者都保留宿主原事件。
- composer 的“鎹鸦任务函”使用会话地点气氛层、紫藤水印与动态地点 kicker；编辑区文字、placeholder 与 caret 均在独立墨纸层上保持可读，底部日轮刀结构线不改变宿主布局。
- Environment 内原生分支按钮保留分支名与点击事件，并增加任务地点语义；`stop()` 后完整还原。
- 320px iframe 实测：侵蚀组件保持 228px 固定宽度，位于 `x=57..285`；无惨人物保持 36×52px，横向滚动被禁用。
- 页面可访问树保留 heading、region、status、searchbox、textbox、switch、combobox 与 button 语义。
- 浏览器控制台无 error 或 warning。
- `prefers-reduced-motion` 与主题内“呼吸动效”关闭态均取消循环、旋转、位移与长过渡。

## 0.4.7 真实界面适配回归

- 新版 Codex 使用的 conversation、interactive label、icon、input、dropdown 与 active selection 前景 token 已同时写入 CSS root 和运行时强制覆盖层。
- 左栏规则只作用于含真实 thread row 的侧栏；右侧 Outputs 不再被广谱 `aside` 规则影响。
- 左栏根节点从真实任务行 `closest("aside")` 获得；composer 以精确根选择器优先，因此地点气氛、紫藤水印和输入样式不会泄漏到 Outputs、右侧案卷或普通正文。
- 通用蓝黑基调已替换为暖墨、和纸、旧金线与低饱和紫藤；原著地点图被限制在气氛层，前景正文和操作文字仍由高不透明墨层隔离。
- 左侧任务栏继承当前会话地点，四地点均采用窄栏独立裁切；A / B / A 切换时左栏、composer、正文与右侧地点案卷同步并在返回 A 后恢复。
- composer 动态 kicker 显示当前任务地点，地点图只在右侧低对比出现；输入文字、placeholder、caret 和 focus 边界均有独立可读性断言。
- 任务行和其侧栏祖先 computed opacity 均为 `1`；人物编成 hover 后保持 `0.9` 可见度。
- 工具卡只提升到稳定的 tool/testid 容器；普通 assistant 正文与 main 均不会被标记为工具卡。
- 任务条外层使用 `region`，只有状态文案承担 live status；四个呼吸按钮均为 `pointer-events:auto`。
- 自动点击“炎”后，根主题变为 `flame`，且恰好只有炎按钮为 `aria-pressed=true`。
- 鎹鸦状态固定于真实任务侧栏底部；主题自有 live status 不再反向污染任务状态判定。
- 宽屏任务条使用“任务状态 / 友方编成 / 当前对手 / 鬼王侵蚀”四区；900px 自动变成两行，窄屏变为单列，实测无横向溢出。
- `npm run build`、`npm run check` 与 `scripts/runtime-qa.cjs` 的 0.4.7 runtime harness 验收截图见 `preview/runtime-qa-v047.png`；左栏与输入区近景分别见 `preview/sidebar-v047.png`、`preview/composer-v047.png`。
- 日轮刀发送与归鞘状态的 4× 近景分别见 `preview/nichirin-send-v046.png`、`preview/nichirin-sheathed-v046.png`。
- 截图中的左侧 3 / 4 / 1 人任务、正文友方阵列、会话地点与右侧四个任务 section 均由同一 session state 驱动。
- 当前安装的 `/Applications/ChatGPT.app` 通过 Codex++ 开发软链接接收 `index.js` 变更并自动热加载；这证明本机当前安装路径生效，不代表其它 Codex Desktop 版本无需重新适配。

## 0.4.8 项目接令控件回归

- 审计当前 ChatGPT / Codex `26.715.52143` 的真实 renderer bundle，确认项目内新任务按钮位于 `[data-app-action-sidebar-project-row]` 内，原生透明外壳使用 `opacity-0 group-hover/folder-row:opacity-100`。
- 主题只标记按钮到项目行之间的该透明外壳；没有修改项目行本身，也没有展开使用 `w-0 overflow-hidden` 的相邻菜单。
- 项目快捷接令按钮、SVG 与外壳在鼠标移开并等待 2.6 秒后 computed opacity 均为 `1`，外壳宽度和按钮尺寸均为 32px；可用和 disabled 两态都保持可辨。
- 呼吸按钮在同一延时阶段保持 22×18px、`visibility:visible`、`pointer-events:auto` 和非透明前景/底色；切换到炎之后恰好一个按钮为 active。
- 顶部主入口与项目快捷入口已分型：主入口以“令”字受命印替代无语义横线，项目入口保持紧凑方形按钮，不互相套用布局样式。
- `npm run build`、`npm run check` 与 `scripts/runtime-qa.cjs` 全部通过；验收图见 `preview/runtime-qa-v048.png`，左栏和输入区近景见 `preview/sidebar-v048.png`、`preview/composer-v048.png`。
- 本机 Codex++ 日志在 2026-07-21 记录到 `src/tweak.js` 与生成后 `index.js` 的 reload，并重新发现唯一 tweak `dev.local.demon-slayer-codex-theme`，无需重新安装。

## 0.4.9 延迟图标与任务轨道回归

- 项目快捷接令按钮把按钮、直接图标容器、SVG 与 path 四层都锁定为可见；直接容器为 18×18px、SVG 为 16×16px、overflow 为 visible，可用与 disabled 两态在 2.6 秒延时后均未变暗或裁切。
- 主题不再对 thread/project row 内所有 `span/div` 广谱强制 opacity，避免把 Codex 原生 hover-only 控件永久展开；任务标题改由 `[data-thread-title-trigger] / [data-thread-title]` 精确保持可读。
- 当前 Codex 源码中的任务行原生右端轨道最小为 52px，多状态时可扩展到 80px；运行时测量结果写入 `--ki-native-trailing-rail`，人物编队和行尾 padding 同步让位。
- 运行态 3 人 harness 实测为“两张肖像 +1 + 52px 状态轨道”，编队边界不越过原生轨道；无状态 4 人任务仍为“三张肖像 +1”。
- `npm run build`、`npm run check` 与 `scripts/runtime-qa.cjs` 全部通过；验收图见 `preview/runtime-qa-v049.png`，左栏和输入区近景见 `preview/sidebar-v049.png`、`preview/composer-v049.png`。

## 0.5.0 地点光照、右栏编成与悬停交接回归

- 右侧 `background-subagents` 区域插入与当前 thread session 共用的角色编成卡；A / B 会话切换时，右栏头像顺序与顶部任务条逐项一致，人物姓名和人数同步更新。
- 原生 Subagents 文本列表从视觉层隐藏，原生 section 标题与折叠结构仍保留；主题停止时注入卡与标记均完整清理。
- 无限城、藤袭山、吉原游郭、蝶屋敷分别使用 `0.62 / 0.72 / 0.78 / 0.86` 的地点光照档位，并为正文、左栏和输入区提供各自色温遮罩；A / B / A 切换后地点与光照一起恢复。
- 左侧任务 hover 时头像 computed opacity 为 `0.12`，同时具有 `blur(2px)`；宿主任务操作按钮为 `opacity:1 / visibility:visible`。指针离开后所有任务头像恢复为 `opacity:1`，点击留下的普通焦点不会锁住虚化态。
- 键盘 `focus-visible` 仍触发相同的信息交接反馈，`prefers-reduced-motion` 下取消时长但保留前后状态含义。
- `npm run build`、`npm run check`、Codex++ `validate-tweak` 与 `scripts/runtime-qa.cjs` 全部通过；验收图见 `preview/runtime-qa-v050.png`，左栏静态/悬停与输入区近景见 `preview/sidebar-v050.png`、`preview/sidebar-hover-v050.png`、`preview/composer-v050.png`。

## 0.5.1 左栏读取面、明亮地点与 Agent 导航回归

- 左栏地点图保留为会话气氛层，并增加 `3–3.5px` 场景级虚化；项目行与任务行使用独立半透明墨层和 `9px` 局部磨砂，项目名、任务名、原生 SVG 与 disabled 图标都不再直接落在复杂图片上。
- 藤袭山、吉原游郭和蝶屋敷降低遮罩密度并分别提高场景亮度；A / B harness 会话稳定映射为吉原与蝶屋敷，切回 A 后地点、光照和人物编成都逐项恢复。
- 任务行 hover / focus-within 时编成宽度归零，人物层隐藏，原生按钮与其透明祖先外壳同时提升为 `opacity:1 / visibility:visible / pointer-events:auto`；指针离开后编成恢复，原生按钮没有被复制或替换。
- 右侧 Subagents 原生节点不再 `display:none`，而是保留为视觉隐藏的行为源；同步名册中除主将外的队员头像获得键盘焦点与点击代理，harness 点击首个可交互头像后真实原生目标记录为 `subagent-a`。
- `npm run build`、`npm run check`、Codex++ `validate-tweak` 与 `scripts/runtime-qa.cjs` 全部通过；验收图见 `preview/runtime-qa-v051.png`，左栏静态/悬停与输入区近景见 `preview/sidebar-v051.png`、`preview/sidebar-hover-v051.png`、`preview/composer-v051.png`。

## 0.5.2 连续场景拼图与内嵌案卷回归

- 左栏、正文任务面、输入框和右侧 summary panel 的地点图片层全部改为 viewport-fixed 取景；computed `background-attachment` 分别为 `scroll, scroll, fixed`、`scroll, scroll, fixed`、`scroll, scroll, scroll, scroll, fixed` 与 `scroll, fixed`，四者解析到同一个内嵌地点图。
- 左栏不再使用独立 `sidebarPosition` 裁切，所有区域共用当前会话地点的同一焦点坐标，因此横向并排时显示一幅场景的连续切片，而不是四张重复背景。
- 任务地点简报从 Environment 外置区域迁入原生 `artifacts / 任务案卷` section；原生标题、折叠、文件列表和 Environment 分支控件保持不变。
- 右侧 summary 外壳统一为 `16px` 圆角，任务地点与出战小队内卡统一为 `10px` 圆角、相同金线与半透明墨纸材质，不再出现案卷外突出的直角拼接条。
- A / B / A 会话切换后，拼图四区域、任务地点卡、任务条与小队仍同步恢复对应地点；自定义队员头像点击继续代理原生 Agent 目标 `subagent-a`。
- `npm run build`、`npm run check`、Codex++ `validate-tweak` 与 `scripts/runtime-qa.cjs` 全部通过；验收图见 `preview/runtime-qa-v052.png`，左栏静态/悬停与输入区近景见 `preview/sidebar-v052.png`、`preview/sidebar-hover-v052.png`、`preview/composer-v052.png`。

## 0.5.3 任务状态互斥回归

- 移除侧栏对任意原生 `button / role=button / SVG` 的常驻 `opacity:1` 覆盖；主题只负责人物编队的退场与空间让位，不再接管 Codex 任务按钮的显示状态。
- 删除任务行原生控制及祖先外壳的强制可见标记逻辑；运行、归档、置顶和更多操作继续完全服从宿主原有 hover / loading 状态机。
- runtime harness 增加“运行任务同时含隐藏归档节点”的互斥夹具；悬停运行任务后进度轨道保持存在，归档控件 computed state 仍为 `opacity:0 / visibility:hidden`。
- 普通空闲任务悬停仍由宿主规则显示操作入口，人物层为其退场；项目级快捷接令按钮使用独立精确选择器，不受本次修复影响。
- `npm run build`、`npm run check`、Codex++ `validate-tweak` 与 `scripts/runtime-qa.cjs` 全部通过；验收图见 `preview/runtime-qa-v053.png`。

## 0.5.4 日轮刀、呼吸选择与四式斩击回归

- 呼吸切换从顶部任务情报条移除，并作为 `type=button` 的四段控件插入原生 composer action 同级、发送按钮正前方；harness 确认二者共享父节点且相邻，任务情报条内呼吸按钮数量为 0。
- 日轮刀发送态重绘为银刃、刃纹、鎺、圆形刀镡、交叉细节、缠柄和“斩”金印；停止态重绘为高对比暗赤刀鞘、漆面高光、鞘口、鐺、刀柄、下绪和“收”金印。
- 发送与停止 computed box 继续保持 32×32px，内部状态交叉淡入淡出，不改变 Codex 原生按钮、焦点或点击事件。
- 水、炎、雷、虫各自拥有独立 SVG scene；自动触发后分别有 6 / 6 / 2 / 6 个可见标记，不再复用一条仅换颜色的弧线。
- 收刀使用包含刀鞘、漆面高光、回收刀身、刀镡与锁定闪点的独立五层 scene；点击停止与 Enter 发送仍各触发一次且不拦截宿主事件。
- 四式动效近景见 `preview/breath-water-v054.png`、`preview/breath-flame-v054.png`、`preview/breath-thunder-v054.png`、`preview/breath-insect-v054.png`；刀图标见 `preview/nichirin-send-v054.png`、`preview/nichirin-sheathed-v054.png`，收刀动效见 `preview/nichirin-sheath-effect-v054.png`。
- `npm run build`、`npm run check`、Codex++ `validate-tweak` 与 `scripts/runtime-qa.cjs` 全部通过；整体与输入区验收图见 `preview/runtime-qa-v054.png`、`preview/composer-v054.png`。

## 0.5.5 任务情报条外轮廓回归

- 任务情报条从仅有上下横线的直角平面，改为完整 `14px` 圆角案卷外壳，首尾图片和内容同步裁切。
- 顶边增加克制的纸面亮度，底边与任务背板通过压暗阴影过渡，保留紧凑横向情报带层级。
- 运行时检查四边 `1px` 外框、`14px` 圆角、子内容裁切和窄屏溢出；近景见 `preview/mission-strip-v055.png`。

## 0.5.6 原著炎轮与虫舞残像

- 炎之呼吸引入《无限列车篇》官网炼狱挥刀火焰帧，通过径向遮罩消除截图直角，叠加三层红黄火舌、刀轨与余烬。
- 虫之呼吸引入那田蜘蛛山篇官网蝴蝶忍帧，画面裁入蝶翼外形，叠加大型开合蝶翼、细针突进、小蝶群和四层紫藤毒粉。
- 两张官网素材与角色图一样在构建时转成 `data:image` 嵌入 `index.js`，运行时无网络请求。

## 0.5.7 原生设置退路与呼吸选择收口

- 设置页移除会令整套主题和配置入口一起消失的“启用队服”开关；旧版存储的关闭状态在启动时自动清理，主题默认恢复到沉浸模式。
- 设置只保留沉浸 / 安静、剧情化文案、斩击动效与恢复默认。安静模式恢复 Codex 原生正文、侧栏与输入框背景，沉浸模式继续使用会话固定地点。
- 关闭斩击动效会移除日轮刀替换层、呼吸选择和 Enter 动效监听，原生发送按钮的图标、标题与点击提交逻辑完整恢复；重新开启后五段控件与日轮刀重新挂载。
- 呼吸顺序固定为“随机、水、炎、雷、虫”；删除“无”，随机位于首位且连续点击不会重复上一次具体呼吸。
- 项目行编辑入口保持 Codex 原生 24px hover 几何，不再追加自定义边框；右侧出战小队整卡代理第一个可用的原生 Agent 入口。
- Pull requests、Sites、Scheduled、Plugins 等功能页保留主题左栏，右侧内容与设置、对话框、图片查看器继续使用 Codex 原生材质。
- `npm run build`、`npm run check`、Codex++ `validate-tweak` 与 `scripts/runtime-qa.cjs` 全部通过；运行夹具确认动效关闭时原生提交仍只触发一次，恢复后五段呼吸与日轮刀只挂载一份。

## 最终审查

结论：队员、对手、难度、Token 鬼势、会话固定地点、右侧任务情报与呼吸斩击已组成同一套任务状态系统；主要未验证项仍是不同 Codex Desktop 版本的真实私有 DOM 差异。

| 指标 | 得分 |
|---|---:|
| 产品适配 | 15 / 15 |
| 层级与构图 | 14 / 15 |
| 原创性 | 15 / 15 |
| 交互连续性 | 10 / 10 |
| 动效目的 | 10 / 10 |
| 可访问性 | 13 / 15 |
| 响应式 | 9 / 10 |
| 实现质量 | 5 / 5 |
| 内容完整性 | 5 / 5 |
| **总分** | **96 / 100** |

限制：上述自动化断言与三张验收图来自项目 runtime harness；当前安装仅额外确认开发软链接热加载。Codex 的私有 DOM 仍可能随桌面版本变化，每次大版本更新后仍应重跑真实界面截图审查与 runtime harness。
