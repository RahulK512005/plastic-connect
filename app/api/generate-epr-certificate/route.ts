import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import { generateCertificateNumber } from '@/lib/order-utils';
import { generateCertificateHTML } from '@/lib/pdf-generator';

interface GenerateEPRRequest {
  orderId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateEPRRequest = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Fetch order details
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:users!buyer_id(name, email),
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
      .select('grade_quality')
      .eq('listing_id', orders.listing_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Generate certificate number
    const certificateNumber = generateCertificateNumber();
    
    // Certificate validity: 2 years from issuance
    const issuedDate = new Date();
    const validityEnd = new Date(issuedDate);
    validityEnd.setFullYear(validityEnd.getFullYear() + 2);

    const certificateData = {
      certificateNumber,
      brandName: orders.buyer?.name || 'Unknown Brand',
      brandEmail: orders.buyer?.email || 'N/A',
      materialType: orders.listing?.plastic_type || 'Plastic Waste',
      quantity: orders.quantity_kg,
      gradeQuality: analysis?.grade_quality || 'B',
      certificationAuthority: 'Ministry of Environment, Forest and Climate Change',
      validityStart: issuedDate,
      validityEnd: validityEnd,
      issuedDate: issuedDate
    };

    // Generate certificate HTML
    const certificateHTML = generateCertificateHTML(certificateData);

    // Store certificate in database
    const { data: certificateRecord, error: certError } = await supabase
      .from('epr_certificates')
      .insert({
        order_id: orderId,
        certificate_number: certificateNumber,
        certificate_pdf_url: `epr-${certificateNumber}.html`,
        brand_name: certificateData.brandName,
        brand_email: certificateData.brandEmail,
        material_type: certificateData.materialType,
        quantity_kg: certificateData.quantity,
        grade_quality: certificateData.gradeQuality,
        validity_start: certificateData.validityStart,
        validity_end: certificateData.validityEnd
      })
      .select();

    if (certError) {
      console.error('Certificate storage error:', certError);
      return NextResponse.json(
        { error: 'Failed to store certificate' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificateRecord?.[0]?.id,
        certificateNumber: certificateNumber,
        html: certificateHTML,
        validityStart: certificateData.validityStart.toISOString(),
        validityEnd: certificateData.validityEnd.toISOString()
      }
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate EPR certificate' },
      { status: 500 }
    );
  }
}
