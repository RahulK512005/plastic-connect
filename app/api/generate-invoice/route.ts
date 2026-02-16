import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateInvoiceNumber } from '@/lib/order-utils';
import { generateInvoiceHTML } from '@/lib/pdf-generator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GenerateInvoiceRequest {
  orderId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateInvoiceRequest = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }

    // Fetch order details
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:users!buyer_id(name, email, location),
        seller:users!seller_id(name, email, location),
        listing:plastic_listings(plastic_type)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !orders) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Fetch plastic analysis for grade and purity info
    const { data: analysis } = await supabase
      .from('plastic_analysis')
      .select('grade_quality, purity_percentage')
      .eq('listing_id', orders.listing_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Generate invoice data
    const invoiceNumber = generateInvoiceNumber();
    const invoiceData = {
      invoiceNumber,
      orderNumber: orders.order_number,
      buyerName: orders.buyer?.name || 'Unknown',
      buyerEmail: orders.buyer?.email || 'N/A',
      buyerLocation: orders.buyer?.location,
      sellerName: orders.seller?.name || 'Unknown',
      sellerEmail: orders.seller?.email || 'N/A',
      sellerLocation: orders.seller?.location,
      materialType: orders.listing?.plastic_type || 'Plastic Waste',
      quantity: orders.quantity_kg,
      gradeQuality: analysis?.grade_quality || 'B',
      purity: analysis?.purity_percentage || 85,
      basePrice: orders.base_price,
      discountPercentage: orders.discount_percentage || 0,
      discountAmount: orders.discount_amount || 0,
      totalAmount: orders.total_amount,
      issuedDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    // Generate invoice HTML
    const invoiceHTML = generateInvoiceHTML(invoiceData);

    // Store invoice in database
    const { data: invoiceRecord, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        order_id: orderId,
        invoice_number: invoiceNumber,
        pdf_url: `invoice-${invoiceNumber}.html`,
        buyer_name: invoiceData.buyerName,
        buyer_email: invoiceData.buyerEmail,
        seller_name: invoiceData.sellerName,
        seller_email: invoiceData.sellerEmail,
        material_details: {
          materialType: invoiceData.materialType,
          quantity: invoiceData.quantity,
          grade: invoiceData.gradeQuality,
          purity: invoiceData.purity
        },
        amount: invoiceData.totalAmount,
        issued_date: invoiceData.issuedDate,
        due_date: invoiceData.dueDate
      })
      .select();

    if (invoiceError) {
      console.error('Invoice storage error:', invoiceError);
      return NextResponse.json(
        { error: 'Failed to store invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoiceRecord?.[0]?.id,
        invoiceNumber: invoiceNumber,
        html: invoiceHTML,
        amount: invoiceData.totalAmount
      }
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
