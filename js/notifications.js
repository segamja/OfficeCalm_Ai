/**
 * Mindly — Web Notification API 기반 로컬 알림
 */
(function (OC) {
  const SETTINGS_KEY = 'officeCalm_notifications';
  const REMINDER_HOUR = 18;

  function isSupported() {
    return 'Notification' in window;
  }

  function getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? JSON.parse(raw) : { enabled: false, lastNotifiedDate: null };
    } catch {
      return { enabled: false, lastNotifiedDate: null };
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  async function requestPermission() {
    if (!isSupported()) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return Notification.requestPermission();
  }

  function showNotification(title, body) {
    if (!isSupported() || Notification.permission !== 'granted') return;
    new Notification(title, {
      body,
      tag: 'officecalm-daily-reminder',
    });
  }

  function getTodayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function scheduleDailyReminder(getUserState) {
    function checkReminder() {
      const settings = getSettings();
      if (!settings.enabled || Notification.permission !== 'granted') return;

      const today = getTodayString();
      const state = getUserState();

      if (state.lastCompletedDate === today) return;
      if (settings.lastNotifiedDate === today) return;

      const now = new Date();
      if (now.getHours() !== REMINDER_HOUR) return;

      showNotification(
        'Mindly',
        '오늘의 명상을 아직 완료하지 않았어요. 5분만 쉬어가 볼까요?'
      );

      settings.lastNotifiedDate = today;
      saveSettings(settings);
    }

    setInterval(checkReminder, 60 * 1000);
    checkReminder();
  }

  function updateNotifyButton(btn) {
    const settings = getSettings();

    if (!isSupported()) {
      btn.textContent = '알림 미지원';
      btn.disabled = true;
      return;
    }

    if (Notification.permission === 'denied') {
      btn.textContent = '알림 차단됨';
      btn.disabled = true;
      btn.title = '브라우저 설정에서 알림을 허용해 주세요.';
      return;
    }

    btn.disabled = false;
    btn.textContent = settings.enabled ? '🔔 알림 ON' : '🔕 알림 OFF';
    btn.title = settings.enabled
      ? `매일 ${REMINDER_HOUR}시에 명상 리마인더를 보냅니다.`
      : '클릭하여 명상 리마인더 알림을 켭니다.';
    btn.classList.toggle('btn--notify-on', settings.enabled);
  }

  function initNotifications(getUserState) {
    const btn = document.getElementById('notifyBtn');
    if (!btn) return;

    updateNotifyButton(btn);

    btn.addEventListener('click', async () => {
      if (!isSupported()) return;

      const settings = getSettings();

      if (settings.enabled) {
        settings.enabled = false;
        saveSettings(settings);
        updateNotifyButton(btn);
        return;
      }

      const permission = await requestPermission();
      if (permission !== 'granted') {
        updateNotifyButton(btn);
        return;
      }

      settings.enabled = true;
      saveSettings(settings);
      updateNotifyButton(btn);
      showNotification('Mindly', '명상 리마인더 알림이 켜졌습니다.');
    });

    scheduleDailyReminder(getUserState);
  }

  OC.initNotifications = initNotifications;
})(window.OfficeCalm = window.OfficeCalm || {});
