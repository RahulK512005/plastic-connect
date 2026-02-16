import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listing_id, base64_data, file_name } = body

    if (!listing_id || !base64_data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64_data, 'base64')
    const fileName = file_name || `photo-${Date.now()}.jpg`

    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('plastic-photos')
      .upload(`${listing_id}/${fileName}`, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('plastic-photos').getPublicUrl(storageData.path)

    // Save photo record to database
    const { data, error } = await supabase
      .from('plastic_photos')
      .insert([
        {
          listing_id,
          url: publicUrl,
          storage_path: storageData.path,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error uploading photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')

    if (!listingId) {
      return NextResponse.json(
        { error: 'Missing listing ID' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('plastic_photos')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}
