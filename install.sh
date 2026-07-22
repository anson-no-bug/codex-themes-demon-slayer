#!/bin/sh
set -eu

THEME_REPO="anson-no-bug/codex-themes-demon-slayer"
THEME_REF=${DEMON_SLAYER_THEME_REF:-main}
THEME_ARCHIVE_URL="https://codeload.github.com/${THEME_REPO}/tar.gz/${THEME_REF}"
THEME_LOCAL_SOURCE=${DEMON_SLAYER_THEME_SOURCE_DIR:-}

CODEXPP_REPO="BigPizzaV3/CodexPlusPlus"
CODEXPP_RELEASES_URL="https://github.com/${CODEXPP_REPO}/releases"
CODEXPP_RELEASE_API=${CODEXPLUSPLUS_RELEASE_API:-"https://api.github.com/repos/${CODEXPP_REPO}/releases/latest"}
CODEXPP_RELEASE_FILE=${CODEXPLUSPLUS_RELEASE_FILE:-}
CODEXPP_LOCAL_DMG=${CODEXPLUSPLUS_DMG_PATH:-}
CODEXPP_MIN_VERSION=${CODEXPLUSPLUS_MIN_VERSION:-"1.2.41"}
CODEXPP_FORCE_INSTALL=${CODEXPLUSPLUS_FORCE_INSTALL:-0}
CODEXPP_APPLICATIONS_DIR=${CODEXPLUSPLUS_APPLICATIONS_DIR:-"/Applications"}
CODEXPP_LAUNCHER="$CODEXPP_APPLICATIONS_DIR/Codex++.app"
CODEXPP_MANAGER="$CODEXPP_APPLICATIONS_DIR/Codex++ 管理工具.app"
CODEXPP_CONFIG_DIR=${CODEXPLUSPLUS_CONFIG_DIR:-"$HOME/.config/Codex++"}
CODEXPP_STATE_DIR=${CODEXPLUSPLUS_STATE_DIR:-"$HOME/.codex-session-delete"}
LEGACY_SUPPORT_DIR=${CODEXPLUSPLUS_LEGACY_SUPPORT_DIR:-"$HOME/Library/Application Support/codex-plusplus"}
LEGACY_BIN=${CODEXPLUSPLUS_LEGACY_BIN:-"$HOME/.local/bin/codexplusplus"}
LEGACY_WATCHER_PLIST=${CODEXPLUSPLUS_WATCHER_PLIST:-"$HOME/Library/LaunchAgents/com.codexplusplus.watcher.plist"}

CODEXPP_PINNED_VERSION="1.2.41"
CODEXPP_PINNED_ARM64_SHA256="1ec9aba45b27beb13058f3b62f025d5ac0572fdb4d517b7e8875367d293dd0cf"
CODEXPP_PINNED_X64_SHA256="beecc3e0da54b6466608898b536681041af20fa397f168b888762a16f33e8130"

THEME_SCRIPT_DIR="$CODEXPP_CONFIG_DIR/user_scripts"
THEME_SCRIPT_NAME="demon-slayer-codex-theme.user.js"
THEME_SCRIPT_PATH="$THEME_SCRIPT_DIR/$THEME_SCRIPT_NAME"
CHECK_ONLY=0
UNINSTALL_ONLY=0
PURGE_ONLY=0
THEME_WORK_DIR=""
CODEXPP_MOUNT_POINT=""
CODEXPP_RELEASE_VERSION=""
CODEXPP_RELEASE_URL=""
CODEXPP_RELEASE_SHA256=""
CODEXPP_RELEASE_ARCH=""
USE_SUDO=0

say() {
  printf '%s\n' "[鬼杀队主题] $*"
}

warn() {
  printf '%s\n' "[鬼杀队主题] 警告：$*" >&2
}

fail() {
  printf '%s\n' "[鬼杀队主题] 失败：$*" >&2
  exit 1
}

has_command() {
  command -v "$1" >/dev/null 2>&1
}

