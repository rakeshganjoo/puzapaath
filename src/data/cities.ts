/**
 * src/data/cities.ts — Single Source of Truth for the city list.
 *
 * Previously duplicated identically in:
 *   - src/screens/MuhuratInputScreen.tsx
 *   - src/screens/TekniInputScreen.tsx
 *
 * Both screens now import CITIES from here.
 */

import type { CityLocation } from '../types/common';

export const CITIES: CityLocation[] = [
  { label: 'Srinagar, Kashmir',  lat: 34.0837, lng: 74.7973,   tz: 'Asia/Kolkata' },
  { label: 'Jammu',              lat: 32.7266, lng: 74.8570,   tz: 'Asia/Kolkata' },
  { label: 'New Delhi',          lat: 28.6139, lng: 77.2090,   tz: 'Asia/Kolkata' },
  { label: 'Mumbai',             lat: 19.0760, lng: 72.8777,   tz: 'Asia/Kolkata' },
  { label: 'Bangalore',          lat: 12.9716, lng: 77.5946,   tz: 'Asia/Kolkata' },
  { label: 'Pune',               lat: 18.5204, lng: 73.8567,   tz: 'Asia/Kolkata' },
  { label: 'Hyderabad',          lat: 17.3850, lng: 78.4867,   tz: 'Asia/Kolkata' },
  { label: 'Chennai',            lat: 13.0827, lng: 80.2707,   tz: 'Asia/Kolkata' },
  { label: 'Kolkata',            lat: 22.5726, lng: 88.3639,   tz: 'Asia/Kolkata' },
  { label: 'Lucknow',            lat: 26.8467, lng: 80.9462,   tz: 'Asia/Kolkata' },
  { label: 'San Francisco, USA', lat: 37.7749, lng: -122.4194, tz: 'America/Los_Angeles' },
  { label: 'New York, USA',      lat: 40.7128, lng: -74.0060,  tz: 'America/New_York' },
  { label: 'London, UK',         lat: 51.5074, lng: -0.1278,   tz: 'Europe/London' },
  { label: 'Dubai, UAE',         lat: 25.2048, lng: 55.2708,   tz: 'Asia/Dubai' },
  { label: 'Singapore',          lat: 1.3521,  lng: 103.8198,  tz: 'Asia/Singapore' },
];
