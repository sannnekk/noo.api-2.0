import { GoogleSheetsBinding } from '../Data/GoogleSheetsBinding'

export interface GoogleSheetsBindingDTO
  extends Omit<
    GoogleSheetsBinding,
    'status' | 'id' | 'createdAt' | 'updatedAt'
  > {}
