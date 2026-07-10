/**
 * OfficeCalm AI — 가상 AI 스크립트 프리셋 및 타이핑 효과
 */
(function (OC) {
  const PRESET_SCRIPTS = {
    meeting: {
      label: '회의 5분 전',
      isFree: true,
      script: `깊게 숨을 들이쉬고, 어깨의 긴장을 내려놓으세요.
지금 이 순간, 당신은 충분히 준비되어 있습니다.
회의실에 들어서며, 차분하고 명확한 목소리로 자신을 믿으세요.`,
    },
    boss: {
      label: '상사 잔소리 직후',
      isFree: false,
      script: `그 말들은 당신의 가치를 정의하지 않습니다.
천천히 호흡하며, 감정과 사실을 분리해 보세요.
지금은 잠시 자리를 비우고, 스스로에게 친절을 베풀 시간입니다.`,
    },
    commute: {
      label: '출근길 무기력',
      isFree: false,
      script: `오늘 하루도 이미 시작되었고, 그것만으로 충분합니다.
창밖을 바라보며, 발밑에 땅이 있다는 것을 느껴 보세요.
작은 한 걸음이 모여, 의미 있는 하루를 만듭니다.`,
    },
    overtime: {
      label: '야근 번아웃',
      isFree: false,
      script: `지금 이 피로는 당신이 열심히 살아왔다는 증거입니다.
눈을 감고, 오늘 수고한 자신에게 "고마워"라고 말해 보세요.
내일의 나를 위해, 지금 이 순간 쉬어도 괜찮습니다.`,
    },
  };

  const CUSTOM_FALLBACK = `당신이 느끼는 감정은 자연스러운 반응입니다.
지금 이 순간, 깊은 호흡 세 번만 집중해 보세요.
당신은 이 상황을 헤쳐 나갈 충분한 힘을 가지고 있습니다.`;

  let typingTimer = null;

  function typeText(text, outputEl, cursorEl, speed = 35) {
    stopTyping();
    outputEl.textContent = '';
    cursorEl.classList.remove('is-hidden');

    let index = 0;

    function tick() {
      if (index < text.length) {
        outputEl.textContent += text[index];
        index++;
        typingTimer = setTimeout(tick, speed);
      } else {
        cursorEl.classList.add('is-hidden');
        typingTimer = null;
      }
    }

    tick();
  }

  function stopTyping() {
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
  }

  function getPresetScript(presetKey) {
    const preset = PRESET_SCRIPTS[presetKey];
    if (!preset) {
      return { script: CUSTOM_FALLBACK, isFree: false, label: '맞춤' };
    }
    return preset;
  }

  function generateCustomScript(userInput) {
    const input = userInput.trim().toLowerCase();

    if (!input) return CUSTOM_FALLBACK;

    if (input.includes('회의') || input.includes('발표') || input.includes('프레젠')) {
      return PRESET_SCRIPTS.meeting.script;
    }
    if (input.includes('상사') || input.includes('잔소리') || input.includes('지적')) {
      return PRESET_SCRIPTS.boss.script;
    }
    if (input.includes('출근') || input.includes('무기력') || input.includes('피곤')) {
      return PRESET_SCRIPTS.commute.script;
    }
    if (input.includes('야근') || input.includes('번아웃') || input.includes('퇴근')) {
      return PRESET_SCRIPTS.overtime.script;
    }

    return `「${userInput.trim()}」 — 그 상황이 당신을 힘들게 하고 있군요.
잠시 눈을 감고, 숨을 천천히 들이마시고 내쉬어 보세요.
지금 이 순간, 당신은 스스로를 돌볼 자격이 충분합니다.`;
  }

  OC.getPresetScript = getPresetScript;
  OC.generateCustomScript = generateCustomScript;
  OC.typeText = typeText;
  OC.stopTyping = stopTyping;
})(window.OfficeCalm = window.OfficeCalm || {});
