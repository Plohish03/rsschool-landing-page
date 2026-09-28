document.addEventListener('DOMContentLoaded', function () {
  var themeSwitcher = document.getElementById('theme-switcher');

  if (!themeSwitcher) return;

  themeSwitcher.addEventListener('click', function () {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
});
