import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { enrollmentsAPI, eventsAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingOverlay } from '@/components/ui/Loading'
import { ArrowLeft, Navigation, Clock, Ruler, RefreshCw } from 'lucide-react'

export default function DirectionsPage() {
  const { enrollmentId } = useParams()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const userMarkerRef = useRef(null)
  const routeLayerRef = useRef(null)
  const watchIdRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [routeInfo, setRouteInfo] = useState({ distance: null, duration: null })
  const [isTracking, setIsTracking] = useState(false)

  // Fetch enrollment and event data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const enrollments = await enrollmentsAPI.getUserEnrollments()
        const enrollment = enrollments.data.enrollments?.find(
          (e) => e._id === enrollmentId
        )

        if (!enrollment) {
          toast.error('Enrollment not found')
          navigate('/dashboard/my-enrollments')
          return
        }

        const eventId = enrollment.eventId?._id || enrollment.eventId
        const eventRes = await eventsAPI.getById(eventId)
        setEvent(eventRes.data.event)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast.error('Failed to load event details')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [enrollmentId, navigate])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !event || mapInstanceRef.current) return

    const initMap = async () => {
      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')

      // Fix marker icons
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const eventCoords = event.location?.coordinates
      if (!eventCoords || eventCoords.length < 2) {
        toast.error('Event location not available')
        return
      }

      const [lng, lat] = eventCoords
      const map = L.map(mapRef.current).setView([lat, lng], 14)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      // Event marker (red)
      const eventIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      L.marker([lat, lng], { icon: eventIcon })
        .addTo(map)
        .bindPopup(`<strong>${event.title}</strong><br/>${event.location?.address || 'Event Location'}`)

      mapInstanceRef.current = map

      // Start tracking user location
      startLocationTracking()
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [event])

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported')
      return
    }

    setIsTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        await updateUserMarker(latitude, longitude)
        await updateRoute(latitude, longitude)
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast.error('Failed to get your location')
        setIsTracking(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    )
  }

  const updateUserMarker = async (lat, lng) => {
    if (!mapInstanceRef.current) return

    const L = await import('leaflet')

    // User marker (blue)
    const userIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng])
    } else {
      userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('Your Location')
    }
  }

  const updateRoute = async (userLat, userLng) => {
    if (!mapInstanceRef.current || !event?.location?.coordinates) return

    const [eventLng, eventLat] = event.location.coordinates
    const L = await import('leaflet')

    try {
      // Use OSRM public API for routing
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${eventLng},${eventLat}?overview=full&geometries=geojson`
      )

      const data = await response.json()

      if (data.code !== 'Ok' || !data.routes?.length) {
        console.error('Routing failed:', data)
        return
      }

      const route = data.routes[0]
      const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])

      // Update route info
      setRouteInfo({
        distance: (route.distance / 1000).toFixed(1), // km
        duration: Math.round(route.duration / 60), // minutes
      })

      // Remove existing route
      if (routeLayerRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current)
      }

      // Draw new route
      routeLayerRef.current = L.polyline(coordinates, {
        color: '#3b82f6',
        weight: 5,
        opacity: 0.7,
      }).addTo(mapInstanceRef.current)

      // Fit bounds to show entire route
      mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), {
        padding: [50, 50],
      })
    } catch (error) {
      console.error('Route calculation error:', error)
    }
  }

  const centerOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15)
    }
  }

  if (loading) {
    return <LoadingOverlay message="Loading directions..." />
  }

  if (!event) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">Event not found</h2>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/dashboard/my-enrollments')}
        >
          Back to Enrollments
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-lg font-semibold text-neutral-900 truncate">
          Directions to {event.title}
        </h1>
      </div>

      {/* Route Info */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-lg bg-blue-100 p-2">
              <Ruler className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Distance</p>
              <p className="font-semibold">
                {routeInfo.distance ? `${routeInfo.distance} km` : 'Calculating...'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-lg bg-green-100 p-2">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Est. Time</p>
              <p className="font-semibold">
                {routeInfo.duration ? `${routeInfo.duration} min` : 'Calculating...'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-lg bg-purple-100 p-2">
              <Navigation className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Status</p>
              <p className="font-semibold">
                {isTracking ? 'Tracking' : 'Waiting...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <div className="relative flex-1 overflow-hidden rounded-lg border border-neutral-200">
        <div ref={mapRef} className="h-full w-full" />

        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full shadow-lg"
            onClick={centerOnUser}
            title="Center on my location"
          >
            <Navigation className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full shadow-lg"
            onClick={() => userLocation && updateRoute(userLocation.lat, userLocation.lng)}
            title="Refresh route"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 rounded-lg bg-white/95 p-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span>Your Location</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span>Event Location</span>
          </div>
        </div>
      </div>

      {/* Destination Info */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-neutral-100 p-3">
              <Navigation className="h-5 w-5 text-neutral-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-neutral-900">{event.title}</p>
              <p className="text-sm text-neutral-600">
                {event.location?.address || `${event.area}, ${event.district}`}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {new Date(event.date).toLocaleDateString()} at {event.time}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
