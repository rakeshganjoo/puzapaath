/**
 * calendar-mfe — Hindu/Gregorian dual calendar with lunar events.
 *
 * Owns:
 *   - CalendarScreen          — main monthly calendar view
 *   - CalendarExplainerScreen — onboarding explainer for calendar features
 *
 * Dependencies:
 *   - CalendarContext (via useCalendar())
 *   - CalendarService (wrapped: HinduCalendar + CalendarExport)
 *   - SavedEventsService (via CalendarContext)
 *
 * Boundary rules:
 *   - All persistence goes through CalendarContext.addUserEvent / deleteUserEvent
 *   - Must NOT call SavedEventsService directly from screens
 */

export { default as CalendarScreen } from '../../screens/CalendarScreen';
export { default as CalendarExplainerScreen } from '../../screens/CalendarExplainerScreen';
