'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, TrendingDown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getApplicableDiscount } from '@/lib/discount-client'

interface MakeOfferModalProps {
  listing: {
    id: string
    plastic_type: string
    quantity_kg: number
    price_per_kg: number
    location: string
    grade_quality?: string
    purity_percentage?: number
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
  const [discountPercentage, setDiscountPercentage] = useState(0)
  const [showPaymentFlow, setShowPaymentFlow] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)

  // Calculate discount based on quantity
  useEffect(() => {
    const calculateDiscount = async () => {
      if (parseFloat(quantity) > 0) {
        const discount = await getApplicableDiscount(
          listing.plastic_type,
          listing.grade_quality || 'A',
          parseFloat(quantity)
        )
        setDiscountPercentage(discount)
      }
    }
    calculateDiscount()
  }, [quantity, listing.plastic_type, listing.grade_quality])

  const baseAmount = (parseFloat(quantity) || 0) * (parseFloat(pricePerKg) || 0)
  const discountAmount = (baseAmount * discountPercentage) / 100
  const totalPrice = baseAmount - discountAmount

  const handleCreateOrder = async () => {
    setError('')
    setIsLoading(true)

    try {
      // Step 1: Create order
      const orderResponse = await fetch('/api/generate-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          buyerId: 'buyer-001', // In production, get from auth
          sellerId: 'seller-001', // In production, get from listing
          quantity: parseFloat(quantity),
          basePrice: parseFloat(pricePerKg),
          plasticType: listing.plastic_type,
          gradeQuality: listing.grade_quality || 'A',
        }),
      })

      if (!orderResponse.ok) {
        const data = await orderResponse.json()
        throw new Error(data.error || 'Failed to create order')
      }

      const orderData = await orderResponse.json()
      const orderId = orderData.order.id

      // Step 2: Show payment flow
      setShowPaymentFlow(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('[v0] Error creating order:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleCreateOrder()
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

          {/* Price Breakdown */}
          <div className="bg-[#0F1419] rounded-lg p-4 border border-[#2A3240] space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Base Amount</span>
              <span className="text-white font-semibold">₹{baseAmount.toFixed(2)}</span>
            </div>
            
            {discountPercentage > 0 && (
              <>
                <div className="border-t border-[#2A3240]" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4 text-[#00D68F]" />
                    Bulk Discount ({discountPercentage}%)
                  </span>
                  <span className="text-[#00D68F] font-semibold">-₹{discountAmount.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="border-t border-[#00D68F] border-opacity-30 pt-3">
              <p className="text-sm text-gray-300 mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-[#00D68F]">
                ₹{totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Discount Info */}
          {discountPercentage > 0 && (
            <div className="bg-[#1A4D2E] bg-opacity-30 border border-[#00D68F] rounded-lg p-3 flex items-start gap-2">
              <Zap className="w-4 h-4 text-[#00D68F] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#00D68F]">
                Great deal! Buying {parseFloat(quantity).toFixed(1)} kg qualifies you for {discountPercentage}% bulk discount.
              </p>
            </div>
          )}

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
                  Creating Order...
                </>
              ) : (
                <>
                  Proceed to Payment →
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
