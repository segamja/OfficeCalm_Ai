/**
 * Mindly — 레벨 기반 콘텐츠 잠금 제어
 */
(function (OC) {
  function initLevelGate(getUserState) {
    const modal = document.getElementById('levelGateModal');
    const backdrop = document.getElementById('levelGateBackdrop');
    const closeBtn = document.getElementById('levelGateCloseBtn');
    const okBtn = document.getElementById('levelGateOkBtn');
    const requiredEl = document.getElementById('levelGateRequired');
    const libraryBadge = document.getElementById('libraryBadge');

    function getUserLevel() {
      return getUserState().level || 1;
    }

    function updateLevelUI() {
      const level = getUserLevel();
      if (libraryBadge) {
        libraryBadge.textContent = '내 레벨 Lv.' + level;
      }

      document.querySelectorAll('[data-level-required]').forEach((item) => {
        const required = Number(item.dataset.levelRequired);
        const unlocked = level >= required;
        item.classList.toggle('is-unlocked', unlocked);
        item.classList.toggle('is-locked', !unlocked);

        const lockEl = item.querySelector('.audio-item__lock');
        if (lockEl) {
          lockEl.textContent = unlocked ? '' : 'Lv.' + required;
        }
      });
    }

    function openLevelModal(requiredLevel) {
      if (!modal) return;
      const title = OC.getLevelTitle ? OC.getLevelTitle(requiredLevel) : '';
      requiredEl.textContent = 'Lv.' + requiredLevel + (title ? ' (' + title + ')' : '');
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      closeBtn?.focus();
    }

    function closeLevelModal() {
      if (!modal) return;
      modal.hidden = true;
      document.body.style.overflow = '';
    }

    function checkLevelAccess(requiredLevel) {
      if (!requiredLevel || getUserLevel() >= requiredLevel) return true;
      openLevelModal(requiredLevel);
      return false;
    }

    closeBtn?.addEventListener('click', closeLevelModal);
    okBtn?.addEventListener('click', closeLevelModal);
    backdrop?.addEventListener('click', closeLevelModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.hidden) closeLevelModal();
    });

    updateLevelUI();

    return { checkLevelAccess, updateLevelUI, getUserLevel };
  }

  OC.initLevelGate = initLevelGate;
})(window.OfficeCalm = window.OfficeCalm || {});
