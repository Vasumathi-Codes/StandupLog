import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, LayoutAnimation } from 'react-native';

import { CalendarView } from '@/components/CalendarView';
import { DayNotes } from '@/components/DayNotes';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ProjectChips } from '@/components/ProjectChips';
import { useNoteActions } from '@/hooks/useNoteActions';
import { useNotes } from '@/hooks/useNotes';
import { useProjects } from '@/hooks/useProjects';
import { useTheme } from '@/hooks/useTheme';
import { addMonths, currentYearMonth, todayString } from '@/utils/date';
import { matchesProject, summarizeByDate } from '@/utils/notes';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const { notes, loading, error, reload } = useNotes();
  const { edit, openMenu, resolve, saveGroupEdits } = useNoteActions(reload);
  const [visibleMonth, setVisibleMonth] = useState(currentYearMonth);
  const [selectedDate, setSelectedDate] = useState(todayString);

  const [project, setProject] = useState<string | null>(null);

  const { projects, addProject, removeProject } = useProjects(notes, reload);
  const visibleNotes = useMemo(() => notes.filter((note) => matchesProject(note, project)), [notes, project]);
  useEffect(() => {
    if (project && !projects.includes(project)) setProject(null);
  }, [projects, project]);

  const summaries = useMemo(() => summarizeByDate(visibleNotes), [visibleNotes]);
  const dayNotes = useMemo(() => visibleNotes.filter((note) => note.date === selectedDate), [visibleNotes, selectedDate]);

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

      <ProjectChips projects={projects} selected={project} onSelect={setProject} onAddProject={addProject} onRemoveProject={removeProject} />

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
          timesheetNotes={notes}
          // The selected date, not today, is what the new note gets.
          onAdd={() => router.push({ pathname: '/add-note', params: { date: selectedDate } })}
          onEdit={edit}
          onMore={openMenu}
          onResolve={resolve}
          onSaveEdits={saveGroupEdits}
        />
      )}
    </Screen>
  );
}
