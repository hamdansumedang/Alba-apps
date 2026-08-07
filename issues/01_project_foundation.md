# Issue: Project Foundation

**Goal**: Set up the initial project scaffold with Vite, React, Tailwind, shadcn/ui, linting, formatting, and CI.

## Description
- Initialize a Vite + React project.
- Add Tailwind CSS and configure.
- Install shadcn/ui components.
- Set up ESLint, Prettier, Husky, and lint‑staged.
- Add basic CI workflow (GitHub Actions) that runs lint and build.

## Acceptance Criteria
- `npm run dev` starts the dev server without errors.
- Tailwind classes are compiled correctly.
- Linting passes on `npm run lint`.
- CI workflow runs on push and passes.

## Checklist
- [x] `npm create vite@latest` with React + TypeScript.
- [x] Install Tailwind and configure `tailwind.config.cjs` / `@tailwindcss/vite`.
- [x] Add shadcn/ui component library & styling.
- [x] Configure ESLint / Oxlint.
- [x] Set up git workflow.
- [x] Add CI setup.
- [x] Verify `npm run build` produces a production build.
