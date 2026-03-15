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

  /* ============================================================
     SCROLL PROGRESS BAR
     ============================================================ */
  const scrollProgress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    if (!scrollProgress) return;
    const winH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = winH > 0 ? (window.scrollY / winH) * 100 : 0;
    scrollProgress.style.width = `${pct}%`;
  });

  /* ============================================================
     DAILY STUDY STREAK
     ============================================================ */
  const STREAK_KEY = 'rhcsa-streak';
  function updateStreak() {
    const today = new Date().toISOString().slice(0, 10);
    let data = JSON.parse(localStorage.getItem(STREAK_KEY) || '{"last":"","count":0}');
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (data.last === today) { /* already recorded */ }
    else if (data.last === yesterday) { data.count++; data.last = today; }
    else { data.count = 1; data.last = today; }
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    const el = document.getElementById('streakCount');
    if (el) el.textContent = `${data.count} day streak`;
  }
  updateStreak();

  /* ============================================================
     COMMAND PALETTE (Ctrl+K)
     ============================================================ */
  const cmdOverlay = document.getElementById('cmdPaletteOverlay');
  const cmdInput = document.getElementById('cmdPaletteInput');
  const cmdResults = document.getElementById('cmdPaletteResults');
  let cmdSelectedIdx = -1;

  // Build palette items from nav + search index
  const paletteItems = [];
  navItems.forEach(item => {
    paletteItems.push({
      text: item.querySelector('span')?.textContent || '',
      icon: item.querySelector('i')?.className || 'fas fa-arrow-right',
      secId: item.dataset.section
    });
  });
  index.forEach(i => {
    if (i.type === 'command') {
      paletteItems.push({ text: i.text, icon: 'fas fa-terminal', secId: i.secId, sub: i.secTitle });
    }
  });

  function openCmdPalette() {
    if (!cmdOverlay) return;
    cmdOverlay.classList.add('active');
    cmdInput.value = '';
    cmdSelectedIdx = -1;
    renderPaletteResults('');
    setTimeout(() => cmdInput?.focus(), 50);
  }
  function closeCmdPalette() { cmdOverlay?.classList.remove('active'); }

  function renderPaletteResults(q) {
    if (!cmdResults) return;
    const filtered = q.length < 1 ? paletteItems.slice(0, 12)
      : paletteItems.filter(p => p.text.toLowerCase().includes(q.toLowerCase())).slice(0, 12);
    cmdResults.innerHTML = filtered.map((p, i) => `
      <div class="cmd-palette-item${i === cmdSelectedIdx ? ' selected' : ''}" data-sec="${p.secId}" data-idx="${i}">
        <i class="${p.icon}"></i>
        <div><div class="cmd-palette-item-text">${p.text}</div>${p.sub ? `<div class="cmd-palette-item-sub">${p.sub}</div>` : ''}</div>
      </div>`).join('');
    cmdResults.querySelectorAll('.cmd-palette-item').forEach(el => {
      el.addEventListener('click', () => {
        document.getElementById(el.dataset.sec)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeCmdPalette();
      });
    });
  }

  cmdInput?.addEventListener('input', () => {
    cmdSelectedIdx = -1;
    renderPaletteResults(cmdInput.value.trim());
  });

  cmdInput?.addEventListener('keydown', e => {
    const items = cmdResults?.querySelectorAll('.cmd-palette-item') || [];
    if (e.key === 'ArrowDown') { e.preventDefault(); cmdSelectedIdx = Math.min(cmdSelectedIdx + 1, items.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); cmdSelectedIdx = Math.max(cmdSelectedIdx - 1, 0); }
    else if (e.key === 'Enter' && items[cmdSelectedIdx]) {
      e.preventDefault();
      const sec = items[cmdSelectedIdx].dataset.sec;
      document.getElementById(sec)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeCmdPalette();
      return;
    }
    items.forEach((it, i) => it.classList.toggle('selected', i === cmdSelectedIdx));
    if (items[cmdSelectedIdx]) items[cmdSelectedIdx].scrollIntoView({ block: 'nearest' });
  });

  cmdOverlay?.addEventListener('click', e => { if (e.target === cmdOverlay) closeCmdPalette(); });

  /* ============================================================
     FLASHCARD QUIZ
     ============================================================ */
  const FLASHCARD_DATA = [
    { cmd: 'useradd -m devops', desc: 'Create user with home directory' },
    { cmd: 'passwd analyst', desc: 'Set or reset account password' },
    { cmd: 'chage -M 90 devops', desc: 'Set max password age in days' },
    { cmd: 'restorecon -Rv /var/www', desc: 'Fix SELinux context labels recursively' },
    { cmd: 'setsebool -P httpd_can_network_connect on', desc: 'Allow httpd outbound network access' },
    { cmd: 'nmcli con mod eth0 ipv4.method manual', desc: 'Set connection to static IP mode' },
    { cmd: 'lvextend -L +1G /dev/vgdata/lvlogs', desc: 'Extend logical volume by 1GB' },
    { cmd: 'xfs_growfs /dev/vgdata/lvlogs', desc: 'Grow XFS filesystem after LV extend' },
    { cmd: 'mount -a', desc: 'Validate all fstab entries' },
    { cmd: 'firewall-cmd --add-service=http --permanent', desc: 'Allow HTTP through firewall permanently' },
    { cmd: 'systemctl enable --now httpd', desc: 'Start and enable service at boot' },
    { cmd: 'podman generate systemd --name web --files', desc: 'Create systemd unit from container' },
    { cmd: 'setfacl -m u:qa:rwx /project', desc: 'Grant user-specific ACL access' },
    { cmd: 'chmod 2770 /shared', desc: 'Set SGID on directory for group inheritance' },
    { cmd: 'crontab -e', desc: 'Edit per-user cron schedule' },
    { cmd: 'journalctl -u sshd --since "-15 min"', desc: 'Filter journal by unit and time' },
  ];

  const fcOverlay = document.getElementById('flashcardOverlay');
  const fcQ = document.getElementById('flashcardQ');
  const fcOpts = document.getElementById('flashcardOptions');
  const fcScore = document.getElementById('flashcardScore');
  const fcTotal = document.getElementById('flashcardTotal');
  const fcNext = document.getElementById('flashcardNext');
  const fcClose = document.getElementById('flashcardClose');
  let fcCorrect = 0, fcAsked = 0, fcAnswered = false;

  function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

  function loadFlashcard() {
    if (!fcQ || !fcOpts) return;
    fcAnswered = false;
    const card = FLASHCARD_DATA[Math.floor(Math.random() * FLASHCARD_DATA.length)];
    fcQ.textContent = card.cmd;
    const wrong = shuffle(FLASHCARD_DATA.filter(c => c.desc !== card.desc)).slice(0, 3).map(c => c.desc);
    const options = shuffle([card.desc, ...wrong]);
    fcOpts.innerHTML = options.map(o => `<button class="flashcard-option" data-correct="${o === card.desc}">${o}</button>`).join('');
    fcOpts.querySelectorAll('.flashcard-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (fcAnswered) return;
        fcAnswered = true;
        fcAsked++;
        if (btn.dataset.correct === 'true') { btn.classList.add('correct'); fcCorrect++; }
        else {
          btn.classList.add('wrong');
          fcOpts.querySelector('[data-correct="true"]')?.classList.add('correct');
        }
        if (fcScore) fcScore.textContent = fcCorrect;
        if (fcTotal) fcTotal.textContent = fcAsked;
      });
    });
  }

  function openFlashcards() { fcOverlay?.classList.add('active'); fcCorrect = 0; fcAsked = 0; if (fcScore) fcScore.textContent = '0'; if (fcTotal) fcTotal.textContent = '0'; loadFlashcard(); }
  function closeFlashcards() { fcOverlay?.classList.remove('active'); }

  fcNext?.addEventListener('click', loadFlashcard);
  fcClose?.addEventListener('click', closeFlashcards);
  fcOverlay?.addEventListener('click', e => { if (e.target === fcOverlay) closeFlashcards(); });

  /* ============================================================
     CONFETTI ON 100% COMPLETION
     ============================================================ */
  let confettiFired = false;
  const origRenderProgress = renderProgress;

  function renderProgressWithConfetti() {
    origRenderProgress();
    const done = CHAPS.filter(c => progress[c]).length;
    if (done === CHAPS.length && !confettiFired) {
      confettiFired = true;
      fireConfetti();
    } else if (done < CHAPS.length) {
      confettiFired = false;
    }
  }

  // Patch progress buttons to use enhanced version
  document.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', renderProgressWithConfetti);
  });

  function fireConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    const colors = ['#ee0000', '#ff7a1a', '#ffbc5a', '#3fb950', '#d75a8a', '#ff8b8b', '#58a6ff'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (2 + Math.random() * 3) + 's';
      piece.style.animationDelay = Math.random() * 1.5 + 's';
      piece.style.width = (6 + Math.random() * 8) + 'px';
      piece.style.height = (6 + Math.random() * 8) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      container.appendChild(piece);
    }
    setTimeout(() => container.remove(), 6000);
  }

  /* ============================================================
     FOCUS / POMODORO MODE
     ============================================================ */
  const focusModeBtn = document.getElementById('focusModeBtn');
  const focusIndicator = document.getElementById('focusIndicator');
  const focusTimerDisplay = document.getElementById('focusTimerDisplay');
  let focusInterval = null;
  let focusRemaining = 25 * 60;
  let focusActive = false;

  function renderFocusTimer() {
    if (!focusTimerDisplay) return;
    const m = Math.floor(focusRemaining / 60);
    const s = focusRemaining % 60;
    focusTimerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  focusModeBtn?.addEventListener('click', () => {
    if (focusActive) {
      clearInterval(focusInterval);
      focusActive = false;
      focusRemaining = 25 * 60;
      focusIndicator?.classList.remove('active');
      renderFocusTimer();
    } else {
      focusActive = true;
      focusIndicator?.classList.add('active');
      focusInterval = setInterval(() => {
        focusRemaining = Math.max(0, focusRemaining - 1);
        renderFocusTimer();
        if (focusRemaining === 0) {
          clearInterval(focusInterval);
          focusActive = false;
          focusIndicator?.classList.remove('active');
          focusRemaining = 25 * 60;
          renderFocusTimer();
          alert('🎉 Focus session complete! Take a 5-minute break.');
        }
      }, 1000);
    }
  });

  renderFocusTimer();

  /* ============================================================
     EXPORT PROGRESS AS JSON
     ============================================================ */
  window.exportRHCSAProgress = function() {
    const data = {
      progress,
      streak: JSON.parse(localStorage.getItem(STREAK_KEY) || '{}'),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rhcsa-progress.json';
    a.click(); URL.revokeObjectURL(url);
  };

  /* ============================================================
     FOOTER SIDEBAR SYNC
     ============================================================ */
  const siteFooter = document.getElementById('siteFooter');
  const origSidebarToggle = sidebarToggle;
  if (origSidebarToggle && siteFooter) {
    new MutationObserver(() => {
      siteFooter.classList.toggle('expanded', mainContent.classList.contains('expanded'));
    }).observe(mainContent, { attributes: true, attributeFilter: ['class'] });
  }

  /* ============================================================
     ENHANCED KEYBOARD SHORTCUTS
     ============================================================ */
  document.addEventListener('keydown', e => {
    const active = document.activeElement;
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName);

    // Ctrl+K → Command Palette
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (cmdOverlay?.classList.contains('active')) closeCmdPalette();
      else openCmdPalette();
    }
    // F → Flashcard Quiz
    if (e.key === 'f' && !typing && !e.ctrlKey && !e.metaKey) {
      if (!fcOverlay?.classList.contains('active')) openFlashcards();
    }
    // Escape → close modals
    if (e.key === 'Escape') {
      closeCmdPalette();
      closeFlashcards();
    }
    // E → Export progress
    if (e.key === 'e' && !typing && !e.ctrlKey && !e.metaKey) {
      window.exportRHCSAProgress();
    }
  });

});
