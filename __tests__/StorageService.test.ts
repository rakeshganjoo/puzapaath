/**
 * StorageService unit tests
 *
 * Mocks AsyncStorage (native) and window.localStorage (web) to test the abstraction layer.
 */

// Mock react-native Platform and AsyncStorage BEFORE imports
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
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    mergeItem: jest.fn(),
    multiRemove: jest.fn(),
    getAllKeys: jest.fn(async () => Object.keys(mockAsyncStorage)),
  },
}));

import { get, set, remove, getJSON, setJSON } from '../src/services/StorageService';

beforeEach(() => {
  // Clear in-memory mock store before each test
  Object.keys(mockAsyncStorage).forEach((k) => delete mockAsyncStorage[k]);
  jest.clearAllMocks();
});

describe('StorageService — native (AsyncStorage) path', () => {
  test('set() stores a string value and get() retrieves it', async () => {
    await set('test_key', 'hello');
    const value = await get('test_key');
    expect(value).toBe('hello');
  });

  test('get() returns null for non-existent key', async () => {
    const value = await get('nonexistent_key');
    expect(value).toBeNull();
  });

  test('remove() deletes a stored key', async () => {
    await set('remove_me', 'value');
    await remove('remove_me');
    const value = await get('remove_me');
    expect(value).toBeNull();
  });

  test('setJSON() serialises and getJSON() deserialises an object', async () => {
    const obj = { name: 'Rakesh', age: 35, active: true };
    await setJSON('profile', obj);
    const retrieved = await getJSON<typeof obj>('profile');
    expect(retrieved).toEqual(obj);
  });

  test('getJSON() returns null when key does not exist', async () => {
    const result = await getJSON<{ x: number }>('missing');
    expect(result).toBeNull();
  });

  test('setJSON() overwrites a previous value', async () => {
    await setJSON('counter', { n: 1 });
    await setJSON('counter', { n: 2 });
    const result = await getJSON<{ n: number }>('counter');
    expect(result?.n).toBe(2);
  });

  test('multiple keys are independent', async () => {
    await set('key_a', 'alpha');
    await set('key_b', 'beta');
    expect(await get('key_a')).toBe('alpha');
    expect(await get('key_b')).toBe('beta');
  });
});
