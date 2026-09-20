export type NoteType = 'DONE' | 'PLAN' | 'BLOCKER';

export interface Note {
  id: string;
  text: string;
  type: NoteType;

  // The work date this note belongs to. Format: YYYY-MM-DD.
  // Deliberately separate from createdAt: you can log on Sep 20 for Sep 18.
  date: string;

  project?: string;

  // Relevant mainly for BLOCKER notes.
  resolved: boolean;

  createdAt: string;
  updatedAt: string;
}

// What the caller provides when creating a note; the storage layer fills in the rest.
export type NewNoteInput = Pick<Note, 'text' | 'type' | 'date'> & { project?: string };

// Fields that can change on an existing note.
export type NoteUpdate = Partial<Pick<Note, 'text' | 'type' | 'date' | 'project' | 'resolved'>>;