show_help() {
  printf '%s\n' \
    '用法：sh install.sh [--check|--uninstall|--purge]' \
    '' \
    '  无参数       自动补齐 BigPizzaV3 Codex++，再安装或更新鬼杀队主题' \
    '  --check      只检查官方 Codex 签名、Codex++ 双入口和主题脚本' \
    '  --uninstall  只删除鬼杀队主题脚本，不修改 Codex 或 Codex++' \
    '  --purge      删除 Codex++ 双 App、配置、日志与已知旧方案残留；保留官方 Codex 数据' \
    '' \
    '可选环境变量：' \
    '  DEMON_SLAYER_THEME_REF       主题 Git ref（默认 main）' \
    '  CODEXPLUSPLUS_CONFIG_DIR     BigPizzaV3 配置目录（默认 ~/.config/Codex++）' \
    '  CODEXPLUSPLUS_FORCE_INSTALL  设为 1 时重新安装最新版 BigPizzaV3'
}

ensure_work_dir() {
  if [ -z "$THEME_WORK_DIR" ]; then
    THEME_WORK_DIR=$(mktemp -d "${TMPDIR:-/tmp}/demon-slayer-codex-theme.XXXXXX")
    : > "$THEME_WORK_DIR/.demon-slayer-installer-temp"
  fi
}

cleanup() {
  if [ -n "$CODEXPP_MOUNT_POINT" ] && [ -d "$CODEXPP_MOUNT_POINT" ]; then
    hdiutil detach "$CODEXPP_MOUNT_POINT" >/dev/null 2>&1 || true
  fi
  if [ -n "$THEME_WORK_DIR" ] \
    && [ -f "$THEME_WORK_DIR/.demon-slayer-installer-temp" ]; then
    rm -rf "$THEME_WORK_DIR"
  fi
}

trap cleanup EXIT
trap 'exit 1' HUP INT TERM

case "${1:-}" in
  "") ;;
  --check) CHECK_ONLY=1 ;;
  --uninstall) UNINSTALL_ONLY=1 ;;
  --purge) PURGE_ONLY=1 ;;
  -h|--help) show_help; exit 0 ;;
  *) fail "未知参数：$1" ;;
esac

[ "$(uname -s)" = "Darwin" ] || fail "当前安装器只支持 macOS Codex Desktop。"

for dependency in awk basename codesign cp curl ditto grep hdiutil id launchctl lipo mkdir mktemp mv pgrep plutil rm shasum sleep tar uname wc xattr; do
  has_command "$dependency" || fail "系统缺少必要命令：$dependency"
done

