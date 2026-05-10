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
    const textEl = document.getElementById('intro-text');

    // Warning text
    const warning = 'WARNING: NON-STANDARD ROUTE DETECTED';
    await this.typeText(textEl, warning, 35, '#8B1A1A', '2rem');

    await this.sleep(900);

    // Clear and next line
    textEl.innerHTML = '';
    const initiating = 'INITIATING FLIGHT LOG...';
    await this.typeText(textEl, initiating, 35, '#C97D10', '1rem');

    await this.sleep(700);

    // Fade out overlay
    overlay.classList.add('fade-out');

    // Show logbook
    const logbook = document.getElementById('logbook');
    logbook.classList.remove('hidden');

    // Initialize map and chapters after intro
    setTimeout(() => {
      this.initializeApp();
    }, 400);
  }

  async typeText(el, text, delay, color, size) {
    el.style.color = color;
    el.style.fontSize = size;

    for (let char of text) {
      el.textContent += char;
      await this.sleep(delay);
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
  }

  attachEventListeners() {
    window.addEventListener('originSelected', (e) => {
      const { dotId } = e.detail;
      this.state.activeOrigin = dotId;
    });

    window.addEventListener('chapterConnected', (e) => {
      const { chapterId } = e.detail;
      this.state.currentChapter = chapterId;
      this.state.connectedDots.push(chapterId);
      this.saveStateToStorage();
      this.renderChapter(chapterId);
      this.updateIndicators();
      this.updateHintText();
    });
  }

  renderChapter(chapterId) {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const container = document.getElementById('chapter-container');
    container.innerHTML = '';

    // Fade out, update, fade in
    container.style.opacity = '0';
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

    // Chapter sketch
    html += `<div class="chapter-sketch" id="sketch-container"></div>`;

    // Body text
    html += `<div class="chapter-body">${chapter.body}</div>`;

    // Callout
    html += `<div class="chapter-callout">${chapter.callout}</div>`;

    // Stamp or status
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

    // Create container and set HTML
    const div = document.createElement('div');
    div.innerHTML = html;

    // Load sketch after HTML is set
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
      // Fallback: rough.js rectangle
      this.drawRoughSketch(container, `CHAPTER ${chapterId}`);
    }
  }

  drawRoughSketch(container, label) {
    const canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 140;
    const rc = rough.canvas(canvas);
    rc.rectangle(5, 5, 130, 130, {
      stroke: '#1A1A1A',
      strokeWidth: 1,
      fill: 'none',
      roughness: 1.5
    });

    const ctx = canvas.getContext('2d');
    ctx.font = '0.9rem "Caveat", cursive';
    ctx.fillStyle = '#2C2C2C';
    ctx.textAlign = 'center';
    ctx.fillText(label, 70, 70);

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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new FlightLogApp();
});
