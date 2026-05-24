# hihebark.github.io

Personal portfolio — [hihebark.github.io](https://hihebark.github.io)

## Stack

Astro 5. No UI framework, no Tailwind — custom CSS with all the original animations.

- `src/pages/` — index, portfolio, projects, 404
- `src/layouts/Layout.astro` — shared HTML shell
- `src/components/` — Header, Footer
- `public/css/style.css` — all styles
- `public/js/main.js` — scroll reveal, terminal (autoplay + interactive shell, GitHub API)

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:4321`.

## Deploy

Push to `master` — GitHub Actions builds and deploys automatically.
Requires **Pages source → GitHub Actions** in repo settings.

## License

[MIT](LICENSE.txt)