find_codex_app() {
  for candidate in \
    "/Applications/ChatGPT.app" \
    "/Applications/Codex.app" \
    "$HOME/Applications/ChatGPT.app" \
    "$HOME/Applications/Codex.app"
  do
    if [ -d "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

check_codex_signature() {
  app_path=$1
  verify_app_signature "$app_path" \
    || fail "Codex 签名校验失败：$app_path"
  signature_details=$(codesign -dv --verbose=4 "$app_path" 2>&1 || true)
  printf '%s\n' "$signature_details" | grep -q 'TeamIdentifier=2DC432GLL2' \
    || fail "Codex 不是 OpenAI Developer ID 签名；请先恢复或重装官方 App。"
}

verify_app_signature() {
  signature_attempt=1
  while [ "$signature_attempt" -le 5 ]; do
    if codesign --verify --deep --strict "$1" >/dev/null 2>&1; then
      return 0
    fi
    signature_attempt=$((signature_attempt + 1))
    [ "$signature_attempt" -gt 5 ] || sleep 1
  done
  return 1
}

check_legacy_runtime_absent() {
  [ ! -e "$LEGACY_WATCHER_PLIST" ] \
    || fail "仍发现旧版重签名 LaunchAgent，请先按 INSTALL.md 卸载 b-nnett 方案。"
  if launchctl print "gui/$(id -u)/com.codexplusplus.watcher" >/dev/null 2>&1; then
    fail "旧版重签名 LaunchAgent 仍处于加载状态，请先按 INSTALL.md 卸载 b-nnett 方案。"
  fi
}

version_at_least() {
  awk -v current="$1" -v required="$2" 'BEGIN {
    sub(/^v/, "", current); sub(/^v/, "", required)
    split(current, c, /[.-]/); split(required, r, /[.-]/)
    for (i = 1; i <= 3; i++) {
      cv = c[i] + 0; rv = r[i] + 0
      if (cv > rv) exit 0
      if (cv < rv) exit 1
    }
    exit 0
  }'
}

app_bundle_value() {
  plutil -extract "$2" raw "$1/Contents/Info.plist" 2>/dev/null || true
}

codexplusplus_install_valid() {
  [ -d "$CODEXPP_LAUNCHER" ] || return 1
  [ -d "$CODEXPP_MANAGER" ] || return 1
  verify_app_signature "$CODEXPP_LAUNCHER" || return 1
  verify_app_signature "$CODEXPP_MANAGER" || return 1
  [ "$(app_bundle_value "$CODEXPP_LAUNCHER" CFBundleIdentifier)" = "com.bigpizzav3.codexplusplus" ] \
    || return 1
  [ "$(app_bundle_value "$CODEXPP_MANAGER" CFBundleIdentifier)" = "com.bigpizzav3.codexplusplus.manager" ] \
    || return 1
  launcher_version=$(app_bundle_value "$CODEXPP_LAUNCHER" CFBundleShortVersionString)
  manager_version=$(app_bundle_value "$CODEXPP_MANAGER" CFBundleShortVersionString)
  [ -n "$launcher_version" ] || return 1
  [ "$launcher_version" = "$manager_version" ] || return 1
  version_at_least "$launcher_version" "$CODEXPP_MIN_VERSION" || return 1
  case "$(uname -m)" in
    arm64) required_arch="arm64" ;;
    x86_64) required_arch="x86_64" ;;
    *) return 1 ;;
  esac
  lipo -archs "$CODEXPP_LAUNCHER/Contents/MacOS/CodexPlusPlus" 2>/dev/null \
    | grep -qw "$required_arch" || return 1
  lipo -archs "$CODEXPP_MANAGER/Contents/MacOS/CodexPlusPlusManager" 2>/dev/null \
    | grep -qw "$required_arch" || return 1
}

check_codexplusplus_install() {
  codexplusplus_install_valid \
    || fail "BigPizzaV3 Codex++ 双 App 缺失、版本过旧、架构错误或签名结构损坏。"
}

select_release_arch() {
  case "$(uname -m)" in
    arm64) CODEXPP_RELEASE_ARCH="arm64" ;;
    x86_64) CODEXPP_RELEASE_ARCH="x64" ;;
    *) fail "BigPizzaV3 没有适用于当前架构的 macOS 安装包：$(uname -m)" ;;
  esac
}

use_pinned_release() {
  CODEXPP_RELEASE_VERSION="$CODEXPP_PINNED_VERSION"
  asset_name="CodexPlusPlus-${CODEXPP_PINNED_VERSION}-macos-${CODEXPP_RELEASE_ARCH}.dmg"
  CODEXPP_RELEASE_URL="https://github.com/${CODEXPP_REPO}/releases/download/v${CODEXPP_PINNED_VERSION}/${asset_name}"
  case "$CODEXPP_RELEASE_ARCH" in
    arm64) CODEXPP_RELEASE_SHA256="$CODEXPP_PINNED_ARM64_SHA256" ;;
    x64) CODEXPP_RELEASE_SHA256="$CODEXPP_PINNED_X64_SHA256" ;;
  esac
  warn "GitHub Release API 不可用，回退到内置并已核验的 BigPizzaV3 v${CODEXPP_PINNED_VERSION}。"
}

