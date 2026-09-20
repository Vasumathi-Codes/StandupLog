import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, LayoutAnimation } from 'react-native';

import { CalendarView } from '@/components/CalendarView';
import { DayNotes } from '@/components/DayNotes';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useNoteActions } from '@/hooks/useNoteActions';
import { useNotes } from '@/hooks/useNotes';
import { useTheme } from '@/hooks/useTheme';
import { addMonths, currentYearMonth, todayString } from '@/utils/date';
import { summarizeByDate } from '@/utils/notes';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const { notes, loading, error, reload } = useNotes();
  const { edit, openMenu, resolve } = useNoteActions(reload);
  const [visibleMonth, setVisibleMonth] = useState(currentYearMonth);
  const [selectedDate, setSelectedDate] = useState(todayString);

  const summaries = useMemo(() => summarizeByDate(notes), [notes]);
  const dayNotes = useMemo(() => notes.filter((note) => note.date === selectedDate), [notes, selectedDate]);

  const selectDate = (date: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedDate(date);
  };

  const goToToday = () => {
    setVisibleMonth(currentYearMonth());
    selectDate(todayString());
  };

  return (
    <Screen>
      <ScreenHeader title="Calendar" subtitle="Your work journal" />

      <CalendarView
        visibleMonth={visibleMonth}
        selectedDate={selectedDate}
        summaries={summaries}
        onSelectDate={selectDate}
        onChangeMonth={(delta) => setVisibleMonth((month) => addMonths(month, delta))}
        onGoToToday={goToToday}
      />

      {loading && <ActivityIndicator color={colors.primary} />}
      {!loading && error && <EmptyState icon="alert-circle-outline" title="Couldn't load updates" message={error} />}
      {!loading && !error && (
        <DayNotes
          date={selectedDate}
          notes={dayNotes}
          // The selected date, not today, is what the new note gets.
          onAdd={() => router.push({ pathname: '/add-note', params: { date: selectedDate } })}
          onEdit={edit}
          onMore={openMenu}
          onResolve={resolve}
        />
      )}
    </Screen>
  );
}
