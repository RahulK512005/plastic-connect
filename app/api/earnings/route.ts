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

    if (!collectorId) {
      return NextResponse.json(
        { error: 'Collector ID required' },
        { status: 400 }
      )
    }

    // Get earnings record
    const { data: earnings, error: earningsError } = await supabase
      .from('earnings')
      .select('*')
      .eq('collector_id', collectorId)
      .single()

    if (earningsError && earningsError.code !== 'PGRST116') {
      return NextResponse.json({ error: earningsError.message }, { status: 500 })
    }

    // Get transactions
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('collector_id', collectorId)
      .order('created_at', { ascending: false })

    if (transError) {
      return NextResponse.json({ error: transError.message }, { status: 500 })
    }

    return NextResponse.json({
      earnings: earnings || { total_earned: 0, pending_amount: 0 },
      transactions: transactions || [],
    })
  } catch (error) {
    console.error('[v0] Error fetching earnings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { collector_id, amount, transaction_type, offer_id } = body

    if (!collector_id || !amount || !transaction_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create transaction
    const { data: transaction, error: transError } = await supabase
      .from('transactions')
      .insert([
        {
          collector_id,
          amount,
          transaction_type,
          offer_id,
          status: 'completed',
        },
      ])
      .select()

    if (transError) {
      return NextResponse.json({ error: transError.message }, { status: 500 })
    }

    // Update or create earnings
    const { data: existingEarnings } = await supabase
      .from('earnings')
      .select('*')
      .eq('collector_id', collector_id)
      .single()

    if (existingEarnings) {
      await supabase
        .from('earnings')
        .update({
          total_earned: (existingEarnings.total_earned || 0) + amount,
        })
        .eq('collector_id', collector_id)
    } else {
      await supabase
        .from('earnings')
        .insert([
          {
            collector_id,
            total_earned: amount,
            pending_amount: 0,
          },
        ])
    }

    return NextResponse.json(transaction[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
