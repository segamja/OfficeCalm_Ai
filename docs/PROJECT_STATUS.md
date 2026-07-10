# Mindly — PROJECT_STATUS.md

> 최종 업데이트: 2026-07-11 · **v1.9**

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 앱 이름 | Mindly |
| 슬로건 | Your AI Mental Coach |
| 기술 스택 | HTML / CSS / Vanilla JS |
| 배포 | GitHub Pages |
| 라이브 URL | https://segamja.github.io/OfficeCalm_Ai/ |
| 데이터 저장 | localStorage (기기 내부) |

---

## Sprint 완료 현황

| Sprint | 주제 | 상태 |
|--------|------|------|
| Sprint 01 | 5탭 레이아웃 · Mindly 리브랜드 | ✅ 완료 |
| Sprint 02 | UX v1 (온보딩·Hero·미션·PWA) | ✅ 완료 |
| Sprint 03 | Settings 기능 | ✅ 완료 |

---

## 구현 완료 기능

### 핵심 화면
- ✅ Home — Hero Card, Mind Energy, 오늘의 미션, 스트릭
- ✅ AI Coach — 대화형 인트로, 프리셋·커스텀 스크립트
- ✅ Breathe — 4-2-4 호흡 가이드, AI 추천 문구
- ✅ Library — 7종 오디오, 레벨 게이트, 추천 배지
- ✅ Gratitude Journal — 작성·수정·히스토리

### 사용자·성장
- ✅ 온보딩 (닉네임)
- ✅ XP · 레벨 · Mind Energy
- ✅ 오늘의 미션 (+40XP 보너스)
- ✅ Settings (Sprint 03)

### Settings (Sprint 03)
- ✅ Home 우측 상단 ⚙️ Settings 버튼
- ✅ Profile — 닉네임 변경 (`localStorage.nickname`)
- ✅ About Mindly — 버전, 개발자, GitHub/Portfolio/Email
- ✅ Privacy Policy — Placeholder
- ✅ Terms of Service — Placeholder
- ✅ 홈 화면에 설치 — PWA 설치 가이드
- ✅ Coming Soon UI — Notifications, Daily Goal, Theme, Language

### PWA
- ✅ manifest.json
- ✅ service-worker.js (오프라인 캐싱)
- ✅ 앱 아이콘 (192/512)
- ✅ 설치 안내 배너 + 단계별 가이드 모달
- ✅ Standalone 모드

---

## 미구현 기능 (향후)

| 기능 | 예상 Sprint |
|------|-------------|
| Push Notification | Sprint 04+ |
| Daily Goal 설정 | Sprint 04+ |
| 다크/라이트 Theme | Sprint 04+ |
| 다국어 (Language) | Sprint 05+ |
| Firebase 로그인·동기화 | Sprint 05+ |
| OpenAI API 실연동 | Sprint 05+ |
| Google Calendar 연동 | Sprint 06+ |
| Privacy/Terms 실제 문서 | Sprint 04+ |

---

## 파일 구조 (주요)

```
OfficeCalm_Ai/
├── index.html
├── manifest.json
├── service-worker.js
├── css/style.css
├── js/
│   ├── app.js          # 진입점
│   ├── onboarding.js   # 닉네임·인사
│   ├── settings.js     # Settings 화면
│   ├── missions.js     # 오늘의 미션
│   ├── pwa.js          # PWA 설치·SW
│   ├── progress.js     # XP·레벨
│   └── ...
├── assets/
│   ├── icons/          # PWA 아이콘
│   ├── images/
│   └── audio/
└── docs/
    ├── UX_IMPROVEMENT_v1.md
    └── SPRINT_03_SETTINGS.md
```

---

## 다음 Sprint 추천

**Sprint 04 — Notifications & Daily Goal**
1. Web Push Notification 기초 (Service Worker 확장)
2. Daily Goal 목표 수 설정 UI 활성화
3. Privacy Policy 초안 작성

---

## v1.9 변경 요약 (Sprint 03)

### 추가된 파일
- `js/settings.js`
- `docs/PROJECT_STATUS.md`
- `docs/SPRINT_03_SETTINGS.md` (명세)

### 수정된 파일
- `index.html` — Settings 전체 화면, PWA 설치 가이드 모달
- `css/style.css` — Settings List, About, Install Guide 스타일
- `js/onboarding.js` — Settings 로직 분리
- `js/pwa.js` — 설치 가이드 모달, 수동 설치 안내 개선
- `js/app.js` — Settings 초기화 연동
- `service-worker.js` — v1.9 캐시
- `manifest.json` — id 필드 추가
