import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store'
import { eventsAPI } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loading'
import { Calendar, MapPin, Users, ArrowRight, TreePine, BookOpen, Heart } from 'lucide-react'

const eventTypeIcons = {
  'tree-plantation': TreePine,
  workshop: BookOpen,
  'awareness-drive': Heart,
  cleanup: Heart,
  'health-camp': Heart,
  education: BookOpen,
  other: Calendar,
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsAPI.getFeatured()
        setFeaturedEvents(response.data.events || [])
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/register')
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
              Setting Trends That  
              <span className="block text-neutral-700">Actually Matters!</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
              Join local events, connect with like-minded people, and create positive change 
              through tree plantations, workshops, and community awareness drives.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" onClick={handleGetStarted}>Get Started</Button>
              <Link to="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-neutral-900">500+</p>
              <p className="mt-1 text-sm text-neutral-600">Events Organized</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-neutral-900">10K+</p>
              <p className="mt-1 text-sm text-neutral-600">Active Volunteers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-neutral-900">50+</p>
              <p className="mt-1 text-sm text-neutral-600">Cities Covered</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-neutral-900">25K+</p>
              <p className="mt-1 text-sm text-neutral-600">Trees Planted</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Featured Events</h2>
              <p className="mt-2 text-neutral-600">Discover upcoming events in your area</p>
            </div>
            <Link to="/dashboard/events">
              <Button variant="ghost" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array(3)
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
                ))
            ) : featuredEvents.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-neutral-400" />
                <p className="mt-4 text-neutral-600">No events available at the moment</p>
              </div>
            ) : (
              featuredEvents.map((event) => {
                const Icon = eventTypeIcons[event.type] || Calendar
                return (
                  <Card key={event._id} className="transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <Badge variant="secondary">{event.type.replace('-', ' ')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-sm text-neutral-600">{event.description}</p>
                      <div className="mt-4 space-y-2 text-sm text-neutral-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.date)} at {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{event.location?.address || event.area || 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{event.enrollments?.length || 0} / {event.maxSeats} enrolled</span>
                        </div>
                      </div>
                      <Link to={`/dashboard/events/${event._id}`} className="mt-4 block">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-neutral-900 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to Make an Impact?</h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-300">
            Join our community of changemakers and start participating in events that matter.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="mt-8 border-white bg-white text-neutral-900 hover:bg-neutral-100 hover:border-neutral-300"
            onClick={() => {
              if (isAuthenticated) {
                navigate('/dashboard')
              } else {
                navigate('/register')
              }
            }}
            type="button"
          >
            Join Now
          </Button>
        </div>
      </section>
    </div>
  )
}
