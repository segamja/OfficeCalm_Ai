/**
 * Mindly — 닉네임 온보딩 (localStorage.nickname)
 * 향후 Firebase displayName으로 교체 가능하도록 모듈화
 */
(function (OC) {
  const NICKNAME_KEY = 'nickname';

  function getNickname() {
    try {
      return localStorage.getItem(NICKNAME_KEY)?.trim() || '';
    } catch {
      return '';
    }
  }

  function setNickname(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) return false;
    localStorage.setItem(NICKNAME_KEY, trimmed);
    return true;
  }

  function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { emoji: '🌤', text: '좋은 아침입니다.' };
    if (hour >= 12 && hour < 18) return { emoji: '☀️', text: '좋은 오후입니다.' };
    if (hour >= 18 && hour < 22) return { emoji: '🌆', text: '수고 많으셨어요.' };
    return { emoji: '🌙', text: '편안한 밤 되세요.' };
  }

  function formatNicknameDisplay(nickname) {
    return nickname ? nickname + '님' : '회원님';
  }

  function updateGreetingUI() {
    const greeting = getTimeGreeting();
    const nickname = getNickname();

    const emojiEl = document.getElementById('heroGreetingEmoji');
    const textEl = document.getElementById('heroGreetingText');
    const nameEl = document.getElementById('heroNickname');
    const aiGreetingEl = document.getElementById('aiCoachGreetingText');

    if (emojiEl) emojiEl.textContent = greeting.emoji;
    if (textEl) textEl.textContent = greeting.text;
    if (nameEl) nameEl.textContent = formatNicknameDisplay(nickname);
    if (aiGreetingEl) {
      aiGreetingEl.textContent =
        '안녕하세요, ' +
        formatNicknameDisplay(nickname) +
        ' 😊\n지금 어떤 상황인지 편하게 말씀해 주세요. 함께 회복해 볼게요.';
    }
  }

  function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }

  function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.hidden = true;

    const anyOpen = document.querySelector('.modal:not([hidden])');
    if (!anyOpen) {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }
  }

  function initOnboarding(options = {}) {
    const { onComplete, setActiveTab } = options;
    const onboardingModal = document.getElementById('onboardingModal');
    const nicknameInput = document.getElementById('onboardingNickname');
    const startBtn = document.getElementById('onboardingStartBtn');
    const mindlyCharacter = document.getElementById('mindlyCharacter');

    function finishOnboarding() {
      document.body.classList.remove('is-onboarding');
      hideModal('onboardingModal');
      updateGreetingUI();
      onComplete?.();
    }

    function openOnboarding() {
      setActiveTab?.('home', false);
      document.body.classList.add('is-onboarding');
      showModal('onboardingModal');
      nicknameInput?.focus();
    }

    if (!getNickname()) {
      openOnboarding();
    } else {
      updateGreetingUI();
    }

    startBtn?.addEventListener('click', () => {
      const name = nicknameInput?.value;
      if (!setNickname(name)) {
        nicknameInput?.focus();
        return;
      }
      finishOnboarding();
    });

    nicknameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') startBtn?.click();
    });

    mindlyCharacter?.addEventListener('click', () => showModal('mindlyCharacterModal'));
    document.getElementById('mindlyCharacterCloseBtn')?.addEventListener('click', () =>
      hideModal('mindlyCharacterModal')
    );
    document.getElementById('mindlyCharacterBackdrop')?.addEventListener('click', () =>
      hideModal('mindlyCharacterModal')
    );

    document.getElementById('onboardingBackdrop')?.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    return { getNickname, setNickname, updateGreetingUI, getTimeGreeting, formatNicknameDisplay };
  }

  OC.getNickname = getNickname;
  OC.setNickname = setNickname;
  OC.getTimeGreeting = getTimeGreeting;
  OC.initOnboarding = initOnboarding;
  OC.updateGreetingUI = updateGreetingUI;
})(window.OfficeCalm = window.OfficeCalm || {});
