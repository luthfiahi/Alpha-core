'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  Edit,
  Trash2,
  ListChecks,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { PlaybookListItem } from './types';
import { SESSION_TYPE_CONFIG } from './types';

interface PlaybookCardProps {
  playbook: PlaybookListItem;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export function PlaybookCard({
  playbook,
  onOpen,
  onEdit,
  onDelete,
  onToggleActive,
}: PlaybookCardProps) {
  const session = playbook.sessionType
    ? SESSION_TYPE_CONFIG[playbook.sessionType]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-[#151827] border border-[#232636] rounded-[14px] p-5 hover:bg-[#1E2030] hover:border-[#2E3148] transition-all duration-200 cursor-pointer alpha-card-glow"
      onClick={() => onOpen(playbook.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 size-10 rounded-xl bg-[#1E2030] border border-[#232636] flex items-center justify-center group-hover:bg-[#252840] transition-colors">
            <BookOpen className="size-5 text-[#9CA3AF] group-hover:text-[#F3F4F6] transition-colors" />
          </div>
          <div className="min-w-0">
            <h3 className="alpha-heading-sm text-[#F3F4F6] truncate">
              {playbook.name}
            </h3>
            {session && (
              <Badge
                variant="outline"
                className={`alpha-badge-interactive mt-1 text-[10px] px-1.5 py-0 h-4 font-medium ${session.color} ${session.bgColor} ${session.borderColor} border`}
              >
                {session.label}
              </Badge>
            )}
          </div>
        </div>
        <ChevronRight className="size-4 text-[#6B7280] shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Description */}
      {playbook.description && (
        <p className="alpha-caption line-clamp-2 mb-3 leading-relaxed">
          {playbook.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 alpha-caption text-[#9CA3AF]">
          <ListChecks className="size-3.5" />
          <span>{playbook._count.checklists} checklist</span>
        </div>
        <div className="flex items-center gap-1.5 alpha-caption text-[#9CA3AF]">
          <TrendingUp className="size-3.5" />
          <span>{playbook._count.trades} trade</span>
        </div>
      </div>

      {/* Footer actions */}
      <div
        className="flex items-center justify-between pt-3 border-t border-[#232636]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={playbook.isActive}
            onCheckedChange={(checked) =>
              onToggleActive(playbook.id, checked)
            }
            className="data-[state=checked]:bg-emerald-500"
          />
          <span className="alpha-caption">
            {playbook.isActive ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-[#6B7280] hover:text-[#F3F4F6] hover:bg-[#1E2030] alpha-press"
            onClick={() => onEdit(playbook.id)}
          >
            <Edit className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-[#6B7280] hover:text-red-400 hover:bg-red-400/10 alpha-press"
            onClick={() => onDelete(playbook.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
