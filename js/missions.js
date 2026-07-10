/**
 * Mindly — 오늘의 미션 추적 및 보너스 XP
 */
(function (OC) {
  const MISSION_BONUS_XP = 40;

  const MISSION_LABELS = {
    aiCoaching: 'AI 코칭',
    breathe: '호흡',
    journal: '감사일기',
  };

  function getDefaultMissions(today) {
    return {
      date: today,
      aiCoaching: false,
      breathe: false,
      journal: false,
      bonusClaimed: false,
    };
  }

  function ensureMissions(state) {
    const today = OC.getTodayString();
    if (!state.dailyMissions || state.dailyMissions.date !== today) {
      state.dailyMissions = getDefaultMissions(today);
    }
    return state.dailyMissions;
  }

  function allMissionsComplete(missions) {
    return missions.aiCoaching && missions.breathe && missions.journal;
  }

  function initMissions(getUserState, saveUserState, onBonusXP) {
    function updateMissionUI() {
      const state = getUserState();
      const missions = ensureMissions(state);

      Object.keys(MISSION_LABELS).forEach((key) => {
        const el = document.getElementById('mission-' + key);
        if (el) {
          const done = missions[key];
          el.classList.toggle('is-done', done);
          el.textContent = (done ? '☑ ' : '□ ') + MISSION_LABELS[key];
        }
      });

      const rewardBtn = document.getElementById('missionRewardBtn');
      if (rewardBtn) rewardBtn.hidden = true;

      const rewardEl = document.getElementById('missionReward');
      if (rewardEl) {
        if (missions.bonusClaimed) {
          rewardEl.textContent = '미션 보상 수령 완료 ✓';
          rewardEl.classList.add('is-claimed');
        } else if (allMissionsComplete(missions)) {
          rewardEl.textContent = '보상 +40XP 받기';
          rewardEl.classList.add('is-ready');
        } else {
          rewardEl.textContent = '보상 +40XP';
          rewardEl.classList.remove('is-ready', 'is-claimed');
        }
      }
    }

    function completeMission(type) {
      const state = getUserState();
      const missions = ensureMissions(state);
      if (missions[type]) return false;

      missions[type] = true;
      saveUserState(state);
      updateMissionUI();

      if (allMissionsComplete(missions) && !missions.bonusClaimed && onBonusXP) {
        missions.bonusClaimed = true;
        saveUserState(state);
        onBonusXP(MISSION_BONUS_XP, '오늘의 미션 완료');
        updateMissionUI();
      }

      return true;
    }

    updateMissionUI();

    return { completeMission, updateMissionUI, ensureMissions, MISSION_BONUS_XP };
  }

  OC.initMissions = initMissions;
})(window.OfficeCalm = window.OfficeCalm || {});
