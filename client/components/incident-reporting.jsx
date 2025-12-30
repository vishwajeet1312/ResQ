"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, MapPin, Clock, Users, Camera, Send, Filter, ArrowRight, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { incidentAPI } from "@/lib/api"
import { useUser } from "@clerk/nextjs"

const recentReports = [
  {
    id: "REP-902",
    type: "Flash Flood",
    location: "Sector 4 - River Basin",
    time: "12m ago",
    severity: "High",
    responders: 4,
  },
  {
    id: "REP-899",
    type: "Structural Collapse",
    location: "Old Town Square",
    time: "45m ago",
    severity: "Critical",
    responders: 12,
  },
]

export function IncidentReporting() {
  const { toast } = useToast()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAllReportsOpen, setIsAllReportsOpen] = useState(false)
  const [attachedPhoto, setAttachedPhoto] = useState(null)
  const [gpsCoordinates, setGpsCoordinates] = useState(null)
  const [recentIncidents, setRecentIncidents] = useState(recentReports)
  
  // Form fields
  const [incidentType, setIncidentType] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")

  // Fetch recent incidents on mount
  useEffect(() => {
    if (user) {
      fetchRecentIncidents()
    }
  }, [user])

  const fetchRecentIncidents = async () => {
    try {
      const response = await incidentAPI.getAll({ limit: 5, sort: '-createdAt' })
      if (response.data && Array.isArray(response.data)) {
        const formattedIncidents = response.data.map(incident => ({
          id: incident.incidentId || incident._id,
          type: incident.type,
          location: incident.location?.address || `${incident.location?.coordinates?.[1] || 0}, ${incident.location?.coordinates?.[0] || 0}`,
          time: getTimeAgo(incident.createdAt),
          severity: incident.severity,
          responders: incident.assignedResponders?.length || 0,
        }))
        setRecentIncidents(formattedIncidents)
      }
    } catch (error) {
      console.error('Error fetching incidents:', error)
      setRecentIncidents(recentReports)
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

  const handleSubmit = async () => {
    // Validation
    if (!incidentType.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Please enter an incident type.",
        variant: "destructive"
      })
      return
    }
    
    if (!description.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Please provide a description.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // Prepare incident data
      const incidentData = {
        type: incidentType,
        description: description,
        severity: "Medium", // Default severity
        location: {
          type: "Point",
          coordinates: gpsCoordinates 
            ? [gpsCoordinates.longitude, gpsCoordinates.latitude]
            : [0, 0], // Default coordinates if GPS not tagged
          address: location || "Location not specified"
        },
        reportedBy: user?.id || "anonymous",
        affectedCount: 0,
        media: attachedPhoto ? [attachedPhoto.url] : []
      }

      // Send to backend
      const response = await incidentAPI.create(incidentData)
      
      toast({ 
        title: "Report Submitted", 
        description: `Incident ${response.data.incidentId} logged and broadcasted to verified responders.`
      })

      // Reset form
      setIncidentType("")
      setLocation("")
      setDescription("")
      setAttachedPhoto(null)
      setGpsCoordinates(null)
      
      // Refresh recent incidents
      fetchRecentIncidents()
      
    } catch (error) {
      console.error('Error submitting incident:', error)
      toast({ 
        title: "Submission Failed", 
        description: error.response?.data?.message || "Failed to submit incident report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAttachPhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast({ 
            title: "File Too Large", 
            description: "Please select an image under 5MB.",
            variant: "destructive"
          })
          return
        }
        const reader = new FileReader()
        reader.onload = (event) => {
          setAttachedPhoto({
            name: file.name,
            url: event.target.result,
            size: (file.size / 1024).toFixed(2) + ' KB'
          })
          toast({ 
            title: "Photo Attached", 
            description: `${file.name} uploaded successfully.`
          })
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleTagGPS = () => {
    if (!navigator.geolocation) {
      toast({ 
        title: "GPS Not Supported", 
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      })
      return
    }

    toast({ 
      title: "Acquiring GPS...", 
      description: "Requesting location access..."
    })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        setGpsCoordinates(coords)
        toast({ 
          title: "GPS Location Tagged", 
          description: `Coordinates: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
        })
      },
      (error) => {
        let errorMessage = "Unable to retrieve location."
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location access denied. Please enable location permissions."
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information unavailable."
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out."
        }
        toast({ 
          title: "GPS Error", 
          description: errorMessage,
          variant: "destructive"
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const removePhoto = () => {
    setAttachedPhoto(null)
    toast({ title: "Photo Removed", description: "Attachment cleared." })
  }

  const removeGPS = () => {
    setGpsCoordinates(null)
    toast({ title: "GPS Removed", description: "Location tag cleared." })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="lg:col-span-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Incident Reporting</h2>
          <p className="text-muted-foreground">Submit and track localized disaster reports in real-time.</p>
        </div>

        <Card className="p-6 bg-card/50 border-white/5 space-y-6">
          <div className="flex items-center gap-3 text-primary">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold">New Incident Report</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Incident Type
              </label>
              <Input 
                placeholder="e.g. Fire, Flood, Medical" 
                className="bg-white/5 border-white/10 h-11"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Exact Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Street address or coordinates" 
                  className="pl-10 bg-white/5 border-white/10 h-11"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
            <Textarea
              placeholder="Describe the situation, number of affected individuals, and immediate needs..."
              className="bg-white/5 border-white/10 min-h-[120px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4 border-t border-white/5">
            <div className="flex gap-2 flex-wrap w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/10 h-10 px-4 hover:bg-white/10"
                onClick={handleAttachPhoto}
              >
                <Camera className="w-4 h-4 mr-2" />
                Attach Photo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/10 h-10 px-4 hover:bg-white/10"
                onClick={handleTagGPS}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Tag GPS
              </Button>
            </div>
            <Button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full md:w-auto bg-primary text-black font-bold h-10 px-8 hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>

          {/* Show attached photo preview */}
          {attachedPhoto && (
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded overflow-hidden bg-white/10">
                  <img src={attachedPhoto.url} alt="Attached" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium">{attachedPhoto.name}</p>
                  <p className="text-xs text-muted-foreground">{attachedPhoto.size}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removePhoto}
                className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Show GPS coordinates */}
          {gpsCoordinates && (
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">GPS Location Tagged</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {gpsCoordinates.latitude.toFixed(6)}, {gpsCoordinates.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeGPS}
                className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Recent Reports</h3>
          <Button variant="ghost" size="sm" className="text-xs text-primary hover:bg-primary/5">
            <Filter className="w-3 h-3 mr-2" />
            Filter
          </Button>
        </div>

        <div className="space-y-3">
          {recentIncidents.map((report) => (
            <Card
              key={report.id}
              className="p-4 bg-card/40 border-white/5 hover:bg-card/60 transition-colors cursor-pointer group"
              onClick={() =>
                toast({ title: report.id, description: `Incident Type: ${report.type} at ${report.location}` })
              }
            >
              <div className="flex justify-between items-start mb-3">
                <Badge
                  variant="outline"
                  className={
                    report.severity === "Critical"
                      ? "text-red-500 border-red-500/20 bg-red-500/5"
                      : report.severity === "High"
                      ? "text-orange-500 border-orange-500/20 bg-orange-500/5"
                      : "text-yellow-500 border-yellow-500/20 bg-yellow-500/5"
                  }
                >
                  {report.severity}
                </Badge>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {report.time}
                </span>
              </div>
              <h4 className="font-bold mb-1 group-hover:text-primary transition-colors">{report.type}</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                <MapPin className="w-3 h-3" />
                {report.location}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  <Users className="w-3 h-3" />
                  {report.responders} Dispatched
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
            </Card>
          ))}
          <Button
            variant="ghost"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setIsAllReportsOpen(true)}
          >
            View All Reports
          </Button>
        </div>
      </div>

      <Dialog open={isAllReportsOpen} onOpenChange={setIsAllReportsOpen}>
        <DialogContent className="bg-black/90 border-white/10 backdrop-blur-xl max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Sector Report Archive</DialogTitle>
            <DialogDescription>
              Viewing all validated geo-pings and incident logs from the last 72 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-white/10 bg-white/5 flex justify-between items-center"
              >
                <div>
                  <h5 className="font-bold text-sm">Archived Incident #{890 + i}</h5>
                  <p className="text-xs text-muted-foreground">Sector 7 Central • Resolved 4h ago</p>
                </div>
                <Badge variant="outline" className="border-white/10 text-muted-foreground">
                  RESOLVED
                </Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

