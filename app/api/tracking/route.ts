import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';

interface GetTrackingRequest {
  orderId: string;
}

interface UpdateTrackingRequest {
  shipmentId: string;
  status: 'order_placed' | 'payment_confirmed' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'received_verified';
  location?: string;
  notes?: string;
  estimatedDelivery?: string;
}

/**
 * GET endpoint to fetch tracking information for an order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId parameter' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Fetch shipment details
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (shipmentError) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Fetch shipment status history
    const { data: history, error: historyError } = await supabase
      .from('shipment_status_history')
      .select('*')
      .eq('shipment_id', shipment.id)
      .order('timestamp', { ascending: true });

    if (historyError) {
      console.error('History fetch error:', historyError);
    }

    return NextResponse.json({
      success: true,
      tracking: {
        id: shipment.id,
        orderId: shipment.order_id,
        trackingNumber: shipment.tracking_number,
        status: shipment.status,
        currentLocation: shipment.current_location,
        estimatedDelivery: shipment.estimated_delivery,
        actualDelivery: shipment.actual_delivery,
        history: history || []
      }
    });
  } catch (error) {
    console.error('[v0] Tracking fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to update tracking status
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body: UpdateTrackingRequest = await request.json();
    const { shipmentId, status, location, notes, estimatedDelivery } = body;

    if (!shipmentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: shipmentId, status' },
        { status: 400 }
      );
    }

    // Update shipment status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (location) {
      updateData.current_location = location;
    }

    if (estimatedDelivery) {
      updateData.estimated_delivery = estimatedDelivery;
    }

    const { data: updatedShipment, error: updateError } = await supabase
      .from('shipments')
      .update(updateData)
      .eq('id', shipmentId)
      .select();

    if (updateError) {
      console.error('[v0] Shipment update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update shipment status' },
        { status: 500 }
      );
    }

    // Add status to history
    const { error: historyError } = await supabase
      .from('shipment_status_history')
      .insert({
        shipment_id: shipmentId,
        status,
        location: location || null,
        notes: notes || null
      });

    if (historyError) {
      console.error('[v0] History insert error:', historyError);
      // Don't fail the response, history is secondary
    }

    return NextResponse.json({
      success: true,
      shipment: updatedShipment?.[0]
    });
  } catch (error) {
    console.error('[v0] Tracking update error:', error);
    return NextResponse.json(
      { error: 'Failed to update tracking status' },
      { status: 500 }
    );
  }
}
