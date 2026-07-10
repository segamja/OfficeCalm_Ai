/**
 * Mindly — 앱 진입점, LocalStorage 연동 및 초기화
 */
(function () {
  const OC = window.OfficeCalm;
  const STORAGE_KEY = 'officeCalm_user_state';

  const DEFAULT_STATE = {
    streak: 0,
    lastCompletedDate: null,
    xp: 0,
    level: 1,
    mindEnergy: 45,
    lastJournalDate: null,
    gratitudeJournal: [],
  };

  const MEDITATION_TRACKS = {
    meeting: 'white-noise',
    boss: 'burnout-recovery',
    commute: 'desk-stretch',
    overtime: 'burnout-recovery',
    custom: 'burnout-recovery',
  };

  const TRACK_LEVEL_FALLBACK = {
    'burnout-recovery': 'desk-stretch',
    'deep-sleep': 'white-noise',
  };

  const LIBRARY_HINTS = {
    'white-noise': '사무실 백색소음 재생 중 — 편안히 호흡하며 집중해 보세요.',
    'desk-stretch': '책상 앞 스트레칭 재생 중 — 몸을 천천히 풀어 주세요.',
    'deep-sleep': '야근 후 딥슬립 재생 중 — 긴장을 내려놓고 쉬어 가세요.',
    'burnout-recovery': '번아웃 회복 명상 재생 중 — 자기 자비를 회복해 보세요.',
    'meeting-calm': '회의 후 진정 호흡 재생 중 — 어깨 힘을 빼고 천천히 호흡하세요.',
    'afternoon-focus': '오후 집중 부스터 재생 중 — 잠시 눈을 감고 리셋해 보세요.',
    'commute-winddown': '퇴근길 마음 비우기 재생 중 — 오늘은 여기까지, 수고했어요.',
  };

  const DAILY_QUOTES = [
    '오늘도 여기까지 온 나, 정말 잘하고 있어요.',
    '완벽하지 않아도 괜찮아요. 지금 이 순간만큼은 충분합니다.',
    '쉬어가는 것도 업무의 일부예요. 잠시 멈춰도 괜찮습니다.',
    '나는 내 일을 해내고 있고, 그것만으로도 대단해요.',
    '숨 한 번 고르고, 오늘의 나에게 "고생했어"라고 말해 주세요.',
    '비교하지 않아도 돼요. 어제의 나보다 조금만 나아지면 충분합니다.',
    '지금 이 긴장도 곧 지나갑니다. 나는 충분히 잘 해낼 수 있어요.',
    '작은 성취도 성취예요. 오늘의 한 걸음을 인정해 주세요.',
    '내 마음을 돌보는 시간, 절대 낭비가 아니에요.',
    '힘들 때 멈추는 건 포기가 아니라, 다시 나아가기 위한 준비예요.',
  ];

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
    return OC.getTodayString();
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
      state.alreadyDone = true;
      return state;
    }

    if (state.lastCompletedDate) {
      const diff = getDaysDiff(state.lastCompletedDate, today);
      if (diff === 1) state.streak += 1;
      else if (diff > 1) state.streak = 1;
    } else {
      state.streak = 1;
    }

    state.lastCompletedDate = today;
    state.alreadyDone = false;
    saveUserState(state);
    return state;
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

  function getDailyQuote() {
    const today = getTodayString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash * 31 + today.charCodeAt(i)) >>> 0;
    }
    return DAILY_QUOTES[hash % DAILY_QUOTES.length];
  }

  function initDailyQuote() {
    const quoteEl = document.getElementById('dailyQuote');
    if (quoteEl) quoteEl.textContent = getDailyQuote();
  }

  function scrollInPanel(panel, target, offset = 12) {
    if (!panel || !target) return;

    requestAnimationFrame(() => {
      const panelRect = panel.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const top = targetRect.top - panelRect.top + panel.scrollTop - offset;
      panel.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function scrollToAiOutput() {
    const panel = document.getElementById('tabPanelAi');
    const target = document.getElementById('aiOutput');
    scrollInPanel(panel, target);
  }

  document.addEventListener('DOMContentLoaded', () => {
    let userState = validateStreak(loadUserState());
    updateStreakUI(userState);

    document.getElementById('todayDate').textContent = OC.formatTodayDate();
    initDailyQuote();

    const levelGate = OC.initLevelGate(() => userState);
    const progress = OC.initProgress(() => userState, saveUserState, levelGate.updateLevelUI);
    const outputEl = document.getElementById('aiOutputText');
    const cursorEl = document.getElementById('typingCursor');
    const stressInput = document.getElementById('stressInput');
    const breatheCtaEl = document.getElementById('aiBreatheCta');
    const libraryHintEl = document.getElementById('libraryNowPlayingHint');

    function hideLibraryHint() {
      if (libraryHintEl) {
        libraryHintEl.hidden = true;
        libraryHintEl.textContent = '';
      }
    }

    const audioUI = OC.initAudioPlayerUI((trackId) => {
      if (!trackId) hideLibraryHint();
    });
    const musicToggle = OC.initMusicToggle(audioUI);
    const tabsApi = OC.initTabs();

    function showToast(message) {
      const toast = document.getElementById('xpToast');
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('is-visible');
      setTimeout(() => toast.classList.remove('is-visible'), 2800);
    }

    function hideBreatheCta() {
      if (breatheCtaEl) breatheCtaEl.hidden = true;
    }

    function showBreatheCta() {
      if (breatheCtaEl) breatheCtaEl.hidden = false;
    }

    function runAIScript(script, outputEl, cursorEl, options = {}) {
      const { showBreatheGuide = false } = options;
      hideBreatheCta();
      OC.stopTyping();
      OC.typeText(script, outputEl, cursorEl, 28, () => {
        if (showBreatheGuide) showBreatheCta();
      });
    }

    function showLibraryHint(trackId) {
      if (!libraryHintEl) return;
      const hint = LIBRARY_HINTS[trackId] || OC.getTrackTitle(trackId) + ' 재생 중';
      libraryHintEl.textContent = hint;
      libraryHintEl.hidden = false;
    }

    function resolveMeditationTrack(presetKey, userLevel) {
      let trackId = MEDITATION_TRACKS[presetKey] || 'white-noise';
      const required = OC.getLevelRequired(trackId);

      if (userLevel < required) {
        trackId = TRACK_LEVEL_FALLBACK[trackId] || 'white-noise';
      }

      return trackId;
    }

    async function handleAISession(script, presetKey) {
      runAIScript(script, outputEl, cursorEl, { showBreatheGuide: true });

      if (OC.isMusicEnabled()) {
        const trackId = resolveMeditationTrack(presetKey, userState.level || 1);
        await audioUI.play(trackId);
      }

      progress.addXP(progress.rewards.aiScript, 'AI 명상 스크립트');
      progress.refresh();
    }

    document.getElementById('goToBreatheBtn')?.addEventListener('click', () => {
      tabsApi?.setActiveTab('breathe');
    });

    OC.initJournal(() => userState, saveUserState, (amount, reason) => {
      progress.addXP(amount, reason);
      progress.refresh();
    });

    document.getElementById('completeRitualBtn').addEventListener('click', () => {
      const result = completeRitual(userState);
      userState = result;
      updateStreakUI(userState);

      if (result.alreadyDone) return;

      progress.addXP(progress.rewards.ritualComplete, '오늘의 명상 완료');
      progress.refresh();

      const messages = [
        '오늘도 한 걸음 더 나아갔어요. 멋져요! 🌿',
        '꾸준함이 가장 큰 힘입니다. 내일도 함께해요.',
        '잘 쉬어가고 계시네요. 스트레이크가 올랐습니다!',
      ];
      runAIScript(messages[Math.min(userState.streak - 1, messages.length - 1)], outputEl, cursorEl);
    });

    document.getElementById('generateBtn').addEventListener('click', () => {
      scrollToAiOutput();
      const input = stressInput.value.trim();
      handleAISession(OC.generateCustomScript(input), 'custom');
    });

    document.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.preset;
        const preset = OC.getPresetScript(key);
        stressInput.value = preset.label;
        scrollToAiOutput();
        handleAISession(preset.script, key);
      });
    });

    document.getElementById('libraryStopBtn')?.addEventListener('click', () => {
      audioUI.stop();
      hideLibraryHint();
    });

    document.querySelectorAll('[data-audio]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const trackId = btn.dataset.audio;
        const itemEl = btn.closest('[data-level-required]');
        const requiredLevel = Number(
          itemEl?.dataset.levelRequired ?? OC.getLevelRequired(trackId) ?? 0
        );

        if (!levelGate.checkLevelAccess(requiredLevel)) return;

        if (!OC.isMusicEnabled()) {
          OC.setMusicEnabled(true);
          musicToggle.updateToggleUI();
        }

        const result = await audioUI.play(trackId);

        if (result.ok) {
          progress.addXP(progress.rewards.audioPlay, '오디오 재생');
          progress.refresh();
          showLibraryHint(trackId);
        } else if (result.reason === 'paused') {
          hideLibraryHint();
        } else if (result.reason === 'error' || result.reason === 'unknown') {
          showToast('재생에 실패했습니다. 네트워크를 확인해 주세요.');
          hideLibraryHint();
        } else {
          hideLibraryHint();
        }
      });
    });

    OC.initGallery();
    initBreatheGuide();
  });
})();
