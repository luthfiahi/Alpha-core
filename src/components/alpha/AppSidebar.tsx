'use client'

import React, { useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  BarChart3,
  FileText,
  Dna,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { useNavigationStore, type AppPage } from '@/stores'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ========================================
// Navigation Configuration
// ========================================

interface NavItem {
  id: AppPage
  label: string
  icon: React.ElementType
  badge?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Utama',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'journal', label: 'Journal', icon: BookOpen },
      { id: 'coaching', label: 'AI Coach', icon: Brain, badge: true },
    ],
  },
  {
    title: 'Analitik',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'playbook', label: 'Playbook', icon: FileText },
      { id: 'trading-dna', label: 'Trading DNA', icon: Dna },
    ],
  },
  {
    title: 'Pengaturan',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
]

// ========================================
// NavItemButton Component
// ========================================

function NavItemButton({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  onClick: () => void
}) {
  const Icon = item.icon

  const button = (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
        // Active state
        isActive && 'bg-[rgba(99,102,241,0.12)] text-[#6366F1]',
        // Inactive state
        !isActive && 'text-[#9CA3AF] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#F3F4F6]',
        // Collapsed: center icon
        collapsed && 'justify-center px-0'
      )}
    >
      {/* Active indicator */}
      <div
        className={cn(
          'absolute left-0 top-1/2 h-6 w-[3px] -translate-x-1 rounded-full bg-[#6366F1] transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
        )}
      />

      <Icon
        className={cn(
          'shrink-0 transition-colors duration-[220ms]',
          isActive ? 'text-[#6366F1]' : 'text-[#6B7280] group-hover:text-[#9CA3AF]'
        )}
        size={20}
      />

      {!collapsed && (
        <span className="truncate">{item.label}</span>
      )}

      {/* Notification dot for AI Coach */}
      {item.badge && (
        <span
          className={cn(
            'absolute top-2 flex h-2 w-2',
            collapsed ? 'right-2' : 'right-3'
          )}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
      )}
    </button>
  )

  // Show tooltip when collapsed
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          <p className="text-xs font-medium">{item.label}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}

// ========================================
// Sidebar Content (shared between desktop & mobile)
// ========================================

function SidebarContent({
  collapsed,
  onNavigate,
  currentPage,
  onToggle,
}: {
  collapsed: boolean
  onNavigate: (page: AppPage) => void
  currentPage: AppPage
  onToggle: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header with logo + collapse toggle */}
      <div className="flex h-14 items-center justify-between border-b border-[#232636] px-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6366F1]">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <span className="text-sm font-semibold text-[#F3F4F6] whitespace-nowrap">
              Project Alpha
            </span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]">
            <span className="text-sm font-bold text-white">A</span>
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 shrink-0 rounded-lg text-[#6B7280] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#9CA3AF]"
          >
            <PanelLeftClose size={18} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className="flex flex-col gap-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {/* Group label - hidden when collapsed */}
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#4B5563]">
                  {group.title}
                </p>
              )}
              {collapsed && (
                <div className="mx-auto mb-2 h-px w-6 bg-[#232636]" />
              )}
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <NavItemButton
                    key={item.id}
                    item={item}
                    isActive={currentPage === item.id}
                    collapsed={collapsed}
                    onClick={() => onNavigate(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* User profile (sticky bottom) */}
      <div className="border-t border-[#232636] p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-[220ms] hover:bg-[rgba(255,255,255,0.04)]">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-[#6366F1]/20 text-xs font-semibold text-[#6366F1]">
                TR
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#F3F4F6]">
                Trader
              </p>
              <p className="truncate text-xs text-[#6B7280]">Pro Plan</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-[#6366F1]/20 text-xs font-semibold text-[#6366F1]">
                    TR
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p className="text-xs font-medium">Trader</p>
                <p className="text-[10px] text-[#9CA3AF]">Pro Plan</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}

// ========================================
// Main AppSidebar Component
// ========================================

export function AppSidebar() {
  const isMobile = useIsMobile()
  const [mobileOpen, setMobileOpen] = useState(false)

  const collapsed = useNavigationStore((s) => s.sidebarCollapsed)
  const currentPage = useNavigationStore((s) => s.currentPage)
  const navigate = useNavigationStore((s) => s.navigate)
  const toggleSidebar = useNavigationStore((s) => s.toggleSidebar)

  const handleNavigate = (page: AppPage) => {
    navigate(page)
    if (isMobile) setMobileOpen(false)
  }

  // ========================================
  // Mobile: Sheet overlay drawer from left
  // ========================================
  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="h-10 w-10 rounded-lg text-[#9CA3AF] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#F3F4F6] md:hidden"
        >
          <Menu size={20} />
          <span className="sr-only">Open menu</span>
        </Button>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="w-[280px] border-r border-[#232636] bg-[#10121E] p-0"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent
              collapsed={false}
              onNavigate={handleNavigate}
              currentPage={currentPage}
              onToggle={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // ========================================
  // Desktop: Collapsible sidebar
  // ========================================
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex h-screen flex-col border-r border-[#232636] bg-[#10121E] transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onNavigate={handleNavigate}
          currentPage={currentPage}
          onToggle={toggleSidebar}
        />

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="absolute bottom-16 left-[52px]">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-7 w-7 rounded-md border border-[#232636] bg-[#151827] text-[#6B7280] shadow-sm hover:bg-[#1E2030] hover:text-[#9CA3AF]"
                >
                  <PanelLeftOpen size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p className="text-xs font-medium">Expand sidebar</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}
