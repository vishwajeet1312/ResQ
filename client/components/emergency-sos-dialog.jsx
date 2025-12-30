"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, MapPin, Zap, Radio, PhoneCall } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { sosAPI } from "@/lib/api"
import { useUser } from "@clerk/nextjs"

export function EmergencySOSDialog({ open, onOpenChange }) {
  const { toast } = useToast()
  const { user } = useUser()
  const [stage, setStage] = useState("init")
  const [coordinates, setCoordinates] = useState(null)

  useEffect(() => {
    if (open && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => console.error('GPS error:', error),
        { enableHighAccuracy: true }
      )
    }
  }, [open])

  const triggerSOS = async () => {
    if (!coordinates) {
      toast({
        title: "GPS Required",
        description: "Please enable location access to broadcast SOS.",
        variant: "destructive",
      })
      return
    }

    setStage("sending")
    
    try {
      const sosData = {
        userId: user?.id || "anonymous",
        userName: user?.fullName || "Unknown User",
        location: {
          type: "Point",
          coordinates: [coordinates.longitude, coordinates.latitude],
          address: `[${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}]`
        },
        message: "Emergency SOS - Immediate assistance required",
        severity: "Critical"
      }

      const response = await sosAPI.broadcast(sosData)
      
      setStage("confirmed")
      toast({
        title: "SOS BROADCASTED",
        description: `Signal ${response.data.sosId} transmitted to nearby rescue nodes.`,
        variant: "destructive",
      })
    } catch (error) {
      console.error('SOS broadcast error:', error)
      setStage("init")
      toast({
        title: "Broadcast Failed",
        description: error.response?.data?.message || "Failed to send SOS. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-black border-red-500/20 text-white">
        <DialogHeader className="items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <DialogTitle className="text-2xl font-bold text-red-500">Emergency SOS</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            This will broadcast your GPS and status to all verified responders in your sector.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4">
            <MapPin className="w-5 h-5 text-primary" />
            <div className="text-left">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Current Location</div>
              <div className="text-sm font-medium tracking-tight font-mono">
                {coordinates ? `[${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}]` : "Acquiring GPS..."}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {stage === "init" ? (
            <Button
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-[0_0_30px_rgba(220,38,38,0.4)]"
              onClick={triggerSOS}
            >
              BROADCAST SOS
            </Button>
          ) : stage === "sending" ? (
            <Button disabled className="w-full h-14 bg-red-900 text-white font-bold text-lg">
              <Radio className="w-5 h-5 mr-2 animate-spin" />
              SENDING SIGNAL...
            </Button>
          ) : (
            <div className="space-y-2">
              <Button className="w-full h-14 bg-green-600 text-white font-bold text-lg" disabled>
                SIGNAL CONFIRMED
              </Button>
              <Button
                variant="outline"
                className="w-full border-white/10 bg-transparent"
                onClick={() => onOpenChange(false)}
              >
                Close Dashboard
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-white/5 border-white/10 h-10 text-xs">
              <PhoneCall className="w-3 h-3 mr-2" /> Call Local Dept
            </Button>
            <Button variant="outline" className="flex-1 bg-white/5 border-white/10 h-10 text-xs">
              <Zap className="w-3 h-3 mr-2" /> Text Neighbors
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

