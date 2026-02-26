import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { eventsAPI, enrollmentsAPI } from '@/services/api'
import { useAuthStore } from '@/app/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Calendar, MapPin, Ticket, Plus, ArrowRight } from 'lucide-react'

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    nearbyEvents: [],
    enrollments: [],
    myEvents: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nearbyRes, enrollmentsRes, myEventsRes] = await Promise.all([
          eventsAPI.getNearby(),
          enrollmentsAPI.getUserEnrollments(),
          eventsAPI.getUserEvents(),
        ])

        setStats({
          nearbyEvents: nearbyRes.data.events || [],
          enrollments: enrollmentsRes.data.enrollments || [],
          myEvents: myEventsRes.data.events || [],
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="mt-1 text-neutral-600">
          Here's what's happening in your community
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Nearby Events</p>
                <p className="mt-1 text-2xl font-bold">{stats.nearbyEvents.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">My Enrollments</p>
                <p className="mt-1 text-2xl font-bold">{stats.enrollments.length}</p>
              </div>
              <Ticket className="h-8 w-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Events Created</p>
                <p className="mt-1 text-2xl font-bold">{stats.myEvents.length}</p>
              </div>
              <Plus className="h-8 w-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/dashboard/events">
          <Button variant="outline" size="sm">
            Browse Events
          </Button>
        </Link>
        <Link to="/dashboard/events/create">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Nearby Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Nearby Events</CardTitle>
            <Link to="/dashboard/events">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats.nearbyEvents.length === 0 ? (
              <p className="text-center text-sm text-neutral-500 py-8">
                No nearby events at the moment
              </p>
            ) : (
              <div className="space-y-4">
                {stats.nearbyEvents.slice(0, 4).map((event) => (
                  <Link
                    key={event._id}
                    to={`/dashboard/events/${event._id}`}
                    className="flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-neutral-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                      <Calendar className="h-6 w-6 text-neutral-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{event.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                        <span>{formatDate(event.date)}</span>
                        <span>•</span>
                        <span className="truncate">{event.area || event.district}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">{event.type.replace('-', ' ')}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Enrollments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Enrollments</CardTitle>
            <Link to="/dashboard/my-enrollments">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats.enrollments.length === 0 ? (
              <div className="py-8 text-center">
                <Ticket className="mx-auto h-12 w-12 text-neutral-300" />
                <p className="mt-4 text-sm text-neutral-500">
                  You haven't enrolled in any events yet
                </p>
                <Link to="/dashboard/events" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">
                    Browse Events
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.enrollments.slice(0, 4).map((enrollment) => (
                  <div
                    key={enrollment._id}
                    className="flex items-start gap-4 rounded-lg p-2"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                      <Ticket className="h-6 w-6 text-neutral-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">
                        {enrollment.eventId?.title || 'Event'}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                        <span>{formatDate(enrollment.eventId?.date)}</span>
                        <span>•</span>
                        <span className="truncate">{enrollment.eventId?.area}</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        enrollment.status === 'approved'
                          ? 'success'
                          : enrollment.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {enrollment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
