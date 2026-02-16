import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collectorId = searchParams.get('collectorId')
    const status = searchParams.get('status')

    let query = supabase.from('plastic_listings').select(`
      *,
      plastic_photos(id, url, created_at)
    `)

    if (collectorId) {
      query = query.eq('collector_id', collectorId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      collector_id,
      plastic_type,
      quantity_kg,
      price_per_kg,
      description,
      location,
    } = body

    if (
      !collector_id ||
      !plastic_type ||
      !quantity_kg ||
      !price_per_kg ||
      !location
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('plastic_listings')
      .insert([
        {
          collector_id,
          plastic_type,
          quantity_kg,
          price_per_kg,
          description,
          location,
          status: 'active',
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating listing:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, quantity_kg } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing listing ID' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (quantity_kg !== undefined) updateData.quantity_kg = quantity_kg

    const { data, error } = await supabase
      .from('plastic_listings')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('[v0] Error updating listing:', error)
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}
