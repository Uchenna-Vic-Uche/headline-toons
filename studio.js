const templates = [
  ['Bounce in', 'Text', '#f6c945', 'HELLO!', 1.4, 'bounce'],
  ['Confetti burst', 'Celebration', '#ef6248', 'HOORAY', 1.8, 'elastic'],
  ['Wobble text', 'Text', '#a9d9c7', 'LOOK HERE', 1.6, 'ease-in-out'],
  ['Sticker pop', 'Sticker', '#8ec8dc', 'NICE!', 1.2, 'ease-out'],
  ['Color reveal', 'Title card', '#d9b8e8', 'BIG IDEA', 2, 'ease-in']
].map((item, index) => ({ id: index, name: item[0], type: item[1], color: item[2], text: item[3], duration: item[4], easing: item[5] }));
const easings = [
  ['Ease in / out', 'cubic-bezier(.65, 0, .35, 1)'], ['Ease out', 'cubic-bezier(0, .7, .25, 1)'],
  ['Bounce', 'cubic-bezier(.2, 1.6, .4, 1)'], ['Elastic', 'cubic-bezier(.7, -.6, .3, 1.6)'], ['Ease in', 'cubic-bezier(.7, 0, 1, .3)']
];
let template = templates[0];
let easing = easings[2];
let selectedId = 'title';
let objects = [
  { id: 'title', type: 'text', text: 'HELLO!', x: 50, y: 42, color: '#172126', rotation: -4, opacity: 100 },
  { id: 'star', type: 'sticker', text: '✦', x: 71, y: 65, color: '#ef6248', rotation: 12, opacity: 100 }
];

document.body.innerHTML = `<div class="canvas-app">
<header class="canvas-topbar"><a class="canvas-brand" href="#top"><span class="canvas-logo">✦</span><strong>motion</strong><em>canvas</em></a><div class="project-name"><span class="save-dot"></span>Untitled animation <small>Saved just now</small></div><div class="canvas-actions"><button class="top-icon" title="Undo">↶</button><button class="top-icon" title="Redo">↷</button><button class="share-button">Share</button><button class="export-button">Export ↗</button></div></header>
<main class="canvas-main"><aside class="tool-rail"><button class="rail-tool active" data-tool="select" title="Select">↖</button><button class="rail-tool" data-tool="text" title="Add text">T</button><button class="rail-tool" data-tool="shape" title="Add shape">◼</button><button class="rail-tool" data-tool="sticker" title="Add sticker">✦</button><span class="rail-rule"></span><button class="rail-tool" title="Background">◐</button><button class="rail-tool" title="Layers">▤</button><div class="rail-bottom"><button class="rail-tool" title="Help">?</button></div></aside>
<section class="editor-area"><div class="editor-head"><div><p class="canvas-eyebrow">04 / MAKE IT MOVE</p><h1>Build a little <em>magic.</em></h1></div><div class="zoom-control"><button id="zoom-out">−</button><span id="zoom-value">100%</span><button id="zoom-in">+</button></div></div><div class="template-strip"><span>STARTER TEMPLATES</span><div id="template-list"></div></div><div class="canvas-workspace"><div class="stage" id="stage"><div class="stage-grid"></div><div id="object-layer"></div><span class="stage-size">1080 × 1080</span></div></div>
<section class="timeline-panel"><div class="timeline-title"><strong>Timeline</strong><span id="timeline-time">00:00.00 / 00:01.40</span><button id="add-keyframe">＋ Add keyframe</button></div><div class="timeline-body"><div class="layer-labels" id="layer-labels"></div><div class="timeline-chart"><div class="ruler"><span>0s</span><span>0.5s</span><span>1s</span><span>1.5s</span><span>2s</span></div><div id="timeline-rows"></div><input id="scrubber" type="range" min="0" max="2" step=".01" value="0" aria-label="Animation timeline"></div></div><div class="transport"><button id="play-button">▶ Play</button><button id="reset-button">Reset</button><span>Loop <b id="duration-value">1.4s</b></span></div></section></section>
<aside class="inspector"><div class="inspector-heading"><span>Design</span><button title="Close inspector">×</button></div><div class="inspector-tabs"><button class="active">Animate</button><button>Position</button></div><div class="selected-preview" id="selected-preview"></div><label for="object-text">Text</label><input id="object-text" type="text"><div class="property-row"><label for="object-color">Color</label><input id="object-color" type="color"><span id="color-value"></span></div><div class="property-row"><label for="object-opacity">Opacity</label><input id="object-opacity" type="range" min="10" max="100"><span id="opacity-value"></span></div><div class="property-row"><label for="object-rotation">Rotation</label><input id="object-rotation" type="range" min="-180" max="180"><span id="rotation-value"></span></div><div class="inspector-section"><div class="section-label"><span>Animation</span><small id="keyframe-count">2 keyframes</small></div><div class="easing-pills" id="easing-list"></div></div><div class="inspector-section"><div class="section-label"><span>Quick add</span><small>Elements</small></div><div class="quick-add"><button data-add="circle">● Circle</button><button data-add="square">■ Square</button><button data-add="spark">✦ Sticker</button></div></div></aside></main></div>`;

