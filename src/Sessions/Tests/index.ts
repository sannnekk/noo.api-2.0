import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

// Generic schemas for success & error
const SuccessSchema = z.object({}).passthrough()
const ErrorSchema = z.object({
  error: z.string(),
}).passthrough()

const tests: RequestTest[] = [
  // --------------------------------------------------------------------------
  // GET /session => getSessionsForUser
  //   - Must be authenticated => 200
  //   - Unauthenticated => 401
  // --------------------------------------------------------------------------
  {
    name: 'Get user sessions (authenticated user) => 200',
    route: '/session',
    method: 'GET',
    authAs: 'student', // or 'teacher'/'admin'/any authenticated
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get user sessions (unauthenticated) => 401',
    route: '/session',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // DELETE /session => deleteCurrentSession
  //   - Must be authenticated => 200
  //   - Unauthenticated => 401
  // --------------------------------------------------------------------------
  {
    name: 'Delete current session (authenticated user) => 200',
    route: '/session',
    method: 'DELETE',
    authAs: 'teacher', // or 'student'/'admin'
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete current session (unauthenticated) => 401',
    route: '/session',
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // DELETE /session/:id => deleteSession
  //   - Must be authenticated
  //   - parseId => 400 if invalid
  //   - Possibly 403 if the session belongs to another user (depends on service)
  // --------------------------------------------------------------------------
  {
    name: 'Delete a specific session by ID (authenticated user) => 200',
    route: '/session/999',
    method: 'DELETE',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete a specific session with invalid ID => 400',
    route: '/session/not-valid',
    method: 'DELETE',
    authAs: 'admin',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete a specific session (unauthenticated) => 401',
    route: '/session/999',
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  // If the service enforces ownership and returns 403, you could add:
  // {
  //   name: 'Delete a session belonging to another user => 403',
  //   route: '/session/999',
  //   method: 'DELETE',
  //   authAs: 'student', // with credentials that don't own session 999
  //   expectedStatus: StatusCodes.FORBIDDEN,
  //   responseSchema: ErrorSchema,
  // },
]

export default tests
