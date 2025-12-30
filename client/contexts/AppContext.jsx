'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { setAuthToken } from '@/lib/api';
import { initializeSocket, disconnectSocket } from '@/lib/socket';

const AppContext = createContext({});

export function AppProvider({ children }) {
  const { userId, getToken, isLoaded, isSignedIn } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we only run on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !isMounted) return;
    
    async function setupAuth() {
      if (isLoaded && isSignedIn) {
        try {
          // Get Clerk token and set it for API requests
          const token = await getToken();
          setAuthToken(token);

          // Initialize Socket.IO
          const socketInstance = initializeSocket(userId);
          setSocket(socketInstance);

          socketInstance.on('connect', () => {
            setIsConnected(true);
          });

          socketInstance.on('disconnect', () => {
            setIsConnected(false);
          });
        } catch (error) {
          console.error('Error setting up auth:', error);
        }
      } else if (isLoaded && !isSignedIn) {
        // Clear auth token if user is not signed in
        setAuthToken(null);
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      }
    }

    setupAuth();

    return () => {
      if (!isSignedIn) {
        disconnectSocket();
      }
    };
  }, [isLoaded, isSignedIn, userId, getToken]);

  // Refresh token periodically (every 45 minutes)
  useEffect(() => {
    if (typeof window === 'undefined' || !isSignedIn) return;

    const refreshToken = async () => {
      try {
        const token = await getToken({ template: 'default' });
        setAuthToken(token);
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    };

    const interval = setInterval(refreshToken, 45 * 60 * 1000); // 45 minutes

    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  return (
    <AppContext.Provider
      value={{
        socket,
        isConnected,
        userId,
        isSignedIn,
        isMounted,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
