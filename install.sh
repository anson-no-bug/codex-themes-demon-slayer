#!/bin/sh
set -eu

THEME_REPO="anson-no-bug/codex-themes-demon-slayer"
THEME_URL="https://raw.githubusercontent.com/$THEME_REPO/main/index.js"
CODEXPLUSPLUS_REPO="BigPizzaV3/CodexPlusPlus"
CODEXPLUSPLUS_LATEST="https://github.com/$CODEXPLUSPLUS_REPO/releases/latest"
USER_CONFIG_HOME=${XDG_CONFIG_HOME:-"$HOME/.config"}
USER_SCRIPT_DIR="$USER_CONFIG_HOME/Codex++/user_scripts"
USER_SCRIPT_PATH="$USER_SCRIPT_DIR/demon-slayer-codex-theme.js"
USER_SCRIPT_CONFIG="$USER_CONFIG_HOME/Codex++/user_scripts.json"
APP_INSTALL_ROOT=${CODEXPLUSPLUS_APP_DIR:-/Applications}
LAUNCHER_APP="$APP_INSTALL_ROOT/Codex++.app"
MANAGER_APP="$APP_INSTALL_ROOT/Codex++ 管理工具.app"
CHECK_ONLY=0
TEMP_ROOT=""
MOUNT_DIR=""
MOUNTED=0

say() {
  printf '%s\n' "[鬼杀队主题] $*"
}

warn() {
  printf '%s\n' "[鬼杀队主题] 警告：$*" >&2
}

fail() {
  printf '%s\n' "[鬼杀队主题] 安装失败：$*" >&2
  exit 1
}

has_command() {
  command -v "$1" >/dev/null 2>&1
}

show_help() {
  printf '%s\n' \
    '用法：sh install.sh [--check]' \
    '' \
    '  无参数    检测并安装/更新 BigPizzaV3 Codex++，再从 GitHub 安装主题用户脚本' \
    '  --check   只检查现有 Codex++ 与主题，不下载、不修改文件' \
    '' \
    '可选环境变量：' \
    '  CODEXPLUSPLUS_APP_DIR   覆盖 Codex++ app 安装目录（默认 /Applications）' \
    '  XDG_CONFIG_HOME         覆盖 BigPizzaV3 配置根目录（默认 ~/.config）'
}

cleanup() {
  if [ "$MOUNTED" -eq 1 ] && [ -n "$MOUNT_DIR" ]; then
    hdiutil detach "$MOUNT_DIR" -quiet >/dev/null 2>&1 || true
    MOUNTED=0
  fi
  if [ -n "$TEMP_ROOT" ] && [ -d "$TEMP_ROOT" ]; then
    [ -f "$TEMP_ROOT/CodexPlusPlus.dmg" ] && rm -f "$TEMP_ROOT/CodexPlusPlus.dmg"
    [ -d "$TEMP_ROOT/mount" ] && rmdir "$TEMP_ROOT/mount" 2>/dev/null || true
    rmdir "$TEMP_ROOT" 2>/dev/null || true
  fi
}

trap cleanup EXIT HUP INT TERM

case "${1:-}" in
  "") ;;
  --check) CHECK_ONLY=1 ;;
  -h|--help) show_help; exit 0 ;;
  *) fail "未知参数：$1" ;;
esac

[ "$(uname -s)" = "Darwin" ] || fail "当前安装器只支持 macOS Codex Desktop。"

for dependency in curl hdiutil ditto codesign mktemp grep sed wc; do
  has_command "$dependency" || fail "系统缺少必要命令：$dependency"
done

CODEX_APP=""
for candidate in \
  "/Applications/ChatGPT.app" \
  "/Applications/Codex.app" \
  "$HOME/Applications/ChatGPT.app" \
  "$HOME/Applications/Codex.app"
do
  if [ -d "$candidate" ]; then
    CODEX_APP=$candidate
    break
  fi
done
[ -n "$CODEX_APP" ] || fail "未找到 Codex Desktop；请先安装并至少启动一次。"
say "Codex Desktop：$CODEX_APP"

