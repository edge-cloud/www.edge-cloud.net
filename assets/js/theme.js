(function() {
  var $html = document.documentElement;
  var $themeToggle = document.getElementById('theme-toggle');

  function applyTheme() {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      $html.classList.add('dark');
      if (!document.getElementById('dark-theme-style')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = 'dark-theme-style';
        link.href = '/assets/css/dark.css';
        document.head.appendChild(link);
      }
    } else if (theme === 'light') {
      $html.classList.remove('dark');
      var link = document.getElementById('dark-theme-style');
      if (link) {
        link.remove();
      }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      $html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      if (!document.getElementById('dark-theme-style')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = 'dark-theme-style';
        link.href = '/assets/css/dark.css';
        document.head.appendChild(link);
      }
    }
  }

  if ($themeToggle) {
    $themeToggle.addEventListener('click', function() {
      $html.classList.toggle('dark');
      var theme = $html.classList.contains('dark') ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
      applyTheme();
    });
  }

  applyTheme();
})();