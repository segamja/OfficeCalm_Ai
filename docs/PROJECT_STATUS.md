# Mindly — PROJECT_STATUS.md

> 최종 업데이트: 2026-07-11 · **v2.2**

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 앱 이름 | Mindly |
| 슬로건 | Your AI Mental Coach |
| 기술 스택 | HTML / CSS / Vanilla JS / PWA |
| 배포 | GitHub Pages |
| 라이브 URL | https://segamja.github.io/OfficeCalm_Ai/ |
| 데이터 저장 | localStorage (기기 내부) |
| 개발자 이메일 | segamja@gmail.com |

---

## Sprint 완료 현황

| Sprint | 주제 | 상태 |
|--------|------|------|
| Sprint 01 | 5탭 레이아웃 · Mindly 리브랜드 | ✅ 완료 |
| Sprint 02 | UX v1 (온보딩·Hero·미션·PWA) | ✅ 완료 |
| Sprint 03 | Settings 기능 | ✅ 완료 |
| Sprint 04 | PWA 업데이트 자동 감지 | ✅ 완료 |

---

## 구현 완료 기능

### 핵심 화면
- ✅ Home — Mindly·스탯(Lv/Mind Energy/연속) → Hero Card → 응원·명상·음악
- ✅ AI Coach — 대화형 인트로, 프리셋·커스텀 스크립트
- ✅ Breathe — 4-2-4 호흡 가이드, AI 추천 문구
- ✅ Library — 7종 오디오, 레벨 게이트, 추천 배지
- ✅ Gratitude Journal — 작성·수정·히스토리

### 사용자·성장
- ✅ 온보딩 (닉네임, `localStorage.nickname`)
- ✅ XP · 레벨 · Mind Energy
- ✅ 오늘의 미션 (+40XP 보너스)
- ✅ Settings (Profile, About, Privacy/Terms, Coming Soon)

### PWA
- ✅ manifest.json (standalone, GitHub Pages 절대 URL)
- ✅ service-worker.js — Network-first(HTML/JS/CSS), 오프라인 폴백
- ✅ beforeinstallprompt → `prompt()` 네이티브 설치
- ✅ 설치 안내 배너 + iOS/Android 수동 가이드
- ✅ **버전 업데이트 자동 감지** — "새 버전이 있습니다" 배너 → 업데이트 → 자동 새로고침
- ✅ `updateViaCache: 'none'` — SW 파일 항상 최신 확인

---

## PWA 업데이트 흐름

1. GitHub Pages에 새 배포 → `service-worker.js`의 `CACHE_VERSION` 변경
2. 클라이언트가 포커스·30분 주기·5초 후 `registration.update()` 호출
3. 새 SW가 `installed` + 기존 SW 활성 → 상단 배너 표시
4. 사용자 **업데이트** 클릭 → `SKIP_WAITING` → `controllerchange` → 자동 `reload()`

---

## 미구현 기능 (향후)

| 기능 | 예상 Sprint |
|------|-------------|
| Push Notification | Sprint 05+ |
| Daily Goal 설정 | Sprint 05+ |
| 다크/라이트 Theme | Sprint 05+ |
| 다국어 (Language) | Sprint 06+ |
| Firebase 로그인·동기화 | Sprint 06+ |
| OpenAI API 실연동 | Sprint 06+ |
| Privacy/Terms 실제 문서 | Sprint 05+ |

---

## 파일 구조 (주요)

```
OfficeCalm_Ai/
├── index.html
├── manifest.json
├── service-worker.js       # CACHE_VERSION으로 배포 버전 관리
├── css/style.css
├── js/
│   ├── app.js
│   ├── onboarding.js
│   ├── settings.js
│   ├── missions.js
│   ├── pwa.js              # 설치·SW 등록·업데이트 UI
│   └── ...
└── docs/
    ├── PROJECT_STATUS.md
    ├── UX_IMPROVEMENT_v1.md
    └── SPRINT_03_SETTINGS.md
```

---

## v2.2 변경 요약

### 수정된 파일
- `service-worker.js` — Network-first, 업데이트 대기(skipWaiting 지연)
- `js/pwa.js` — 업데이트 감지·배너·자동 새로고침
- `index.html` — 업데이트 배너 UI, cache v2.2
- `css/style.css` — 업데이트 배너 스타일
- `js/settings.js` — 버전 2.2, 이메일 segamja@gmail.com
- 문서 전체 갱신

---

## 다음 Sprint 추천

**Sprint 05 — Push Notification**
1. Service Worker `push` 이벤트 핸들러
2. Settings Notifications UI 활성화
3. Privacy Policy 초안