resolve_codexplusplus_release() {
  select_release_arch
  ensure_work_dir
  release_json="$THEME_WORK_DIR/codexplusplus-release.json"
  if [ -n "$CODEXPP_RELEASE_FILE" ]; then
    [ -f "$CODEXPP_RELEASE_FILE" ] || fail "Release 元数据文件不存在：$CODEXPP_RELEASE_FILE"
    cp "$CODEXPP_RELEASE_FILE" "$release_json"
  elif ! curl -fsSL \
    -H 'Accept: application/vnd.github+json' \
    -H 'X-GitHub-Api-Version: 2022-11-28' \
    -H 'User-Agent: demon-slayer-codex-theme-installer' \
    "$CODEXPP_RELEASE_API" -o "$release_json"; then
    use_pinned_release
    return 0
  fi

  release_tag=$(plutil -extract tag_name raw "$release_json" 2>/dev/null || true)
  release_version=${release_tag#v}
  printf '%s\n' "$release_version" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' \
    || fail "GitHub Release tag 不是预期的三段数字版本：$release_tag"
  version_at_least "$release_version" "$CODEXPP_MIN_VERSION" \
    || fail "BigPizzaV3 最新版本 $release_version 低于最低要求 $CODEXPP_MIN_VERSION。"
  expected_asset_name="CodexPlusPlus-${release_version}-macos-${CODEXPP_RELEASE_ARCH}.dmg"
  asset_index=0
  asset_name=""
  asset_url=""
  asset_digest=""
  while candidate_name=$(plutil -extract "assets.${asset_index}.name" raw "$release_json" 2>/dev/null); do
    if [ "$candidate_name" = "$expected_asset_name" ]; then
      asset_name=$candidate_name
      asset_url=$(plutil -extract "assets.${asset_index}.browser_download_url" raw "$release_json" 2>/dev/null || true)
      asset_digest=$(plutil -extract "assets.${asset_index}.digest" raw "$release_json" 2>/dev/null || true)
      break
    fi
    asset_index=$((asset_index + 1))
  done

  [ -n "$asset_name" ] || fail "最新 Release 没有 macOS ${CODEXPP_RELEASE_ARCH} DMG。"
  case "$asset_url" in
    "https://github.com/${CODEXPP_REPO}/releases/download/"*) ;;
    *) fail "Release DMG 下载地址不属于 ${CODEXPP_REPO}：$asset_url" ;;
  esac
  printf '%s\n' "$asset_digest" | grep -Eq '^sha256:[0-9a-fA-F]{64}$' \
    || fail "Release API 没有提供有效的 SHA-256 digest，拒绝无校验安装。"
  CODEXPP_RELEASE_VERSION=$release_version
  CODEXPP_RELEASE_URL=$asset_url
  CODEXPP_RELEASE_SHA256=${asset_digest#sha256:}
}

