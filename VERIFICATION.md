# 验证记录

日期：2026-07-22

主题版本：`0.5.22`

运行时：BigPizzaV3 Codex++ `>= 1.2.41`

## 当前发布基线

- Codex Desktop 打包源码中的 Summary 键为 `artifacts / environment / tool-sources / background-subagents`；主题直接按这些结构键固定显示“任务案卷 / 任务案卷 / 渡鸦情报 / 出战小队”，不再匹配 `Outputs / Sources / Subagents / 子智能体` 等可见文字。
- 回归测试会把四个模块标题换成无语义文案并改用带前缀或驼峰的结构键；重挂载后仍得到固定主题名，证明结果与宿主语言无关。
- 交付物为 `demon-slayer-codex-theme.user.js`，由 BigPizzaV3 从 `~/.config/Codex++/user_scripts/` 外部注入；官方 Codex App、`app.asar` 与代码签名保持不变。
- 运行时包含 13 位队员、12 位对手、19 张会话背景、1 个无惨侵蚀指标与 2 张短时效果图，共 47 个 WebP。
- 整个任务窗口只绘制 1 张 viewport 共享背景；左栏、正文、Composer 与右侧案卷不重复加载地点图。
- 背景手动切换按会话保存；主题实例可重复加载并在 `stop()` 中清理观察器、监听器、DOM、定时器与样式。
- 标题栏只使用静态墨色渐变提高原生任务名与 Codex++ 控件对比，不增加图片、模糊或持续动画；地点卡不再绘制与“换景”按钮冲突的短金线。

## 仓库审计

- README 与 INSTALL 只描述当前 BigPizzaV3 方案；旧版本流水账已从本文件移除。
- `package.json`、`manifest.json`、用户脚本运行时版本与截图版本由检查脚本保持一致。
- 构建清单与 `assets/runtime/` 必须一一对应；缺失资源和未引用资源都会令 `npm run check` 失败。
- 普通用户安装预构建用户脚本，不需要 Git、Node.js、Homebrew 或 ImageMagick；维护者只有重新压缩素材时才需要 ImageMagick。
- `install.sh --purge` 只允许删除名称与位置均符合预期的 Codex++ App、配置、状态日志和已知旧方案残留；拒绝宽路径，并保留官方 Codex、`~/.codex/` 与 Codex 会话数据。

## 自动回归范围

- `npm run check`：版本、manifest、安装器语法与流程、47 个 WebP 清单、`2 MiB` 双预算、构建 token 与生命周期。
- `npm run runtime-qa`：桌面/移动布局、连续背景、标题栏、任务条、Composer、换景、设置、原生弹窗与图片查看器。
- `npm run runtime-qa:performance`：单背景、零模块重复图、空闲脚本时间、零重复资源写入、detached 引用与短时动效清理。
- `npm run runtime-qa:bigpizza`：首次加载、重复热载、偏好更新、动效关闭与完整停止。
- `sh install.sh --check`：官方 Codex 签名、Codex++ 双 App 与已安装主题脚本。

## 从零安装验收

- 执行 `sh install.sh --purge` 前精确停止唯一的 `CodexPlusPlus` 启动器进程；清除后确认两个 Codex++ App、`~/.config/Codex++/`、`~/.codex-session-delete/`、旧支持目录和断链 `~/.local/bin/codexplusplus` 全部不存在。
- 第一次冷清除在两个 App 删除后暴露 macOS `/bin/sh` 对 `$label：` 全角标点的变量边界问题；修复为 `${label}` 并加入静态检查后，从中断点继续完成清除。该问题没有触及官方 Codex 或会话数据。
- 修复推送后又从头执行了一次完整的 `--purge`，再原样执行 README 公网安装命令；第二轮没有中断、没有依赖人工补装，证明清除与冷安装流程可重复。
- 清除后复核 `/Applications/ChatGPT.app`：Bundle ID `com.openai.codex`，OpenAI Team ID `2DC432GLL2`，`codesign --verify --deep --strict` 与公证票据均正常；本机代码签名身份数量为 0，未发现旧 App 备份或已加载 watcher。
- 随后原样执行 README 公网命令。安装器从公开 `main` 获取自身与主题归档，自动下载 BigPizzaV3 v1.2.41 arm64 DMG（32.4 MB），SHA-256 和 `hdiutil verify` 均通过，两个 App 的版本与签名结构复核通过。
- 公网 `--check` 通过。仓库构建产物与安装到 `~/.config/Codex++/user_scripts/` 的脚本 SHA-256 均为 `e96321cfbd1f1c9c5c1d70749fb3957d2727e7d35f93d8d79845657d8d908b73`。
- 启动刚安装的 `/Applications/Codex++.app` 后，真实渲染器报告主题版本 `0.5.21`、47 个 WebP 变量、19 个地点变量、1 张共享背景、四模块本地图 `0 / 0 / 0 / 0`；任务条、标题栏、右侧案卷与 Composer 均正常显示。
