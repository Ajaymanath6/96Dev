# Component Library

A component showcase site (like [21st.dev](https://21st.dev/community/components)) built with **Next.js 16**, **Tailwind CSS v4**, and **TypeScript**. Browse categories, view component demos, and deploy to Vercel.

## Stack

- **Next.js 16** (App Router)
- **Tailwind CSS v4** (CSS-first config, no `tailwind.config.js`)
- **TypeScript**
- **React 19**

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app/` — Routes and pages (home, `/components`, `/components/[category]`, `/components/[category]/[componentId]`)
- `src/components/` — Shared UI (Header, CategoryCard, ComponentCard)
- `src/lib/categories.ts` — Category and component metadata; add new categories and components here

## Adding components

1. Edit `src/lib/categories.ts` to add or extend categories and component entries.
2. Add demos in `src/app/components/[category]/[componentId]/page.tsx` (or split by component with sub-routes if you prefer).

## Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `component-library`). Do **not** add a README, .gitignore, or license (this repo already has them).

2. From the project root:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git add .
git commit -m "Initial commit: Next.js component showcase with Tailwind v4"
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name.

## Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub recommended).
2. Click **Add New** → **Project** and import your GitHub repository.
3. Leave the default settings (Framework: Next.js, build command: `npm run build`, output: default).
4. Click **Deploy**. Vercel will build and deploy; you’ll get a URL like `https://your-project.vercel.app`.

After the first deploy, every push to `main` will trigger a new deployment.

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run start` — Run production server locally
- `npm run lint` — Run ESLint
