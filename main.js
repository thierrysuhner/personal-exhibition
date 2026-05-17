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

    // Line 1 — warning
    const line1 = document.createElement('div');
    textEl.appendChild(line1);
    await this.typeText(line1, 'WARNING: NON-STANDARD ROUTE DETECTED', 35, '#8B1A1A', '2rem');
    await this.typeDots(line1, 3, 220);

    await this.sleep(500);

    // Line 2 — initiating (appears below, same screen)
    const line2 = document.createElement('div');
    line2.style.marginTop = '1rem';
    textEl.appendChild(line2);
    await this.typeText(line2, 'INITIATING FLIGHT LOG', 35, '#C97D10', '1rem');
    await this.typeDots(line2, 3, 260);

    await this.sleep(500);

    overlay.classList.add('fade-out');
    overlay.style.pointerEvents = 'none'; // kill clicks immediately, don't rely on CSS keyframe

    const logbook = document.getElementById('logbook');
    logbook.classList.remove('hidden');

    setTimeout(() => {
      overlay.style.display = 'none'; // fully remove from stacking context after fade
      this.initializeApp();
    }, 420);
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
      this.onOriginSelected(dotId);
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
      } finally {
        // Always clear blocking overlays regardless of success or failure
        document.getElementById('flight-overlay').classList.remove('active');
        this.closeChecklistDrawer();
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
      let html = '';

      // Render waypoints that should appear before this leg
      const beforeWaypoints = waypoints.filter(w => w.placement === `before-leg-0${chapter.id}`);
      for (const wp of beforeWaypoints) {
        html += this.buildWaypointHTML(wp);
      }

      // Render the main chapter
      html += this.buildChapterHTML(chapter);

      // Render waypoints that should appear after this leg
      const afterWaypoints = waypoints.filter(w => w.placement === `after-leg-0${chapter.id}`);
      for (const wp of afterWaypoints) {
        html += this.buildWaypointHTML(wp);
      }

      // Render waypoints that should appear inside this leg (at the end of chapter)
      const insideWaypoints = waypoints.filter(w => w.placement === `inside-leg-0${chapter.id}`);
      for (const wp of insideWaypoints) {
        html += this.buildWaypointHTML(wp);
      }

      container.innerHTML = html;
      container.style.opacity = '1';

      // Update header status: AIRBORNE from Leg 3→4 onwards (ST. GALLEN→VANCOUVER)
      const headerMeta = document.getElementById('header-meta');
      if (headerMeta) {
        headerMeta.textContent = chapter.id >= 4 ? 'AIRBORNE' : 'ROUTE ACTIVE';
      }

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

    if (chapter.subtitle || chapter.signal) {
      html += `<div class="chapter-meta">`;
      if (chapter.subtitle) {
        html += `<span class="chapter-subtitle">${chapter.subtitle}</span>`;
      }
      if (chapter.signal) {
        html += `<span class="chapter-signal">● ${chapter.signal}</span>`;
      }
      html += `</div>`;
    }

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

  buildWaypointHTML(waypoint) {
    return `
      <div class="waypoint-card" data-waypoint-id="${waypoint.id}">
        <div class="waypoint-header">
          <span class="waypoint-type">${waypoint.type}</span>
          <span class="waypoint-label">${waypoint.label}</span>
        </div>
        <div class="waypoint-text">${waypoint.text}</div>
      </div>
    `;
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
    const hintEl  = document.getElementById('hint-text');
    const connected = this.state.connectedDots.length;
    const nextChapter = chapters.find(c => c.id === connected + 1);

    if (connected === 1) {
      hintEl.textContent = '① click LENZBURG on the map to select it';
    } else if (connected === 2) {
      hintEl.textContent = `② now click ${nextChapter?.dotLabel?.toUpperCase() ?? 'the next dot'} to fly the leg`;
    } else if (connected < 5) {
      hintEl.textContent = `② click ${nextChapter?.dotLabel?.toUpperCase() ?? 'the next dot'} to fly the next leg`;
    } else {
      hintEl.textContent = 'route complete · awaiting clearance';
    }
  }

  // Called by map when origin is selected — update hint immediately
  onOriginSelected(dotId) {
    const hintEl   = document.getElementById('hint-text');
    const chapter  = chapters.find(c => c.dot === dotId);
    const nextIdx  = chapters.findIndex(c => c.dot === dotId) + 1;
    const nextChap = chapters[nextIdx];
    if (nextChap) {
      hintEl.textContent = `→ now click ${nextChap.dotLabel.toUpperCase()} to connect`;
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
        const data = JSON.parse(cached);
        // Always apply the hardcoded actype override, even from cache
        if (pilot.actype) data.actype = pilot.actype.slice(0, 8);
        this.applyInstruments(data);
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
        actype:       (pilot.actype || primaryLang.toUpperCase()).slice(0, 8),
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

    // Render with empty boxes (animated mode) then open drawer
    this.renderChecklist(true);
    this.addDepartureButton(drawer);
    drawer.classList.add('open', 'animating');
    drawer.setAttribute('aria-hidden', 'false');

    // Wait for the user to click "COMPLETE CHECKLIST & DEPART"
    await this.waitForDeparture(drawer);

    // Tick every box in sequence
    const items = drawer.querySelectorAll('.checklist-item');
    for (const item of items) {
      item.classList.add('ticking');
      await this.sleep(55);
      item.classList.remove('ticking');
      item.classList.add('ticked');
      await this.sleep(30);
    }

    // Brief "all clear" hold
    await this.sleep(600);

    // Close drawer, then flight begins
    drawer.classList.remove('open', 'animating');
    drawer.setAttribute('aria-hidden', 'true');
    await this.sleep(380);
  }

  addDepartureButton(drawer) {
    // Remove any existing departure button first
    drawer.querySelector('.depart-btn')?.remove();
    const btn = document.createElement('button');
    btn.className = 'depart-btn';
    btn.type = 'button';
    btn.textContent = 'COMPLETE CHECKLIST & DEPART';
    drawer.appendChild(btn);
  }

  waitForDeparture(drawer) {
    return new Promise(resolve => {
      const btn = drawer.querySelector('.depart-btn');
      if (!btn) { resolve(); return; }
      btn.addEventListener('click', () => {
        btn.disabled = true;
        btn.textContent = 'RUNNING CHECKS...';
        resolve();
      }, { once: true });
    });
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
