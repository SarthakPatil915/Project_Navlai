import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { adminAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Loading'
import { 
  Search, Eye, Mail, Phone, MapPin, 
  Calendar, User, CheckCircle, Clock,
  Users
} from 'lucide-react'

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [userEnrollments, setUserEnrollments] = useState([])
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, search])

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers()
      setUsers(res.data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    if (!search) {
      setFilteredUsers(users)
      return
    }

    const searchLower = search.toLowerCase()
    const filtered = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.mobile?.includes(search)
    )
    setFilteredUsers(filtered)
  }

  const openUserDetail = async (user) => {
    setSelectedUser(user)
    setShowDetail(true)
    setEnrollmentsLoading(true)

    try {
      // Fetch user enrollments if admin API supports it
      const res = await adminAPI.getUserEnrollments?.(user._id)
      setUserEnrollments(res?.data?.enrollments || [])
    } catch (error) {
      console.error('Failed to fetch user enrollments:', error)
      setUserEnrollments([])
    } finally {
      setEnrollmentsLoading(false)
    }
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
        <h1 className="text-2xl font-bold text-neutral-900">Manage Users</h1>
        <p className="text-neutral-600">View and manage registered users</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search by name, email, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Total Users</p>
              <p className="text-xl font-semibold">{users.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Verified</p>
              <p className="text-xl font-semibold">
                {users.filter((u) => u.isVerified).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-lg bg-yellow-100 p-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Unverified</p>
              <p className="text-xl font-semibold">
                {users.filter((u) => !u.isVerified).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="py-8 text-center">
              <User className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-4 text-neutral-600">No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                      {user.profileImage ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || ''}/uploads/${user.profileImage}`}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-neutral-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-neutral-900">{user.name}</p>
                        <Badge
                          variant={user.isVerified ? 'success' : 'warning'}
                          className="text-xs"
                        >
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.mobile && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.mobile}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openUserDetail(user)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false)
          setSelectedUser(null)
          setUserEnrollments([])
        }}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                {selectedUser.profileImage ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || ''}/uploads/${selectedUser.profileImage}`}
                    alt={selectedUser.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-neutral-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                  <Badge variant={selectedUser.isVerified ? 'success' : 'warning'}>
                    {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
                <p className="text-neutral-600">{selectedUser.email}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-neutral-500">Mobile</p>
                <p className="text-neutral-900">{selectedUser.mobile || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Joined</p>
                <p className="text-neutral-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Location Info */}
            {(selectedUser.area || selectedUser.district) && (
              <div>
                <p className="text-sm font-medium text-neutral-500">Location</p>
                <p className="text-neutral-900">
                  {[selectedUser.area, selectedUser.district, selectedUser.state]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            )}

            {/* Enrollments */}
            <div className="border-t border-neutral-200 pt-4">
              <h3 className="mb-3 font-semibold text-neutral-900">Enrollments</h3>
              {enrollmentsLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              ) : userEnrollments.length === 0 ? (
                <p className="text-neutral-500">No enrollments found</p>
              ) : (
                <div className="space-y-2">
                  {userEnrollments.map((enrollment) => (
                    <div
                      key={enrollment._id}
                      className="flex items-center justify-between rounded-lg bg-neutral-50 p-3"
                    >
                      <div>
                        <p className="font-medium">{enrollment.eventId?.title || 'Event'}</p>
                        <p className="text-sm text-neutral-500">
                          {enrollment.eventId?.date
                            ? new Date(enrollment.eventId.date).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          enrollment.attended
                            ? 'success'
                            : enrollment.status === 'confirmed'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {enrollment.attended ? 'Attended' : enrollment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
