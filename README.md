# Study Unlock

Study Unlock is a mobile-first PWA that attaches immediate rewards to **completed outputs**, not elapsed study time.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Production checks:

```bash
npm run typecheck
npm run build
npm start
```

The repository also includes a GitHub Actions CI workflow that runs type checking and a production build on every push and pull request.

## Core behavior

- A Study Unit is rewarded only when the user explicitly presses **COMPLETE**.
- Pausing never completes a Unit and never grants a reward.
- Each calendar day is independent. There are no streaks, penalties, negative points, debt, or automatic failure states.
- Yesterday's unfinished Units are surfaced as neutral choices: **Add to Today / Ignore / Delete**.
- `START NEXT UNIT` recommends an active Unit first, then today's todo Units by Easy → shortest estimate → oldest creation time.
- The Today target counts completed Units and can be exceeded normally.

## Data model

All persisted data lives in one `AppData` object in `localStorage` (`study_unlock_data_v1`). The UI does not access storage directly; persistence and actions are isolated in `src/lib/store.tsx`, so a future Supabase repository can replace the storage implementation.

Main entities:

- `StudyUnit`: output, completion criteria, estimate/actual time, difficulty, reward, lifecycle timestamps.
- `RewardDefinition`: Free Time, Money, or Custom reward definitions.
- `RewardTransaction`: immutable earn/use ledger entries.
- `UnitTemplate`: reusable Unit presets.
- `StudySettings`: theme, default reward, target, week start, currency, notifications, reduced motion.

## Directory structure

```text
src/
  app/
    dashboard/      Today-first dashboard
    today/          Unit list + yesterday carry choices
    unit/[id]/      Focused active Unit flow
    rewards/        Wallet, spending, transaction history
    templates/      Reusable Units
    analytics/      Output, friction and reward association charts
    settings/       Preferences + import/export/reset
  components/       Shell, Quick Add, Unit cards, PWA registration
  lib/              Types, store/repository boundary, utilities
public/
  manifest.webmanifest
  sw.js             Offline service worker
  icon.svg
```

## Analytics

Analytics intentionally avoids streaks. It includes:

- completed Units/day and by subject
- completion rate and average actual time
- completion by difficulty and estimated length
- start-time completion rate
- reward usage
- estimated vs actual minutes
- Reward Effectiveness (simple descriptive association, explicitly not causal inference)
- Friction Analysis: Created → Started, Started → Completed, skipped, paused

## PWA and notifications

The app includes a manifest, standalone metadata, service worker caching, and an installable icon. Notifications are optional and deliberately neutral (for example, `Unused reward: 35 min available`). Because this MVP has no push backend, background delivery is browser-dependent; the local PWA can show a neutral once-per-day notification after the app is opened when permission is enabled.

## Design decisions

1. **Completion is an explicit event.** Timers are informational only.
2. **Ledger-based rewards.** Wallet balances are derived from immutable earn/use transactions rather than mutable counters.
3. **Local-first.** Everything works without an account or backend and can be exported/imported as JSON.
4. **No guilt mechanics.** There is no streak, debt, red warning state, or copy that frames an unfinished day as failure.
5. **Mobile first.** Large action targets, persistent Quick Add, bottom navigation, focused Active Unit view, and safe-area spacing are optimized for iPhone/PWA use.
