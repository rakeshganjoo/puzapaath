import type { MuhuratEventType, MuhuratEventCategory } from '../types/muhurat';

export interface MuhuratEventGroup {
  category: MuhuratEventCategory;
  title: string;
  icon: string;
  events: MuhuratEventType[];
}

export const MUHURAT_EVENTS: MuhuratEventGroup[] = [
  {
    category: 'samskara',
    title: 'Samskaras (Life Milestones)',
    icon: '🪷',
    events: [
      { id: 'marriage', name: 'Marriage / Wedding', category: 'samskara', kpName: 'Khandar / Lagan', icon: '💍' },
      { id: 'engagement', name: 'Engagement', category: 'samskara', kpName: 'Kasamdri / Vaagdan', icon: '💑' },
      { id: 'yagnopavit', name: 'Yagnopavit / Mekhal', category: 'samskara', kpName: 'Mekhal', icon: '🧵' },
      { id: 'naming', name: 'Naming Ceremony', category: 'samskara', kpName: 'Naam Karan', icon: '👶' },
      { id: 'annaprashan', name: 'Feeding Baby First Time', category: 'samskara', kpName: 'Annaprashan', icon: '🍚' },
      { id: 'mundan', name: 'Mundan (First Haircut)', category: 'samskara', icon: '✂️' },
      { id: 'vidya_arambh', name: 'Vidya Arambh (Education)', category: 'samskara', icon: '📖' },
      { id: 'griha_pravesh', name: 'Griha Pravesh', category: 'samskara', kpName: 'Griha Pravesh', icon: '🏠' },
    ],
  },
  {
    category: 'material',
    title: 'Material / Worldly',
    icon: '🌍',
    events: [
      { id: 'vehicle', name: 'New Vehicle Purchase', category: 'material', icon: '🚗' },
      { id: 'property', name: 'Property Purchase', category: 'material', icon: '🏘️' },
      { id: 'business', name: 'New Business Launch', category: 'material', icon: '🏢' },
      { id: 'job', name: 'Job Joining', category: 'material', icon: '💼' },
      { id: 'travel', name: 'Travel / Migration', category: 'material', icon: '✈️' },
      { id: 'school', name: 'School Admission', category: 'material', icon: '🎒' },
      { id: 'investment', name: 'Investment / Financial', category: 'material', icon: '💰' },
      { id: 'medical', name: 'Medical Treatment', category: 'material', icon: '🏥' },
      { id: 'legal', name: 'Legal Matters', category: 'material', icon: '⚖️' },
    ],
  },
  {
    category: 'religious',
    title: 'Religious / Spiritual',
    icon: '🙏',
    events: [
      { id: 'puja', name: 'Puja / Havan', category: 'religious', icon: '🪔' },
      { id: 'deeksha', name: 'Mantra Deeksha', category: 'religious', icon: '🕉️' },
      { id: 'pilgrimage', name: 'Pilgrimage / Yatra', category: 'religious', icon: '⛰️' },
      { id: 'donation', name: 'Donation / Daan', category: 'religious', icon: '🎁' },
    ],
  },
];

/** Flat list of all events */
export const ALL_MUHURAT_EVENTS: MuhuratEventType[] = MUHURAT_EVENTS.flatMap(g => g.events);

/** Look up by ID */
export function getMuhuratEvent(id: string): MuhuratEventType | undefined {
  return ALL_MUHURAT_EVENTS.find(e => e.id === id);
}

/** Whether the event typically involves two people (e.g. marriage) */
export function needsSecondPerson(eventId: string): boolean {
  return ['marriage', 'engagement'].includes(eventId);
}
