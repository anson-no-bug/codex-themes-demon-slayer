# 安装“鬼杀队任务中枢”

## 给 AI 的一句话

> 请从 https://github.com/anson-no-bug/codex-themes-demon-slayer 安装并启用“鬼灭之刃 · 鬼杀队任务中枢”；先检查 Codex Desktop 与 Codex++，把仓库 clone 到独立安装目录，执行仓库校验并通过 Codex++ 启用，最后重启 Codex 验证会话页主题。

## AI / 手动执行步骤

1. 确认 Codex Desktop 已安装，并检查 Codex++：

   ```sh
   codexplusplus status
   ```

2. 如果没有 Codex++，先按 [Codex++ 官方仓库](https://github.com/b-nnett/codex-plusplus) 的当前说明安装；macOS 可使用：

   ```sh
   brew install b-nnett/codex-plusplus/codexplusplus
   codexplusplus install
   ```

3. 下载到 Codex++ 的独立源码目录。SSH 可用时执行：

   ```sh
   mkdir -p "$HOME/Library/Application Support/codex-plusplus/sources"
   git clone git@github.com:anson-no-bug/codex-themes-demon-slayer.git "$HOME/Library/Application Support/codex-plusplus/sources/codex-themes-demon-slayer"
   cd "$HOME/Library/Application Support/codex-plusplus/sources/codex-themes-demon-slayer"
   ```

   SSH 不可用时改用：

   ```sh
   mkdir -p "$HOME/Library/Application Support/codex-plusplus/sources"
   git clone https://github.com/anson-no-bug/codex-themes-demon-slayer.git "$HOME/Library/Application Support/codex-plusplus/sources/codex-themes-demon-slayer"
   cd "$HOME/Library/Application Support/codex-plusplus/sources/codex-themes-demon-slayer"
   ```

4. 校验并启用：

   ```sh
   codexplusplus validate-tweak .
   codexplusplus dev .
   ```

   出现 `Codex++ dev link ready` 后即可关闭这个监听命令，开发链接会保留。

5. 完全退出并重新打开 Codex，在 Settings → Codex++ → Tweaks 中确认“鬼灭之刃 · 鬼杀队任务中枢”已启用，再打开任意会话验证任务条、地点背景和呼吸法控件。

## 更新

```sh
git pull --ff-only
codexplusplus validate-tweak .
```

然后重启 Codex。

## 停用

在 Codex++ 的 Tweaks 页面停用该主题；如需排查全部 tweak，可执行 `codexplusplus safe-mode`，恢复时执行 `codexplusplus safe-mode --off`。
