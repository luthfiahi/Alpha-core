'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ListChecks,
  Circle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { PlaybookChecklist } from './types';

interface PlaybookChecklistEditorProps {
  playbookId: string;
  checklists: PlaybookChecklist[];
}

export function PlaybookChecklistEditor({
  playbookId,
  checklists,
}: PlaybookChecklistEditorProps) {
  const qc = useQueryClient();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(checklists.map((c) => c.id))
  );
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [newClTitle, setNewClTitle] = useState('');
  const [newClDesc, setNewClDesc] = useState('');

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addChecklistMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const res = await fetch(`/api/playbooks/${playbookId}/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Gagal menambah checklist');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playbook', playbookId] });
      toast.success('Checklist berhasil ditambahkan');
      setIsAddingChecklist(false);
      setNewClTitle('');
      setNewClDesc('');
    },
    onError: () => toast.error('Gagal menambah checklist'),
  });

  const deleteChecklistMutation = useMutation({
    mutationFn: async (checklistId: string) => {
      const res = await fetch(
        `/api/playbooks/${playbookId}/checklists?checklistId=${checklistId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Gagal menghapus checklist');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playbook', playbookId] });
      toast.success('Checklist dihapus');
    },
    onError: () => toast.error('Gagal menghapus checklist'),
  });

  const addItemMutation = useMutation({
    mutationFn: async ({
      checklistId,
      text,
    }: {
      checklistId: string;
      text: string;
    }) => {
      const res = await fetch(
        `/api/playbooks/${playbookId}/checklists/${checklistId}/items`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        }
      );
      if (!res.ok) throw new Error('Gagal menambah item');
      return res.json();
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['playbook', playbookId] });
      setNewItemText((prev) => ({ ...prev, [variables.checklistId]: '' }));
      toast.success('Item ditambahkan');
    },
    onError: () => toast.error('Gagal menambah item'),
  });

  const deleteItemMutation = useMutation({
    mutationFn: async ({
      checklistId,
      itemId,
    }: {
      checklistId: string;
      itemId: string;
    }) => {
      const res = await fetch(
        `/api/playbooks/${playbookId}/checklists/${checklistId}/items?itemId=${itemId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Gagal menghapus item');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playbook', playbookId] });
      toast.success('Item dihapus');
    },
    onError: () => toast.error('Gagal menghapus item'),
  });

  const moveChecklistMutation = useMutation({
    mutationFn: async ({
      checklistId,
      direction,
    }: {
      checklistId: string;
      direction: 'up' | 'down';
    }) => {
      const currentOrder = checklists.map((c, i) => ({
        id: c.id,
        sortOrder: i,
      }));
      const idx = currentOrder.findIndex((o) => o.id === checklistId);
      if (direction === 'up' && idx > 0) {
        [currentOrder[idx - 1], currentOrder[idx]] = [
          currentOrder[idx],
          currentOrder[idx - 1],
        ];
      } else if (direction === 'down' && idx < currentOrder.length - 1) {
        [currentOrder[idx], currentOrder[idx + 1]] = [
          currentOrder[idx + 1],
          currentOrder[idx],
        ];
      }
      const res = await fetch(`/api/playbooks/${playbookId}/checklists`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: currentOrder }),
      });
      if (!res.ok) throw new Error('Gagal mengubah urutan');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playbook', playbookId] });
    },
  });

  const moveItemMutation = useMutation({
    mutationFn: async ({
      checklistId,
      itemId,
      direction,
    }: {
      checklistId: string;
      itemId: string;
      direction: 'up' | 'down';
    }) => {
      const checklist = checklists.find((c) => c.id === checklistId);
      if (!checklist) return;
      const currentOrder = checklist.items.map((item, i) => ({
        id: item.id,
        sortOrder: i,
      }));
      const idx = currentOrder.findIndex((o) => o.id === itemId);
      if (direction === 'up' && idx > 0) {
        [currentOrder[idx - 1], currentOrder[idx]] = [
          currentOrder[idx],
          currentOrder[idx - 1],
        ];
      } else if (direction === 'down' && idx < currentOrder.length - 1) {
        [currentOrder[idx], currentOrder[idx + 1]] = [
          currentOrder[idx + 1],
          currentOrder[idx],
        ];
      }
      const res = await fetch(
        `/api/playbooks/${playbookId}/checklists/${checklistId}/items`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orders: currentOrder }),
        }
      );
      if (!res.ok) throw new Error('Gagal mengubah urutan item');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playbook', playbookId] });
    },
  });

  const handleAddItem = (checklistId: string) => {
    const text = newItemText[checklistId]?.trim();
    if (!text) return;
    addItemMutation.mutate({ checklistId, text });
  };

  return (
    <div className="space-y-3">
      {checklists.map((cl, clIdx) => {
        const isExpanded = expandedSections.has(cl.id);
        return (
          <div
            key={cl.id}
            className="bg-[#151827] border border-[#232636] rounded-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3">
              <button
                className="shrink-0 cursor-grab active:cursor-grabbing text-[#4B5563] hover:text-[#9CA3AF] transition-colors p-0.5 alpha-press"
                title="Drag to reorder"
              >
                <GripVertical className="size-4" />
              </button>
              <button
                className="shrink-0 text-[#6B7280] hover:text-[#F3F4F6] transition-colors alpha-press"
                onClick={() => toggleSection(cl.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </button>
              <div
                className="flex-1 min-w-0"
                onClick={() => toggleSection(cl.id)}
              >
                <div className="flex items-center gap-2">
                  <ListChecks className="size-4 text-[#6B7280] shrink-0" />
                  <h4 className="alpha-heading-sm text-[#F3F4F6] truncate">
                    {cl.title}
                  </h4>
                  <span className="alpha-caption shrink-0">
                    ({cl.items.length})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-[#4B5563] hover:text-[#9CA3AF] hover:bg-[#1E2030] alpha-press"
                  onClick={() =>
                    moveChecklistMutation.mutate({
                      checklistId: cl.id,
                      direction: 'up',
                    })
                  }
                  disabled={clIdx === 0}
                >
                  <ChevronUp className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-[#4B5563] hover:text-[#9CA3AF] hover:bg-[#1E2030] alpha-press"
                  onClick={() =>
                    moveChecklistMutation.mutate({
                      checklistId: cl.id,
                      direction: 'down',
                    })
                  }
                  disabled={clIdx === checklists.length - 1}
                >
                  <ChevronDown className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-[#4B5563] hover:text-red-400 hover:bg-red-400/10 alpha-press"
                  onClick={() => deleteChecklistMutation.mutate(cl.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-[#232636]">
                {cl.description && (
                  <p className="px-4 pt-3 alpha-caption leading-relaxed">
                    {cl.description}
                  </p>
                )}
                <div className="px-4 py-2 space-y-1">
                  {cl.items.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      className="group/item flex items-start gap-2.5 py-1.5 px-2 rounded-lg hover:bg-[#1E2030] transition-all alpha-row-hover"
                    >
                      <div className="mt-0.5 shrink-0 flex h-[18px] w-[18px] items-center justify-center rounded border border-[#6366F1]/25 bg-[#6366F1]/5">
                        <CheckCircle2 className="size-3 text-[#818CF8]/70" />
                      </div>
                      <span className="flex-1 text-xs text-[#D1D5DB] leading-relaxed">
                        {item.text}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-5 text-[#4B5563] hover:text-[#9CA3AF] hover:bg-[#252840] alpha-press"
                          onClick={() =>
                            moveItemMutation.mutate({
                              checklistId: cl.id,
                              itemId: item.id,
                              direction: 'up',
                            })
                          }
                          disabled={itemIdx === 0}
                        >
                          <ChevronUp className="size-2.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-5 text-[#4B5563] hover:text-[#9CA3AF] hover:bg-[#252840] alpha-press"
                          onClick={() =>
                            moveItemMutation.mutate({
                              checklistId: cl.id,
                              itemId: item.id,
                              direction: 'down',
                            })
                          }
                          disabled={itemIdx === cl.items.length - 1}
                        >
                          <ChevronDown className="size-2.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-5 text-[#4B5563] hover:text-red-400 hover:bg-red-400/10 alpha-press"
                          onClick={() =>
                            deleteItemMutation.mutate({
                              checklistId: cl.id,
                              itemId: item.id,
                            })
                          }
                        >
                          <Trash2 className="size-2.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {cl.items.length === 0 && (
                    <div className="flex items-center gap-2 py-3 px-2 alpha-caption text-[#4B5563]">
                      <Circle className="size-3" />
                      <span>Belum ada item</span>
                    </div>
                  )}
                </div>
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-[#6366F1]/30 bg-[#6366F1]/5">
                      <Circle className="size-3 text-[#4B5563]" />
                    </div>
                    <Input
                      value={newItemText[cl.id] || ''}
                      onChange={(e) =>
                        setNewItemText((prev) => ({
                          ...prev,
                          [cl.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem(cl.id);
                        }
                      }}
                      placeholder="Tambah item baru..."
                      className="h-7 text-xs bg-[#10121E] border-[#232636] text-[#D1D5DB] placeholder:text-[#4B5563] focus-visible:ring-[#6366F1]/30 focus-visible:border-[#6366F1]/40 alpha-focus-ring"
                    />
                    <Button
                      size="icon"
                      className="size-7 shrink-0 bg-[#6366F1]/15 hover:bg-[#6366F1]/25 text-[#818CF8] hover:text-[#F3F4F6] border border-[#6366F1]/25 alpha-press"
                      onClick={() => handleAddItem(cl.id)}
                      disabled={!newItemText[cl.id]?.trim()}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {isAddingChecklist ? (
        <div className="bg-[#151827] border border-[#232636] rounded-xl p-4 space-y-3">
          <Input
            value={newClTitle}
            onChange={(e) => setNewClTitle(e.target.value)}
            placeholder="Judul checklist"
            className="h-8 text-xs bg-[#10121E] border-[#232636] text-[#F3F4F6] placeholder:text-[#4B5563] focus-visible:ring-[#6366F1]/30 focus-visible:border-[#6366F1]/40 alpha-focus-ring"
            autoFocus
          />
          <Textarea
            value={newClDesc}
            onChange={(e) => setNewClDesc(e.target.value)}
            placeholder="Deskripsi (opsional)"
            className="min-h-[60px] text-xs bg-[#10121E] border-[#232636] text-[#D1D5DB] placeholder:text-[#4B5563] focus-visible:ring-[#6366F1]/30 focus-visible:border-[#6366F1]/40 resize-none alpha-focus-ring"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 text-xs bg-[#6366F1] hover:bg-[#818CF8] text-white alpha-press"
              onClick={() =>
                addChecklistMutation.mutate({
                  title: newClTitle,
                  description: newClDesc || undefined,
                })
              }
              disabled={!newClTitle.trim() || addChecklistMutation.isPending}
            >
              <Plus className="size-3 mr-1" />
              Tambah Checklist
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-[#9CA3AF] hover:text-[#F3F4F6] alpha-press"
              onClick={() => {
                setIsAddingChecklist(false);
                setNewClTitle('');
                setNewClDesc('');
              }}
            >
              Batal
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          className="w-full h-9 border border-dashed border-[#232636] text-[#6B7280] hover:text-[#9CA3AF] hover:border-[#363A50] hover:bg-transparent alpha-caption alpha-press"
          onClick={() => setIsAddingChecklist(true)}
        >
          <Plus className="size-3.5 mr-1.5" />
          Tambah Checklist
        </Button>
      )}
    </div>
  );
}
