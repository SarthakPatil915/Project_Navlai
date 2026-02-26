import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { adminAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Loading'
import { 
  Users, Calendar, CheckCircle, AlertCircle, 
  TrendingUp, Clock, MapPin 
} from 'lucide-react'

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalEnrollments: 0,
    pendingEvents: 0,
    approvedEvents: 0,
    rejectedEvents: 0,
  })
  const [recentEvents, setRecentEvents] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [_recentEnrollments, _setRecentEnrollments] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [usersRes, eventsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getAllEvents(),
      ].map((p) => p.catch(() => ({ data: {} }))))

      const users = usersRes?.data?.users || []
      const events = eventsRes?.data?.events || []

      // Calculate stats
      const pendingEvents = events.filter((e) => e.status === 'pending').length
      const approvedEvents = events.filter((e) => e.status === 'approved').length
      const rejectedEvents = events.filter((e) => e.status === 'rejected').length

      setStats({
        totalUsers: users.length,
        totalEvents: events.length,
        totalEnrollments: events.reduce((acc, e) => acc + (e.enrollmentCount || 0), 0),
        pendingEvents,
        approvedEvents,
        rejectedEvents,
      })

      // Get recent events
      setRecentEvents(
        events
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      )
    } catch (error) {
      console.error('Dashboard data error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'purple',
    },
    {
      title: 'Approved Events',
      value: stats.approvedEvents,
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'Pending Events',
      value: stats.pendingEvents,
      icon: Clock,
      color: 'yellow',
    },
  ]

  const colorMap = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p className="text-neutral-600">Overview of system activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const colors = colorMap[stat.color]
          return (
            <Card key={stat.title}>
              <CardContent className="flex items-center gap-4 pt-4">
                <div className={`rounded-lg ${colors.bg} p-3`}>
                  <stat.icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-neutral-500">No events yet</p>
          ) : (
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div
                  key={event._id}
                  className="flex items-center justify-between border-b border-neutral-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-neutral-100 p-2">
                      <Calendar className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{event.title}</p>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <MapPin className="h-3 w-3" />
                        <span>{event.area}, {event.district}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        event.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : event.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {event.status}
                    </span>
                    <p className="mt-1 text-xs text-neutral-400">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.approvedEvents}</p>
            <p className="text-sm text-neutral-500">events approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingEvents}</p>
            <p className="text-sm text-neutral-500">events pending review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.rejectedEvents}</p>
            <p className="text-sm text-neutral-500">events rejected</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
