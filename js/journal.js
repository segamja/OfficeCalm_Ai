/**
 * OfficeCalm AI — 감사일기 작성 및 히스토리
 */
(function (OC) {
  function renderHistory(entries) {
    const listEl = document.getElementById('journalHistory');
    if (!listEl) return;

    if (!entries.length) {
      listEl.innerHTML = '<li class="journal-history__empty">아직 작성한 감사일기가 없습니다.</li>';
      return;
    }

    listEl.innerHTML = entries
      .slice()
      .reverse()
      .map((entry) => {
        const dateLabel = entry.date.replace(/-/g, '.');
        return (
          '<li class="journal-history__item">' +
          '<span class="journal-history__date">' + dateLabel + '</span>' +
          '<p class="journal-history__text">' + escapeHtml(entry.text) + '</p>' +
          '</li>'
        );
      })
      .join('');
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getTodayEntry(state) {
    const today = OC.getTodayString();
    return (state.gratitudeJournal || []).find((e) => e.date === today);
  }

  function initJournal(getUserState, saveUserState, onXpEarned) {
    const inputEl = document.getElementById('gratitudeInput');
    const saveBtn = document.getElementById('saveJournalBtn');
    const statusEl = document.getElementById('journalStatus');

    function getState() {
      return getUserState();
    }

    function updateStatus() {
      const state = getState();
      const todayEntry = getTodayEntry(state);
      if (!statusEl) return;

      if (todayEntry) {
        statusEl.textContent = '오늘의 감사일기 완료 ✓';
        statusEl.classList.add('is-done');
        if (inputEl) inputEl.value = todayEntry.text;
        if (saveBtn) saveBtn.textContent = '감사일기 수정';
      } else {
        statusEl.textContent = '오늘 감사한 일을 기록해 보세요';
        statusEl.classList.remove('is-done');
        if (saveBtn) saveBtn.textContent = '감사일기 저장';
      }
    }

    function saveEntry() {
      const state = getState();
      if (!state.gratitudeJournal) state.gratitudeJournal = [];

      const text = inputEl?.value.trim();
      if (!text) return;

      const today = OC.getTodayString();
      const existing = getTodayEntry(state);
      const isNewToday = !existing;

      if (existing) {
        existing.text = text;
        existing.updatedAt = new Date().toISOString();
      } else {
        state.gratitudeJournal.push({
          date: today,
          text,
          createdAt: new Date().toISOString(),
        });
      }

      state.lastJournalDate = today;
      saveUserState(state);
      renderHistory(state.gratitudeJournal);
      updateStatus();

      if (isNewToday && onXpEarned) {
        onXpEarned(20, '감사일기 작성');
      }

      if (OC.calculateMindEnergy) {
        state.mindEnergy = OC.calculateMindEnergy(state);
        saveUserState(state);
        const mindEl = document.getElementById('mindEnergyScore');
        const mindBar = document.getElementById('mindEnergyBar');
        if (mindEl) mindEl.textContent = state.mindEnergy;
        if (mindBar) mindBar.style.width = state.mindEnergy + '%';
      }
    }

    saveBtn?.addEventListener('click', saveEntry);

    const initialState = getState();
    if (!initialState.gratitudeJournal) initialState.gratitudeJournal = [];
    renderHistory(initialState.gratitudeJournal);
    updateStatus();

    return { updateStatus, saveEntry };
  }

  OC.initJournal = initJournal;
})(window.OfficeCalm = window.OfficeCalm || {});
