import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { feedbackAPI } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Loading'
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await feedbackAPI.submit(data)
      setSubmitted(true)
      reset()
      toast.success('Message sent successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
            Have questions or feedback? We'd love to hear from you. Send us a message 
            and we'll respond as soon as possible.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="rounded-lg bg-neutral-100 p-3">
                  <Mail className="h-5 w-5 text-neutral-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Email</h3>
                  <p className="mt-1 text-sm text-neutral-600">navlai.org@gmail.com</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="rounded-lg bg-neutral-100 p-3">
                  <Phone className="h-5 w-5 text-neutral-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Phone</h3>
                  <p className="mt-1 text-sm text-neutral-600">+91 98765 43210</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="rounded-lg bg-neutral-100 p-3">
                  <MapPin className="h-5 w-5 text-neutral-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Address</h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    Pune, Maharashtra, India
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <Card className="text-center">
                <CardContent className="py-12">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900">Message Sent!</h3>
                  <p className="mt-2 text-neutral-600">
                    Thank you for reaching out. We'll get back to you shortly.
                  </p>
                  <Button
                    className="mt-6"
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          error={errors.name}
                          {...register('name')}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Your email"
                          error={errors.email}
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input
                          id="phone"
                          placeholder="Your phone number"
                          {...register('phone')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select
                          id="subject"
                          error={errors.subject}
                          {...register('subject')}
                        >
                          <option value="">Select a subject</option>
                          <option value="event-inquiry">Event Inquiry</option>
                          <option value="partnership">Partnership</option>
                          <option value="feedback">Feedback</option>
                          <option value="bug-report">Bug Report</option>
                          <option value="other">Other</option>
                        </Select>
                        {errors.subject && (
                          <p className="text-sm text-red-500">{errors.subject.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="How can we help you?"
                        rows={5}
                        error={errors.message}
                        {...register('message')}
                      />
                      {errors.message && (
                        <p className="text-sm text-red-500">{errors.message.message}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
