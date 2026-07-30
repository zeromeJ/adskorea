# 공개 웹 영상 최적화

CMS에는 원본을 보관하고 공개 페이지에는 H.264 MP4 1080p와 720p만 연결합니다.

```bash
chmod +x scripts/optimize-videos.sh
scripts/optimize-videos.sh input.mp4 output/video-name
```

출력 파일은 `faststart`가 적용됩니다. 업로드 후 해당 영상 자산의 metadata에 아래 공개 URL을 저장합니다.

```json
{
  "optimized1080Url": "https://.../video-name-1080p.mp4",
  "optimized720Url": "https://.../video-name-720p.mp4"
}
```

공개 페이지는 모바일에서 720p를 우선하고, 영상은 `preload="none"`으로 썸네일만 먼저 표시합니다. 원본 URL은 두 최적화 URL이 모두 없을 때만 호환용 fallback으로 사용합니다.
