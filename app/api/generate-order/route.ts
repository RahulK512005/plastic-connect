import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateOrderNumber, getApplicableDiscount, calculateTotal } from '@/lib/order-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CreateOrderRequest {
  listingId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  basePrice: number;
  plasticType: string;
  gradeQuality: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();
    const {
      listingId,
      buyerId,
      sellerId,
      quantity,
      basePrice,
      plasticType,
      gradeQuality
    } = body;

    // Validate input
    if (!listingId || !buyerId || !sellerId || !quantity || !basePrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get applicable discount
    const discountPercentage = await getApplicableDiscount(
      plasticType,
      gradeQuality,
      quantity
    );

    // Calculate totals
    const { baseAmount, discountAmount, totalAmount } = calculateTotal(
      basePrice,
      quantity,
      discountPercentage
    );

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Create order in database
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: sellerId,
        quantity_kg: quantity,
        base_price: basePrice,
        discount_percentage: discountPercentage,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        status: 'payment_pending',
        payment_status: 'unpaid'
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    const order = data?.[0];

    // Create shipment tracking for this order
    if (order) {
      await supabase
        .from('shipments')
        .insert({
          order_id: order.id,
          status: 'order_placed',
          current_location: 'Order placed'
        });

      // Create initial status history
      await supabase
        .from('shipment_status_history')
        .insert({
          shipment_id: order.id,
          status: 'order_placed',
          notes: 'Order created and awaiting payment'
        });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order?.id,
        orderNumber: order?.order_number,
        quantity,
        basePrice,
        discountPercentage,
        discountAmount,
        totalAmount,
        status: 'payment_pending',
        paymentStatus: 'unpaid'
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
