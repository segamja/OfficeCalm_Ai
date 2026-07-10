/**
 * OfficeCalm AI — 가상 AI 스크립트 프리셋 및 타이핑 효과
 */
(function (OC) {
  const PRESET_SCRIPTS = {
    meeting: {
      label: '회의 5분 전',
      script: `[회의 5분 전 · 긴장 완화 코칭]

① 몸 세팅 (30초)
눈을 감고 어깨·턱·손의 힘을 동시에 풀어 주세요.
코로 4초 들이쉬고, 입으로 6초 내쉬기. 긴장은 경고등이지, 실패 예고가 아닙니다.

② 마음 챙김 (1분)
"나는 준비해 왔고, 지금 필요한 것만 말하면 된다."
완벽한 답이 아니라, 명확한 한 걸음이면 충분합니다.
회의실 문 앞에서 한 번 더: "나는 이 자리에 올 자격이 있다."

③ 입장 직전 앵커 (30초)
첫 문장을 미리 정해 두세요.
"오늘 논의할 핵심은 ○○입니다."
차분한 목소리로 시작하면, 나머지는 따라옵니다.

[오늘의 한 줄]
긴장은 집중의 에너지입니다. 숨을 길게 내쉬며 그 에너지를 차분함으로 바꿔 보세요.`,
    },
    boss: {
      label: '상사 잔소리 직후',
      script: `[상사 잔소리 직후 · 감정 회복 코칭]

① 감정 분리 (1분)
상사의 말과 나의 가치는 별개입니다.
지금 뜨거운 감정은 90초 안에 온도가 내려갑니다. 서두르지 않아도 됩니다.

② 3-3-3 호흡 (1분)
3초 들이쉬기 → 3초 멈추기 → 3초 내쉬기. 세 번 반복하며 턱과 손의 힘을 풀어 주세요.
숨을 내쉴 때마다 "이건 나에 대한 평가가 아니다"라고 떠올려 보세요.

③ 다음 행동 (1분)
"지금은 감정을 처리하는 시간, 일을 처리하는 시간이 아닙니다."
① 물 한 잔 ② 30초 창밖 보기 ③ 필요한 일 딱 하나만 고르기.
자책 대신 회복을 선택하는 것이 내일의 나를 지켜줍니다.

[오늘의 한 줄]
비판은 피드백일 수 있지만, 나의 전부를 정의하지는 않습니다.`,
    },
    commute: {
      label: '출근길 무기력',
      script: `[출근길 무기력 · 에너지 리셋 코칭]

① 몸부터 깨우기 (1분)
발바닥이 바닥에 닿는 느낌에 집중해 보세요.
한 걸음마다 "지금 여기"에 있다는 것을 확인합니다.
무거운 몸도 이미 출근 중입니다. 그것만으로 충분합니다.

② 에너지 리셋 (1분)
"오늘은 80%만 해도 된다."
완벽한 하루가 아니라, 회복 가능한 하루를 목표로 합니다.
어제의 피로를 오늘의 죄책감으로 바꾸지 마세요.

③ 작은 의미 부여 (1분)
출근길에 한 가지 기대를 정하세요.
따뜻한 커피, 점심 후 5분 산책, 퇴근 후 좋아하는 음악처럼 작은 보상을 예약해 두세요.
하루의 시작을 스스로에게 선물하는 시간입니다.

[오늘의 한 줄]
무기력은 멈춤이 아니라, 몸이 쉬어가라는 신호일 수 있습니다.`,
    },
    overtime: {
      label: '야근 번아웃',
      script: `[야근 번아웃 · 긴급 회복 코칭]

① 번아웃 인정 (1분)
지금의 피로는 약함이 아니라, 오래 버텨온 흔적입니다.
먼저 자신에게 "고생했다"고 말해 주세요.
쉬고 싶다는 마음은 정당합니다.

② 긴급 회복 루틴 (2분)
모니터에서 눈을 떼고, 목을 천천히 좌우로 돌립니다.
4초 들이쉬고 8초 내쉬기를 5회 — 교감신경을 진정시키는 가장 빠른 방법입니다.
어깨를 앞으로 말았다가 뒤로 펴고, 손목을 돌려 주세요.

③ 경계 설정 (1분)
"지금 이 시간 이후의 나를 위해, 5분만 쉰다."
야근은 끝이 없습니다. 오늘의 끝은 당신이 정할 수 있습니다.
오늘 할 수 있는 최선과, 오늘 지켜야 할 나의 한계는 다릅니다.

[오늘의 한 줄]
회복하지 않고 달리면, 내일의 나에게 빚을 지는 것과 같습니다.`,
    },
  };

  const CUSTOM_FALLBACK = `[지금 이 순간]
당신이 느끼는 감정은 자연스러운 반응입니다. 판단하지 말고 호흡부터 시작해 보세요.

[3회 심호흡]
어깨를 올렸다가 내리며, 배로 숨을 채우고 천천히 내뱉습니다.
숨이 길어질수록 생각의 속도는 느려집니다.

[한 문장 위로]
"나는 이 상황을 헤쳐 나갈 자원을 이미 가지고 있다."
지금 필요한 것은 완벽함이 아니라, 5분의 회복입니다.`;

  let typingTimer = null;

  function typeText(text, outputEl, cursorEl, speed = 28) {
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
      return { script: CUSTOM_FALLBACK, label: '맞춤' };
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

    return `[상황 인식]
「${userInput.trim()}」 — 이 상황이 당신을 많이 지치게 하고 있군요.
감정을 억누르지 않아도 됩니다. 먼저 인정하는 것부터 시작합니다.

[호흡으로 멈추기]
4초 들이쉬고 6초 내쉬기. 생각이 많아질수록 호흡은 더 단순하게.
어깨를 내리고, 손에 힘이 들어가 있지 않은지 확인해 보세요.

[다음 한 걸음]
지금 당장 통제 가능한 것 하나만 고르세요.
물 한 잔, 자리에서 일어나기, 메시지 잠시 미루기처럼 작은 것도 충분합니다.

[마음 챙김]
당신은 이걸 견뎌온 사람입니다.
5분만 회복하고 다시 시작해도 괜찮습니다. 오늘의 나는 충분히 노력했습니다.`;
  }

  OC.getPresetScript = getPresetScript;
  OC.generateCustomScript = generateCustomScript;
  OC.typeText = typeText;
  OC.stopTyping = stopTyping;
})(window.OfficeCalm = window.OfficeCalm || {});
