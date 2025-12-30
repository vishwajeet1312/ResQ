"use client"

import { Card } from "@/components/ui/card"
import { Activity, ShieldCheck, Timer, HeartPulse } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

const stats = [
  {
    label: "Golden Hour Success",
    value: "84%",
    description: "Response within 60 mins",
    icon: Timer,
    trend: "+12.5%",
    color: "text-primary",
  },
  {
    label: "Active Rescuers",
    value: "1,284",
    description: "Verified community help",
    icon: ShieldCheck,
    trend: "+42",
    color: "text-blue-500",
  },
  {
    label: "Resources Shared",
    value: "452",
    description: "Generators, Boats, Kits",
    icon: HeartPulse,
    trend: "+18",
    color: "text-yellow-500",
  },
  {
    label: "Live Reports",
    value: "2.4k",
    description: "Validated geo-pings",
    icon: Activity,
    trend: "Live",
    color: "text-destructive",
  },
]

export function StatsGrid() {
  const [selectedStat, setSelectedStat] = useState(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card
          key={i}
          className="p-6 bg-card/50 border-border/50 hover:border-primary/50 transition-all group cursor-pointer"
          onClick={() => setSelectedStat(stat)}
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`p-2 rounded-lg bg-background border border-border group-hover:scale-110 transition-transform ${stat.color}`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {stat.trend}
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold tracking-tight">{stat.value}</h4>
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-[10px] text-muted-foreground/60">{stat.description}</p>
          </div>
        </Card>
      ))}

      <Dialog open={!!selectedStat} onOpenChange={() => setSelectedStat(null)}>
        <DialogContent className="bg-black/90 border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedStat?.icon && <selectedStat.icon className={`w-5 h-5 ${selectedStat.color}`} />}
              {selectedStat?.label} Analysis
            </DialogTitle>
            <DialogDescription>Detailed performance metrics and historical trends for this sector.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold">{selectedStat?.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{selectedStat?.description}</p>
              </div>
              <div
                className={`px-2 py-1 rounded text-xs font-bold ${selectedStat?.trend.includes("+") ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}`}
              >
                {selectedStat?.trend} TREND
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-muted-foreground uppercase">
                <span>Confidence Level</span>
                <span>94%</span>
              </div>
              <Progress value={94} className="h-1" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

