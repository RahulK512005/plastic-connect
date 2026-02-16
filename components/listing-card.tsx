'use client';

import React from 'react';
import { Award, MapPin, Scale, Zap, Clock } from 'lucide-react';

interface ListingCardProps {
  id: string;
  collectorName: string;
  plasticType: string;
  grade: string;
  purity: number;
  weight: number;
  price: number;
  location: string;
  image?: string;
  postedTime?: string;
  onPlaceBid: () => void;
}

const gradeColorMap: { [key: string]: string } = {
  'A': 'bg-green-100 text-green-800 border-green-300',
  'B': 'bg-blue-100 text-blue-800 border-blue-300',
  'C': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'D': 'bg-red-100 text-red-800 border-red-300',
};

const plasticTypeColorMap: { [key: string]: string } = {
  'HDPE': 'from-blue-500 to-blue-600',
  'PET': 'from-purple-500 to-purple-600',
  'PP': 'from-indigo-500 to-indigo-600',
  'LDPE': 'from-cyan-500 to-cyan-600',
  'PS': 'from-pink-500 to-pink-600',
};

export default function ListingCard({
  id,
  collectorName,
  plasticType,
  grade,
  purity,
  weight,
  price,
  location,
  image,
  postedTime = 'Recently',
  onPlaceBid
}: ListingCardProps) {
  const gradient = plasticTypeColorMap[plasticType] || 'from-slate-500 to-slate-600';

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:border-teal-300">
      {/* Image Container */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {image ? (
          <img
            src={image}
            alt={plasticType}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl opacity-30">♻️</div>
          </div>
        )}

        {/* Grade Badge */}
        <div className="absolute top-3 right-3">
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${gradeColorMap[grade]}`}>
            Grade {grade}
          </div>
        </div>

        {/* Posted Time Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {postedTime}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-slate-900">{plasticType}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {location}
          </p>
        </div>

        {/* Collector Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Collector</p>
            <p className="text-sm font-semibold text-slate-900">{collectorName}</p>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {/* Purity */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs text-slate-600 font-medium mb-1">Purity</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-green-600">{purity}</span>
              <span className="text-xs text-slate-500">%</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                style={{ width: `${purity}%` }}
              />
            </div>
          </div>

          {/* Weight */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-slate-600 font-medium mb-1">Weight</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-blue-600">{weight}</span>
              <span className="text-xs text-slate-500">Tons</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-600">
              <Scale className="w-3 h-3" />
              Total Stock
            </div>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="pt-2 border-t border-slate-200 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-slate-600 font-medium">Asking Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-teal-600">₹{price}</span>
              <span className="text-xs text-slate-500">/kg</span>
            </div>
          </div>

          {/* Place Bid Button */}
          <button
            onClick={onPlaceBid}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            Place Bid
          </button>
        </div>

        {/* Additional Info */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            Fast delivery
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-500" />
            Verified seller
          </div>
        </div>
      </div>
    </div>
  );
}
