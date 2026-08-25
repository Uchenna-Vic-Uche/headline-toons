const sampleStory = `Scientists have switched on a new floating solar farm in the North Sea, covering an area the size of 18 football pitches. The project is expected to power around 3,000 homes while leaving coastal land available for farms and wildlife. Engineers say the platforms can move with the waves, but environmental groups are watching closely to see how marine life responds.`;

const form = document.querySelector('#cartoon-form');
const input = document.querySelector('#article-input');
const count = document.querySelector('#character-count');
const sampleButton = document.querySelector('#sample-button');
const strip = document.querySelector('#comic-strip');
const status = document.querySelector('#story-status');
const storyDate = document.querySelector('#story-date');
const cartoonButton = document.querySelector('#cartoon-button');
const buttonLabel = document.querySelector('#button-label');
const shareButton = document.querySelector('#share-button');

const demoPanels = [
  { caption: 'Scientists put a solar farm out at sea. No land required. The ocean gets a new roommate.', icon: '☀️' },
  { caption: 'The floating panels could power 3,000 homes. That is a lot of kettles, lamps, and late-night snacks.', icon: '🏠' },
  { caption: 'The platforms ride the waves, while marine groups keep a close eye on the neighbors below.', icon: '🌊' }
];

function updateCount() {
  const characters = input.value.length;
  count.textContent = `${characters.toLocaleString()} character${characters === 1 ? '' : 's'}`;
}

function setLoading(loading) {
  document.body.classList.toggle('is-loading', loading);
  cartoonButton.disabled = loading;
  buttonLabel.textContent = loading ? 'Finding the funny...' : 'Cartoonify this story';
}

function renderPanels(panels) {
  strip.innerHTML = panels.map((panel, index) => `
    <article class="comic-panel">
      <div class="panel-art" style="background: ${['#8ec8dc', '#a9d9c7', '#f6c945'][index % 3]}">
        <span class="panel-number">${String(index + 1).padStart(2, '0')}</span>
        <span aria-hidden="true">${panel.icon || ['☀️', '🏠', '🌊'][index % 3]}</span>
      </div>
      <div class="panel-caption">${escapeHtml(panel.caption)}</div>
    </article>
  `).join('');
  status.textContent = `${panels.length} panels, freshly inked`;
  storyDate.textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

async function requestCartoon(article) {
  const endpoint = document.body.dataset.apiEndpoint;
  if (!endpoint) return demoPanels;
  const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ article }) });
  if (!response.ok) throw new Error('The cartoon service is unavailable right now.');
  const data = await response.json();
  if (!Array.isArray(data.panels) || data.panels.length < 3) throw new Error('The service returned an incomplete comic strip.');
  return data.panels;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const article = input.value.trim();
  if (!article) return;
  setLoading(true);
  try {
    const panels = await requestCartoon(article);
    renderPanels(panels.slice(0, 4));
  } catch (error) {
    strip.innerHTML = `<div class="error-message"><strong>Panel jam.</strong>${escapeHtml(error.message)}</div>`;
    status.textContent = 'Could not draw the story';
  } finally {
    setLoading(false);
  }
});

sampleButton.addEventListener('click', () => { input.value = sampleStory; updateCount(); input.focus(); });
input.addEventListener('input', updateCount);
shareButton.addEventListener('click', async () => {
  const text = [...document.querySelectorAll('.panel-caption')].map(panel => panel.textContent).join(' ');
  if (!text) return;
  await navigator.clipboard.writeText(`Headline Toons: ${text}`);
  status.textContent = 'Summary copied to clipboard';
  setTimeout(() => { status.textContent = 'Ready for a story'; }, 2200);
});
updateCount();
