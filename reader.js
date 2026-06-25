const params     = new URLSearchParams(location.search);
const bookId     = params.get('book');
const titleEl    = document.getElementById('book-title');
const langSelect = document.getElementById('lang-select');
const slide      = document.getElementById('page-slide');
const imageWrap  = document.getElementById('page-image-wrap');
const textEl     = document.getElementById('page-text');
const counterEl  = document.getElementById('page-counter');

const LANG_KEY   = 'pb_lang';
const SWIPE_MIN  = 40;   // px — minimum horizontal distance to count as a swipe
const SWIPE_LOCK = 1.2;  // horizontal must exceed vertical movement by this ratio

let book        = null;
let currentLang = null;
let pageIndex   = 0;
let animating   = false;

if (!bookId) {
  imageWrap.innerHTML = '<p class="loading">No book specified.</p>';
} else {
  fetch(`books/${encodeURIComponent(bookId)}/book.json`)
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(init)
    .catch(() => { imageWrap.innerHTML = '<p class="loading">Could not load book.</p>'; });
}

function init(data) {
  book = data;
  document.title = book.title;
  titleEl.textContent = book.title;

  const langs = book.languages || [];
  const saved = localStorage.getItem(LANG_KEY);
  currentLang = langs.find(l => l.code === saved) ? saved : (langs[0]?.code ?? null);

  langs.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.code;
    opt.textContent = l.label;
    if (l.code === currentLang) opt.selected = true;
    langSelect.appendChild(opt);
  });
  if (langs.length <= 1) langSelect.style.display = 'none';

  langSelect.addEventListener('change', () => {
    currentLang = langSelect.value;
    localStorage.setItem(LANG_KEY, currentLang);
    textEl.textContent = pageText(pageIndex);
  });

  renderPage(pageIndex, null);
  setupSwipe();
  setupKeyboard();
}

function pageText(index) {
  const p = book.pages[index];
  return (currentLang && p.text) ? (p.text[currentLang] ?? '') : '';
}

function renderPage(index, direction) {
  const page = book.pages[index];

  // Image
  imageWrap.innerHTML = '';
  if (page.image) {
    const img = document.createElement('img');
    img.src = `books/${encodeURIComponent(bookId)}/${page.image}`;
    img.alt = `Page ${index + 1}`;
    imageWrap.appendChild(img);
  } else {
    imageWrap.innerHTML = '<span class="no-image">No image</span>';
  }

  // Text
  textEl.textContent = pageText(index);

  // Counter
  counterEl.textContent = `${index + 1} / ${book.pages.length}`;

  // Animation
  if (direction) {
    slide.classList.remove('anim-next', 'anim-prev');
    void slide.offsetWidth; // force reflow to restart animation
    slide.classList.add(direction === 'next' ? 'anim-next' : 'anim-prev');
  }
}

function goTo(index, direction) {
  if (animating) return;
  if (index < 0 || index >= book.pages.length) return;
  pageIndex = index;
  renderPage(pageIndex, direction);

  // Block rapid re-triggering during animation
  animating = true;
  setTimeout(() => { animating = false; }, 250);
}

// ── Swipe ──────────────────────────────────────────────────────────────────

function setupSwipe() {
  const container = document.getElementById('page-container');
  let startX = 0, startY = 0;

  container.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  container.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < SWIPE_MIN) return;
    if (Math.abs(dx) < Math.abs(dy) * SWIPE_LOCK) return;
    dx < 0 ? goTo(pageIndex + 1, 'next') : goTo(pageIndex - 1, 'prev');
  }, { passive: true });

  // Mouse drag (desktop)
  let dragging = false;
  container.addEventListener('mousedown', e => {
    startX = e.clientX;
    startY = e.clientY;
    dragging = true;
  });
  container.addEventListener('mouseup', e => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) < SWIPE_MIN) return;
    if (Math.abs(dx) < Math.abs(dy) * SWIPE_LOCK) return;
    dx < 0 ? goTo(pageIndex + 1, 'next') : goTo(pageIndex - 1, 'prev');
  });
  container.addEventListener('mouseleave', () => { dragging = false; });
}

// ── Keyboard ───────────────────────────────────────────────────────────────

function setupKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  goTo(pageIndex + 1, 'next');
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    goTo(pageIndex - 1, 'prev');
  });
}
