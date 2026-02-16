import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import crypto from 'crypto';

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!keySecret) {
    console.error('[v0] Razorpay webhook secret not configured');
    return false;
  }

  const generated_signature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return generated_signature === signature;
}

interface WebhookPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  contact: string;
  email: string;
  fee: number;
  tax: number;
  notes: {
    orderId: string;
    buyerId: string;
  };
}

interface WebhookEvent {
  entity: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: WebhookPayment;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('[v0] Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event: WebhookEvent = JSON.parse(body);
    const payment = event.payload.payment.entity;
    const orderId = payment.notes.orderId;

    // Handle different webhook events
    switch (event.event) {
      case 'payment.authorized':
        // Payment authorized but not captured (UPI, NetBanking)
        console.log(`[v0] Payment authorized: ${payment.id}`);
        
        // Update payment record
        await supabase
          .from('payments')
          .update({
            razorpay_payment_id: payment.id,
            status: 'captured',
            payment_method: payment.method
          })
          .eq('razorpay_payment_id', payment.id);

        break;

      case 'payment.captured':
        // Payment successfully captured
        console.log(`[v0] Payment captured: ${payment.id}`);

        // Update order and payment
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed'
          })
          .eq('id', orderId);

        await supabase
          .from('payments')
          .update({
            razorpay_payment_id: payment.id,
            status: 'captured',
            amount: payment.amount / 100,
            payment_method: payment.method,
            transaction_details: {
              contact: payment.contact,
              email: payment.email,
              fee: payment.fee,
              tax: payment.tax
            }
          })
          .eq('order_id', orderId);

        // Update shipment status
        const { data: shipments } = await supabase
          .from('shipments')
          .select('id')
          .eq('order_id', orderId)
          .single();

        if (shipments) {
          await supabase
            .from('shipments')
            .update({ status: 'payment_confirmed' })
            .eq('id', shipments.id);

          await supabase
            .from('shipment_status_history')
            .insert({
              shipment_id: shipments.id,
              status: 'payment_confirmed',
              notes: 'Payment successfully captured via webhook'
            });
        }

        break;

      case 'payment.failed':
        // Payment failed
        console.log(`[v0] Payment failed: ${payment.id}`);

        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            status: 'payment_failed'
          })
          .eq('id', orderId);

        await supabase
          .from('payments')
          .update({
            razorpay_payment_id: payment.id,
            status: 'failed',
            error_message: 'Payment failed via webhook'
          })
          .eq('order_id', orderId);

        break;

      case 'refund.created':
        // Refund initiated
        console.log(`[v0] Refund created for payment: ${payment.id}`);

        await supabase
          .from('payments')
          .update({
            status: 'refunded'
          })
          .eq('razorpay_payment_id', payment.id);

        break;

      default:
        console.log(`[v0] Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('[v0] Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
