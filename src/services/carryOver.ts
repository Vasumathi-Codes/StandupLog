import AsyncStorage from '@react-native-async-storage/async-storage';

import { Note } from '@/types/note';
import { addDays } from '@/utils/date';

const DISMISSED_KEY = 'standuplog:carryover-dismissed:v1';
// How far back we look for unfinished plans.
const LOOKBACK_DAYS = 7;

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

// Plans from the last week that look unfinished and haven't been handled yet.
// A plan is NOT suggested if:
//  - a DONE note with the same text exists on or after its date (treated as completed)
//  - it was already carried over (a plan with carriedFrom === its id exists)
//  - the user dismissed it
export function getCarryOverCandidates(notes: Note[], dismissedIds: string[], today: string): Note[] {
  const earliest = addDays(today, -LOOKBACK_DAYS);
  const carriedIds = new Set(notes.map((n) => n.carriedFrom).filter(Boolean));
  const dismissed = new Set(dismissedIds);

  return notes
    .filter((plan) => plan.type === 'PLAN' && plan.date < today && plan.date >= earliest)
    .filter((plan) => !carriedIds.has(plan.id) && !dismissed.has(plan.id))
    .filter(
      (plan) => !notes.some((n) => n.type === 'DONE' && n.date >= plan.date && normalize(n.text) === normalize(plan.text)),
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
}

export async function getDismissedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(DISMISSED_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch (error) {
    console.error('[carryOver] load dismissed failed', error);
    return [];
  }
}

export async function dismissCarryOver(id: string): Promise<void> {
  const ids = await getDismissedIds();
  await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify([...new Set([...ids, id])]));
}