const stage = document.querySelector('#stage');
const layer = document.querySelector('#object-layer');
const current = () => objects.find(item => item.id === selectedId);
const escape = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
function render() {
  layer.innerHTML = objects.map(item => `<button class="canvas-object ${item.type} ${item.id === selectedId ? 'selected' : ''}" data-id="${item.id}" style="left:${item.x}%;top:${item.y}%;--object-color:${item.color};--object-rotation:${item.rotation}deg;opacity:${item.opacity / 100}"><span>${escape(item.text)}</span><i></i></button>`).join('');
  layer.querySelectorAll('.canvas-object').forEach(item => { item.addEventListener('click', event => { event.stopPropagation(); selectedId = item.dataset.id; render(); sync(); }); item.addEventListener('pointerdown', drag); });
  document.querySelector('#layer-labels').innerHTML = objects.map(item => `<button class="layer-label ${item.id === selectedId ? 'active' : ''}" data-id="${item.id}">${item.type === 'text' ? 'T' : '✦'} ${escape(item.text)}</button>`).join('');
  document.querySelectorAll('.layer-label').forEach(item => item.addEventListener('click', () => { selectedId = item.dataset.id; render(); sync(); }));
  document.querySelector('#timeline-rows').innerHTML = objects.map(item => `<div class="timeline-row"><span style="--track-color:${item.color}"></span><b></b><b></b></div>`).join('');
}
function sync() {
  const item = current(); if (!item) return;
  const text = document.querySelector('#object-text'); text.value = item.text; text.disabled = item.type !== 'text';
  document.querySelector('#object-color').value = item.color; document.querySelector('#color-value').textContent = item.color.toUpperCase();
  document.querySelector('#object-opacity').value = item.opacity; document.querySelector('#opacity-value').textContent = `${item.opacity}%`;
  document.querySelector('#object-rotation').value = item.rotation; document.querySelector('#rotation-value').textContent = `${item.rotation}°`;
  document.querySelector('#selected-preview').innerHTML = `<span class="${item.type}" style="--object-color:${item.color}">${escape(item.text)}</span>`;
}
function renderEasing() {
  document.querySelector('#easing-list').innerHTML = easings.map(item => `<button class="easing-pill ${item[1] === easing[1] ? 'selected' : ''}" data-easing="${item[1]}">${item[0]}</button>`).join('');
  document.querySelectorAll('.easing-pill').forEach(button => button.addEventListener('click', () => { easing = easings.find(item => item[1] === button.dataset.easing); renderEasing(); play(); }));
}
function renderTemplates() {
  document.querySelector('#template-list').innerHTML = templates.map(item => `<button class="template-chip ${item.id === template.id ? 'selected' : ''}" data-template="${item.id}"><span style="--chip-color:${item.color}">${item.text.slice(0, 2)}</span><b>${item.name}</b></button>`).join('');
  document.querySelectorAll('.template-chip').forEach(button => button.addEventListener('click', () => { template = templates.find(item => item.id === Number(button.dataset.template)); easing = easings.find(item => item[0].toLowerCase().includes(template.easing)) || easings[0]; objects[0].text = template.text; objects[0].color = template.color === '#f6c945' ? '#172126' : template.color; renderTemplates(); render(); sync(); renderEasing(); play(); }));
}
function play() {
  document.querySelectorAll('.canvas-object').forEach(item => { item.getAnimations().forEach(animation => animation.cancel()); item.animate([{ transform: 'translate(-50%, -50%) translateY(30px) scale(.72) rotate(-10deg)', opacity: 0 }, { transform: 'translate(-50%, -50%) scale(1) rotate(var(--object-rotation))', opacity: 1 }], { duration: template.duration * 1000, easing: easing[1], fill: 'both' }); });
  document.querySelector('#duration-value').textContent = `${template.duration}s`; document.querySelector('#timeline-time').textContent = `00:00.00 / 00:0${template.duration.toFixed(2)}`;
}
function drag(event) {
  const item = current(); if (!item || event.button !== 0) return; const rect = stage.getBoundingClientRect();
  const move = next => { item.x = Math.max(4, Math.min(96, (next.clientX - rect.left) / rect.width * 100)); item.y = Math.max(4, Math.min(96, (next.clientY - rect.top) / rect.height * 100)); event.currentTarget.style.left = `${item.x}%`; event.currentTarget.style.top = `${item.y}%`; };
  const stop = () => { window.removeEventListener('pointermove', move); render(); }; window.addEventListener('pointermove', move); window.addEventListener('pointerup', stop, { once: true });
}
function add(type) { const values = { text: ['Your idea', '#172126'], circle: ['●', '#8ec8dc'], square: ['■', '#f6c945'], spark: ['✦', '#ef6248'] }[type]; const id = `${type}-${Date.now()}`; objects.push({ id, type: type === 'spark' ? 'sticker' : type === 'text' ? 'text' : 'shape', text: values[0], x: 30 + objects.length * 8, y: 30 + objects.length * 8, color: values[1], rotation: 0, opacity: 100 }); selectedId = id; render(); sync(); }
document.querySelectorAll('.rail-tool[data-tool]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.rail-tool').forEach(item => item.classList.remove('active')); button.classList.add('active'); if (button.dataset.tool === 'text') add('text'); if (button.dataset.tool === 'shape') add('square'); if (button.dataset.tool === 'sticker') add('spark'); }));
document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => add(button.dataset.add)));
document.querySelector('#stage').addEventListener('click', () => { selectedId = null; render(); });
document.querySelector('#object-text').addEventListener('input', event => { if (current()) { current().text = event.target.value; render(); } });
document.querySelector('#object-color').addEventListener('input', event => { if (current()) { current().color = event.target.value; render(); sync(); } });
document.querySelector('#object-opacity').addEventListener('input', event => { if (current()) { current().opacity = event.target.value; sync(); render(); } });
document.querySelector('#object-rotation').addEventListener('input', event => { if (current()) { current().rotation = event.target.value; sync(); render(); } });
document.querySelector('#play-button').addEventListener('click', play);
document.querySelector('#reset-button').addEventListener('click', () => { objects[0].x = 50; objects[0].y = 42; objects[1].x = 71; objects[1].y = 65; render(); play(); });
document.querySelector('#add-keyframe').addEventListener('click', event => { document.querySelector('#keyframe-count').textContent = '3 keyframes'; event.target.textContent = '✓ Keyframe added'; });
document.querySelector('#scrubber').addEventListener('input', event => { document.querySelector('#timeline-time').textContent = `00:${Number(event.target.value).toFixed(2).padStart(5, '0')} / 00:0${template.duration.toFixed(2)}`; });
document.querySelector('#zoom-out').addEventListener('click', () => { document.querySelector('#zoom-value').textContent = '90%'; stage.style.transform = 'scale(.9)'; });
document.querySelector('#zoom-in').addEventListener('click', () => { document.querySelector('#zoom-value').textContent = '110%'; stage.style.transform = 'scale(1.1)'; });
document.querySelector('.export-button').addEventListener('click', () => alert('Your animation is ready. GIF export can plug into this canvas next.'));
render(); sync(); renderTemplates(); renderEasing(); play();