prepare_applications_dir() {
  if [ ! -d "$CODEXPP_APPLICATIONS_DIR" ]; then
    parent_dir=${CODEXPP_APPLICATIONS_DIR%/*}
    [ -n "$parent_dir" ] || parent_dir="/"
    if [ -w "$parent_dir" ]; then
      mkdir -p "$CODEXPP_APPLICATIONS_DIR"
    else
      has_command sudo || fail "创建 $CODEXPP_APPLICATIONS_DIR 需要管理员权限，但系统没有 sudo。"
      sudo mkdir -p "$CODEXPP_APPLICATIONS_DIR"
    fi
  fi
  if [ ! -w "$CODEXPP_APPLICATIONS_DIR" ]; then
    has_command sudo || fail "写入 $CODEXPP_APPLICATIONS_DIR 需要管理员权限，但系统没有 sudo。"
    say "安装 BigPizzaV3 到 $CODEXPP_APPLICATIONS_DIR 需要一次管理员授权。"
    sudo -v
    USE_SUDO=1
  fi
}

run_install_command() {
  if [ "$USE_SUDO" -eq 1 ]; then
    sudo "$@"
  else
    "$@"
  fi
}

verify_bigpizza_app() {
  app_path=$1
  expected_bundle_id=$2
  verify_app_signature "$app_path" || return 1
  [ "$(app_bundle_value "$app_path" CFBundleIdentifier)" = "$expected_bundle_id" ] || return 1
  [ "$(app_bundle_value "$app_path" CFBundleShortVersionString)" = "$CODEXPP_RELEASE_VERSION" ] \
    || return 1
}

install_app_bundle() {
  source_app=$1
  destination_app=$2
  expected_bundle_id=$3
  app_name=$(basename "$destination_app")
  staged_app="$CODEXPP_APPLICATIONS_DIR/.${app_name}.next.$$"
  previous_app="$CODEXPP_APPLICATIONS_DIR/.${app_name}.previous.$$"
  [ ! -e "$staged_app" ] || fail "暂存路径已存在：$staged_app"
  [ ! -e "$previous_app" ] || fail "回滚路径已存在：$previous_app"

  run_install_command ditto "$source_app" "$staged_app"
  run_install_command xattr -dr com.apple.quarantine "$staged_app" 2>/dev/null || true
  verify_bigpizza_app "$staged_app" "$expected_bundle_id" \
    || fail "暂存的 $app_name 未通过版本、Bundle ID 或代码签名结构校验。"

  if [ -e "$destination_app" ]; then
    run_install_command mv "$destination_app" "$previous_app"
  fi
  if ! run_install_command mv "$staged_app" "$destination_app"; then
    if [ -e "$previous_app" ]; then run_install_command mv "$previous_app" "$destination_app"; fi
    fail "无法启用 $app_name。"
  fi
  if ! verify_bigpizza_app "$destination_app" "$expected_bundle_id"; then
    run_install_command rm -rf "$destination_app"
    if [ -e "$previous_app" ]; then run_install_command mv "$previous_app" "$destination_app"; fi
    fail "$app_name 安装后校验失败，已尝试恢复旧版本。"
  fi
  if [ -e "$previous_app" ]; then run_install_command rm -rf "$previous_app"; fi
}

install_codexplusplus() {
  resolve_codexplusplus_release
  ensure_work_dir
  dmg_path="$THEME_WORK_DIR/CodexPlusPlus-${CODEXPP_RELEASE_VERSION}-${CODEXPP_RELEASE_ARCH}.dmg"
  if [ -n "$CODEXPP_LOCAL_DMG" ]; then
    [ -f "$CODEXPP_LOCAL_DMG" ] || fail "指定的 Codex++ DMG 不存在：$CODEXPP_LOCAL_DMG"
    cp "$CODEXPP_LOCAL_DMG" "$dmg_path"
  else
    say "下载 BigPizzaV3 Codex++ v${CODEXPP_RELEASE_VERSION} (${CODEXPP_RELEASE_ARCH})。"
    curl -fL --retry 3 --connect-timeout 20 "$CODEXPP_RELEASE_URL" -o "$dmg_path" \
      || fail "BigPizzaV3 DMG 下载失败：$CODEXPP_RELEASE_URL"
  fi
  actual_sha256=$(shasum -a 256 "$dmg_path" | awk '{print $1}')
  [ "$actual_sha256" = "$CODEXPP_RELEASE_SHA256" ] \
    || fail "BigPizzaV3 DMG SHA-256 不匹配；已拒绝安装。"
  hdiutil verify "$dmg_path" >/dev/null \
    || fail "BigPizzaV3 DMG 结构校验失败。"

  CODEXPP_MOUNT_POINT="$THEME_WORK_DIR/codexplusplus-mount"
  mkdir -p "$CODEXPP_MOUNT_POINT"
  hdiutil attach -readonly -nobrowse -mountpoint "$CODEXPP_MOUNT_POINT" "$dmg_path" >/dev/null \
    || fail "无法挂载 BigPizzaV3 DMG。"
  [ -d "$CODEXPP_MOUNT_POINT/Codex++.app" ] || fail "DMG 缺少 Codex++.app。"
  [ -d "$CODEXPP_MOUNT_POINT/Codex++ 管理工具.app" ] || fail "DMG 缺少 Codex++ 管理工具.app。"

  prepare_applications_dir
  install_app_bundle \
    "$CODEXPP_MOUNT_POINT/Codex++.app" \
    "$CODEXPP_LAUNCHER" \
    "com.bigpizzav3.codexplusplus"
  install_app_bundle \
    "$CODEXPP_MOUNT_POINT/Codex++ 管理工具.app" \
    "$CODEXPP_MANAGER" \
    "com.bigpizzav3.codexplusplus.manager"

  hdiutil detach "$CODEXPP_MOUNT_POINT" >/dev/null
  CODEXPP_MOUNT_POINT=""
  check_codexplusplus_install
  say "BigPizzaV3 Codex++ v${CODEXPP_RELEASE_VERSION} 已安装并校验。"
}

ensure_codexplusplus() {
  if [ "$CODEXPP_FORCE_INSTALL" != "1" ] && codexplusplus_install_valid; then
    installed_version=$(app_bundle_value "$CODEXPP_LAUNCHER" CFBundleShortVersionString)
    say "BigPizzaV3 Codex++ v${installed_version} 已就绪。"
    return 0
  fi
  say "BigPizzaV3 Codex++ 缺失、过旧或需要修复；开始自动安装。"
  install_codexplusplus
}

install_theme() {
  ensure_work_dir
  if [ -n "$THEME_LOCAL_SOURCE" ]; then
    source_path=$THEME_LOCAL_SOURCE
    [ -d "$source_path" ] || fail "指定的主题源码目录不存在：$source_path"
  else
    archive_path="$THEME_WORK_DIR/theme.tar.gz"
    source_path="$THEME_WORK_DIR/source"
    mkdir -p "$source_path"
    say "下载 ${THEME_REPO}@${THEME_REF}。"
    curl -fsSL "$THEME_ARCHIVE_URL" -o "$archive_path" \
      || fail "主题下载失败：$THEME_ARCHIVE_URL"
    tar -xzf "$archive_path" -C "$source_path" --strip-components 1 \
      || fail "无法解压主题归档。"
  fi
  source_script="$source_path/$THEME_SCRIPT_NAME"
  validate_theme_script "$source_script"

  mkdir -p "$THEME_SCRIPT_DIR"
  staged_path="$THEME_SCRIPT_DIR/.${THEME_SCRIPT_NAME}.new.$$"
  cp "$source_script" "$staged_path"
  validate_theme_script "$staged_path"
  mv -f "$staged_path" "$THEME_SCRIPT_PATH"
  source_sha256=$(shasum -a 256 "$source_script" | awk '{print $1}')
  installed_sha256=$(shasum -a 256 "$THEME_SCRIPT_PATH" | awk '{print $1}')
  [ "$source_sha256" = "$installed_sha256" ] || fail "主题脚本原子安装后哈希不一致。"
}

validate_theme_script() {
  script_path=$1
  [ -f "$script_path" ] || fail "主题源码缺少 BigPizzaV3 用户脚本：$script_path"
  script_bytes=$(wc -c < "$script_path" | awk '{print $1}')
  [ "$script_bytes" -gt 0 ] && [ "$script_bytes" -le 2097152 ] \
    || fail "主题脚本为空或超过 2 MiB 安全上限：$script_path"
  grep -q '__demonSlayerCodexTheme' "$script_path" \
    || fail "用户脚本未通过运行时标记检查：$script_path"
  grep -q 'theme.start(api)' "$script_path" \
    || fail "用户脚本缺少 start 生命周期：$script_path"
  grep -q 'theme.stop()' "$script_path" \
    || fail "用户脚本缺少 stop 生命周期：$script_path"
}

check_theme_install() {
  validate_theme_script "$THEME_SCRIPT_PATH"
}

remove_user_tree() {
  target_path=$1
  label=$2
  expected_name=$3
  [ -e "$target_path" ] || return 0
  [ "$(basename "$target_path")" = "$expected_name" ] \
    || fail "拒绝删除名称异常的 $label：$target_path"
  case "$target_path" in
    "$HOME"|"$HOME/"|"/"|"") fail "拒绝删除过宽路径：$target_path" ;;
    "$HOME"/*) ;;
    *) fail "拒绝删除 HOME 之外的 $label：$target_path" ;;
  esac
  rm -rf "$target_path"
  say "已删除 $label：$target_path"
}

remove_codexplusplus_app() {
  app_path=$1
  expected_name=$2
  [ -e "$app_path" ] || return 0
  [ "$(basename "$app_path")" = "$expected_name" ] \
    || fail "拒绝删除名称异常的 App：$app_path"
  prepare_applications_dir
  run_install_command rm -rf "$app_path"
  say "已删除：$app_path"
}

purge_codexplusplus() {
  if pgrep -x CodexPlusPlus >/dev/null 2>&1 \
    || pgrep -x CodexPlusPlusManager >/dev/null 2>&1; then
    fail "Codex++ 或管理工具仍在运行；请完全退出后再执行 --purge。"
  fi
  if launchctl print "gui/$(id -u)/com.codexplusplus.watcher" >/dev/null 2>&1; then
    launchctl bootout "gui/$(id -u)/com.codexplusplus.watcher" >/dev/null 2>&1 \
      || fail "无法停止旧版重签名 watcher。"
  fi
  if [ -e "$LEGACY_WATCHER_PLIST" ]; then
    [ "$(basename "$LEGACY_WATCHER_PLIST")" = "com.codexplusplus.watcher.plist" ] \
      || fail "拒绝删除名称异常的 watcher：$LEGACY_WATCHER_PLIST"
    rm -f "$LEGACY_WATCHER_PLIST"
    say "已删除旧版 watcher：$LEGACY_WATCHER_PLIST"
  fi

  remove_codexplusplus_app "$CODEXPP_LAUNCHER" "Codex++.app"
  remove_codexplusplus_app "$CODEXPP_MANAGER" "Codex++ 管理工具.app"
  remove_user_tree "$CODEXPP_CONFIG_DIR" "Codex++ 配置" "Codex++"
  remove_user_tree "$CODEXPP_STATE_DIR" "Codex++ 状态与日志" ".codex-session-delete"
  remove_user_tree "$LEGACY_SUPPORT_DIR" "旧方案支持目录" "codex-plusplus"
  if [ -e "$LEGACY_BIN" ] || [ -L "$LEGACY_BIN" ]; then
    [ "$(basename "$LEGACY_BIN")" = "codexplusplus" ] \
      || fail "拒绝删除名称异常的旧 CLI：$LEGACY_BIN"
    case "$LEGACY_BIN" in
      "$HOME"/*) rm -f "$LEGACY_BIN" ;;
      *) fail "拒绝删除 HOME 之外的旧 CLI：$LEGACY_BIN" ;;
    esac
    say "已删除旧 CLI：$LEGACY_BIN"
  fi

  say "Codex++ 与已知旧方案残留已清除；官方 Codex、~/.codex 和 Codex 会话数据未修改。"
}

if [ "$PURGE_ONLY" -eq 1 ]; then
  purge_codexplusplus
  exit 0
fi

if [ "$UNINSTALL_ONLY" -eq 1 ]; then
  if [ -f "$THEME_SCRIPT_PATH" ]; then
    rm -f "$THEME_SCRIPT_PATH"
    say "已删除主题脚本：$THEME_SCRIPT_PATH"
  else
    say "主题脚本本来就不存在。"
  fi
  say "官方 Codex、Codex++ 和用户数据均未修改。"
  exit 0
fi

CODEX_APP=$(find_codex_app || true)
[ -n "$CODEX_APP" ] || fail "未找到官方 Codex Desktop；请先从 OpenAI 官方渠道安装并至少启动一次。"
say "Codex Desktop：$CODEX_APP"
check_codex_signature "$CODEX_APP"
check_legacy_runtime_absent

if [ "$CHECK_ONLY" -eq 1 ]; then
  check_codexplusplus_install
  check_theme_install
  say "检查通过：官方 Codex 保持原签名，主题由 BigPizzaV3 外部启动器加载。"
  exit 0
fi

ensure_codexplusplus
install_theme
check_theme_install

if [ -f "$CODEXPP_CONFIG_DIR/user_scripts.json" ] \
  && grep -q '"enabled"[[:space:]]*:[[:space:]]*false' "$CODEXPP_CONFIG_DIR/user_scripts.json"; then
  warn "用户脚本总开关可能已关闭，请在 Codex++ 管理工具中启用。"
fi

say "安装完成：$THEME_SCRIPT_PATH"
say "完全退出当前 Codex 后，请从 $CODEXPP_LAUNCHER 启动。"
say "直接打开官方 Codex 不会加载主题，这是外部注入方案的预期行为。"
