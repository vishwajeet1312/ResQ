"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Clock, Shield, Navigation } from "lucide-react"

export function SOSDetailDialog({ item, open, onOpenChange }) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-black border-white/10 text-white">
        <DialogHeader>
          <div className="flex justify-between items-center mb-2">
            <Badge className={item.score > 85 ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}>
              PRIORITY SCORE: {item.score}
            </Badge>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{item.status}</span>
          </div>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">{item.need || item.type}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {item.details || "Requesting immediate assistance at current geo-coordinates."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Location</div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4 text-primary" />
              {item.location}
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Time Elapsed</div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-primary" />
              {item.time}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">Rescue Matching</span>
            </div>
            <span className="text-xs font-mono text-primary">ETA: 6 MIN</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
              <span>Path Probability</span>
              <span>92% Clear</span>
            </div>
            <Progress value={92} className="h-1 bg-white/5" />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-start mt-6">
          <Button className="flex-1 bg-primary text-black font-bold">
            <Shield className="w-4 h-4 mr-2" />
            Dispatch Rescuer
          </Button>
          <Button variant="outline" className="flex-1 border-white/10 bg-white/5 hover:bg-white/10">
            Escalate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

