'use client';

import React from 'react';
import { AlertCircle, CheckCircle, TrendingUp, Award } from 'lucide-react';

interface PlasticAnalysis {
  purityPercentage: number;
  contaminationPercentage: number;
  gradeQuality: 'A' | 'B' | 'C' | 'D';
  estimatedPricePerKg: number;
  analysis: string;
}

interface PlasticAnalysisDisplayProps {
  analysis: PlasticAnalysis;
  quantity?: number;
  onAnalysisConfirm?: () => void;
}

const gradeColorMap: { [key: string]: string } = {
  'A': 'bg-green-100 text-green-800 border-green-300',
  'B': 'bg-blue-100 text-blue-800 border-blue-300',
  'C': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'D': 'bg-red-100 text-red-800 border-red-300',
};

const gradeDescriptionMap: { [key: string]: string } = {
  'A': 'Premium Quality - Excellent for reprocessing',
  'B': 'Good Quality - Suitable for most applications',
  'C': 'Standard Quality - Limited reprocessing options',
  'D': 'Low Quality - Requires extensive cleaning',
};

export default function PlasticAnalysisDisplay({ 
  analysis, 
  quantity = 1,
  onAnalysisConfirm 
}: PlasticAnalysisDisplayProps) {
  const totalPrice = analysis.estimatedPricePerKg * quantity;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        {/* Grade Badge */}
        <div className={`p-4 rounded-lg border-2 text-center ${gradeColorMap[analysis.gradeQuality]}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-3xl font-bold">{analysis.gradeQuality}</span>
          </div>
          <p className="text-sm font-medium">{gradeDescriptionMap[analysis.gradeQuality]}</p>
        </div>

        {/* Analysis Summary */}
        <div className="space-y-3">
          <p className="text-slate-700 italic">{analysis.analysis}</p>
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {/* Purity */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-600 mb-2">Purity Level</div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                    style={{ width: `${analysis.purityPercentage}%` }}
                  />
                </div>
              </div>
              <span className="font-bold text-lg text-slate-900">{analysis.purityPercentage}%</span>
            </div>
          </div>

          {/* Contamination */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-600 mb-2">Contamination Level</div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all"
                    style={{ width: `${analysis.contaminationPercentage}%` }}
                  />
                </div>
              </div>
              <span className="font-bold text-lg text-slate-900">{analysis.contaminationPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-lg border border-teal-200 space-y-3">
          <div className="flex items-center gap-2 text-teal-900">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold">Pricing</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-600 mb-1">Base Price per kg</p>
              <p className="text-2xl font-bold text-teal-700">₹{analysis.estimatedPricePerKg}</p>
            </div>
            {quantity > 1 && (
              <div>
                <p className="text-xs text-slate-600 mb-1">Quantity</p>
                <p className="text-2xl font-bold text-teal-700">{quantity} kg</p>
              </div>
            )}
          </div>

          {quantity > 1 && (
            <div className="border-t border-teal-200 pt-3">
              <p className="text-xs text-slate-600 mb-1">Total Estimated Price</p>
              <p className="text-3xl font-bold text-teal-800">₹{totalPrice.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">
                *Final price depends on actual quantity and market conditions
              </p>
            </div>
          )}
        </div>

        {/* Discount Tiers Info */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <strong>Bulk Discount Available:</strong> Purchase larger quantities to get better discounts (typically 5-15% off for orders above 100kg)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onAnalysisConfirm}
            className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Proceed with Listing
          </button>
        </div>
      </div>
    </div>
  );
}
