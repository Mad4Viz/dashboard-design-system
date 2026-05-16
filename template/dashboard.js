/* =====================================================================
   RAW Analytics Dashboard — interactive behaviour
   Lifted from reference/functionality_demo.html. The demo is the source
   of truth (per design_system_spec.md). Don't drift from it.

   Sections (match spec Section 5):
     5.1 Grid overlay
     5.2 Snap to grid
     5.3 Show all dimensions
     5.4 Add component
     5.5 Inline editing
     5.6 Component removal
     5.7 Persistence (localStorage)
     5.8 Padding toggle (16 / 24)
   ===================================================================== */

/* === 0. READ LAYOUT CONSTANTS FROM CSS === */
const root = getComputedStyle(document.documentElement);
const num = (name) => parseInt(root.getPropertyValue(name).trim(), 10);

const colCount      = num('--col-count');
const colWidth      = num('--col-width');
const colGutter     = num('--col-gutter');
const sidebarWidth  = num('--sidebar-width');
const sidebarInset  = 24;
const colLeftOffset = sidebarWidth + sidebarInset;
const rowHeight     = num('--row-height');
const rowGutter     = num('--row-gutter');
const rowCycle      = rowHeight + rowGutter;
const snapThresh    = num('--snap-threshold');
const canvasWidth   = num('--canvas-width');
const canvasHeight  = num('--canvas-height');
const rightMargin   = 24;

const colMathTotal = sidebarWidth + sidebarInset
                   + (colCount * colWidth)
                   + ((colCount - 1) * colGutter)
                   + rightMargin;
const colMathOK = (colMathTotal === canvasWidth);

/* === SNAP TARGETS === */
function columnLeftPositions() {
  const xs = [];
  for (let i = 0; i < colCount; i++) xs.push(colLeftOffset + i * (colWidth + colGutter));
  return xs;
}
function columnRightPositions() {
  const xs = [];
  for (let i = 0; i < colCount; i++) xs.push(colLeftOffset + i * (colWidth + colGutter) + colWidth);
  return xs;
}
function allColumnEdges() {
  return [...columnLeftPositions(), ...columnRightPositions(), canvasWidth - rightMargin];
}
function ySnapPositions() {
  const ys = [];
  const maxPx = canvasHeight + 32;
  for (let y = 0; y <= maxPx; y += 8) ys.push(y);
  return ys;
}

const canvas = document.getElementById('canvas');

/* === 5.1 GRID OVERLAY === */
document.getElementById('toggle-grid').addEventListener('change', (e) => {
  canvas.setAttribute('data-grid-visible', e.target.checked);
  updateValuesPanel();
});

/* === 5.2 SNAP === */
document.getElementById('toggle-snap').addEventListener('change', (e) => {
  canvas.setAttribute('data-snap-enabled', e.target.checked);
  updateValuesPanel();
});
function snapToNearest(value, lines, threshold) {
  let best = value;
  let bestDist = threshold + 1;
  for (const line of lines) {
    const d = Math.abs(line - value);
    if (d <= threshold && d < bestDist) { best = line; bestDist = d; }
  }
  return best;
}
function isSnapOn() {
  return canvas.getAttribute('data-snap-enabled') === 'true';
}

/* === GAP SNAP HELPERS ===
   The grid gutter is the "true" spacing constant — we snap card edges so the
   gap to the nearest neighbor (or canvas inner edge) lands on a multiple of
   that gutter (24, 48, 72 ...), and flag it visually à la Figma. */

function readGutter(axis) {
  // Always re-read so changes to the grid system are picked up live.
  return num(axis === 'x' ? '--col-gutter' : '--row-gutter');
}
function canvasInner() {
  return {
    left:   colLeftOffset,
    right:  canvasWidth - rightMargin,
    top:    num('--header-height') + 28,        // content top (matches CP1 start)
    bottom: canvasHeight - rightMargin
  };
}
function rectOf(el) {
  const l = parseInt(el.style.left, 10) || 0;
  const t = parseInt(el.style.top, 10)  || 0;
  return { left: l, top: t, right: l + el.offsetWidth, bottom: t + el.offsetHeight,
           width: el.offsetWidth, height: el.offsetHeight };
}
function otherRects(skipEl) {
  return [...document.querySelectorAll('.component')]
    .filter(c => c !== skipEl)
    .map(rectOf);
}

/* For a given side of a moving rect, return the nearest neighbor edge it can
   measure a gap against, restricted to overlapping cards on the perpendicular
   axis (otherwise the gap is meaningless). Falls back to canvas inner edge. */
