# 安装“鬼杀队任务中枢”

## 给 AI 的一句话

> 请先检测并卸载旧的 b-nnett/codex-plusplus，确认 Codex Desktop 已恢复原版，然后执行并检查 `curl -fsSL https://raw.githubusercontent.com/anson-no-bug/codex-themes-demon-slayer/main/install.sh | sh`，最后必须从“Codex++”入口启动 Codex，确认用户脚本列表里的 `demon-slayer-codex-theme.js` 已加载且会话主题正常显示。

## 安装命令

```sh
curl -fsSL https://raw.githubusercontent.com/anson-no-bug/codex-themes-demon-slayer/main/install.sh | sh
```

安装器会：

1. 检查 macOS、Codex Desktop、CPU 架构和系统工具。
2. 如果旧 b-nnett 仍在修改 Codex，停止安装并要求先运行 `codexplusplus uninstall`，避免两套运行时同时接管。
3. 从 [BigPizzaV3/CodexPlusPlus Releases](https://github.com/BigPizzaV3/CodexPlusPlus/releases) 安装或更新与本机架构匹配的 `Codex++.app` 和管理工具，并校验 bundle id 与签名。
4. 从 GitHub `main` 下载主题到 `~/.config/Codex++/user_scripts/demon-slayer-codex-theme.js`，完整性校验通过后才覆盖旧主题。

只检查现有安装：

```sh
curl -fsSL https://raw.githubusercontent.com/anson-no-bug/codex-themes-demon-slayer/main/install.sh | sh -s -- --check
```

## 启动和验证

完全退出原 Codex，然后从 `/Applications/Codex++.app` 启动。不要直接打开 `ChatGPT.app`，否则 BigPizzaV3 不会注入用户脚本。

打开“Codex++ 管理工具”→“用户脚本”，确认：

- 用户脚本总开关已开启。
- `demon-slayer-codex-theme.js` 已开启，状态为已加载。
- 任意会话页出现任务条、地点背景、编队和呼吸法控件。

## 更新

再次运行同一条安装命令即可同时检查 BigPizzaV3 最新版本并更新主题。

## 停用

在“Codex++ 管理工具”→“用户脚本”中停用或删除 `demon-slayer-codex-theme.js`，再重启 Codex++。
