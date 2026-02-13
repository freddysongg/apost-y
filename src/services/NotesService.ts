import { NoteSet } from '@/types';

export class NotesService {
  buildSystemPrompt(systemPrompt: string, noteSets: NoteSet[], activeIds: string[]): string {
    const activeNotes = noteSets.filter(ns => activeIds.includes(ns.id) && ns.enabled);
    if (activeNotes.length === 0) return systemPrompt;

    const notesSection = activeNotes.map(ns =>
      `## ${ns.name}\n---\n${ns.content}\n---`
    ).join('\n\n');

    return `${systemPrompt}\n\nREFERENCE NOTES:\n\n${notesSection}`;
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

export const notesService = new NotesService();
