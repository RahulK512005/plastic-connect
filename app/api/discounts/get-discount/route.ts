import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { plasticType, gradeQuality, quantityKg } = await request.json();

    // Validate inputs
    if (!plasticType || !gradeQuality || quantityKg === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch applicable discount
    const { data, error } = await supabase
      .from('discount_tiers')
      .select('discount_percentage')
      .eq('plastic_type', plasticType)
      .eq('grade_quality', gradeQuality)
      .lte('min_quantity_kg', quantityKg)
      .or(`max_quantity_kg.is.null,max_quantity_kg.gte.${quantityKg}`)
      .order('discount_percentage', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[v0] Discount fetch error:', error);
      return NextResponse.json({ discount: 0 });
    }

    const discount = data && data.length > 0 ? data[0].discount_percentage : 0;

    return NextResponse.json({
      discount: discount || 0,
      success: true
    });
  } catch (error) {
    console.error('[v0] Error in discount API:', error);
    return NextResponse.json(
      { error: 'Internal server error', discount: 0 },
      { status: 500 }
    );
  }
}
