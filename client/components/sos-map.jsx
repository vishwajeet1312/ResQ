"use client"

import { Card } from "@/components/ui/card"
import { MapPin, Users, ExternalLink, Radio, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SOSDetailDialog } from "@/components/sos-detail-dialog"
import dynamic from "next/dynamic"

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import("./real-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black/50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
})

const mapPings = [
  {
    id: "ping-1",
    type: "TRAPPED",
    people: 3,
    score: 92,
    status: "CREATED",
    lat: 40.7128,
    lng: -74.006,
    color: "#ef4444",
    details: "Sector 7 - Flood levels rising. Need immediate extraction.",
  },
  {
    id: "ping-2",
    type: "MEDICAL NEED",
    people: 1,
    score: 75,
    status: "ASSIGNED",
    lat: 40.7589,
    lng: -73.9851,
    color: "#3b82f6",
    details: "Sector 42 - Insulin shortage for elderly patient.",
  },
  {
    id: "ping-3",
    type: "RESOURCE: BOAT",
    people: 0,
    score: 45,
    status: "EN ROUTE",
    lat: 40.7489,
    lng: -73.9680,
    color: "#eab308",
    details: "Mobile resource moving towards North Bridge.",
  },
  {
    id: "ping-4",
    type: "SHELTER",
    people: 12,
    score: 65,
    status: "ACTIVE",
    lat: 40.7308,
    lng: -73.9973,
    color: "#22c55e",
    details: "Emergency shelter established - capacity for 50 people.",
  },
  {
    id: "ping-5",
    type: "FIRE",
    people: 5,
    score: 88,
    status: "CREATED",
    lat: 40.7580,
    lng: -73.9855,
    color: "#f97316",
    details: "Building fire - residents trapped on upper floors.",
  },
]

export function SOSMap() {
  const [selectedPing, setSelectedPing] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <Card className="relative w-full h-[600px] overflow-hidden bg-black border-border/50">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Initializing map...</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="relative w-full h-[600px] overflow-hidden bg-black border-border/50 group">
      {/* Real Map */}
      <div className="absolute inset-0 z-0">
        <MapComponent pings={mapPings} onPingClick={setSelectedPing} />
      </div>

      {selectedPing && (
        <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-[320px] animate-in slide-in-from-bottom-4 z-[1000]">
          <Card className="p-4 bg-black/90 backdrop-blur-xl border-primary/20 shadow-2xl">
            <div className="flex justify-between items-start mb-3">
              <Badge className="bg-primary/20 text-primary border-primary/20">Priority: {selectedPing.score}</Badge>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedPing(null)}>
                ✕
              </Button>
            </div>
            <h4 className="font-bold text-lg mb-1">{selectedPing.type}</h4>
            <p className="text-xs text-muted-foreground mb-4">{selectedPing.details}</p>
            <div className="flex gap-2">
              <Button
                className="flex-1 h-8 text-[10px] font-bold bg-primary text-black"
                onClick={() => setIsDetailOpen(true)}
              >
                RESPOND
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-8 text-[10px] bg-transparent border-white/10"
                onClick={() => setIsDetailOpen(true)}
              >
                VIEW DATA
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[1000]">
        <Button
          variant="outline"
          size="sm"
          className="bg-primary/10 border-primary/20 text-primary font-bold text-[10px]"
          onClick={() => {
            console.log("[v0] Showing all missions view")
            alert("Switching to Global Mission Overview...")
          }}
        >
          <ExternalLink className="w-3 h-3 mr-1" /> ALL MISSIONS
        </Button>
      </div>

      {/* Top Utilities Bar for Map */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-[1000]">
        <Button
          variant="outline"
          size="sm"
          className={`h-9 border-white/10 backdrop-blur-md transition-all ${
            isLiveFeedActive ? "bg-primary text-black" : "bg-black/40"
          }`}
          onClick={() => setIsLiveFeedActive(!isLiveFeedActive)}
        >
          <Radio className={`w-4 h-4 mr-2 ${isLiveFeedActive ? "animate-pulse" : ""}`} />
          {isLiveFeedActive ? "Live Feed: ON" : "Live Feed"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 bg-black/40 border-white/10 backdrop-blur-md"
          onClick={() => alert("Preparing Triage CSV Export...")}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Triage Data
        </Button>
      </div>

      {selectedPing && <SOSDetailDialog item={selectedPing} open={isDetailOpen} onOpenChange={setIsDetailOpen} />}

      {/* Real-time Legend */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 z-[1000]">
        <div className="bg-black/80 backdrop-blur-xl border border-border/50 p-4 rounded-xl max-w-[240px]">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Live Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-destructive animate-ping" />
              <span className="text-sm font-medium">{mapPings.length} Active SOS</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-xs">45 Rescuers Nearby</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

