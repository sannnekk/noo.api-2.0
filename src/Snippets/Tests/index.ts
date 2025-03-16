import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

// Generic success/error schemas:
const SuccessSchema = z.object({}).passthrough();
const ErrorSchema = z.object({ error: z.string() }).passthrough();

// Global variable to capture snippet ID.
let capturedSnippetId: string = '';

// --------------------------------------------------------------------------
// Tests for Snippet module
// --------------------------------------------------------------------------
const tests: RequestTest[] = [
  // 1) GET /snippet
  {
    name: 'Get all snippets as mentor => 200',
    route: '/snippet',
    method: 'GET',
    authAs: 'mentor',
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

  // 2) POST /snippet => createSnippet
  {
    name: 'Create a new snippet as mentor => 200',
    route: '/snippet',
    method: 'POST',
    authAs: 'mentor',
    body: {
      name: 'Example Snippet',
      content: { ops: [{ insert: 'This is snippet content.' }] },
      userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV'
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
    postTest: (response: any) => {
      capturedSnippetId = response.body.data.id;
      console.log('Captured snippet id:', capturedSnippetId);
    },
  } as RequestTest & { postTest?: (response: any) => void },
  {
    name: 'Create a new snippet with invalid body => 400',
    route: '/snippet',
    method: 'POST',
    authAs: 'mentor',
    body: {},
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

  // 3) PATCH /snippet/:id => updateSnippet
  {
    name: 'Update snippet as mentor => 200',
    get route() { return `/snippet/${capturedSnippetId}`; },
    method: 'PATCH',
    authAs: 'mentor',
    body: {
      name: 'Updated Snippet',
      content: { ops: [{ insert: 'Updated snippet content.' }] },
      userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV'
    },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
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
    body: {},
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
    name: 'Update snippet as unauthenticated => 401',
    route: '/snippet/123',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // 4) DELETE /snippet/:id => deleteSnippet
  {
    name: 'Delete snippet as mentor => 200',
    get route() { return `/snippet/${capturedSnippetId}`; },
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
    route: '/snippet/123',
    method: 'DELETE',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete snippet as unauthenticated => 401',
    route: '/snippet/123',
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
];

export default tests;
