'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CreateListingModalProps {
  onClose: () => void
  onSuccess: (listingId: string) => void
}

export function CreateListingModal({ onClose, onSuccess }: CreateListingModalProps) {
  const [plasticType, setPlasticType] = useState('PET')
  const [quantity, setQuantity] = useState('')
  const [pricePerKg, setPricePerKg] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const plasticTypes = ['PET', 'HDPE', 'PVC', 'LDPE', 'PP', 'PS', 'Other']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!quantity || !pricePerKg || !location) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collector_id: 'collector-001', // In production, get from auth
          plastic_type: plasticType,
          quantity_kg: parseFloat(quantity),
          price_per_kg: parseFloat(pricePerKg),
          description,
          location,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create listing')
      }

      const listing = await response.json()
      onSuccess(listing.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('[v0] Error creating listing:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#0A0E14] to-[#141820] rounded-lg border border-[#2A3240] p-6 my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-[#2A3240] rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <h2 className="text-2xl font-bold mb-6 font-heading text-[#00D68F]">
          Create New Listing
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Plastic Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Plastic Type
            </label>
            <select
              value={plasticType}
              onChange={(e) => setPlasticType(e.target.value)}
              className="w-full bg-[#1A1F2A] border border-[#2A3240] rounded px-4 py-2 text-white focus:outline-none focus:border-[#00D68F]"
            >
              {plasticTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantity (kg) *
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0.1"
              step="0.1"
              placeholder="Enter quantity"
              className="w-full bg-[#1A1F2A] border border-[#2A3240] rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D68F]"
              required
            />
          </div>

          {/* Price Per KG */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price per KG (₹) *
            </label>
            <input
              type="number"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
              min="0.1"
              step="0.1"
              placeholder="Enter price"
              className="w-full bg-[#1A1F2A] border border-[#2A3240] rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D68F]"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or area"
              className="w-full bg-[#1A1F2A] border border-[#2A3240] rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D68F]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about your plastic..."
              className="w-full bg-[#1A1F2A] border border-[#2A3240] rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D68F] resize-none h-20"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#00D68F] hover:bg-[#00C075] text-black font-bold gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
