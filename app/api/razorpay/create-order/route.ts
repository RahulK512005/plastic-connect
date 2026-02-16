import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder, formatAmountToPaise } from '@/lib/razorpay';

interface CreateOrderRequest {
  orderId: string;
  amount: number;
  buyerId: string;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();
    const { orderId, amount, buyerId, description } = body;

    if (!orderId || !amount || !buyerId) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, buyerId' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: formatAmountToPaise(amount),
      currency: 'INR',
      receipt: `order_${orderId}`,
      description: description || 'PlasticConnect Plastic Purchase',
      customer_notify: 1,
      notes: {
        orderId: orderId,
        buyerId: buyerId
      }
    });

    return NextResponse.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status,
        created_at: razorpayOrder.created_at
      }
    });
  } catch (error) {
    console.error('[v0] Razorpay order creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
