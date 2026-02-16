'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MakeOfferModalProps {
  listing: {
    id: string
    plastic_type: string
    quantity_kg: number
    price_per_kg: number
    location: string
  }
  onClose: () => void
  onSuccess: () => void
}

export function MakeOfferModal({
  listing,
  onClose,
  onSuccess,
}: MakeOfferModalProps) {
  const [quantity, setQuantity] = useState(listing.quantity_kg.toString())
  const [pricePerKg, setPricePerKg] = useState(listing.price_per_kg.toString())
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const totalPrice = (parseFloat(quantity) || 0) * (parseFloat(pricePerKg) || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_id: 'buyer-001', // In production, get from auth
          listing_id: listing.id,
          quantity_kg: parseFloat(quantity),
          price_per_kg: parseFloat(pricePerKg),
          notes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create offer')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('[v0] Error creating offer:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#0A0E14] to-[#141820] rounded-lg border border-[#2A3240] p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-[#2A3240] rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <h2 className="text-2xl font-bold mb-6 font-heading text-[#00D68F]">
          Make an Offer
        </h2>

        {/* Listing Info */}
        <div className="bg-[#141820] rounded-lg p-4 mb-6 border border-[#2A3240]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Plastic Type
              </p>
              <p className="font-bold text-white">{listing.plastic_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Available
              </p>
              <p className="font-bold text-white">{listing.quantity_kg} kg</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Location
              </p>
              <p className="font-bold text-white">{listing.location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Price/KG
              </p>
              <p className="font-bold text-white">₹{listing.price_per_kg}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantity (kg)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              max={listing.quantity_kg}
              min="0.1"
              step="0.1"
              className="w-full bg-[#1A1F2A] border border-[#2A3240] rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D68F]"
              required
            />
          </div>

          {/* Price Per KG */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price per KG (₹)
            </label>
            <input
              type="number"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
              min="0.1"
              step="0.1"
              className="w-full bg-[#1A1F2A] border border-[#2A3240] rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D68F]"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Preferred delivery date, payment terms..."
              className="w-full bg-[#1A1F2A] border border-[#2A3240] rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D68F] resize-none h-24"
            />
          </div>

          {/* Total Price */}
          <div className="bg-gradient-success rounded-lg p-4 border border-[#00D68F] border-opacity-30">
            <p className="text-sm text-gray-300 mb-1">Total Offer Price</p>
            <p className="text-3xl font-bold text-[#00D68F]">
              ₹{totalPrice.toFixed(2)}
            </p>
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
              disabled={isLoading || parseFloat(quantity) === 0}
              className="flex-1 bg-[#00D68F] hover:bg-[#00C075] text-black font-bold gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Offer'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
