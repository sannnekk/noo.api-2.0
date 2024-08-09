import { type BaseModel } from '@modules/Core/Data/Model'
import { type TokenPayload } from 'google-auth-library'

export interface GoogleDocsBinding extends BaseModel {
  name: string
  entityName: string
  entitySelector: {
    prop: string
    value: string
  }
  filePath: string[]
  googleOAuthToken: string | null
  googleRefreshToken: string | null
  googleCredentials: TokenPayload | null
  lastRunAt: Date | null
  status: 'active' | 'inactive' | 'error'
  lastErrorText: string | null
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly'
}
