"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in Leaflet with Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

export default function RealMap({ pings = [], onPingClick }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map centered on New York City
    const map = L.map(mapRef.current, {
      zoomControl: false, // We'll add custom controls
    }).setView([40.7128, -74.006], 12)

    // Add dark theme tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map)

    // Add zoom control to bottom right
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map)

    mapInstanceRef.current = map

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add markers for each ping
    pings.forEach((ping) => {
      // Create custom icon based on ping type
      const iconHtml = `
        <div style="position: relative;">
          <div style="
            background-color: ${ping.color};
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 0 20px ${ping.color};
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              color: white;
              font-weight: bold;
              font-size: 14px;
              transform: rotate(45deg);
            ">${ping.people || "!"}</span>
          </div>
          ${
            ping.score > 80
              ? `<div style="
            position: absolute;
            top: -3px;
            left: -3px;
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            border: 3px solid ${ping.color};
            transform: rotate(-45deg);
            animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>`
              : ""
          }
        </div>
      `

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-marker",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      })

      const marker = L.marker([ping.lat, ping.lng], { icon: customIcon }).addTo(mapInstanceRef.current)

      // Add popup
      const popupContent = `
        <div style="font-family: system-ui; min-width: 200px;">
          <div style="
            background: ${ping.color};
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 8px;
          ">
            PRIORITY: ${ping.score}
          </div>
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${ping.type}</h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${ping.details}</p>
          <div style="font-size: 11px; color: #999;">
            <strong>Status:</strong> ${ping.status}<br/>
            ${ping.people > 0 ? `<strong>People:</strong> ${ping.people}` : ""}
          </div>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: "custom-popup",
      })

      // Add click event
      marker.on("click", () => {
        if (onPingClick) {
          onPingClick(ping)
        }
      })

      markersRef.current.push(marker)
    })

    // Fit bounds to show all markers
    if (pings.length > 0) {
      const bounds = L.latLngBounds(pings.map((ping) => [ping.lat, ping.lng]))
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [pings, onPingClick])

  return (
    <>
      <div ref={mapRef} style={{ width: "100%", height: "100%", background: "#000" }} />
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }

        @keyframes ping {
          75%,
          100% {
            transform: rotate(-45deg) scale(1.5);
            opacity: 0;
          }
        }

        .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
        }

        .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.9);
        }

        .leaflet-container {
          background: #000;
        }

        .leaflet-control-zoom {
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          background: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(10px);
          border-radius: 8px !important;
          overflow: hidden;
        }

        .leaflet-control-zoom a {
          background: rgba(0, 0, 0, 0.8) !important;
          color: white !important;
          border: none !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .leaflet-control-zoom a:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .leaflet-control-zoom a:last-child {
          border-bottom: none !important;
        }
      `}</style>
    </>
  )
}
