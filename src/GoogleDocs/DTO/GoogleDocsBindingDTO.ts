import { GoogleDocsBinding } from '../Data/GoogleDocsBinding'

export interface GoogleDocsBindingDTO
  extends Omit<
    GoogleDocsBinding,
    'status' | 'id' | 'createdAt' | 'updatedAt'
  > {}
