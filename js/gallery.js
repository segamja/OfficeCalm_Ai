/**
 * OfficeCalm AI — 콘텐츠 라이브러리 힐링 이미지 갤러리
 */
(function (OC) {
  const GALLERY_IMAGES = [
    'assets/images/claudio-testa--SO3JtE3gZo-unsplash.jpg',
    'assets/images/goutham-krishna-h5wvMCdOV3w-unsplash.jpg',
    'assets/images/johannes-andersson-UCd78vfC8vU-unsplash.jpg',
    'assets/images/johnson-martin-zpq2DMidOY0-unsplash.jpg',
    'assets/images/masaaki-komori-6EfKUoRTe8I-unsplash.jpg',
    'assets/images/studio-dekorasyon-vngzm4P2BTs-unsplash.jpg',
  ];

  const ROTATE_MS = 8000;
  const FADE_MS = 500;

  let currentIndex = -1;
  let rotateTimer = null;
  let isRotating = false;

  function pickRandomIndex() {
    if (GALLERY_IMAGES.length === 0) return -1;
    if (GALLERY_IMAGES.length === 1) return 0;

    let next;
    do {
      next = Math.floor(Math.random() * GALLERY_IMAGES.length);
    } while (next === currentIndex);

    return next;
  }

  function setImage(imgEl, src) {
    return new Promise((resolve) => {
      const onDone = () => {
        imgEl.removeEventListener('load', onDone);
        imgEl.removeEventListener('error', onDone);
        resolve();
      };

      imgEl.addEventListener('load', onDone);
      imgEl.addEventListener('error', onDone);
      imgEl.src = src;

      if (imgEl.complete) onDone();
    });
  }

  async function showNextImage(imgEl) {
    if (isRotating) return;
    isRotating = true;

    const nextIndex = pickRandomIndex();
    if (nextIndex < 0) {
      isRotating = false;
      return;
    }

    currentIndex = nextIndex;
    imgEl.classList.add('is-fading');

    await new Promise((r) => setTimeout(r, FADE_MS));
    await setImage(imgEl, GALLERY_IMAGES[currentIndex]);
    imgEl.classList.remove('is-fading');
    isRotating = false;
  }

  function initGallery() {
    const gallery = document.getElementById('libraryGallery');
    const imgEl = document.getElementById('libraryGalleryImg');

    if (!gallery || !imgEl || GALLERY_IMAGES.length === 0) {
      if (gallery) gallery.hidden = true;
      return;
    }

    showNextImage(imgEl);
    rotateTimer = setInterval(() => showNextImage(imgEl), ROTATE_MS);
  }

  OC.initGallery = initGallery;
})(window.OfficeCalm = window.OfficeCalm || {});
