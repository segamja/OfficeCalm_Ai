# SPRINT_03_SETTINGS.md

# Sprint 03 : Settings 기능 추가

## Sprint 목표

현재 Mindly는 Home, AI Coach, Breathe, Gratitude Journal, Library 화면까지 구현되어 있다.

이번 Sprint에서는 **사용자 설정(Settings)** 기능을 추가하여 앱의 완성도를 높인다.

이번 작업에서는 기존 기능을 변경하거나 삭제하지 않는다.

현재 UI와 디자인 시스템을 유지하면서 자연스럽게 Settings 기능을 추가한다.

---

# 작업 목표

Home 화면 우측 상단에 Settings 버튼을 추가한다.

Settings 화면을 새롭게 구현한다.

사용자는 이 화면에서

- 닉네임 변경
- 앱 정보 확인
- 향후 설정 기능 접근

이 가능해야 한다.

---

# 진입 방식

Bottom Navigation은 현재 구조를 유지한다.

```
🏠 Home
🧠 AI Coach
🫁 Breathe
📖 Gratitude Journal
📚 Library
```

Bottom Navigation에는 새로운 탭을 추가하지 않는다.

Home 화면 우측 상단에

⚙️ Settings 버튼을 추가한다.

향후에는

⚙️ 아이콘 대신

Mindly AI 캐릭터 아이콘으로 교체할 수 있도록 구조를 고려한다.

---

# Settings 화면

다음 메뉴를 구현한다.

---

## 1. 👤 Profile

### 목적

사용자의 닉네임을 관리한다.

### 기능

현재 저장된 nickname 표시

닉네임 수정

저장

### 저장 위치

```
localStorage.nickname
```

변경 즉시

앱 전체에서 새로운 닉네임을 사용한다.

예)

```
좋은 아침입니다.

홍민님 😊
```

↓

```
좋은 아침입니다.

민수님 😊
```

---

## 2. 🔔 Notifications

현재는 UI만 구현한다.

향후 Push Notification과 연결한다.

상태

Coming Soon

---

## 3. 🎯 Daily Goal

현재는 UI만 구현한다.

향후

- AI 코칭
- 호흡
- 감사일기

목표 설정 기능을 추가한다.

상태

Coming Soon

---

## 4. 🎨 Theme

향후 다크/라이트 모드 지원

현재는

Coming Soon

---

## 5. 🌐 Language

향후 다국어 지원

현재는

Coming Soon

---

## 6. ❤️ About Mindly

새로운 About 화면을 추가한다.

내용

────────────────────────

Mindly

Version 1.0

Your AI Mental Coach

────────────────────────

Designed & Developed by

Hongmin Park

Software Engineer

AI Builder

────────────────────────

Mindly는

직장인의 스트레스와 번아웃 예방을 위해 개발된

AI Recovery Coach입니다.

────────────────────────

GitHub

Portfolio

Email

────────────────────────

Made with ❤️ in Korea

© 2026 Mindly

────────────────────────

### 버튼

GitHub

Portfolio

Email

현재는 Placeholder 링크 사용 가능

향후 실제 링크 연결

---

## 7. 📄 Privacy Policy

Placeholder 화면 구현

향후 실제 내용 추가

---

## 8. 📃 Terms of Service

Placeholder 화면 구현

향후 실제 내용 추가

---

# 디자인 요구사항

현재 다크 테마를 유지한다.

현재 디자인 시스템을 유지한다.

Material Design 스타일의 Setting List를 적용한다.

각 메뉴는

- 아이콘
- 제목
- 화살표(>)
- Divider

형태로 구성한다.

각 메뉴는 터치 피드백(Ripple 또는 Hover)을 제공한다.

---

# UX 요구사항

Settings 화면은

단순한 설정 화면이 아니라

Mindly 서비스의 관리 화면이다.

전체적으로

심플하고

여백이 충분하며

읽기 편한 디자인을 유지한다.

---

# 구현 원칙

기존 기능 삭제 금지

기존 UI 변경 최소화

Bottom Navigation 유지

Home 우측 상단에서만 진입

확장 가능한 구조 유지

향후 Firebase 로그인과 연동 가능하도록 설계

---

# 완료 조건

다음 항목이 모두 구현되면 Sprint를 완료한다.

✅ Home 우측 상단 Settings 버튼

✅ Settings 화면

✅ Profile

✅ 닉네임 변경

✅ About Mindly

✅ GitHub / Portfolio / Email 버튼

✅ Privacy Policy Placeholder

✅ Terms Placeholder

---

# 작업 완료 후

다음 문서를 최신 상태로 업데이트한다.

- PROJECT_STATUS.md

그리고

다음을 보고한다.

- 추가된 파일

- 수정된 파일

- 구현 완료 기능

- 미구현 기능

- 다음 Sprint 추천