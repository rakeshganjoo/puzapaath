// Types for PuzaPaath app

export type ScriptType = 'devanagari' | 'roman' | 'english';

export interface MantraText {
  devanagari: string;
  roman: string;
  english: string; // translation
}

export interface MantraWord {
  devanagari: string;
  roman: string;
  english: string;
}

export interface PujaStep {
  id: string;
  number: number;
  title: MantraText;
  subtitle?: string;
  instructions: string; // what to physically do
  mantra?: MantraText;
  mantraWords?: MantraWord[]; // word-by-word breakdown
  audioFile?: string; // path to bundled audio
  actionDescription?: string; // e.g. "sip water 3x from right palm"
  actionAnimation?: string; // asset name for animation/illustration
  isOptional: boolean; // for shortcut mode
  subSteps?: PujaSubStep[];
  duration?: number; // estimated seconds
}

export interface PujaSubStep {
  id: string;
  label: string;
  instructions: string;
  mantra?: MantraText;
  audioFile?: string;
}

export interface PujaPart {
  id: 'A' | 'B' | 'C';
  title: MantraText;
  subtitle: string;
  steps: PujaStep[];
}

export interface SamagriItem {
  id: string;
  name: MantraText;
  description: string;
  category: 'essential' | 'panchdashang' | 'food' | 'optional';
  image?: string;
  checked?: boolean;
}

export interface UserSession {
  personName: string;
  gotra: string;
  lunarMonth: string;
  paksha: 'krishna' | 'shukla';
  tithi: string;
  day: string;
  timeOfDay: 'pratah' | 'madhyam' | 'sayam';
  isShortVersion: boolean;
  currentPartId: 'A' | 'B' | 'C';
  currentStepIndex: number;
  completedSteps: string[];
  samagriChecked: string[];
  startedAt?: string;
}

export interface PujaData {
  title: MantraText;
  description: string;
  parts: PujaPart[];
  samagri: SamagriItem[];
}
