# [기술명세서] 직장인 타겟 AI 명상 웹앱 (Mindly)

> **문서 버전:** v1.6 · **최종 갱신:** 2026-07-11  
> **배포:** [https://segamja.github.io/OfficeCalm_Ai/](https://segamja.github.io/OfficeCalm_Ai/)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Mindly (표시명) / OfficeCalm_Ai (저장소·내부 코드) |
| **목적** | 만성 번아웃·직무 스트레스 직장인을 위한 AI 기반 맞춤형 명상 및 즉각적 멘탈 케어 웹앱 MVP |
| **기술 스택** | Vanilla HTML5, CSS3, JavaScript ES6+, LocalStorage, Web Notification API |
| **아키텍처** | 백엔드·DB 없음. 모든 사용자 데이터는 브라우저 샌드박스(LocalStorage)에서 처리 |

---

## 2. 프로젝트 폴더 및 파일 구조

```
OfficeCalm_Ai/
├── index.html              # 5탭 SPA 마크업
├── README.md
├── OfficeCalm_AI_Specification.md
├── package.json
├── css/
│   └── style.css           # 5탭 단일 패널, 다크 테마, 브리드 애니메이션
├── js/
│   ├── app.js              # 앱 진입점, 이벤트 바인딩, 상태 연동
│   ├── ai-engine.js        # AI 프리셋·타이핑 효과 (onComplete 콜백)
│   ├── level-gate.js       # 레벨 기반 콘텐츠 잠금·안내 모달
│   ├── audio-player.js     # MP3 재생, 홈 플레이어, 음악 ON/OFF 토글
│   ├── gallery.js          # 브리드 탭 힐링 이미지 갤러리
│   ├── progress.js         # XP, 레벨, Mind Energy, 레벨업 모달
│   ├── journal.js          # 감사일기 작성·히스토리
│   ├── tabs.js             # 5탭 전환 (PC·모바일 공통)
│   └── notifications.js    # Web Notification 리마인더
└── assets/
    ├── audio/              # MP3 트랙
    └── images/             # 로고·갤러리 이미지
```

### 파일별 역할

| 파일 | 역할 |
|------|------|
| `index.html` | 5개 탭 패널, 하단 탭 바, 브리드 CTA, 라이브러리 재생 안내·미니 플레이어 |
| `css/style.css` | max-width 640px 중앙 정렬, 단일 활성 패널, 홈 대시보드·탭 바·플레이어 숨김 처리 |
| `js/app.js` | localStorage 로드, AI/라이브러리/음악/탭/저널 초기화, AI·라이브러리 동작 분리 |
| `js/tabs.js` | `setActiveTab()` — 활성 패널 1개, `sessionStorage` 탭 복원, 브리드 CTA 연동 |
| `js/audio-player.js` | `musicEnabled` 플래그, OFF 시 `stop()` + 플레이어 숨김 |
| `js/ai-engine.js` | 4종 프리셋 + 자유 입력 스크립트, `typeText(..., onComplete)` |

---

## 3. UI/UX 및 레이아웃 (5탭 단일 화면)

### 디자인 토큰

- **배경색:** `#0f172a` (Deep Slate Blue)
- **포인트 컬러:** `#38bdf8` (Sky Blue), `#34d399` (Mint Green)

### 레이아웃 전략

| 항목 | 명세 |
|------|------|
| **모든 화면** | 하단 고정 5탭 바 + 활성 패널 1개만 전체 화면 표시 |
| **앱 너비** | `max-width: 640px`, 중앙 정렬 (PC에서도 모바일 앱 UX) |
| **기본 탭** | `home` |
| **탭 상태 저장** | `sessionStorage` key `officeCalm_active_tab` |

### 5개 탭 구성

| 탭 | `data-tab-panel` | 포함 콘텐츠 |
|----|------------------|-------------|
| 홈 | `home` | Mindly 로고, 서브타이틀, XP·레벨·Mind Energy, 스트릭, 응원 한줄, 명상 완료, 음악 ON/OFF + 플레이어 |
| AI 관리실 | `ai` | 상황 입력, 퀵 프리셋(코칭 스크립트), AI 출력, 완료 후 브리드 CTA |
| 오피스 브리드 | `breathe` | 호흡 버블(4-2-4) + 힐링 이미지 갤러리 (8초 랜덤 전환) |
| 라이브러리 | `library` | 배경음·효과음 목록, 재생 안내 (`#libraryNowPlayingHint`), 미니 플레이어 (`#libraryNowPlaying`) |
| 감사일기 | `journal` | 감사일기 작성 + 히스토리 |

### UX 규칙

- AI 퀵 프리셋·생성 버튼 클릭 시 `#aiOutput` 스크립트 출력 영역으로 자동 스크롤 (`scrollIntoView` + `panel.scrollTo`)
- AI 스크립트 타이핑 완료 시 `#aiBreatheCta` 표시 → `#goToBreatheBtn` 클릭 시 `setActiveTab('breathe')`
- 라이브러리 트랙 클릭 시 **음악 자동 ON + 재생** (클릭 제스처로 모바일 정책 충족)
- 라이브러리 트랙 재생 시 AI 출력창 변경 없음 — 패널 안내 + 미니 플레이어만 표시
- 재생 실패 시 토스트 안내
- `#audioPlayer`는 `hidden` + CSS로 이중 숨김

### AI vs 라이브러리 역할 분리

| | AI 스트레스 관리실 | 콘텐츠 라이브러리 |
|--|--|--|
| **목적** | 상황별 맞춤 코칭 스크립트 + 브리드 유도 | 배경음·명상 사운드 재생 |
| **회의 예시** | 「회의 5분 전」→ 긴 코칭 텍스트 | 「사무실 백색소음」→ 5분 집중용 사운드 |
| **출력 위치** | `#aiOutputText` (타이핑) | `#libraryNowPlayingHint` (짧은 안내) |
| **완료 후** | 브리드 CTA 표시 | (없음) |

---

## 4. 핵심 기능별 데이터 및 로직

### 4.1. 데일리 리추얼 트래커

- **Storage Key:** `officeCalm_user_state`

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

- 앱 로드 시 `lastCompletedDate` 검사 → 스트릭 유지 또는 리셋
- 「오늘의 명상 완료」 하루 1회 → +25 XP

### 4.2. AI 스트레스 진단 및 명상 스크립트

- 퀵 프리셋 4종: 회의 5분 전, 상사 잔소리 직후, 출근길 무기력, 야근 번아웃
- 프리셋·생성 버튼 클릭 시 `#generateBtn`까지 smooth scroll
- 자유 입력 + `typeText()` 타이핑 효과
- 타이핑 완료 `onComplete` → `#aiBreatheCta` 표시
- 음악 ON 시 상황별 BGM 자동 재생 (레벨 미달 시 대체 트랙)
- **모든 AI 기능 무료** — 페이월·체험 팝업 없음

| 상황 | 자동 재생 트랙 |
|------|----------------|
| 회의 5분 전 | 사무실 백색소음 |
| 출근길 무기력 | 책상 앞 스트레칭 |
| 상사 잔소리 / 야근 번아웃 / 자유 입력 | 번아웃 회복 명상 |

### 4.3. 오피스 브리드 버블

- 4초 들이쉬기 · 2초 멈추기 · 4초 내쉬기 무한 반복
- 하단 힐링 이미지 갤러리 (8초 랜덤 전환)

### 4.4. 콘텐츠 라이브러리

| 트랙 ID | 제목 | 시간 | 해금 조건 |
|---------|------|------|-----------|
| `white-noise` | 사무실 백색소음 | 5분 | Lv.1 (기본) |
| `desk-stretch` | 책상 앞 스트레칭 | 3분 | Lv.1 (기본) |
| `deep-sleep` | 야근 후 딥슬립 | 20분 | **Lv.3** |
| `burnout-recovery` | 번아웃 회복 명상 | 15분 | **Lv.5** |

- 재생 시 `LIBRARY_HINTS` 안내 + `#libraryNowPlaying` 미니 플레이어 표시
- 플레이어 UI: 홈 탭 전체 플레이어 + 라이브러리 탭 미니 플레이어 동기화

### 4.5. XP · 레벨 · Mind Energy

| 활동 | XP |
|------|-----|
| AI 명상 스크립트 생성 | +15 |
| 오늘의 명상 완료 | +25 (하루 1회) |
| 감사일기 작성 | +20 (하루 1회) |
| 오디오 재생 | +10 |

| 레벨 | 필요 XP | 칭호 |
|------|---------|------|
| Lv.1 | 0 | 새싹 직장인 |
| Lv.2 | 50 | 회복 루키 |
| Lv.3 | 120 | 마음 수호자 |
| Lv.4 | 220 | 밸런스 마스터 |
| Lv.5 | 350 | 칼름 리더 |
| Lv.6 | 520 | 멘탈 멘토 |
| Lv.7 | 750 | 오피스 힐러 |
| Lv.8 | 1050 | 평온의 달인 |

**Mind Energy Score** (0~100%): 스트릭·명상 완료·감사일기·레벨·XP 누적을 종합한 정신 회복 지표

### 4.6. 레벨 게이트

- Lv.3 미만: 야근 후 딥슬립 잠금
- Lv.5 미만: 번아웃 회복 명상 잠금
- 미달 클릭 시 XP 획득 안내 모달
- AI 기능은 레벨 제한 없음

### 4.7. 탭 전환 (`tabs.js`)

- 유효 탭: `home`, `ai`, `breathe`, `library`, `journal`
- PC·모바일 분기 없음
- `initTabs()` → `{ setActiveTab }` 반환
- 오디오 재생 중 탭 전환해도 재생 상태 유지

### 4.8. 음악 재생 토글 (`audio-player.js`)

- `musicEnabled` 플래그로 재생 허용 제어
- `setMusicEnabled(enabled)` 외부 노출 — 라이브러리 클릭 시 자동 ON
- `initMusicToggle()` → `{ updateToggleUI }` 반환
- `play()` → `{ ok, reason }` 결과 반환
- OFF 전환 시 `stop()` 호출 → 재생 중지 및 플레이어 숨김

### 4.9. 감사일기 (`journal.js`)

- 매일 작성·수정, 히스토리 열람
- 하루 1회 최초 저장 시 +20 XP

### 4.10. 알림 (`notifications.js`)

- Web Notification API 기반 명상 리마인더
- 홈 탭 알림 ON/OFF 토글

---

## 5. 기술 스택 및 선택 이유

| 영역 | 선택 | 이유 |
|------|------|------|
| 마크업 | HTML5 | 별도 설치 없이 브라우저 즉시 실행 |
| 스타일 | CSS3 (Vanilla) | 빌드 도구 불필요, 5탭 단일 패널 레이아웃 |
| 로직 | JavaScript ES6 (`<script>`) | 로컬 파일 더블클릭 실행 가능 |
| 데이터 저장 | `localStorage` | 백엔드/DB 없이 기기 내 영속화 |
| 오디오 | HTML5 `<audio>` | 네이티브 MP3 재생 |
| 알림 | Web Notification API | 브라우저 권한 기반 로컬 알림 |
| 배포 | GitHub Pages | 무료 정적 호스팅 |

---

## 6. MVP 구현 현황 (2026-07-11 기준)

| 기능 | 상태 | 비고 |
|------|------|------|
| 5탭 단일 화면 (PC·모바일 공통) | ✅ 완료 | PC 4열 Grid 제거 |
| 홈 대시보드 (XP·스트릭·음악 토글) | ✅ 완료 | Mindly 브랜딩, 응원 한줄, 알림 UI 제거 |
| AI 코칭 스크립트 + 타이핑 | ✅ 완료 | AI 스트레스 **관리실**, 4종 프리셋 + 자유 입력 |
| AI 완료 후 브리드 CTA | ✅ 완료 | `#goToBreatheBtn` → 브리드 탭 |
| AI / 라이브러리 역할 분리 | ✅ 완료 | 라이브러리는 패널 안내만 |
| 라이브러리 원탭 재생 + 미니 플레이어 | ✅ 완료 | 클릭=자동 ON, 모바일 대응 |
| AI 프리셋 자동 스크롤 | ✅ 완료 | `#aiOutput` 스크립트 영역으로 스크롤 |
| 오피스 브리드 + 갤러리 | ✅ 완료 | 4-2-4 호흡, 8초 이미지 전환 |
| 콘텐츠 라이브러리 + 레벨 게이트 | ✅ 완료 | 7종, Lv.2/Lv.3/Lv.5 |
| 감사일기 + 히스토리 | ✅ 완료 | localStorage 영속화 |
| XP · 레벨 · Mind Energy | ✅ 완료 | 레벨업 축하 모달 |
| Web Notification 리마인더 | — | 홈 UI 제거 (레거시 모듈만 유지) |
| GitHub Pages 배포 | ✅ 완료 | `main` push 시 자동 배포 |
| 실제 AI API 연동 | ⏳ 미구현 | 프리셋 기반 가상 AI (MVP 범위) |
| 백엔드·계정 동기화 | ⏳ 미구현 | localStorage only |
| 네이티브 앱 / PWA | ⏳ 미구현 | 향후 확장 |

---

## 7. 변경 이력

| 버전 | 날짜 | 주요 변경 |
|------|------|-----------|
| v1.0 | 2026-07 | MVP 초기 — 3탭, localStorage, AI 프리셋 |
| v1.1 | 2026-07 | 레벨 게이트 도입, 페이월 제거 |
| v1.2 | 2026-07 | 5탭 레이아웃, 홈 대시보드, 음악 토글 |
| v1.3 | 2026-07-11 | PC·모바일 5탭 통합, 모바일 GUI 수정, AI/라이브러리 분리, 브리드 CTA |
| v1.4 | 2026-07-11 | AI 프리셋 스크롤, 라이브러리 원탭 재생, 미니 플레이어, 캐시 버스트 |
| v1.5 | 2026-07-11 | 응원 한줄, 라이브러리 3종 추가, 알림 UI 제거 |
| v1.6 | 2026-07-11 | Mindly 리브랜딩, AI 관리실 명칭, 프리셋→출력 영역 스크롤 |
