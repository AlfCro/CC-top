# GitHub Browser Build Test Cases

Reference for common real-world GitHub repos targeting browsers.
Covers frameworks, package managers, build output dirs, and base URL strategies.

---

## 1. Plain Static (No Build)

**Repo type:** Raw HTML/CSS/JS, no `package.json`
**Detect by:** No `package.json`, has `index.html` at root
**Build command:** None — upload source directly
**Output dir:** repo root
**Base URL:** Relative URLs just work. No config needed.
**Deploy to:** root of Pages repo

---

## 2. React (CRA) + npm — Absolute URL via `homepage`

**Detect by:** `react-scripts` in `package.json` dependencies
**Build command:** `npm run build`
**Output dir:** `build/`
**Base URL strategy:** `"homepage"` field in `package.json`

```json
// package.json
"homepage": "https://user.github.io/repo-name"
```

CRA reads this at build time and injects the correct asset prefix.
Without it, assets load from `/` and break on subpath deploys.

**Notes:**
- `build/` contains `index.html` + `static/` subfolder
- Needs `.nojekyll` to prevent Jekyll from ignoring `_` prefixed folders

---

## 3. React (Vite) + Bun — `base` in vite.config

**Detect by:** `vite` in deps, `bun.lockb` present
**Build command:** `bun run build`
**Output dir:** `dist/`
**Base URL strategy:** `base` option in `vite.config.ts`

```ts
// vite.config.ts
export default defineConfig({
  base: '/repo-name/',
})
```

Without this, `dist/index.html` references `/assets/...` (absolute from root),
which 404s when hosted at `/repo-name/`.

**Variant — hash routing workaround:**
Some repos avoid the base URL problem entirely with `HashRouter`:
```tsx
<HashRouter>  // URLs become /#/page — no base config needed
```

---

## 4. Vue 3 (Vite) + pnpm

**Detect by:** `vue` dep, `pnpm-lock.yaml`
**Build command:** `pnpm build`
**Output dir:** `dist/`
**Base URL:** Same as #3 — `base: '/repo-name/'` in `vite.config.ts`

Vue Router in history mode also needs a `404.html` fallback for deep links.
Hash mode (`createWebHashHistory`) avoids this.

---

## 5. Angular + pnpm

**Detect by:** `@angular/core` dep, `angular.json`
**Build command:** `pnpm ng build --configuration production --base-href /repo-name/`
**Output dir:** `dist/<project-name>/browser/` (Angular 17+) or `dist/<project-name>/` (older)
**Base URL:** `--base-href` flag at build time (baked into `index.html`)

```json
// angular.json — alternative: set in deploy config
"baseHref": "/repo-name/"
```

**Notes:**
- Output path varies by Angular version — check `angular.json` `outputPath`
- Angular 17+ defaults to `dist/<project>/browser/`
- SPA routing requires `404.html` copy of `index.html` for GitHub Pages

---

## 6. Svelte (Vite) + npm / SvelteKit Static Adapter + Bun

**Plain Svelte (Vite):**
- Detect: `svelte` dep, no `@sveltejs/kit`
- Build: `npm run build` → `dist/`
- Base URL: `base` in `vite.config.ts` (same as Vue/React Vite)

**SvelteKit + static adapter + Bun:**
- Detect: `@sveltejs/kit` dep, `bun.lockb`
- Build: `bun run build` → `build/` (adapter-static default)
- Base URL: `paths.base` in `svelte.config.js`

```js
// svelte.config.js
kit: { paths: { base: '/repo-name' } }
```

- Generates `404.html` automatically when `fallback` is configured

---

## 7. Next.js Static Export + Yarn

**Detect by:** `next` dep, `"output": "export"` in `next.config.js`
**Build command:** `yarn build` (runs `next build`)
**Output dir:** `out/`
**Base URL strategy:**

```js
// next.config.js
basePath: '/repo-name',
assetPrefix: '/repo-name/',
```

**Notes:**
- Requires `output: 'export'` — server features (ISR, API routes) won't work
- `out/` has no `.nojekyll` by default — add one
- Image optimization disabled (`unoptimized: true`)

**Variant — without basePath (root deploy):**
Deploy to a user/org Pages repo (`user.github.io`) — no basePath needed.

---

## 8. Astro + npm

**Detect by:** `astro` dep
**Build command:** `npm run build`
**Output dir:** `dist/`
**Base URL:** `base` in `astro.config.mjs`

```js
// astro.config.mjs
export default defineConfig({
  site: 'https://user.github.io',
  base: '/repo-name',
})
```

**Notes:**
- Astro is SSG by default — static output works natively with Pages
- With `@astrojs/react` or other integrations, still outputs static HTML

---

## 9. Vanilla Vite (no framework) + pnpm

**Detect by:** `vite` dep, no framework-specific dep
**Build command:** `pnpm build`
**Output dir:** `dist/`
**Multi-page variant:** Multiple `html` entries in `vite.config.ts`

Base URL same as any Vite project.

---

## 10. Jekyll (GitHub Pages Native)

**Detect by:** `_config.yml` at root, `Gemfile` with `jekyll`
**Build:** GitHub Pages builds Jekyll automatically (no CI needed)
**Output dir:** `_site/` (not committed — built by Pages)
**Base URL:**

```yaml
# _config.yml
baseurl: "/repo-name"
url: "https://user.github.io"
```

**Notes:**
- No `.nojekyll` — Jekyll should run
- GitHub Pages has a built-in allowlist of Jekyll plugins
- Custom plugins require a GitHub Actions workflow + `actions/jekyll-build-pages`

---

## 11. Hugo + npm scripts

**Detect by:** `hugo` in build script, `hugo.toml` / `config.toml`
**Build command:** `npm run build` → calls `hugo --minify`
**Output dir:** `public/`
**Base URL:**

```toml
# hugo.toml
baseURL = "https://user.github.io/repo-name/"
```

---

## URL Strategy Summary

| Scenario | Solution |
|---|---|
| Deploy to `user.github.io` (root) | No base config needed |
| Deploy to `user.github.io/repo-name/` | Must set base URL — varies by tool (see above) |
| Hash routing (`#/path`) | Avoids base URL and 404 issues entirely |
| SPA deep links on refresh | Copy `index.html` → `404.html` |
| Relative asset paths (`./assets`) | Always work regardless of deploy path |
| Absolute asset paths (`/assets`) | Break on subpath — requires base config |

---

## Build Detection Signals

| Signal | Framework/Tool |
|---|---|
| `react-scripts` dep | Create React App |
| `vite` dep + `@vitejs/plugin-react` | React + Vite |
| `vite` dep + `vue` | Vue + Vite |
| `@angular/core` dep | Angular |
| `@sveltejs/kit` dep | SvelteKit |
| `svelte` dep (no kit) | Plain Svelte |
| `next` dep | Next.js |
| `astro` dep | Astro |
| `bun.lockb` | Bun package manager |
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | Yarn |
| `package-lock.json` | npm |
| `_config.yml` + no `package.json` | Jekyll |
| `hugo.toml` / `config.toml` + Hugo binary | Hugo |
| `index.html` + no `package.json` | Static (no build) |
