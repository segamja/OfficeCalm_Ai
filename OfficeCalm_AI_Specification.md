# [기술명세서] 직장인 타겟 AI 명상 웹앱 (OfficeCalm AI)

## 1. 프로젝트 개요
* **프로젝트명:** OfficeCalm AI (오피스캄 AI)
* **목적:** 만성 번아웃과 직무 스트레스에 시달리는 직장인을 위한 AI 기반 맞춤형 명상 및 즉각적 멘탈 케어 웹앱 MVP 빌드
* **개발 환경 및 기술 스택:** Vanilla HTML5, CSS3, Modern JavaScript (ES6+), 브라우저 내장 API (LocalStorage, Web Notification API)
* **아키텍처 특성:** 별도의 백엔드 서버나 데이터베이스 구축 없이, 모든 사용자 데이터를 브라우저 샌드박스(LocalStorage) 내에서 처리하여 1인 개발 공수를 극소화함

---

## 2. 프로젝트 폴더 및 파일 구조 (Directory Structure)

```
OfficeCalm_Ai/
│
├── index.html          # 메인 UI 구조 및 단일 페이지 마크업
│
├── css/
│   └── style.css       # 전체 레이아웃, 다크모드 테마, 탭·반응형, 브리드 애니메이션
│
├── js/
│   ├── app.js              # 앱 진입점, LocalStorage 연동 및 초기화 로직
│   ├── ai-engine.js        # 가상 AI 스크립트 프리셋 데이터 및 타이핑 효과
│   ├── level-gate.js       # 레벨 기반 콘텐츠 잠금 및 안내 모달
│   ├── audio-player.js     # HTML5 Audio 기반 MP3 재생·세션 가이드
│   ├── gallery.js          # 브리드 탭 힐링 이미지 갤러리
│   ├── progress.js         # XP, 레벨, Mind Energy
│   ├── journal.js          # 감사일기
│   ├── tabs.js             # 모바일 탭 전환 (PC는 3열 동시 노출)
│   └── notifications.js    # Web Notification API 리마인더
│
└── assets/
    ├── audio/
    └── images/
```

### 각 파일별 역할 정의
* **`index.html`:** 앱의 뼈대. 3개 탭 패널(AI / 브리드 / 라이브러리) 마크업과 모바일 하단 탭 바를 포함합니다.
* **`css/style.css`:** Flexbox·Grid 레이아웃, 900px 브레이크포인트 반응형, 호흡 버블 `@keyframes breathe` 애니메이션을 관리합니다.
* **`js/app.js`:** 앱 진입점. localStorage 로드, XP·레벨·감사일기·오디오·탭 초기화를 수행합니다.
* **`js/ai-engine.js`:** 직장인 상황별 프리셋 스크립트와 타이핑 인터랙션을 처리합니다.
* **`js/level-gate.js`:** 레벨 미달 콘텐츠 클릭 시 잠금 UI와 안내 모달을 제어합니다.
* **`js/tabs.js`:** 모바일(899px 이하)에서 하단 탭 전환. PC(900px 이상)에서는 3열 동시 노출.
* **`js/audio-player.js`:** MP3 재생 및 플레이어 UI를 제어합니다.
* **`js/notifications.js`:** 명상 미완료 시 로컬 리마인더 알림을 전송합니다.

---

## 3. UI/UX 및 레이아웃 정의 (반응형 탭 + 3열)

전체 화면은 Calm 앱 특유의 심해 다크모드 톤을 유지합니다.

* **배경색:** #0f172a (Deep Slate Blue)
* **포인트 컬러:** #38bdf8 (Sky Blue), #34d399 (Mint Green)

### 반응형 전략

| 화면 | 레이아웃 |
|------|----------|
| PC (≥ 900px) | 3열 Grid — 3개 영역 동시 노출, 탭 바 숨김 |
| 모바일 (< 900px) | 하단 고정 탭 바 — 활성 패널 1개만 표시 |

### 3개 영역 구성

1. **AI 스트레스 진단실** — 상황 입력, 퀵 프리셋, AI 명상 스크립트 출력 (모든 AI 기능 무료)
2. **오피스 브리드** — 호흡 버블 애니메이션 + 힐링 이미지 갤러리 (8초 랜덤 전환)
3. **콘텐츠 라이브러리** — 오디오 목록, 감사일기, 오디오 플레이어 (레벨 게이트: 딥슬립 Lv.3, 번아웃 회복 Lv.5)

### Header
서비스 로고, XP·레벨·Mind Energy, 스트릭, 오늘의 명상 완료 버튼, 알림 토글을 표시합니다. 모바일에서는 컴팩트 헤더로 축소됩니다.

---

## 4. 핵심 기능별 데이터 및 로직 명세

### 4.1. 데일리 리추얼 트래커 (Daily Streak Tracker)
* **Storage Key:** `officeCalm_user_state`
```json
{
  "streak": 3,
  "lastCompletedDate": "2026-07-10",
  "xp": 85,
  "level": 2,
  "mindEnergy": 68,
  "lastJournalDate": "2026-07-10",
  "gratitudeJournal": []
}
```
* 앱 로드 시 `lastCompletedDate`를 검사해 스트릭을 유지하거나 리셋합니다.

### 4.2. AI 실시간 스트레스 진단 및 명상 스크립트 생성
* 퀵 프리셋: [회의 5분 전], [상사 잔소리 직후], [출근길 무기력], [야근 번아웃]
* 자유 입력 + 타이핑 효과 출력
* 스크립트 생성 시 상황별 명상 음악 자동 재생

### 4.3. 오피스 브리드 버블 (Breathe Bubble)
* 4초 들이쉬기 · 2초 멈추기 · 4초 내쉬기 무한 반복
* 하단에 힐링 이미지 갤러리 배치

### 4.4. 레벨 게이트 시스템
* **야근 후 딥슬립:** Lv.3 이상 해금
* **번아웃 회복 명상:** Lv.5 이상 해금
* 레벨 미달 시 재생 차단 + XP 획득 안내 모달 표시
* AI 기능은 제한 없음 (프리미엄/페이월 없음)

### 4.5. 모바일 탭 전환 (`tabs.js`)
* `sessionStorage` key: `officeCalm_active_tab`
* `matchMedia('(max-width: 899px)')`로 PC/모바일 모드 전환
* 오디오 재생 중 탭 전환해도 재생 상태 유지

---

## 5. 기술 스택 및 선택 이유

| 영역 | 선택 | 이유 |
|---|---|---|
| 마크업 | HTML5 | 별도 설치 없이 브라우저 즉시 실행 |
| 스타일 | CSS3 (Vanilla) | 빌드 도구 불필요, 반응형 탭·3열 Grid 단순 구현 |
| 로직 | JavaScript ES6 (`<script>` 태그) | 로컬 파일 더블클릭 실행 가능 |
| 데이터 저장 | `localStorage` | 백엔드/DB 없이 기기 내 데이터 영속화 |
| 오디오 재생 | HTML5 `<audio>` | 네이티브 API로 충분 |
| 알림 | Web Notification API | 브라우저 권한 기반 로컬 알림 |
| 배포 | GitHub Pages | 무료 정적 호스팅, URL 즉시 공유 |
