"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Package, Droplets, Zap, Activity, Plus, Search, ArrowUpRight, ShieldAlert } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { resourceAPI } from "@/lib/api"
import { useUser } from "@clerk/nextjs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const iconMap = {
  Health: Activity,
  Sanitation: Droplets,
  Food: Package,
  Energy: Zap,
  Medical: Activity,
  Water: Droplets,
  default: Package
}

export function ResourceInventory() {
  const { toast } = useToast()
  const { user, isSignedIn } = useUser()
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [isAidNetworkOpen, setIsAidNetworkOpen] = useState(false)
  const [resources, setResources] = useState([])
  const [newResource, setNewResource] = useState({
    name: "",
    category: "",
    stock: 0,
    total: 0
  })

  useEffect(() => {
    if (isSignedIn) {
      fetchResources()
    }
  }, [isSignedIn])

  const fetchResources = async () => {
    try {
      const response = await resourceAPI.getAll()
      // Axios wraps the response, so response.data is the backend response body
      // Backend returns { success: true, data: [...] }
      const resourcesData = response.data?.data || response.data || []
      if (Array.isArray(resourcesData)) {
        const formattedResources = resourcesData.map(res => {
          const stock = res.stock || 0
          const total = res.total || stock || 1
          const percentage = total > 0 ? (stock / total) * 100 : 0
          let status = res.status || "Stable"
          if (percentage < 30) status = "Critical"
          else if (percentage < 60) status = "Low"
          else if (percentage >= 80) status = "Active"
          
          return {
            _id: res._id,
            name: res.name,
            category: res.category,
            icon: iconMap[res.category] || iconMap.default,
            status,
            stock: stock,
            total: total,
            color: status === "Critical" ? "text-red-500" : status === "Low" ? "text-yellow-500" : status === "Active" ? "text-green-500" : "text-blue-500",
            bg: status === "Critical" ? "bg-red-500/10" : status === "Low" ? "bg-yellow-500/10" : status === "Active" ? "bg-green-500/10" : "bg-blue-500/10",
            unit: res.unit || "units"
          }
        })
        setResources(formattedResources)
      }
    } catch (error) {
      console.error('Error fetching resources:', error)
      setResources([])
    }
  }

  const handleAddResource = async () => {
    if (!newResource.name || !newResource.category || newResource.stock < 0 || newResource.total <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields correctly. Stock must be >= 0 and total must be > 0.",
        variant: "destructive"
      })
      return
    }

    if (newResource.stock > newResource.total) {
      toast({
        title: "Validation Error",
        description: "Stock cannot exceed total capacity.",
        variant: "destructive"
      })
      return
    }

    try {
      const resourceData = {
        name: newResource.name,
        category: newResource.category,
        stock: parseInt(newResource.stock) || 0,
        total: parseInt(newResource.total) || 1,
        location: {
          type: "Point",
          coordinates: [0, 0],
          address: "Central Hub"
        }
      }

      await resourceAPI.create(resourceData)
      
      toast({
        title: "Asset Registered",
        description: `${newResource.name} has been added to inventory.`
      })
      
      setIsAddAssetOpen(false)
      setNewResource({ name: "", category: "", stock: 0, total: 0 })
      fetchResources()
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.error || error.response?.data?.message || "Failed to add asset.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Resource Inventory</h2>
          <p className="text-muted-foreground">Manage and track critical rescue assets across sectors.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Filter inventory..." className="pl-9 bg-white/5 border-white/10" />
          </div>
          <Button className="bg-primary text-black font-bold" onClick={() => setIsAddAssetOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map((item) => (
          <Card key={item.name} className="p-6 bg-card/50 border-white/5 hover:border-white/10 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <Badge
                variant="outline"
                className={`${
                  item.status === "Critical"
                    ? "border-red-500/50 text-red-500 bg-red-500/5"
                    : item.status === "Low"
                      ? "border-yellow-500/50 text-yellow-500 bg-yellow-500/5"
                      : "border-green-500/50 text-green-500 bg-green-500/5"
                }`}
              >
                {item.status}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-lg">{item.name}</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.category}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Stock Level</span>
                  <span className="font-mono">
                    {item.stock}/{item.total}
                  </span>
                </div>
                <Progress value={(item.stock / item.total) * 100} className="h-1.5" />
              </div>

              <Button
                variant="ghost"
                className="w-full text-xs justify-between group-hover:bg-white/5"
                onClick={() => setSelectedResource(item)}
              >
                View Details
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8 bg-card/30 border-dashed border-white/10">
        <div className="flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold">Request Mutual Aid</h3>
          <p className="text-sm text-muted-foreground">
            Connect with neighboring sectors to share resources during critical shortages or large-scale incidents.
          </p>
          <Button
            variant="outline"
            className="border-primary/20 hover:bg-primary/5 bg-transparent"
            onClick={() => setIsAidNetworkOpen(true)}
          >
            Open Aid Network
          </Button>
        </div>
      </Card>

      <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
        <DialogContent className="bg-black/90 border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Add New Rescue Asset</DialogTitle>
            <DialogDescription>Register a new resource to the sector's central registry.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Asset Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Inflatable Boat V2" 
                className="bg-white/5 border-white/10"
                value={newResource.name}
                onChange={(e) => setNewResource({...newResource, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newResource.category}
                  onValueChange={(value) => setNewResource({...newResource, category: value})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Sanitation">Sanitation</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Energy">Energy</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Communication">Communication</SelectItem>
                    <SelectItem value="Shelter">Shelter</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  placeholder="0" 
                  min="0"
                  className="bg-white/5 border-white/10"
                  value={newResource.stock}
                  onChange={(e) => setNewResource({...newResource, stock: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="total">Total Capacity</Label>
              <Input 
                id="total" 
                type="number" 
                placeholder="100" 
                min="1"
                className="bg-white/5 border-white/10"
                value={newResource.total}
                onChange={(e) => setNewResource({...newResource, total: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full bg-primary text-black font-bold" onClick={handleAddResource}>
              Register Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
        <DialogContent className="bg-black/90 border-white/10 backdrop-blur-xl max-w-2xl">
          {selectedResource && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${selectedResource.bg} ${selectedResource.color}`}>
                    <selectedResource.icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px]">
                    {selectedResource.category}
                  </Badge>
                </div>
                <DialogTitle className="text-2xl">{selectedResource.name}</DialogTitle>
                <DialogDescription>Resource details and telemetry information</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-[10px] uppercase">Real-time Telemetry</Label>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-3xl font-bold">{selectedResource.stock}</span>
                        <span className="text-muted-foreground text-sm">/ {selectedResource.total} UNITS</span>
                      </div>
                      <Progress value={(selectedResource.stock / selectedResource.total) * 100} className="h-2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-[10px] text-muted-foreground uppercase">Condition</p>
                      <p className="font-bold text-green-500">OPERATIONAL</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-[10px] text-muted-foreground uppercase">Last Sync</p>
                      <p className="font-bold">2M AGO</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-muted-foreground text-[10px] uppercase">Recent Activity</Label>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <div>
                          <p className="font-medium">Stock replenishment recorded</p>
                          <p className="text-muted-foreground">Sector 7 Logistics Hub • 14h ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAidNetworkOpen} onOpenChange={setIsAidNetworkOpen}>
        <DialogContent className="bg-black/90 border-white/10 backdrop-blur-xl max-w-3xl">
          <DialogHeader>
            <DialogTitle>ResQ Aid Network</DialogTitle>
            <DialogDescription>Real-time sector mesh connection for mutual resource assistance.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Sector 4 (North)", "Sector 12 (East)", "Sector 9 (South)"].map((sector) => (
                <div key={sector} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-4">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-sm">{sector}</h5>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase">
                      <span>Available Capacity</span>
                      <span>82%</span>
                    </div>
                    <Progress value={82} className="h-1" />
                  </div>
                  <Button variant="outline" className="w-full h-8 text-xs bg-transparent border-white/10">
                    Request Sync
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

