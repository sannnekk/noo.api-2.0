import { ZodSchema } from 'zod'

export interface RequestTest {
  name: string
  route: string
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: any | ((users: any) => any)
  query?: Record<string, any>
  authAs?: 'admin' | 'teacher' | 'mentor' | 'student'
  responseSchema?: ZodSchema
  expectedStatus: number
  response?: (data: any) => void
}