function nearestEdge(rect, side, others) {
  const inner = canvasInner();
  let nearest = null;
  let dist = Infinity;
  const horizontal = (side === 'left' || side === 'right');

  for (const o of others) {
    if (horizontal) {
      const overlap = !(o.bottom <= rect.top || o.top >= rect.bottom);
      if (!overlap) continue;
      if (side === 'left' && o.right <= rect.left) {
        const d = rect.left - o.right;
        if (d < dist) { dist = d; nearest = { edge: o.right, perpStart: Math.max(rect.top, o.top), perpEnd: Math.min(rect.bottom, o.bottom) }; }
      }
      if (side === 'right' && o.left >= rect.right) {
        const d = o.left - rect.right;
        if (d < dist) { dist = d; nearest = { edge: o.left, perpStart: Math.max(rect.top, o.top), perpEnd: Math.min(rect.bottom, o.bottom) }; }
      }
    } else {
      const overlap = !(o.right <= rect.left || o.left >= rect.right);
      if (!overlap) continue;
      if (side === 'top' && o.bottom <= rect.top) {
        const d = rect.top - o.bottom;
        if (d < dist) { dist = d; nearest = { edge: o.bottom, perpStart: Math.max(rect.left, o.left), perpEnd: Math.min(rect.right, o.right) }; }
      }
      if (side === 'bottom' && o.top >= rect.bottom) {
        const d = o.top - rect.bottom;
        if (d < dist) { dist = d; nearest = { edge: o.top, perpStart: Math.max(rect.left, o.left), perpEnd: Math.min(rect.right, o.right) }; }
      }
    }
  }
  // Canvas inner edge fallback (only if closer / no neighbor found)
  let edgeVal, perpStart, perpEnd;
  if (side === 'left')   { edgeVal = inner.left;   perpStart = rect.top;  perpEnd = rect.bottom; }
  if (side === 'right')  { edgeVal = inner.right;  perpStart = rect.top;  perpEnd = rect.bottom; }
  if (side === 'top')    { edgeVal = inner.top;    perpStart = rect.left; perpEnd = rect.right; }
  if (side === 'bottom') { edgeVal = inner.bottom; perpStart = rect.left; perpEnd = rect.right; }
  const movingEdge = rect[side];
  const edgeDist = (side === 'left' || side === 'top') ? movingEdge - edgeVal : edgeVal - movingEdge;
  if (edgeDist >= 0 && edgeDist < dist) {
    dist = edgeDist;
    nearest = { edge: edgeVal, perpStart, perpEnd, isCanvasEdge: true };
  }
  return nearest ? { ...nearest, gap: dist } : null;
}

/* Given a proposed edge position, find the nearest position that yields a
   gap equal to N * gutter against the nearest neighbor on that side. Returns
   the snapped edge, or the original if no neighbor or out of threshold.

   Only snaps against OTHER COMPONENTS, never the canvas inner edge — column
   snap already handles canvas-edge alignment, and matching against a far
   canvas edge with k=37 (etc) pulls cards off the column grid.

   Also caps k at 3 (max gap = 3×gutter = 72px): beyond that the gap stops
   being a meaningful "spacing" relationship — it's just coincidence with a
   far-away card — and snapping to it pulls the moving card off-grid. */
const MAX_GAP_K = 3;
function snapEdgeToGutterGap(rect, side, proposedEdge, others) {
  const gutter = readGutter(side === 'left' || side === 'right' ? 'x' : 'y');
  const probe = { ...rect, [side]: proposedEdge };
  if (side === 'right')  probe.width  = probe.right  - probe.left;
  if (side === 'bottom') probe.height = probe.bottom - probe.top;
  const nb = nearestEdge(probe, side, others);
  if (!nb || nb.isCanvasEdge) return proposedEdge;
  const sign = (side === 'left' || side === 'top') ? +1 : -1;
  const currentGap = sign * (proposedEdge - nb.edge);
  if (currentGap < 0) return proposedEdge;
  const k = Math.round(currentGap / gutter);
  if (k > MAX_GAP_K) return proposedEdge;
  const targetGap = k * gutter;
  if (Math.abs(currentGap - targetGap) <= snapThresh && targetGap >= 0) {
    return nb.edge + sign * targetGap;
  }
  return proposedEdge;
}

/* === EDGE-ALIGNMENT SNAP ===
   Snap moving edges to sibling edges along the same axis (left-to-left,
   right-to-right, top-to-top, bottom-to-bottom). Returns the snapped X (or
   Y) plus which alignment lines fired, for rendering guides. */
function siblingEdgeLines(others) {
  return {
    x: others.flatMap(o => [o.left, o.right]),
    y: others.flatMap(o => [o.top, o.bottom])
  };
}
function snapEdgesToSiblings(probe, others) {
  const { x: xLines, y: yLines } = siblingEdgeLines(others);
  const out = { left: probe.left, top: probe.top, w: probe.width, h: probe.height,
                guidesX: [], guidesY: [] };
  // Snap left OR right edge to sibling X lines.
  const sL = snapToNearest(probe.left,               xLines, snapThresh);
  const sR = snapToNearest(probe.left + probe.width, xLines, snapThresh);
  if (sL !== probe.left)                    out.left = sL;
  else if (sR !== probe.left + probe.width) out.left = sR - probe.width;
  // Snap top OR bottom edge to sibling Y lines.
  const sT = snapToNearest(probe.top,                yLines, snapThresh);
  const sB = snapToNearest(probe.top + probe.height, yLines, snapThresh);
  if (sT !== probe.top)                     out.top = sT;
  else if (sB !== probe.top + probe.height) out.top = sB - probe.height;
  // Emit guides for EVERY edge currently sitting on a sibling line —
  // independent of whether snap moved it (column-snap may have already
  // landed on a sibling-matching value).
  if (xLines.includes(out.left))            out.guidesX.push(out.left);
  if (xLines.includes(out.left + out.w))    out.guidesX.push(out.left + out.w);
  if (yLines.includes(out.top))             out.guidesY.push(out.top);
  if (yLines.includes(out.top + out.h))     out.guidesY.push(out.top + out.h);
  return out;
}

