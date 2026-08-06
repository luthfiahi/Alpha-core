'use client'

import { BarChart3, TrendingUp, Brain } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { GrowthTimeline } from './GrowthTimeline'
import { WeeklyReviewTab } from './WeeklyReviewTab'
import { BehavioralInsights } from './BehavioralInsights'

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-[#F3F4F6]">Analytics</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Pantau pertumbuhan proses, review mingguan, dan insight perilaku trading
        </p>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="bg-[#151827] border border-[#232636] rounded-lg p-1 gap-1">
          <TabsTrigger
            value="growth"
            className="gap-1.5 data-[state=active]:bg-[#1E2030] data-[state=active]:text-[#F3F4F6] text-[#6B7280] rounded-md px-4 text-xs font-medium"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timeline Pertumbuhan</span>
            <span className="sm:hidden">Growth</span>
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="gap-1.5 data-[state=active]:bg-[#1E2030] data-[state=active]:text-[#F3F4F6] text-[#6B7280] rounded-md px-4 text-xs font-medium"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Review Mingguan</span>
            <span className="sm:hidden">Review</span>
          </TabsTrigger>
          <TabsTrigger
            value="behavioral"
            className="gap-1.5 data-[state=active]:bg-[#1E2030] data-[state=active]:text-[#F3F4F6] text-[#6B7280] rounded-md px-4 text-xs font-medium"
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Insight Perilaku</span>
            <span className="sm:hidden">Perilaku</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="mt-6">
          <GrowthTimeline />
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <WeeklyReviewTab />
        </TabsContent>

        <TabsContent value="behavioral" className="mt-6">
          <BehavioralInsights />
        </TabsContent>
      </Tabs>
    </div>
  )
}
