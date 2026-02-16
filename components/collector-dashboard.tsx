'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Camera, Plus, Eye, TrendingUp, Droplet, Wind, Loader2 } from 'lucide-react'
import { CameraCapture } from './camera-capture'
import { CreateListingModal } from './create-listing-modal'

const earningsData = [
  { month: 'Jan', amount: 8400 },
  { month: 'Feb', amount: 9200 },
  { month: 'Mar', amount: 7800 },
  { month: 'Apr', amount: 10200 },
  { month: 'May', amount: 11500 },
  { month: 'Jun', amount: 12450 },
]

const listings = [
  {
    id: 1,
    type: 'PET',
    weight: 500,
    price: 15,
    location: 'Chennai',
    views: 245,
    status: 'active',
  },
  {
    id: 2,
    type: 'HDPE',
    weight: 300,
    price: 12,
    location: 'Mumbai',
    views: 189,
    status: 'pending',
  },
  {
    id: 3,
    type: 'PP',
    weight: 200,
    price: 18,
    location: 'Delhi',
    views: 412,
    status: 'active',
  },
]

const statusColors = {
  active: 'bg-green-500',
  pending: 'bg-yellow-500',
  sold: 'bg-gray-500',
}

const statusLabels = {
  active: 'Active',
  pending: 'Pending',
  sold: 'Sold',
}

