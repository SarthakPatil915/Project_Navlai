import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { eventsAPI, enrollmentsAPI } from '@/services/api'
import { useAuthStore } from '@/app/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/Modal'
import { Spinner, LoadingOverlay } from '@/components/ui/Loading'
import { Calendar, MapPin, Users, Phone, User, ArrowLeft, Navigation } from 'lucide-react'

const enrollmentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  age: z.number().min(1, 'Age must be at least 1').max(120, 'Invalid age'),
  location: z.string().min(2, 'Location is required'),
  contact: z.string().regex(/^[0-9]{10}$/, 'Contact must be 10 digits'),
})

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [idProofFile, setIdProofFile] = useState(null)
  const [existingEnrollment, setExistingEnrollment] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      name: user?.name || '',
      contact: user?.mobile || '',
      location: user?.area || '',
    },
  })

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const [eventRes, enrollmentsRes] = await Promise.all([
          eventsAPI.getById(id),
          enrollmentsAPI.getUserEnrollments(),
        ])
        
        setEvent(eventRes.data.event)
        
        // Check if user is already enrolled
        const userEnrollment = enrollmentsRes.data.enrollments?.find(
          (e) => e.eventId?._id === id || e.eventId === id
        )
        setExistingEnrollment(userEnrollment)
      } catch (error) {
        console.error('Failed to fetch event:', error)
        toast.error('Failed to load event')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const handleEnrollment = async (data) => {
    if (!idProofFile) {
      toast.error('Please upload ID proof')
      return
    }

    setEnrolling(true)
    try {
      const formData = new FormData()
      formData.append('eventId', id)
      formData.append('name', data.name)
      formData.append('age', data.age)
      formData.append('location', data.location)
      formData.append('contact', data.contact)
      formData.append('idProof', idProofFile)

      const response = await enrollmentsAPI.create(formData)
      setExistingEnrollment(response.data.enrollment)
      setShowEnrollModal(false)
      toast.success('Enrollment successful! Check your email for QR code.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return <LoadingOverlay message="Loading event..." />
  }

  if (!event) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">Event not found</h2>
        <Link to="/dashboard/events" className="mt-4 inline-block">
          <Button variant="outline">Back to Events</Button>
        </Link>
      </div>
    )
  }

  const seatsAvailable = event.maxSeats - (event.enrollments?.length || 0)
  const isEnrollmentOpen = !event.enrollmentClosed && seatsAvailable > 0

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {event.type.replace('-', ' ')}
                  </Badge>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                </div>
                <Badge
                  variant={event.status === 'approved' ? 'success' : 'secondary'}
                >
                  {event.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 whitespace-pre-wrap">
                {event.description}
              </p>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-neutral-100 p-3">
                  <Calendar className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Date & Time</p>
                  <p className="text-neutral-600">
                    {formatDate(event.date)} at {event.time}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-neutral-100 p-3">
                  <MapPin className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Location</p>
                  <p className="text-neutral-600">
                    {event.location?.address || event.area || 'TBA'}
                  </p>
                  {event.district && (
                    <p className="text-sm text-neutral-500">
                      {event.taluka && `${event.taluka}, `}{event.district}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-neutral-100 p-3">
                  <Phone className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Contact</p>
                  <p className="text-neutral-600">{event.contact}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-neutral-100 p-3">
                  <User className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Organizer</p>
                  <p className="text-neutral-600">
                    {event.createdBy?.name || 'Anonymous'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment</CardTitle>
              <CardDescription>
                {event.enrollments?.length || 0} of {event.maxSeats} seats filled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="h-2 w-full rounded-full bg-neutral-200">
                  <div
                    className="h-2 rounded-full bg-neutral-900"
                    style={{
                      width: `${((event.enrollments?.length || 0) / event.maxSeats) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-sm text-neutral-600">
                  {seatsAvailable} seats available
                </p>
              </div>

              {existingEnrollment ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="font-medium text-green-800">You're enrolled!</p>
                    <p className="mt-1 text-sm text-green-600">
                      Status: {existingEnrollment.status}
                    </p>
                  </div>
                  {existingEnrollment.status === 'approved' && event.location?.coordinates && (
                    <Link to={`/dashboard/directions/${existingEnrollment._id}`}>
                      <Button className="w-full gap-2">
                        <Navigation className="h-4 w-4" />
                        Get Directions
                      </Button>
                    </Link>
                  )}
                </div>
              ) : isEnrollmentOpen ? (
                <Button
                  className="w-full"
                  onClick={() => setShowEnrollModal(true)}
                >
                  Enroll Now
                </Button>
              ) : (
                <div className="rounded-lg bg-neutral-100 p-4 text-center">
                  <p className="font-medium text-neutral-900">
                    {event.enrollmentClosed ? 'Enrollment Closed' : 'No Seats Available'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enrollment Modal */}
      <Modal isOpen={showEnrollModal} onClose={() => setShowEnrollModal(false)}>
        <ModalHeader>
          <ModalTitle>Enroll for {event.title}</ModalTitle>
          <ModalDescription>
            Fill in your details to complete enrollment
          </ModalDescription>
        </ModalHeader>
        <form onSubmit={handleSubmit(handleEnrollment)} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              error={errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              error={errors.age}
              {...register('age', { valueAsNumber: true })}
            />
            {errors.age && (
              <p className="text-sm text-red-500">{errors.age.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Your Location</Label>
            <Input
              id="location"
              placeholder="Enter your location"
              error={errors.location}
              {...register('location')}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Number</Label>
            <Input
              id="contact"
              placeholder="Enter 10-digit mobile number"
              error={errors.contact}
              {...register('contact')}
            />
            {errors.contact && (
              <p className="text-sm text-red-500">{errors.contact.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="idProof">ID Proof</Label>
            <Input
              id="idProof"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setIdProofFile(e.target.files?.[0])}
            />
            <p className="text-xs text-neutral-500">
              Upload Aadhar, PAN, or any government ID
            </p>
          </div>

          <ModalFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEnrollModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={enrolling}>
              {enrolling ? <Spinner size="sm" className="mr-2" /> : null}
              Confirm Enrollment
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
