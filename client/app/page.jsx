"use client"

import { Card } from "@/components/ui/card"
import { SOSMap } from "@/components/sos-map"
import { StatsGrid } from "@/components/stats-grid"
import { TriageDashboard } from "@/components/triage-dashboard"
import { ResourceInventory } from "@/components/resource-inventory"
import { IncidentReporting } from "@/components/incident-reporting"
import { SettingsPanel } from "@/components/settings-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Shield, Zap, Globe, Radio, LifeBuoy, User } from "lucide-react"
import { Suspense, useState, useEffect } from "react"
import { EmergencySOSDialog } from "@/components/emergency-sos-dialog"
import { MissionsDialog } from "@/components/missions-dialog"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { useToast } from "@/hooks/use-toast"
import { UserButton, useUser } from "@clerk/nextjs"
import { AppProvider } from "@/contexts/AppContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/contexts/AppContext"

function ResQLinkContent() {
  const [activeTab, setActiveTab] = useState("Map View")
  const [isSOSOpen, setIsSOSOpen] = useState(false)
  const [isMissionsOpen, setIsMissionsOpen] = useState(false)
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false)
  const [isPostResourceOpen, setIsPostResourceOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useUser()
  const { isMounted } = useApp()

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("Map View")}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LifeBuoy className="text-black w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">ResQ-Link</span>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              {["Map View", "Resources", "Reports", "Settings"].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === item ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search geo-tags..."
                className="w-64 h-9 pl-9 bg-white/5 border-white/10 text-xs focus-visible:ring-primary"
              />
            </div>
            <NotificationsDropdown />
            <Button
              className="h-9 px-4 bg-primary text-black font-bold hover:bg-primary/90"
              onClick={() => setIsSOSOpen(true)}
            >
              <Zap className="w-4 h-4 mr-2" />
              Emergency SOS
            </Button>
            {isMounted && (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                    userButtonPopoverCard: "bg-card border-white/10",
                    userButtonPopoverActionButton: "hover:bg-white/5",
                  },
                }}
              />
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-[1600px] mx-auto space-y-8">
        <Suspense fallback={null}>
          {activeTab === "Map View" && (
            <div className="animate-in fade-in duration-700">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
                <div className="space-y-2">
                  {/* Badge Component */}
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="text-primary border-primary/20 bg-primary/5 uppercase tracking-widest text-[10px] font-bold px-3 py-1"
                    >
                      Active Crisis Mode
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3" /> Sector: North-West Metro
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                    Real-Time Rescue Dashboard
                  </h1>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="mt-8">
                <StatsGrid />
              </div>

              {/* Main Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                <div className="lg:col-span-8 space-y-6">
                  <SOSMap />

                  {/* Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card
                      onClick={() => setIsVolunteerOpen(true)}
                      className="p-6 bg-card/30 border-white/5 flex items-center gap-6 group hover:border-primary/40 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold">Volunteer to Rescue</h4>
                        <p className="text-xs text-muted-foreground">Join 45 verified responders nearby</p>
                      </div>
                    </Card>
                    <Card
                      onClick={() => setIsPostResourceOpen(true)}
                      className="p-6 bg-card/30 border-white/5 flex items-center gap-6 group hover:border-primary/40 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold">Post Available Resource</h4>
                        <p className="text-xs text-muted-foreground">Share generators, boats, or kits</p>
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="lg:col-span-4 h-full">
                  <TriageDashboard onViewAllMissions={() => setIsMissionsOpen(true)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Resources" && <ResourceInventory />}
          {activeTab === "Reports" && <IncidentReporting />}
          {activeTab === "Settings" && <SettingsPanel />}
        </Suspense>
      </main>

      {/* Offline Status Footer */}
      <footer className="fixed bottom-0 w-full bg-black/80 backdrop-blur-md border-t border-border py-2 px-6">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              PWA Sync: Active
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="flex items-center gap-2">Socket.io: Connected</div>
          </div>
          <div className="text-[10px] text-muted-foreground">System V4.2.1 • ResQ-Link Protocol</div>
        </div>
      </footer>

      {/* Global Dialogs */}
      <EmergencySOSDialog open={isSOSOpen} onOpenChange={setIsSOSOpen} />
      <MissionsDialog open={isMissionsOpen} onOpenChange={setIsMissionsOpen} />
      <Dialog open={isVolunteerOpen} onOpenChange={setIsVolunteerOpen}>
        <DialogContent className="bg-black/90 border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Rescue Volunteer Registration</DialogTitle>
            <DialogDescription>Verify your credentials to join the nearby responder network.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <p className="text-xs font-bold text-primary">Identity Verification Required</p>
            </div>
            <div className="space-y-2">
              <Label>Skills & Certifications</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Medical", "Water Rescue", "Fire Safety", "Logistics"].map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox id={skill} />
                    <label htmlFor={skill} className="text-xs font-medium leading-none">
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full bg-primary text-black font-bold" onClick={() => setIsVolunteerOpen(false)}>
              Complete Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPostResourceOpen} onOpenChange={setIsPostResourceOpen}>
        <DialogContent className="bg-black/90 border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Share Emergency Resources</DialogTitle>
            <DialogDescription>List equipment or supplies available for community use.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid gap-2">
              <Label>Resource Type</Label>
              <Input placeholder="e.g. 5kW Generator, Rubber Dinghy" className="bg-white/5 border-white/10" />
            </div>
            <div className="grid gap-2">
              <Label>Availability Status</Label>
              <Badge className="w-fit bg-green-500/10 text-green-500 border-green-500/20">READY FOR DISPATCH</Badge>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full bg-primary text-black font-bold" onClick={() => setIsPostResourceOpen(false)}>
              List Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ResQLinkApp() {
  return (
    <AppProvider>
      <ResQLinkContent />
    </AppProvider>
  )
}
