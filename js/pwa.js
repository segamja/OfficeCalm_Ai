/**
 * Mindly — PWA 설치, Service Worker 등록, 버전 업데이트
 */
(function (OC) {
  const DISMISS_KEY = 'mindly_pwa_install_dismissed';
  const UPDATE_CHECK_MS = 30 * 60 * 1000;

  let deferredPrompt = null;
  let swRegistration = null;
  let refreshing = false;
  let updateBannerVisible = false;
  const installReadyCallbacks = [];

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
      btn.disabled = !ready && canUseNativePrompt();
      btn.setAttribute('aria-disabled', btn.disabled ? 'true' : 'false');
      if (btn.id === 'pwaInstallBtn') {
        btn.textContent = ready ? '홈 화면에 설치' : canUseNativePrompt() ? '설치 준비 중…' : '홈 화면에 설치';
      }
    });
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

  function handleWaitingWorker(worker) {
    if (!navigator.serviceWorker.controller) return;
    showUpdateBanner();

    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') {
        hideUpdateBanner();
      }
    });
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

    const checkForUpdate = () => {
      registration.update().catch((err) => console.warn('[Mindly PWA] 업데이트 확인 실패:', err));
    };

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) checkForUpdate();
    });

    window.addEventListener('focus', checkForUpdate);
    setInterval(checkForUpdate, UPDATE_CHECK_MS);
    setTimeout(checkForUpdate, 5000);
  }

  function applyUpdate() {
    if (!swRegistration?.waiting) {
      window.location.reload();
      return;
    }
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  function showInstallGuide() {
    const modal = document.getElementById('pwaInstallGuideModal');
    const iosGuide = document.getElementById('pwaInstallGuideIos');
    const androidGuide = document.getElementById('pwaInstallGuideAndroid');
    const inAppGuide = document.getElementById('pwaInstallGuideInApp');
    const waitingGuide = document.getElementById('pwaInstallGuideWaiting');

    if (!modal) return;

    iosGuide.hidden = !isIOS();
    inAppGuide.hidden = !isInAppBrowser();
    waitingGuide.hidden = isIOS() || isInAppBrowser() || isInstallReady();
    androidGuide.hidden = isIOS() || isInAppBrowser() || !isInstallReady();

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

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return null;

    const base = getBasePath();
    const swUrl = base + 'service-worker.js?v=' + encodeURIComponent(OC.APP_VERSION || '2.2');

    try {
      swRegistration = await navigator.serviceWorker.register(swUrl, {
        scope: base,
        updateViaCache: 'none',
      });
      console.info('[Mindly PWA] Service Worker 등록:', swRegistration.scope);
      setupUpdateDetection(swRegistration);
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

  if (window.__mindlyDeferredPrompt) {
    deferredPrompt = window.__mindlyDeferredPrompt;
    notifyInstallReady();
  }

  registerServiceWorker();

  function initPWA() {
    const banner = document.getElementById('pwaInstallBanner');
    const installBtn = document.getElementById('pwaInstallBtn');
    const dismissBtn = document.getElementById('pwaInstallDismissBtn');
    const updateBtn = document.getElementById('pwaUpdateBtn');
    const updateDismissBtn = document.getElementById('pwaUpdateDismissBtn');

    function hideBanner() {
      if (banner) banner.hidden = true;
    }

    function showBanner() {
      if (!banner || isStandalone() || localStorage.getItem(DISMISS_KEY)) return;
      banner.hidden = false;
    }

    installBtn?.setAttribute('data-pwa-install', '');
    updateInstallButtons();

    onInstallReady(() => showBanner());

    installBtn?.addEventListener('click', async () => {
      const result = await promptInstall();
      if (result.ok && result.reason === 'accepted') hideBanner();
    });

    dismissBtn?.addEventListener('click', () => {
      localStorage.setItem(DISMISS_KEY, '1');
      hideBanner();
    });

    updateBtn?.addEventListener('click', () => {
      applyUpdate();
    });

    updateDismissBtn?.addEventListener('click', () => {
      hideUpdateBanner();
    });

    document.getElementById('pwaInstallGuideCloseBtn')?.addEventListener('click', hideInstallGuide);
    document.getElementById('pwaInstallGuideBackdrop')?.addEventListener('click', hideInstallGuide);

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      updateInstallButtons();
      hideBanner();
      hideInstallGuide();
      console.info('[Mindly PWA] 앱 설치 완료');
    });

    if (isMobile() && !isStandalone() && !localStorage.getItem(DISMISS_KEY)) {
      setTimeout(showBanner, 3000);
    }
  }

  OC.APP_VERSION = '2.2';
  OC.initPWA = initPWA;
  OC.isStandalone = isStandalone;
  OC.promptInstall = promptInstall;
  OC.isInstallReady = isInstallReady;
  OC.applyAppUpdate = applyUpdate;
  OC.getPWAStatus = () => ({
    installReady: isInstallReady(),
    standalone: isStandalone(),
    swScope: swRegistration?.scope ?? null,
    canUseNativePrompt: canUseNativePrompt(),
    updateWaiting: Boolean(swRegistration?.waiting),
    appVersion: OC.APP_VERSION,
  });
})(window.OfficeCalm = window.OfficeCalm || {});
