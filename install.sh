#!/bin/sh
set -eu

THEME_REPO="anson-no-bug/codex-themes-demon-slayer"
THEME_REF=${DEMON_SLAYER_THEME_REF:-main}
THEME_ARCHIVE_URL="https://codeload.github.com/${THEME_REPO}/tar.gz/${THEME_REF}"
CODEXPP_REPO="b-nnett/codex-plusplus"
CODEXPP_FORMULA="b-nnett/codex-plusplus/codexplusplus"
CODEXPP_BOOTSTRAP_URL="https://raw.githubusercontent.com/${CODEXPP_REPO}/main/install.sh"
THEME_SOURCE_PARENT=${DEMON_SLAYER_THEME_SOURCE_PARENT:-"$HOME/Library/Application Support/codex-plusplus/sources"}
THEME_SOURCE_DIR="$THEME_SOURCE_PARENT/codex-themes-demon-slayer"
THEME_TWEAK_DIR=${DEMON_SLAYER_THEME_TWEAK_DIR:-"$HOME/Library/Application Support/codex-plusplus/tweaks"}
THEME_TWEAK_LINK="$THEME_TWEAK_DIR/dev.local.demon-slayer-codex-theme"
CODEXPP_STATE_FILE="$HOME/Library/Application Support/codex-plusplus/state.json"
CHECK_ONLY=0
THEME_WORK_DIR=""
THEME_DOWNLOADED_SOURCE=""
CODEXPP_BIN=""

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
    '  无参数    安装或修复 b-nnett Codex++，再安装鬼杀队主题' \
    '  --check   只检查 Codex++、签名模式、主题源码和 tweak 链接' \
    '' \
    '可选环境变量：' \
    '  DEMON_SLAYER_THEME_REF            主题 Git ref（默认 main）' \
    '  DEMON_SLAYER_THEME_SOURCE_PARENT  主题源码父目录' \
    '  DEMON_SLAYER_THEME_TWEAK_DIR      Codex++ tweaks 目录' \
    '  CODEXPLUSPLUS_BIN                 指定 codexplusplus 可执行文件'
}

