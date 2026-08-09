'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus,
  BookOpen,
  Search,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { PlaybookCard } from './PlaybookCard';
import { PlaybookEditor } from './PlaybookEditor';
import { SESSION_TYPE_OPTIONS } from './types';
import type {
  PlaybookListItem,
  PlaybookDetail,
  SessionType,
} from './types';

// ========================================
// Create Playbook Dialog
// ========================================
function CreatePlaybookDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/playbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, sessionType }),
      });
      if (!res.ok) throw new Error('Gagal membuat playbook');
      return res.json();
    },
    onSuccess: (data) => {
      toast.success('Playbook berhasil dibuat');
      if (data?.playbook?.id) {
        onCreated(data.playbook.id);
      }
      setName('');
      setDescription('');
      setSessionType(null);
      onOpenChange(false);
    },
    onError: () => toast.error('Gagal membuat playbook'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151827] border-[#232636] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#F3F4F6]">Playbook Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="block alpha-label text-[#9CA3AF] mb-1.5">
              Nama Playbook
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., ICT London Session"
              className="h-9 text-sm bg-[#10121E] border-[#232636] text-[#F3F4F6] placeholder:text-[#4B5563] focus-visible:ring-[#6366F1]/30 focus-visible:border-[#6366F1]/40 alpha-focus-ring"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (name.trim()) createMutation.mutate();
                }
              }}
            />
          </div>
          <div>
            <label className="block alpha-label text-[#9CA3AF] mb-1.5">
              Deskripsi
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your playbook strategy..."
              className="min-h-[80px] text-sm bg-[#10121E] border-[#232636] text-[#D1D5DB] placeholder:text-[#4B5563] focus-visible:ring-[#6366F1]/30 focus-visible:border-[#6366F1]/40 resize-none alpha-focus-ring"
            />
          </div>
          <div>
            <label className="block alpha-label text-[#9CA3AF] mb-1.5">
              Tipe Sesi
            </label>
            <Select
              value={sessionType || 'none'}
              onValueChange={(v) =>
                setSessionType(v === 'none' ? null : (v as SessionType))
              }
            >
              <SelectTrigger className="h-9 text-sm bg-[#10121E] border-[#232636] text-[#F3F4F6] focus:ring-[#6366F1]/30 focus:border-[#6366F1]/40 alpha-focus-ring">
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
        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#9CA3AF] hover:text-[#F3F4F6] alpha-press"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            size="sm"
            className="bg-[#6366F1] hover:bg-[#818CF8] text-white alpha-press"
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || createMutation.isPending}
          >
            {createMutation.isPending && (
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
            )}
            Buat Playbook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ========================================
// Delete Confirmation
// ========================================
function DeletePlaybookDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#151827] border-[#232636]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#F3F4F6]">
            Hapus Playbook?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#9CA3AF]">
            Playbook yang dihapus tidak dapat dikembalikan. Semua checklist dan
            item di dalamnya akan ikut terhapus.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="text-[#9CA3AF] hover:text-[#F3F4F6] alpha-press"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 text-white alpha-press"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
            ) : null}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ========================================
// Loading Skeleton
// ========================================
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 bg-[#151827]" />
        <Skeleton className="h-9 w-32 bg-[#151827]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-48 bg-[#151827] rounded-[14px]"
          />
        ))}
      </div>
    </div>
  );
}

