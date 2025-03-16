import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

// Generic success/error schemas
const SuccessSchema = z.object({}).passthrough()
const ErrorSchema = z.object({
  error: z.string(),
}).passthrough()

const tests: RequestTest[] = [
  // --------------------------------------------------------------------------
  // 1) GET /user-settings => get()
  //    - Must be authenticated => 401 otherwise
  // --------------------------------------------------------------------------
  {
    name: 'Get user settings as authenticated user => 200',
    route: '/user-settings',
    method: 'GET',
    authAs: 'student', // or 'teacher'/'admin'—any valid role
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get user settings as unauthenticated => 401',
    route: '/user-settings',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 2) PATCH /user-settings => update()
  //    - Must be authenticated => 401
  //    - parseSettings => 400 if invalid body
  // --------------------------------------------------------------------------
  {
    name: 'Update user settings with valid body as authenticated user => 200',
    route: '/user-settings',
    method: 'PATCH',
    authAs: 'teacher', // or any other valid role
    body: {
      notificationsEnabled: true,
      language: 'en',
      // ... etc. (whatever your validator expects)
    },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update user settings with invalid body => 400',
    route: '/user-settings',
    method: 'PATCH',
    authAs: 'teacher',
    body: {
      fontSize: 'mega-ultra-large'  // invalid value
    },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update user settings as unauthenticated => 401',
    route: '/user-settings',
    method: 'PATCH',
    body: {
      notificationsEnabled: true,
      language: 'en',
    },
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
]

export default tests