/* === ALIGNMENT GUIDE OVERLAY === */
function clearGuides() {
  flagLayer().querySelectorAll('.alignment-guide').forEach(n => n.remove());
}
function drawGuide(orient, coord, fromCoord, toCoord) {
  const layer = flagLayer();
  const g = document.createElement('div');
  g.className = 'alignment-guide alignment-guide--' + orient;
  if (orient === 'v') {
    g.style.left = (coord - 0.5) + 'px';
    g.style.top = fromCoord + 'px';
    g.style.height = (toCoord - fromCoord) + 'px';
  } else {
    g.style.top = (coord - 0.5) + 'px';
    g.style.left = fromCoord + 'px';
    g.style.width = (toCoord - fromCoord) + 'px';
  }
  layer.appendChild(g);
}
function renderGuides(rect, others, guidesX, guidesY) {
  clearGuides();
  for (const x of guidesX) {
    // Find vertical extent: from min top to max bottom of moving rect + every aligned sibling
    let minY = rect.top, maxY = rect.bottom;
    for (const o of others) {
      if (o.left === x || o.right === x) { minY = Math.min(minY, o.top); maxY = Math.max(maxY, o.bottom); }
    }
    drawGuide('v', x, minY, maxY);
  }
  for (const y of guidesY) {
    let minX = rect.left, maxX = rect.right;
    for (const o of others) {
      if (o.top === y || o.bottom === y) { minX = Math.min(minX, o.left); maxX = Math.max(maxX, o.right); }
    }
    drawGuide('h', y, minX, maxX);
  }
}

/* === SPACING FLAG OVERLAY === */
function flagLayer() {
  let l = canvas.querySelector('.spacing-flag-layer');
  if (!l) {
    l = document.createElement('div');
    l.className = 'spacing-flag-layer';
    canvas.appendChild(l);
  }
  return l;
}
function clearFlags() {
  const l = canvas.querySelector('.spacing-flag-layer');
  if (l) l.innerHTML = '';
}
function drawFlag(side, rect, nb) {
  const layer = flagLayer();
  const gap = nb.gap;
  if (gap <= 0) return;
  const horizontal = (side === 'left' || side === 'right');
  const f = document.createElement('div');
  f.className = 'spacing-flag spacing-flag--' + (horizontal ? 'h' : 'v');

  if (horizontal) {
    const x1 = (side === 'left')  ? nb.edge : rect.right;
    const x2 = (side === 'left')  ? rect.left : nb.edge;
    const yMid = (nb.perpStart + nb.perpEnd) / 2;
    f.style.left   = x1 + 'px';
    f.style.top    = (yMid - 6) + 'px';
    f.style.width  = (x2 - x1) + 'px';
    f.style.height = '12px';
  } else {
    const y1 = (side === 'top') ? nb.edge : rect.bottom;
    const y2 = (side === 'top') ? rect.top : nb.edge;
    const xMid = (nb.perpStart + nb.perpEnd) / 2;
    f.style.top    = y1 + 'px';
    f.style.left   = (xMid - 6) + 'px';
    f.style.height = (y2 - y1) + 'px';
    f.style.width  = '12px';
  }

  const line = document.createElement('div'); line.className = 'spacing-flag-line';
  const cs   = document.createElement('div'); cs.className = 'spacing-flag-cap spacing-flag-cap--start';
  const ce   = document.createElement('div'); ce.className = 'spacing-flag-cap spacing-flag-cap--end';
  const pill = document.createElement('div'); pill.className = 'spacing-flag-pill'; pill.textContent = String(gap);
  f.appendChild(line); f.appendChild(cs); f.appendChild(ce); f.appendChild(pill);
  layer.appendChild(f);
}

/* Re-render all gutter-multiple flags around a moving/resizing element. */
function renderFlagsFor(el, sides) {
  clearFlags();
  const rect = rectOf(el);
  const others = otherRects(el);
  const gx = readGutter('x'), gy = readGutter('y');
  for (const side of sides) {
    const nb = nearestEdge(rect, side, others);
    if (!nb) continue;
    if (nb.isCanvasEdge) continue;   // only flag gaps to other components
    const gutter = (side === 'left' || side === 'right') ? gx : gy;
    if (gutter <= 0) continue;
    if (nb.gap <= 0) continue;
    // Cap k same as gap-snap so we never flag a 312px / 888px coincidence.
    const k = Math.round(nb.gap / gutter);
    if (k > MAX_GAP_K) continue;
    if (Math.abs(nb.gap - k * gutter) > 0.5) continue;
    drawFlag(side, rect, nb);
  }
}

