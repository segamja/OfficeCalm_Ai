# [기술명세서] 직장인 타겟 AI 명상 웹앱 (OfficeCalm AI)

## 1. 프로젝트 개요
* **프로젝트명:** OfficeCalm AI (오피스캄 AI)
* **목적:** 만성 번아웃과 직무 스트레스에 시달리는 직장인을 위한 AI 기반 맞춤형 명상 및 즉각적 멘탈 케어 웹앱 MVP 빌드
* **개발 환경 및 기술 스택:** Vanilla HTML5, CSS3, Modern JavaScript (ES6+), 브라우저 내장 API (LocalStorage, Web Audio API)
* **아키텍처 특성:** 별도의 백엔드 서버나 데이터베이스 구축 없이, 모든 사용자 데이터와 가짜 결제/구독 상태를 브라우저 샌드박스(LocalStorage) 내에서 처리하여 1인 개발 공수를 극소화함

---

## 2. 프로젝트 폴더 및 파일 구조 (Directory Structure)

바이브코딩 및 브라우저 독립 실행(Serverless)을 위한 표준 디렉토리 구조입니다. AI 어시스턴트에게 코드를 요청할 때 이 구조를 파일 생성 가이드라인으로 제공하세요.

```
officecalm-ai/
│
├── index.html          # 메인 UI 구조 및 단일 페이지(SPA) 마크업
│
├── css/
│   └── style.css       # 전체 레이아웃, 다크모드 테마 및 브리드 버블 애니메이션
│
├── js/
│   ├── app.js              # 앱 진입점, LocalStorage 연동 및 초기화 로직
│   ├── ai-engine.js        # 가상 AI 스크립트 프리셋 데이터 및 타이핑 효과
│   ├── paywall.js          # 프리미엄 잠금, 결제 유도 모달 팝업 제어
│   ├── audio-player.js     # HTML5 Audio 기반 MP3 재생
│   └── notifications.js    # Web Notification API 리마인더
│
└── assets/                 # 로고 아이콘 및 로컬 오디오 파일 저장소
    ├── audio/
    └── icons/
```

### 각 파일별 역할 정의
* **`index.html`:** 앱의 뼈대입니다. 필요한 외부 스타일시트나 폰트 아이콘 셋을 로드하고, `js/` 폴더 내의 스크립트 파일들을 모듈화하여 순서대로 로드합니다.
* **`css/style.css`:** Flexbox와 Grid 스타일로 레이아웃 디자인을 정의하며, 호흡 주기에 맞춰 원이 커졌다 작아지는 `@keyframes breathe` 애니메이션을 관리합니다.
* **`js/app.js`:** 앱 진입점으로, 브라우저 로딩 시 `localStorage`에서 연속 명상 일수(Streak)와 구독 상태를 확인하고 화면을 초기화합니다.
* **`js/ai-engine.js`:** 직장인 상황별 프리셋 스크립트 데이터를 담고 있으며, 사용자의 입력 상황에 맞는 텍스트를 한 글자씩 밀어 넣는 타이핑 인터랙션을 처리합니다.
* **`js/paywall.js`:** `localStorage`의 구독 유무 플래그를 체크하여, 유료 기능 영역을 트리거할 때 결제 유도 팝업창(`.modal`)의 노출 여부를 제어합니다.
* **`js/audio-player.js`:** `assets/audio/` 내 MP3 파일을 HTML5 `<audio>`로 재생하고 플레이어 UI를 제어합니다.
* **`js/notifications.js`:** Web Notification API로 명상 미완료 시 로컬 리마인더 알림을 전송합니다.

---

## 3. UI/UX 및 레이아웃 정의 (CSS Grid/Flexbox)
전체 화면은 Calm 앱 특유의 심해 다크모드 톤을 유지하며, 직장인이 사무실에서도 눈치 보지 않고 켤 수 있도록 깔끔한 대시보드 형태로 구성합니다.

* **배경색:** #0f172a (Deep Slate Blue)
* **포인트 컬러:** #38bdf8 (Sky Blue), #34d399 (Mint Green)
* **전체 구조 (Single Page Application):**
    * **Header:** 서비스 로고 및 유저의 데일리 리추얼 스트레이크(연속 명상 일수) 카운터 표시기
    * **Main - Left Section (AI 진단실):** 실시간 스트레스 상황 입력창 및 퀵 버튼 존
    * **Main - Center Section (개입 도구):** 시각적 호흡 가이드를 제공하는 오피스 브리드 버블
    * **Main - Right Section (콘텐츠 라이브러리):** 유료/무료 오디오 오퍼링 목록 및 페이월 모달

---

## 4. 핵심 기능별 데이터 및 로직 명세

