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
                 'ch10','ch11','ch11b','ch12','ch15','networking','nfs','podman','simulator','tools'];
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

    const ring = document.getElementById('simProgressRing');
    const ringText = document.getElementById('simProgressText');
    if (ring) ring.style.setProperty('--sim-pct', pct);
    if (ringText) ringText.textContent = `${pct}%`;

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
    if (e.key.toLowerCase() === 'x' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      shortcutsModal.classList.remove('active');
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

  /* ============================================================
     SECTION REVEAL ANIMATION
     ============================================================ */
  const revealEls = document.querySelectorAll('.section-head, .cb, .chapter-card');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => {
    el.classList.add('reveal');
    revealObs.observe(el);
  });

  /* ============================================================
     EXAM SIMULATOR
     ============================================================ */
  const TIMER_TOTAL_SECONDS = 2 * 60 * 60 + 30 * 60;
  const TIMER_REMAINING_KEY = 'rhcsa-timer-remaining';
  const TIMER_RUNNING_KEY = 'rhcsa-timer-running';
  const NOTES_KEY = 'rhcsa-practice-notes';

  let timerRemaining = parseInt(localStorage.getItem(TIMER_REMAINING_KEY) || `${TIMER_TOTAL_SECONDS}`, 10);
  let timerRunning = localStorage.getItem(TIMER_RUNNING_KEY) === 'true';
  let timerInterval = null;

  const examTimer = document.getElementById('examTimer');
  const timerStartBtn = document.getElementById('timerStart');
  const timerPauseBtn = document.getElementById('timerPause');
  const timerResetBtn = document.getElementById('timerReset');

  function renderTimer() {
    if (!examTimer) return;
    const h = Math.floor(timerRemaining / 3600);
    const m = Math.floor((timerRemaining % 3600) / 60);
    const s = timerRemaining % 60;
    examTimer.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    examTimer.classList.toggle('warning', timerRemaining <= 15 * 60);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerRunning = false;
    localStorage.setItem(TIMER_RUNNING_KEY, 'false');
  }

  function startTimer() {
    if (!examTimer || timerInterval || timerRemaining <= 0) return;
    timerRunning = true;
    localStorage.setItem(TIMER_RUNNING_KEY, 'true');
    timerInterval = setInterval(() => {
      timerRemaining = Math.max(0, timerRemaining - 1);
      localStorage.setItem(TIMER_REMAINING_KEY, String(timerRemaining));
      renderTimer();
      if (timerRemaining === 0) stopTimer();
    }, 1000);
  }

  timerStartBtn?.addEventListener('click', startTimer);
  timerPauseBtn?.addEventListener('click', stopTimer);
  timerResetBtn?.addEventListener('click', () => {
    stopTimer();
    timerRemaining = TIMER_TOTAL_SECONDS;
    localStorage.setItem(TIMER_REMAINING_KEY, String(timerRemaining));
    renderTimer();
  });

  renderTimer();
  if (timerRunning) startTimer();

  const TASK_POOL = [
    {
      title: 'User and Password Policy',
      description: 'Create user "opsadmin" with supplementary group "wheel" and set password max age to 90 days.',
      solution: 'useradd -m opsadmin\nusermod -aG wheel opsadmin\nchage -M 90 opsadmin'
    },
    {
      title: 'Persistent Mount Task',
      description: 'Format /dev/vdb1 with XFS and mount it persistently at /data with UUID in /etc/fstab.',
      solution: 'mkfs.xfs /dev/vdb1\nmkdir -p /data\nblkid /dev/vdb1\n# add UUID entry to /etc/fstab\nmount -a'
    },
    {
      title: 'SELinux Web Content',
      description: 'Fix SELinux context for custom web content under /srv/web and allow Apache network DB connection.',
      solution: 'semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"\nrestorecon -Rv /srv/web\nsetsebool -P httpd_can_network_connect_db on'
    },
    {
      title: 'Network Static Config',
      description: 'Configure static IP 192.168.100.25/24 with gateway 192.168.100.1 using nmcli.',
      solution: 'nmcli con mod "Wired connection 1" ipv4.addresses 192.168.100.25/24\nnmcli con mod "Wired connection 1" ipv4.gateway 192.168.100.1\nnmcli con mod "Wired connection 1" ipv4.method manual\nnmcli con up "Wired connection 1"'
    },
    {
      title: 'Systemd Service Validation',
      description: 'Enable and verify the sshd and firewalld services now and on reboot.',
      solution: 'systemctl enable --now sshd firewalld\nsystemctl is-active sshd firewalld\nsystemctl is-enabled sshd firewalld'
    }
  ];

  const generateTaskBtn = document.getElementById('generateTaskBtn');
  const showTaskSolutionBtn = document.getElementById('showTaskSolutionBtn');
  const generatedTask = document.getElementById('generatedTask');
  const generatedTaskSolution = document.getElementById('generatedTaskSolution');
  const generatedTaskSolutionCode = generatedTaskSolution?.querySelector('code');
  let currentTask = null;

  generateTaskBtn?.addEventListener('click', () => {
    const idx = Math.floor(Math.random() * TASK_POOL.length);
    currentTask = TASK_POOL[idx];
    if (generatedTask) {
      generatedTask.innerHTML = `<strong>${currentTask.title}</strong><br>${currentTask.description}`;
    }
    if (generatedTaskSolution && generatedTaskSolutionCode) {
      generatedTaskSolution.hidden = true;
      generatedTaskSolutionCode.textContent = currentTask.solution;
      hljs.highlightElement(generatedTaskSolutionCode);
    }
  });

  showTaskSolutionBtn?.addEventListener('click', () => {
    if (!currentTask || !generatedTaskSolution) return;
    generatedTaskSolution.hidden = !generatedTaskSolution.hidden;
  });

  const practiceNotes = document.getElementById('practiceNotes');
  const clearPracticeNotes = document.getElementById('clearPracticeNotes');

  if (practiceNotes) {
    practiceNotes.value = localStorage.getItem(NOTES_KEY) || '';
    practiceNotes.addEventListener('input', () => {
      localStorage.setItem(NOTES_KEY, practiceNotes.value);
    });
  }

  clearPracticeNotes?.addEventListener('click', () => {
    localStorage.removeItem(NOTES_KEY);
    if (practiceNotes) practiceNotes.value = '';
  });

  /* ============================================================
     LINUX-ONLY CHATBOT
     ============================================================ */
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotPanel = document.getElementById('chatbotPanel');
  const chatbotClose = document.getElementById('chatbotClose');
  const chatbotMessages = document.getElementById('chatbotMessages');
  const chatbotForm = document.getElementById('chatbotForm');
  const chatbotInput = document.getElementById('chatbotInput');

  chatbotToggle?.addEventListener('click', () => {
    chatbotPanel?.classList.toggle('active');
    if (chatbotPanel?.classList.contains('active')) chatbotInput?.focus();
  });

  chatbotClose?.addEventListener('click', () => {
    chatbotPanel?.classList.remove('active');
  });

  function addChatMessage(text, role) {
    if (!chatbotMessages) return;
    const el = document.createElement('div');
    el.className = `chat-msg ${role}`;
    el.textContent = text;
    chatbotMessages.appendChild(el);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function isLinuxQuestion(q) {
    const linuxKeywords = [
      'linux', 'rhcsa', 'bash', 'shell', 'terminal', 'command', 'grep', 'awk', 'sed',
      'useradd', 'passwd', 'chmod', 'chown', 'acl', 'setfacl', 'systemctl', 'journalctl',
      'selinux', 'semanage', 'restorecon', 'setsebool', 'dnf', 'rpm', 'yum', 'crontab',
      'nmcli', 'network', 'ip ', 'route', 'firewall', 'sshd', 'mount', 'fstab', 'xfs',
      'lvm', 'vgcreate', 'lvcreate', 'podman', 'nfs', 'process', 'service', 'permissions'
    ];
    const text = ` ${q.toLowerCase()} `;
    return linuxKeywords.some(k => text.includes(k));
  }

  function linuxAnswer(q) {
    const text = q.toLowerCase();

    if (text.includes('selinux')) {
      return 'SELinux quick flow: 1) check mode with getenforce, 2) inspect context with ls -Z, 3) fix labels using restorecon -Rv <path>, 4) manage policy settings with setsebool -P or semanage.';
    }
    if (text.includes('lvm') || text.includes('lvcreate') || text.includes('vgcreate')) {
      return 'LVM sequence: pvcreate /dev/vdX1 ; vgcreate vgdata /dev/vdX1 ; lvcreate -n lvname -L 2G vgdata ; mkfs.xfs /dev/vgdata/lvname ; mount and add UUID entry to /etc/fstab.';
    }
    if (text.includes('network') || text.includes('nmcli') || text.includes('ip')) {
      return 'Networking checklist: nmcli con show, set IPv4 with nmcli con mod, bring profile up, verify with ip a and ip r, then test with ping and dig.';
    }
    if (text.includes('user') || text.includes('password') || text.includes('sudo')) {
      return 'User management basics: useradd -m username, passwd username, usermod -aG wheel username, and verify permissions with id and sudo -l.';
    }
    if (text.includes('service') || text.includes('systemctl') || text.includes('process')) {
      return 'Service workflow: systemctl status <service>, systemctl enable --now <service>, verify socket/port with ss -tulnp, and inspect failures using journalctl -u <service>.';
    }
    if (text.includes('permission') || text.includes('chmod') || text.includes('acl')) {
      return 'Permissions quick reference: chmod for mode bits, chown for owner/group, setfacl for extra user/group access, and getfacl to audit effective ACL rules.';
    }
    if (text.includes('storage') || text.includes('mount') || text.includes('fstab') || text.includes('xfs')) {
      return 'Storage flow: lsblk to inspect disks, mkfs.xfs to format, mount target directory, capture UUID with blkid, update /etc/fstab, then validate using mount -a.';
    }
    if (text.includes('podman') || text.includes('container')) {
      return 'Podman basics: podman pull <image>, podman run -d --name app -p host:container <image>, podman ps for runtime state, and podman generate systemd for persistence.';
    }

    return 'Linux tip: ask with a specific task (for example SELinux label fix, nmcli static IP, LVM creation, systemd troubleshooting) and I will provide exact RHCSA-focused steps.';
  }

  chatbotForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = chatbotInput?.value.trim();
    if (!q) return;

    addChatMessage(q, 'user');

    if (!isLinuxQuestion(q)) {
      addChatMessage('I answer only Linux and RHCSA-related questions. Please ask about Linux commands, services, storage, networking, SELinux, or scripting.', 'bot');
    } else {
      addChatMessage(linuxAnswer(q), 'bot');
    }

    if (chatbotInput) chatbotInput.value = '';
  });

});