export function CollectorDashboard() {
  const [selectedTab, setSelectedTab] = useState('earnings')
  const [showCamera, setShowCamera] = useState(false)
  const [showCreateListing, setShowCreateListing] = useState(false)
  const [listings, setListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newListingId, setNewListingId] = useState<string | null>(null)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/listings?collectorId=collector-001')
      if (response.ok) {
        const data = await response.json()
        setListings(data || [])
      }
    } catch (error) {
      console.error('[v0] Error fetching listings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoCapture = async (base64: string) => {
    if (!newListingId) {
      alert('Please create a listing first')
      return
    }

    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: newListingId,
          base64_data: base64,
          file_name: `photo-${Date.now()}.jpg`,
        }),
      })

      if (response.ok) {
        alert('Photo uploaded successfully!')
        setNewListingId(null)
        fetchListings()
      }
    } catch (error) {
      console.error('[v0] Error uploading photo:', error)
      alert('Failed to upload photo')
    }
  }

  const handleListingCreated = (listingId: string) => {
    setNewListingId(listingId)
    fetchListings()
  }

  return (
    <div className="min-h-screen bg-[#0A0E14] text-[#E8ECEF]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#2A3340] bg-[#0A0E14]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#E8ECEF]">
                PlasticConnect
              </h1>
              <p className="text-sm text-[#8A94A6]">Collector Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowCreateListing(true)}
                className="bg-[#0091FF] hover:bg-[#0078D4] text-white font-semibold gap-2"
              >
                <Plus className="w-4 h-4" />
                New Listing
              </Button>
              <Button
                onClick={() => setShowCamera(true)}
                className="bg-[#FF6B35] hover:bg-[#E55A24] text-white font-semibold gap-2"
              >
                <Camera className="w-4 h-4" />
                Capture Plastic
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Greeting */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#E8ECEF]">
            Hi Rajesh 👋
          </h2>
          <p className="text-[#8A94A6] mt-2">Your plastic has value</p>
        </div>

        {/* Earnings Card */}
        <div className="mb-12 rounded-lg border border-[#2A3340] bg-gradient-to-br from-[#141922] to-[#0F1419] p-8 glow-success">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#8A94A6] text-sm font-medium">Earnings This Month</p>
              <p className="text-5xl font-bold text-[#00D68F] mt-3">₹12,450</p>
              <p className="text-[#00D68F] text-sm mt-4 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +23% from last month
              </p>
            </div>
            <div className="text-5xl opacity-10">💰</div>
          </div>
        </div>

        {/* Active Listings */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#E8ECEF]">Active Listings ({listings.length})</h3>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#00D68F]" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-dashed border-[#2A3340]">
              <p className="text-[#8A94A6] mb-4">No listings yet</p>
              <Button
                onClick={() => setShowCreateListing(true)}
                className="bg-[#0091FF] hover:bg-[#0078D4] text-white font-semibold gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Listing
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="rounded-lg border border-[#2A3340] bg-[#141922] overflow-hidden hover:border-[#3A4350] transition-colors group"
                >
                  {/* Placeholder image */}
                  <div className="w-full h-40 bg-gradient-to-br from-[#1C222E] to-[#0F1419] flex items-center justify-center text-[#8A94A6] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0E14]"></div>
                    <span className="text-6xl opacity-20">♻️</span>
                    <div className="absolute top-3 right-3">
                      <span className="bg-[#00D68F] text-[#0A0E14] text-xs font-bold px-3 py-1 rounded">
                        {listing.plastic_type}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${statusColors[listing.status as keyof typeof statusColors] || 'bg-blue-500'}`}></div>
                      <span className="text-xs text-[#8A94A6]">
                        {statusLabels[listing.status as keyof typeof statusLabels] || listing.status}
                      </span>
                    </div>
                    <p className="font-semibold text-[#E8ECEF] mb-2">{listing.quantity_kg}kg</p>
                    <p className="text-[#00D68F] font-semibold mb-3">₹{listing.price_per_kg}/kg</p>
                    <p className="text-sm text-[#8A94A6] mb-3">📍 {listing.location}</p>
                    <div className="flex items-center justify-between">
                      {listing.plastic_photos && listing.plastic_photos.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-[#00D68F]">
                          <Camera className="w-3 h-3" />
                          {listing.plastic_photos.length} photos
                        </div>
                      )}
                      <Button
                        onClick={() => {
                          setNewListingId(listing.id)
                          setShowCamera(true)
                        }}
                        size="sm"
                        className="text-xs bg-[#FF6B35] hover:bg-[#E55A24] text-white h-6 gap-1"
                      >
                        <Camera className="w-3 h-3" />
                        Add Photo
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Earnings & Impact Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#141922] border border-[#2A3340]">
            <TabsTrigger value="earnings" className="data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white">
              Earnings
            </TabsTrigger>
            <TabsTrigger value="impact" className="data-[state=active]:bg-[#00D68F] data-[state=active]:text-[#0A0E14]">
              Impact
            </TabsTrigger>
          </TabsList>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="mt-6 space-y-6">
            <Card className="border-[#2A3340] bg-[#141922] p-6">
              <h3 className="text-lg font-bold text-[#E8ECEF] mb-6">Total Earned</h3>
              <p className="text-5xl font-bold text-[#00D68F] mb-8">₹45,230</p>
              
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A3340" />
                    <XAxis dataKey="month" stroke="#8A94A6" />
                    <YAxis stroke="#8A94A6" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#141922',
                        border: '1px solid #2A3340',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="amount" fill="#00D68F" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 space-y-3 border-t border-[#2A3340] pt-6">
                <h4 className="font-semibold text-[#E8ECEF]">Recent Transactions</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-[#8A94A6]">• <span className="text-[#00D68F]">₹2,400</span> - PET Bottles</p>
                  <p className="text-[#8A94A6]">• <span className="text-[#00D68F]">₹1,850</span> - HDPE Mixed</p>
                  <p className="text-[#8A94A6]">• <span className="text-[#00D68F]">₹3,200</span> - Clear PET</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Water Saved */}
              <Card className="border-[#00D68F] bg-gradient-to-br from-[#141922] to-[#0F1419] p-6 glow-success border-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[#8A94A6] text-sm font-medium">Water Saved</p>
                    <p className="text-4xl font-bold text-[#00D68F] mt-4">12,500L</p>
                  </div>
                  <div className="text-5xl">💧</div>
                </div>
              </Card>

              {/* CO₂ Prevented */}
              <Card className="border-[#0091FF] bg-gradient-to-br from-[#141922] to-[#0F1419] p-6 glow-blue border-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[#8A94A6] text-sm font-medium">CO₂ Prevented</p>
                    <p className="text-4xl font-bold text-[#0091FF] mt-4">850 kg</p>
                  </div>
                  <div className="text-5xl">🌬️</div>
                </div>
              </Card>
            </div>

            <div className="text-center text-[#8A94A6] p-8 bg-[#141922] rounded-lg border border-[#2A3340]">
              <p>Your contribution to a sustainable future! Keep collecting and making an impact.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onPhotoCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Create Listing Modal */}
      {showCreateListing && (
        <CreateListingModal
          onClose={() => setShowCreateListing(false)}
          onSuccess={handleListingCreated}
        />
      )}
    </div>
  )
}
