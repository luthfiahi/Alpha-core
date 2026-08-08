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
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { useNavigationStore, type AppPage } from '@/stores'
import { useAuthStore } from '@/stores/auth-store'
import { useAuth } from '@/components/alpha/auth'
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
// Alpha Logo Mark — Diamond with α
// ========================================

function AlphaLogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Diamond shape */}
      <path
        d="M16 2L29 16L16 30L3 16L16 2Z"
        fill="url(#alpha-gradient)"
        stroke="rgba(129,140,248,0.3)"
        strokeWidth="0.5"
      />
      {/* Inner diamond highlight */}
      <path
        d="M16 6L26 16L16 26L6 16L16 6Z"
        fill="url(#alpha-inner)"
        opacity="0.15"
      />
      {/* Alpha symbol α */}
      <text
        x="16"
        y="17.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#FFFFFF"
        fontSize="16"
        fontWeight="700"
        fontFamily="'Inter', system-ui, -apple-system, sans-serif"
        style={{ letterSpacing: '-0.02em' }}
      >
        α
      </text>
      <defs>
        <linearGradient
          id="alpha-gradient"
          x1="3"
          y1="2"
          x2="29"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#818CF8" />
          <stop offset="0.5" stopColor="#6366F1" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient
          id="alpha-inner"
          x1="6"
          y1="6"
          x2="26"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

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
        'group relative flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        'outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
        // Collapsed: center icon
        collapsed && 'justify-center px-0'
      )}
      style={
        isActive
          ? {
              background: 'linear-gradient(90deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.06) 100%)',
              color: '#6366F1',
            }
          : undefined
      }
    >
      {/* Active indicator — 4px wide */}
      <div
        className={cn(
          'absolute left-0 top-1/2 h-6 w-[4px] -translate-x-1 rounded-full bg-[#6366F1] transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
        )}
        style={
          isActive
            ? { boxShadow: '0 0 8px rgba(99,102,241,0.4)' }
            : undefined
        }
      />

      {/* Hover indicator — 2px, only visible on hover when not active */}
      <div
        className={cn(
          'absolute left-0 top-1/2 h-5 w-[2px] -translate-x-1 rounded-full bg-[#6B7280] transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          isActive
            ? 'opacity-0 scale-y-0'
            : 'opacity-0 scale-y-0 group-hover:opacity-60 group-hover:scale-y-100'
        )}
      />

      <Icon
        className={cn(
          'shrink-0 transition-colors duration-[220ms]',
          isActive ? 'text-[#6366F1]' : 'text-[#6B7280] group-hover:text-[#9CA3AF]'
        )}
        size={18}
      />

      {!collapsed && (
        <span className={cn('truncate', !isActive && 'text-[#9CA3AF] group-hover:text-[#F3F4F6]')}>
          {item.label}
        </span>
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
  const user = useAuthStore((s) => s.user)
  const { logout } = useAuth()
  return (
    <div className="flex h-full flex-col">
      {/* Header with logo + collapse toggle */}
      <div className="flex h-14 items-center justify-between border-b border-[#232636] px-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <AlphaLogoMark size={30} />
            <span className="text-sm font-semibold text-[#F3F4F6] whitespace-nowrap">
              Project Alpha
            </span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <AlphaLogoMark size={30} />
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
        <div className="flex flex-col gap-1">
          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={group.title}>
              {/* Group label - hidden when collapsed */}
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#4B5563]">
                  {group.title}
                </p>
              )}
              {collapsed && (
                <div className="mx-auto mb-2 h-px w-6 bg-[#2D3148]" />
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
              {/* Divider between groups — expanded mode */}
              {!collapsed && groupIndex < NAV_GROUPS.length - 1 && (
                <div className="mt-4 mb-1 h-px bg-[#232636]" />
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User profile (sticky bottom) */}
      <div className="border-t border-[#232636] p-3">
        {!collapsed ? (
          <div className="space-y-1">
            <div className="group/item flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors duration-[220ms] hover:bg-[rgba(255,255,255,0.04)]">
              <div className="relative shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#6366F1]/20 text-xs font-semibold text-[#6366F1]">
                    {user?.name?.slice(0, 2).toUpperCase() || 'TR'}
                  </AvatarFallback>
                </Avatar>
                {/* Online status dot */}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center">
                  <span className="absolute h-full w-full rounded-full bg-[#10121E]" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#F3F4F6]">
                  {user?.name || 'Trader'}
                </p>
                <p className="truncate text-xs text-[#6B7280]">
                  {user?.email || 'Pro Plan'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium text-[#6B7280] transition-colors duration-[220ms] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#EF4444]"
            >
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="relative cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#6366F1]/20 text-xs font-semibold text-[#6366F1]">
                      {user?.name?.slice(0, 2).toUpperCase() || 'TR'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online status dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center">
                    <span className="absolute h-full w-full rounded-full bg-[#10121E]" />
                    <span className="relative h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p className="text-xs font-medium">{user?.name || 'Trader'}</p>
                <p className="text-[10px] text-[#9CA3AF]">{user?.email || ''}</p>
              </TooltipContent>
            </Tooltip>
            <button
              onClick={logout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors duration-[220ms] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#EF4444]"
            >
              <LogOut size={16} />
              <span className="sr-only">Keluar</span>
            </button>
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
          'relative flex h-screen flex-col border-r border-[#232636] bg-[#10121E] transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
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
