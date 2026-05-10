class RouteMap {
  constructor() {
    this.svg = document.getElementById('map-svg');
    this.rc = rough.canvas(this.svg);
    this.state = {
      dots: ['CH-LENZ', 'CH-ARMY', 'CH-HSG', 'CA-VAN', 'XX-NEXT'],
      dotStates: {
        'CH-LENZ': 'ready',
        'CH-ARMY': 'locked',
        'CH-HSG': 'locked',
        'CA-VAN': 'locked',
        'XX-NEXT': 'locked'
      },
      connectedPairs: [],
      activeOrigin: null,
      previewLine: null
    };

    this.init();
  }

  init() {
    this.drawMap();
    this.attachDotListeners();
    this.setupMouseTracking();
  }

  drawMap() {
    // Clear SVG
    this.svg.innerHTML = '';

    // Draw map base (rough rectangle border)
    const rc = rough.svg(this.svg);
    const viewBox = this.svg.viewBox.baseVal;
    const mapBase = rc.rectangle(5, 5, viewBox.width - 10, viewBox.height - 10, {
      strokeWidth: 1.5,
      stroke: '#1A1A1A',
      fill: 'none',
      roughness: 1.2
    });
    this.svg.appendChild(mapBase);

    // Draw ocean crossing (subtle wavy line between CH-HSG and CA-VAN)
    const hsg = this.getPixelPosition('CH-HSG');
    const van = this.getPixelPosition('CA-VAN');
    const oceanLine = rc.line(hsg.px, hsg.py, van.px, van.py, {
      strokeWidth: 0.5,
      stroke: '#D6E4EE',
      roughness: 2
    });
    this.svg.appendChild(oceanLine);

    // Draw dots
    for (const dotId of this.state.dots) {
      this.drawDot(dotId);
    }

    // Draw connected lines
    for (const pair of this.state.connectedPairs) {
      this.drawConnectedLine(pair.from, pair.to);
    }
  }

  drawDot(dotId) {
    const { px, py } = this.getPixelPosition(dotId);
    const dotState = this.state.dotStates[dotId];
    const chapter = chapters.find(c => c.dot === dotId);

    // Try to load SVG, fall back to rough.js circle
    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `assets/drawings/dot-${chapter.id}.svg`);
    img.setAttribute('x', px - 12);
    img.setAttribute('y', py - 12);
    img.setAttribute('width', 24);
    img.setAttribute('height', 24);
    img.classList.add('map-dot', dotState);
    img.dataset.dotId = dotId;
    img.onerror = () => {
      img.remove();
      this.drawRoughDot(dotId, px, py, dotState);
    };
    this.svg.appendChild(img);

    // Try to load actual SVG for dot
    fetch(`assets/drawings/dot-${dotId}.svg`)
      .catch(() => {
        if (img.parentNode) img.remove();
        this.drawRoughDot(dotId, px, py, dotState);
      });

    // Draw label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', px);
    label.setAttribute('y', py + 28);
    label.setAttribute('class', `map-label ${dotState}`);
    label.textContent = chapter.dotLabel;
    this.svg.appendChild(label);
  }

  drawRoughDot(dotId, px, py, state) {
    const rc = rough.svg(this.svg);
    const color = state === 'locked' ? '#999999' : (state === 'ready' ? '#1B4332' : '#1B4332');
    const dot = rc.circle(px, py, 8, {
      fill: color,
      fillStyle: 'solid',
      stroke: color,
      strokeWidth: 1.5
    });
    dot.classList.add('map-dot', state);
    dot.dataset.dotId = dotId;
    this.svg.appendChild(dot);
  }

  drawConnectedLine(fromId, toId) {
    const fromPos = this.getPixelPosition(fromId);
    const toPos = this.getPixelPosition(toId);

    const rc = rough.svg(this.svg);

    // Try to load SVG line first
    const lineNum = chapters.findIndex(c => c.dot === fromId) + 1;
    const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    svgPath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `assets/drawings/line-${lineNum}-${lineNum + 1}.svg`);
    svgPath.setAttribute('x', Math.min(fromPos.px, toPos.px) - 5);
    svgPath.setAttribute('y', Math.min(fromPos.py, toPos.py) - 5);
    svgPath.setAttribute('width', Math.abs(toPos.px - fromPos.px) + 10);
    svgPath.setAttribute('height', Math.abs(toPos.py - fromPos.py) + 10);
    svgPath.style.pointerEvents = 'none';
    svgPath.onerror = () => {
      svgPath.remove();
      this.drawRoughLine(fromPos, toPos);
    };
    this.svg.appendChild(svgPath);

    // Fall back to rough.js line if SVG doesn't load
    fetch(`assets/drawings/line-${lineNum}-${lineNum + 1}.svg`)
      .catch(() => {
        if (svgPath.parentNode) svgPath.remove();
        this.drawRoughLine(fromPos, toPos);
      });
  }

  drawRoughLine(fromPos, toPos) {
    const rc = rough.svg(this.svg);
    const line = rc.line(fromPos.px, fromPos.py, toPos.px, toPos.py, {
      stroke: '#1B4332',
      strokeWidth: 2,
      roughness: 1
    });
    line.style.pointerEvents = 'none';
    this.svg.appendChild(line);
  }

  getPixelPosition(dotId) {
    const pos = dotPositions[dotId];
    const viewBox = this.svg.viewBox.baseVal;
    return {
      x: pos.x,
      y: pos.y,
      px: (pos.x / 100) * viewBox.width,
      py: (pos.y / 100) * viewBox.height
    };
  }

  attachDotListeners() {
    this.svg.addEventListener('click', (e) => {
      const dotEl = e.target.closest('.map-dot');
      if (!dotEl) return;

      const dotId = dotEl.dataset.dotId;
      const state = this.state.dotStates[dotId];

      if (state === 'ready') {
        this.selectOriginDot(dotId);
      } else if (state === 'connected' && this.state.activeOrigin) {
        // Clicking a connected dot as target
        this.connectDots(this.state.activeOrigin, dotId);
      }
    });

    this.svg.addEventListener('mouseover', (e) => {
      const dotEl = e.target.closest('.map-dot');
      if (!dotEl) return;

      const dotId = dotEl.dataset.dotId;
      if (this.state.activeOrigin) {
        const nextDotId = this.getNextDotId(this.state.activeOrigin);
        if (dotId === nextDotId) {
          dotEl.style.filter = 'drop-shadow(0 0 16px var(--amber-warn))';
        }
      }
    });

    this.svg.addEventListener('mouseout', (e) => {
      const dotEl = e.target.closest('.map-dot');
      if (!dotEl) return;
      dotEl.style.filter = '';
    });
  }

  selectOriginDot(dotId) {
    this.state.activeOrigin = dotId;
    window.dispatchEvent(new CustomEvent('originSelected', { detail: { dotId } }));
  }

  getNextDotId(currentDotId) {
    const currentIndex = this.state.dots.indexOf(currentDotId);
    if (currentIndex >= 0 && currentIndex < this.state.dots.length - 1) {
      return this.state.dots[currentIndex + 1];
    }
    return null;
  }

  connectDots(fromId, toId) {
    const nextDot = this.getNextDotId(fromId);
    if (toId !== nextDot) {
      return; // Only allow sequential connections
    }

    // Add to connected pairs
    this.state.connectedPairs.push({ from: fromId, to: toId });
    this.state.dotStates[toId] = 'connected';

    // Find next ready dot
    const toIndex = this.state.dots.indexOf(toId);
    if (toIndex < this.state.dots.length - 1) {
      const nextId = this.state.dots[toIndex + 1];
      this.state.dotStates[nextId] = 'ready';
    }

    this.state.activeOrigin = null;
    this.redraw();

    // Notify main app
    const nextChapter = chapters.find(c => c.dot === toId);
    window.dispatchEvent(new CustomEvent('chapterConnected', { detail: { chapterId: nextChapter.id } }));
  }

  redraw() {
    this.drawMap();
    this.attachDotListeners();
  }

  setupMouseTracking() {
    this.svg.addEventListener('mousemove', (e) => {
      if (!this.state.activeOrigin) return;

      const rect = this.svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Preview line to next dot
      const nextDotId = this.getNextDotId(this.state.activeOrigin);
      if (nextDotId) {
        const origin = this.getPixelPosition(this.state.activeOrigin);
        const target = this.getPixelPosition(nextDotId);

        // Draw preview line (dashed, amber)
        const previews = this.svg.querySelectorAll('[data-preview-line]');
        previews.forEach(p => p.remove());

        const svg = rough.svg(this.svg);
        const previewLine = svg.line(origin.px, origin.py, x, y, {
          stroke: '#C97D10',
          strokeWidth: 1.5,
          strokeLineDash: [4, 4],
          roughness: 1
        });
        previewLine.setAttribute('data-preview-line', 'true');
        previewLine.style.pointerEvents = 'none';
        this.svg.appendChild(previewLine);
      }
    });

    this.svg.addEventListener('mouseleave', () => {
      const previews = this.svg.querySelectorAll('[data-preview-line]');
      previews.forEach(p => p.remove());
    });
  }
}
