import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get('id')
    const buyerId = searchParams.get('buyerId')
    const listingId = searchParams.get('listingId')

    let query = supabase.from('offers').select('*')

    if (offerId) {
      query = query.eq('id', offerId)
    } else if (buyerId) {
      query = query.eq('buyer_id', buyerId)
    } else if (listingId) {
      query = query.eq('listing_id', listingId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Error fetching offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { buyer_id, listing_id, quantity_kg, price_per_kg, notes } = body

    if (!buyer_id || !listing_id || !quantity_kg || !price_per_kg) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const total_price = quantity_kg * price_per_kg

    const { data, error } = await supabase
      .from('offers')
      .insert([
        {
          buyer_id,
          listing_id,
          quantity_kg,
          price_per_kg,
          total_price,
          status: 'pending',
          notes,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating offer:', error)
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('offers')
      .update({ status })
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('[v0] Error updating offer:', error)
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    )
  }
}
