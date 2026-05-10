class RouteMap {
  constructor() {
    this.svg = document.getElementById('map-svg');
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

    // Draw map base (rectangle border)
    const viewBox = this.svg.viewBox.baseVal;
    const mapBase = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    mapBase.setAttribute('x', 5);
    mapBase.setAttribute('y', 5);
    mapBase.setAttribute('width', viewBox.width - 10);
    mapBase.setAttribute('height', viewBox.height - 10);
    mapBase.setAttribute('stroke', '#1A1A1A');
    mapBase.setAttribute('stroke-width', 1.5);
    mapBase.setAttribute('fill', 'none');
    this.svg.appendChild(mapBase);

    // Draw ocean crossing (subtle line between CH-HSG and CA-VAN)
    const hsg = this.getPixelPosition('CH-HSG');
    const van = this.getPixelPosition('CA-VAN');
    const oceanLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    oceanLine.setAttribute('x1', hsg.px);
    oceanLine.setAttribute('y1', hsg.py);
    oceanLine.setAttribute('x2', van.px);
    oceanLine.setAttribute('y2', van.py);
    oceanLine.setAttribute('stroke', '#D6E4EE');
    oceanLine.setAttribute('stroke-width', 0.5);
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
    const color = state === 'locked' ? '#999999' : (state === 'ready' ? '#1B4332' : '#1B4332');
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', px);
    dot.setAttribute('cy', py);
    dot.setAttribute('r', 8);
    dot.setAttribute('fill', color);
    dot.setAttribute('stroke', color);
    dot.setAttribute('stroke-width', 1.5);
    dot.classList.add('map-dot', state);
    dot.dataset.dotId = dotId;
    this.svg.appendChild(dot);
  }

  drawConnectedLine(fromId, toId) {
    const fromPos = this.getPixelPosition(fromId);
    const toPos = this.getPixelPosition(toId);

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

    // Fall back to rough line if SVG doesn't load
    fetch(`assets/drawings/line-${lineNum}-${lineNum + 1}.svg`)
      .catch(() => {
        if (svgPath.parentNode) svgPath.remove();
        this.drawRoughLine(fromPos, toPos);
      });
  }

  drawRoughLine(fromPos, toPos) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', fromPos.px);
    line.setAttribute('y1', fromPos.py);
    line.setAttribute('x2', toPos.px);
    line.setAttribute('y2', toPos.py);
    line.setAttribute('stroke', '#1B4332');
    line.setAttribute('stroke-width', 2);
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
      const dotEl = e.target.closest('[data-dot-id]');
      if (!dotEl) return;

      const dotId = dotEl.dataset.dotId;
      const state = this.state.dotStates[dotId];

      // If there's an active origin, try to connect to the next dot
      if (this.state.activeOrigin) {
        const nextDotId = this.getNextDotId(this.state.activeOrigin);
        if (dotId === nextDotId) {
          this.connectDots(this.state.activeOrigin, dotId);
        }
      } else if (state === 'ready' || state === 'connected') {
        // Only select as origin if no origin is currently active
        this.selectOriginDot(dotId);
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

        // Draw preview line (dashed, amber)
        const previews = this.svg.querySelectorAll('[data-preview-line]');
        previews.forEach(p => p.remove());

        const previewLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        previewLine.setAttribute('x1', origin.px);
        previewLine.setAttribute('y1', origin.py);
        previewLine.setAttribute('x2', x);
        previewLine.setAttribute('y2', y);
        previewLine.setAttribute('stroke', '#C97D10');
        previewLine.setAttribute('stroke-width', 1.5);
        previewLine.setAttribute('stroke-dasharray', '4,4');
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
