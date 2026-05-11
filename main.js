class FlightLogApp {
  constructor() {
    this.state = {
      currentChapter: 1,
      connectedDots: [1],
      activeOrigin: null,
      isAnimating: false
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

      try {
        await this.triggerFlightAnimation(fromChapterId, chapterId);
      } catch (err) {
        console.error('Flight animation error:', err);
        document.getElementById('flight-overlay').classList.remove('active');
      } finally {
        this.state.currentChapter = chapterId;
        this.state.isAnimating = false;
        this.saveStateToStorage();
        this.renderChapter(chapterId);
        this.updateHintText();
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
      const legIndex = fromChapterId - 1;      // 0 = first leg, 3 = last leg
      const numLegs  = chapters.length - 1;   // 4

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
      this.state.isAnimating = false; // never persist a locked state across page loads
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new FlightLogApp());
} else {
  new FlightLogApp();
}