// ========================================
// Main PlaybookPage
// ========================================
export function PlaybookPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterSession, setFilterSession] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch playbooks list
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['playbooks'],
    queryFn: async () => {
      const res = await fetch('/api/playbooks');
      if (!res.ok) throw new Error('Gagal memuat playbooks');
      const json = await res.json();
      return json.playbooks as PlaybookListItem[];
    },
  });

  // Fetch single playbook detail
  const { data: playbookDetail, isLoading: isDetailLoading, isError: isDetailError, refetch: refetchDetail } = useQuery({
    queryKey: ['playbook', selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      const res = await fetch(`/api/playbooks/${selectedId}`);
      if (!res.ok) throw new Error('Gagal memuat playbook');
      const json = await res.json();
      return json.playbook as PlaybookDetail;
    },
    enabled: !!selectedId,
  });

  // Toggle active
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/playbooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error('Gagal mengubah status');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playbooks'] });
      if (selectedId) qc.invalidateQueries({ queryKey: ['playbook', selectedId] });
      toast.success('Status playbook diperbarui');
    },
    onError: () => toast.error('Gagal mengubah status'),
  });

  // Delete playbook
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/playbooks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus playbook');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playbooks'] });
      toast.success('Playbook berhasil dihapus');
      setDeleteId(null);
    },
    onError: () => toast.error('Gagal menghapus playbook'),
  });

  const handleOpen = useCallback((id: string) => setSelectedId(id), []);
  const handleBack = useCallback(() => setSelectedId(null), []);
  const handleEdit = useCallback((id: string) => setSelectedId(id), []);
  const handleCreated = useCallback((id: string) => setSelectedId(id), []);

  // Filter playbooks
  const filteredPlaybooks = (data || []).filter((pb) => {
    const matchSearch =
      !search.trim() ||
      pb.name.toLowerCase().includes(search.toLowerCase());
    const matchSession =
      filterSession === 'all' || pb.sessionType === filterSession;
    return matchSearch && matchSession;
  });

  // Detail view
  if (selectedId && playbookDetail) {
    return (
      <motion.div
        key="editor"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.2 }}
      >
        <PlaybookEditor playbook={playbookDetail} onBack={handleBack} />
      </motion.div>
    );
  }

  // Detail error
  if (selectedId && isDetailError && !isDetailLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#1E2030] bg-[#0B0D17] px-6 py-10 text-center">
          <AlertTriangle className="size-8 text-[#F59E0B]" />
          <p className="alpha-body text-[#F3F4F6]">Gagal memuat playbook</p>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#9CA3AF] hover:text-[#F3F4F6] alpha-press"
            onClick={() => refetchDetail()}
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (selectedId && isDetailLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6 alpha-animate-in">
      {/* Create dialog */}
      <CreatePlaybookDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleCreated}
      />

      {/* Delete dialog */}
      <DeletePlaybookDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
        isLoading={deleteMutation.isPending}
      />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="alpha-heading-xl uppercase tracking-wider text-[#F3F4F6]">PLAYBOOK</h1>
          <p className="alpha-body mt-1.5">
            Aturan dan checklist untuk setiap setup trading
          </p>
        </div>
        <Button
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white alpha-press shadow-lg shadow-[#6366F1]/25 hover:shadow-[#6366F1]/35 transition-all duration-300"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="size-4 mr-1.5" />
          New Playbook
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#4B5563]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search playbooks..."
            className="h-9 pl-9 text-sm bg-[#151827] border-[#232636] text-[#F3F4F6] placeholder:text-[#4B5563] focus-visible:ring-[#6366F1]/30 focus-visible:border-[#6366F1]/40 alpha-focus-ring"
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] alpha-press"
              onClick={() => setSearch('')}
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <Select value={filterSession} onValueChange={setFilterSession}>
          <SelectTrigger className="h-9 w-full sm:w-[160px] text-sm bg-[#151827] border-[#232636] text-[#F3F4F6] focus:ring-[#6366F1]/30 focus:border-[#6366F1]/40 alpha-focus-ring">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#151827] border-[#232636]">
            <SelectItem
              value="all"
              className="text-[#F3F4F6] focus:bg-[#1E2030] focus:text-[#F3F4F6]"
            >
              All Sessions
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

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <div className="flex items-center justify-center min-h-[200px] rounded-xl border border-[#1E2030] bg-[#0B0D17]">
          <div className="flex flex-col items-center gap-3 text-center px-6 py-10">
            <AlertTriangle className="size-8 text-[#F59E0B]" />
            <p className="alpha-body text-[#F3F4F6]">Gagal memuat playbook</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#9CA3AF] hover:text-[#F3F4F6] alpha-press"
              onClick={() => refetch()}
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Coba Lagi
            </Button>
          </div>
        </div>
      ) : filteredPlaybooks.length === 0 ? (
        <EmptyState
          hasPlaybooks={!!data?.length}
          onCreate={() => setCreateDialogOpen(true)}
          onClear={() => {
            setSearch('');
            setFilterSession('all');
          }}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {filteredPlaybooks.map((pb) => (
            <PlaybookCard
              key={pb.id}
              playbook={pb}
              onOpen={handleOpen}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteId(id)}
              onToggleActive={(id, active) =>
                toggleActiveMutation.mutate({ id, isActive: active })
              }
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ========================================
// Empty State
// ========================================
function EmptyState({
  hasPlaybooks,
  onCreate,
  onClear,
}: {
  hasPlaybooks: boolean;
  onCreate: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-[#6366F1]/15 blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="relative size-16 rounded-2xl bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/10 border border-[#6366F1]/20 flex items-center justify-center">
          <BookOpen className="size-7 text-[#818CF8]" />
        </div>
      </div>
      <h3 className="alpha-heading-sm text-[#F3F4F6] mb-2 mt-5">
        {hasPlaybooks
          ? 'No matching playbooks'
          : 'No playbooks yet'}
      </h3>
      <p className="alpha-body text-[#6B7280] max-w-xs mb-6">
        {hasPlaybooks
          ? 'Try adjusting your filters or search query.'
          : 'Create your first playbook to start documenting your trading setups.'}
      </p>
      <div className="flex items-center gap-2">
        {hasPlaybooks && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[#9CA3AF] hover:text-[#F3F4F6] alpha-press"
            onClick={onClear}
          >
            Reset Filter
          </Button>
        )}
        <Button
          size="sm"
          className="bg-[#6366F1] hover:bg-[#818CF8] text-white alpha-press"
          onClick={onCreate}
        >
          <Plus className="size-4 mr-1" />
          New Playbook
        </Button>
      </div>
    </div>
  );
}
