#!/usr/bin/env bash

set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="$APP_ROOT/assets/app_logo.png"
RES_ROOT="$APP_ROOT/android/app/src/main/res"
TMP_ICON="$(mktemp -t adelson_app_icon).png"
BUILD_APK=false

trap 'rm -f "$TMP_ICON"' EXIT

if [[ "${1:-}" == "--build" ]]; then
  BUILD_APK=true
elif [[ $# -gt 0 ]]; then
  echo "사용법: ./tool/update_app_icon.sh [--build]" >&2
  exit 1
fi

if [[ ! -f "$SOURCE" ]]; then
  echo "로고 파일을 찾을 수 없습니다: $SOURCE" >&2
  exit 1
fi

if ! command -v sips >/dev/null 2>&1; then
  echo "이 스크립트는 macOS의 sips 명령이 필요합니다." >&2
  exit 1
fi

mkdir -p \
  "$RES_ROOT/drawable-nodpi" \
  "$RES_ROOT/mipmap-mdpi" \
  "$RES_ROOT/mipmap-hdpi" \
  "$RES_ROOT/mipmap-xhdpi" \
  "$RES_ROOT/mipmap-xxhdpi" \
  "$RES_ROOT/mipmap-xxxhdpi"

# 450×450 원본의 과한 외곽 여백만 줄이고 로고 비율은 유지합니다.
sips --cropToHeightWidth 400 400 "$SOURCE" --out "$TMP_ICON" >/dev/null

cp "$TMP_ICON" "$RES_ROOT/drawable-nodpi/ic_launcher_foreground.png"
sips -z 48 48 "$TMP_ICON" --out "$RES_ROOT/mipmap-mdpi/ic_launcher.png" >/dev/null
sips -z 72 72 "$TMP_ICON" --out "$RES_ROOT/mipmap-hdpi/ic_launcher.png" >/dev/null
sips -z 96 96 "$TMP_ICON" --out "$RES_ROOT/mipmap-xhdpi/ic_launcher.png" >/dev/null
sips -z 144 144 "$TMP_ICON" --out "$RES_ROOT/mipmap-xxhdpi/ic_launcher.png" >/dev/null
sips -z 192 192 "$TMP_ICON" --out "$RES_ROOT/mipmap-xxxhdpi/ic_launcher.png" >/dev/null

echo "Android 앱 아이콘을 갱신했습니다."

if [[ "$BUILD_APK" == true ]]; then
  VERSION_LINE="$(grep '^version:' "$APP_ROOT/pubspec.yaml")"
  VERSION_VALUE="${VERSION_LINE#version: }"
  VERSION_NAME="${VERSION_VALUE%+*}"
  BUILD_NUMBER="${VERSION_VALUE#*+}"
  NEXT_BUILD_NUMBER="$((BUILD_NUMBER + 1))"

  sed -i '' \
    "s/^version: .*/version: $VERSION_NAME+$NEXT_BUILD_NUMBER/" \
    "$APP_ROOT/pubspec.yaml"

  echo "빌드 번호를 $NEXT_BUILD_NUMBER(으)로 올렸습니다."
  (cd "$APP_ROOT" && flutter build apk --release)

  RELEASE_DIR="$APP_ROOT/build/app/outputs/flutter-apk"
  RELEASE_APK="$RELEASE_DIR/app-release.apk"
  NAMED_APK="$RELEASE_DIR/adelson-admin-$VERSION_NAME+$NEXT_BUILD_NUMBER.apk"

  cp "$RELEASE_APK" "$NAMED_APK"
  echo "설치용 APK: $NAMED_APK"
fi