if has_command codexplusplus; then
  LEGACY_STATUS=$(codexplusplus status 2>&1 || true)
  if printf '%s\n' "$LEGACY_STATUS" | grep -Eq 'matches patched|patched app|Installation root:'; then
    fail "检测到 b-nnett/codex-plusplus 仍在修改 Codex。请先执行 codexplusplus uninstall，确认恢复原版后再运行本脚本。"
  fi
fi

app_version() {
  /usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$1/Contents/Info.plist" 2>/dev/null || printf 'unknown\n'
}

verify_app() {
  app_path=$1
  expected_id=$2
  [ -d "$app_path" ] || return 1
  actual_id=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$app_path/Contents/Info.plist" 2>/dev/null || true)
  [ "$actual_id" = "$expected_id" ] || return 1
  codesign --verify --deep "$app_path" >/dev/null 2>&1 || return 1
}

find_latest_release() {
  LATEST_URL=$(curl -fsSIL -o /dev/null -w '%{url_effective}' "$CODEXPLUSPLUS_LATEST") \
    || fail "无法查询 BigPizzaV3 Codex++ 最新版本。"
  case "$LATEST_URL" in
    */releases/tag/*) ;;
    *) fail "无法从 GitHub 最新版本地址解析 release tag：$LATEST_URL" ;;
  esac
  RELEASE_TAG=${LATEST_URL##*/}
  RELEASE_VERSION=${RELEASE_TAG#v}
  [ -n "$RELEASE_VERSION" ] || fail "GitHub release 版本为空。"
}

install_codexplusplus() {
  case "$(uname -m)" in
    arm64|aarch64) RELEASE_ARCH=arm64 ;;
    x86_64|amd64) RELEASE_ARCH=x64 ;;
    *) fail "BigPizzaV3 暂不支持当前 CPU 架构：$(uname -m)" ;;
  esac

  find_latest_release
  INSTALLED_VERSION=missing
  if verify_app "$LAUNCHER_APP" com.bigpizzav3.codexplusplus \
    && verify_app "$MANAGER_APP" com.bigpizzav3.codexplusplus.manager; then
    INSTALLED_VERSION=$(app_version "$LAUNCHER_APP")
  fi

  if [ "$INSTALLED_VERSION" = "$RELEASE_VERSION" ]; then
    say "BigPizzaV3 Codex++ 已是最新版：$INSTALLED_VERSION"
    return
  fi

  [ "$CHECK_ONLY" -eq 0 ] \
    || fail "BigPizzaV3 Codex++ 未安装或不是最新版（本地 ${INSTALLED_VERSION}，远端 ${RELEASE_VERSION}）。"
  [ -d "$APP_INSTALL_ROOT" ] || mkdir -p "$APP_INSTALL_ROOT"
  [ -w "$APP_INSTALL_ROOT" ] \
    || fail "没有写入 $APP_INSTALL_ROOT 的权限；请让 AI 在获得授权后安装，或设置 CODEXPLUSPLUS_APP_DIR。"

  TEMP_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/demon-slayer-codex-theme.XXXXXX")
  MOUNT_DIR="$TEMP_ROOT/mount"
  mkdir -p "$MOUNT_DIR"
  DMG_PATH="$TEMP_ROOT/CodexPlusPlus.dmg"
  DMG_URL="https://github.com/$CODEXPLUSPLUS_REPO/releases/download/$RELEASE_TAG/CodexPlusPlus-$RELEASE_VERSION-macos-$RELEASE_ARCH.dmg"
  say "下载 BigPizzaV3 Codex++ ${RELEASE_VERSION}（${RELEASE_ARCH}）。"
  curl -fL --retry 2 --connect-timeout 20 "$DMG_URL" -o "$DMG_PATH" \
    || fail "Codex++ 安装包下载失败：$DMG_URL"
  hdiutil attach "$DMG_PATH" -nobrowse -readonly -mountpoint "$MOUNT_DIR" -quiet \
    || fail "无法挂载 Codex++ DMG。"
  MOUNTED=1

  verify_app "$MOUNT_DIR/Codex++.app" com.bigpizzav3.codexplusplus \
    || fail "DMG 内 Codex++.app 的签名或 bundle id 不正确。"
  verify_app "$MOUNT_DIR/Codex++ 管理工具.app" com.bigpizzav3.codexplusplus.manager \
    || fail "DMG 内管理工具的签名或 bundle id 不正确。"

  say "安装 Codex++ 与管理工具到 ${APP_INSTALL_ROOT}。"
  ditto --rsrc --extattr "$MOUNT_DIR/Codex++.app" "$LAUNCHER_APP"
  ditto --rsrc --extattr "$MOUNT_DIR/Codex++ 管理工具.app" "$MANAGER_APP"
  verify_app "$LAUNCHER_APP" com.bigpizzav3.codexplusplus \
    || fail "安装后的 Codex++.app 完整性校验失败。"
  verify_app "$MANAGER_APP" com.bigpizzav3.codexplusplus.manager \
    || fail "安装后的管理工具完整性校验失败。"
  say "BigPizzaV3 Codex++ 已安装：$(app_version "$LAUNCHER_APP")"
}

