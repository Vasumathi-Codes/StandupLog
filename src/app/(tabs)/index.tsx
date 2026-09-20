// TEMPORARY Phase 2 test harness. Replaced by the real Today screen in Phase 3.
import { useCallback, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text } from 'react-native';

import { addNote, clearNotes, getNotes } from '@/services/storage';
import { Note } from '@/types/note';
import { todayString } from '@/utils/date';

export default function TodayScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [message, setMessage] = useState('Tap "Load notes" to read storage.');

  const load = useCallback(async () => {
    try {
      const all = await getNotes();
      setNotes(all);
      setMessage(`${all.length} note(s) in storage`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  const addTest = async (date: string) => {
    try {
      await addNote({ text: `Test note for ${date}`, type: 'DONE', date, project: 'Test' });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Load notes" onPress={load} />
      <Button title="Add DONE note for today" onPress={() => addTest(todayString())} />
      <Button title="Add DONE note for 2026-09-18" onPress={() => addTest('2026-09-18')} />
      <Button title="Add EMPTY note (should fail)" onPress={() => addNote({ text: '  ', type: 'DONE', date: todayString() }).catch((e: Error) => setMessage(e.message))} />
      <Button title="Clear all" color="red" onPress={async () => { await clearNotes(); await load(); }} />
      <Text style={styles.message}>{message}</Text>
      {notes.map((note) => (
        <Text key={note.id} style={styles.note}>
          {note.date} · {note.type} · {note.text}{'\n'}created {note.createdAt}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  message: { marginTop: 12, fontWeight: '600' },
  note: { fontSize: 13, color: '#444' },
});
