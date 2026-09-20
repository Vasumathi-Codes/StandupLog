import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { NoteCard } from '@/components/NoteCard';
import { ProjectChips } from '@/components/ProjectChips';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { fontSize, fontWeight, spacing } from '@/constants/theme';
import { useNoteActions } from '@/hooks/useNoteActions';
import { useNotes } from '@/hooks/useNotes';
import { useProjects } from '@/hooks/useProjects';
import { useTheme } from '@/hooks/useTheme';
import { formatMonthDay } from '@/utils/date';
import { groupByDate, searchNotes } from '@/utils/notes';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { notes, loading, error, reload } = useNotes();
  const { edit, openMenu, resolve } = useNoteActions(reload);
  const [query, setQuery] = useState('');
  const [project, setProject] = useState<string | null>(null);

  const { projects, addProject } = useProjects(notes);
  const results = useMemo(() => searchNotes(notes, query, project), [notes, query, project]);
  const groups = useMemo(() => groupByDate(results), [results]);
  const isFiltering = query.trim() !== '' || project !== null;

  return (
    <Screen edges={[]}>
      <SearchBar value={query} onChangeText={setQuery} />
      <ProjectChips projects={projects} selected={project} onSelect={setProject} onAddProject={addProject} />

      {loading && <ActivityIndicator color={colors.primary} />}
      {!loading && error && <EmptyState icon="alert-circle-outline" title="Couldn't load updates" message={error} />}

      {!loading && !error && results.length === 0 && (
        <EmptyState
          icon="search-outline"
          title={isFiltering ? 'No updates found' : 'Nothing to search yet'}
          message={isFiltering ? 'Try a different word or project.' : 'Add some updates and they will show up here.'}
        />
      )}

      {!loading &&
        !error &&
        groups.map((group) => (
          <View key={group.date} style={styles.group}>
            <Text accessibilityRole="header" style={[styles.date, { color: colors.textSecondary }]}>
              {formatMonthDay(group.date, true)}
            </Text>
            {group.notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                highlight={query}
                onPress={() => edit(note)}
                onMorePress={() => openMenu(note)}
                onResolve={() => resolve(note)}
              />
            ))}
          </View>
        ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.md },
  date: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
});
