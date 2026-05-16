/* =====================================================================
   Chart initializers for the RAW Analytics dashboard.

   Each renderer:
     1. Reads the SVG's actual rendered width/height (so the chart sizes
        itself to the current card).
     2. Sets viewBox to match those pixel dimensions, so content uses
        the full space with no preserveAspectRatio letterboxing.
     3. Draws using those dimensions for inner W and H.

   renderAllCharts() also wires a ResizeObserver on each chart card, so
   when the user resizes a component via the corner handle the chart
   re-renders to fit. rAF-batched so drag-resizing stays smooth.

   d3 v7 must be loaded before this script.
   ===================================================================== */

/* ---- Helpers ---- */

/* Read the SVG's rendered size, fall back to sensible defaults if zero. */
function measureSvg(svgEl, fallbackW, fallbackH) {
  const rect = svgEl.getBoundingClientRect();
  const W = Math.max(20, Math.round(rect.width)  || fallbackW);
  const H = Math.max(20, Math.round(rect.height) || fallbackH);
  svgEl.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svgEl.setAttribute('preserveAspectRatio', 'none');
  return { W: W, H: H };
}

function clearSvg(svg) { svg.selectAll('*').remove(); }


/* ---- Chart 2: Grouped horizontal bar (4.3) ---- */
function renderGroupedHorizontalBar(svgId) {
  const svgEl = document.getElementById(svgId);
  if (!svgEl) return;
  const { W, H } = measureSvg(svgEl, 532, 160);
  const svg = d3.select(svgEl);
  clearSvg(svg);

  const data = [
    { category: 'Protein',     value_2025: 2.23e6, value_2024: 2.05e6, delta_pct: 9 },
    { category: 'Pre-Workout', value_2025: 1.63e6, value_2024: 1.50e6, delta_pct: 9 },
    { category: 'Endurance',   value_2025: 0.55e6, value_2024: 0.51e6, delta_pct: 8 },
    { category: 'Recovery',    value_2025: 0.29e6, value_2024: 0.26e6, delta_pct: 11 }
  ];

  const margin = { top: 4, right: 80, bottom: 4, left: 100 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top  - margin.bottom;

  const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const y0 = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([0, innerH])
    .paddingInner(0.25);

  const y1 = d3.scaleBand()
    .domain(['2025', '2024'])
    .range([0, y0.bandwidth()])
    .padding(0.15);

  const xMax = d3.max(data, d => d.value_2025);
  const x = d3.scaleLinear().domain([0, xMax]).range([0, innerW]);

  svg.append('g').selectAll('.cat-label')
    .data(data)
    .join('text')
    .attr('class', 'cat-label')
    .attr('x', 8)
    .attr('y', d => margin.top + y0(d.category) + y0.bandwidth() / 2)
    .attr('dy', '0.32em')
    .text(d => d.category);

  const groups = g.selectAll('.group')
    .data(data)
    .join('g')
    .attr('transform', d => 'translate(0,' + y0(d.category) + ')');

  groups.append('rect').attr('class', 'bar-2025')
    .attr('x', 0).attr('y', y1('2025'))
    .attr('width', d => x(d.value_2025))
    .attr('height', y1.bandwidth());

  groups.append('rect').attr('class', 'bar-2024')
    .attr('x', 0).attr('y', y1('2024'))
    .attr('width', d => x(d.value_2024))
    .attr('height', y1.bandwidth());

  groups.append('text').attr('class', 'value-text')
    .attr('x', d => x(d.value_2025) + 8)
    .attr('y', y0.bandwidth() / 2 - 6)
    .attr('dy', '0.32em')
    .text(d => '£' + (d.value_2025 / 1e6).toFixed(2) + 'M');

  groups.append('text').attr('class', 'delta-text')
    .attr('x', d => x(d.value_2025) + 8)
    .attr('y', y0.bandwidth() / 2 + 6)
    .attr('dy', '0.32em')
    .text(d => '+' + d.delta_pct + '%');
}


/* ---- Chart 3: Multi-line with annotation (4.4) ---- */
function renderMultiLineAnnotation(svgId) {
  const svgEl = document.getElementById(svgId);
  if (!svgEl) return;
  const { W, H } = measureSvg(svgEl, 532, 160);
  const svg = d3.select(svgEl);
  clearSvg(svg);

  const proteinData = [
    { date: new Date(2024, 0), value: 200000 },{ date: new Date(2024, 1), value: 240000 },
    { date: new Date(2024, 2), value: 317360 },{ date: new Date(2024, 3), value: 160000 },
    { date: new Date(2024, 4), value: 195000 },{ date: new Date(2024, 5), value: 235000 },
    { date: new Date(2024, 6), value: 180000 },{ date: new Date(2024, 7), value: 210000 },
    { date: new Date(2024, 8), value: 225000 },{ date: new Date(2024, 9), value: 195000 },
    { date: new Date(2024, 10), value: 245000 },{ date: new Date(2024, 11), value: 275000 },
    { date: new Date(2025, 0), value: 265000 },{ date: new Date(2025, 1), value: 175000 },
    { date: new Date(2025, 2), value: 220000 },{ date: new Date(2025, 3), value: 200000 },
    { date: new Date(2025, 4), value: 230000 },{ date: new Date(2025, 5), value: 190000 },
    { date: new Date(2025, 6), value: 215000 },{ date: new Date(2025, 7), value: 225000 },
    { date: new Date(2025, 8), value: 205000 },{ date: new Date(2025, 9), value: 180000 }
  ];
  const enduranceData = [
    { date: new Date(2024, 0), value: 50000 },{ date: new Date(2024, 1), value: 60000 },
    { date: new Date(2024, 2), value: 70000 },{ date: new Date(2024, 3), value: 45000 },
    { date: new Date(2024, 4), value: 55000 },{ date: new Date(2024, 5), value: 75000 },
    { date: new Date(2024, 6), value: 65000 },{ date: new Date(2024, 7), value: 60000 },
    { date: new Date(2024, 8), value: 80000 },{ date: new Date(2024, 9), value: 70000 },
    { date: new Date(2024, 10), value: 75000 },{ date: new Date(2024, 11), value: 85000 },
    { date: new Date(2025, 0), value: 80000 },{ date: new Date(2025, 1), value: 65000 },
    { date: new Date(2025, 2), value: 75000 },{ date: new Date(2025, 3), value: 60000 },
    { date: new Date(2025, 4), value: 70000 },{ date: new Date(2025, 5), value: 55000 },
    { date: new Date(2025, 6), value: 75000 },{ date: new Date(2025, 7), value: 70000 },
    { date: new Date(2025, 8), value: 65000 },{ date: new Date(2025, 9), value: 60000 }
  ];
  const annotation = { date: new Date(2024, 2), value: 317360, label: 'Max: £317.36K' };

  const margin = { top: 14, right: 70, bottom: 22, left: 36 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top  - margin.bottom;
  const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const x = d3.scaleTime().domain([new Date(2024, 0), new Date(2025, 9)]).range([0, innerW]);
  const y = d3.scaleLinear().domain([0, 350000]).range([innerH, 0]);

  g.append('g').attr('class', 'axis axis-y')
    .call(d3.axisLeft(y)
      .tickValues([100000, 200000, 300000])
      .tickFormat(d => (d / 1000) + 'K')
      .tickSize(-innerW));

  g.append('g').attr('class', 'axis axis-x')
    .attr('transform', 'translate(0,' + innerH + ')')
    .call(d3.axisBottom(x)
      .ticks(d3.timeMonth.every(3))
      .tickFormat(d3.timeFormat('%b %y'))
      .tickSize(0).tickPadding(8));

  const lineGen = d3.line().x(d => x(d.date)).y(d => y(d.value));
  g.append('path').datum(enduranceData).attr('class', 'line-endurance').attr('d', lineGen);
  g.append('path').datum(proteinData).attr('class', 'line-protein').attr('d', lineGen);

  g.append('circle').attr('class', 'annot-dot')
    .attr('cx', x(annotation.date)).attr('cy', y(annotation.value)).attr('r', 4);
  g.append('text').attr('class', 'annot-label')
    .attr('x', x(annotation.date) + 8).attr('y', y(annotation.value) - 6)
    .text(annotation.label);

  const lastProtein = proteinData[proteinData.length - 1];
  const lastEndurance = enduranceData[enduranceData.length - 1];
  g.append('text').attr('class', 'series-label')
    .attr('x', x(lastProtein.date) + 6).attr('y', y(lastProtein.value))
    .attr('dy', '0.32em').text('Protein');
  g.append('text').attr('class', 'series-label')
    .attr('x', x(lastEndurance.date) + 6).attr('y', y(lastEndurance.value))
    .attr('dy', '0.32em').text('Endurance');
}


/* ---- Chart 4: Combo bar + line dual-axis (4.5) ---- */
function renderComboDualAxis(svgId) {
  const svgEl = document.getElementById(svgId);
  if (!svgEl) return;
  const { W, H } = measureSvg(svgEl, 532, 150);
  const svg = d3.select(svgEl);
  clearSvg(svg);

  const data = [
    { platform: 'Instagram', sessions: 400000, rate: 22 },
    { platform: 'TikTok',    sessions: 230000, rate: 15 },
    { platform: 'Facebook',  sessions: 110000, rate: 11 }
  ];

  const margin = { top: 14, right: 44, bottom: 22, left: 40 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top  - margin.bottom;
  const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const x = d3.scaleBand()
    .domain(data.map(d => d.platform))
    .range([0, innerW]).padding(0.45);
  const yLeft  = d3.scaleLinear().domain([0, 400000]).range([innerH, 0]);
  const yRight = d3.scaleLinear().domain([0, 30]).range([innerH, 0]);

  g.append('g').attr('class', 'axis axis-y-left')
    .call(d3.axisLeft(yLeft)
      .tickValues([0, 200000, 400000])
      .tickFormat(d => d === 0 ? '0K' : (d / 1000) + 'K')
      .tickSize(-innerW));

  g.append('g').attr('class', 'axis axis-y-right')
    .attr('transform', 'translate(' + innerW + ',0)')
    .call(d3.axisRight(yRight)
      .tickValues([0, 15, 30])
      .tickFormat(d => d + '%')
      .tickSize(0).tickPadding(6));

  g.append('g').attr('class', 'axis axis-x')
    .attr('transform', 'translate(0,' + innerH + ')')
    .call(d3.axisBottom(x).tickSize(0).tickPadding(8));

  g.selectAll('.bar')
    .data(data)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.platform))
    .attr('y', d => yLeft(d.sessions))
    .attr('width', x.bandwidth())
    .attr('height', d => innerH - yLeft(d.sessions));

  const lineGen = d3.line()
    .x(d => x(d.platform) + x.bandwidth() / 2)
    .y(d => yRight(d.rate));
  g.append('path').datum(data).attr('class', 'line-overlay').attr('d', lineGen);

  g.selectAll('.point-dot')
    .data(data).join('circle').attr('class', 'point-dot')
    .attr('cx', d => x(d.platform) + x.bandwidth() / 2)
    .attr('cy', d => yRight(d.rate)).attr('r', 3.5);

  g.selectAll('.point-label')
    .data(data).join('text').attr('class', 'point-label')
    .attr('x', d => x(d.platform) + x.bandwidth() / 2)
    .attr('y', d => yRight(d.rate) - 8)
    .text(d => d.rate + '%');
}


/* ---- Chart 5: Ranked horizontal bar (4.6) — HTML+CSS+JS ----
   No SVG. The row layout already grows with the card via flex. */
function renderRankedHorizontalBar(listId) {
  const data = [
    { name: 'Protein | Milk & Cookies',        subtitle: 'BUM Itholate Protein',       value: 797.72, icon: 'protein' },
    { name: 'Protein | Red Velvet',            subtitle: 'BUM Itholate Protein',       value: 656.92, icon: 'protein' },
    { name: 'Pre-Workout | South Beach Slush', subtitle: 'Thavage Pre-Workout',        value: 261.50, icon: 'preworkout' },
    { name: 'Pre-Workout | Cherry Berry',      subtitle: 'Thuper Thavage Pre-Workout', value: 220.56, icon: 'preworkout' },
    { name: 'Pre-Workout | 6PEAT',             subtitle: 'Thuper Thavage Pre-Workout', value: 213.14, icon: 'preworkout' }
  ];
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = '';
  const maxValue = Math.max.apply(null, data.map(d => d.value));

  const icons = {
    protein:
      '<svg class="ranked-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M7 3c0 4 10 6 10 9"/>' +
        '<path d="M17 3c0 4-10 6-10 9"/>' +
        '<path d="M7 12c0 4 10 6 10 9"/>' +
        '<path d="M17 12c0 4-10 6-10 9"/>' +
        '<path d="M8 6h8"/><path d="M8 9h8"/><path d="M8 15h8"/><path d="M8 18h8"/>' +
      '</svg>',
    preworkout:
      '<svg class="ranked-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="13" r="7"/>' +
        '<path d="M12 9v4l2.5 2"/>' +
        '<path d="M9 2h6"/>' +
      '</svg>'
  };

  data.forEach(d => {
    const row = document.createElement('div');
    row.className = 'ranked-row';
    const barPct = (d.value / maxValue * 100).toFixed(1);
    row.innerHTML =
      (icons[d.icon] || icons.protein) +
      '<div class="ranked-text">' +
        '<p class="ranked-name">' + d.name + '</p>' +
        '<p class="ranked-subtitle">' + d.subtitle + '</p>' +
      '</div>' +
      '<div class="ranked-bar-track">' +
        '<div class="ranked-bar" style="width: ' + barPct + '%"></div>' +
      '</div>' +
      '<span class="ranked-value">&pound;' + d.value.toFixed(2) + 'K</span>';
    list.appendChild(row);
  });
}


const CHART_RENDERERS = {
  'chart-grouped-bar': () => renderGroupedHorizontalBar('chart-grouped-bar-svg'),
  'chart-multi-line':  () => renderMultiLineAnnotation('chart-multi-line-svg'),
  'chart-combo':       () => renderComboDualAxis('chart-combo-svg'),
  'chart-ranked':      () => renderRankedHorizontalBar('chart-ranked-list')
};

function renderChartForCard(cardEl) {
  const id = cardEl.getAttribute('data-component-id');
  const fn = CHART_RENDERERS[id];
  if (fn) fn();
}

/* ResizeObserver wiring — re-render on card resize, rAF-batched. */
let pendingResize = false;
const dirtyCards = new Set();
function flushResize() {
  pendingResize = false;
  dirtyCards.forEach(card => renderChartForCard(card));
  dirtyCards.clear();
}
function observeChartCards() {
  if (typeof ResizeObserver === 'undefined') return;
  const ro = new ResizeObserver(entries => {
    for (const entry of entries) dirtyCards.add(entry.target);
    if (!pendingResize) {
      pendingResize = true;
      requestAnimationFrame(flushResize);
    }
  });
  document.querySelectorAll('.component.chart-card').forEach(el => ro.observe(el));
}

/* ---- First paint ---- */
function renderAllCharts() {
  if (typeof d3 === 'undefined') {
    console.warn('d3 not loaded; skipping SVG charts');
  } else {
    renderGroupedHorizontalBar('chart-grouped-bar-svg');
    renderMultiLineAnnotation('chart-multi-line-svg');
    renderComboDualAxis('chart-combo-svg');
  }
  renderRankedHorizontalBar('chart-ranked-list');
  observeChartCards();
}
