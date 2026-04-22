# Time for Chess — Agent Instructions

Chess study time-tracker mobile app. Expo Router (file-based) + NativeWind v5 (Tailwind CSS v4) + expo-sqlite.

## Build & Run

```sh
npx expo start        # start dev server
npx expo start --ios  # open in iOS simulator
npm run lint          # ESLint
```

No test suite yet.

## Project Structure

- `app/` — Expo Router routes
  - `(tabs)/` — Bottom tab navigator (Home, History)
  - `(modals)/session/` — Multi-step session modal (Stack inside modal)
- `components/` — Reusable UI components; `components/ui/` for primitive UI (buttons, icons)
- `lib/` — Business logic and data access
  - `database.ts` — Singleton `expo-sqlite` connection (WAL mode, FK enforcement)
  - `sessions.ts` — All session/category CRUD and query functions
  - `session-context.tsx` — Global `SessionProvider` + `useSession()` hook
  - `recommendation.ts` — Distribution calculation and recommendation scoring
  - `format.ts` — Duration/date formatting helpers
  - `tab-direction.ts` — Module-level ref for tab swipe animation direction
- `global.css` — Tailwind v4 + NativeWind imports + all CSS design tokens (light + dark)

## Path Alias

`@/*` maps to the workspace root. Example: `import { AppButton } from '@/components/ui/app-button'`

## Styling Conventions

NativeWind v5 Tailwind classes throughout. **Do not use hardcoded color values** — use semantic design tokens defined in `global.css`:

| Token                                                     | Usage                |
| --------------------------------------------------------- | -------------------- |
| `bg-primary` / `bg-secondary` / `bg-surface`              | Backgrounds (60/30%) |
| `border-border`                                           | Dividers and borders |
| `bg-accent` / `text-accent-foreground`                    | Primary CTAs         |
| `text-fg-primary` / `text-fg-secondary` / `text-fg-muted` | Text hierarchy       |

Use `useColorToken('--token-name')` (from `@/hooks/use-color-token`) when you need a raw color value (e.g., for icon `color` props).

## Icons

- **lucide-react-native** — main icon library (tabs, UI icons)
- **expo-symbols** via `@/components/ui/icon-symbol` — iOS SF Symbols (thin wrapper with Android fallback)

## Navigation

- Root: `Stack` with two screens: `(tabs)` and `(modals)/session`
- Session modal: multi-step inner `Stack` (`select → time-choice → active / auto-close / summary`)
- `router.push` to typed routes may need `as any` cast until Expo generates typed routes
- `unmountOnBlur: true` on `Tabs` — screens remount on focus, so use `useFocusEffect` (not `useEffect`) to load data

## Database

All timestamps stored as **Unix seconds** (not milliseconds). Two tables:

- `categories` — seeded at startup with 5 chess categories
- `sessions` — `status` ∈ `'active' | 'completed' | 'auto_closed'`

Access via `lib/sessions.ts` functions; never import from `lib/database.ts` directly in screens.

## Session State

`SessionProvider` in root layout manages the active session globally. Use `useSession()` hook — it handles elapsed timer, auto-close detection (>60 min), and app resume refresh.

## Animations

react-native-reanimated v4. `AppButton` (`@/components/ui/app-button`) has built-in press-scale animation — use it instead of plain `Pressable` for interactive elements.

## Common Patterns

```tsx
// Load data on screen focus
useFocusEffect(useCallback(() => { async function load() { … } load() }, []))

// Get design token for icon color
const color = useColorToken('--fg-secondary')

// Navigate to session modal with preselected category
router.push({ pathname: '/session', params: { category: String(catId) } } as any)
```
