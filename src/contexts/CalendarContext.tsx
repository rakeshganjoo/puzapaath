/**
 * src/contexts/CalendarContext.tsx — Calendar state management.
 *
 * Calendar state and persistence wiring used by calendar screens.
 *
 * Usage:
 *   const { year, month, setMonth, userEvents } = useCalendar();
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { SavedEvent } from '../services/SavedEventsService';
import {
  hydrateAsync,
  refreshProfileScope,
  getAllEvents,
  addEvent as svcAddEvent,
  updateEvent as svcUpdateEvent,
  deleteEvent as svcDeleteEvent,
} from '../services/SavedEventsService';
import { subscribeActiveProfile } from '../services/ProfileService';

interface CalendarState {
  year: number;
  month: number; // 0-based (JS Date)
  selectedDateStr: string | null; // 'YYYY-MM-DD'
  userEvents: SavedEvent[];
  filters: {
    showFestivals: boolean;
    showObservances: boolean;
  };
}

interface CalendarContextValue extends CalendarState {
  setMonth: (year: number, month: number) => void;
  selectDate: (dateStr: string | null) => void;
  setUserEvents: (events: SavedEvent[]) => void;
  setFilter: (key: keyof CalendarState['filters'], value: boolean) => void;
  addUserEvent: (event: Omit<SavedEvent, 'id' | 'createdAt' | 'profileId'>) => boolean;
  deleteUserEvent: (id: string) => void;
}

const now = new Date();

const DEFAULT_STATE: CalendarState = {
  year: now.getFullYear(),
  month: now.getMonth(),
  selectedDateStr: null,
  userEvents: [],
  filters: {
    showFestivals: true,
    showObservances: true,
  },
};

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CalendarState>(DEFAULT_STATE);

  // Phase 3: Hydrate events from persistent storage on mount
  useEffect(() => {
    hydrateAsync().then(() => {
      setState((s) => ({ ...s, userEvents: getAllEvents() }));
    });

    const unsubscribe = subscribeActiveProfile(async () => {
      await refreshProfileScope();
      setState((s) => ({ ...s, userEvents: getAllEvents() }));
    });

    return unsubscribe;
  }, []);

  const setMonth = useCallback((year: number, month: number) => {
    setState((s) => ({ ...s, year, month }));
  }, []);

  const selectDate = useCallback((dateStr: string | null) => {
    setState((s) => ({ ...s, selectedDateStr: dateStr }));
  }, []);

  const setUserEvents = useCallback((events: SavedEvent[]) => {
    setState((s) => ({ ...s, userEvents: events }));
  }, []);

  const setFilter = useCallback(
    (key: keyof CalendarState['filters'], value: boolean) => {
      setState((s) => ({
        ...s,
        filters: { ...s.filters, [key]: value },
      }));
    },
    [],
  );

  const addUserEvent = useCallback((event: Omit<SavedEvent, 'id' | 'createdAt' | 'profileId'>) => {
    try {
      svcAddEvent(event);
      setState((s) => ({ ...s, userEvents: getAllEvents() }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const deleteUserEvent = useCallback((id: string) => {
    svcDeleteEvent(id);
    setState((s) => ({ ...s, userEvents: getAllEvents() }));
  }, []);

  const value: CalendarContextValue = {
    ...state,
    setMonth,
    selectDate,
    setUserEvents,
    setFilter,
    addUserEvent,
    deleteUserEvent,
  };

  return (
    <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
  );
}

export function useCalendar(): CalendarContextValue {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error('useCalendar() must be used inside <CalendarProvider>');
  }
  return ctx;
}
