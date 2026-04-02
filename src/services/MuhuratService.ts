/**
 * src/services/MuhuratService.ts — Public API for Muhurat calculation.
 *
 * Screens and contexts should import from here, NOT from MuhuratEngine directly.
 * Keeps screen code isolated from engine internals.
 */

export {
  calculateMuhurat,
  type MuhuratRequestParams,
} from './MuhuratRulesEngine';
