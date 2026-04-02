# puja-mfe

## Owns
- `PujaHomeScreen`
- `PujaNavigatorScreen`
- `StepDetailScreen`
- `SamagriScreen`

## Public API
- `index.ts` exports puja screens.

## Depends On
- `PujaContext`
- `AudioContext`
- `PujaService`
- `ProfileService`

## Rules
- Do not import `data/pujaData` directly from screens.
- Use `PujaService` accessors.