cleanup() {
  if [ -n "$THEME_WORK_DIR" ] && [ -d "$THEME_WORK_DIR" ]; then
    rm -rf "$THEME_WORK_DIR"
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

for dependency in curl tar mktemp grep mkdir mv rm ln readlink date; do
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

resolve_codexplusplus() {
  if [ -n "${CODEXPLUSPLUS_BIN:-}" ] && [ -x "$CODEXPLUSPLUS_BIN" ]; then
    CODEXPP_BIN=$CODEXPLUSPLUS_BIN
    return 0
  fi

  command_path=$(command -v codexplusplus 2>/dev/null || true)
  for candidate in \
    "$command_path" \
    "/opt/homebrew/bin/codexplusplus" \
    "/usr/local/bin/codexplusplus" \
    "$HOME/.local/bin/codexplusplus" \
    "$HOME/.bun/bin/codexplusplus"
  do
    if [ -n "$candidate" ] && [ -x "$candidate" ]; then
      CODEXPP_BIN=$candidate
      return 0
    fi
  done
  return 1
}

resolve_brew() {
  command_path=$(command -v brew 2>/dev/null || true)
  for candidate in "$command_path" "/opt/homebrew/bin/brew" "/usr/local/bin/brew"; do
    if [ -n "$candidate" ] && [ -x "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

node_is_usable() {
  has_command node || return 1
  has_command npm || return 1
  node_major=$(node -p "Number(process.versions.node.split('.')[0])" 2>/dev/null || true)
  case "$node_major" in
    ""|*[!0-9]*) return 1 ;;
  esac
  [ "$node_major" -ge 20 ]
}

bootstrap_codexplusplus() {
  resolve_codexplusplus && return 0
  [ "$CHECK_ONLY" -eq 0 ] || fail "未找到 b-nnett codexplusplus；请先运行无参数安装。"

  brew_bin=$(resolve_brew || true)
  if [ -n "$brew_bin" ]; then
    say "未找到 Codex++；通过 Homebrew 安装 ${CODEXPP_FORMULA}。"
    "$brew_bin" install "$CODEXPP_FORMULA" || fail "Homebrew 安装 b-nnett Codex++ 失败。"
    resolve_codexplusplus || fail "Homebrew 已完成，但仍找不到 codexplusplus 命令。"
    return 0
  fi

  if node_is_usable; then
    has_command bash || fail "b-nnett 源码安装器需要 bash。"
    THEME_WORK_DIR=$(mktemp -d "${TMPDIR:-/tmp}/demon-slayer-codex-theme.XXXXXX")
    bootstrap_path="$THEME_WORK_DIR/codex-plusplus-install.sh"
    say "未找到 Codex++；下载 b-nnett 官方源码安装器。"
    curl -fsSL "$CODEXPP_BOOTSTRAP_URL" -o "$bootstrap_path" \
      || fail "无法下载 b-nnett Codex++ 安装器。"
    bash "$bootstrap_path" --local \
      || fail "b-nnett Codex++ 源码安装失败。"
    resolve_codexplusplus || fail "源码安装完成，但仍找不到 codexplusplus 命令。"
    return 0
  fi

  fail "未安装 Codex++，且本机没有 Homebrew，也没有 Node.js 20+ 与 npm。请先安装其中一组依赖后重试。"
}

codexplusplus_status() {
  "$CODEXPP_BIN" status 2>&1 || true
}

check_patched_runtime() {
  status_output=$(codexplusplus_status)
  printf '%s\n' "$status_output" | grep -q 'matches patched' \
    || fail "b-nnett Codex++ 尚未正确修改 Codex。"
  printf '%s\n' "$status_output" | grep -Eq 'sign mode:[[:space:]]+local-identity' \
    || fail "Codex++ 当前不是稳定本地签名；完全退出 Codex 后运行：codexplusplus repair --force --local"
}

ensure_patched_runtime() {
  if [ -f "$CODEXPP_STATE_FILE" ]; then
    status_output=$(codexplusplus_status)
    if printf '%s\n' "$status_output" | grep -q 'matches patched' \
      && printf '%s\n' "$status_output" | grep -Eq 'sign mode:[[:space:]]+local-identity'; then
      say "b-nnett Codex++ 已安装并使用稳定本地签名。"
      return 0
    fi
    say "修复 b-nnett Codex++ 补丁并切换为稳定本地签名。"
    "$CODEXPP_BIN" repair --force --local \
      || fail "Codex++ repair --force --local 失败。"
  else
    say "安装 b-nnett Codex++，并使用稳定本地签名。"
    "$CODEXPP_BIN" install --local \
      || fail "Codex++ install --local 失败。"
  fi
  check_patched_runtime
}

download_theme() {
  if [ -z "$THEME_WORK_DIR" ]; then
    THEME_WORK_DIR=$(mktemp -d "${TMPDIR:-/tmp}/demon-slayer-codex-theme.XXXXXX")
  fi
  archive_path="$THEME_WORK_DIR/theme.tar.gz"
  extract_path="$THEME_WORK_DIR/source"
  mkdir -p "$extract_path"
  say "下载 ${THEME_REPO}@${THEME_REF}。"
  curl -fsSL "$THEME_ARCHIVE_URL" -o "$archive_path" \
    || fail "主题下载失败：$THEME_ARCHIVE_URL"
  tar -xzf "$archive_path" -C "$extract_path" --strip-components 1 \
    || fail "无法解压主题归档。"
  [ -f "$extract_path/manifest.json" ] || fail "下载内容缺少 manifest.json。"
  [ -f "$extract_path/index.js" ] || fail "下载内容缺少 index.js。"
  "$CODEXPP_BIN" validate-tweak "$extract_path" \
    || fail "下载的主题未通过 Codex++ 校验。"
  THEME_DOWNLOADED_SOURCE=$extract_path
}

replace_theme_source() {
  downloaded_source=$1
  next_source="${THEME_SOURCE_DIR}.next"
  previous_source="${THEME_SOURCE_DIR}.previous"

  case "$THEME_SOURCE_DIR" in
    "$THEME_SOURCE_PARENT"/*) ;;
    *) fail "主题安装目录不在预期父目录内：$THEME_SOURCE_DIR" ;;
  esac

  mkdir -p "$THEME_SOURCE_PARENT"
  rm -rf "$next_source"
  mv "$downloaded_source" "$next_source"

  rm -rf "$previous_source"
  if [ -e "$THEME_SOURCE_DIR" ]; then
    mv "$THEME_SOURCE_DIR" "$previous_source"
  fi
  mv "$next_source" "$THEME_SOURCE_DIR"
}

link_theme() {
  mkdir -p "$THEME_TWEAK_DIR"
  if [ -L "$THEME_TWEAK_LINK" ]; then
    rm -f "$THEME_TWEAK_LINK"
  elif [ -e "$THEME_TWEAK_LINK" ]; then
    fail "tweak 目标已存在且不是符号链接，未覆盖：$THEME_TWEAK_LINK"
  fi
  ln -s "$THEME_SOURCE_DIR" "$THEME_TWEAK_LINK"
  printf '%s\n' "$(date +%s)" > "$THEME_SOURCE_DIR/.codexpp-dev-reload"
}

check_theme_install() {
  [ -f "$THEME_SOURCE_DIR/manifest.json" ] || fail "主题源码未安装：$THEME_SOURCE_DIR"
  [ -f "$THEME_SOURCE_DIR/index.js" ] || fail "主题入口未安装：$THEME_SOURCE_DIR/index.js"
  [ -L "$THEME_TWEAK_LINK" ] || fail "主题 tweak 链接不存在：$THEME_TWEAK_LINK"
  link_target=$(readlink "$THEME_TWEAK_LINK" 2>/dev/null || true)
  [ "$link_target" = "$THEME_SOURCE_DIR" ] \
    || fail "主题 tweak 链接指向错误位置：$link_target"
  "$CODEXPP_BIN" validate-tweak "$THEME_SOURCE_DIR" \
    || fail "已安装主题未通过 Codex++ 校验。"
}

CODEX_APP=$(find_codex_app || true)
[ -n "$CODEX_APP" ] || fail "未找到 Codex Desktop；请先安装并至少启动一次。"
say "Codex Desktop：$CODEX_APP"

bootstrap_codexplusplus
say "b-nnett Codex++：$CODEXPP_BIN"

if [ "$CHECK_ONLY" -eq 1 ]; then
  check_patched_runtime
  check_theme_install
  say "检查通过：直接启动 Codex 时会加载鬼杀队主题。"
  exit 0
fi

ensure_patched_runtime
download_theme
replace_theme_source "$THEME_DOWNLOADED_SOURCE"
link_theme
"$CODEXPP_BIN" safe-mode --off >/dev/null 2>&1 || warn "无法自动关闭 safe mode，请在 Codex++ 设置中确认主题已启用。"
check_theme_install

say "安装完成。完全退出后直接打开原 Codex；不需要单独的 Codex++ 启动器。"
