export type FormType =
  | 'NOMINEE'
  | 'SURRENDER'
  | 'DEATH_CLAIM'
  | 'PSF06A'
  | 'MEDICAL'
  | 'NEW_POLICY'
  | 'UNKNOWN'

export type DocumentStatus = 'filed' | 'review' | 'error'

export interface Document {
  id: string
  created_at: string
  file_name: string
  storage_path: string
  form_type: FormType
  status: DocumentStatus
  confidence_score: number | null
  life_assured_name: string | null
  nric: string | null
  policy_no: string | null
  agent_name: string | null
  key_details: Record<string, unknown> | null
  extracted_data: Record<string, unknown> | null
  user_id: string
}

export const FORM_TYPE_LABELS: Record<FormType, string> = {
  NOMINEE: 'Nominee Change',
  SURRENDER: 'Surrender',
  DEATH_CLAIM: 'Death Claim',
  PSF06A: 'PSF06A',
  MEDICAL: 'Medical',
  NEW_POLICY: 'New Policy',
  UNKNOWN: 'Unknown',
}
