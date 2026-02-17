(function() {
  var $html = document.documentElement;
  var $themeToggle = document.getElementById('theme-toggle');
  var $logo = document.querySelector('.site-logo img');

  function applyTheme() {
    var palette = localStorage.getItem('palette') || 'auto';
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var shouldUseDark = palette === 'dark' || (palette === 'auto' && prefersDark);
    
    $html.setAttribute('data-palette', palette);
    
    if ($themeToggle) {
      var titles = { auto: 'Switch to light mode', light: 'Switch to dark mode', dark: 'Switch to system preference' };
      $themeToggle.setAttribute('title', titles[palette]);
    }
    
    if ($logo) {
      $logo.src = shouldUseDark ? '/assets/images/edgecloud-dark.png' : '/assets/images/edgecloud.png';
    }
    
    var link = document.getElementById('dark-theme-style');
    
    if (shouldUseDark) {
      $html.classList.add('dark');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = 'dark-theme-style';
        link.href = '/assets/css/dark.css';
        document.head.appendChild(link);
      }
    } else {
      $html.classList.remove('dark');
      if (link) {
        link.disabled = true;
        setTimeout(function() {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
        }, 0);
      }
    }
  }

  if ($themeToggle) {
    $themeToggle.addEventListener('click', function() {
      var palette = localStorage.getItem('palette') || 'auto';
      var newPalette = palette === 'auto' ? 'light' : (palette === 'light' ? 'dark' : 'auto');
      localStorage.setItem('palette', newPalette);
      applyTheme();
    });
  }

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
      if ((localStorage.getItem('palette') || 'auto') === 'auto') {
        applyTheme();
      }
    });
  }

  applyTheme();
})();