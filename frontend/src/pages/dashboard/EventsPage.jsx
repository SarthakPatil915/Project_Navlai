import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { eventsAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react'

const eventTypes = [
  { value: '', label: 'All Types' },
  { value: 'tree-plantation', label: 'Tree Plantation' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'awareness-drive', label: 'Awareness Drive' },
  { value: 'cleanup', label: 'Cleanup' },
  { value: 'health-camp', label: 'Health Camp' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
]

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsAPI.getAll()
        setEvents(response.data.events || [])
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.area && event.area.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = !typeFilter || event.type === typeFilter

    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Browse Events</h1>
          <p className="mt-1 text-neutral-600">
            Discover and join events in your community
          </p>
        </div>
        <Link to="/dashboard/events/create">
          <Button>Create Event</Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search events..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="gap-2 sm:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-40"
          >
            {eventTypes.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-neutral-300" />
          <h3 className="mt-4 text-lg font-medium text-neutral-900">No events found</h3>
          <p className="mt-2 text-neutral-600">
            {searchTerm || typeFilter
              ? 'Try adjusting your filters'
              : 'Be the first to create an event!'}
          </p>
          <Link to="/dashboard/events/create" className="mt-4 inline-block">
            <Button>Create Event</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event._id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    {event.type.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-neutral-600">{event.description}</p>
                <div className="mt-4 space-y-2 text-sm text-neutral-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(event.date)} at {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {event.location?.address || event.area || 'Location TBA'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {event.enrollments?.length || 0} / {event.maxSeats} enrolled
                    </span>
                  </div>
                </div>
                <Link to={`/dashboard/events/${event._id}`} className="mt-4 block">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
