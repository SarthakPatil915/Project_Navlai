import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { adminAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Loading'
import { 
  QrCode, Camera, CheckCircle, XCircle, 
  User, Calendar, Clock, Search,
  Keyboard
} from 'lucide-react'

export default function ScanQRPage() {
  const [mode, setMode] = useState('manual') // 'manual' or 'camera'
  const [manualInput, setManualInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [recentScans, setRecentScans] = useState([])
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

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
    } catch (error) {
      console.error('Camera error:', error)
      toast.error('Failed to access camera')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setMode('manual')
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualInput.trim()) return

    await processQRCode(manualInput.trim())
    setManualInput('')
  }

  const processQRCode = async (code) => {
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

      // Call admin API to mark attendance
      const res = await adminAPI.markAttendance?.(enrollmentId)

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
      console.error('QR processing error:', error)
      const scanResult = {
        success: false,
        message: error.response?.data?.message || error.message || 'Invalid QR code',
        timestamp: new Date(),
      }
      setResult(scanResult)
      setRecentScans((prev) => [scanResult, ...prev].slice(0, 10))
      toast.error(scanResult.message)
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Scan QR Code</h1>
        <p className="text-neutral-600">Mark attendance by scanning enrollment QR codes</p>
      </div>

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
              <QrCode className="h-5 w-5" />
              {mode === 'manual' ? 'Enter Code' : 'Camera Scanner'}
            </CardTitle>
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
                    Enter the enrollment ID from the QR code
                  </p>
                </div>
                <Button type="submit" disabled={scanning || !manualInput.trim()}>
                  {scanning ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Verify & Mark
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
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
                  Note: Camera scanning requires a QR code scanner library integration.
                  For now, use manual entry.
                </p>
                <Button variant="outline" className="w-full" onClick={stopCamera}>
                  Stop Camera
                </Button>
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
            {scanning ? (
              <div className="flex flex-col items-center py-8">
                <Spinner className="h-8 w-8" />
                <p className="mt-2 text-neutral-600">Processing...</p>
              </div>
            ) : result ? (
              <div
                className={`rounded-lg p-4 ${
                  result.success ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                  <div>
                    <p
                      className={`font-semibold ${
                        result.success ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {result.success ? 'Success!' : 'Failed'}
                    </p>
                    <p className="text-sm text-neutral-600">{result.message}</p>
                  </div>
                </div>

                {result.success && result.enrollment && (
                  <div className="mt-4 space-y-2 border-t border-green-200 pt-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-neutral-500" />
                      <span className="text-sm">
                        {result.enrollment.userId?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-neutral-500" />
                      <span className="text-sm">
                        {result.enrollment.eventId?.title || 'Event'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-neutral-500" />
                      <span className="text-sm">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <QrCode className="h-12 w-12 text-neutral-300" />
                <p className="mt-2 text-neutral-500">
                  Enter or scan a QR code to verify attendance
                </p>
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
                  className="flex items-center justify-between rounded-lg bg-neutral-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    {scan.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {scan.success
                          ? scan.enrollment?.userId?.name || 'Attendance Marked'
                          : 'Scan Failed'}
                      </p>
                      <p className="text-xs text-neutral-500">{scan.message}</p>
                    </div>
                  </div>
                  <Badge variant={scan.success ? 'success' : 'destructive'}>
                    {new Date(scan.timestamp).toLocaleTimeString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
