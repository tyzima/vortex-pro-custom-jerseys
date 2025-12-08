
import { SportDefinition } from '../../types';
import { basketball } from './basketball';
import { soccer } from './soccer';
import { lacrosse } from './lacrosse';

// The Library Registry
// To add a new sport, import it above and add it to this object.
export const SPORTS_LIBRARY: Record<string, SportDefinition> = {
    basketball,
    soccer,
    lacrosse,
    // 'general' (Training) can reuse soccer or be its own file.
    // For now, we'll map training to soccer logic but give it a different label if we want,
    // or just alias it here.
    general: { ...soccer, id: 'general', label: 'Training' }
};
