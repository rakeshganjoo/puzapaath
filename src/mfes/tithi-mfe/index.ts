/**
 * tithi-mfe — Tithi (lunar day) calculator.
 *
 * Owns:
 *   - TithiCalculatorScreen — convert Gregorian ↔ Tithi + panchang details
 *
 * Dependencies:
 *   - HinduCalendar.gregorianToLunar (via CalendarService)
 *
 * Boundary rules:
 *   - Stateless — no shared context needed, all state is local
 *   - May re-use CalendarService but owns no storage
 */

export { default as TithiCalculatorScreen } from '../../screens/TithiCalculatorScreen';