check_theme_script() {
  [ -f "$USER_SCRIPT_PATH" ] || return 1
  grep -q '__demonSlayerCodexThemeRuntime' "$USER_SCRIPT_PATH" || return 1
  grep -q 'BigPizzaV3/CodexPlusPlus user script' "$USER_SCRIPT_PATH" || return 1
  SCRIPT_SIZE=$(wc -c < "$USER_SCRIPT_PATH" | sed 's/[[:space:]]//g')
  [ "${SCRIPT_SIZE:-0}" -gt 1000000 ] || return 1
}

install_theme_script() {
  if [ "$CHECK_ONLY" -eq 1 ]; then
    check_theme_script || fail "未找到有效的主题用户脚本：$USER_SCRIPT_PATH"
    say "主题用户脚本校验通过：$USER_SCRIPT_PATH"
    return
  fi

  mkdir -p "$USER_SCRIPT_DIR"
  THEME_TEMP=$(mktemp "$USER_SCRIPT_DIR/.demon-slayer-codex-theme.XXXXXX")
  say "从 GitHub main 下载主题用户脚本。"
  if ! curl -fL --retry 2 --connect-timeout 20 "$THEME_URL" -o "$THEME_TEMP"; then
    rm -f "$THEME_TEMP"
    fail "主题下载失败：$THEME_URL"
  fi
  if ! grep -q '__demonSlayerCodexThemeRuntime' "$THEME_TEMP" \
    || ! grep -q 'BigPizzaV3/CodexPlusPlus user script' "$THEME_TEMP"; then
    rm -f "$THEME_TEMP"
    fail "下载内容不是 BigPizzaV3 兼容主题，未覆盖现有安装。"
  fi
  SCRIPT_SIZE=$(wc -c < "$THEME_TEMP" | sed 's/[[:space:]]//g')
  if [ "${SCRIPT_SIZE:-0}" -le 1000000 ]; then
    rm -f "$THEME_TEMP"
    fail "主题文件不完整（仅 $SCRIPT_SIZE bytes），未覆盖现有安装。"
  fi
  chmod 0644 "$THEME_TEMP"
  mv -f "$THEME_TEMP" "$USER_SCRIPT_PATH"
  check_theme_script || fail "安装后的主题用户脚本校验失败。"
  say "主题已安装：$USER_SCRIPT_PATH"
}

install_codexplusplus
install_theme_script

if [ -f "$USER_SCRIPT_CONFIG" ]; then
  if grep -Eq '"enabled"[[:space:]]*:[[:space:]]*false' "$USER_SCRIPT_CONFIG"; then
    warn "BigPizzaV3 的用户脚本总开关当前关闭；请在管理工具中打开。"
  fi
  if grep -Eq '"user:demon-slayer-codex-theme\.js"[[:space:]]*:[[:space:]]*false' "$USER_SCRIPT_CONFIG"; then
    warn "鬼杀队主题脚本当前被单独停用；请在管理工具中打开。"
  fi
fi

if [ "$CHECK_ONLY" -eq 1 ]; then
  say "检查完成：BigPizzaV3 Codex++ 与主题用户脚本均有效。"
else
  say "安装完成。请完全退出原 Codex，再从“Codex++”入口启动；不要直接打开 ChatGPT.app。"
fi
