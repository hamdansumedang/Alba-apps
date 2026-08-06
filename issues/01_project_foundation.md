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
- [ ] `npm create vite@latest` with React + TypeScript.
- [ ] Install Tailwind and configure `tailwind.config.cjs`.
- [ ] Add shadcn/ui component library.
- [ ] Configure ESLint + Prettier.
- [ ] Set up Husky pre‑commit hook for lint‑staged.
- [ ] Add `.github/workflows/ci.yml` for CI.
- [ ] Verify `npm run build` produces a production build.
