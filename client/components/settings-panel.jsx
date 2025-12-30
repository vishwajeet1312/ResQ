"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { User, Bell, Shield, Smartphone, Database, ChevronRight, Wifi, AlertTriangle, Key, Eye, EyeOff, Download, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState("Profile")
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()

  const sections = [
    { name: "Profile", icon: User },
    { name: "Notifications", icon: Bell },
    { name: "Security", icon: Shield },
    { name: "Device Sync", icon: Smartphone },
    { name: "Local Data", icon: Database },
  ]

  const handleProfileUpdate = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
      variant: "default",
    })
  }

  const handlePasswordChange = () => {
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
      variant: "default",
    })
  }

  const handleDataExport = () => {
    toast({
      title: "Export Started",
      description: "Your data is being prepared for download...",
      variant: "default",
    })
  }

  const handleDataDelete = () => {
    toast({
      title: "Data Cleared",
      description: "All local data has been removed from this device.",
      variant: "destructive",
    })
  }

  const renderContent = () => {
    switch (activeSection) {
      case "Profile":
        return (
          <>
            <Card className="p-6 bg-card/50 border-white/5 space-y-6">
              <h3 className="font-bold border-b border-white/5 pb-4">Personal Responder Profile</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <Input defaultValue="Chief Alex Chen" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Responder ID
                  </label>
                  <Input defaultValue="RSQ-2024-X9" disabled className="bg-white/5 border-white/10 opacity-50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Emergency Contact
                </label>
                <Input defaultValue="+1 (555) 012-3456" className="bg-white/5 border-white/10" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                <Input defaultValue="alex.chen@resqlink.org" type="email" className="bg-white/5 border-white/10" />
              </div>

              <div className="pt-4">
                <Button onClick={handleProfileUpdate} className="bg-white/10 hover:bg-white/20 text-white border-white/5">
                  Update Profile
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-white/5 space-y-6">
              <h3 className="font-bold border-b border-white/5 pb-4">Alert Preferences</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Critical SOS Pings</p>
                    <p className="text-xs text-muted-foreground">
                      Override silent mode for high-priority rescue requests.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Sector Proximity Alerts</p>
                    <p className="text-xs text-muted-foreground">
                      Notify when incidents occur within 5km of your location.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </>
        )

      case "Notifications":
        return (
          <>
            <Card className="p-6 bg-card/50 border-white/5 space-y-6">
              <h3 className="font-bold border-b border-white/5 pb-4">Notification Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive push notifications on this device</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Email Alerts</p>
                    <p className="text-xs text-muted-foreground">Send notifications to your email address</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">SMS Alerts</p>
                    <p className="text-xs text-muted-foreground">Receive critical alerts via SMS</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Sound Effects</p>
                    <p className="text-xs text-muted-foreground">Play sound for new notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-white/5 space-y-6">
              <h3 className="font-bold border-b border-white/5 pb-4">Alert Types</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Emergency SOS</p>
                    <p className="text-xs text-muted-foreground">High priority emergency alerts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Mission Updates</p>
                    <p className="text-xs text-muted-foreground">Updates on assigned missions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Resource Requests</p>
                    <p className="text-xs text-muted-foreground">Notifications for resource availability</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">System Updates</p>
                    <p className="text-xs text-muted-foreground">Platform maintenance and updates</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>
          </>
        )

      case "Security":
        return (
          <>
            <Card className="p-6 bg-card/50 border-white/5 space-y-6">
              <h3 className="font-bold border-b border-white/5 pb-4">Password & Authentication</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      className="bg-white/5 border-white/10 pr-10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    New Password
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handlePasswordChange}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/5"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-white/5 space-y-6">
              <h3 className="font-bold border-b border-white/5 pb-4">Two-Factor Authentication</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Enable 2FA</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>

                <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-500">Two-Factor Authentication Disabled</p>
                    <p className="text-xs text-yellow-500/70">
                      Enable 2FA to protect your account from unauthorized access
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-white/5 space-y-6">
              <h3 className="font-bold border-b border-white/5 pb-4">Active Sessions</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Current Device</p>
                    <p className="text-xs text-muted-foreground">Windows • Chrome • Last active: Now</p>
                  </div>
                  <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Mobile Device</p>
                    <p className="text-xs text-muted-foreground">iOS • Safari • Last active: 2 hours ago</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs text-red-500 hover:text-red-400">
                    Revoke
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )

      case "Device Sync":
        return (
          <>
            <Card className="p-6 bg-card/50 border-white/5 space-y-6">
              <h3 className="font-bold border-b border-white/5 pb-4">Synchronization Status</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Auto-Sync</p>
                    <p className="text-xs text-muted-foreground">Automatically sync data across all devices</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Sync on WiFi Only</p>
                    <p className="text-xs text-muted-foreground">Prevent data usage on mobile networks</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Card className="p-4 bg-blue-500/5 border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Wifi className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-blue-400">Last Sync: 2 minutes ago</p>
                    <p className="text-[10px] text-blue-400/70 uppercase tracking-tighter">All data up to date</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[10px] text-blue-400 font-bold uppercase tracking-widest hover:bg-blue-500/10"
                >
                  Force Sync
                </Button>
              </Card>
            </Card>

            <Card className="p-6 bg-card/50 border-white/5 space-y-6">
              <h3 className="font-bold border-b border-white/5 pb-4">Connected Devices</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Desktop PC</p>
                      <p className="text-xs text-muted-foreground">Synced 2 minutes ago</p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Online</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">iPhone 14</p>
                      <p className="text-xs text-muted-foreground">Synced 3 hours ago</p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">Offline</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">iPad Pro</p>
                      <p className="text-xs text-muted-foreground">Synced 1 day ago</p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">Offline</div>
                </div>
              </div>
            </Card>
          </>
        )

      case "Local Data":
        return (
          <>
            <Card className="p-6 bg-card/50 border-white/5 space-y-6">
              <h3 className="font-bold border-b border-white/5 pb-4">Storage Usage</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cached Maps</span>
                    <span className="font-medium">245 MB</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[45%]"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Incident Reports</span>
                    <span className="font-medium">128 MB</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[25%]"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Media Files</span>
                    <span className="font-medium">512 MB</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[75%]"></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Storage Used</span>
                    <span className="text-lg font-bold text-primary">885 MB</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-white/5 space-y-6">
              <h3 className="font-bold border-b border-white/5 pb-4">Data Management</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Offline Mode</p>
                    <p className="text-xs text-muted-foreground">Cache data for offline access</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Auto-Clear Cache</p>
                    <p className="text-xs text-muted-foreground">Clear cache after 30 days</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <Button
                  onClick={handleDataExport}
                  variant="outline"
                  className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-3" />
                  Export All Data
                </Button>

                <Button
                  onClick={handleDataDelete}
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/5"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Clear All Local Data
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-orange-500/5 border-orange-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-500">Data Privacy Notice</p>
                <p className="text-xs text-orange-500/70">
                  All local data is encrypted and stored securely on your device. Clearing data will remove offline
                  access but won't affect cloud-synced information.
                </p>
              </div>
            </Card>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">Configure your response profile and platform preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <aside className="md:col-span-4 space-y-2">
          {sections.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveSection(item.name)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                activeSection === item.name
                  ? "bg-primary text-black font-bold shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3 text-sm">
                <item.icon className="w-4 h-4" />
                {item.name}
              </div>
              <ChevronRight className={`w-4 h-4 ${activeSection === item.name ? "opacity-100" : "opacity-0"}`} />
            </button>
          ))}
        </aside>

        <div className="md:col-span-8 space-y-6">{renderContent()}</div>
      </div>
    </div>
  )
}

