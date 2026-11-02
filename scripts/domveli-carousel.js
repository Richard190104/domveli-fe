
const initializedCarousels = new WeakMap();

export function createCarousel(
  viewport,
  {
    showArrows = false,
    autoplay = false,
    interval = 5000,
    loop = false,
    previousLabel = 'Predchádzajúca položka',
    nextLabel = 'Nasledujúca položka',
    onChange = () => {}
  } = {}
) {
  if (!(viewport instanceof HTMLElement)) {
    return null;
  }

  if (initializedCarousels.has(viewport)) {
    return initializedCarousels.get(viewport);
  }

  const slides = Array.from(viewport.children);
  const count = slides.length;

  if (count < 2) return null;

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  let activeIndex = 0;
  let controls = null;
  let previous = null;
  let next = null;

  let autoplayTimer = null;
  let settleTimer = null;
  let resizeObserver = null;

  let isAnimating = false;
  let isDestroyed = false;
  let isHovered = false;
  let isFocused = false;
  let isInteracting = false;
  let interactionTimer = null;

  const clones = [];

  /* ----------------------------------------
     POMOCNÉ FUNKCIE
  ---------------------------------------- */

  function getItems() {
    return Array.from(viewport.children);
  }

  function getPosition(element) {
    return element.offsetLeft - viewport.offsetLeft;
  }

  function getMaxScroll() {
    return Math.max(
      0,
      viewport.scrollWidth - viewport.clientWidth
    );
  }

  function getNearestItem() {
    const items = getItems();
    const current = viewport.scrollLeft;

    let nearest = 0;
    let distance = Infinity;

    items.forEach((item, index) => {
      const difference = Math.abs(
        getPosition(item) - current
      );

      if (difference < distance) {
        distance = difference;
        nearest = index;
      }
    });

    return nearest;
  }

  function getRealIndex(index) {
    if (!loop) {
      return Math.max(0, Math.min(index, count - 1));
    }

    return ((index - 1) % count + count) % count;
  }

  function setScroll(left, smooth = true) {
    viewport.scrollTo({
      left,
      behavior:
        smooth && !reduceMotion.matches
          ? 'smooth'
          : 'instant'
    });
  }

  function jumpTo(left) {
    const oldBehavior = viewport.style.scrollBehavior;
    const oldSnap = viewport.style.scrollSnapType;

    viewport.style.scrollBehavior = 'auto';
    viewport.style.scrollSnapType = 'none';

    viewport.scrollLeft = left;

    requestAnimationFrame(() => {
      if (isDestroyed) return;

      viewport.style.scrollBehavior = oldBehavior;
      viewport.style.scrollSnapType = oldSnap;
    });
  }

  /* ----------------------------------------
     KLONY PRE NEKONEČNÉ POSÚVANIE
  ---------------------------------------- */

  if (loop) {
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[count - 1].cloneNode(true);

    firstClone.setAttribute('aria-hidden', 'true');
    lastClone.setAttribute('aria-hidden', 'true');

    firstClone.dataset.carouselClone = 'true';
    lastClone.dataset.carouselClone = 'true';

    // Klony nesmú obsahovať duplicitné ID.
    [firstClone, lastClone].forEach(clone => {
      if (clone.hasAttribute('id')) {
        clone.removeAttribute('id');
      }

      clone.querySelectorAll('[id]').forEach(element => {
        element.removeAttribute('id');
      });

      clone.setAttribute('inert', '');
    });

    viewport.insertBefore(lastClone, slides[0]);
    viewport.appendChild(firstClone);

    clones.push(lastClone, firstClone);
  }

  /* ----------------------------------------
     AKTÍVNA POLOŽKA
  ---------------------------------------- */

  function updateActiveIndex() {
    const nearest = getNearestItem();
    const newIndex = getRealIndex(nearest);

    if (newIndex !== activeIndex) {
      activeIndex = newIndex;
      onChange(activeIndex);
    }

    updateArrows();
  }

  /* ----------------------------------------
     NEKONEČNÉ POSÚVANIE
  ---------------------------------------- */

  function normalizeLoop() {
    if (!loop || isDestroyed) return;

    const items = getItems();
    const nearest = getNearestItem();

    if (nearest === 0) {
      jumpTo(getPosition(items[count]));
    } else if (nearest === count + 1) {
      jumpTo(getPosition(items[1]));
    }
  }

  /* ----------------------------------------
     ŠÍPKY
  ---------------------------------------- */

  function updateArrows() {
    if (!previous || !next) return;

    if (loop) {
      previous.disabled = false;
      next.disabled = false;
      return;
    }

    previous.disabled = viewport.scrollLeft <= 2;

    next.disabled =
      viewport.scrollLeft >= getMaxScroll() - 2;
  }

  /* ----------------------------------------
     POSÚVANIE
  ---------------------------------------- */

  function move(direction) {
    if (isDestroyed || isAnimating) return;

    const items = getItems();
    const nearest = getNearestItem();

    let targetIndex = nearest + direction;

    if (loop) {
      targetIndex = Math.max(
        0,
        Math.min(targetIndex, items.length - 1)
      );
    } else {
      targetIndex = Math.max(
        0,
        Math.min(targetIndex, count - 1)
      );
    }

    const target = getPosition(items[targetIndex]);

    if (Math.abs(viewport.scrollLeft - target) < 2) {
      return;
    }

    isAnimating = true;

    setScroll(target);

    window.clearTimeout(settleTimer);

    settleTimer = window.setTimeout(() => {
      isAnimating = false;
      normalizeLoop();
      updateActiveIndex();
    }, reduceMotion.matches ? 40 : 450);
  }

  /* ----------------------------------------
     SCROLL EVENT
  ---------------------------------------- */

  function handleScroll() {
    if (isDestroyed) return;

    updateActiveIndex();

    window.clearTimeout(settleTimer);

    settleTimer = window.setTimeout(() => {
      normalizeLoop();
      updateActiveIndex();
      isAnimating = false;
    }, 160);
  }

  viewport.addEventListener(
    'scroll',
    handleScroll,
    { passive: true }
  );

  /* ----------------------------------------
     NAVIGAČNÉ TLAČIDLÁ
  ---------------------------------------- */

  if (showArrows) {
    controls = document.createElement('div');
    controls.className = 'dv-carousel-controls';

    previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'dv-carousel-arrow';
    previous.textContent = '←';
    previous.setAttribute(
      'aria-label',
      previousLabel
    );

    next = document.createElement('button');
    next.type = 'button';
    next.className = 'dv-carousel-arrow';
    next.textContent = '→';
    next.setAttribute(
      'aria-label',
      nextLabel
    );

    previous.addEventListener('click', handlePrevious);
    next.addEventListener('click', handleNext);

    controls.append(previous, next);

    viewport.insertAdjacentElement(
      'afterend',
      controls
    );
  }

  function handlePrevious() {
    pauseAfterInteraction();
    move(-1);
  }

  function handleNext() {
    pauseAfterInteraction();
    move(1);
  }

  /* ----------------------------------------
     AUTOPLAY
  ---------------------------------------- */

  function canAutoplay() {
    return (
      autoplay &&
      !isDestroyed &&
      !document.hidden &&
      !isHovered &&
      !isFocused &&
      !isInteracting &&
      !reduceMotion.matches
    );
  }

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();

    if (!canAutoplay()) return;

    autoplayTimer = window.setInterval(() => {
      if (!canAutoplay()) return;

      if (!loop && viewport.scrollLeft >= getMaxScroll() - 2) {
        jumpTo(0);
        activeIndex = 0;
        onChange(activeIndex);
        return;
      }

      move(1);
    }, Math.max(1000, interval));
  }

  function pauseAfterInteraction() {
    isInteracting = true;
    stopAutoplay();

    window.clearTimeout(interactionTimer);

    interactionTimer = window.setTimeout(() => {
      isInteracting = false;
      startAutoplay();
    }, 5000);
  }

  function handleMouseEnter() {
    isHovered = true;
    stopAutoplay();
  }

  function handleMouseLeave() {
    isHovered = false;
    startAutoplay();
  }

  function handleFocusIn() {
    isFocused = true;
    stopAutoplay();
  }

  function handleFocusOut(event) {
    if (
      event.relatedTarget &&
      viewport.parentElement?.contains(event.relatedTarget)
    ) {
      return;
    }

    isFocused = false;
    startAutoplay();
  }

  function handlePointerDown() {
    pauseAfterInteraction();
  }

  function handleVisibilityChange() {
    startAutoplay();
  }

  viewport.addEventListener('mouseenter', handleMouseEnter);
  viewport.addEventListener('mouseleave', handleMouseLeave);
  viewport.addEventListener('pointerdown', handlePointerDown);

  const focusContainer = controls
    ? viewport.parentElement
    : viewport;

  focusContainer.addEventListener('focusin', handleFocusIn);
  focusContainer.addEventListener('focusout', handleFocusOut);

  document.addEventListener(
    'visibilitychange',
    handleVisibilityChange
  );

  /* ----------------------------------------
     RESPONZÍVNE ROZLOŽENIE
  ---------------------------------------- */

  function handleResize() {
    if (isDestroyed) return;

    const items = getItems();
    const index = loop ? activeIndex + 1 : activeIndex;

    jumpTo(getPosition(items[index]));
    updateArrows();
  }

  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(viewport);
  } else {
    window.addEventListener('resize', handleResize);
  }

  /* ----------------------------------------
     INICIALIZÁCIA
  ---------------------------------------- */

  if (loop) {
    requestAnimationFrame(() => {
      if (isDestroyed) return;
      jumpTo(getPosition(getItems()[1]));
    });
  }

  updateArrows();
  startAutoplay();

  

  /* ----------------------------------------
     ZRUŠENIE CAROUSELU
  ---------------------------------------- */

  function destroy() {
    if (isDestroyed) return;

    isDestroyed = true;

    stopAutoplay();

    window.clearTimeout(settleTimer);
    window.clearTimeout(interactionTimer);

    viewport.removeEventListener('scroll', handleScroll);
    viewport.removeEventListener('mouseenter', handleMouseEnter);
    viewport.removeEventListener('mouseleave', handleMouseLeave);
    viewport.removeEventListener('pointerdown', handlePointerDown);

    focusContainer.removeEventListener('focusin', handleFocusIn);
    focusContainer.removeEventListener('focusout', handleFocusOut);

    document.removeEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    window.removeEventListener('resize', handleResize);

    if (resizeObserver) {
      resizeObserver.disconnect();
    }

    if (previous) {
      previous.removeEventListener('click', handlePrevious);
    }

    if (next) {
      next.removeEventListener('click', handleNext);
    }

    if (controls) {
      controls.remove();
    }

    clones.forEach(clone => clone.remove());

    initializedCarousels.delete(viewport);
  }

  const instance = {
    move,
    destroy,
    get activeIndex() {
      return activeIndex;
    }
  };

  initializedCarousels.set(viewport, instance);

  return instance;
}


