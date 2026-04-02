/**
 * tekni-mfe — Tekni (Kundali/birth chart) generation.
 *
 * Owns:
 *   - TekniScreen       — feature intro + entry point
 *   - TekniInputScreen  — birth details form (name, date, time, location)
 *   - TekniLoadingScreen — animated computation progress (delegates to TekniService)
 *   - TekniResultScreen — rendered HTML output with Print/PDF export button
 *
 * Dependencies:
 *   - TekniService.computeTekni() — deterministic kundali computation
 *   - TakniHTMLGenerator / TakniPDFGenerator — output renderers
 *   - CITIES from data/cities (SSoT)
 *   - GeocodingService for custom city lookup
 *
 * Boundary rules:
 *   - computeTekni is the ONLY import path for kundali data — never inline it
 *   - All output generation (HTML/PDF) goes through Takni*Generator services
 */

export { default as TekniScreen } from '../../screens/TekniScreen';
export { default as TekniInputScreen } from '../../screens/TekniInputScreen';
export { default as TekniLoadingScreen } from '../../screens/TekniLoadingScreen';
export { default as TekniResultScreen } from '../../screens/TekniScreen';
