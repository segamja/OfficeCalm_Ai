/**
 * Mindly — PWA 설치 안내 및 Service Worker 등록
 * 향후 Push Notification / Firebase 연동 확장 지점
 */
(function (OC) {
  const DISMISS_KEY = 'mindly_pwa_install_dismissed';

  function isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  function isMobile() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }

  function initPWA() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./service-worker.js', { scope: './' })
        .catch((err) => console.warn('Service Worker 등록 실패:', err));
    });

    const banner = document.getElementById('pwaInstallBanner');
    const installBtn = document.getElementById('pwaInstallBtn');
    const dismissBtn = document.getElementById('pwaInstallDismissBtn');
    let deferredPrompt = null;

    function hideBanner() {
      if (banner) banner.hidden = true;
    }

    function showBanner() {
      if (!banner || isStandalone() || localStorage.getItem(DISMISS_KEY)) return;
      if (!isMobile() && !deferredPrompt) return;
      banner.hidden = false;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showBanner();
    });

    installBtn?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        hideBanner();
        return;
      }

      if (isMobile() && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        alert('Safari 공유 버튼(□↑)에서 "홈 화면에 추가"를 선택해 주세요.');
      } else if (isMobile()) {
        alert('브라우저 메뉴에서 "홈 화면에 추가" 또는 "앱 설치"를 선택해 주세요.');
      }
      hideBanner();
    });

    dismissBtn?.addEventListener('click', () => {
      localStorage.setItem(DISMISS_KEY, '1');
      hideBanner();
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      hideBanner();
    });

    if (isMobile() && !isStandalone() && !localStorage.getItem(DISMISS_KEY)) {
      setTimeout(showBanner, 2500);
    }
  }

  OC.initPWA = initPWA;
  OC.isStandalone = isStandalone;
})(window.OfficeCalm = window.OfficeCalm || {});
