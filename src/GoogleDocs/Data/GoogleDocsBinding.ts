import { type BaseModel } from '@modules/Core/Data/Model'
import { GoogleCredentials } from './GoogleCredentials'

export interface GoogleDocsBinding extends BaseModel {
  name: string
  entityName: string
  entitySelector: {
    prop: string
    value: string
  }
  filePath: string
  googleOAuthToken: string
  googleCredentials: GoogleCredentials
  status: 'active' | 'inactive' | 'error'
  format: 'csv'
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly'
}
