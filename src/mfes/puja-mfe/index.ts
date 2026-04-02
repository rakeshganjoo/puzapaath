/**
 * puja-mfe — Guided Janam Din Puja workflow.
 *
 * Owns:
 *   - PujaHomeScreen      — profile selector + puja entry point
 *   - PujaNavigatorScreen — part/step navigator (A/B/C) 
 *   - StepDetailScreen    — individual step with mantra + narration playback
 *   - SamagriScreen       — samagri (materials) checklist
 *
 * Dependencies:
 *   - PujaContext (via usePuja())
 *   - AudioContext (via useAudio())
 *   - PujaService (lazy pujaData loader)
 *   - ProfileService (via PujaContext.activeProfile)
 *
 * Boundary rules:
 *   - All puja data access goes through PujaService (not direct pujaData import)
 *   - Audio playback goes through AudioContext (not AudioService directly)
 *   - Profile persistence goes through PujaContext.refreshProfile()
 */

export { default as PujaHomeScreen } from '../../screens/PujaHomeScreen';
export { default as PujaNavigatorScreen } from '../../screens/PujaNavigatorScreen';
export { default as StepDetailScreen } from '../../screens/StepDetailScreen';
export { default as SamagriScreen } from '../../screens/SamagriScreen';
