'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export function ApiTest() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const testListingsApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/listings')
      const data = await response.json()
      setResults({ test: 'Listings API', data, status: response.ok ? 'success' : 'error' })
    } catch (error) {
      setResults({ test: 'Listings API', error: String(error), status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const testOffersApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/offers')
      const data = await response.json()
      setResults({ test: 'Offers API', data, status: response.ok ? 'success' : 'error' })
    } catch (error) {
      setResults({ test: 'Offers API', error: String(error), status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const testUsersApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setResults({ test: 'Users API', data, status: response.ok ? 'success' : 'error' })
    } catch (error) {
      setResults({ test: 'Users API', error: String(error), status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Card className="border-[#2A3340] bg-[#141922] p-4 w-96">
        <h3 className="font-bold text-[#00D68F] mb-3">API Test Panel</h3>
        <div className="space-y-2 mb-4">
          <Button
            onClick={testListingsApi}
            disabled={loading}
            size="sm"
            className="w-full text-xs"
            variant="outline"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Test Listings'}
          </Button>
          <Button
            onClick={testOffersApi}
            disabled={loading}
            size="sm"
            className="w-full text-xs"
            variant="outline"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Test Offers'}
          </Button>
          <Button
            onClick={testUsersApi}
            disabled={loading}
            size="sm"
            className="w-full text-xs"
            variant="outline"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Test Users'}
          </Button>
        </div>
        {results && (
          <div className="text-xs bg-[#0A0E14] p-2 rounded max-h-40 overflow-auto">
            <p className="text-[#00D68F] font-bold">{results.test}</p>
            <p className={results.status === 'success' ? 'text-green-400' : 'text-red-400'}>
              {results.status}
            </p>
            <pre className="text-[#8A94A6] whitespace-pre-wrap break-words">
              {JSON.stringify(results.data || results.error, null, 2).slice(0, 300)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  )
}
