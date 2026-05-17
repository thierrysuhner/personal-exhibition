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

    // Show start instruction only when no connections have been made yet
    if (this.state.connectedPairs.length === 0) {
      this.drawStartInstruction();
    }
  }

  drawStartInstruction() {
    const pos  = this.getPixelPosition('CH-LENZ');
    const px   = pos.px;
    const py   = pos.py;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('data-instruction', 'true');
    g.style.pointerEvents = 'none';

    // Curved arrow pointing at the dot
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrow.setAttribute('d', `M ${px - 38} ${py - 28} Q ${px - 22} ${py - 36} ${px - 8} ${py - 14}`);
    arrow.setAttribute('stroke', 'rgba(0,200,255,0.7)');
    arrow.setAttribute('stroke-width', '1.5');
    arrow.setAttribute('fill', 'none');
    arrow.setAttribute('stroke-dasharray', '3,3');
    arrow.setAttribute('marker-end', 'url(#arrow-head)');
    g.appendChild(arrow);

    // Arrowhead marker (define once)
    if (!this.svg.querySelector('#arrow-head')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <marker id="arrow-head" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(0,200,255,0.7)"/>
        </marker>`;
      this.svg.insertBefore(defs, this.svg.firstChild);
    }

    // "Click here" label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', px - 42);
    text.setAttribute('y', py - 32);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'map-instruction-text');
    text.textContent = 'CLICK TO START';
    g.appendChild(text);

    this.svg.appendChild(g);
  }

  removeStartInstruction() {
    const el = this.svg.querySelector('[data-instruction="true"]');
    if (el) el.remove();
  }

  drawDot(dotId) {
    const { px, py } = this.getPixelPosition(dotId);
    const dotState = this.state.dotStates[dotId];
    const chapter = chapters.find(c => c.dot === dotId);

    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `assets/drawings/dot-${chapter.id}.png`);
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

    // Draw full leg title on the left side with wrapping
    this.drawLegTitleLeft(chapter, px, py, dotState);
  }

  drawLegTitleLeft(chapter, px, py, dotState) {
    const title = chapter.title;
    const maxCharsPerLine = 16;
    let lines = [];

    // Split title into lines that fit the space
    const words = title.split(' ');
    let currentLine = '';
    for (const word of words) {
      if ((currentLine + ' ' + word).length > maxCharsPerLine && currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += (currentLine ? ' ' : '') + word;
      }
    }
    if (currentLine) lines.push(currentLine.trim());

    // Draw each line of the title below the dot
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `leg-title ${dotState}`);

    for (let i = 0; i < lines.length; i++) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', px);
      text.setAttribute('y', py + 32 + (i * 13));
      text.setAttribute('class', 'leg-title-text');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = lines[i];
      g.appendChild(text);
    }

    this.svg.appendChild(g);
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
    svgPath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `assets/drawings/line-${lineNum}-${lineNum + 1}.png`);
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
    this.removeStartInstruction();
    this.state.activeOrigin = dotId;
    this.highlightNextTarget(dotId);
    window.dispatchEvent(new CustomEvent('originSelected', { detail: { dotId } }));
  }

  highlightNextTarget(originDotId) {
    this.clearTargetHighlight();
    const nextDotId = this.getNextDotId(originDotId);
    if (!nextDotId) return;

    // Pulse the next dot in amber
    const dotEl = this.svg.querySelector(`[data-dot-id="${nextDotId}"]`);
    if (dotEl) dotEl.classList.add('target');

    // Draw a "CLICK HERE" label + small bounce arrow near the target dot
    const { px, py } = this.getPixelPosition(nextDotId);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('data-target-hint', 'true');
    g.style.pointerEvents = 'none';

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', px);
    text.setAttribute('y', py - 20);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'map-target-text');
    text.textContent = 'CLICK TO CONNECT';
    g.appendChild(text);

    // Small downward tick mark
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', px);
    tick.setAttribute('y1', py - 14);
    tick.setAttribute('x2', px);
    tick.setAttribute('y2', py - 8);
    tick.setAttribute('stroke', 'rgba(201,125,16,0.85)');
    tick.setAttribute('stroke-width', '1.5');
    g.appendChild(tick);

    this.svg.appendChild(g);
  }

  clearTargetHighlight() {
    // Remove amber class from any previously targeted dot
    this.svg.querySelectorAll('.map-dot.target').forEach(el => el.classList.remove('target'));
    // Remove hint label
    const hint = this.svg.querySelector('[data-target-hint]');
    if (hint) hint.remove();
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
    this.clearTargetHighlight();
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
