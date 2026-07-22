# 安装“鬼杀队任务中枢”

## 安装

安装器仅支持 macOS `arm64` 和 `x86_64`。唯一的应用前置条件是已安装并成功启动过一次官方 Codex Desktop；安装或更新前请完全退出官方 Codex、Codex++ 与管理工具，然后执行：

```sh
curl -fsSL https://raw.githubusercontent.com/anson-no-bug/codex-themes-demon-slayer/main/install.sh | sh
```

用户不需要预装 Git、Node.js、Homebrew、ImageMagick 或 BigPizzaV3 Codex++。安装器会自动补齐主题所需的 BigPizzaV3 双 App，并检查安装过程使用的 macOS 内置命令；系统组件异常时会明确停止，不会静默跳过。下载需要能够访问 GitHub；只有 `/Applications` 当前不可写时，macOS 才会通过 `sudo` 请求一次管理员密码。

如果官方 Codex 正在自动更新，请先等待更新完成再执行安装。安装器不会绕过或修补官方签名；更新中间态导致签名暂时不可验证时，它会安全停止。

## 安装流程

安装器按顺序执行：

1. 验证官方 Codex 的完整代码签名与 OpenAI Team ID `2DC432GLL2`。
2. 确认旧 `com.codexplusplus.watcher` 没有加载，避免与重签名方案并存。
3. 检查 `/Applications/Codex++.app` 和 `/Applications/Codex++ 管理工具.app` 的版本、架构、Bundle ID 与签名结构。
4. Codex++ 缺失、过旧或损坏时，自动识别 `arm64` / `x64`，从 BigPizzaV3 官方 GitHub Release 获取对应 DMG，核对 Release SHA-256 与 DMG 结构，再以可回滚方式安装两个 App。
5. 下载本仓库归档，验证用户脚本标记、生命周期和 `2 MiB` 上限，然后原子写入：

```text
~/.config/Codex++/user_scripts/demon-slayer-codex-theme.user.js
```

写入 `/Applications` 需要管理员权限时，密码只由 macOS `sudo` 读取，安装器不会读取或保存密码。GitHub Release API 不可用时，安装器只会回退到内置且已核验哈希的 BigPizzaV3 v1.2.41，不执行无校验 DMG 安装。

安装器不会修改或重签名官方 Codex，不创建官方 App 备份、LaunchAgent、本地签名证书，也不会删除 `~/Library/Application Support/Codex/`、`~/.codex/` 或任何会话数据。

## 启动与检查

安装后完全退出当前 Codex，再从 `/Applications/Codex++.app` 启动。直接打开官方 `ChatGPT.app` / `Codex.app` 不会加载主题，这是外部注入方案的预期行为。

只读健康检查：

```sh
curl -fsSL https://raw.githubusercontent.com/anson-no-bug/codex-themes-demon-slayer/main/install.sh | sh -s -- --check
```

它会复核官方 Codex 签名、Codex++ 双 App 和主题脚本，不下载或修改文件。

## 更新与卸载

再次执行安装命令即可更新。健康的 Codex++ 不会重复下载 DMG。强制重新安装最新版 Codex++：

```sh
curl -fsSL https://raw.githubusercontent.com/anson-no-bug/codex-themes-demon-slayer/main/install.sh \
  | CODEXPLUSPLUS_FORCE_INSTALL=1 sh
```

只删除主题脚本：

```sh
curl -fsSL https://raw.githubusercontent.com/anson-no-bug/codex-themes-demon-slayer/main/install.sh | sh -s -- --uninstall
```

完全清除 Codex++ 与主题：

```sh
curl -fsSL https://raw.githubusercontent.com/anson-no-bug/codex-themes-demon-slayer/main/install.sh | sh -s -- --purge
```

执行 `--purge` 前必须完全退出 Codex++ 与管理工具。该命令只删除：

- `/Applications/Codex++.app`
- `/Applications/Codex++ 管理工具.app`
- `~/.config/Codex++/`
- `~/.codex-session-delete/`
- 已知旧 watcher、旧 `codexplusplus` CLI 链接与旧支持目录

它保留官方 Codex、登录状态、会话数据库、`~/.codex/` 与项目文件。

## 旧侵入方案残留

普通安装发现 `com.codexplusplus.watcher` 时会停止。先确认官方 Codex 已由可信备份或官方渠道恢复，且 Team ID 为 `2DC432GLL2`；然后完全退出相关进程，执行 `--purge` 清除已知 watcher 与旧 CLI 残留，再重新安装。不要删除 Codex 自身的数据目录。
