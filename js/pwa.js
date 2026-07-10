/**
 * Mindly — PWA 설치, Service Worker 등록, 버전 업데이트
 */
(function (OC) {
  const DISMISS_KEY = 'mindly_pwa_install_dismissed_session';
  const UPDATE_CHECK_MS = 5 * 60 * 1000;
  const STANDALONE_UPDATE_CHECK_MS = 60 * 1000;

  let deferredPrompt = null;
  let swRegistration = null;
  let refreshing = false;
  let updateBannerVisible = false;
  let updateCheckTimer = null;
  let activeSwVersion = null;
  const installReadyCallbacks = [];

  function isDismissedThisSession() {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  }

  function dismissInstallBanner() {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  function getBasePath() {
    let path = location.pathname;
    if (path.endsWith('.html')) {
      path = path.slice(0, path.lastIndexOf('/') + 1);
    } else if (!path.endsWith('/')) {
      path += '/';
    }
    return path;
  }

  function isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  function isMobile() {
    return isIOS() || isAndroid() || /Mobile/i.test(navigator.userAgent);
  }

  function isInAppBrowser() {
    return /KAKAOTALK|Instagram|FBAN|FBAV|Line\//i.test(navigator.userAgent);
  }

  function canUseNativePrompt() {
    return !isIOS() && !isInAppBrowser() && 'BeforeInstallPromptEvent' in window;
  }

  function isInstallReady() {
    return Boolean(deferredPrompt);
  }

  function onInstallReady(callback) {
    if (deferredPrompt) callback(deferredPrompt);
    else installReadyCallbacks.push(callback);
  }

  function notifyInstallReady() {
    updateInstallButtons();
    installReadyCallbacks.splice(0).forEach((cb) => cb(deferredPrompt));
  }

  function updateInstallButtons() {
    const ready = isInstallReady();
    document.querySelectorAll('[data-pwa-install]').forEach((btn) => {
      btn.disabled = false;
      btn.setAttribute('aria-disabled', 'false');
      if (btn.id === 'pwaInstallBtn') {
        btn.textContent = ready ? '홈 화면에 설치' : '홈 화면에 설치';
      }
    });
  }

  function showUpdateToast(message) {
    const toast = document.getElementById('xpToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 2800);
  }

  function showUpdateBanner() {
    if (updateBannerVisible) return;
    const banner = document.getElementById('pwaUpdateBanner');
    if (!banner) return;
    banner.hidden = false;
    updateBannerVisible = true;
  }

  function hideUpdateBanner() {
    const banner = document.getElementById('pwaUpdateBanner');
    if (banner) banner.hidden = true;
    updateBannerVisible = false;
  }

  function applyUpdate() {
    const waiting = swRegistration?.waiting;
    if (!waiting) {
      window.location.reload();
      return;
    }
    waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  function handleWaitingWorker(worker) {
    if (!navigator.serviceWorker.controller) return;

    console.info('[Mindly PWA] 새 버전 대기 중');

    if (isStandalone()) {
      showUpdateToast('새 버전을 적용합니다…');
      hideUpdateBanner();
      setTimeout(() => applyUpdate(), 800);
      return;
    }

    showUpdateBanner();
    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') hideUpdateBanner();
    });
  }

  function checkForUpdate() {
    if (!swRegistration) return;
    swRegistration.update().catch((err) => console.warn('[Mindly PWA] 업데이트 확인 실패:', err));
    if (swRegistration.waiting) handleWaitingWorker(swRegistration.waiting);
  }

  function setupUpdateDetection(registration) {
    if (!registration) return;

    if (registration.waiting) {
      handleWaitingWorker(registration.waiting);
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          handleWaitingWorker(newWorker);
        }
      });
    });

    const interval = isStandalone() ? STANDALONE_UPDATE_CHECK_MS : UPDATE_CHECK_MS;

    if (updateCheckTimer) clearInterval(updateCheckTimer);
    updateCheckTimer = setInterval(checkForUpdate, interval);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) checkForUpdate();
    });

    window.addEventListener('focus', checkForUpdate);
    window.addEventListener('pageshow', () => checkForUpdate());

    setTimeout(checkForUpdate, 1000);
    setTimeout(checkForUpdate, 5000);
  }

  function showInstallGuide() {
    const modal = document.getElementById('pwaInstallGuideModal');
    const iosGuide = document.getElementById('pwaInstallGuideIos');
    const androidGuide = document.getElementById('pwaInstallGuideAndroid');
    const inAppGuide = document.getElementById('pwaInstallGuideInApp');
    const waitingGuide = document.getElementById('pwaInstallGuideWaiting');

    const androidAuto = document.getElementById('pwaInstallGuideAndroidAuto');

    if (!modal) return;

    iosGuide.hidden = !isIOS();
    inAppGuide.hidden = !isInAppBrowser();
    waitingGuide.hidden = isIOS() || isInAppBrowser() || isInstallReady();
    androidGuide.hidden = isIOS() || isInAppBrowser();
    if (androidAuto) androidAuto.hidden = !isInstallReady();

    modal.hidden = false;
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }

  function hideInstallGuide() {
    const modal = document.getElementById('pwaInstallGuideModal');
    if (!modal) return;
    modal.hidden = true;

    const anyOpen = document.querySelector('.modal:not([hidden])');
    if (!anyOpen) {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }
  }

  function ensureHomeLayoutOrder() {
    const homeHero = document.querySelector('.home-hero');
    if (!homeHero) return;

    const brand = homeHero.querySelector('.home-hero__brand');
    const hero = homeHero.querySelector('.hero-card');
    if (!brand || !hero) return;

    const brandFirst = !!(brand.compareDocumentPosition(hero) & Node.DOCUMENT_POSITION_FOLLOWING);
    if (brandFirst) return;

    const reloadKey = 'mindly_layout_fix_reload';
    if (sessionStorage.getItem(reloadKey)) return;

    sessionStorage.setItem(reloadKey, '1');
    console.warn('[Mindly PWA] 이전 홈 레이아웃 캐시 감지 — 새로고침합니다');

    const reload = () => {
      const url = new URL(location.href);
      url.searchParams.set('_layout', String(Date.now()));
      location.replace(url.toString());
    };

    if ('caches' in window) {
      caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((key) => key.startsWith('mindly-static-')).map((key) => caches.delete(key)))
        )
        .finally(reload);
      return;
    }

    reload();
  }

  function requestSwVersion() {
    const worker = navigator.serviceWorker.controller || swRegistration?.active;
    worker?.postMessage({ type: 'GET_VERSION' });
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return null;

    const base = getBasePath();
    const swUrl = base + 'service-worker.js';

    try {
      swRegistration = await navigator.serviceWorker.register(swUrl, {
        scope: base,
        updateViaCache: 'none',
      });
      console.info('[Mindly PWA] Service Worker 등록:', swRegistration.scope);
      setupUpdateDetection(swRegistration);
      requestSwVersion();
      return swRegistration;
    } catch (err) {
      console.error('[Mindly PWA] Service Worker 등록 실패:', err);
      return null;
    }
  }

  async function promptInstall() {
    if (isStandalone()) {
      return { ok: true, reason: 'already-installed' };
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        const accepted = choice.outcome === 'accepted';
        if (accepted) deferredPrompt = null;
        updateInstallButtons();
        return { ok: accepted, reason: choice.outcome };
      } catch (err) {
        console.error('[Mindly PWA] prompt() 실패:', err);
        deferredPrompt = null;
        updateInstallButtons();
        return { ok: false, reason: 'prompt-error' };
      }
    }

    if (canUseNativePrompt()) {
      await registerServiceWorker();
      showInstallGuide();
      return { ok: false, reason: 'waiting-for-prompt' };
    }

    showInstallGuide();
    return { ok: false, reason: 'manual-required' };
  }

  function captureBeforeInstallPrompt(e) {
    e.preventDefault();
    deferredPrompt = e;
    console.info('[Mindly PWA] beforeinstallprompt 캡처됨');
    notifyInstallReady();
  }

  window.addEventListener('beforeinstallprompt', captureBeforeInstallPrompt);

  window.addEventListener('mindly-installable', () => {
    if (!deferredPrompt && window.__mindlyDeferredPrompt) {
      deferredPrompt = window.__mindlyDeferredPrompt;
      notifyInstallReady();
    }
  });

  navigator.serviceWorker?.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  navigator.serviceWorker?.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_ACTIVATED') {
      activeSwVersion = event.data.version;
      OC.activeSwVersion = activeSwVersion;
      console.info('[Mindly PWA] SW 활성화:', event.data.version);
      document.dispatchEvent(new CustomEvent('mindly-sw-version', { detail: event.data.version }));
    }
  });

  if (window.__mindlyDeferredPrompt) {
    deferredPrompt = window.__mindlyDeferredPrompt;
    notifyInstallReady();
  }

  registerServiceWorker();

  function initPWA() {
    ensureHomeLayoutOrder();

    const banner = document.getElementById('pwaInstallBanner');
    const installBtn = document.getElementById('pwaInstallBtn');
    const dismissBtn = document.getElementById('pwaInstallDismissBtn');
    const updateBtn = document.getElementById('pwaUpdateBtn');
    const updateDismissBtn = document.getElementById('pwaUpdateDismissBtn');

    function hideBanner() {
      if (banner) banner.hidden = true;
    }

    function showBanner() {
      if (!banner || isStandalone() || isDismissedThisSession()) return;
      banner.hidden = false;
      const textEl = banner.querySelector('.pwa-install-banner__text');
      if (textEl && !isInstallReady()) {
        textEl.textContent =
          'Mindly를 홈 화면에 설치하고 앱처럼 사용해 보세요. (버튼을 누르면 설치 방법을 안내합니다)';
      }
    }

    installBtn?.setAttribute('data-pwa-install', '');
    updateInstallButtons();

    onInstallReady(() => showBanner());

    installBtn?.addEventListener('click', async () => {
      const result = await promptInstall();
      if (result.ok && result.reason === 'accepted') hideBanner();
    });

    dismissBtn?.addEventListener('click', () => {
      dismissInstallBanner();
      hideBanner();
    });

    updateBtn?.addEventListener('click', () => applyUpdate());

    updateDismissBtn?.addEventListener('click', () => hideUpdateBanner());

    document.getElementById('pwaInstallGuideCloseBtn')?.addEventListener('click', hideInstallGuide);
    document.getElementById('pwaInstallGuideBackdrop')?.addEventListener('click', hideInstallGuide);

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      updateInstallButtons();
      hideBanner();
      hideInstallGuide();
      console.info('[Mindly PWA] 앱 설치 완료');
    });

    if (!isStandalone() && !isDismissedThisSession()) {
      setTimeout(showBanner, 2000);
    }

    try {
      localStorage.removeItem('mindly_pwa_install_dismissed');
    } catch {
      /* ignore legacy dismiss key */
    }
  }

  const versionMeta = window.MindlyVersion || { APP_VERSION: '2.5', SW_CACHE_VERSION: 'mindly-v2.5' };
  OC.APP_VERSION = versionMeta.APP_VERSION;
  OC.SW_CACHE_VERSION = versionMeta.SW_CACHE_VERSION;
  OC.activeSwVersion = null;

  OC.getVersionInfo = () => ({
    appVersion: OC.APP_VERSION,
    latestCacheVersion: OC.SW_CACHE_VERSION,
    activeCacheVersion: activeSwVersion || OC.activeSwVersion || null,
    standalone: isStandalone(),
    updatePending: Boolean(swRegistration?.waiting),
    installReady: isInstallReady(),
  });
  OC.initPWA = initPWA;
  OC.isStandalone = isStandalone;
  OC.promptInstall = promptInstall;
  OC.isInstallReady = isInstallReady;
  OC.applyAppUpdate = applyUpdate;
  OC.checkForUpdate = checkForUpdate;
  OC.requestSwVersion = requestSwVersion;
  OC.getPWAStatus = () => ({
    installReady: isInstallReady(),
    standalone: isStandalone(),
    swScope: swRegistration?.scope ?? null,
    canUseNativePrompt: canUseNativePrompt(),
    updateWaiting: Boolean(swRegistration?.waiting),
    appVersion: OC.APP_VERSION,
  });
})(window.OfficeCalm = window.OfficeCalm || {});
