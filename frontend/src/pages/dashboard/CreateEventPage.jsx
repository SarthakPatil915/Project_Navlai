import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { eventsAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Loading'
import { MapPin, Locate } from 'lucide-react'

const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  type: z.string().min(1, 'Please select event type'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  contact: z.string().regex(/^[0-9]{10}$/, 'Contact must be 10 digits'),
  maxSeats: z.number().min(1, 'Must have at least 1 seat'),
  ticketPrice: z.number().min(0, 'Price cannot be negative').optional(),
  address: z.string().optional(),
})

const eventTypes = [
  { value: 'tree-plantation', label: 'Tree Plantation' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'awareness-drive', label: 'Awareness Drive' },
  { value: 'cleanup', label: 'Cleanup' },
  { value: 'health-camp', label: 'Health Camp' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
]

export default function CreateEventPage() {
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [location, setLocation] = useState({ lat: null, lng: null, address: '' })
  const [gettingLocation, setGettingLocation] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      maxSeats: 50,
      ticketPrice: 0,
    },
  })

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

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

      const map = L.map(mapRef.current).setView([18.5204, 73.8567], 12) // Default to Pune

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      // Click to place marker
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        updateMarker(lat, lng, L, map)
        reverseGeocode(lat, lng)
      })

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const updateMarker = async (lat, lng, L, map) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map)
      
      markerRef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng()
        reverseGeocode(pos.lat, pos.lng)
      })
    }

    map.setView([lat, lng], 15)
    setLocation((prev) => ({ ...prev, lat, lng }))
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setLocation((prev) => ({ ...prev, lat, lng, address }))
      setValue('address', address)
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        
        const L = await import('leaflet')
        if (mapInstanceRef.current) {
          updateMarker(lat, lng, L, mapInstanceRef.current)
          reverseGeocode(lat, lng)
        }
        
        setGettingLocation(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast.error('Failed to get your location')
        setGettingLocation(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const onSubmit = async (data) => {
    if (!location.lat || !location.lng) {
      toast.error('Please select event location on the map')
      return
    }

    setIsSubmitting(true)
    try {
      await eventsAPI.create({
        ...data,
        location: {
          lat: location.lat,
          lng: location.lng,
          address: location.address,
        },
      })
      toast.success('Event created! Waiting for admin approval.')
      navigate('/dashboard/my-events')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Create Event</h1>
        <p className="mt-1 text-neutral-600">
          Fill in the details to create a new community event
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                error={errors.title}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <Select id="type" error={errors.type} {...register('type')}>
                <option value="">Select type</option>
                {eventTypes.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your event in detail"
                rows={5}
                error={errors.description}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Date & Time</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                error={errors.date}
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                error={errors.time}
                {...register('time')}
              />
              {errors.time && (
                <p className="text-sm text-red-500">{errors.time.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>
              Click on the map to select location or use current location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <Spinner size="sm" />
              ) : (
                <Locate className="h-4 w-4" />
              )}
              Use Current Location
            </Button>

            <div
              ref={mapRef}
              className="h-64 w-full rounded-lg border border-neutral-200"
            />

            {location.address && (
              <div className="flex items-start gap-2 rounded-lg bg-neutral-50 p-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                <p className="text-sm text-neutral-600">{location.address}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                placeholder="Enter or auto-filled address"
                {...register('address', {
                  onChange: (e) => {
                    setLocation((prev) => ({ ...prev, address: e.target.value }))
                  },
                })}
                value={location.address}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                placeholder="10-digit mobile number"
                error={errors.contact}
                {...register('contact')}
              />
              {errors.contact && (
                <p className="text-sm text-red-500">{errors.contact.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSeats">Maximum Participants</Label>
              <Input
                id="maxSeats"
                type="number"
                min="1"
                error={errors.maxSeats}
                {...register('maxSeats', { valueAsNumber: true })}
              />
              {errors.maxSeats && (
                <p className="text-sm text-red-500">{errors.maxSeats.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketPrice">Ticket Price (₹)</Label>
              <Input
                id="ticketPrice"
                type="number"
                min="0"
                placeholder="0 for free events"
                error={errors.ticketPrice}
                {...register('ticketPrice', { valueAsNumber: true })}
              />
              {errors.ticketPrice && (
                <p className="text-sm text-red-500">{errors.ticketPrice.message}</p>
              )}
              <p className="text-xs text-neutral-500">Leave as 0 for free events</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
            Create Event
          </Button>
        </div>
      </form>
    </div>
  )
}