/* === DRAG === */
function makeDraggable(el) {
  el.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('dim-label')) return;
    if (e.target.classList.contains('resize-handle')) return;
    if (e.target.classList.contains('remove-handle')) return;
    if (e.target.isContentEditable) return;
    e.preventDefault();

    const startX    = e.clientX;
    const startY    = e.clientY;
    const startLeft = parseInt(el.style.left, 10);
    const startTop  = parseInt(el.style.top, 10);
    const leftSnap  = columnLeftPositions();
    const rowSnap   = ySnapPositions();
    const others    = otherRects(el);
    const w         = el.offsetWidth;
    const h         = el.offsetHeight;

    function onMove(ev) {
      let newLeft = startLeft + (ev.clientX - startX);
      let newTop  = startTop  + (ev.clientY - startY);
      let guidesX = [], guidesY = [];
      if (isSnapOn()) {
        // 1. Column / row snap (the global grid)
        newLeft = snapToNearest(newLeft, leftSnap, snapThresh);
        newTop  = snapToNearest(newTop,  rowSnap, snapThresh);
        // 2. Edge-alignment snap (to sibling edges) — Figma-style guides
        const probe = { left: newLeft, top: newTop, width: w, height: h };
        const aligned = snapEdgesToSiblings(probe, others);
        newLeft = aligned.left; newTop = aligned.top;
        guidesX = aligned.guidesX; guidesY = aligned.guidesY;
        // 3. Gutter-multiple gap snap on every side
        const probe2 = { left: newLeft, top: newTop, right: newLeft + w, bottom: newTop + h, width: w, height: h };
        const sL = snapEdgeToGutterGap(probe2, 'left',   newLeft,        others);
        const sR = snapEdgeToGutterGap(probe2, 'right',  newLeft + w,    others);
        const sT = snapEdgeToGutterGap(probe2, 'top',    newTop,         others);
        const sB = snapEdgeToGutterGap(probe2, 'bottom', newTop + h,     others);
        if (sL !== newLeft) newLeft = sL;
        else if (sR !== newLeft + w) newLeft = sR - w;
        if (sT !== newTop) newTop = sT;
        else if (sB !== newTop + h) newTop = sB - h;
      }
      el.style.left = newLeft + 'px';
      // Bottom boundary: card can't extend past the canvas inner bottom.
      const maxTop = canvasInner().bottom - h;
      if (newTop > maxTop) newTop = maxTop;
      el.style.top  = newTop  + 'px';
      updateDimLabel(el);
      const finalRect = { left: newLeft, top: newTop, right: newLeft + w, bottom: newTop + h, width: w, height: h };
      renderFlagsFor(el, ['left', 'right', 'top', 'bottom']);
      renderGuides(finalRect, others, guidesX, guidesY);
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      clearFlags();
      clearGuides();
      // Final snap on drop — but only force column alignment if the card
      // isn't *already* aligned to something else (sibling edge or
      // gutter-multiple gap). Without this guard, a user who carefully lined
      // up the RIGHT edge would get yanked back to a column by their LEFT
      // edge, breaking the alignment they just set up.
      if (isSnapOn()) {
        const curLeft = parseInt(el.style.left, 10) || 0;
        const curTop  = parseInt(el.style.top, 10)  || 0;
        const othersNow = otherRects(el);
        const { x: xLines, y: yLines } = siblingEdgeLines(othersNow);
        const gx = readGutter('x'), gy = readGutter('y');

        // X-axis alignment check
        const xOnCol      = leftSnap.includes(curLeft);
        const xOnSibling  = xLines.includes(curLeft) || xLines.includes(curLeft + w);
        const gapMultipleX = (gap) => gap > 0 && Math.abs(gap - Math.round(gap / gx) * gx) < 0.5;
        const probeX = { left: curLeft, top: curTop, right: curLeft + w, bottom: curTop + h, width: w, height: h };
        const nbL = nearestEdge(probeX, 'left',  othersNow);
        const nbR = nearestEdge(probeX, 'right', othersNow);
        const xOnGap = (nbL && !nbL.isCanvasEdge && gapMultipleX(nbL.gap))
                    || (nbR && !nbR.isCanvasEdge && gapMultipleX(nbR.gap));
        const xAligned = xOnCol || xOnSibling || xOnGap;

        if (!xAligned) {
          const nearestCol = leftSnap.reduce((a, b) =>
            Math.abs(b - curLeft) < Math.abs(a - curLeft) ? b : a, leftSnap[0]);
          el.style.left = nearestCol + 'px';
        }

        // Y-axis alignment check — analogous
        const yOn8        = (curTop % 8 === 0);
        const yOnSibling  = yLines.includes(curTop) || yLines.includes(curTop + h);
        const gapMultipleY = (gap) => gap > 0 && Math.abs(gap - Math.round(gap / gy) * gy) < 0.5;
        const probeY = { left: curLeft, top: curTop, right: curLeft + w, bottom: curTop + h, width: w, height: h };
        const nbT = nearestEdge(probeY, 'top',    othersNow);
        const nbB = nearestEdge(probeY, 'bottom', othersNow);
        const yOnGap = (nbT && !nbT.isCanvasEdge && gapMultipleY(nbT.gap))
                    || (nbB && !nbB.isCanvasEdge && gapMultipleY(nbB.gap));
        const yAligned = (yOn8 && (yOnSibling || yOnGap)) || (yOn8 && !nbT && !nbB);
        // Always round Y to 8 px if not aligned to anything stronger.
        if (!yOnSibling && !yOnGap) {
          const nearestRow = Math.round(curTop / 8) * 8;
          el.style.top = Math.max(0, Math.min(canvasInner().bottom - h, nearestRow)) + 'px';
        }

        updateDimLabel(el);
      }
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

/* === RESIZE (4 corners) === */
function makeResizable(el) {
  // Clean any prior handles (single old handle from HTML, or our 4 corners).
  el.querySelectorAll('.resize-handle').forEach(h => h.remove());
  ['nw', 'ne', 'sw', 'se'].forEach(corner => {
    const h = document.createElement('span');
    h.className = 'resize-handle resize-handle--' + corner;
    h.dataset.corner = corner;
    el.appendChild(h);
    h.addEventListener('mousedown', (e) => startResize(e, el, corner));
  });
}

function startResize(e, el, corner) {
  e.stopPropagation();
  e.preventDefault();

  const startX    = e.clientX;
  const startY    = e.clientY;
  const startW    = el.offsetWidth;
  const startH    = el.offsetHeight;
  const startLeft = parseInt(el.style.left, 10);
  const startTop  = parseInt(el.style.top, 10);
  const others    = otherRects(el);

  const dragsLeft = (corner === 'nw' || corner === 'sw');
  const dragsTop  = (corner === 'nw' || corner === 'ne');
  const sidesShown = [];
  if (dragsLeft) sidesShown.push('left'); else sidesShown.push('right');
  if (dragsTop)  sidesShown.push('top');  else sidesShown.push('bottom');

  function onMove(ev) {
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;

    let newLeft = startLeft, newTop = startTop;
    let newW = startW, newH = startH;
    if (dragsLeft) { newLeft = startLeft + dx; newW = startW - dx; }
    else           { newW = startW + dx; }
    if (dragsTop)  { newTop  = startTop  + dy; newH = startH - dy; }
    else           { newH = startH + dy; }

    let guidesX = [], guidesY = [];
    if (isSnapOn()) {
      // Edge-alignment snap: the moving edge snaps to sibling edges.
      const { x: xLines, y: yLines } = siblingEdgeLines(others);
      if (dragsLeft) {
        const sL = snapToNearest(newLeft, xLines, snapThresh);
        if (sL !== newLeft) { newW = (newLeft + newW) - sL; newLeft = sL; guidesX.push(sL); }
      } else {
        const sR = snapToNearest(newLeft + newW, xLines, snapThresh);
        if (sR !== newLeft + newW) { newW = sR - newLeft; guidesX.push(sR); }
      }
      if (dragsTop) {
        const sT = snapToNearest(newTop, yLines, snapThresh);
        if (sT !== newTop) { newH = (newTop + newH) - sT; newTop = sT; guidesY.push(sT); }
      } else {
        const sB = snapToNearest(newTop + newH, yLines, snapThresh);
        if (sB !== newTop + newH) { newH = sB - newTop; guidesY.push(sB); }
      }
      // Gap snap to gutter multiples (against actual neighbors only).
      const probe = { left: newLeft, top: newTop, right: newLeft + newW, bottom: newTop + newH, width: newW, height: newH };
      if (dragsLeft) {
        const sL = snapEdgeToGutterGap(probe, 'left',  newLeft, others);
        if (sL !== newLeft) { newW = (newLeft + newW) - sL; newLeft = sL; }
      } else {
        const sR = snapEdgeToGutterGap(probe, 'right', newLeft + newW, others);
        if (sR !== newLeft + newW) { newW = sR - newLeft; }
      }
      if (dragsTop) {
        const sT = snapEdgeToGutterGap(probe, 'top', newTop, others);
        if (sT !== newTop) { newH = (newTop + newH) - sT; newTop = sT; }
      } else {
        const sB = snapEdgeToGutterGap(probe, 'bottom', newTop + newH, others);
        if (sB !== newTop + newH) { newH = sB - newTop; }
      }
    }

    // Min size — clamp WITHOUT moving the opposing edge.
    if (newW < 60) {
      if (dragsLeft) newLeft = (startLeft + startW) - 60;
      newW = 60;
    }
    if (newH < 40) {
      if (dragsTop) newTop = (startTop + startH) - 40;
      newH = 40;
    }
    // Bottom boundary: when resizing from a bottom corner, can't pass the
    // canvas inner bottom.
    if (!dragsTop) {
      const maxBottom = canvasInner().bottom;
      if (newTop + newH > maxBottom) newH = maxBottom - newTop;
    }

    el.style.left   = newLeft + 'px';
    el.style.top    = newTop  + 'px';
    el.style.width  = newW    + 'px';
    el.style.height = newH    + 'px';
    updateDimLabel(el);
    const finalRect = { left: newLeft, top: newTop, right: newLeft + newW, bottom: newTop + newH, width: newW, height: newH };
    renderFlagsFor(el, sidesShown);
    renderGuides(finalRect, others, guidesX, guidesY);
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    clearFlags();
    clearGuides();
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

/* === 5.3 DIMENSION LABELS === */
function updateDimLabel(el) {
  const label = el.querySelector('.dim-label');
  if (!label) return;
  const x = parseInt(el.style.left, 10) || 0;
  const y = parseInt(el.style.top, 10)  || 0;
  label.innerHTML =
    '<span class="dim-label-dims">' + el.offsetWidth + ' × ' + el.offsetHeight + '</span>' +
    '<span class="dim-label-pos">x ' + x + ', y ' + y + '</span>';
}
function setAllDimsVisible(visible) {
  document.querySelectorAll('.component').forEach(c => {
    c.setAttribute('data-dims-visible', visible);
    updateDimLabel(c);
  });
}
document.getElementById('toggle-dims').addEventListener('change', (e) => {
  canvas.setAttribute('data-dims-visible-all', e.target.checked);
  setAllDimsVisible(e.target.checked);
  updateValuesPanel();
});

/* === 5.8 PADDING (master on/off + presets + custom number) ===
   When OFF: components use the baseline 16px (KPI stays locked at 24).
   When ON:  components use the value picked via presets or the number input. */
const PADDING_BASELINE = 16;
let paddingChoice = 16;   // last user-picked value while toggle is on

function applyPaddingState() {
  const enabled = document.getElementById('toggle-padding').checked;
  const n = enabled ? paddingChoice : PADDING_BASELINE;
  canvas.style.setProperty('--component-padding', n + 'px');
  canvas.setAttribute('data-padding', String(n));
  canvas.setAttribute('data-padding-enabled', String(enabled));
  document.querySelector('.tweak-row--stacked').classList.toggle('is-disabled', !enabled);
  syncPaddingControls(paddingChoice);
}
function syncPaddingControls(n) {
  const inp = document.getElementById('input-padding');
  if (inp && document.activeElement !== inp) inp.value = n;
  document.querySelectorAll('input[name="padding-preset"]').forEach(r => {
    r.checked = (parseInt(r.value, 10) === n);
  });
}
function setPaddingChoice(v) {
  const n = Math.max(0, Math.min(200, parseInt(v, 10) || 0));
  paddingChoice = n;
  applyPaddingState();
}
/* Back-compat hook for loadState (it still calls applyPadding). */
function applyPadding(v) { setPaddingChoice(v); return paddingChoice; }

document.getElementById('toggle-padding').addEventListener('change', () => {
  applyPaddingState();
  updateValuesPanel();
});
document.getElementById('input-padding').addEventListener('input', (e) => {
  setPaddingChoice(e.target.value);
  updateValuesPanel();
});
document.querySelectorAll('input[name="padding-preset"]').forEach(r => {
  r.addEventListener('change', (e) => {
    setPaddingChoice(e.target.value);
    updateValuesPanel();
  });
});

/* === PERSISTENCE (5.7) === */
const STORAGE_KEY = 'raw_dashboard.v1';

function saveState() {
  const state = {
    toggles: {
      grid: canvas.getAttribute('data-grid-visible'),
      snap: canvas.getAttribute('data-snap-enabled'),
      dims: canvas.getAttribute('data-dims-visible-all'),
      padding: paddingChoice,
      paddingEnabled: document.getElementById('toggle-padding').checked
    },
    components: {},
    extras: [],
    removed: []
  };
  document.querySelectorAll('.component[data-component-id]').forEach(el => {
    const id = el.getAttribute('data-component-id');
    state.components[id] = {
      left:   el.style.left,
      top:    el.style.top,
      width:  el.style.width,
      height: el.style.height
    };
    const titleEl    = el.querySelector('.chart-title, .card-title');
    const subtitleEl = el.querySelector('.chart-subtitle, .card-subtitle:not(.kpi-delta)');
    if (titleEl)    state.components[id].title    = titleEl.textContent;
    if (subtitleEl) state.components[id].subtitle = subtitleEl.textContent;

    if (el.getAttribute('data-extra') === 'true') {
      state.extras.push({
        id: id,
        title:    titleEl    ? titleEl.textContent    : 'Component',
        subtitle: subtitleEl ? subtitleEl.textContent : ''
      });
    }
  });
  BASELINE_IDS.forEach(baselineId => {
    if (!document.querySelector('[data-component-id="' + baselineId + '"]')) {
      state.removed.push(baselineId);
    }
  });
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) {}
}

function loadState() {
  let raw;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { return; }
  if (!raw) return;
  let state;
  try { state = JSON.parse(raw); } catch (e) { return; }

  if (state.toggles) {
    const apply = (boxId, attr, val) => {
      if (val == null) return;
      const checked = (val === 'true');
      const cb = document.getElementById(boxId);
      if (cb) cb.checked = checked;
      canvas.setAttribute(attr, val);
    };
    apply('toggle-grid', 'data-grid-visible',     state.toggles.grid);
    apply('toggle-snap', 'data-snap-enabled',     state.toggles.snap);
    apply('toggle-dims', 'data-dims-visible-all', state.toggles.dims);
    if (state.toggles.dims === 'true') setAllDimsVisible(true);
    if (state.toggles.padding != null) {
      paddingChoice = Math.max(0, Math.min(200, parseInt(state.toggles.padding, 10) || PADDING_BASELINE));
    }
    if (state.toggles.paddingEnabled != null) {
      document.getElementById('toggle-padding').checked = !!state.toggles.paddingEnabled;
    }
    applyPaddingState();
  }
  if (Array.isArray(state.extras)) {
    state.extras.forEach(extra => {
      if (!document.querySelector('[data-component-id="' + extra.id + '"]')) {
        const title    = extra.title    || extra.label || 'Component';
        const subtitle = extra.subtitle || '';
        createExtraComponent(extra.id, title, subtitle);
      }
    });
  }
  if (Array.isArray(state.removed)) {
    state.removed.forEach(id => {
      const el = document.querySelector('[data-component-id="' + id + '"]');
      if (el) el.remove();
    });
  }
  if (state.components) {
    document.querySelectorAll('.component[data-component-id]').forEach(el => {
      const saved = state.components[el.getAttribute('data-component-id')];
      if (!saved) return;
      if (saved.left)   el.style.left   = saved.left;
      if (saved.top)    el.style.top    = saved.top;
      if (saved.width)  el.style.width  = saved.width;
      if (saved.height) el.style.height = saved.height;
      if (saved.title != null) {
        const titleEl = el.querySelector('.chart-title, .card-title');
        if (titleEl) titleEl.textContent = saved.title;
      }
      if (saved.subtitle != null) {
        const subtitleEl = el.querySelector('.chart-subtitle, .card-subtitle:not(.kpi-delta)');
        if (subtitleEl) subtitleEl.textContent = saved.subtitle;
      }
    });
    document.querySelectorAll('.component').forEach(updateDimLabel);
  }
}

['toggle-grid', 'toggle-snap', 'toggle-dims', 'toggle-padding'].forEach(id => {
  document.getElementById(id).addEventListener('change', saveState);
});
document.getElementById('input-padding').addEventListener('input', saveState);
document.querySelectorAll('input[name="padding-preset"]').forEach(r => {
  r.addEventListener('change', saveState);
});
document.addEventListener('mouseup', saveState);

document.getElementById('reset-link').addEventListener('click', (e) => {
  e.preventDefault();
  if (confirm('Reset all positions, sizes, and toggle states to defaults?')) {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e2) {}
    location.reload();
  }
});

/* === LOGO ↔ TITLE VERTICAL ALIGN ===
   Always-on. Measures the h1's visual center and shifts the sidebar logo so
   its center matches. Works regardless of font size, padding or canvas scale. */
function applyLogoAlignment() {
  const logo = document.querySelector('.sidebar-logo');
  const h1   = document.querySelector('.header-text h1');
  if (!logo || !h1) return;
  // Reset before measuring so the offset is computed from the baseline.
  logo.style.setProperty('--logo-offset-y', '0px');
  const lr = logo.getBoundingClientRect();
  const hr = h1.getBoundingClientRect();
  // Account for any canvas scaling — convert pixels back to canvas units.
  const combo = document.querySelector('[data-component-id="chart-combo"]');
  const scale = combo ? combo.getBoundingClientRect().width / 564 : 1;
  const offsetPx = ((hr.top + hr.height / 2) - (lr.top + lr.height / 2)) / scale;
  logo.style.setProperty('--logo-offset-y', offsetPx.toFixed(2) + 'px');
}

/* === 5.5 EDITABLE TEXT === */
function makeEditable(field) {
  if (field.dataset.editableWired === 'true') return;
  field.contentEditable = 'true';
  field.addEventListener('mousedown', (e) => e.stopPropagation());
  field.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      field.blur();
    }
  });
  field.addEventListener('blur', saveState);
  field.dataset.editableWired = 'true';
}

