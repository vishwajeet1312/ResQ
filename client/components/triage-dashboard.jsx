"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Clock, MapPin, Navigation, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { SOSDetailDialog } from "@/components/sos-detail-dialog"
import { triageAPI } from "@/lib/api"
import { useAuth, useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function TriageDashboard({ onViewAllMissions }) {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { toast } = useToast()
  const [needs, setNeeds] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTriage, setNewTriage] = useState({
    type: "",
    need: "",
    location: "",
    notes: ""
  })

  useEffect(() => {
    if (isSignedIn) {
      fetchTriageData()
    }
  }, [isSignedIn])

  const fetchTriageData = async () => {
    try {
      const response = await triageAPI.getAll({ limit: 10, sort: '-priority' })
      // Axios wraps the response, so response.data is the backend response body
      // Backend returns { success: true, data: [...] }
      const triageData = response.data?.data || response.data || []
      if (Array.isArray(triageData)) {
        const formattedNeeds = triageData.map(triage => ({
          id: triage.requestId || triage._id,
          type: triage.type || "Other",
          user: triage.userName || "Unknown",
          location: triage.location?.address || triage.location?.sector || `${triage.location?.coordinates?.[1] || 0}, ${triage.location?.coordinates?.[0] || 0}`,
          need: triage.need || "Assessment pending",
          time: getTimeAgo(triage.createdAt),
          status: triage.status,
          score: triage.score || triage.priority || 50,
          distance: triage.location?.distance || 0,
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
      toast({
        title: "Status Updated",
        description: "Triage request status has been updated."
      })
    } catch (error) {
      console.error('Error updating triage status:', error)
      toast({
        title: "Update Failed",
        description: error.response?.data?.error || "Failed to update status.",
        variant: "destructive"
      })
    }
  }

  const handleCreateTriage = async () => {
    if (!newTriage.type || !newTriage.need || !newTriage.location) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      const triageData = {
        type: newTriage.type,
        need: newTriage.need,
        location: {
          type: "Point",
          coordinates: [0, 0],
          address: newTriage.location,
          sector: newTriage.location
        },
        notes: newTriage.notes,
        affectedCount: 1
      }

      await triageAPI.create(triageData)
      
      toast({
        title: "Request Submitted",
        description: "Triage request has been created successfully."
      })
      
      setIsCreateOpen(false)
      setNewTriage({ type: "", need: "", location: "", notes: "" })
      fetchTriageData()
    } catch (error) {
      console.error('Error creating triage:', error)
      toast({
        title: "Submission Failed",
        description: error.response?.data?.error || "Failed to create triage request.",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="flex flex-col h-full bg-card/50 border-border/50">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Emergency Triage</h3>
          <p className="text-xs text-muted-foreground">High-priority geospatial clusters</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-destructive border-destructive/50 animate-pulse">
            {needs.filter(n => n.score >= 75).length} CRITICAL
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-black/90 border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Create Triage Request</DialogTitle>
            <DialogDescription>Submit a new emergency triage request</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={newTriage.type}
                onValueChange={(value) => setNewTriage({...newTriage, type: value})}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Rescue">Rescue</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Power">Power</SelectItem>
                  <SelectItem value="Resource">Resource</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="need">Need/Request</Label>
              <Input 
                id="need" 
                placeholder="e.g. Insulin & Water" 
                className="bg-white/5 border-white/10"
                value={newTriage.need}
                onChange={(e) => setNewTriage({...newTriage, need: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="e.g. Sector 7" 
                className="bg-white/5 border-white/10"
                value={newTriage.location}
                onChange={(e) => setNewTriage({...newTriage, location: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Additional details..." 
                className="bg-white/5 border-white/10"
                value={newTriage.notes}
                onChange={(e) => setNewTriage({...newTriage, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary text-black font-bold" 
              onClick={handleCreateTriage}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
