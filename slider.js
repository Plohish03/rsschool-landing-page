(function () {
  var slider = document.querySelector('.slider');
  if (!slider) return;

  var track = slider.querySelector('.slider__items');
  var slides = slider.querySelectorAll('.slider__item');
  var controls = slider.querySelectorAll('.slider-pagination__control');
  var prevBtn = slider.querySelector('.slider-buttons__btn--left');
  var nextBtn = slider.querySelector('.slider-buttons__btn--right');
  var total = slides.length;
  if (total < 2) return;

  var current = 0;

  function show(index) {
    current = (index + total) % total;
    track.style.transform = 'translateX(' + (-current * 100) + '%)';
    controls.forEach(function (c, i) {
      c.classList.toggle('active', i === current);
    });
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  controls.forEach(function (c, i) {
    c.addEventListener('animationend', next);
    c.addEventListener('click', function () { show(i); });
  });

  function pause() {
    controls.forEach(function (c) { c.classList.add('paused'); });
  }
  function resume() {
    controls.forEach(function (c) { c.classList.remove('paused'); });
  }
  slider.addEventListener('mouseenter', pause);
  slider.addEventListener('mouseleave', resume);

  var startX = 0, startY = 0, swiping = false;

  slider.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    swiping = true;
    pause();
  }, { passive: true });

  slider.addEventListener('touchend', function (e) {
    if (swiping) {
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next(); else prev();
      }
    }
    swiping = false;
    resume();
  });

  slider.addEventListener('touchcancel', function () {
    swiping = false;
    resume();
  });

  show(0);
})();
