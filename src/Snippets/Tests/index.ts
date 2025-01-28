import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

// Generic success/error schemas:
const SuccessSchema = z.object({}).passthrough()
const ErrorSchema = z.object({
  error: z.string(),
}).passthrough()

const tests: RequestTest[] = [
  // --------------------------------------------------------------------------
  // 1) GET /snippet => getSnippets
  //    - Must be authenticated
  //    - Must be mentor => if not => 403
  //    - Unauthenticated => 401
  //    - Success => 200
  // --------------------------------------------------------------------------
  {
    name: 'Get all snippets as mentor => 200',
    route: '/snippet',
    method: 'GET',
    authAs: 'mentor', // The role that passes Asserts.mentor
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get all snippets as non-mentor (e.g. student) => 403',
    route: '/snippet',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get all snippets as unauthenticated => 401',
    route: '/snippet',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 2) POST /snippet => createSnippet
  //    - Must be authenticated
  //    - Must be mentor
  //    - parseSnippet => 400 if body is invalid
  // --------------------------------------------------------------------------
  {
    name: 'Create a new snippet as mentor => 200',
    route: '/snippet',
    method: 'POST',
    authAs: 'mentor',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
    // If you want to provide valid body for parseSnippet in your test harness:
    // body: { title: 'Example', content: '...' },
  },
  {
    name: 'Create a new snippet with invalid body => 400',
    route: '/snippet',
    method: 'POST',
    authAs: 'mentor',
    body: {}, // something that fails parseSnippet
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create a new snippet as non-mentor => 403',
    route: '/snippet',
    method: 'POST',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create a new snippet as unauthenticated => 401',
    route: '/snippet',
    method: 'POST',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 3) PATCH /snippet/:id => updateSnippet
  //    - Must be authenticated
  //    - Must be mentor
  //    - parseId => 400 if invalid
  //    - parseSnippet => 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Update snippet as mentor => 200',
    route: '/snippet/123',
    method: 'PATCH',
    authAs: 'mentor',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
    // body: { ... }, // provide valid snippet data for parseSnippet if desired
  },
  {
    name: 'Update snippet with invalid ID => 400',
    route: '/snippet/not-valid',
    method: 'PATCH',
    authAs: 'mentor',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update snippet with invalid body => 400',
    route: '/snippet/123',
    method: 'PATCH',
    authAs: 'mentor',
    body: {}, // fails parseSnippet
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update snippet as non-mentor => 403',
    route: '/snippet/123',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update snippet as unauth => 401',
    route: '/snippet/123',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 4) DELETE /snippet/:id => deleteSnippet
  //    - Must be authenticated
  //    - Must be mentor
  //    - parseId => 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Delete snippet as mentor => 200',
    route: '/snippet/999',
    method: 'DELETE',
    authAs: 'mentor',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete snippet with invalid ID => 400',
    route: '/snippet/bad-id',
    method: 'DELETE',
    authAs: 'mentor',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete snippet as non-mentor => 403',
    route: '/snippet/999',
    method: 'DELETE',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete snippet as unauth => 401',
    route: '/snippet/999',
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
]

export default tests
