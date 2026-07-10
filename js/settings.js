/**
 * Mindly — Settings 화면 (Sprint 03)
 * 향후 Firebase 로그인·Push Notification 연동 확장 지점
 */
(function (OC) {
  const APP_VERSION = '2.3';

  const COMING_SOON_ITEMS = ['notifications', 'daily-goal', 'theme', 'language'];

  const ABOUT_LINKS = {
    github: 'https://github.com/segamja/OfficeCalm_Ai',
    portfolio: 'https://github.com/segamja',
    email: 'mailto:segamja@gmail.com',
  };

  function showToast(message) {
    const toast = document.getElementById('xpToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function initSettings(options = {}) {
    const { updateGreetingUI, onInstallApp } = options;
    const screen = document.getElementById('settingsScreen');
    const settingsBtn = document.getElementById('settingsBtn');
    const backBtn = document.getElementById('settingsBackBtn');
    const titleEl = document.getElementById('settingsScreenTitle');
    const mainView = document.getElementById('settingsMainView');
    const subView = document.getElementById('settingsSubView');
    const nicknameInput = document.getElementById('settingsProfileNickname');
    const saveProfileBtn = document.getElementById('settingsProfileSaveBtn');
    const versionEl = document.getElementById('settingsAboutVersion');

    if (!screen) return;

    let currentView = 'main';

    if (versionEl) versionEl.textContent = 'Version ' + APP_VERSION;

    function openScreen() {
      screen.hidden = false;
      document.body.classList.add('settings-open');
      showView('main');
    }

    function closeScreen() {
      screen.hidden = true;
      document.body.classList.remove('settings-open');
      showView('main');
    }

    function showView(viewId) {
      currentView = viewId;

      if (viewId === 'main') {
        mainView.hidden = false;
        subView.hidden = true;
        titleEl.textContent = '설정';
        backBtn.setAttribute('aria-label', '닫기');
      } else {
        mainView.hidden = true;
        subView.hidden = false;
        backBtn.setAttribute('aria-label', '뒤로');

        const titles = {
          profile: '👤 Profile',
          about: '❤️ About Mindly',
          privacy: '📄 Privacy Policy',
          terms: '📃 Terms of Service',
        };
        titleEl.textContent = titles[viewId] || '설정';

        subView.querySelectorAll('[data-settings-panel]').forEach((panel) => {
          panel.hidden = panel.dataset.settingsPanel !== viewId;
        });

        if (viewId === 'profile' && nicknameInput) {
          nicknameInput.value = OC.getNickname?.() || '';
        }
      }
    }

    settingsBtn?.addEventListener('click', openScreen);

    backBtn?.addEventListener('click', () => {
      if (currentView === 'main') closeScreen();
      else showView('main');
    });

    document.querySelectorAll('[data-settings-nav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.settingsNav;

        if (COMING_SOON_ITEMS.includes(target)) {
          showToast('준비 중입니다 — Coming Soon');
          return;
        }

        if (target === 'install-app') {
          onInstallApp?.();
          return;
        }

        showView(target);
      });
    });

    saveProfileBtn?.addEventListener('click', () => {
      if (!OC.setNickname?.(nicknameInput?.value)) {
        nicknameInput?.focus();
        showToast('닉네임을 입력해 주세요.');
        return;
      }
      updateGreetingUI?.();
      showToast('닉네임이 저장되었습니다.');
      showView('main');
    });

    nicknameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveProfileBtn?.click();
    });

    document.getElementById('settingsAboutGithub')?.addEventListener('click', () => {
      window.open(ABOUT_LINKS.github, '_blank', 'noopener');
    });
    document.getElementById('settingsAboutPortfolio')?.addEventListener('click', () => {
      window.open(ABOUT_LINKS.portfolio, '_blank', 'noopener');
    });
    document.getElementById('settingsAboutEmail')?.addEventListener('click', () => {
      window.location.href = ABOUT_LINKS.email;
    });

    return { openScreen, closeScreen, APP_VERSION };
  }

  OC.initSettings = initSettings;
})(window.OfficeCalm = window.OfficeCalm || {});
