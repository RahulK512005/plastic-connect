'use client'

import { useRef, useState, useCallback } from 'react'
import { X, Camera, RotateCw, Upload, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PlasticAnalysisDisplay from './plastic-analysis-display'

interface CameraCaptureProps {
  onPhotoCapture: (base64: string) => Promise<void>
  onClose: () => void
  listingId?: string
  plasticType?: string
  quantity?: number
}

interface AnalysisResult {
  purityPercentage: number
  contaminationPercentage: number
  gradeQuality: 'A' | 'B' | 'C' | 'D'
  estimatedPricePerKg: number
  analysis: string
}

export function CameraCapture({ 
  onPhotoCapture, 
  onClose,
  listingId,
  plasticType = 'HDPE',
  quantity = 1
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isFacingFront, setIsFacingFront] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const streamRef = useRef<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

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
      setCapturedImage(`data:image/jpeg;base64,${base64Data}`)
      stopCamera()
    } catch (error) {
      console.error('[v0] Error capturing photo:', error)
      alert('Failed to capture photo')
    } finally {
      setIsCapturing(false)
    }
  }, [stopCamera])

  const analyzePlastic = useCallback(async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)
    try {
      const base64 = capturedImage.split(',')[1]
      const response = await fetch('/api/analyze-plastic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          listingId: listingId || 'temp',
          plasticType: plasticType
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      setAnalysisResult(data.analysis)
    } catch (error) {
      console.error('[v0] Analysis error:', error)
      alert('Failed to analyze image. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }, [capturedImage, listingId, plasticType])

  const handleRetake = useCallback(() => {
    setCapturedImage(null)
    setAnalysisResult(null)
    startCamera()
  }, [startCamera])

  const handleConfirmAnalysis = useCallback(async () => {
    if (capturedImage) {
      const base64Data = capturedImage.split(',')[1]
      await onPhotoCapture(base64Data)
      stopCamera()
      onClose()
    }
  }, [capturedImage, onPhotoCapture, onClose, stopCamera])

  // Auto-start camera on mount
  const [initialized, setInitialized] = useState(false)
  if (!initialized) {
    setTimeout(() => {
      startCamera()
      setInitialized(true)
    }, 100)
  }

  // Show analysis results
  if (analysisResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Plastic Analysis</h1>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <PlasticAnalysisDisplay 
              analysis={analysisResult}
              quantity={quantity}
              onAnalysisConfirm={handleConfirmAnalysis}
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition-colors"
              >
                <RotateCw className="w-4 h-4 inline mr-2" />
                Retake Photo
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show image preview
  if (capturedImage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-2xl bg-black rounded-lg overflow-hidden">
          <div className="relative bg-black aspect-video flex items-center justify-center">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => {
                setCapturedImage(null)
                startCamera()
              }}
              className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-gray-900 px-6 py-4 flex gap-3 justify-center items-center">
            <Button
              onClick={handleRetake}
              variant="outline"
              className="flex gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Retake
            </Button>

            <Button
              onClick={analyzePlastic}
              disabled={isAnalyzing}
              className="flex gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              <Upload className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show camera feed
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
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
