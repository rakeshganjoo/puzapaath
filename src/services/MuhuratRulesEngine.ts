/**
 * src/services/MuhuratRulesEngine.ts — Pure muhurat scoring rules.
 *
 * This is MuhuratEngine.ts renamed to clarify its role:
 * it contains the scoring algorithms and candidate generation logic.
 * It has NO side effects and NO React dependencies.
 *
 * For backwards compatibility, MuhuratEngine.ts re-exports everything from here.
 * All new code should import from MuhuratRulesEngine or MuhuratService.
 */

// Re-export the full engine — the real implementation lives in MuhuratEngine.ts
// (kept to avoid a risky large rename mid-refactor; will be the source after Phase 5)
export {
  calculateMuhurat,
  type MuhuratRequestParams,
} from './MuhuratEngine';
