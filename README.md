# Tailored Europe DMC

A responsive concept website for a Europe-only destination management company. The positioning is deliberately clear: no standard packages, no catalogue itineraries, and every journey designed around the client.

## Links

- Live website: [https://ruisilva-bit.github.io/tailored-europe-dmc/](https://ruisilva-bit.github.io/tailored-europe-dmc/)
- GitHub repository: [ruisilva-bit/tailored-europe-dmc](https://github.com/ruisilva-bit/tailored-europe-dmc)

## Live scope

- Entire website is written in English.
- Europe-only destination coverage.
- Travel segments include luxury, classic European trips, family holidays, couple getaways, honeymoons, groups, solo travel and slow travel.
- Editorial, mobile-first design with accessible navigation and reduced-motion support.
- Static journey-brief builder that works entirely in the browser.
- No personal email address, fake phone number or unverified business address is published.
- `noindex, nofollow` remains enabled while the brand and contact routing are provisional.

## Contact form behaviour

This is a static GitHub Pages site. The enquiry form deliberately **does not transmit or store personal data**. It validates the traveller's input and generates a structured brief that can be copied or downloaded.

Before a commercial launch, connect the form to the preferred CRM or secure form endpoint, add confirmed contact details, and remove the concept notice and `noindex` directive.

## Technology

- Vite
- Semantic HTML
- Modern CSS
- Vanilla JavaScript
- Playwright browser QA
- axe-core accessibility checks

## Local development

```bash
npm install
npm run dev
```

## Production build and QA

```bash
npm run build
npx playwright install chromium
npm test
```

The Playwright suite verifies:

- production page response and expected content;
- desktop and mobile layouts;
- mobile navigation open/close behaviour;
- image loading;
- horizontal overflow;
- internal anchor integrity;
- journey-brief generation;
- working back-to-top interaction;
- serious/critical axe accessibility findings;
- core content with JavaScript disabled.

## GitHub Pages

The Vite build uses `base: './'`, so generated assets remain safe under a GitHub project Pages subpath. Publish the generated `dist/` directory to the `gh-pages` branch with:

```bash
npm run deploy
```

## Photography provenance

Destination photography is used as licensed concept imagery.

- Unsplash source images: `photo-1470770841072-f978cf4d019e`, `photo-1499856871958-5b9627545d1a`, `photo-1533104816931-20fa691ff6ca`, `photo-1541849546-216549ae216d`, `photo-1513635269975-59663e0ac1ad`, `photo-1528909514045-2fa4ac7a08ba`, and `photo-1531366936337-7c912a4589a7`.
- Dubrovnik aerial photograph: Akira Takiguchi, via Wikimedia Commons, licensed under [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). [Source file](https://commons.wikimedia.org/wiki/File:Aerial_view_of_the_Old_Town_of_Dubrovnik_-_Croatia.jpg).

## Production handoff items

1. Confirm the final company name and logo.
2. Add the confirmed enquiry inbox or CRM endpoint.
3. Add verified legal/company details and privacy policy.
4. Replace any concept photography with owner-approved brand photography if available.
5. Remove the concept footer notice and `noindex, nofollow` only after the above are complete.
