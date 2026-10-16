export type CheckCategory = 'BUSINESS_LICENSE' | 'WAGE_RESTRICTION' | 'INSURANCE'

export type CheckItemId =
  | 'BUSINESS_STATUS'
  | 'CONSTRUCTION_LICENSE'
  | 'SPECIALTY_LICENSE'
  | 'ELECTRICAL_LICENSE'
  | 'FIRE_LICENSE'
  | 'WAGE_ARREARS'
  | 'HABITUAL_ARREARS'
  | 'SUBCONTRACT_RESTRICTION'
  | 'RETIREMENT_FUND'
  | 'EMPLOYMENT_INSURANCE'

export type StatusType = 'positive' | 'neutral' | 'negative' | 'error'

export interface CheckDetail {
  key: string
  value: string
}

export interface CheckItem {
  id: CheckItemId
  category: CheckCategory
  label: string
  source: string
  status: string
  statusType: StatusType
  details: CheckDetail[]
  description?: string
  externalUrl?: string
}

export interface CompanyInfo {
  name: string
  registrationNumber: string
}

export interface CategoryGroup {
  id: CheckCategory
  label: string
  itemIds: CheckItemId[]
}

export interface VerifyOwnerResult {
  valid: boolean
  message: string
}
