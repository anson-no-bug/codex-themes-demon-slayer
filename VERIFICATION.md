# 验证记录

日期：2026-07-22

主题版本：`0.5.21`

运行时：BigPizzaV3 Codex++ `>= 1.2.41`

## 当前发布基线

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

最终发布前会清除本机 Codex++ 双 App、主题配置、状态日志和已知旧 CLI 残留，再从公开 `main` 分支的一条命令重新安装。验收结果、安装文件哈希和实测版本在最终推送前写入本节。
