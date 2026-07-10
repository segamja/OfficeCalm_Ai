/**
 * OfficeCalm AI — XP, 레벨, Mind Energy, 레벨업 축하 UI
 */
(function (OC) {
  const LEVEL_TITLES = [
    '새싹 직장인',
    '회복 루키',
    '마음 수호자',
    '밸런스 마스터',
    '칼름 리더',
    '멘탈 멘토',
    '오피스 힐러',
    '평온의 달인',
  ];

  const LEVEL_XP = [0, 50, 120, 220, 350, 520, 750, 1050];

  const XP_REWARDS = {
    aiScript: 15,
    ritualComplete: 25,
    gratitudeJournal: 20,
    audioPlay: 10,
  };

  function getLevelFromXp(xp) {
    let level = 1;
    for (let i = LEVEL_XP.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_XP[i]) {
        level = i + 1;
        break;
      }
    }
    return Math.min(level, LEVEL_TITLES.length);
  }

  function getLevelTitle(level) {
    return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] || LEVEL_TITLES[0];
  }

  function getXpForNextLevel(level) {
    if (level >= LEVEL_XP.length) return LEVEL_XP[LEVEL_XP.length - 1];
    return LEVEL_XP[level];
  }

  function getXpProgress(xp, level) {
    const currentBase = LEVEL_XP[level - 1] || 0;
    const next = getXpForNextLevel(level);
    if (next <= currentBase) return 100;
    return Math.min(100, Math.round(((xp - currentBase) / (next - currentBase)) * 100));
  }

  function calculateMindEnergy(state) {
    const today = OC.getTodayString ? OC.getTodayString() : '';
    let score = 35;

    score += Math.min(state.streak * 4, 24);
    if (state.lastCompletedDate === today) score += 18;
    if (state.lastJournalDate === today) score += 15;
    score += Math.min((state.level || 1) * 3, 18);
    score += Math.min(Math.floor((state.xp || 0) / 40), 10);

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  function showLevelUpModal(level, title) {
    const modal = document.getElementById('levelUpModal');
    const levelEl = document.getElementById('levelUpNumber');
    const titleEl = document.getElementById('levelUpTitle');
    const closeBtn = document.getElementById('levelUpCloseBtn');

    if (!modal) return;

    levelEl.textContent = 'Lv.' + level;
    titleEl.textContent = title;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    function close() {
      modal.hidden = true;
      document.body.style.overflow = '';
    }

    closeBtn.onclick = close;
    modal.querySelector('.levelup-modal__backdrop').onclick = close;

    setTimeout(close, 4500);
  }

  function showXpToast(amount, reason) {
    const toast = document.getElementById('xpToast');
    if (!toast) return;

    toast.textContent = '+' + amount + ' XP · ' + reason;
    toast.classList.add('is-visible');

    clearTimeout(showXpToast._timer);
    showXpToast._timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function updateProgressUI(state) {
    const level = state.level || 1;
    const xp = state.xp || 0;
    const mindEnergy = state.mindEnergy || calculateMindEnergy(state);

    const levelEl = document.getElementById('userLevel');
    const titleEl = document.getElementById('userLevelTitle');
    const xpEl = document.getElementById('userXp');
    const xpBar = document.getElementById('xpProgressBar');
    const mindEl = document.getElementById('mindEnergyScore');
    const mindBar = document.getElementById('mindEnergyBar');

    if (levelEl) levelEl.textContent = 'Lv.' + level;
    if (titleEl) titleEl.textContent = getLevelTitle(level);
    if (xpEl) xpEl.textContent = xp + ' XP';
    if (xpBar) xpBar.style.width = getXpProgress(xp, level) + '%';
    if (mindEl) mindEl.textContent = mindEnergy;
    if (mindBar) mindBar.style.width = mindEnergy + '%';
  }

  function initProgress(getUserState, saveUserState, onLevelChange) {
    function refreshState() {
      const state = getUserState();
      state.level = state.level || getLevelFromXp(state.xp || 0);
      state.xp = state.xp || 0;
      state.mindEnergy = calculateMindEnergy(state);
      saveUserState(state);
      updateProgressUI(state);
      onLevelChange?.();
      return state;
    }

    refreshState();

    return {
      addXP(amount, reason) {
        const state = getUserState();
        const prevLevel = state.level || 1;
        state.xp = (state.xp || 0) + amount;
        state.level = getLevelFromXp(state.xp);
        state.mindEnergy = calculateMindEnergy(state);
        saveUserState(state);
        updateProgressUI(state);
        showXpToast(amount, reason);
        onLevelChange?.();

        if (state.level > prevLevel) {
          setTimeout(() => showLevelUpModal(state.level, getLevelTitle(state.level)), 400);
        }

        return state;
      },
      rewards: XP_REWARDS,
      refresh() {
        const state = getUserState();
        state.mindEnergy = calculateMindEnergy(state);
        saveUserState(state);
        updateProgressUI(state);
        onLevelChange?.();
      },
    };
  }

  OC.getLevelTitle = getLevelTitle;
  OC.calculateMindEnergy = calculateMindEnergy;
  OC.initProgress = initProgress;
  OC.getTodayString = function getTodayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  };

  OC.formatTodayDate = function formatTodayDate() {
    const now = new Date();
    return now.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };
})(window.OfficeCalm = window.OfficeCalm || {});
