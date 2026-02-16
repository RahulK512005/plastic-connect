'use client';

import React, { useEffect, useState } from 'react';
import { Check, Clock, Truck, Home, AlertCircle } from 'lucide-react';

interface TrackingStatus {
  status: string;
  timestamp: Date;
  location?: string;
  notes?: string;
}

interface MaterialTrackingProps {
  orderId: string;
  orderNumber: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  currentStatus?: string;
  trackingHistory?: TrackingStatus[];
}

const statusConfig: { [key: string]: { color: string; icon: React.ReactNode; title: string; description: string } } = {
  'order_placed': {
    color: 'bg-blue-100 border-blue-300',
    icon: <Clock className="w-6 h-6 text-blue-600" />,
    title: 'Order Placed',
    description: 'Your order has been successfully placed and awaiting payment'
  },
  'payment_confirmed': {
    color: 'bg-green-100 border-green-300',
    icon: <Check className="w-6 h-6 text-green-600" />,
    title: 'Payment Confirmed',
    description: 'Payment has been verified and order is being prepared for shipment'
  },
  'in_transit': {
    color: 'bg-purple-100 border-purple-300',
    icon: <Truck className="w-6 h-6 text-purple-600" />,
    title: 'In Transit',
    description: 'Your material is on the way to you'
  },
  'out_for_delivery': {
    color: 'bg-orange-100 border-orange-300',
    icon: <Truck className="w-6 h-6 text-orange-600" />,
    title: 'Out for Delivery',
    description: 'Material will be delivered today'
  },
  'delivered': {
    color: 'bg-teal-100 border-teal-300',
    icon: <Home className="w-6 h-6 text-teal-600" />,
    title: 'Delivered',
    description: 'Material has been delivered'
  },
  'received_verified': {
    color: 'bg-green-100 border-green-300',
    icon: <Check className="w-6 h-6 text-green-600" />,
    title: 'Received & Verified',
    description: 'Material has been received and quality verified'
  }
};

const statusSequence = [
  'order_placed',
  'payment_confirmed',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'received_verified'
];

export default function MaterialTracking({
  orderId,
  orderNumber,
  trackingNumber,
  estimatedDeliveryDate,
  currentStatus = 'order_placed',
  trackingHistory = []
}: MaterialTrackingProps) {
  const [statusHistory, setStatusHistory] = useState<TrackingStatus[]>(trackingHistory);
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null);

  const getStatusIndex = (status: string): number => {
    return statusSequence.indexOf(status);
  };

  const currentStatusIndex = getStatusIndex(currentStatus);
  const config = statusConfig[currentStatus] || statusConfig['order_placed'];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Track Your Order</h2>
          <p className="text-slate-600">Order #{orderNumber}</p>
          {trackingNumber && (
            <p className="text-sm text-slate-500 mt-1">Tracking: {trackingNumber}</p>
          )}
        </div>

        {/* Current Status Card */}
        <div className={`p-4 rounded-lg border-2 ${config.color}`}>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {config.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-slate-900">
                {config.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {config.description}
              </p>
              {estimatedDeliveryDate && currentStatusIndex < 4 && (
                <p className="text-sm font-medium text-slate-700 mt-2">
                  📅 Estimated Delivery: {estimatedDeliveryDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Delivery Timeline</h3>
          <div className="space-y-0">
            {statusSequence.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const statusConfig = statusConfig[status];

              return (
                <div key={status} className="relative">
                  {/* Line between statuses */}
                  {index < statusSequence.length - 1 && (
                    <div className={`absolute left-6 top-16 w-1 h-8 ${isCompleted ? 'bg-teal-500' : 'bg-slate-300'}`} />
                  )}

                  {/* Status Item */}
                  <button
                    onClick={() => setExpandedStatus(expandedStatus === status ? null : status)}
                    className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      isCurrent
                        ? 'border-teal-500 bg-teal-50 shadow-md'
                        : isCompleted
                        ? 'border-teal-200 bg-teal-50'
                        : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    {/* Status Circle */}
                    <div className={`flex-shrink-0 mt-1 w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-teal-500 text-white'
                        : 'bg-slate-300 text-slate-700'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Clock className="w-6 h-6" />
                      )}
                    </div>

                    {/* Status Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-slate-900 ${isCurrent ? 'text-lg' : ''}`}>
                        {statusConfig.title}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {statusConfig.description}
                      </p>
                    </div>

                    {/* Arrow for expandable */}
                    {statusHistory.some(h => h.status === status) && (
                      <div className={`flex-shrink-0 transition-transform ${expandedStatus === status ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Expanded Details */}
                  {expandedStatus === status && statusHistory.some(h => h.status === status) && (
                    <div className="ml-12 mr-4 mt-2 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      {statusHistory
                        .filter(h => h.status === status)
                        .map((history, idx) => (
                          <div key={idx} className="pb-3 last:pb-0">
                            <p className="text-sm font-medium text-slate-900">
                              {new Date(history.timestamp).toLocaleString('en-IN')}
                            </p>
                            {history.location && (
                              <p className="text-sm text-slate-600 mt-1">
                                📍 Location: {history.location}
                              </p>
                            )}
                            {history.notes && (
                              <p className="text-sm text-slate-700 mt-1 italic">
                                {history.notes}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        {currentStatusIndex < statusSequence.length - 1 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">What's next?</p>
              <p>
                {currentStatusIndex === 0 && 'Your order will be prepared for shipment once payment is confirmed.'}
                {currentStatusIndex === 1 && 'Your material is being prepared and will be shipped soon.'}
                {currentStatusIndex === 2 && 'Your material is on its way. You can expect it within 3-5 business days.'}
                {currentStatusIndex === 3 && 'Your material will arrive today. Please have someone available to receive it.'}
                {currentStatusIndex === 4 && 'Please verify the material quality and condition. Let us know if there are any issues.'}
              </p>
            </div>
          </div>
        )}

        {/* Completed Message */}
        {currentStatusIndex === statusSequence.length - 1 && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
            <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-green-900">Order Complete!</h4>
            <p className="text-sm text-green-700 mt-1">
              Thank you for your purchase. Your material has been received and verified.
            </p>
          </div>
        )}

        {/* Support */}
        <div className="bg-slate-50 p-4 rounded-lg text-center text-sm text-slate-600 border border-slate-200">
          <p>Questions about your shipment?</p>
          <p className="text-teal-600 font-semibold mt-1">
            Contact support@plasticconnect.ai
          </p>
        </div>
      </div>
    </div>
  );
}
