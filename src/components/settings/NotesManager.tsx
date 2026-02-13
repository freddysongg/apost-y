import { useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit, FileText } from 'lucide-react';

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function NotesManager() {
  const noteSets = useSessionStore((s) => s.noteSets);
  const activeNoteSetIds = useSessionStore((s) => s.activeNoteSetIds);
  const addNoteSet = useSessionStore((s) => s.addNoteSet);
  const updateNoteSet = useSessionStore((s) => s.updateNoteSet);
  const deleteNoteSet = useSessionStore((s) => s.deleteNoteSet);
  const toggleNoteSet = useSessionStore((s) => s.toggleNoteSet);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setContent('');
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const ns = noteSets.find((n) => n.id === id);
    if (!ns) return;
    setEditingId(id);
    setName(ns.name);
    setContent(ns.content);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      updateNoteSet(editingId, { name: name.trim(), content });
    } else {
      addNoteSet(name.trim(), content);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Note Sets</Label>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Note Set
        </Button>
      </div>

      <div className="space-y-2">
        {noteSets.map((ns) => (
          <div
            key={ns.id}
            className="flex items-center justify-between gap-3 p-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]/30"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Switch
                checked={activeNoteSetIds.includes(ns.id)}
                onCheckedChange={() => toggleNoteSet(ns.id)}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <span className="font-medium text-sm truncate">{ns.name}</span>
                </div>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  ~{estimateTokens(ns.content)} tokens
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(ns.id)}>
                <Edit className="h-4 w-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Note Set</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{ns.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteNoteSet(ns.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}

        {noteSets.length === 0 && (
          <div className="text-center py-8 text-[hsl(var(--muted-foreground))] text-sm">
            No note sets yet. Add one to get started.
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Note Set' : 'Add Note Set'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the name and content of this note set.' : 'Create a new note set with reference material.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Note set name"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Content</Label>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  ~{estimateTokens(content)} tokens
                </span>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter reference notes, codes, procedures..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {editingId ? 'Save Changes' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
