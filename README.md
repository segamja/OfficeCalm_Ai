# OfficeCalm AI

만성 번아웃과 직무 스트레스에 시달리는 직장인을 위한 AI 기반 맞춤형 명상 및 즉각적 멘탈 케어 웹앱 MVP입니다.

백엔드 없이 브라우저만으로 동작하며, 사용자 데이터와 구독 상태는 `localStorage`에 저장됩니다.

## 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 마크업 | HTML5 | 별도 설치 없이 브라우저 즉시 실행 |
| 스타일 | CSS3 (Vanilla) | 빌드 도구 없이 순수 CSS로 유지보수 단순화 |
| 로직 | JavaScript ES6 (`<script>` 태그) | `import/export` 없이 로컬 파일 더블클릭 실행 가능 |
| 데이터 저장 | `localStorage` | 서버 없이 기기 내 데이터 영속화 |
| 오디오 재생 | HTML5 `<audio>` | 네이티브 API로 MP3 재생 |
| 알림 | Web Notification API | 서버 푸시 없이 브라우저 권한 기반 로컬 리마인더 |
| 배포 | GitHub Pages | 무료 정적 호스팅, URL 공유로 즉시 테스트 |

## 주요 기능

- **데일리 리추얼 트래커** — 연속 명상 일수 기록 (`officeCalm_user_state`)
- **AI 스트레스 진단실** — 상황별 명상 스크립트 + 타이핑 효과
- **오피스 브리드 버블** — 4초 들이쉬기 · 2초 멈추기 · 4초 내쉬기
- **콘텐츠 라이브러리** — 무료/프리미엄 MP3 오디오 재생
- **페이월** — 프리미엄 기능 잠금 및 30일 무료 체험 시뮬레이션
- **명상 리마인더** — 매일 18시, 미완료 시 브라우저 알림 (탭이 열려 있을 때)

## 프로젝트 구조

```
OfficeCalm_Ai/
├── index.html              # 메인 SPA 마크업
├── README.md
├── OfficeCalm_AI_Specification.md
├── css/
│   └── style.css           # 다크모드 레이아웃, 브리드 애니메이션
├── js/
│   ├── ai-engine.js        # AI 프리셋 스크립트, 타이핑 효과
│   ├── paywall.js          # 프리미엄 잠금, 결제 모달
│   ├── audio-player.js     # HTML5 Audio MP3 재생
│   ├── notifications.js    # Web Notification API 리마인더
│   └── app.js              # 앱 진입점, localStorage 연동
└── assets/
    ├── audio/              # 무료 라이선스 MP3 트랙
    │   ├── white-noise.mp3
    │   ├── desk-stretch.mp3
    │   ├── deep-sleep.mp3
    │   ├── burnout-recovery.mp3
    │   └── CREDITS.txt
    └── icons/
```

## 실행 방법

### 1) 로컬 파일 실행 (권장 — 명세 기준)

`index.html`을 브라우저에서 **더블클릭**하여 실행합니다.  
ES 모듈을 사용하지 않으므로 별도 서버 없이도 동작합니다.

### 2) npm 스크립트로 실행

```bash
npm start
```

브라우저에서 `http://localhost:3000` 접속

### 3) GitHub Pages 배포

1. GitHub 저장소에 푸시
2. **Settings → Pages → Source**를 `main` 브랜치 / `/ (root)`로 설정
3. 배포 URL로 접속

## 사용 가이드

1. **무료 체험** — `[회의 5분 전]` 퀵 버튼 또는 무료 오디오 재생
2. **프리미엄** — 자유 입력, 프리미엄 퀵 버튼/오디오 클릭 시 페이월 모달 표시
3. **체험 해제** — 모달에서 `30일 무료 체험 시작하기` 클릭
4. **스트릭** — `오늘의 명상 완료` 버튼으로 연속 일수 기록
5. **알림** — 헤더 `🔕 알림 OFF` 버튼으로 리마인더 ON/OFF

## localStorage 스키마

```json
{
  "streak": 3,
  "lastCompletedDate": "2026-07-10",
  "isPremium": false
}
```

- **Key:** `officeCalm_user_state`
- 어제 완료 → 스트릭 유지 / 완료 시 +1
- 2일 이상 공백 → 스트릭 0으로 리셋

## 오디오 크레딧

`assets/audio/CREDITS.txt` 참고.  
Orange Free Sounds(CC BY 4.0), Internet Archive(Jamendo) 등 무료 라이선스 트랙을 사용합니다.

## 알림 한계

Web Notification API는 **브라우저 탭이 열려 있을 때** `setInterval` 기반으로 동작합니다.  
앱이 완전히 닫힌 상태의 백그라운드 푸시는 Service Worker + 서버가 필요하며, 본 MVP 범위 밖입니다.

## 상세 명세

기능·UI·로직 상세는 [`OfficeCalm_AI_Specification.md`](./OfficeCalm_AI_Specification.md)를 참고하세요.
