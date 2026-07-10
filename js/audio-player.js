/**
 * OfficeCalm AI — HTML5 Audio 기반 로컬 MP3 재생
 */
(function (OC) {
  const TRACKS = {
    'white-noise': {
      title: '사무실 백색소음',
      src: 'assets/audio/white-noise.mp3',
      levelRequired: 0,
      sessionScript: `[사무실 백색소음 · 5분]
키보드 소리와 잡음을 부드럽게 덮어, 집중과 휴식의 중간 지대를 만듭니다.

[세팅]
헤드폰 볼륨을 낮게 시작하고, 어깨를 내린 채 등받이에 기대세요.

[호흡]
들이쉬기 4초, 내쉬기 6초. 업무 생각이 떠오르면 다시 소리에만 귀 기울입니다.

[활용 팁]
짧은 회의 전, 점심 후 재정비, 오후 집중력이 떨어질 때 특히 효과적입니다.`,
    },
    'desk-stretch': {
      title: '책상 앞 스트레칭',
      src: 'assets/audio/desk-stretch.mp3',
      levelRequired: 0,
      sessionScript: `[책상 앞 스트레칭 · 3분]
굳은 목·어깨를 풀며, 몸의 긴장이 마음의 긴장도 함께 내려갑니다.

[1] 목 좌우 천천히 3회
[2] 어깨 으쓱 → 내리기 5회
[3] 손목·손가락 쭉 펴고 10초 유지

차임 소리마다 한 동작씩, 통증이 느껴지면 범위를 줄이세요.
몸이 가벼워지면 다음 업무가 덜 버겁게 느껴집니다.`,
    },
    'deep-sleep': {
      title: '야근 후 딥슬립',
      src: 'assets/audio/deep-sleep.mp3',
      levelRequired: 3,
      sessionScript: `[야근 후 딥슬립 · 20분]
하루의 긴장을 내려놓고, 수면 전 신경계를 안정시키는 딥 릴렉스 세션입니다.

[준비]
조명을 낮추고, 모니터를 멀리하세요. 오늘의 할 일 목록은 잠시 닫습니다.

[호흡]
배로 길게 들이쉬고, 입으로 더 길게 내쉬기. "오늘은 여기까지"라고 마음속으로 선언합니다.

[이미지]
따뜻한 어둠 속에 몸이 가라앉는 느낌을 상상해 보세요.
잠들지 않아도 괜찮습니다. 쉬는 것만으로 회복이 시작됩니다.`,
    },
    'burnout-recovery': {
      title: '번아웃 회복 명상',
      src: 'assets/audio/burnout-recovery.mp3',
      levelRequired: 5,
      sessionScript: `[번아웃 회복 명상 · 15분]
지나친 책임감과 피로를 내려놓고, 자기 자비를 회복하는 심층 명상입니다.

[시작]
"나는 충분히 노력했다." 반복하며, 자책의 목소리를 작게 만듭니다.

[호흡]
4-2-6 호흡: 4초 들이쉬기, 2초 멈추기, 6초 내쉬기.
숨을 내쉴 때마다 무거운 감정이 아래로 흘러내리는 것을 상상합니다.

[마무리]
회복은 하루 만에 오지 않습니다. 오늘 이 15분이 내일의 나를 지켜줍니다.`,
    },
  };

  let audioEl = null;
  let currentTrackId = null;
  let isPlaying = false;
  let volume = 0.45;
  let musicEnabled = false;

  function isMusicEnabled() {
    return musicEnabled;
  }

  function setMusicEnabled(enabled) {
    musicEnabled = enabled;
    if (!enabled) stop();
    return musicEnabled;
  }

  function ensureAudio() {
    if (!audioEl) {
      audioEl = new Audio();
      audioEl.loop = true;
      audioEl.preload = 'auto';
      audioEl.volume = volume;

      audioEl.addEventListener('ended', () => {
        if (!audioEl.loop) isPlaying = false;
      });

      audioEl.addEventListener('error', () => {
        console.error('오디오 파일을 불러올 수 없습니다:', audioEl.src);
        isPlaying = false;
      });
    }
    return audioEl;
  }

  function getTrackTitle(trackId) {
    return TRACKS[trackId]?.title ?? '알 수 없는 트랙';
  }

  function getSessionScript(trackId) {
    return TRACKS[trackId]?.sessionScript ?? '';
  }

  function getLevelRequired(trackId) {
    return TRACKS[trackId]?.levelRequired ?? 0;
  }

  async function playTrack(trackId) {
    if (!TRACKS[trackId]) return false;
    if (!musicEnabled) return false;

    const audio = ensureAudio();

    if (currentTrackId === trackId && isPlaying) {
      audio.pause();
      isPlaying = false;
      return false;
    }

    if (currentTrackId === trackId && !isPlaying) {
      await audio.play();
      isPlaying = true;
      return true;
    }

    stop();

    currentTrackId = trackId;
    audio.src = TRACKS[trackId].src;
    audio.currentTime = 0;
    audio.volume = volume;

    try {
      await audio.play();
      isPlaying = true;
      return true;
    } catch (err) {
      console.error('재생 실패:', err);
      isPlaying = false;
      currentTrackId = null;
      return false;
    }
  }

  function pause() {
    if (!audioEl || !isPlaying) return;
    audioEl.pause();
    isPlaying = false;
  }

  async function resume() {
    if (!currentTrackId || !audioEl) return;
    try {
      await audioEl.play();
      isPlaying = true;
    } catch (err) {
      console.error('재생 재개 실패:', err);
    }
  }

  function stop() {
    if (audioEl) {
      audioEl.pause();
      audioEl.currentTime = 0;
      audioEl.removeAttribute('src');
      audioEl.load();
    }
    currentTrackId = null;
    isPlaying = false;
  }

  function togglePlayback() {
    if (!currentTrackId) return false;
    if (isPlaying) {
      pause();
      return false;
    }
    resume();
    return true;
  }

  function setVolume(value) {
    volume = Math.max(0, Math.min(1, value));
    if (audioEl) audioEl.volume = volume;
  }

  function getPlaybackState() {
    return {
      trackId: currentTrackId,
      isPlaying,
      volume,
      title: currentTrackId ? getTrackTitle(currentTrackId) : null,
    };
  }

  function initAudioPlayerUI(onTrackChange) {
    const playerEl = document.getElementById('audioPlayer');
    const titleEl = document.getElementById('nowPlayingTitle');
    const playPauseBtn = document.getElementById('audioPlayPauseBtn');
    const stopBtn = document.getElementById('audioStopBtn');
    const volumeInput = document.getElementById('audioVolume');

    function updateUI() {
      const state = getPlaybackState();

      if (!state.trackId) {
        playerEl.hidden = true;
        document.querySelectorAll('.audio-item').forEach((el) => el.classList.remove('is-playing'));
        return;
      }

      playerEl.hidden = false;
      titleEl.textContent = state.title;
      playPauseBtn.textContent = state.isPlaying ? '⏸' : '▶';
      playPauseBtn.setAttribute('aria-label', state.isPlaying ? '일시정지' : '재생');

      document.querySelectorAll('.audio-item').forEach((el) => {
        const btn = el.querySelector('[data-audio]');
        el.classList.toggle('is-playing', btn?.dataset.audio === state.trackId && state.isPlaying);
      });
    }

    playPauseBtn.addEventListener('click', () => {
      togglePlayback();
      updateUI();
    });

    stopBtn.addEventListener('click', () => {
      stop();
      updateUI();
      if (onTrackChange) onTrackChange(null);
    });

    volumeInput.addEventListener('input', (e) => {
      setVolume(Number(e.target.value) / 100);
    });

    return {
      updateUI,
      async play(trackId) {
        if (!musicEnabled) return false;
        const started = await playTrack(trackId);
        updateUI();
        if (onTrackChange) onTrackChange(trackId, started);
        return started;
      },
    };
  }

  function initMusicToggle(audioUI) {
    const toggleBtn = document.getElementById('musicToggleBtn');
    if (!toggleBtn) return;

    function updateToggleUI() {
      toggleBtn.textContent = musicEnabled ? '🎵 음악 재생 ON' : '🎵 음악 재생 OFF';
      toggleBtn.setAttribute('aria-pressed', musicEnabled ? 'true' : 'false');
      toggleBtn.classList.toggle('is-on', musicEnabled);
    }

    toggleBtn.addEventListener('click', () => {
      setMusicEnabled(!musicEnabled);
      updateToggleUI();
      if (!musicEnabled) {
        stop();
        audioUI.updateUI();
      }
    });

    updateToggleUI();
  }

  OC.getTrackTitle = getTrackTitle;
  OC.getSessionScript = getSessionScript;
  OC.getLevelRequired = getLevelRequired;
  OC.isMusicEnabled = isMusicEnabled;
  OC.initAudioPlayerUI = initAudioPlayerUI;
  OC.initMusicToggle = initMusicToggle;
})(window.OfficeCalm = window.OfficeCalm || {});
