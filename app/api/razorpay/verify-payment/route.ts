import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import { verifyPaymentSignature, fetchPaymentDetails } from '@/lib/razorpay';

interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyPaymentRequest = await request.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId
    } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify signature
    const isSignatureValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Fetch payment details to confirm
    const paymentDetails = await fetchPaymentDetails(razorpayPaymentId);

    if (paymentDetails.status !== 'captured') {
      return NextResponse.json(
        { error: 'Payment not captured' },
        { status: 400 }
      );
    }

    // Update order status in database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed'
      })
      .eq('id', orderId)
      .select();

    if (orderError) {
      console.error('[v0] Order update error:', orderError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // Create payment record
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        amount: paymentDetails.amount / 100, // Convert from paise
        currency: paymentDetails.currency,
        payment_method: paymentDetails.method || 'unknown',
        status: 'captured',
        transaction_details: {
          contact: paymentDetails.contact,
          email: paymentDetails.email,
          fee: paymentDetails.fee,
          tax: paymentDetails.tax
        }
      })
      .select();

    if (paymentError) {
      console.error('[v0] Payment record error:', paymentError);
      // Don't fail the response, payment is already verified
    }

    // Update shipment status to payment confirmed
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
          notes: 'Payment successfully received and verified'
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order: orderData?.[0],
      payment: {
        id: paymentRecord?.[0]?.id,
        amount: paymentDetails.amount / 100,
        status: 'captured'
      }
    });
  } catch (error) {
    console.error('[v0] Payment verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
