import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.length < 2) return NextResponse.json({ results: [] })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ results: [] }, { status: 401 })

  const { data } = await supabase
    .from('documents')
    .select('id, file_name, life_assured_name, nric, policy_no, status')
    .or(`life_assured_name.ilike.%${q}%,nric.ilike.%${q}%,policy_no.ilike.%${q}%`)
    .limit(8)

  return NextResponse.json({ results: data ?? [] })
}