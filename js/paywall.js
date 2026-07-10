/**
 * OfficeCalm AI — 프리미엄 잠금 및 페이월 모달 제어
 */
(function (OC) {
  function initPaywall(getUserState, saveUserState) {
    const modal = document.getElementById('paywallModal');
    const backdrop = document.getElementById('modalBackdrop');
    const closeBtn = document.getElementById('modalCloseBtn');
    const trialBtn = document.getElementById('startTrialBtn');
    const premiumBadge = document.getElementById('premiumBadge');

    function updatePremiumUI() {
      const { isPremium } = getUserState();
      premiumBadge.textContent = isPremium ? 'PREMIUM' : 'FREE';
      premiumBadge.classList.toggle('is-active', isPremium);

      document.querySelectorAll('.audio-item--premium').forEach((item) => {
        item.classList.toggle('is-unlocked', isPremium);
      });
    }

    function openModal() {
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      trialBtn.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = '';
    }

    function isPremiumUser() {
      return getUserState().isPremium === true;
    }

    function checkAccess(isFreeAction) {
      if (isFreeAction || isPremiumUser()) return true;
      openModal();
      return false;
    }

    function activateTrial() {
      const state = getUserState();
      state.isPremium = true;
      saveUserState(state);
      updatePremiumUI();
      closeModal();
    }

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    trialBtn.addEventListener('click', activateTrial);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    updatePremiumUI();

    return { checkAccess, openModal, closeModal, updatePremiumUI, isPremiumUser };
  }

  OC.initPaywall = initPaywall;
})(window.OfficeCalm = window.OfficeCalm || {});
