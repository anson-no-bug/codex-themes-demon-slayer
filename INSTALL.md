# 安装“鬼杀队任务中枢”

## 给 AI 的一句话

> 请执行并检查 `curl -fsSL https://raw.githubusercontent.com/anson-no-bug/codex-themes-demon-slayer/main/install.sh | sh`；安装器会在缺少 b-nnett Codex++ 时自动补齐，并使用稳定本地签名。完成后直接重启原 Codex，确认鬼杀队主题已加载。

## 一条命令安装

完全退出 Codex 后执行：

```sh
curl -fsSL https://raw.githubusercontent.com/anson-no-bug/codex-themes-demon-slayer/main/install.sh | sh
```

安装器会：

1. 检查 macOS 与官方 Codex Desktop。
2. 查找现有的 [b-nnett/codex-plusplus](https://github.com/b-nnett/codex-plusplus)。如果没有，优先通过 Homebrew 安装；没有 Homebrew 但已有 Node.js 20+ 与 npm 时，改用 b-nnett 官方源码安装器。
3. 使用 `install --local` 或 `repair --force --local` 修改 Codex，避免 adhoc 签名与 `better-sqlite3` 的 Team ID 冲突。
4. 使用系统自带的 `curl + tar` 下载主题，不要求预先安装 Git。
5. 校验主题并链接到 `~/Library/Application Support/codex-plusplus/tweaks/`。

如果机器既没有 Homebrew，也没有 Node.js 20+ 与 npm，安装器会停止并列出缺失项，不会静默安装系统级软件。

只检查、不修改：

```sh
curl -fsSL https://raw.githubusercontent.com/anson-no-bug/codex-themes-demon-slayer/main/install.sh | sh -s -- --check
```

## 启动方式

安装完成后直接打开官方 `ChatGPT.app` / `Codex.app`。b-nnett 的小型 loader 已写入 Codex 启动入口，会自动读取主题；不需要额外的 Codex++ 启动器。

在 Settings → Codex++ → Tweaks 中确认“鬼灭之刃 · 鬼杀队任务中枢”已启用，再打开任意会话验证任务条、地点背景和呼吸法控件。

## 更新

再次执行同一条安装命令，然后直接重启 Codex。

## 停用

在 Codex++ 的 Tweaks 页面停用该主题；如需排查全部 tweak，可执行 `codexplusplus safe-mode`，恢复时执行 `codexplusplus safe-mode --off`。不要删除 `~/Library/Application Support/codex-plusplus/backup/`，它用于恢复官方应用。
