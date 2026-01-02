"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Shield, MapPin, Activity, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { missionAPI } from "@/lib/api"
import { useAuth, useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function MissionsDialog({ open, onOpenChange }) {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { toast } = useToast()
  const [missions, setMissions] = useState([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newMission, setNewMission] = useState({
    target: "",
    description: "",
    priority: "Medium",
    location: ""
  })

  useEffect(() => {
    if (open && isSignedIn) {
      fetchMissions()
    }
  }, [open, isSignedIn])

  const fetchMissions = async () => {
    try {
      const response = await missionAPI.getAll({ limit: 10 })
      // Axios wraps the response, so response.data is the backend response body
      // Backend returns { success: true, data: [...] }
      const missionsData = response.data?.data || response.data || []
      if (Array.isArray(missionsData)) {
        const formattedMissions = missionsData.map(mission => ({
          id: mission.missionId || mission._id,
          target: mission.target || mission.title || mission.objective,
          status: mission.status,
          teams: mission.teams?.length || 0,
          priority: mission.priority || "Medium",
        }))
        setMissions(formattedMissions)
      }
    } catch (error) {
      console.error('Error fetching missions:', error)
      setMissions([])
    }
  }

  const handleCreateMission = async () => {
    if (!newMission.target) {
      toast({
        title: "Validation Error",
        description: "Please enter a mission target/title.",
        variant: "destructive"
      })
      return
    }

    try {
      const missionData = {
        target: newMission.target,
        title: newMission.target,
        description: newMission.description,
        priority: newMission.priority,
        location: {
          type: "Point",
          coordinates: [0, 0],
          address: newMission.location || "Location not specified"
        }
      }

      await missionAPI.create(missionData)
      
      toast({
        title: "Mission Created",
        description: "New mission has been created successfully."
      })
      
      setIsCreateOpen(false)
      setNewMission({ target: "", description: "", priority: "Medium", location: "" })
      fetchMissions()
    } catch (error) {
      console.error('Error creating mission:', error)
      toast({
        title: "Creation Failed",
        description: error.response?.data?.error || "Failed to create mission.",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-black border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <DialogTitle className="text-2xl font-bold">Active Missions Overview</DialogTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              New Mission
            </Button>
          </div>
          <DialogDescription>View and manage active rescue missions across all sectors</DialogDescription>
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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-black/90 border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Create New Mission</DialogTitle>
            <DialogDescription>Create a new rescue mission</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="target">Mission Target/Title</Label>
              <Input 
                id="target" 
                placeholder="e.g. Sector 7 Extraction" 
                className="bg-white/5 border-white/10"
                value={newMission.target}
                onChange={(e) => setNewMission({...newMission, target: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Mission details and objectives..." 
                className="bg-white/5 border-white/10"
                value={newMission.description}
                onChange={(e) => setNewMission({...newMission, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newMission.priority}
                  onValueChange={(value) => setNewMission({...newMission, priority: value})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="e.g. Area 42" 
                  className="bg-white/5 border-white/10"
                  value={newMission.location}
                  onChange={(e) => setNewMission({...newMission, location: e.target.value})}
                />
              </div>
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
              onClick={handleCreateMission}
            >
              Create Mission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
