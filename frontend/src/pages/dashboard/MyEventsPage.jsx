import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { eventsAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Calendar, MapPin, Users, Plus, Edit, Eye } from 'lucide-react'

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function MyEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsAPI.getUserEvents()
        setEvents(response.data.events || [])
      } catch (error) {
        console.error('Failed to fetch events:', error)
        toast.error('Failed to load your events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'success'
      case 'rejected':
        return 'destructive'
      default:
        return 'warning'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Events</h1>
          <p className="mt-1 text-neutral-600">
            Events you've created
          </p>
        </div>
        <Link to="/dashboard/events/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-neutral-300" />
          <h3 className="mt-4 text-lg font-medium text-neutral-900">
            No events created yet
          </h3>
          <p className="mt-2 text-neutral-600">
            Start by creating your first community event
          </p>
          <Link to="/dashboard/events/create" className="mt-4 inline-block">
            <Button>Create Event</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
                  <Badge variant={getStatusVariant(event.status)}>
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-neutral-600">
                  {event.description}
                </p>
                
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
                      {event.location?.address || event.area || 'TBA'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {event.enrollments?.length || 0} / {event.maxSeats} enrolled
                    </span>
                  </div>
                </div>

                {event.adminComment && (
                  <div className="mt-4 rounded-lg bg-neutral-50 p-3">
                    <p className="text-xs font-medium text-neutral-700">Admin Note:</p>
                    <p className="mt-1 text-sm text-neutral-600">{event.adminComment}</p>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Link to={`/dashboard/events/${event._id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
