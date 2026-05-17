class FlightLogApp {
  constructor() {
    this.state = {
      currentChapter: 1,
      connectedDots: [1],
      activeOrigin: null,
      isAnimating: false,
      transmissionPlayed: false
    };

    this.loadStateFromStorage();
    this.init();
  }

  init() {
    this.runIntroSequence();
  }

  async runIntroSequence() {
    const overlay = document.getElementById('intro-overlay');
    const textEl  = document.getElementById('intro-text');

    const warning = 'WARNING: NON-STANDARD ROUTE DETECTED';
    await this.typeText(textEl, warning, 35, '#8B1A1A', '2rem');
    await this.typeDots(textEl, 3, 220);

    await this.sleep(700);

    textEl.innerHTML = '';
    const initiating = 'INITIATING FLIGHT LOG';
    await this.typeText(textEl, initiating, 35, '#C97D10', '1rem');
    await this.typeDots(textEl, 3, 260);

    await this.sleep(500);

    overlay.classList.add('fade-out');

    const logbook = document.getElementById('logbook');
    logbook.classList.remove('hidden');

    setTimeout(() => {
      this.initializeApp();
    }, 400);
  }

  async typeText(el, text, delay, color, size) {
    el.style.color    = color;
    el.style.fontSize = size;

    for (let char of text) {
      el.textContent += char;
      await this.sleep(delay);
    }
  }

  async typeDots(el, count, delay) {
    for (let i = 0; i < count; i++) {
      await this.sleep(delay);
      el.textContent += '.';
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  initializeApp() {
    this.map = new RouteMap(this.state.connectedDots);
    this.renderChapter(this.state.currentChapter);
    this.attachEventListeners();
    this.attachChecklistListeners();
    this.attachTransmissionListeners();
    this.attachResetListener();
    this.updateIndicators();
    this.updateHintText();
    this.loadCockpitInstruments();
  }

  attachEventListeners() {
    window.addEventListener('originSelected', (e) => {
      const { dotId } = e.detail;
      this.state.activeOrigin = dotId;
    });

    window.addEventListener('chapterConnected', async (e) => {
      if (this.state.isAnimating) return;
      this.state.isAnimating = true;

      const { chapterId } = e.detail;
      const fromChapterId = this.state.currentChapter;

      this.state.connectedDots.push(chapterId);
      this.saveStateToStorage();
      this.updateIndicators();

      try {
        // Pre-flight checklist animation before the St. Gallen → Vancouver leg
        if (fromChapterId === 3 && chapterId === 4) {
          await this.runPreflightAnimation();
        }
        await this.triggerFlightAnimation(fromChapterId, chapterId);
      } catch (err) {
        console.error('Flight animation error:', err);
        document.getElementById('flight-overlay').classList.remove('active');
        this.closeChecklistDrawer();
      } finally {
        this.state.currentChapter = chapterId;
        this.state.isAnimating = false;
        this.saveStateToStorage();
        this.renderChapter(chapterId);
        this.updateHintText();

        if (chapterId === 5 && !this.state.transmissionPlayed) {
          this.state.transmissionPlayed = true;
          this.saveStateToStorage();
          setTimeout(() => this.playTransmission(), 1200);
        }
      }
    });
  }

  async triggerFlightAnimation(fromChapterId, toChapterId) {
    const overlay     = document.getElementById('flight-overlay');
    const hud         = document.getElementById('flight-hud');
    const video       = document.getElementById('flight-video');

    const fromChapter = chapters.find(c => c.id === fromChapterId);
    const toChapter   = chapters.find(c => c.id === toChapterId);

    hud.textContent = '';
    overlay.classList.add('active');

    if (video) {
      const legIndex = fromChapterId - 1;
      const numLegs  = chapters.length - 1;

      const startSegment = () => {
        if (isFinite(video.duration) && video.duration > 0) {
          video.currentTime = (legIndex / numLegs) * video.duration;
        }
        video.play().catch(() => {});
      };

      if (video.readyState >= 1) {
        startSegment();
      } else {
        video.addEventListener('loadedmetadata', startSegment, { once: true });
      }
    }

    const pad = (s, n) => String(s).padEnd(n);

    const header = [
      `${pad('DEP', 9)}·  ${fromChapter.location}`,
      `${pad('ARR', 9)}·  ${toChapter.location}`,
      ``,
      `${pad('STATUS', 9)}   AIRBORNE`,
    ];

    for (const line of header) {
      await this.sleep(280);
      hud.textContent += line + '\n';
    }

    await this.sleep(280);
    hud.textContent += `${pad('PROGRESS', 9)}   `;
    for (let i = 0; i < 16; i++) {
      await this.sleep(110);
      hud.textContent += '█';
    }
    await this.sleep(250);
    hud.textContent += '  COMPLETE\n';

    await this.sleep(1600);

    overlay.classList.remove('active');
    await this.sleep(550);

    if (video) video.pause();
  }

  renderChapter(chapterId) {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const container = document.getElementById('chapter-container');
    container.innerHTML = '';

    container.style.opacity    = '0';
    container.style.transition = 'opacity 200ms ease-out';

    setTimeout(() => {
      container.innerHTML = this.buildChapterHTML(chapter);
      container.style.opacity = '1';
      if (chapter.isFinalDestination) {
        container.classList.add('final-destination');
      } else {
        container.classList.remove('final-destination');
      }
    }, 200);
  }

  buildChapterHTML(chapter) {
    let html = `
      <div class="chapter-header">
        <span class="chapter-leg">${chapter.leg}</span>
        <span class="chapter-location">${chapter.location}</span>
        <span class="chapter-date">${chapter.dateRange}</span>
      </div>
    `;

    html += `<div class="chapter-sketch" id="sketch-container"></div>`;
    html += `<div class="chapter-body">${chapter.body}</div>`;
    html += `<div class="chapter-callout">${chapter.callout}</div>`;

    if (chapter.cargo && chapter.cargo.length) {
      html += `<div class="chapter-cargo">`;
      html += `<div class="cargo-header">CARGO MANIFEST</div>`;
      html += `<ul class="cargo-list">`;
      for (const item of chapter.cargo) {
        const href = item.url || '#';
        html += `
          <li class="cargo-item">
            <a class="cargo-link" href="${href}" target="_blank" rel="noopener">
              <span class="cargo-arrow">▸</span>
              <span class="cargo-label">${item.label}</span>
            </a>
            ${item.note ? `<span class="cargo-note">${item.note}</span>` : ''}
          </li>
        `;
      }
      html += `</ul></div>`;
    }

    if (chapter.stampText) {
      html += `<div class="chapter-stamp">${chapter.stampText}</div>`;
    } else {
      html += `<div class="chapter-status">STATUS: ${chapter.title}</div>`;
      if (chapter.contactEmail || chapter.contactLinkedin) {
        html += `<div class="chapter-contact">`;
        if (chapter.contactEmail) {
          html += `→ <a href="mailto:${chapter.contactEmail}">${chapter.contactEmail}</a>`;
        }
        if (chapter.contactLinkedin) {
          html += ` or <a href="https://${chapter.contactLinkedin}" target="_blank" rel="noopener">${chapter.contactLinkedin}</a>`;
        }
        html += `</div>`;
      }
      if (chapter.isFinalDestination) {
        html += `<button class="replay-transmission" id="replay-transmission" type="button">▸ replay transmission</button>`;
      }
    }

    const div = document.createElement('div');
    div.innerHTML = html;

    setTimeout(() => {
      this.loadSketch(chapter.sketchAsset, chapter.id);
      const replay = document.getElementById('replay-transmission');
      if (replay) {
        replay.addEventListener('click', () => this.playTransmission());
      }
    }, 100);

    return div.innerHTML;
  }

  async loadSketch(sketchAsset, chapterId) {
    const container = document.getElementById('sketch-container');
    if (!container) return;

    try {
      const res = await fetch(`assets/drawings/${sketchAsset}`);
      if (!res.ok) throw new Error('not found');
      const svg = await res.text();
      container.innerHTML = svg;
    } catch {
      this.drawFallbackSketch(container, `CHAPTER ${chapterId}`);
    }
  }

  drawFallbackSketch(container, label) {
    const canvas = document.createElement('canvas');
    canvas.width  = 130;
    canvas.height = 130;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth   = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(5, 5, 120, 120);

    ctx.setLineDash([]);
    ctx.font         = '900 0.9rem "Caveat", cursive';
    ctx.fillStyle    = '#2C2C2C';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 65, 65);

    container.appendChild(canvas);
  }

  updateIndicators() {
    for (let i = 1; i <= 5; i++) {
      const indicator = document.getElementById(`indicator-${i}`);
      if (this.state.connectedDots.includes(i)) {
        indicator.classList.add('connected');
        if (i === 5) indicator.classList.add('final');
      }
    }
  }

  updateHintText() {
    const hintEl = document.getElementById('hint-text');
    if (this.state.connectedDots.length === 1) {
      hintEl.textContent = 'click a dot to begin';
    } else if (this.state.connectedDots.length < 5) {
      hintEl.textContent = 'connect the next waypoint';
    } else {
      hintEl.textContent = 'route complete · awaiting clearance';
    }
  }

  // ─── Live cockpit instruments (GitHub API) ─────────────────────────
  async loadCockpitInstruments() {
    if (!pilot || !pilot.githubUser || pilot.githubUser.startsWith('PLACEHOLDER')) {
      this.setInstrument('inst-hours',   '—');
      this.setInstrument('inst-actype',  '—');
      this.setInstrument('inst-fleet',   '—');
      this.setInstrument('inst-lastdep', 'OFFLINE');
      return;
    }

    const cacheKey = `ghCache:${pilot.githubUser}`;
    const cached   = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        this.applyInstruments(JSON.parse(cached));
        return;
      } catch {}
    }

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${pilot.githubUser}`),
        fetch(`https://api.github.com/users/${pilot.githubUser}/repos?per_page=100&sort=pushed`)
      ]);

      if (!userRes.ok || !reposRes.ok) throw new Error('github fetch failed');

      const user  = await userRes.json();
      const repos = await reposRes.json();

      const langCounts = {};
      let lastPushedAt = null;
      for (const r of repos) {
        if (r.fork) continue;
        if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1;
        if (r.pushed_at && (!lastPushedAt || r.pushed_at > lastPushedAt)) lastPushedAt = r.pushed_at;
      }
      const primaryLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

      const payload = {
        fleet:        user.public_repos,
        actype:       primaryLang.toUpperCase().slice(0, 8),
        lastDep:      lastPushedAt ? this.formatDepTime(lastPushedAt) : '—',
        hours:        repos.filter(r => !r.fork).length * 100 // rough proxy — visitor sees it as flight hours
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(payload));
      this.applyInstruments(payload);
    } catch (err) {
      this.setInstrument('inst-lastdep', 'NO SIGNAL');
    }
  }

  applyInstruments(p) {
    this.setInstrument('inst-hours',   p.hours);
    this.setInstrument('inst-actype',  p.actype);
    this.setInstrument('inst-fleet',   p.fleet);
    this.setInstrument('inst-lastdep', p.lastDep);
  }

  setInstrument(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  formatDepTime(iso) {
    const d = new Date(iso);
    const dayMs = 24 * 60 * 60 * 1000;
    const diff = Math.floor((Date.now() - d.getTime()) / dayMs);
    if (diff <= 0)   return 'TODAY';
    if (diff === 1)  return '1D AGO';
    if (diff < 30)   return `${diff}D AGO`;
    if (diff < 365)  return `${Math.floor(diff / 30)}MO AGO`;
    return `${Math.floor(diff / 365)}Y AGO`;
  }

  // ─── Animated pre-flight checklist (Leg 3 → 4 only) ───────────────
  async runPreflightAnimation() {
    const drawer = document.getElementById('checklist-drawer');

    // Render with empty boxes
    this.renderChecklist(true);
    drawer.classList.add('open', 'animating');
    drawer.setAttribute('aria-hidden', 'false');

    // Brief pause so drawer slides in before we start ticking
    await this.sleep(600);

    const items = drawer.querySelectorAll('.checklist-item');
    for (const item of items) {
      item.classList.add('ticking');
      await this.sleep(65);
      item.classList.remove('ticking');
      item.classList.add('ticked');
      await this.sleep(38);
    }

    // Hold a moment so it reads as "all clear"
    await this.sleep(700);

    // Slide the drawer closed before the video starts
    drawer.classList.remove('open', 'animating');
    drawer.setAttribute('aria-hidden', 'true');

    // Small gap before the flight animation overlay appears
    await this.sleep(380);
  }

  closeChecklistDrawer() {
    const drawer = document.getElementById('checklist-drawer');
    drawer.classList.remove('open', 'animating');
    drawer.setAttribute('aria-hidden', 'true');
  }

  // ─── Reset to Leg 1 ────────────────────────────────────────────────
  attachResetListener() {
    const btn = document.getElementById('reset-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      sessionStorage.removeItem('flightLogState');
      window.location.reload();
    });
  }

  // ─── Preflight checklist drawer ────────────────────────────────────
  attachChecklistListeners() {
    const drawer = document.getElementById('checklist-drawer');
    const open   = () => {
      this.renderChecklist();
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
    };
    const close  = () => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    };

    document.getElementById('checklist-toggle').addEventListener('click', open);
    document.getElementById('checklist-close').addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (drawer.classList.contains('open')) close();
        else open();
      } else if (e.key === 'Escape') {
        close();
      }
    });
  }

  renderChecklist(animated = false) {
    const body = document.getElementById('checklist-body');
    if (!body || typeof preflightChecklist === 'undefined') return;
    // In animated mode boxes show empty (✓ hidden via CSS on .animating drawer);
    // in manual mode they show already-checked.
    body.innerHTML = preflightChecklist.map(group => `
      <section class="checklist-group">
        <h3 class="checklist-group-title">${group.group}</h3>
        <ul class="checklist-items">
          ${group.items.map(item => `
            <li class="checklist-item${animated ? '' : ' ticked'}">
              <span class="checklist-box">✓</span>
              <span class="checklist-text">${item}</span>
            </li>
          `).join('')}
        </ul>
      </section>
    `).join('');
  }

  // ─── ATC transmission + letter (after Leg 5) ───────────────────────
  attachTransmissionListeners() {
    document.getElementById('letter-close').addEventListener('click', () => this.closeTransmission());
    document.getElementById('transmission-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'transmission-overlay') this.closeTransmission();
    });
  }

  async playTransmission() {
    const overlay = document.getElementById('transmission-overlay');
    const radio   = document.getElementById('transmission-radio');
    const letter  = document.getElementById('clearance-letter');

    radio.innerHTML = '';
    letter.hidden = true;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');

    for (const t of atcTransmission) {
      const line = document.createElement('div');
      line.className = `radio-line ${t.who === 'TS-001' ? 'radio-pilot' : 'radio-tower'}`;
      line.innerHTML = `
        <span class="radio-freq">${t.freq}</span>
        <span class="radio-who">${t.who}</span>
        <span class="radio-msg"></span>
      `;
      radio.appendChild(line);

      const msgEl = line.querySelector('.radio-msg');
      for (const ch of t.msg) {
        msgEl.textContent += ch;
        await this.sleep(18);
      }
      await this.sleep(420);
    }

    await this.sleep(700);
    document.getElementById('letter-to').textContent   = clearanceLetter.to;
    document.getElementById('letter-from').textContent = clearanceLetter.from;
    document.getElementById('letter-body').innerHTML   = clearanceLetter.body
      .map(p => `<p>${p}</p>`).join('');
    document.getElementById('letter-footer').textContent = clearanceLetter.signoff;
    letter.hidden = false;
  }

  closeTransmission() {
    const overlay = document.getElementById('transmission-overlay');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  }

  saveStateToStorage() {
    sessionStorage.setItem('flightLogState', JSON.stringify(this.state));
  }

  loadStateFromStorage() {
    const saved = sessionStorage.getItem('flightLogState');
    if (saved) {
      this.state = { ...this.state, ...JSON.parse(saved) };
      this.state.isAnimating = false;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new FlightLogApp());
} else {
  new FlightLogApp();
}
