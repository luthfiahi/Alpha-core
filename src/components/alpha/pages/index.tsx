'use client'

import {
  LayoutDashboard,
  BookOpen,
  Brain,
  BarChart3,
  FileText,
  Settings,
  BookPlus,
  FileSearch,
} from 'lucide-react'
import React from 'react'

// ========================================
// Placeholder Page Component
// ========================================

function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: React.ElementType
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="alpha-card flex flex-col items-center gap-6 px-12 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(99,102,241,0.12)]">
          <Icon size={28} className="text-[#6366F1]" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#F3F4F6]">{title}</h2>
          <p className="mt-2 max-w-sm text-sm text-[#6B7280]">{description}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[rgba(99,102,241,0.08)] px-4 py-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6366F1]" />
          <span className="text-xs font-medium text-[#6366F1]">Coming Soon</span>
        </div>
      </div>
    </div>
  )
}

// ========================================
// Dashboard Page (Placeholder)
// ========================================

export function DashboardPage() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="Overview of your trading performance, process score, and recent activity."
      icon={LayoutDashboard}
    />
  )
}

// ========================================
// Journal Page (Placeholder)
// ========================================

export function JournalPage() {
  return (
    <PlaceholderPage
      title="Trade Journal"
      description="Record, review, and reflect on every trade you take to build discipline and consistency."
      icon={BookOpen}
    />
  )
}

// ========================================
// Journal New Page (Placeholder)
// ========================================

export function JournalNewPage() {
  return (
    <PlaceholderPage
      title="New Trade Entry"
      description="Log a new trade with detailed entry/exit analysis, emotions, and lessons learned."
      icon={BookPlus}
    />
  )
}

// ========================================
// Journal Detail Page (Placeholder)
// ========================================

export function JournalDetailPage() {
  return (
    <PlaceholderPage
      title="Trade Detail"
      description="Detailed view of a single trade including AI insights and process score breakdown."
      icon={FileSearch}
    />
  )
}

// ========================================
// Coaching Page (Placeholder)
// ========================================

export function CoachingPage() {
  return (
    <PlaceholderPage
      title="AI Coach"
      description="Your personalized AI trading coach that helps you improve based on your journal patterns."
      icon={Brain}
    />
  )
}

// ========================================
// Analytics Page (Placeholder)
// ========================================

export function AnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics"
      description="Deep dive into your trading statistics, equity curve, and performance metrics."
      icon={BarChart3}
    />
  )
}

// ========================================
// Playbook Page (Placeholder)
// ========================================

export function PlaybookPage() {
  return (
    <PlaceholderPage
      title="Playbook"
      description="Your trading rules, strategies, and checklists — refined through experience."
      icon={FileText}
    />
  )
}

// ========================================
// Settings Page (Placeholder)
// ========================================

export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Manage your account, preferences, and AI coaching configuration."
      icon={Settings}
    />
  )
}
