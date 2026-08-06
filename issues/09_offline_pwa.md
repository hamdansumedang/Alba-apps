# Issue: Offline First & PWA

**Goal**: PWA support with offline transaction queue and automatic sync.

## Description
- Installable PWA manifest & icons.
- Service worker caching strategy.
- Local IndexedDB queue for offline transactions.
- Automatic background sync when online.
- Conflict resolution and sync status indicator.

## Acceptance Criteria
- App can be installed as PWA on mobile.
- Transactions can be added while offline.
- Data syncs automatically when connection is restored.
- UI shows sync status indicator.

## Checklist
- [ ] Configure PWA manifest and service worker.
- [ ] Set up IndexedDB wrapper (e.g., Dexie.js).
- [ ] Implement offline transaction queue.
- [ ] Implement online sync hook/worker.
- [ ] Add conflict resolution logic.
- [ ] Build sync status UI indicator.
- [ ] Test offline scenarios.