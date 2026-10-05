(() => {
  const lightbox = document.querySelector('[data-lightbox]');
  if (!lightbox) return;
  const triggers = [...document.querySelectorAll('[data-gallery-open]')];
  const image = lightbox.querySelector('[data-lightbox-image]');
  const caption = lightbox.querySelector('[data-lightbox-caption]');
  const closeButton = lightbox.querySelector('[data-lightbox-close]');
  let current = 0;
  let previousFocus = null;

  const paint = () => {
    const trigger = triggers[current];
    image.src = trigger.dataset.fullSrc;
    image.alt = trigger.dataset.alt;
    caption.textContent = trigger.dataset.alt;
  };
  const open = index => {
    current = index;
    previousFocus = document.activeElement;
    paint();
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    closeButton.focus();
  };
  const close = () => {
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
    image.src = '';
    if (previousFocus) previousFocus.focus();
  };
  const move = direction => {
    current = (current + direction + triggers.length) % triggers.length;
    paint();
  };

  triggers.forEach((trigger, index) => trigger.addEventListener('click', () => open(index)));
  closeButton.addEventListener('click', close);
  lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', () => move(-1));
  lightbox.querySelector('[data-lightbox-next]').addEventListener('click', () => move(1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) close(); });
  document.addEventListener('keydown', event => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });
})();
