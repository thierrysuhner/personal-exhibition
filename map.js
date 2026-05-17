class RouteMap {
  constructor(restoredConnectedDots = []) {
    this.svg = document.getElementById('map-svg');
    this.state = {
      dots: ['CH-LENZ', 'CH-ARMY', 'CH-HSG', 'CA-VAN', 'CH-GOOG'],
      dotStates: {
        'CH-LENZ': 'ready',
        'CH-ARMY': 'locked',
        'CH-HSG': 'locked',
        'CA-VAN': 'locked',
        'CH-GOOG': 'locked'
      },
      connectedPairs: [],
      activeOrigin: null,
      previewLine: null
    };

    if (restoredConnectedDots.length > 1) {
      this.applyRestoredState(restoredConnectedDots);
    }

    this.init();
  }

  applyRestoredState(connectedChapterIds) {
    for (let i = 1; i < connectedChapterIds.length; i++) {
      const fromDot = chapters.find(c => c.id === connectedChapterIds[i - 1])?.dot;
      const toDot   = chapters.find(c => c.id === connectedChapterIds[i])?.dot;
      if (fromDot && toDot) {
        this.state.connectedPairs.push({ from: fromDot, to: toDot });
        this.state.dotStates[toDot] = 'connected';
      }
    }

    const lastDot = chapters.find(c => c.id === connectedChapterIds[connectedChapterIds.length - 1])?.dot;
    if (lastDot) {
      const idx = this.state.dots.indexOf(lastDot);
      if (idx >= 0 && idx < this.state.dots.length - 1) {
        this.state.dotStates[this.state.dots[idx + 1]] = 'ready';
      }
    }
  }

  init() {
    this.drawMap();
    this.attachDotListeners();
    this.setupMouseTracking();
  }

  drawMap() {
    this.svg.innerHTML = '';

    const viewBox = this.svg.viewBox.baseVal;

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', 0);
    bg.setAttribute('y', 0);
    bg.setAttribute('width', viewBox.width);
    bg.setAttribute('height', viewBox.height);
    bg.setAttribute('fill', '#050e1c');
    this.svg.appendChild(bg);

    const grid = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    grid.setAttribute('stroke', 'rgba(0,180,255,0.06)');
    grid.setAttribute('stroke-width', '0.5');
    for (let y = 60; y < viewBox.height; y += 60) {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', 0); l.setAttribute('y1', y);
      l.setAttribute('x2', viewBox.width); l.setAttribute('y2', y);
      grid.appendChild(l);
    }
    for (let x = 80; x < viewBox.width; x += 80) {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', x); l.setAttribute('y1', 0);
      l.setAttribute('x2', x); l.setAttribute('y2', viewBox.height);
      grid.appendChild(l);
    }
    this.svg.appendChild(grid);

    const mapBase = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    mapBase.setAttribute('x', 5);
    mapBase.setAttribute('y', 5);
    mapBase.setAttribute('width', viewBox.width - 10);
    mapBase.setAttribute('height', viewBox.height - 10);
    mapBase.setAttribute('stroke', 'rgba(0,180,255,0.2)');
    mapBase.setAttribute('stroke-width', 0.5);
    mapBase.setAttribute('fill', 'none');
    this.svg.appendChild(mapBase);

    const hsg = this.getPixelPosition('CH-HSG');
    const van = this.getPixelPosition('CA-VAN');
    const oceanLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    oceanLine.setAttribute('x1', hsg.px);
    oceanLine.setAttribute('y1', hsg.py);
    oceanLine.setAttribute('x2', van.px);
    oceanLine.setAttribute('y2', van.py);
    oceanLine.setAttribute('stroke', 'rgba(0,200,255,0.1)');
    oceanLine.setAttribute('stroke-width', 0.5);
    oceanLine.setAttribute('stroke-dasharray', '3,5');
    this.svg.appendChild(oceanLine);

    for (const pair of this.state.connectedPairs) {
      this.drawConnectedLine(pair.from, pair.to);
    }

    for (const dotId of this.state.dots) {
      this.drawDot(dotId);
    }
  }

  drawDot(dotId) {
    const { px, py } = this.getPixelPosition(dotId);
    const dotState = this.state.dotStates[dotId];
    const chapter = chapters.find(c => c.dot === dotId);

    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `assets/drawings/dot-${chapter.id}.svg`);
    img.setAttribute('x', px - 12);
    img.setAttribute('y', py - 12);
    img.setAttribute('width', 24);
    img.setAttribute('height', 24);
    img.classList.add('map-dot', dotState);
    img.dataset.dotId = dotId;
    if (dotId === 'CH-GOOG') img.dataset.final = 'true';
    img.onerror = () => {
      img.remove();
      this.drawRoughDot(dotId, px, py, dotState);
    };
    this.svg.appendChild(img);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', px);
    label.setAttribute('y', py + 22);
    label.setAttribute('class', `map-label ${dotState}`);
    label.textContent = chapter.dotLabel;
    this.svg.appendChild(label);
  }

  drawRoughDot(dotId, px, py, state) {
    const isFinal = dotId === 'CH-GOOG';
    const color = state === 'locked'    ? 'rgba(0,150,200,0.2)'
                : state === 'connected' ? (isFinal ? '#4285F4' : '#00E676')
                : isFinal               ? '#4285F4'
                :                         '#00BFFF';
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', px);
    dot.setAttribute('cy', py);
    dot.setAttribute('r', 5);
    dot.setAttribute('fill', color);
    dot.setAttribute('stroke', color);
    dot.setAttribute('stroke-width', 1);
    dot.classList.add('map-dot', state);
    dot.dataset.dotId = dotId;
    if (dotId === 'CH-GOOG') dot.dataset.final = 'true';
    this.svg.appendChild(dot);
  }

  drawConnectedLine(fromId, toId) {
    const fromPos = this.getPixelPosition(fromId);
    const toPos   = this.getPixelPosition(toId);

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
  }

  drawRoughLine(fromPos, toPos) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', fromPos.px);
    line.setAttribute('y1', fromPos.py);
    line.setAttribute('x2', toPos.px);
    line.setAttribute('y2', toPos.py);
    line.setAttribute('stroke', '#00E676');
    line.setAttribute('stroke-width', 1.5);
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

      if (this.state.activeOrigin) {
        const nextDotId = this.getNextDotId(this.state.activeOrigin);
        if (dotId === nextDotId) {
          this.connectDots(this.state.activeOrigin, dotId);
        }
      } else if (state === 'ready' || state === 'connected') {
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
          dotEl.style.filter = 'drop-shadow(0 0 16px #C97D10)';
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
    if (toId !== nextDot) return;

    this.state.connectedPairs.push({ from: fromId, to: toId });
    this.state.dotStates[toId] = 'connected';

    const toIndex = this.state.dots.indexOf(toId);
    if (toIndex < this.state.dots.length - 1) {
      this.state.dotStates[this.state.dots[toIndex + 1]] = 'ready';
    }

    this.state.activeOrigin = null;
    this.redraw();

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
      const viewBox = this.svg.viewBox.baseVal;
      const x = (e.clientX - rect.left) * (viewBox.width / rect.width);
      const y = (e.clientY - rect.top) * (viewBox.height / rect.height);

      const nextDotId = this.getNextDotId(this.state.activeOrigin);
      if (nextDotId) {
        const origin = this.getPixelPosition(this.state.activeOrigin);

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
