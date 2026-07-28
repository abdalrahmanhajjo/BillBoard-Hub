'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { MOCK_RESERVATIONS } from '../mock/reservations';
import type { Reservation } from '../types/reservation';

export type ReservationTab = 'all' | 'active' | 'completed' | 'cancelled';

export function useReservations() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<ReservationTab>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredReservations = useMemo(() => {
    let filtered = MOCK_RESERVATIONS;

    if (activeTab === 'active') {
      filtered = filtered.filter(
        (r) => r.status === 'pending' || r.status === 'approved' || r.status === 'running',
      );
    } else if (activeTab === 'completed') {
      filtered = filtered.filter((r) => r.status === 'completed');
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter((r) => r.status === 'cancelled');
    }

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.id.toLowerCase().includes(query) ||
          r.billboardName.toLowerCase().includes(query) ||
          r.billboardLocation.toLowerCase().includes(query),
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter((r) => r.status === status);
    }

    return filtered;
  }, [activeTab, search, status]);

  const summary = useMemo(() => {
    const all = MOCK_RESERVATIONS;
    return {
      total: all.length,
      pending: all.filter((r) => r.status === 'pending').length,
      running: all.filter((r) => r.status === 'running').length,
      completed: all.filter((r) => r.status === 'completed').length,
      cancelled: all.filter((r) => r.status === 'cancelled').length,
    };
  }, []);

  const selectReservation = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedReservation(null);
  }, []);

  return {
    reservations: filteredReservations,
    summary,
    isLoading,
    selectedReservation,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    status,
    setStatus,
    selectReservation,
    clearSelection,
    allReservations: MOCK_RESERVATIONS,
  };
}
