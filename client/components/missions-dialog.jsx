"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield, MapPin, Activity } from "lucide-react"
import { useState, useEffect } from "react"
import { missionAPI } from "@/lib/api"
import { useAuth } from "@clerk/nextjs"

export function MissionsDialog({ open, onOpenChange }) {
  const { isSignedIn } = useAuth()
  const [missions, setMissions] = useState([])

  useEffect(() => {
    if (open && isSignedIn) {
      fetchMissions()
    }
  }, [open, isSignedIn])

  const fetchMissions = async () => {
    try {
      const response = await missionAPI.getAll({ limit: 10 })
      if (response.data && Array.isArray(response.data)) {
        const formattedMissions = response.data.map(mission => ({
          id: mission.missionId || mission._id,
          target: mission.title || mission.objective,
          status: mission.status,
          teams: mission.assignedTeams?.length || 0,
          priority: mission.priority || "Medium",
        }))
        setMissions(formattedMissions)
      }
    } catch (error) {
      console.error('Error fetching missions:', error)
      setMissions([])
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-black border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            Active Missions Overview
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4 mt-4">
          <div className="space-y-4">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">{mission.id}</span>
                    <Badge
                      variant="outline"
                      className={
                        mission.priority === "Critical"
                          ? "text-red-500 border-red-500/20"
                          : "text-primary border-primary/20"
                      }
                    >
                      {mission.priority}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-white">
                    {mission.status}
                  </Badge>
                </div>
                <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{mission.target}</h4>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Area 42
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {mission.teams} Responders
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

