/**
 * home-mfe — App shell, home dashboard, profile setup.
 *
 * Owns:
 *   - HomeScreen   — main entry, navigation hub
 *   - SetupScreen  — first-run profile creation
 *
 * Boundary rules:
 *   - May import from shared-components and any service
 *   - Must NOT import directly from other MFE index files
 *   - Routing into this MFE is always via AppNavigator (global stack)
 */

export { default as HomeScreen } from '../../screens/HomeScreen';
export { default as SetupScreen } from '../../screens/SetupScreen';