/* === 5.6 REMOVE BUTTON === */
const BASELINE_IDS = [
  'kpi-profit', 'kpi-revenue', 'kpi-orders', 'kpi-rcr',
  'chart-grouped-bar', 'chart-multi-line', 'chart-combo', 'chart-ranked'
];

function addRemoveButton(el) {
  if (el.querySelector('.remove-handle')) return;
  const btn = document.createElement('button');
  btn.className = 'remove-handle';
  btn.type = 'button';
  btn.title = 'Remove';
  btn.textContent = '×';
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    el.remove();
    saveState();
  });
  el.appendChild(btn);
}

/* === 5.4 ADD COMPONENT === */
/* Find the first empty column-aligned slot that fits a default-size card.
   Scans top-to-bottom, left-to-right at 8px row steps and column positions,
   so a card lands in a vacated slot before piling up below everything. */
function findDropPosition(w = 270, h = 160) {
  const cols   = columnLeftPositions();
  const inner  = canvasInner();
  const yStart = num('--header-height') + 28;     // top of usable area
  const yEnd   = inner.bottom - h;                // can't extend past bottom
  const others = otherRects();

  for (let y = yStart; y <= yEnd; y += 8) {
    for (const x of cols) {
      if (x + w > inner.right) continue;
      const overlaps = others.some(o =>
        !(x + w <= o.left || x >= o.right || y + h <= o.top || y >= o.bottom)
      );
      if (!overlaps) return { left: x, top: y };
    }
  }
  // No gap found in-view — fall back to below everything, clamped to bottom.
  return { left: cols[0], top: Math.min(yEnd, findDropTop()) };
}

