import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { adminAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Loading'
import { 
  Search, Filter, Eye, Check, X, 
  Calendar, MapPin, User, Clock 
} from 'lucide-react'

export default function AdminEventsPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, search, statusFilter])

  const fetchEvents = async () => {
    try {
      const res = await adminAPI.getAllEvents()
      setEvents(res.data.events || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = [...events]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.title?.toLowerCase().includes(searchLower) ||
          e.area?.toLowerCase().includes(searchLower) ||
          e.district?.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((e) => e.status === statusFilter)
    }

    setFilteredEvents(filtered)
  }

  const handleStatusChange = async (eventId, status) => {
    setActionLoading(true)
    try {
      // Use the correct API method based on status
      if (status === 'approved') {
        await adminAPI.approveEvent(eventId)
      } else if (status === 'rejected') {
        await adminAPI.rejectEvent(eventId)
      }
      toast.success(`Event ${status} successfully`)
      
      // Update local state
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, status } : e))
      )
      
      if (selectedEvent?._id === eventId) {
        setSelectedEvent((prev) => ({ ...prev, status }))
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Failed to update event status')
    } finally {
      setActionLoading(false)
    }
  }

  const openDetail = (event) => {
    setSelectedEvent(event)
    setShowDetail(true)
  }

  const getStatusBadge = (status) => {
    const variants = {
      approved: 'success',
      rejected: 'destructive',
      pending: 'warning',
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Manage Events</h1>
        <p className="text-neutral-600">Review and manage event submissions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-4 text-neutral-600">No events found</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event._id} className="hover:border-neutral-300 transition-colors">
              <CardContent className="pt-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neutral-900">{event.title}</h3>
                      {getStatusBadge(event.status)}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.area}, {event.district}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetail(event)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    {event.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusChange(event._id, 'approved')}
                          disabled={actionLoading}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStatusChange(event._id, 'rejected')}
                          disabled={actionLoading}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Event Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title="Event Details"
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
              {getStatusBadge(selectedEvent.status)}
            </div>

            {selectedEvent.image && (
              <img
                src={`${import.meta.env.VITE_API_URL || ''}/uploads/${selectedEvent.image}`}
                alt={selectedEvent.title}
                className="h-48 w-full rounded-lg object-cover"
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-neutral-500">Type</p>
                <p className="text-neutral-900 capitalize">{selectedEvent.type?.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Date & Time</p>
                <p className="text-neutral-900">
                  {new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Location</p>
                <p className="text-neutral-900">
                  {selectedEvent.area}{selectedEvent.district ? `, ${selectedEvent.district}` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Ticket Price</p>
                <p className="text-neutral-900">
                  {!selectedEvent.ticketPrice || selectedEvent.ticketPrice === 0
                    ? 'Free'
                    : `₹${selectedEvent.ticketPrice}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Max Seats</p>
                <p className="text-neutral-900">{selectedEvent.maxSeats}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Enrollments</p>
                <p className="text-neutral-900">{selectedEvent.enrollments?.length || 0}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-500">Description</p>
              <p className="text-neutral-900">{selectedEvent.description}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-500">Organizer</p>
              <p className="text-neutral-900">
                {selectedEvent.createdBy?.name || 'Unknown'} - {selectedEvent.contact}
              </p>
            </div>

            {selectedEvent.status === 'pending' && (
              <div className="flex gap-2 border-t border-neutral-200 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleStatusChange(selectedEvent._id, 'approved')
                    setShowDetail(false)
                  }}
                  disabled={actionLoading}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve Event
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    handleStatusChange(selectedEvent._id, 'rejected')
                    setShowDetail(false)
                  }}
                  disabled={actionLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject Event
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
