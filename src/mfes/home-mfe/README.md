# home-mfe

## Owns
- `HomeScreen`
- `SetupScreen`

## Public API
- `index.ts` exports home entry screens.

## Depends On
- `ProfileService`
- shared contexts (`UIContext`, `PujaContext`)

## Rules
- No direct imports from other MFE folders.
- Use services/contexts for state and persistence.
