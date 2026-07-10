/**
 * OfficeCalm AI — 모바일 탭 전환 (PC는 대시보드 동시 노출)
 */
(function (OC) {
  const STORAGE_KEY = 'officeCalm_active_tab';
  const MOBILE_QUERY = '(max-width: 899px)';
  const DEFAULT_TAB = 'home';
  const VALID_TABS = ['home', 'ai', 'breathe', 'library', 'journal'];

  function initTabs() {
    const appEl = document.querySelector('.app');
    const tabButtons = Array.from(document.querySelectorAll('.tab-nav__btn[data-tab]'));
    const panels = Array.from(document.querySelectorAll('[data-tab-panel]'));
    const mediaQuery = window.matchMedia(MOBILE_QUERY);

    if (!tabButtons.length || !panels.length) return null;

    function isMobile() {
      return mediaQuery.matches;
    }

    function getSavedTab() {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return VALID_TABS.includes(saved) ? saved : DEFAULT_TAB;
    }

    function setActiveTab(tabId, persist) {
      const target = VALID_TABS.includes(tabId) ? tabId : DEFAULT_TAB;

      tabButtons.forEach((btn) => {
        const active = btn.dataset.tab === target;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      if (isMobile()) {
        panels.forEach((panel) => {
          panel.classList.toggle('is-active', panel.dataset.tabPanel === target);
        });
        appEl?.classList.add('is-mobile-tabs');
        appEl?.setAttribute('data-active-tab', target);
      } else {
        panels.forEach((panel) => panel.classList.add('is-active'));
        appEl?.classList.remove('is-mobile-tabs');
        appEl?.removeAttribute('data-active-tab');
      }

      if (persist !== false) {
        sessionStorage.setItem(STORAGE_KEY, target);
      }
    }

    function applyLayoutMode() {
      if (isMobile()) {
        setActiveTab(getSavedTab(), false);
      } else {
        panels.forEach((panel) => panel.classList.add('is-active'));
        appEl?.classList.remove('is-mobile-tabs');
        appEl?.removeAttribute('data-active-tab');
        tabButtons.forEach((btn) => {
          btn.classList.remove('is-active');
          btn.setAttribute('aria-selected', 'false');
        });
      }
    }

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!isMobile()) return;
        setActiveTab(btn.dataset.tab);
      });
    });

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', applyLayoutMode);
    } else {
      mediaQuery.addListener(applyLayoutMode);
    }

    applyLayoutMode();

    return { setActiveTab, isMobile };
  }

  OC.initTabs = initTabs;
})(window.OfficeCalm = window.OfficeCalm || {});
