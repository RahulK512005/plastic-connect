'use client';

import React, { useState } from 'react';
import { CreditCard, Smartphone, Building2, QrCode, Wallet, Loader } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  supported: boolean;
}

interface PaymentCheckoutProps {
  amount: number;
  orderId: string;
  orderNumber: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing?: boolean;
}

export default function PaymentCheckout({
  amount,
  orderId,
  orderNumber,
  onPaymentSuccess,
  onPaymentError,
  isProcessing = false
}: PaymentCheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [isLoading, setIsLoading] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, MasterCard, RuPay',
      icon: <CreditCard className="w-6 h-6" />,
      supported: true
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Google Pay, PhonePe, BHIM',
      icon: <Smartphone className="w-6 h-6" />,
      supported: true
    },
    {
      id: 'netbanking',
      name: 'Internet Banking',
      description: 'All major Indian banks',
      icon: <Building2 className="w-6 h-6" />,
      supported: true
    },
    {
      id: 'qr',
      name: 'QR Code',
      description: 'Scan and pay instantly',
      icon: <QrCode className="w-6 h-6" />,
      supported: true
    }
  ];

  const handleInitiatePayment = async () => {
    setIsLoading(true);
    try {
      // Step 1: Create Razorpay order
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount,
          buyerId: 'current-user-id', // This would come from auth context
          description: `Plastic purchase - Order ${orderNumber}`
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();
      const razorpayOrderId = orderData.order.id;

      // Step 2: Open Razorpay checkout
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(amount * 100), // Convert to paise
          currency: 'INR',
          order_id: razorpayOrderId,
          name: 'PlasticConnect.AI',
          description: `Purchase Order ${orderNumber}`,
          image: '/logo.png',
          prefill: {
            email: 'user@example.com', // Would be from auth
            contact: '+91XXXXXXXXXX' // Would be from user profile
          },
          method: {
            emandate: 'netbanking',
            recurring: 'preferred'
          },
          notes: {
            orderId,
            orderNumber
          },
          theme: {
            color: '#10b981'
          },
          handler: async (response: any) => {
            try {
              // Step 3: Verify payment on backend
              const verifyResponse = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  orderId
                })
              });

              if (!verifyResponse.ok) {
                throw new Error('Payment verification failed');
              }

              const verifyData = await verifyResponse.json();
              onPaymentSuccess(response.razorpay_payment_id);
            } catch (error) {
              onPaymentError(error instanceof Error ? error.message : 'Verification failed');
            }
          },
          modal: {
            ondismiss: () => {
              onPaymentError('Payment cancelled by user');
            }
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        throw new Error('Razorpay SDK not loaded');
      }
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Method</h2>
          <p className="text-slate-600">Select how you'd like to pay</p>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-700">Order Number:</span>
            <span className="font-semibold text-slate-900">{orderNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-700">Total Amount:</span>
            <span className="text-3xl font-bold text-teal-600">₹{amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 mb-3 block">
            Payment Methods
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                disabled={!method.supported || isProcessing || isLoading}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedMethod === method.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                } ${
                  !method.supported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className={`flex items-start gap-3 ${selectedMethod === method.id ? 'text-teal-700' : 'text-slate-700'}`}>
                  <div className="flex-shrink-0 mt-1">
                    {selectedMethod === method.id && (
                      <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                    {selectedMethod !== method.id && (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {method.icon}
                      <h3 className="font-semibold">{method.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{method.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>💳 Secure Payment:</strong> Your payment is processed securely through Razorpay. 
            Your card details are never stored on our servers.
          </p>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-slate-700">256-bit SSL</p>
            <p className="text-xs text-slate-500">Encrypted</p>
          </div>
          <div>
            <div className="text-2xl mb-2">✓</div>
            <p className="text-slate-700">PCI Compliant</p>
            <p className="text-xs text-slate-500">Certified</p>
          </div>
          <div>
            <div className="text-2xl mb-2">🛡️</div>
            <p className="text-slate-700">Fraud Protected</p>
            <p className="text-xs text-slate-500">Guaranteed</p>
          </div>
        </div>

        {/* Terms */}
        <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
          <p>
            By proceeding with payment, you agree to our Terms of Service. 
            Your transaction will be processed immediately and you'll receive a confirmation email.
          </p>
        </div>

        {/* Pay Button */}
        <button
          onClick={handleInitiatePayment}
          disabled={isProcessing || isLoading}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          {isLoading || isProcessing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Pay ₹{amount.toFixed(2)} with {selectedMethod.toUpperCase()}
            </>
          )}
        </button>

        {/* Support Info */}
        <p className="text-center text-xs text-slate-500">
          Having issues? Contact support@plasticconnect.ai or call +91-XXXX-XXXX-XXXX
        </p>
      </div>
    </div>
  );
}
