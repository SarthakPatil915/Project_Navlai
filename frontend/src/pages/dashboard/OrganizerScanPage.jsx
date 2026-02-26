import { useState, useEffect, useRef } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import { toast } from 'sonner'
import { enrollmentsAPI, eventsAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Loading'
import { 
  QrCode, CheckCircle, XCircle, 
  User, Calendar, Clock, Search,
  Keyboard, AlertCircle, Camera
} from 'lucide-react'

export default function OrganizerScanPage() {
  const [mode, setMode] = useState('manual') // 'manual' or 'camera'
  const [manualInput, setManualInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [recentScans, setRecentScans] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [loading, setLoading] = useState(true)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

    // ZXing QR code reader instance
    const qrReaderRef = useRef(null)
    const scanActiveRef = useRef(false)

  useEffect(() => {
    fetchMyEvents()
    return () => {
      stopCamera()
    }
  }, [])

  const fetchMyEvents = async () => {
    try {
      const res = await eventsAPI.getUserEvents()
      // Only show approved events
      const approvedEvents = (res.data.events || []).filter(e => e.status === 'approved')
      setMyEvents(approvedEvents)
    } catch (error) {
      console.error('Failed to fetch events:', error)
      toast.error('Failed to load your events')
    } finally {
      setLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setMode('camera')
      toast.info('Camera started. Position QR code in view.')

        // Start QR code scanning
        scanActiveRef.current = true
        if (!qrReaderRef.current) {
          qrReaderRef.current = new BrowserQRCodeReader()
        }
        // Use decodeFromVideoDevice for live scanning
        qrReaderRef.current.decodeFromVideoDevice(
          null,
          videoRef.current,
          async (result, err, controls) => {
            if (!scanActiveRef.current) {
              controls.stop();
              return;
            }
            if (result) {
              scanActiveRef.current = false;
              controls.stop();
              // Auto-process the scanned QR code
              await processEnrollment(result.getText())
            }
          }
        )
    } catch (error) {
      console.error('Camera error:', error)
      toast.error('Failed to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
      scanActiveRef.current = false
      if (qrReaderRef.current) {
        try {
          qrReaderRef.current.reset()
        } catch (e) { /* ignore errors on reset */ }
      }
    setMode('manual')
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualInput.trim()) {
      toast.error('Please enter an enrollment ID')
      return
    }

    await processEnrollment(manualInput.trim())
    setManualInput('')
  }

  const processEnrollment = async (code) => {
    setScanning(true)
    setResult(null)

    try {
      // Try to parse as JSON first (QR code might contain JSON data)
      let enrollmentId = code
      try {
        const parsed = JSON.parse(code)
        enrollmentId = parsed.enrollmentId || parsed.id || code
      } catch {
        // Not JSON, use as-is (might be direct enrollment ID)
      }

      // Call API to mark attendance by organizer
      const res = await enrollmentsAPI.markAttendanceByOrganizer(enrollmentId)

      if (res?.data?.success) {
        const scanResult = {
          success: true,
          enrollment: res.data.enrollment,
          message: 'Attendance marked successfully!',
          timestamp: new Date(),
        }
        setResult(scanResult)
        setRecentScans((prev) => [scanResult, ...prev].slice(0, 10))
        toast.success('Attendance marked!')
      } else {
        throw new Error(res?.data?.message || 'Failed to mark attendance')
      }
    } catch (error) {
      console.error('Processing error:', error)
      const scanResult = {
        success: false,
        message: error.response?.data?.message || error.message || 'Invalid enrollment ID',
        timestamp: new Date(),
      }
      setResult(scanResult)
      setRecentScans((prev) => [scanResult, ...prev].slice(0, 10))
      toast.error(scanResult.message)
    } finally {
      setScanning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (myEvents.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Scan Attendee QR</h1>
          <p className="text-neutral-600">Mark attendance for your event participants</p>
        </div>
        <Card className="py-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-neutral-300" />
          <h3 className="mt-4 text-lg font-medium text-neutral-900">
            No approved events
          </h3>
          <p className="mt-2 text-neutral-600">
            You need to have approved events to scan attendee QR codes.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Scan Attendee QR</h1>
        <p className="text-neutral-600">Mark attendance for your event participants</p>
      </div>

      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
          <CardDescription>Choose the event you're managing today</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full"
          >
            <option value="">All my events</option>
            {myEvents.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'manual' ? 'default' : 'outline'}
          onClick={() => {
            stopCamera()
            setMode('manual')
          }}
        >
          <Keyboard className="mr-2 h-4 w-4" />
          Manual Entry
        </Button>
        <Button
          variant={mode === 'camera' ? 'default' : 'outline'}
          onClick={startCamera}
        >
          <Camera className="mr-2 h-4 w-4" />
          Camera Scan
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === 'manual' ? <Keyboard className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
              {mode === 'manual' ? 'Enter Enrollment Code' : 'Camera Scanner'}
            </CardTitle>
            <CardDescription>
              {mode === 'manual' 
                ? 'Enter the enrollment ID from the attendee\'s email or scan their QR code'
                : 'Position the QR code within the camera view'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'manual' ? (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter enrollment ID or paste QR data..."
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="font-mono"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    The enrollment ID is included in the confirmation email sent to attendees
                  </p>
                </div>
                <Button type="submit" disabled={scanning || !manualInput.trim()} className="w-full">
                  {scanning ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Verify & Mark Attendance
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-neutral-900">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-48 w-48 border-2 border-dashed border-white/50 rounded-lg" />
                    </div>
                  </div>
                  <p className="text-center text-sm text-neutral-500">
                    Point the camera at a QR code. Scanning will auto-submit attendance.<br/>
                    If scanning fails, use manual entry.
                  </p>
                  <Button variant="outline" className="w-full" onClick={stopCamera}>
                    Stop Camera
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div
                className={`rounded-lg p-4 ${
                  result.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        result.success ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {result.message}
                    </p>
                    {result.enrollment && (
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-green-700">
                          <User className="h-4 w-4" />
                          <span>{result.enrollment.userName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-700">
                          <Calendar className="h-4 w-4" />
                          <span>{result.enrollment.eventTitle}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-700">
                          <Clock className="h-4 w-4" />
                          <span>
                            Checked in at{' '}
                            {new Date(result.enrollment.attendedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
                <QrCode className="h-12 w-12" />
                <p className="mt-3 text-sm">No scan result yet</p>
                <p className="text-xs">Enter an enrollment code to verify attendance</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentScans.map((scan, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    scan.success ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {scan.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${
                        scan.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {scan.enrollment?.userName || scan.message}
                      </p>
                      {scan.enrollment && (
                        <p className="text-xs text-green-600">
                          {scan.enrollment.eventTitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {scan.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
