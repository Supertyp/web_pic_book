# Picture Book Reader

A static web app for publishing multilingual picture books, hosted on GitHub Pages.

**→ [Open the book shelf](https://supertyp.github.io/web_pic_book/)**

## Features

- Landing page with a grid of book covers
- Swipe left/right (or use arrow keys) to turn pages
- Up to three language options per book — the reader remembers your choice
- Works on mobile and desktop, no app install needed
- No build step — plain HTML, CSS, and JavaScript served directly from this repo

## Adding a book

1. Create a folder under `books/` using a short URL-friendly name, e.g. `books/my-new-book/`
2. Add an `images/` subfolder with your page images (JPG, PNG, or SVG)
3. Create `books/my-new-book/book.json` following the format below
4. Add an entry for the book to `books/index.json`

### `book.json` format

```json
{
  "title": "My New Book",
  "languages": [
    { "code": "en", "label": "English" },
    { "code": "de", "label": "Deutsch" },
    { "code": "fr", "label": "Français" }
  ],
  "pages": [
    {
      "image": "images/cover.jpg",
      "text": { "en": "", "de": "", "fr": "" }
    },
    {
      "image": "images/page1.jpg",
      "text": {
        "en": "Once upon a time…",
        "de": "Es war einmal…",
        "fr": "Il était une fois…"
      }
    }
  ]
}
```

- **`languages`** — list the language options you want to offer. You can have one, two, or three. If only one is given, the language selector is hidden automatically.
- **`pages`** — each page has an `image` path (relative to the book folder) and a `text` map keyed by language code. The cover page typically has empty text strings.

### `books/index.json` format

```json
[
  {
    "id": "my-new-book",
    "title": "My New Book",
    "cover": "books/my-new-book/images/cover.jpg",
    "languages": ["English", "Deutsch", "Français"]
  }
]
```

The `id` must match the folder name. The `cover` path is relative to the repo root.

## Repo structure

```
/
├── index.html          — landing page (book grid)
├── reader.html         — book reader (shared for all books)
├── app.js              — landing page logic
├── reader.js           — reader logic (swipe, language, page counter)
├── style.css           — all styles
├── .nojekyll           — disables Jekyll on GitHub Pages
└── books/
    ├── index.json      — registry of all books
    └── my-book/
        ├── book.json   — book metadata and page content
        └── images/
            ├── cover.jpg
            └── page1.jpg
```

## Enabling GitHub Pages

In the repository settings, go to **Pages → Source → Deploy from branch**, select branch `main` and folder `/ (root)`, then save. The site will be live at `https://supertyp.github.io/web_pic_book/` within a minute or two.
