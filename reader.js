const params = new URLSearchParams(location.search);
const bookId = params.get('book');

const container  = document.getElementById('page-container');
const titleEl    = document.getElementById('book-title');
const langSelect = document.getElementById('lang-select');
const dotsEl     = document.getElementById('page-dots');

const LANG_KEY = 'pb_lang';

if (!bookId) {
  container.innerHTML = '<p class="loading">No book specified.</p>';
} else {
  fetch(`books/${encodeURIComponent(bookId)}/book.json`)
    .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
    .then(book => init(book))
    .catch(() => {
      container.innerHTML = '<p class="loading">Could not load book.</p>';
    });
}

function init(book) {
  document.title = book.title;
  titleEl.textContent = book.title;

  // Build language selector
  const langs = book.languages || [];
  const savedLang = localStorage.getItem(LANG_KEY);
  const defaultCode = langs.find(l => l.code === savedLang)
    ? savedLang
    : (langs[0] ? langs[0].code : null);

  langs.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.code;
    opt.textContent = l.label;
    if (l.code === defaultCode) opt.selected = true;
    langSelect.appendChild(opt);
  });

  if (langs.length <= 1) langSelect.style.display = 'none';

  let currentLang = defaultCode;

  // Build page slides
  function buildPages() {
    container.innerHTML = '';
    dotsEl.innerHTML = '';

    book.pages.forEach((page, i) => {
      // Slide
      const slide = document.createElement('div');
      slide.className = 'page-slide';

      const imgWrap = document.createElement('div');
      imgWrap.className = 'page-image-wrap';

      if (page.image) {
        const img = document.createElement('img');
        img.src = `books/${encodeURIComponent(bookId)}/${page.image}`;
        img.alt = `Page ${i + 1}`;
        img.loading = i === 0 ? 'eager' : 'lazy';
        imgWrap.appendChild(img);
      } else {
        imgWrap.innerHTML = '<span class="no-image">No image</span>';
      }

      const textEl = document.createElement('p');
      textEl.className = 'page-text';
      textEl.textContent = currentLang && page.text ? (page.text[currentLang] || '') : '';

      slide.appendChild(imgWrap);
      slide.appendChild(textEl);
      container.appendChild(slide);

      // Dot
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to page ${i + 1}`);
      dot.addEventListener('click', () => scrollToPage(i));
      dotsEl.appendChild(dot);
    });
  }

  buildPages();

  // Update text when language changes (no full rebuild needed)
  function updateTexts() {
    const slides = container.querySelectorAll('.page-slide');
    slides.forEach((slide, i) => {
      const page = book.pages[i];
      const textEl = slide.querySelector('.page-text');
      textEl.textContent = currentLang && page.text ? (page.text[currentLang] || '') : '';
    });
  }

  langSelect.addEventListener('change', () => {
    currentLang = langSelect.value;
    localStorage.setItem(LANG_KEY, currentLang);
    updateTexts();
  });

  // Sync dots to scroll position
  function scrollToPage(index) {
    container.scrollTo({ left: index * container.clientWidth, behavior: 'smooth' });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const slides = Array.from(container.querySelectorAll('.page-slide'));
      const i = slides.indexOf(entry.target);
      if (i < 0) return;
      dotsEl.querySelectorAll('.dot').forEach((d, j) => {
        d.classList.toggle('active', j === i);
      });
    });
  }, { root: container, threshold: 0.5 });

  function observeSlides() {
    container.querySelectorAll('.page-slide').forEach(s => observer.observe(s));
  }

  observeSlides();

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      const i = currentPageIndex();
      if (i < book.pages.length - 1) scrollToPage(i + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      const i = currentPageIndex();
      if (i > 0) scrollToPage(i - 1);
    }
  });

  function currentPageIndex() {
    return Math.round(container.scrollLeft / container.clientWidth);
  }
}
