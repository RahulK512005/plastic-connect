'use client'

import { useRef, useState, useCallback } from 'react'
import { X, Camera, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CameraCaptureProps {
  onPhotoCapture: (base64: string) => Promise<void>
  onClose: () => void
}

export function CameraCapture({ onPhotoCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isFacingFront, setIsFacingFront] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setIsStreaming(true)
        }
      }
    } catch (error) {
      console.error('[v0] Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      setIsStreaming(false)
    }
  }, [])

  const toggleCamera = useCallback(async () => {
    stopCamera()
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacingMode)
    setIsFacingFront(newFacingMode === 'user')

    setTimeout(() => {
      startCamera()
    }, 100)
  }, [facingMode, startCamera, stopCamera])

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)
    try {
      const context = canvasRef.current.getContext('2d')
      if (!context) return

      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight

      context.drawImage(videoRef.current, 0, 0)

      const base64Data = canvasRef.current.toDataURL('image/jpeg').split(',')[1]
      await onPhotoCapture(base64Data)

      stopCamera()
      onClose()
    } catch (error) {
      console.error('[v0] Error capturing photo:', error)
      alert('Failed to capture photo')
    } finally {
      setIsCapturing(false)
    }
  }, [onPhotoCapture, onClose, stopCamera])

  // Auto-start camera on mount
  const [initialized, setInitialized] = useState(false)
  if (!initialized) {
    setTimeout(() => {
      startCamera()
      setInitialized(true)
    }, 100)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl bg-black rounded-lg overflow-hidden">
        {/* Camera Feed */}
        <div className="relative bg-black aspect-video flex items-center justify-center">
          {isStreaming ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4">
              <Camera className="w-12 h-12 text-gray-400" />
              <p className="text-gray-400">Initializing camera...</p>
            </div>
          )}

          {/* Crosshair overlay */}
          {isStreaming && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-green-500 rounded-lg opacity-50" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={() => {
              stopCamera()
              onClose()
            }}
            className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 px-6 py-4 flex gap-3 justify-center items-center">
          <Button
            onClick={toggleCamera}
            disabled={!isStreaming || isCapturing}
            variant="outline"
            className="flex gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Flip Camera
          </Button>

          <Button
            onClick={capturePhoto}
            disabled={!isStreaming || isCapturing}
            className="flex gap-2 bg-green-600 hover:bg-green-700 text-white px-8"
          >
            <Camera className="w-4 h-4" />
            {isCapturing ? 'Capturing...' : 'Capture Photo'}
          </Button>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