### 4.1. 데일리 리추얼 트래커 (Daily Streak Tracker)
* **기능:** 사용자의 연속 방문 및 명상 완료 일수를 기록하여 리텐션을 확보합니다.
* **로직 및 데이터 구조:**
    * 사용자가 '오늘의 명상 완료' 버튼을 누르면 브라우저 localStorage에 데이터가 업데이트됩니다.
    * **Storage Key:** officeCalm_user_state
    ```json
    {
      "streak": 3,
      "lastCompletedDate": "2026-07-10",
      "isPremium": false
    }
    ```
    * **JS 작동 조건:** 앱 로드 시 lastCompletedDate를 검사합니다. 오늘 날짜와 하루 차이이면 streak 유지, 이틀 이상 차이 나면 streak을 0으로 리셋합니다.

### 4.2. AI 실시간 스트레스 진단 및 명상 스크립트 생성 모듈
* **기능:** 직장인이 겪는 상황을 입력받아 상황 맞춤형 명상 가이드를 즉석에서 출력합니다.
* **입력 인터페이스:** * 자유 입력 텍스트박스 (<textarea>)
    * 직장인 전용 상황 퀵 프리셋 버튼 4개: [회의 5분 전], [상사 잔소리 직후], [출근길 무기력], [야근 번아웃]
* **JS 및 AI 연동 로직:**
    * 입문자 단계에서는 OpenAI API 키를 프론트엔드 코드에 직접 넣어 호출하거나, AI에게 "상황별로 출력될 3줄짜리 위로/명상 스크립트 프리셋 데이터 객체(JSON)를 JavaScript 내부에 만들어줘"라고 지시하여 서버 없이 가상 AI 구동을 모사합니다.
    * 출력창에는 텍스트가 한 글자씩 출력되는 타이핑 효과(setInterval 또는 setTimeout 활용)를 구현합니다.

### 4.3. 즉각적 개입 도구: 오피스 브리드 버블 (Breathe Bubble)
* **기능:** 극심한 스트레스 상황에서 호흡을 가다듬을 수 있도록 시각적인 애니메이션을 제공합니다.
* **CSS Animation 명세:**
    * 클래스명 .breathe-bubble 원형 오브젝트 생성.
    * 4초 동안 transform: scale(1.5); background-color: #38bdf8; (들이쉬기)
    * 2초 동안 transform: scale(1.5); 상태 유지 (멈추기)
    * 4초 동안 transform: scale(1.0); background-color: #34d399; (내쉬기)
    * 위 사이클이 무한 반복(animation-iteration-count: infinite)되도록 CSS @keyframes 설계.

### 4.4. 프리미엄 기능 잠금 및 페이월 (Paywall) 시스템
* **기능:** Calm의 핵심 비즈니스 모델인 '일부 무료, 대부분 유료 수렴' 전략을 구현합니다.
* **로직 명세:**
    * 상황 퀵 버튼 중 [회의 5분 전]은 무료로 오픈합니다.
    * 그러나 사용자가 자유 텍스트를 입력하거나 [야근 번아웃] 같은 프리미엄 버튼을 누르면, localStorage.isPremium 상태를 확인합니다.
    * isPremium === false 일 경우, 재생/생성을 차단하고 "직장인 특화 AI 실시간 명상 코칭은 프리미엄 플랜(월 $9.99) 전용 기능입니다."라는 안내와 함께 화면 전체를 덮는 커스텀 결제 유도 모달창(div.modal)을 팝업합니다.
    * 모달창 내부에는 입문자 테스트를 위해 [30일 무료 체험 시작하기] 버튼을 두어, 클릭 시 isPremium을 true로 바꾸고 모달이 닫히며 잠금이 해제되도록 설계합니다.

## 5. 기술 스택 및 선택 이유

| 영역 | 선택 | 이유 |
|---|---|---|
| 마크업 | HTML5 | 별도 설치 없이 브라우저 즉시 실행 |
| 스타일 | CSS3 (Vanilla, 별도 프레임워크 없음) | Tailwind 등 빌드 도구 불필요, 클래스 기반 순수 CSS로 학습 곡선 최소화 |
| 로직 | JavaScript ES6 (모듈 없이 단일 파일 우선) | `import/export` 없이 `<script>` 태그만으로 동작 → 로컬 파일 더블클릭 실행 가능 |
| 데이터 저장 | `localStorage` | 백엔드/DB 없이 기기 내 데이터 영속화, 프라이버시상 서버 전송이 없다는 것 자체가 장점 |
| 오디오 재생 | HTML5 `<audio>` + Web Audio API 최소 활용 | 별도 라이브러리 없이 네이티브 API로 충분 |
| 알림 | Web Notification API | 서버 푸시 없이 브라우저 권한 기반 로컬 알림으로 대체 (한계는 8장에서 별도 설명) |
| 배포 | GitHub Pages | 계정만 있으면 무료 배포, 앱스토어 심사 없이 URL 공유로 즉시 테스트 |    

---