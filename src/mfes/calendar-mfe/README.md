# calendar-mfe

## Owns
- `CalendarScreen`
- `CalendarExplainerScreen`

## Public API
- `index.ts` exports calendar screens.

## Depends On
- `CalendarContext`
- `CalendarService`
- `SavedEventsService` (through context/service boundary)

## Rules
- No direct storage access in screens.
- Event persistence must go through context/service APIs.
