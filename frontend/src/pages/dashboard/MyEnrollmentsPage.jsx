import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { enrollmentsAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Calendar, MapPin, Ticket, Navigation, QrCode, Download } from 'lucide-react'

function formatDate(dateString) {
  if (!dateString) return 'TBA'
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function MyEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrCodeUrl, setQrCodeUrl] = useState(null)
  const [loadingQR, setLoadingQR] = useState(null)

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await enrollmentsAPI.getUserEnrollments()
        setEnrollments(response.data.enrollments || [])
      } catch (error) {
        console.error('Failed to fetch enrollments:', error)
        toast.error('Failed to load enrollments')
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [])

  const getQRCode = async (enrollmentId) => {
    setLoadingQR(enrollmentId)
    try {
      const response = await enrollmentsAPI.getQRCode(enrollmentId)
      setQrCodeUrl(response.data.qrCode)
    } catch (error) {
      toast.error('Failed to generate QR code')
    } finally {
      setLoadingQR(null)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = 'enrollment-qr.png'
    link.click()
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return 'success'
      case 'rejected':
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Enrollments</h1>
        <p className="mt-1 text-neutral-600">
          View and manage your event enrollments
        </p>
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
      ) : enrollments.length === 0 ? (
        <Card className="py-12 text-center">
          <Ticket className="mx-auto h-12 w-12 text-neutral-300" />
          <h3 className="mt-4 text-lg font-medium text-neutral-900">
            No enrollments yet
          </h3>
          <p className="mt-2 text-neutral-600">
            Browse events and enroll to see them here
          </p>
          <Link to="/dashboard/events" className="mt-4 inline-block">
            <Button>Browse Events</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Card key={enrollment._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-1">
                    {enrollment.eventId?.title || 'Event'}
                  </CardTitle>
                  <Badge variant={getStatusVariant(enrollment.status)}>
                    {enrollment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-neutral-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(enrollment.eventId?.date)} at{' '}
                      {enrollment.eventId?.time || 'TBA'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {enrollment.eventId?.area || enrollment.eventId?.district || 'TBA'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {(enrollment.status === 'confirmed' || enrollment.status === 'approved') && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => getQRCode(enrollment._id)}
                        disabled={loadingQR === enrollment._id}
                      >
                        <QrCode className="h-4 w-4" />
                        {loadingQR === enrollment._id ? 'Loading...' : 'View QR Code'}
                      </Button>
                      
                      {enrollment.eventId?.location?.coordinates && (
                        <Link
                          to={`/dashboard/directions/${enrollment._id}`}
                          className="block"
                        >
                          <Button className="w-full gap-2">
                            <Navigation className="h-4 w-4" />
                            Get Directions
                          </Button>
                        </Link>
                      )}
                    </>
                  )}

                  <Link
                    to={`/dashboard/events/${enrollment.eventId?._id || enrollment.eventId}`}
                    className="block"
                  >
                    <Button variant="ghost" className="w-full">
                      View Event Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {qrCodeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setQrCodeUrl(null)}
          />
          <div className="relative z-50 rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-center text-lg font-semibold">
              Your Enrollment QR Code
            </h3>
            <img src={qrCodeUrl} alt="QR Code" className="mx-auto h-64 w-64" />
            <p className="mt-4 text-center text-sm text-neutral-600">
              Show this QR code at the event for attendance
            </p>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" onClick={() => setQrCodeUrl(null)}>
                Close
              </Button>
              <Button onClick={downloadQRCode} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
