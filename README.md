# Olfact Fragrances

A three-page editorial storefront for **Olfact Fragrances**, an independent fragrance maison. The site combines a dramatic campaign-led home page, filterable fragrance collection, custom discovery-set builder, brand story, persistent shopping bag, and newsletter interactions.

## Pages

- `index.html` — Campaign home and featured fragrances
- `collection.html` — Filterable collection, discovery-set builder, and scent lexicon
- `maison.html` — Brand story, materials, process, and scent-room details

## Run locally

The site has no build step or package dependencies. Serve the repository with any static server:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## GitHub Pages

The site deploys through `.github/workflows/deploy-pages.yml` from the Arena working branch and after merge to `main`.

**Live URL:** [saintm254.github.io/OLFACT-FRAGRANCES](https://saintm254.github.io/OLFACT-FRAGRANCES/)

## Design notes

- Fully responsive layouts for mobile, tablet, and desktop
- Product and campaign imagery created specifically for this project
- Refined uniform line-style icons for navigation and shopping bag complement the Olfact mark
- Keyboard-accessible navigation, bag drawer, forms, filters, and reduced-motion support
- Shopping bag state persists in `localStorage`
