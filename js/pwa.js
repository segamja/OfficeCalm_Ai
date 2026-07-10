/**
 * Mindly — PWA 설치 안내 및 Service Worker 등록
 */
(function (OC) {
  const DISMISS_KEY = 'mindly_pwa_install_dismissed';

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

  let deferredPrompt = null;

  function showInstallGuide() {
    const modal = document.getElementById('pwaInstallGuideModal');
    const iosGuide = document.getElementById('pwaInstallGuideIos');
    const androidGuide = document.getElementById('pwaInstallGuideAndroid');
    const inAppGuide = document.getElementById('pwaInstallGuideInApp');

    if (!modal) return;

    iosGuide.hidden = !isIOS();
    androidGuide.hidden = isIOS() || isInAppBrowser();
    inAppGuide.hidden = !isInAppBrowser();

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

  async function promptInstall() {
    if (isStandalone()) {
      return { ok: true, reason: 'already-installed' };
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      return { ok: choice.outcome === 'accepted', reason: choice.outcome };
    }

    showInstallGuide();
    return { ok: false, reason: 'manual-required' };
  }

  function initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./service-worker.js', { scope: './' })
          .catch((err) => console.warn('Service Worker 등록 실패:', err));
      });
    }

    const banner = document.getElementById('pwaInstallBanner');
    const installBtn = document.getElementById('pwaInstallBtn');
    const dismissBtn = document.getElementById('pwaInstallDismissBtn');

    function hideBanner() {
      if (banner) banner.hidden = true;
    }

    function showBanner() {
      if (!banner || isStandalone() || localStorage.getItem(DISMISS_KEY)) return;
      banner.hidden = false;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showBanner();
    });

    installBtn?.addEventListener('click', async () => {
      const result = await promptInstall();
      if (result.ok && result.reason !== 'already-installed') hideBanner();
    });

    dismissBtn?.addEventListener('click', () => {
      localStorage.setItem(DISMISS_KEY, '1');
      hideBanner();
    });

    document.getElementById('pwaInstallGuideCloseBtn')?.addEventListener('click', hideInstallGuide);
    document.getElementById('pwaInstallGuideBackdrop')?.addEventListener('click', hideInstallGuide);

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      hideBanner();
      hideInstallGuide();
    });

    if (isMobile() && !isStandalone() && !localStorage.getItem(DISMISS_KEY)) {
      setTimeout(showBanner, 3000);
    }
  }

  OC.initPWA = initPWA;
  OC.isStandalone = isStandalone;
  OC.promptInstall = promptInstall;
})(window.OfficeCalm = window.OfficeCalm || {});
