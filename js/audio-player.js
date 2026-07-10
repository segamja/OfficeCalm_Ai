/**
 * OfficeCalm AI — HTML5 Audio 기반 로컬 MP3 재생
 */
(function (OC) {
  const TRACKS = {
    'white-noise': {
      title: '사무실 백색소음',
      src: 'assets/audio/white-noise.mp3',
    },
    'desk-stretch': {
      title: '책상 앞 스트레칭',
      src: 'assets/audio/desk-stretch.mp3',
    },
    'deep-sleep': {
      title: '야근 후 딥슬립',
      src: 'assets/audio/deep-sleep.mp3',
    },
    'burnout-recovery': {
      title: '번아웃 회복 명상',
      src: 'assets/audio/burnout-recovery.mp3',
    },
  };

  let audioEl = null;
  let currentTrackId = null;
  let isPlaying = false;
  let volume = 0.45;

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

  async function playTrack(trackId) {
    if (!TRACKS[trackId]) return false;

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
        const started = await playTrack(trackId);
        updateUI();
        if (onTrackChange) onTrackChange(trackId, started);
        return started;
      },
    };
  }

  OC.getTrackTitle = getTrackTitle;
  OC.initAudioPlayerUI = initAudioPlayerUI;
})(window.OfficeCalm = window.OfficeCalm || {});
