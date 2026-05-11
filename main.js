class AerialCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.W     = this.canvas.width;
    this.H     = this.canvas.height;
    this.scrollY = 0;
    this.TILE    = this.H * 4;
    this.patches = this._makePatches();
    this.roads   = this._makeRoads();
    this.clouds  = this._makeClouds();
    this.raf     = null;
  }

  _makePatches() {
    const colors = [
      '#3b5e2e','#4a7038','#598a3e','#6b9045','#7a9a50',
      '#8db55a','#4d6828','#c0aa55','#aa9042','#907832',
      '#6b5a28','#7a6838','#887848','#9a8550','#a09058',
    ];
    const arr = [];
    for (let i = 0; i < 500; i++) {
      arr.push({
        x: Math.random() * this.W,
        y: Math.random() * this.TILE,
        w: 18 + Math.random() * 130,
        h: 12 + Math.random() * 80,
        c: colors[Math.floor(Math.random() * colors.length)],
        a: (Math.random() - 0.5) * 0.35,
      });
    }
    return arr;
  }

  _makeRoads() {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      arr.push({ type: 'v', x: Math.random() * this.W, w: 1 + Math.random() * 2, water: false });
    }
    for (let i = 0; i < 14; i++) {
      arr.push({ type: 'h', y: Math.random() * this.TILE, w: 0.8 + Math.random() * 1.5, water: false });
    }
    for (let i = 0; i < 2; i++) {
      arr.push({ type: 'v', x: Math.random() * this.W, w: 4 + Math.random() * 6, water: true });
    }
    return arr;
  }

  _makeClouds() {
    const arr = [];
    for (let i = 0; i < 10; i++) arr.push(this._newCloud(true));
    return arr;
  }

  _newCloud(scatter) {
    const n = 3 + Math.floor(Math.random() * 5);
    const puffs = [];
    for (let i = 0; i < n; i++) {
      puffs.push({
        dx: i * (25 + Math.random() * 35),
        dy: (Math.random() - 0.5) * 22,
        r:  28 + Math.random() * 55,
      });
    }
    return {
      x:  scatter ? Math.random() * this.W : this.W + 150,
      y:  40 + Math.random() * this.H * 0.55,
      puffs,
      vx: -(2 + Math.random() * 3),
      op: 0.65 + Math.random() * 0.35,
    };
  }

  _frame() {
    this.scrollY += 10;
    const { ctx, W, H, TILE } = this;
    ctx.clearRect(0, 0, W, H);

    /* sky */
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.54);
    sky.addColorStop(0,    '#07192d');
    sky.addColorStop(0.25, '#0e3158');
    sky.addColorStop(0.6,  '#1b5898');
    sky.addColorStop(0.85, '#5190bf');
    sky.addColorStop(1,    '#a5cfe4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.54);

    /* ground base */
    const horizonY = H * 0.5;
    const gnd = ctx.createLinearGradient(0, horizonY, 0, H);
    gnd.addColorStop(0,   '#b0c880');
    gnd.addColorStop(0.3, '#80a848');
    gnd.addColorStop(0.8, '#5a8030');
    gnd.addColorStop(1,   '#3a6020');
    ctx.fillStyle = gnd;
    ctx.fillRect(0, horizonY, W, H - horizonY);

    /* field patches with pseudo-perspective */
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, horizonY, W, H - horizonY);
    ctx.clip();
    const mod = this.scrollY % TILE;
    for (const p of this.patches) {
      const raw = (p.y - mod + TILE * 3) % TILE;
      const t   = raw / TILE;
      const sy  = horizonY + Math.pow(t, 0.65) * (H - horizonY);
      const s   = 0.06 + t * 0.94;
      if (sy > H + 80 || sy < horizonY - 20) continue;
      ctx.save();
      ctx.translate(p.x, sy);
      ctx.rotate(p.a * s);
      ctx.globalAlpha = 0.65 + t * 0.3;
      ctx.fillStyle   = p.c;
      ctx.fillRect(-p.w * s * 0.5, -p.h * s * 0.5, p.w * s, p.h * s);
      ctx.restore();
    }

    /* roads & rivers */
    for (const r of this.roads) {
      ctx.globalAlpha  = r.water ? 0.7 : 0.5;
      ctx.strokeStyle  = r.water ? '#4888b8' : '#9a8e78';
      ctx.lineWidth    = r.w;
      ctx.beginPath();
      if (r.type === 'v') {
        ctx.moveTo(r.x, horizonY);
        ctx.lineTo(r.x, H);
      } else {
        const raw = (r.y - mod + TILE * 3) % TILE;
        const t   = raw / TILE;
        const sy  = horizonY + Math.pow(t, 0.65) * (H - horizonY);
        if (sy < horizonY || sy > H) continue;
        ctx.moveTo(0, sy);
        ctx.lineTo(W, sy);
      }
      ctx.stroke();
    }
    ctx.restore();

    /* horizon haze */
    const haze = ctx.createLinearGradient(0, horizonY - 35, 0, horizonY + 45);
    haze.addColorStop(0,    'rgba(180,218,250,0)');
    haze.addColorStop(0.35, 'rgba(198,228,252,0.38)');
    haze.addColorStop(0.6,  'rgba(210,236,255,0.38)');
    haze.addColorStop(1,    'rgba(180,218,250,0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, horizonY - 35, W, 80);

    /* clouds */
    for (const cl of this.clouds) {
      ctx.save();
      ctx.globalAlpha = cl.op;
      for (const p of cl.puffs) {
        const cx = cl.x + p.dx, cy = cl.y + p.dy;
        const g  = ctx.createRadialGradient(cx, cy - p.r * 0.15, 0, cx, cy, p.r);
        g.addColorStop(0,    'rgba(255,255,255,1)');
        g.addColorStop(0.55, 'rgba(248,252,255,0.88)');
        g.addColorStop(0.85, 'rgba(225,240,252,0.45)');
        g.addColorStop(1,    'rgba(200,225,245,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      cl.x += cl.vx;
      const span = cl.puffs[cl.puffs.length - 1].dx + cl.puffs[cl.puffs.length - 1].r * 2;
      if (cl.x + span < 0) Object.assign(cl, this._newCloud(false));
    }

    this.raf = requestAnimationFrame(() => this._frame());
  }

  start() { if (!this.raf) this._frame(); }
  stop()  { cancelAnimationFrame(this.raf); this.raf = null; }
}

class FlightLogApp {
  constructor() {
    this.state = {
      currentChapter: 1,
      connectedDots: [1],
      activeOrigin: null,
      isAnimating: false
    };
    this.aerialCanvas = null;

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
    this.map = new RouteMap();
    this.renderChapter(this.state.currentChapter);
    this.attachEventListeners();
    this.updateIndicators();
    this.updateHintText();
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

      await this.triggerFlightAnimation(fromChapterId, chapterId);

      this.state.currentChapter = chapterId;
      this.state.isAnimating = false;
      this.renderChapter(chapterId);
      this.updateHintText();
    });
  }

  async triggerFlightAnimation(fromChapterId, toChapterId) {
    const overlay     = document.getElementById('flight-overlay');
    const hud         = document.getElementById('flight-hud');
    const canvas      = document.getElementById('aerial-canvas');

    const fromChapter = chapters.find(c => c.id === fromChapterId);
    const toChapter   = chapters.find(c => c.id === toChapterId);

    hud.textContent = '';

    if (this.aerialCanvas) this.aerialCanvas.stop();
    this.aerialCanvas = new AerialCanvas(canvas);

    overlay.classList.add('active');
    this.aerialCanvas.start();

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

    // Animated progress bar — fill block by block, then reveal COMPLETE
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

    this.aerialCanvas.stop();
    this.aerialCanvas = null;
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
          html += ` or <a href="https://${chapter.contactLinkedin}" target="_blank">${chapter.contactLinkedin}</a>`;
        }
        html += `</div>`;
      }
    }

    const div = document.createElement('div');
    div.innerHTML = html;

    setTimeout(() => {
      this.loadSketch(chapter.sketchAsset, chapter.id);
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
      hintEl.textContent = 'route complete';
    }
  }

  saveStateToStorage() {
    sessionStorage.setItem('flightLogState', JSON.stringify(this.state));
  }

  loadStateFromStorage() {
    const saved = sessionStorage.getItem('flightLogState');
    if (saved) {
      this.state = JSON.parse(saved);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new FlightLogApp());
} else {
  new FlightLogApp();
}
