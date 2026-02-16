'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Package, Zap } from 'lucide-react'

interface RoleSelectorProps {
  onRoleSelect: (role: 'collector' | 'buyer') => void
}

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#0A0E14] text-[#E8ECEF] flex items-center justify-center px-6">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#E8ECEF] mb-4">
            Welcome to PlasticConnect
          </h1>
          <p className="text-[#8A94A6] text-lg">
            Turn plastic waste into value. Choose your role to get started.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Collector Card */}
          <Card
            className={`border-2 p-8 cursor-pointer transition-all duration-300 ${
              hoveredRole === 'collector'
                ? 'border-[#FF6B35] bg-gradient-to-br from-[#FF6B35]/10 to-[#FF6B35]/5 shadow-lg glow-orange'
                : 'border-[#2A3340] bg-[#141922] hover:border-[#3A4350]'
            }`}
            onMouseEnter={() => setHoveredRole('collector')}
            onMouseLeave={() => setHoveredRole(null)}
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF8A5B] rounded-lg flex items-center justify-center glow-orange">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#E8ECEF] text-center mb-3">
              Collector
            </h2>

            <p className="text-[#8A94A6] text-center mb-6">
              Capture plastic waste photos and sell them to verified buyers. Start earning today.
            </p>

            <div className="space-y-3 mb-8 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-[#FF6B35] font-bold">✓</span>
                <span className="text-[#8A94A6]">Capture plastic with AI-powered analysis</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#FF6B35] font-bold">✓</span>
                <span className="text-[#8A94A6]">Get instant quotes for your plastic</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#FF6B35] font-bold">✓</span>
                <span className="text-[#8A94A6]">Track earnings and environmental impact</span>
              </div>
            </div>

            <Button
              onClick={() => onRoleSelect('collector')}
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8A5B] hover:from-[#E55A24] hover:to-[#FF7A4B] text-white font-semibold h-12 glow-orange"
            >
              I'm a Collector
            </Button>
          </Card>

          {/* Buyer Card */}
          <Card
            className={`border-2 p-8 cursor-pointer transition-all duration-300 ${
              hoveredRole === 'buyer'
                ? 'border-[#0091FF] bg-gradient-to-br from-[#0091FF]/10 to-[#0091FF]/5 shadow-lg glow-blue'
                : 'border-[#2A3340] bg-[#141922] hover:border-[#3A4350]'
            }`}
            onMouseEnter={() => setHoveredRole('buyer')}
            onMouseLeave={() => setHoveredRole(null)}
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0091FF] to-[#00B8FF] rounded-lg flex items-center justify-center glow-blue">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#E8ECEF] text-center mb-3">
              Buyer
            </h2>

            <p className="text-[#8A94A6] text-center mb-6">
              Source quality plastic waste from verified collectors at competitive prices.
            </p>

            <div className="space-y-3 mb-8 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-[#0091FF] font-bold">✓</span>
                <span className="text-[#8A94A6]">Browse verified plastic listings</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#0091FF] font-bold">✓</span>
                <span className="text-[#8A94A6]">Bulk sourcing and custom contracts</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#0091FF] font-bold">✓</span>
                <span className="text-[#8A94A6]">Track ESG impact and sustainability</span>
              </div>
            </div>

            <Button
              onClick={() => onRoleSelect('buyer')}
              className="w-full bg-gradient-to-r from-[#0091FF] to-[#00B8FF] hover:from-[#0078D4] hover:to-[#0099E8] text-white font-semibold h-12 glow-blue"
            >
              I'm a Buyer
            </Button>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-[#8A94A6] text-sm">
          <p>Made with <span className="text-[#00D68F]">♻️</span> for a sustainable future</p>
        </div>
      </div>
    </div>
  )
}
