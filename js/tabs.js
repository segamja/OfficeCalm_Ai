/**
 * OfficeCalm AI — 5탭 전환 (모든 화면 공통)
 */
(function (OC) {
  const STORAGE_KEY = 'officeCalm_active_tab';
  const DEFAULT_TAB = 'home';
  const VALID_TABS = ['home', 'ai', 'breathe', 'library', 'journal'];

  function initTabs() {
    const appEl = document.querySelector('.app');
    const tabButtons = Array.from(document.querySelectorAll('.tab-nav__btn[data-tab]'));
    const panels = Array.from(document.querySelectorAll('[data-tab-panel]'));

    if (!tabButtons.length || !panels.length) return null;

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

      panels.forEach((panel) => {
        panel.classList.toggle('is-active', panel.dataset.tabPanel === target);
      });

      appEl?.classList.add('is-tab-mode');
      appEl?.setAttribute('data-active-tab', target);

      if (persist !== false) {
        sessionStorage.setItem(STORAGE_KEY, target);
      }
    }

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        setActiveTab(btn.dataset.tab);
      });
    });

    setActiveTab(getSavedTab(), false);

    return { setActiveTab };
  }

  OC.initTabs = initTabs;
})(window.OfficeCalm = window.OfficeCalm || {});
