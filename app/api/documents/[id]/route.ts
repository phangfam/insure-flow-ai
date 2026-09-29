import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const body = await request.json()

  const { error } = await supabase
    .from('documents')
    .update({
      life_assured_name: body.life_assured_name || null,
      nric: body.nric || null,
      policy_no: body.policy_no || null,
      agent_name: body.agent_name || null,
      form_type: body.form_type,
      status: body.status,
    })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
