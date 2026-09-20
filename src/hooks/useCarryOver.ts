import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { dismissCarryOver, getCarryOverCandidates, getDismissedIds } from '@/services/carryOver';
import { addNote } from '@/services/storage';
import { Note } from '@/types/note';

// Suggested carried-over plans for `today`. Nothing is created until the user accepts.
export function useCarryOver(notes: Note[], today: string, enabled: boolean, reload: () => Promise<void>) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      getDismissedIds().then(setDismissedIds);
    }, []),
  );

  const candidates = useMemo(
    () => (enabled ? getCarryOverCandidates(notes, dismissedIds, today) : []),
    [enabled, notes, dismissedIds, today],
  );

  const accept = async (plan: Note) => {
    try {
      await addNote({ text: plan.text, type: 'PLAN', date: today, project: plan.project, carriedFrom: plan.id });
      await reload();
    } catch {
      Alert.alert('Could not carry over', 'Please try again.');
    }
  };

  const dismiss = async (plan: Note) => {
    try {
      await dismissCarryOver(plan.id);
      setDismissedIds((ids) => [...ids, plan.id]);
    } catch {
      Alert.alert('Could not dismiss', 'Please try again.');
    }
  };

  return { candidates, accept, dismiss };
}