function findDropTop() {
  let maxBottom = num('--header-height');
  document.querySelectorAll('.component').forEach(el => {
    const top = parseInt(el.style.top, 10) || 0;
    const bottom = top + el.offsetHeight;
    if (bottom > maxBottom) maxBottom = bottom;
  });
  const target = maxBottom + 24;
  return Math.ceil(target / 8) * 8;
}
function nextExtraNumber() {
  let max = 0;
  document.querySelectorAll('.component[data-extra="true"] .card-title').forEach(title => {
    const m = title.textContent.match(/Component (\d+)/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  });
  return max + 1;
}
function createExtraComponent(id, title, subtitle) {
  const el = document.createElement('div');
  el.className = 'component extra-card';
  el.setAttribute('data-component-id', id);
  el.setAttribute('data-extra', 'true');
  el.setAttribute('data-dims-visible', canvas.getAttribute('data-dims-visible-all') || 'false');
  el.style.left = '264px';
  el.style.top = '480px';
  el.style.width = '270px';
  el.style.height = '160px';

  const dimLabel = document.createElement('span');
  dimLabel.className = 'dim-label';
  el.appendChild(dimLabel);

  addRemoveButton(el);

  const header = document.createElement('div');
  header.className = 'card-header';
  const titleEl = document.createElement('p');
  titleEl.className = 'card-title';
  titleEl.textContent = title;
  makeEditable(titleEl);
  const subtitleEl = document.createElement('p');
  subtitleEl.className = 'card-subtitle';
  subtitleEl.textContent = subtitle || 'Subtitle';
  makeEditable(subtitleEl);
  header.appendChild(titleEl);
  header.appendChild(subtitleEl);
  el.appendChild(header);

  const handle = document.createElement('span');
  handle.className = 'resize-handle';
  el.appendChild(handle);

  canvas.appendChild(el);
  makeDraggable(el);
  makeResizable(el);
  updateDimLabel(el);
  return el;
}
function addComponent() {
  const id = 'extra-' + Date.now();
  const title = 'Component ' + nextExtraNumber();
  const el = createExtraComponent(id, title, 'Subtitle');
  const pos = findDropPosition(270, 160);
  el.style.left = pos.left + 'px';
  el.style.top  = pos.top  + 'px';
  updateDimLabel(el);
  saveState();
}
document.getElementById('add-component-btn').addEventListener('click', addComponent);

/* === VALUES PANEL === */
function updateValuesPanel() {
  const out = document.getElementById('values-output');
  if (!out) return;
  const lefts = columnLeftPositions();
  const rights = columnRightPositions();
  const passFail = colMathOK
    ? '<span class="pass">[OK]</span>'
    : '<span class="fail">[FAIL]</span>';
  const lines = [
    'Canvas:           ' + canvasWidth + ' x ' + canvasHeight + 'px',
    'Sidebar:          ' + sidebarWidth + 'px',
    'Header:           ' + num('--header-height') + 'px',
    'Columns:          ' + colCount + ' x ' + colWidth + 'px, ' + colGutter + 'px gutter',
    'Col math total:   ' + colMathTotal + 'px  ' + passFail,
    'Col left xs:      ' + lefts.slice(0, 3).join(', ') + ' ... ' + lefts[lefts.length - 1],
    'Col right xs:     ' + rights.slice(0, 3).join(', ') + ' ... ' + rights[rights.length - 1],
    'Row cycle:        ' + rowCycle + 'px (' + rowHeight + ' + ' + rowGutter + ')',
    'Snap threshold:   ' + snapThresh + 'px',
    '',
    'Grid overlay:     ' + canvas.getAttribute('data-grid-visible'),
    'Snap enabled:     ' + canvas.getAttribute('data-snap-enabled'),
    'Dims visible:     ' + canvas.getAttribute('data-dims-visible-all'),
    'Padding:          ' + canvas.getAttribute('data-padding') + 'px'
  ];
  out.innerHTML = lines.join('\n');
}


/* === BOOT === */
function bootDashboard() {
  document.querySelectorAll('.component').forEach(el => {
    addRemoveButton(el);
    makeDraggable(el);
    makeResizable(el);
  });
  document.querySelectorAll('.chart-title, .chart-subtitle, .card-title, .card-subtitle:not(.kpi-delta)')
    .forEach(makeEditable);
  document.querySelectorAll('.component').forEach(updateDimLabel);

  if (typeof renderAllCharts === 'function') renderAllCharts();

  loadState();
  applyLogoAlignment();
  updateValuesPanel();
}
window.addEventListener('DOMContentLoaded', bootDashboard);
