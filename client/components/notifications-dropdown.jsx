"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, AlertTriangle, Zap, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { notificationAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@clerk/nextjs"

const iconMap = {
  SOS: AlertTriangle,
  Mission: Zap,
  Resource: Package,
  default: Bell
}

export function NotificationsDropdown() {
  const { toast } = useToast()
  const { isSignedIn } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isSignedIn) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [isSignedIn])

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll({ limit: 5 })
      if (response.data && Array.isArray(response.data)) {
        setNotifications(response.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount()
      setUnreadCount(response.data.count || 0)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} mins ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      setUnreadCount(0)
      toast({ title: "All notifications marked as read" })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-black" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-black border-white/10 text-white p-2" align="end">
        <DropdownMenuLabel className="font-bold px-4 py-3">
          Crisis Notifications {unreadCount > 0 && `(${unreadCount})`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = iconMap[notification.type] || iconMap.default
            return (
              <DropdownMenuItem key={notification._id} className="p-4 focus:bg-white/5 flex gap-4 cursor-pointer">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.type === 'SOS' ? 'bg-red-500/10' : 
                  notification.type === 'Mission' ? 'bg-primary/10' : 
                  'bg-blue-500/10'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    notification.type === 'SOS' ? 'text-red-500' : 
                    notification.type === 'Mission' ? 'text-primary' : 
                    'text-blue-500'
                  }`} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold leading-none">{notification.title}</p>
                  <p className="text-[10px] text-muted-foreground">{notification.message}</p>
                  <p className="text-[10px] text-primary font-mono uppercase tracking-tighter">
                    {getTimeAgo(notification.createdAt)}
                  </p>
                </div>
              </DropdownMenuItem>
            )
          })
        )}

        <DropdownMenuSeparator className="bg-white/5" />
        <Button
          variant="ghost"
          className="w-full h-8 text-[10px] text-muted-foreground hover:text-white uppercase font-bold tracking-widest"
          onClick={handleMarkAllRead}
        >
          Mark all as read
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

