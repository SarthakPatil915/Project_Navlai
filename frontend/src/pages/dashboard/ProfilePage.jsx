import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { authAPI } from '@/services/api'
import { useAuthStore } from '@/app/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Spinner } from '@/components/ui/Loading'
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile must be 10 digits'),
  state: z.string().optional(),
  district: z.string().optional(),
  taluka: z.string().optional(),
  area: z.string().optional(),
})

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      mobile: user?.mobile || '',
      state: user?.state || '',
      district: user?.district || '',
      taluka: user?.taluka || '',
      area: user?.area || '',
    },
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const response = await authAPI.updateProfile(data)
      updateUser(response.data.user)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('profileImage', file)
      
      const response = await authAPI.updateProfile(formData)
      updateUser(response.data.user)
      toast.success('Profile image updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
        <p className="mt-1 text-neutral-600">
          Manage your account information
        </p>
      </div>

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Click on the avatar to upload a new picture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div
                className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-neutral-200"
                onClick={() => fileInputRef.current?.click()}
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-neutral-400" />
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Spinner size="sm" className="text-white" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 rounded-full bg-neutral-900 p-2 text-white shadow-lg hover:bg-neutral-800"
                disabled={uploadingImage}
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <div>
              <p className="font-medium text-neutral-900">{user?.name}</p>
              <p className="text-sm text-neutral-500">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="name"
                  className="pl-10"
                  placeholder="Enter your name"
                  error={errors.name}
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="email"
                  className="pl-10"
                  value={user?.email || ''}
                  disabled
                />
              </div>
              <p className="text-xs text-neutral-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="mobile"
                  className="pl-10"
                  placeholder="Enter 10-digit mobile number"
                  error={errors.mobile}
                  {...register('mobile')}
                />
              </div>
              {errors.mobile && (
                <p className="text-sm text-red-500">{errors.mobile.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
            <CardDescription>
              Your location helps us show relevant events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  {...register('state')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  placeholder="Enter district"
                  {...register('district')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taluka">Taluka</Label>
                <Input
                  id="taluka"
                  placeholder="Enter taluka"
                  {...register('taluka')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  placeholder="Enter area"
                  {...register('area')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
