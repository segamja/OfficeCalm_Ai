/**
 * Mindly — Settings 화면 (Sprint 03)
 * 향후 Firebase 로그인·Push Notification 연동 확장 지점
 */
(function (OC) {
  const COMING_SOON_ITEMS = ['notifications', 'daily-goal', 'theme', 'language'];

  const ABOUT_LINKS = {
    github: 'https://github.com/segamja/OfficeCalm_Ai',
    portfolio: 'https://github.com/segamja',
    email: 'mailto:segamja@gmail.com',
  };

  function getAppVersion() {
    return OC.APP_VERSION || window.MindlyVersion?.APP_VERSION || '2.5';
  }

  function showToast(message) {
    const toast = document.getElementById('xpToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function renderAboutVersion() {
    const info = OC.getVersionInfo?.() || {
      appVersion: getAppVersion(),
      latestCacheVersion: OC.SW_CACHE_VERSION || window.MindlyVersion?.SW_CACHE_VERSION || '—',
      activeCacheVersion: OC.activeSwVersion || null,
      standalone: OC.isStandalone?.() || false,
      updatePending: false,
    };

    const versionEl = document.getElementById('settingsAboutVersion');
    const appVersionEl = document.getElementById('settingsAboutAppVersion');
    const activeCacheEl = document.getElementById('settingsAboutActiveCache');
    const latestCacheEl = document.getElementById('settingsAboutLatestCache');
    const runModeEl = document.getElementById('settingsAboutRunMode');
    const updateStatusEl = document.getElementById('settingsAboutUpdateStatus');

    const appVersion = info.appVersion || getAppVersion();
    const activeCache = info.activeCacheVersion;
    const latestCache = info.latestCacheVersion || '—';
    const isUpToDate = activeCache && latestCache && activeCache === latestCache;

    if (versionEl) versionEl.textContent = 'Version ' + appVersion;
    if (appVersionEl) appVersionEl.textContent = appVersion;
    if (activeCacheEl) {
      activeCacheEl.textContent = activeCache || '확인 중…';
      activeCacheEl.classList.toggle('about-version-detail__value--pending', !activeCache);
    }
    if (latestCacheEl) latestCacheEl.textContent = latestCache;
    if (runModeEl) {
      runModeEl.textContent = info.standalone ? '설치된 앱 (standalone)' : '브라우저';
    }
    if (updateStatusEl) {
      if (info.updatePending) {
        updateStatusEl.textContent = '새 버전 대기 중 — 새로고침 또는 앱 재실행';
        updateStatusEl.classList.add('about-version-detail__value--warn');
        updateStatusEl.classList.remove('about-version-detail__value--ok');
      } else if (isUpToDate) {
        updateStatusEl.textContent = '최신 버전 적용됨';
        updateStatusEl.classList.add('about-version-detail__value--ok');
        updateStatusEl.classList.remove('about-version-detail__value--warn');
      } else if (activeCache) {
        updateStatusEl.textContent = '캐시 동기화 확인 중';
        updateStatusEl.classList.remove('about-version-detail__value--ok', 'about-version-detail__value--warn');
      } else {
        updateStatusEl.textContent = '확인 중…';
        updateStatusEl.classList.remove('about-version-detail__value--ok', 'about-version-detail__value--warn');
      }
    }
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

    if (!screen) return;

    let currentView = 'main';

    renderAboutVersion();
    document.addEventListener('mindly-sw-version', renderAboutVersion);

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

        if (viewId === 'about') {
          OC.requestSwVersion?.();
          renderAboutVersion();
          OC.checkForUpdate?.();
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

    return { openScreen, closeScreen, getAppVersion, renderAboutVersion };
  }

  OC.initSettings = initSettings;
})(window.OfficeCalm = window.OfficeCalm || {});
