'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { PlaybookChecklistEditor } from './PlaybookChecklistEditor';
import { PlaybookTradeCompliance } from './PlaybookTradeCompliance';
import { SESSION_TYPE_OPTIONS } from './types';
import type { PlaybookDetail, SessionType } from './types';

interface PlaybookEditorProps {
  playbook: PlaybookDetail;
  onBack: () => void;
}

export function PlaybookEditor({ playbook, onBack }: PlaybookEditorProps) {
  const qc = useQueryClient();
  const [name, setName] = useState(playbook.name);
  const [description, setDescription] = useState(playbook.description || '');
  const [sessionType, setSessionType] = useState<SessionType>(
    playbook.sessionType
  );
  const hasChanges = useMemo(
    () =>
      name !== playbook.name ||
      (description || '') !== (playbook.description || '') ||
      sessionType !== playbook.sessionType,
    [name, description, sessionType, playbook.name, playbook.description, playbook.sessionType]
  );

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/playbooks/${playbook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, sessionType }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan playbook');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playbook', playbook.id] });
      qc.invalidateQueries({ queryKey: ['playbooks'] });
      toast.success('Playbook berhasil disimpan');
    },
    onError: () => toast.error('Gagal menyimpan playbook'),
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Nama playbook wajib diisi');
      return;
    }
    updateMutation.mutate();
  };

  const totalItems = playbook.checklists.reduce(
    (acc, cl) => acc + cl.items.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header with back button and save */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-[#6B7280] hover:text-[#F3F4F6] hover:bg-[#1E2030]"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-[#F3F4F6]">
              Edit Playbook
            </h2>
            <p className="text-xs text-[#6B7280]">
              {playbook.checklists.length} checklist • {totalItems} item
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#9CA3AF] hover:text-[#F3F4F6]"
            onClick={onBack}
          >
            <X className="size-4 mr-1" />
            Batal
          </Button>
          <Button
            size="sm"
            className="bg-[#6366F1] hover:bg-[#818CF8] text-white"
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
          >
            <Save className="size-4 mr-1" />
            Simpan
          </Button>
        </div>
      </div>

      {/* Form fields */}
      <div className="bg-[#151827] border border-[#232636] rounded-[14px] p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
              Nama Playbook
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., ICT London Session"
              className="h-9 text-sm bg-[#10121E] border-[#232636] text-[#F3F4F6] placeholder:text-[#4B5563] focus-visible:ring-[#6366F1]/30 focus-visible:border-[#6366F1]/40"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
              Deskripsi
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your playbook strategy..."
              className="min-h-[80px] text-sm bg-[#10121E] border-[#232636] text-[#D1D5DB] placeholder:text-[#4B5563] focus-visible:ring-[#6366F1]/30 focus-visible:border-[#6366F1]/40 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
              Tipe Sesi
            </label>
            <Select
              value={sessionType || 'none'}
              onValueChange={(v) =>
                setSessionType(v === 'none' ? null : (v as SessionType))
              }
            >
              <SelectTrigger className="h-9 text-sm bg-[#10121E] border-[#232636] text-[#F3F4F6] focus:ring-[#6366F1]/30 focus:border-[#6366F1]/40">
                <SelectValue placeholder="Pilih tipe sesi" />
              </SelectTrigger>
              <SelectContent className="bg-[#151827] border-[#232636]">
                <SelectItem value="none" className="text-[#9CA3AF]">
                  Tanpa sesi
                </SelectItem>
                {SESSION_TYPE_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-[#F3F4F6] focus:bg-[#1E2030] focus:text-[#F3F4F6]"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs: Checklists & Trade Compliance */}
      <Tabs defaultValue="checklists" className="w-full">
        <TabsList className="bg-[#151827] border border-[#232636] h-9 p-0.5">
          <TabsTrigger
            value="checklists"
            className="text-xs data-[state=active]:bg-[#1E2030] data-[state=active]:text-[#F3F4F6] text-[#6B7280] rounded-md h-7 px-3"
          >
            Checklist ({playbook.checklists.length})
          </TabsTrigger>
          <TabsTrigger
            value="compliance"
            className="text-xs data-[state=active]:bg-[#1E2030] data-[state=active]:text-[#F3F4F6] text-[#6B7280] rounded-md h-7 px-3"
          >
            Trade Compliance ({playbook.trades.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="checklists" className="mt-4">
          <PlaybookChecklistEditor
            playbookId={playbook.id}
            checklists={playbook.checklists}
          />
        </TabsContent>
        <TabsContent value="compliance" className="mt-4">
          <PlaybookTradeCompliance trades={playbook.trades} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
