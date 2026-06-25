const grid = document.getElementById('book-grid');

fetch('books/index.json')
  .then(r => r.json())
  .then(books => {
    grid.innerHTML = '';
    if (books.length === 0) {
      grid.innerHTML = '<p class="loading">No books yet.</p>';
      return;
    }
    books.forEach(book => {
      const a = document.createElement('a');
      a.className = 'book-card';
      a.href = `reader.html?book=${encodeURIComponent(book.id)}`;

      const hasImage = Boolean(book.cover);
      const thumbHtml = hasImage
        ? `<img class="book-thumb" src="${book.cover}" alt="${book.title} cover" loading="lazy">`
        : `<div class="book-thumb-placeholder">📖</div>`;

      const langs = book.languages ? book.languages.join(' · ') : '';

      a.innerHTML = `
        ${thumbHtml}
        <div class="book-info">
          <h2>${book.title}</h2>
          ${langs ? `<p class="book-langs">${langs}</p>` : ''}
        </div>`;

      grid.appendChild(a);
    });
  })
  .catch(() => {
    grid.innerHTML = '<p class="loading">Could not load book list.</p>';
  });
