#!/usr/bin/env bash
set -euo pipefail

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg가 필요합니다. 설치 후 다시 실행해 주세요." >&2
  exit 1
fi

if [ "$#" -ne 2 ]; then
  echo "사용법: scripts/optimize-videos.sh <원본.mp4> <출력_기본경로>" >&2
  exit 1
fi

input_file="$1"
output_base="$2"

ffmpeg -y -i "$input_file" \
  -vf "scale=-2:1080:force_original_aspect_ratio=decrease" \
  -c:v libx264 -preset slow -crf 22 -profile:v high -level 4.1 \
  -c:a aac -b:a 128k -movflags +faststart \
  "${output_base}-1080p.mp4"

ffmpeg -y -i "$input_file" \
  -vf "scale=-2:720:force_original_aspect_ratio=decrease" \
  -c:v libx264 -preset slow -crf 23 -profile:v high -level 4.0 \
  -c:a aac -b:a 96k -movflags +faststart \
  "${output_base}-720p.mp4"

echo "생성 완료:"
echo "  ${output_base}-1080p.mp4"
echo "  ${output_base}-720p.mp4"
