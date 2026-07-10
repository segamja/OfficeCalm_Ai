/**
 * OfficeCalm AI — 앱 진입점, LocalStorage 연동 및 초기화
 */
(function () {
  const OC = window.OfficeCalm;
  const STORAGE_KEY = 'officeCalm_user_state';

  const DEFAULT_STATE = {
    streak: 0,
    lastCompletedDate: null,
    isPremium: false,
  };

  function loadUserState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STATE };
      return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  function saveUserState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getTodayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getDaysDiff(dateStrA, dateStrB) {
    const a = new Date(dateStrA + 'T00:00:00');
    const b = new Date(dateStrB + 'T00:00:00');
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
  }

  function validateStreak(state) {
    const today = getTodayString();

    if (!state.lastCompletedDate) return state;

    const diff = getDaysDiff(state.lastCompletedDate, today);

    if (diff === 0 || diff === 1) return state;

    state.streak = 0;
    saveUserState(state);
    return state;
  }

  function completeRitual(state) {
    const today = getTodayString();

    if (state.lastCompletedDate === today) {
      return { ...state, alreadyDone: true };
    }

    if (state.lastCompletedDate) {
      const diff = getDaysDiff(state.lastCompletedDate, today);
      if (diff === 1) {
        state.streak += 1;
      } else if (diff > 1) {
        state.streak = 1;
      }
    } else {
      state.streak = 1;
    }

    state.lastCompletedDate = today;
    saveUserState(state);
    return { ...state, alreadyDone: false };
  }

  function updateStreakUI(state) {
    const countEl = document.getElementById('streakCount');
    const btn = document.getElementById('completeRitualBtn');
    const today = getTodayString();

    countEl.textContent = state.streak;

    if (state.lastCompletedDate === today) {
      btn.textContent = '오늘 완료 ✓';
      btn.disabled = true;
    } else {
      btn.textContent = '오늘의 명상 완료';
      btn.disabled = false;
    }
  }

  function initBreatheGuide() {
    const guideEl = document.getElementById('breatheGuide');
    const phases = [
      { label: '들이쉬기', className: '', duration: 4000 },
      { label: '멈추기', className: 'phase-hold', duration: 2000 },
      { label: '내쉬기', className: 'phase-exhale', duration: 4000 },
    ];

    let phaseIndex = 0;

    function setPhase() {
      const phase = phases[phaseIndex];
      guideEl.textContent = phase.label;
      guideEl.className = 'breathe-guide ' + phase.className;

      setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % phases.length;
        setPhase();
      }, phase.duration);
    }

    setPhase();
  }

  function runAIScript(script, outputEl, cursorEl) {
    OC.stopTyping();
    OC.typeText(script, outputEl, cursorEl);
  }

  document.addEventListener('DOMContentLoaded', () => {
    let userState = validateStreak(loadUserState());
    updateStreakUI(userState);

    const paywall = OC.initPaywall(() => userState, (state) => {
      userState = state;
    });

    const outputEl = document.getElementById('aiOutputText');
    const cursorEl = document.getElementById('typingCursor');
    const stressInput = document.getElementById('stressInput');

    document.getElementById('completeRitualBtn').addEventListener('click', () => {
      const result = completeRitual(userState);
      userState = result;
      updateStreakUI(userState);

      if (result.alreadyDone) return;

      const messages = [
        '오늘도 한 걸음 더 나아갔어요. 멋져요! 🌿',
        '꾸준함이 가장 큰 힘입니다. 내일도 함께해요.',
        '잘 쉬어가고 계시네요. 스트레이크가 올랐습니다!',
      ];
      runAIScript(messages[Math.min(userState.streak - 1, messages.length - 1)], outputEl, cursorEl);
    });

    document.getElementById('generateBtn').addEventListener('click', () => {
      const input = stressInput.value.trim();
      if (!paywall.checkAccess(false)) return;
      runAIScript(OC.generateCustomScript(input), outputEl, cursorEl);
    });

    document.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.preset;
        const preset = OC.getPresetScript(key);

        if (!paywall.checkAccess(preset.isFree)) return;

        stressInput.value = preset.label;
        runAIScript(preset.script, outputEl, cursorEl);
      });
    });

    const audioUI = OC.initAudioPlayerUI();

    document.querySelectorAll('[data-audio]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const isPremium = btn.dataset.premium === 'true';
        if (!paywall.checkAccess(!isPremium)) return;

        const trackId = btn.dataset.audio;
        const title = OC.getTrackTitle(trackId);
        const started = await audioUI.play(trackId);

        if (started) {
          runAIScript(
            `「${title}」 사운드를 재생합니다.\n편안한 자세로 앉아, 호흡에 집중해 보세요.\n볼륨을 조절하며 브리드 버블과 함께 천천히 시작해요.`,
            outputEl,
            cursorEl
          );
        }
      });
    });

    OC.initNotifications(() => userState);
    OC.initGallery();
    initBreatheGuide();
  });
})();
