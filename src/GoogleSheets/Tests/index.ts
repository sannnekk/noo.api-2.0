import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

// Basic success/error schemas:
const SuccessSchema = z.object({}).passthrough()
const ErrorSchema = z.object({
  error: z.string(),
}).passthrough()

const tests: RequestTest[] = [
  // --------------------------------------------------------------------------
  // 1) GET /google-docs/binding
  //    - Must be authenticated
  //    - Must be teacherOrAdmin (teacher|admin => OK, student => 403)
  // --------------------------------------------------------------------------
  {
    name: 'Get Google Docs bindings as teacher => 200',
    route: '/google-docs/binding',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get Google Docs bindings as admin => 200',
    route: '/google-docs/binding',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get Google Docs bindings as student => 403',
    route: '/google-docs/binding',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get Google Docs bindings unauthenticated => 401',
    route: '/google-docs/binding',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 2) POST /google-docs/binding
  //    - Must be authenticated
  //    - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Create new Google Docs binding as teacher => 200',
    route: '/google-docs/binding',
    method: 'POST',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Create new Google Docs binding as admin => 200',
    route: '/google-docs/binding',
    method: 'POST',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Create new Google Docs binding as student => 403',
    route: '/google-docs/binding',
    method: 'POST',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create new Google Docs binding unauthenticated => 401',
    route: '/google-docs/binding',
    method: 'POST',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Create new Google Docs binding with invalid data => 400',
    route: '/google-docs/binding',
    method: 'POST',
    authAs: 'teacher',
    // We'll assume parseGoogleDocsBinding fails if body is empty or invalid
    body: {}, // or something that doesn't match the required schema
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 3) PATCH /google-docs/binding/:id/trigger
  //    - Must be authenticated
  //    - Must be teacherOrAdmin
  //    - parseId => 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Trigger a Google Docs binding as teacher => 200',
    route: '/google-docs/binding/123/trigger',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Trigger a Google Docs binding as admin => 200',
    route: '/google-docs/binding/123/trigger',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Trigger a Google Docs binding as student => 403',
    route: '/google-docs/binding/123/trigger',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Trigger a Google Docs binding unauthenticated => 401',
    route: '/google-docs/binding/123/trigger',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Trigger a Google Docs binding with invalid ID => 400',
    route: '/google-docs/binding/invalid-id/trigger',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 4) PATCH /google-docs/binding/:id/switch-on-off
  //    - Must be teacherOrAdmin
  //    - parseId => 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Switch on/off a Google Docs binding as teacher => 200',
    route: '/google-docs/binding/123/switch-on-off',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Switch on/off a Google Docs binding as admin => 200',
    route: '/google-docs/binding/123/switch-on-off',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Switch on/off a Google Docs binding as student => 403',
    route: '/google-docs/binding/123/switch-on-off',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Switch on/off a Google Docs binding unauth => 401',
    route: '/google-docs/binding/123/switch-on-off',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Switch on/off a Google Docs binding with invalid ID => 400',
    route: '/google-docs/binding/not-a-number/switch-on-off',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 5) DELETE /google-docs/binding/:id
  //    - Must be teacherOrAdmin
  //    - parseId => 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Delete a Google Docs binding as teacher => 200',
    route: '/google-docs/binding/999',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete a Google Docs binding as admin => 200',
    route: '/google-docs/binding/999',
    method: 'DELETE',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete a Google Docs binding as student => 403',
    route: '/google-docs/binding/999',
    method: 'DELETE',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete a Google Docs binding unauth => 401',
    route: '/google-docs/binding/999',
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Delete a Google Docs binding with invalid ID => 400',
    route: '/google-docs/binding/not-a-valid-id',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
]

export default tests