/* =====================================================
   DOMVELI – FADE CAROUSEL PRE REKLAMNÉ BANNERY
   ===================================================== */

const initializedFadeCarousels = new WeakMap();

export function createFadeCarousel(
  container,
  {
    slides = [],
    renderSlide,
    autoplay = true,
    interval = 10000,
    showArrows = true,
    showDots = true,
    previousLabel = 'Predchádzajúci banner',
    nextLabel = 'Nasledujúci banner',
    onChange = () => {}
  } = {}
) {
  if (!(container instanceof HTMLElement)) return null;

  if (initializedFadeCarousels.has(container)) {
    return initializedFadeCarousels.get(container);
  }

  if (!Array.isArray(slides) || slides.length < 2) {
    return null;
  }

  if (typeof renderSlide !== 'function') {
    console.warn('[DOMVELI] Chýba renderSlide funkcia.');
    return null;
  }

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  let currentIndex = 0;
  let autoplayTimer = null;
  let transitionTimer = null;
  let changing = false;
  let destroyed = false;
  let hovered = false;
  let focused = false;
  let touchStartX = null;

  const controls = document.createElement('div');
  controls.className = 'dv-fade-controls';

  const previous = document.createElement('button');
  previous.type = 'button';
  previous.className = 'dv-fade-arrow';
  previous.textContent = '←';
  previous.setAttribute('aria-label', previousLabel);

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'dv-fade-arrow';
  next.textContent = '→';
  next.setAttribute('aria-label', nextLabel);

  controls.append(previous, next);

  if (showArrows) {
    container.appendChild(controls);
  }

  const dots = document.createElement('div');
  dots.className = 'dv-fade-dots';

  const dotButtons = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dv-fade-dot';
    dot.setAttribute('aria-label', `Zobraziť banner ${index + 1}`);

    dot.addEventListener('click', () => {
      goTo(index);
      restartAutoplay();
    });

    dots.appendChild(dot);
    return dot;
  });

  if (showDots) {
    container.appendChild(dots);
  }

  function updateDots() {
    dotButtons.forEach((dot, index) => {
      const active = index === currentIndex;

      dot.classList.toggle('is-active', active);

      if (active) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
  }

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function canAutoplay() {
    return (
      autoplay &&
      !destroyed &&
      !document.hidden &&
      !hovered &&
      !focused &&
      !reducedMotion.matches
    );
  }

  function startAutoplay() {
    stopAutoplay();

    if (!canAutoplay()) return;

    autoplayTimer = setInterval(() => {
      goTo(currentIndex + 1);
    }, Math.max(1000, interval));
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function goTo(index) {
    if (destroyed || changing) return;

    const nextIndex =
      ((index % slides.length) + slides.length) %
      slides.length;

    if (nextIndex === currentIndex) return;

    changing = true;

    const duration = reducedMotion.matches ? 0 : 220;

    container.classList.add('dv-fade-changing');

    clearTimeout(transitionTimer);

    transitionTimer = setTimeout(() => {
      if (destroyed) return;

      currentIndex = nextIndex;

      renderSlide(slides[currentIndex], currentIndex);
      updateDots();
      onChange(currentIndex);

      container.classList.remove('dv-fade-changing');

      changing = false;
    }, duration);
  }

  function move(direction) {
    goTo(currentIndex + direction);
  }

  function handlePrevious() {
    move(-1);
    restartAutoplay();
  }

  function handleNext() {
    move(1);
    restartAutoplay();
  }

  function handleMouseEnter() {
    hovered = true;
    stopAutoplay();
  }

  function handleMouseLeave() {
    hovered = false;
    startAutoplay();
  }

  function handleFocusIn() {
    focused = true;
    stopAutoplay();
  }

  function handleFocusOut(event) {
    if (container.contains(event.relatedTarget)) return;

    focused = false;
    startAutoplay();
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  }

  function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
    stopAutoplay();
  }

  function handleTouchEnd(event) {
    if (touchStartX === null) return;

    const distance =
      event.changedTouches[0].screenX - touchStartX;

    touchStartX = null;

    if (Math.abs(distance) > 50) {
      move(distance < 0 ? 1 : -1);
    }

    startAutoplay();
  }

  previous.addEventListener('click', handlePrevious);
  next.addEventListener('click', handleNext);

  container.addEventListener('mouseenter', handleMouseEnter);
  container.addEventListener('mouseleave', handleMouseLeave);
  container.addEventListener('focusin', handleFocusIn);
  container.addEventListener('focusout', handleFocusOut);
  container.addEventListener('touchstart', handleTouchStart, {
    passive: true
  });
  container.addEventListener('touchend', handleTouchEnd, {
    passive: true
  });

  document.addEventListener(
    'visibilitychange',
    handleVisibilityChange
  );

  // Inicializácia prvého obrázka a textov.
  renderSlide(slides[0], 0);
  updateDots();
  startAutoplay();

  function destroy() {
    if (destroyed) return;

    destroyed = true;

    stopAutoplay();
    clearTimeout(transitionTimer);

    previous.removeEventListener('click', handlePrevious);
    next.removeEventListener('click', handleNext);

    container.removeEventListener('mouseenter', handleMouseEnter);
    container.removeEventListener('mouseleave', handleMouseLeave);
    container.removeEventListener('focusin', handleFocusIn);
    container.removeEventListener('focusout', handleFocusOut);
    container.removeEventListener('touchstart', handleTouchStart);
    container.removeEventListener('touchend', handleTouchEnd);

    document.removeEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    controls.remove();
    dots.remove();

    container.classList.remove('dv-fade-changing');

    initializedFadeCarousels.delete(container);
  }

  const instance = {
    goTo,
    move,
    destroy,
    get activeIndex() {
      return currentIndex;
    }
  };

  initializedFadeCarousels.set(container, instance);

  return instance;
}

