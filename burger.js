(function () {
  var burger = document.getElementById('burger');
  var nav = document.getElementById('header-nav');
  var header = document.querySelector('.header');
  if (!burger || !nav || !header) return;

  var desktop = window.matchMedia('(min-width: 769px)');

  function isOpen() {
    return burger.classList.contains('open');
  }

  function setOpen(open) {
    burger.classList.toggle('open', open);
    nav.classList.toggle('open', open);
    header.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  burger.addEventListener('click', function () {
    setOpen(!isOpen());
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) setOpen(false);
  });

  desktop.addEventListener('change', function (e) {
    if (e.matches && isOpen()) setOpen(false);
  });
})();
