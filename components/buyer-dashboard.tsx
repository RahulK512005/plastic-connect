'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, Bookmark, ShoppingCart, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { MakeOfferModal } from './make-offer-modal'

const buyerListings = [
  {
    id: 1,
    type: 'PET',
    weight: 500,
    price: 15,
    location: 'Chennai',
    seller: 'Eco Collectors',
    verified: true,
  },
  {
    id: 2,
    type: 'HDPE',
    weight: 300,
    price: 12,
    location: 'Mumbai',
    seller: 'Green Waste Co',
    verified: true,
  },
  {
    id: 3,
    type: 'PP',
    weight: 200,
    price: 18,
    location: 'Delhi',
    seller: 'Plastic Recyclers',
    verified: false,
  },
  {
    id: 4,
    type: 'LDPE',
    weight: 400,
    price: 14,
    location: 'Bangalore',
    seller: 'Waste Management Inc',
    verified: true,
  },
]

const impactData = [
  { name: 'PET', value: 35 },
  { name: 'HDPE', value: 25 },
  { name: 'PP', value: 20 },
  { name: 'Other', value: 20 },
]

const COLORS = ['#00D68F', '#0091FF', '#FF6B35', '#8B5CF6']

export function BuyerDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('browse')
  const [listings, setListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedListing, setSelectedListing] = useState<any>(null)
  const [showOfferModal, setShowOfferModal] = useState(false)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/listings')
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

  const handleMakeOffer = (listing: any) => {
    setSelectedListing(listing)
    setShowOfferModal(true)
  }

  const kpis = [
    { label: 'Active Listings', value: listings.length.toString(), color: 'text-[#0091FF]' },
    { label: 'Pending Offers', value: '14', color: 'text-[#FF6B35]' },
    { label: 'Total Available', value: `${listings.reduce((sum, l) => sum + (l.quantity_kg || 0), 0).toFixed(0)}kg`, color: 'text-[#00D68F]' },
  ]

  const filteredListings = listings.filter(
    (listing) =>
      listing.plastic_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0A0E14] text-[#E8ECEF]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#2A3340] bg-[#0A0E14]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#E8ECEF]">
                PlasticConnect
              </h1>
              <p className="text-sm text-[#8A94A6]">Buyer Dashboard</p>
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
                <Input
                  placeholder="Search listings..."
                  className="pl-10 bg-[#141922] border-[#2A3340] text-[#E8ECEF] placeholder:text-[#5A6376]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-[#2A3340] text-[#0091FF] hover:bg-[#141922]" size="sm">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button className="bg-[#0091FF] hover:bg-[#0078D4] text-white gap-2">
                <ShoppingCart className="w-4 h-4" />
                Cart
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {kpis.map((kpi, idx) => (
            <Card key={idx} className="border-[#2A3340] bg-[#141922] p-6">
              <p className="text-[#8A94A6] text-sm font-medium">{kpi.label}</p>
              <p className={`text-4xl font-bold mt-3 ${kpi.color}`}>{kpi.value}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button variant="outline" className="border-[#2A3340] text-[#8A94A6] hover:bg-[#141922] gap-2">
            <Filter className="w-4 h-4" />
            Type
          </Button>
          <Button variant="outline" className="border-[#2A3340] text-[#8A94A6] hover:bg-[#141922]">
            Location
          </Button>
          <Button variant="outline" className="border-[#2A3340] text-[#8A94A6] hover:bg-[#141922]">
            Quality
          </Button>
          <Button variant="outline" className="border-[#2A3340] text-[#8A94A6] hover:bg-[#141922]">
            Price
          </Button>
        </div>

        {/* Live Feed Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#E8ECEF] mb-2">LIVE FEED</h2>
          <p className="text-[#8A94A6]">Real-time plastic feedstock from verified collectors</p>
        </div>

        {/* Listings Grid */}
        <div className="mb-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#00D68F]" />
            </div>
          ) : filteredListings.length === 0 ? (
            <Card className="border-[#2A3340] bg-[#141922] p-12 text-center">
              <p className="text-[#8A94A6]">No listings available. Check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <div key={listing.id} onClick={() => handleMakeOffer(listing)}>
                  <div className="bg-[#141922] rounded-xl border border-[#2A3340] overflow-hidden hover:border-[#3A4350] transition-all">
                    {/* Image Container */}
                    <div className="relative h-40 bg-gradient-to-br from-[#1C222E] to-[#0F1419] flex items-center justify-center">
                      <div className="text-6xl opacity-40">♻️</div>
                      
                      {/* Grade Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          listing.grade === 'A' ? 'bg-[#00D68F] text-[#0A0E14] border-[#00D68F]' :
                          listing.grade === 'B' ? 'bg-[#0091FF] text-white border-[#0091FF]' :
                          'bg-[#FF6B35] text-white border-[#FF6B35]'
                        }`}>
                          {listing.grade || 'Grade A'}
                        </span>
                      </div>

                      {/* Posted Time */}
                      <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                        Posted {listing.posted_time || '1h ago'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Collector and Type */}
                      <div>
                        <p className="text-[#8A94A6] text-xs font-medium">{listing.collector_name || 'Collector'}</p>
                        <h3 className="text-lg font-bold text-[#E8ECEF]">{listing.plastic_type}</h3>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Purity */}
                        <div className="bg-[#0F1419] p-2 rounded-lg border border-[#2A3340]">
                          <p className="text-[#8A94A6] text-xs mb-1">Purity</p>
                          <p className="text-[#00D68F] font-bold">{listing.purity || 94}%</p>
                        </div>

                        {/* Weight */}
                        <div className="bg-[#0F1419] p-2 rounded-lg border border-[#2A3340]">
                          <p className="text-[#8A94A6] text-xs mb-1">Weight</p>
                          <p className="text-[#0091FF] font-bold">{(listing.quantity_kg / 1000).toFixed(1)}T</p>
                        </div>
                      </div>

                      {/* Location */}
                      <p className="text-[#8A94A6] text-xs flex items-center gap-1">
                        📍 {listing.location}
                      </p>

                      {/* Price and Button */}
                      <div className="pt-2 border-t border-[#2A3340] space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[#8A94A6] text-xs">Asking Price</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-[#00D68F]">₹{listing.price_per_kg}</span>
                            <span className="text-[#8A94A6] text-xs">/kg</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleMakeOffer(listing)}
                          className="w-full bg-[#00D68F] hover:bg-[#00C77F] text-[#0A0E14] font-semibold py-2 rounded-lg transition-all"
                        >
                          Place Bid
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs for Sourcing & ESG */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#141922] border border-[#2A3340]">
            <TabsTrigger value="browse" className="data-[state=active]:bg-[#0091FF] data-[state=active]:text-white">
              Bulk Sourcing
            </TabsTrigger>
            <TabsTrigger value="esg" className="data-[state=active]:bg-[#00D68F] data-[state=active]:text-[#0A0E14]">
              ESG Dashboard
            </TabsTrigger>
          </TabsList>

          {/* Bulk Sourcing Tab */}
          <TabsContent value="browse" className="mt-6">
            <Card className="border-[#2A3340] bg-[#141922] p-8">
              <h3 className="text-lg font-bold text-[#E8ECEF] mb-6">Quick Sourcing</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Input
                  placeholder="Amount (kg)"
                  className="bg-[#0F1419] border-[#2A3340] text-[#E8ECEF]"
                  defaultValue="1000"
                />
                <select className="rounded-md bg-[#0F1419] border border-[#2A3340] text-[#E8ECEF] px-4 py-2">
                  <option>PET</option>
                  <option>HDPE</option>
                  <option>PP</option>
                </select>
                <select className="rounded-md bg-[#0F1419] border border-[#2A3340] text-[#E8ECEF] px-4 py-2">
                  <option>Any Location</option>
                  <option>Chennai</option>
                  <option>Mumbai</option>
                </select>
                <Button className="bg-[#0091FF] hover:bg-[#0078D4] text-white">
                  Find Matches
                </Button>
              </div>

              <div className="text-[#8A94A6] text-sm mb-4">12 listings match (Total: 4.2t)</div>

              <div className="space-y-2">
                {buyerListings.slice(0, 2).map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center gap-4 p-4 bg-[#0F1419] rounded-lg border border-[#2A3340] hover:border-[#3A4350] transition-colors"
                  >
                    <input type="checkbox" className="w-4 h-4" />
                    <div className="flex-1">
                      <p className="text-[#E8ECEF] font-semibold">{listing.weight}kg • ₹{listing.price}/kg</p>
                      <p className="text-[#8A94A6] text-sm">{listing.location}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-[#0F1419] rounded-lg border border-[#00D68F]">
                <p className="text-[#8A94A6] text-sm">Selected: 1.3t • <span className="text-[#00D68F]">₹18,500</span> total</p>
                <Button className="w-full mt-4 bg-[#0091FF] hover:bg-[#0078D4] text-white">
                  Create Contract
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* ESG Dashboard Tab */}
          <TabsContent value="esg" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Stats */}
              <div className="space-y-4">
                <div className="text-sm text-[#8A94A6] mb-4">Q4 2024 Sustainability Report</div>
                
                <Card className="border-[#2A3340] bg-[#141922] p-6">
                  <p className="text-[#8A94A6] text-sm font-medium">Plastic Sourced</p>
                  <p className="text-5xl font-bold text-[#00D68F] mt-3">45 tons</p>
                </Card>

                <Card className="border-[#2A3340] bg-[#141922] p-6">
                  <p className="text-[#8A94A6] text-sm font-medium">CO₂ Offset</p>
                  <p className="text-5xl font-bold text-[#0091FF] mt-3">1,250 t</p>
                </Card>

                <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A24] text-white">
                  Download PDF Report
                </Button>
              </div>

              {/* Pie Chart */}
              <Card className="border-[#2A3340] bg-[#141922] p-6 flex flex-col items-center justify-center">
                <p className="text-[#8A94A6] text-sm font-medium mb-6">Breakdown by Type</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={impactData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {impactData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Make Offer Modal */}
      {showOfferModal && selectedListing && (
        <MakeOfferModal
          listing={selectedListing}
          onClose={() => {
            setShowOfferModal(false)
            setSelectedListing(null)
          }}
          onSuccess={() => {
            fetchListings()
          }}
        />
      )}
    </div>
  )
}
