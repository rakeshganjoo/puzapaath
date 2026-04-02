# muhurat-mfe

## Owns
- `MuhuratEventPickerScreen`
- `MuhuratInputScreen`
- `MuhuratResultsScreen`

## Public API
- `index.ts` exports all muhurat screens.

## Depends On
- `MuhuratService`
- `MuhuratRulesEngine` (indirectly, via service)
- `GeocodingService`
- `data/cities`

## Rules
- Screens must import `calculateMuhurat` from `MuhuratService`, not `MuhuratEngine`.
