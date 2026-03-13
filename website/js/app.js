'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     THEME TOGGLE
     ============================================================ */
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  const savedTheme = localStorage.getItem('rhcsa-theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('rhcsa-theme', next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(t) {
    themeToggle.innerHTML = t === 'dark'
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }

  /* ============================================================
     SIDEBAR TOGGLE
     ============================================================ */
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const sidebarToggle = document.getElementById('sidebarToggle');

  sidebarToggle.addEventListener('click', () => {
    if (window.innerWidth <= 900) {
      sidebar.classList.toggle('mobile-open');
    } else {
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded');
    }
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900 &&
        !sidebar.contains(e.target) &&
        !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  });

  /* ============================================================
     HIGHLIGHT.JS
     ============================================================ */
  document.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block);
  });

  /* ============================================================
     COPY BUTTONS
     ============================================================ */
  document.querySelectorAll('pre').forEach(pre => {
    const wrapper = document.createElement('div');
    wrapper.className = 'pre-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
    wrapper.appendChild(btn);

    btn.addEventListener('click', () => {
      const code = pre.querySelector('code');
      const text = (code ? code.innerText : pre.innerText).trimEnd();
      navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });

  /* ============================================================
     PROGRESS TRACKING
     ============================================================ */
  const CHAPS = ['ch1','ch2','ch3','ch4','ch6','ch7','ch8','ch9',
                 'ch10','ch11','ch11b','ch12','ch15','networking','nfs','podman','tools'];
  let progress = JSON.parse(localStorage.getItem('rhcsa-progress') || '{}');

  function renderProgress() {
    const done  = CHAPS.filter(c => progress[c]).length;
    const total = CHAPS.length;
    const pct   = Math.round((done / total) * 100);

    const pt = document.getElementById('progressText');
    const pp = document.getElementById('progressPct');
    const pf = document.getElementById('overallProgress');
    if (pt) pt.textContent = `${done} / ${total} complete`;
    if (pp) pp.textContent = `${pct}%`;
    if (pf) pf.style.width = `${pct}%`;

    CHAPS.forEach(chap => {
      document.querySelectorAll(`.chapter-done-dot[data-chap="${chap}"]`)
        .forEach(dot => dot.classList.toggle('done', !!progress[chap]));

      document.querySelectorAll(`.complete-btn[data-chap="${chap}"]`)
        .forEach(btn => {
          btn.classList.toggle('checked', !!progress[chap]);
          btn.innerHTML = progress[chap]
            ? '<i class="fas fa-check-circle"></i> Completed'
            : '<i class="far fa-circle"></i> Mark Complete';
        });
    });
  }

  document.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const chap = btn.dataset.chap;
      progress[chap] = !progress[chap];
      localStorage.setItem('rhcsa-progress', JSON.stringify(progress));
      renderProgress();
    });
  });

  renderProgress();

  /* ============================================================
     SCROLL SPY
     ============================================================ */
  const sections  = document.querySelectorAll('section[id]');
  const navItems  = document.querySelectorAll('.nav-item');

  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navItems.forEach(item => item.classList.toggle('active', item.dataset.section === id));
      }
    });
  }, { rootMargin: '-15% 0px -72% 0px' });

  sections.forEach(s => spy.observe(s));

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  const btt = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 350);
  });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ============================================================
     SEARCH
     ============================================================ */
  const searchInput   = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchWrap    = document.getElementById('searchWrap');

  // Build index
  const index = [];
  const seen  = new Set();

  document.querySelectorAll('section[id]').forEach(sec => {
    const secId    = sec.id;
    const secTitle = sec.querySelector('h2')?.textContent?.trim() || secId;

    const collect = (selector, type) => {
      sec.querySelectorAll(selector).forEach(el => {
        const t = el.textContent.trim();
        if (t.length > 1 && t.length < 120 && !seen.has(t)) {
          seen.add(t);
          index.push({ text: t, type, secId, secTitle });
        }
      });
    };

    collect('h3', 'heading');
    collect('.cmd-name', 'command');
    collect('td:first-child', 'table-item');
    collect('h2', 'section-title');
  });

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length < 2) { searchResults.classList.remove('active'); return; }

    const hits = index.filter(i => i.text.toLowerCase().includes(q)).slice(0, 10);

    if (!hits.length) {
      searchResults.innerHTML = '<div class="sr-empty"><i class="fas fa-search"></i> No results found</div>';
    } else {
      searchResults.innerHTML = hits.map(h => `
        <div class="sr-item" data-sec="${h.secId}">
          <div class="sr-text">${hl(h.text, q)}</div>
          <div class="sr-section"><i class="fas fa-layer-group"></i> ${h.secTitle}</div>
        </div>`).join('');

      searchResults.querySelectorAll('.sr-item').forEach(item => {
        item.addEventListener('click', () => {
          document.getElementById(item.dataset.sec)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          searchResults.classList.remove('active');
          searchInput.value = '';
        });
      });
    }
    searchResults.classList.add('active');
  });

  function hl(text, q) {
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  document.addEventListener('click', e => {
    if (!e.target.closest('#searchWrap') && !e.target.closest('#searchInput')) {
      searchResults.classList.remove('active');
    }
  });

  /* ============================================================
     KEYBOARD SHORTCUTS
     ============================================================ */
  const shortcutsModal = document.getElementById('shortcutsModal');

  document.addEventListener('keydown', e => {
    const active = document.activeElement;
    const typing = ['INPUT','TEXTAREA','SELECT'].includes(active.tagName);

    if (e.key === '/' && !typing) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (e.key === 'Escape') {
      searchInput.blur();
      searchInput.value = '';
      searchResults.classList.remove('active');
      shortcutsModal.classList.remove('active');
    }
    if (e.key === '?' && !typing) {
      shortcutsModal.classList.toggle('active');
    }
    if (e.key === 'b' && e.altKey) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  document.getElementById('shortcutsBtn').addEventListener('click', () => {
    shortcutsModal.classList.toggle('active');
  });
  shortcutsModal.addEventListener('click', e => {
    if (e.target === shortcutsModal) shortcutsModal.classList.remove('active');
  });
  document.querySelector('.modal-close')?.addEventListener('click', () => {
    shortcutsModal.classList.remove('active');
  });

  /* ============================================================
     COUNTER ANIMATION
     ============================================================ */
  const counters = document.querySelectorAll('.stat-num[data-count]');

  const cObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      let cur = 0;
      const inc = target / 55;
      const t = setInterval(() => {
        cur += inc;
        if (cur >= target) {
          el.textContent = target + '+';
          clearInterval(t);
        } else {
          el.textContent = Math.floor(cur);
        }
      }, 18);
      cObs.unobserve(el);
    });
  }, { threshold: .4 });

  counters.forEach(c => cObs.observe(c));

  /* ============================================================
     CHAPTER CARDS → smooth scroll
     ============================================================ */
  document.querySelectorAll('.chapter-card[data-target]').forEach(card => {
    card.addEventListener('click', () => {
      const t = document.getElementById(card.dataset.target);
      t?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ============================================================
     CLOSE SIDEBAR WHEN NAV LINK CLICKED (mobile)
     ============================================================ */
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        sidebar.classList.remove('mobile-open');
      }
    });
  });

});
