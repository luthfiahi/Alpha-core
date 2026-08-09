'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  Edit,
  Trash2,
  ListChecks,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

  // Setup completeness: visual progress based on available data
  const hasDescription = !!playbook.description;
  const hasChecklists = playbook._count.checklists > 0;
  const hasTrades = playbook._count.trades > 0;
  const completeness = Math.round(
    (hasDescription ? 34 : 0) + (hasChecklists ? 33 : 0) + (hasTrades ? 33 : 0)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative alpha-card p-5 cursor-pointer transition-all duration-200 overflow-hidden',
        'hover:translate-y-[-2px] alpha-card-glow',
        playbook.isActive && 'border-[#6366F1]/40'
      )}
      onClick={() => onOpen(playbook.id)}
    >
      {/* Gradient strip at top */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#A78BFA]" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 size-10 rounded-xl bg-[#1E2030] border border-[#232636] flex items-center justify-center group-hover:bg-[#252840] group-hover:border-[#6366F1]/20 transition-colors">
            <BookOpen className="size-5 text-[#9CA3AF] group-hover:text-[#F3F4F6] transition-colors" />
          </div>
          <div className="min-w-0">
            <h3 className="alpha-heading-sm text-[#F3F4F6] truncate">
              {playbook.name}
            </h3>
            {/* Session type + Status badges */}
            <div className="flex items-center gap-1.5 mt-1">
              {session && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border',
                    session.bgColor, session.color, session.borderColor, 'border'
                  )}
                >
                  <MapPin className="size-2.5" />
                  {session.label}
                </span>
              )}
              <span
                className={cn(
                  'inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md',
                  playbook.isActive
                    ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/25'
                    : 'bg-amber-400/15 text-amber-400 border border-amber-400/25'
                )}
              >
                {playbook.isActive ? 'Active' : 'Draft'}
              </span>
            </div>
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

      {/* Stats row — with visual progress indicator */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 alpha-caption text-[#9CA3AF]">
          <ListChecks className="size-3.5" />
          <span>{playbook._count.checklists} checklist</span>
        </div>
        <div className="w-px h-3 bg-[#232636]" />
        <div className="flex items-center gap-1.5 alpha-caption text-[#9CA3AF]">
          <TrendingUp className="size-3.5" />
          <span>{playbook._count.trades} trade</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="alpha-caption text-[#4B5563]">Setup</span>
          <span className="font-financial text-xs font-semibold text-[#818CF8]">{completeness}%</span>
        </div>
      </div>

      {/* Visual progress bar for completeness */}
      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-[#232636]/50">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${completeness}%`,
            background: completeness >= 80 ? 'linear-gradient(to right, #6366F1, #818CF8)' : completeness >= 50 ? '#6366F1' : '#4B5563',
            opacity: completeness > 0 ? 1 : 0,
          }}
        />
      </div>

      {/* Footer actions */}
      <div
        className="flex items-center justify-between pt-3 border-t border-[#232636]/60"
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
            {playbook.isActive ? 'Active' : 'Draft'}
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

      {/* Progress bar — setup completeness */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#232636]/50">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${completeness}%`,
            backgroundColor: completeness > 0 ? '#6366F1' : 'transparent',
            opacity: completeness > 0 ? 0.6 : 0,
          }}
        />
      </div>
    </motion.div>
  );
}
