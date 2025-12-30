"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Navigation } from "lucide-react"
import { useState, useEffect } from "react"
import { SOSDetailDialog } from "@/components/sos-detail-dialog"
import { triageAPI } from "@/lib/api"
import { useAuth } from "@clerk/nextjs"

export function TriageDashboard({ onViewAllMissions }) {
  const { isSignedIn } = useAuth()
  const [needs, setNeeds] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [detailItem, setDetailItem] = useState(null)

  useEffect(() => {
    if (isSignedIn) {
      fetchTriageData()
    }
  }, [isSignedIn])

  const fetchTriageData = async () => {
    try {
      const response = await triageAPI.getAll({ limit: 10, sort: '-priority' })
      if (response.data && Array.isArray(response.data)) {
        const formattedNeeds = response.data.map(triage => ({
          id: triage.triageId || triage._id,
          type: triage.category || "General",
          user: triage.patientName || "Unknown",
          location: triage.location?.address || `${triage.location?.coordinates[1]}, ${triage.location?.coordinates[0]}`,
          need: triage.notes || triage.symptoms || "Assessment pending",
          time: getTimeAgo(triage.createdAt),
          status: triage.status,
          score: triage.priority || 50,
        }))
        setNeeds(formattedNeeds)
      }
    } catch (error) {
      console.error('Error fetching triage data:', error)
      setNeeds([])
    }
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const updateStatus = async (id, newStatus) => {
    try {
      await triageAPI.updateStatus(id, newStatus)
      setNeeds((prev) => prev.map((n) => (n.id === id ? { ...n, status: newStatus } : n)))
    } catch (error) {
      console.error('Error updating triage status:', error)
    }
  }

  return (
    <Card className="flex flex-col h-full bg-card/50 border-border/50">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Emergency Triage</h3>
          <p className="text-xs text-muted-foreground">High-priority geospatial clusters</p>
        </div>
        <Badge variant="outline" className="text-destructive border-destructive/50 animate-pulse">
          4 CRITICAL
        </Badge>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {needs
            .sort((a, b) => b.score - a.score)
            .map((need) => (
              <div
                key={need.id}
                onClick={() => setSelectedId(need.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                  selectedId === need.id
                    ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                    : "bg-background border-border/50 hover:bg-accent/5"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1">
                    <Badge
                      className={
                        need.score > 85
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      }
                    >
                      SCORE: {need.score}
                    </Badge>
                    <span className="text-[9px] font-bold tracking-widest text-primary uppercase">{need.status}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {need.time}
                  </span>
                </div>
                <h4 className="text-sm font-semibold">{need.need}</h4>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {need.location}
                </div>
                {selectedId === need.id && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-black/40 rounded-lg border border-white/5 mb-3">
                      <h5 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Rescue Matching</h5>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3 h-3" /> 1.2km away
                        </span>
                        <span className="text-primary font-bold">ETA: 6 MIN</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-8 text-[10px] flex-1 font-bold bg-primary text-black"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateStatus(need.id, "ASSIGNED")
                        }}
                      >
                        Assign
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-[10px] flex-1 bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDetailItem(need)
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-border bg-muted/30">
        <Button className="w-full h-9 text-xs font-bold" variant="secondary" onClick={onViewAllMissions}>
          View All Active Missions
        </Button>
      </div>
      {detailItem && (
        <SOSDetailDialog item={detailItem} open={!!detailItem} onOpenChange={(open) => !open && setDetailItem(null)} />
      )}
    </Card>
  )
}

