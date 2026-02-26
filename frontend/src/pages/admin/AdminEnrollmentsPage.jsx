import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { adminAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Loading'
import { 
  Search, Calendar, User, CheckCircle, 
  Clock, Ticket, Filter 
} from 'lucide-react'

export default function AdminEnrollmentsPage() {
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState([])
  const [filteredEnrollments, setFilteredEnrollments] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [attendedFilter, setAttendedFilter] = useState('all')

  useEffect(() => {
    fetchEnrollments()
  }, [])

  useEffect(() => {
    filterEnrollments()
  }, [enrollments, search, statusFilter, attendedFilter])

  const fetchEnrollments = async () => {
    try {
      const res = await adminAPI.getAllEnrollments?.()
      setEnrollments(res?.data?.enrollments || [])
    } catch (error) {
      console.error('Failed to fetch enrollments:', error)
      toast.error('Failed to load enrollments')
    } finally {
      setLoading(false)
    }
  }

  const filterEnrollments = () => {
    let filtered = [...enrollments]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.userId?.name?.toLowerCase().includes(searchLower) ||
          e.userId?.email?.toLowerCase().includes(searchLower) ||
          e.eventId?.title?.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((e) => e.status === statusFilter)
    }

    if (attendedFilter !== 'all') {
      filtered = filtered.filter(
        (e) => (attendedFilter === 'attended' ? e.attended : !e.attended)
      )
    }

    setFilteredEnrollments(filtered)
  }

  const stats = {
    total: enrollments.length,
    confirmed: enrollments.filter((e) => e.status === 'confirmed').length,
    attended: enrollments.filter((e) => e.attended).length,
    cancelled: enrollments.filter((e) => e.status === 'cancelled').length,
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
        <h1 className="text-2xl font-bold text-neutral-900">All Enrollments</h1>
        <p className="text-neutral-600">View and manage event enrollments</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-lg bg-blue-100 p-2">
              <Ticket className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Total</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Confirmed</p>
              <p className="text-xl font-semibold">{stats.confirmed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-lg bg-purple-100 p-2">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Attended</p>
              <p className="text-xl font-semibold">{stats.attended}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-lg bg-red-100 p-2">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Cancelled</p>
              <p className="text-xl font-semibold">{stats.cancelled}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search by user or event..."
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
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </Select>
            <Select
              value={attendedFilter}
              onChange={(e) => setAttendedFilter(e.target.value)}
              className="w-full sm:w-40"
            >
              <option value="all">All Attendance</option>
              <option value="attended">Attended</option>
              <option value="not-attended">Not Attended</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments List */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollments ({filteredEnrollments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEnrollments.length === 0 ? (
            <div className="py-8 text-center">
              <Ticket className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-4 text-neutral-600">No enrollments found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEnrollments.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                      <User className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {enrollment.userId?.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {enrollment.userId?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 sm:text-center">
                    <p className="font-medium text-neutral-900">
                      {enrollment.eventId?.title || 'Unknown Event'}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {enrollment.eventId?.date
                        ? new Date(enrollment.eventId.date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        enrollment.status === 'confirmed'
                          ? 'success'
                          : enrollment.status === 'cancelled'
                          ? 'destructive'
                          : 'warning'
                      }
                    >
                      {enrollment.status}
                    </Badge>
                    <Badge variant={enrollment.attended ? 'default' : 'secondary'}>
                      {enrollment.attended ? 'Attended' : 'Not Attended'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
