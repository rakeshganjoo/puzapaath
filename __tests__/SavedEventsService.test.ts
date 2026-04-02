jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

const mockAsyncStorage: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockAsyncStorage[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => { mockAsyncStorage[key] = value; }),
    removeItem: jest.fn(async (key: string) => { delete mockAsyncStorage[key]; }),
    clear: jest.fn(async () => { Object.keys(mockAsyncStorage).forEach((k) => delete mockAsyncStorage[k]); }),
  },
}));

describe('SavedEventsService', () => {
  beforeEach(() => {
    Object.keys(mockAsyncStorage).forEach((k) => delete mockAsyncStorage[k]);
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('stores and reads events only for the active profile', async () => {
    const profileSvc = require('../src/services/ProfileService') as typeof import('../src/services/ProfileService');
    const eventsSvc = require('../src/services/SavedEventsService') as typeof import('../src/services/SavedEventsService');

    const profileA: import('../src/services/ProfileService').UserProfile = {
      id: 'profile_a',
      personName: 'Asha',
      gotra: 'Kashyap',
      lunarMonth: 'Chaitra',
      paksha: 'shukla',
      tithi: 'Shashthi (6)',
      day: 'Somvar',
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    };

    const profileB: import('../src/services/ProfileService').UserProfile = {
      ...profileA,
      id: 'profile_b',
      personName: 'Bharat',
    };

    await profileSvc.saveProfile(profileA);
    await profileSvc.saveProfile(profileB);

    await profileSvc.setActiveProfile(profileA.id);
    await eventsSvc.hydrateAsync();
    await eventsSvc.refreshProfileScope();

    eventsSvc.addEvent({
      name: 'Asha Birthday',
      type: 'birthday',
      lunarMonth: 'Chaitra',
      paksha: 'shukla',
      tithiNum: 6,
      emoji: '🎂',
    });

    expect(eventsSvc.getAllEvents()).toHaveLength(1);
    expect(eventsSvc.getAllEvents()[0].profileId).toBe(profileA.id);

    await profileSvc.setActiveProfile(profileB.id);
    await eventsSvc.refreshProfileScope();

    expect(eventsSvc.getAllEvents()).toEqual([]);

    eventsSvc.addEvent({
      name: 'Bharat Anniversary',
      type: 'anniversary',
      lunarMonth: 'Vaishakh',
      paksha: 'krishna',
      tithiNum: 3,
      emoji: '❤️',
    });

    expect(eventsSvc.getAllEvents()).toHaveLength(1);
    expect(eventsSvc.getAllEvents()[0].profileId).toBe(profileB.id);
    expect(eventsSvc.getAllEventsForAllProfiles()).toHaveLength(2);

    await profileSvc.setActiveProfile(profileA.id);
    await eventsSvc.refreshProfileScope();

    expect(eventsSvc.getAllEvents()).toHaveLength(1);
    expect(eventsSvc.getAllEvents()[0].name).toBe('Asha Birthday');
  });
});