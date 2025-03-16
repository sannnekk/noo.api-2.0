import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

// Generic success/error schemas
let capturedSubjectId: string = '';
const SuccessSchema = z.object({}).passthrough()
const ErrorSchema = z.object({ error: z.string() }).passthrough()

const tests: RequestTest[] = [
  // --------------------------------------------------------------------------
  // GET /subject => getSubjects
  //   - Must be authenticated => 200
  //   - Unauthenticated => 401
  // --------------------------------------------------------------------------
  {
    name: 'Get subjects as authenticated user => 200',
    route: '/subject',
    method: 'GET',
    authAs: 'teacher', // or any authenticated role
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get subjects as unauthenticated user => 401',
    route: '/subject',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // POST /subject => createSubject
  //   - Must be authenticated & admin => 200
  //   - If not admin => 403
  //   - Unauthenticated => 401
  //   - parseSubject => 400 if invalid body
  // --------------------------------------------------------------------------
  {
    name: 'Create subject as admin => 204',
    route: '/subject',
    method: 'POST',
    authAs: 'admin',
    body: { 
      name: 'New Subject', 
      color: '#FFFFFF' // valid color string
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
    postTest: (response: any) => {
      capturedSubjectId = response.body.data.id;
      console.log('Captured Subject ID:', capturedSubjectId);
    },
  } as RequestTest & { postTest?: (response: any) => void },
  {
    name: 'Create subject with invalid body => 400',
    route: '/subject',
    method: 'POST',
    authAs: 'admin',
    body: {}, // or something invalid
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create subject as teacher => 403',
    route: '/subject',
    method: 'POST',
    authAs: 'teacher',
    body: { name: 'Another Subject' },
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create subject as unauthenticated => 401',
    route: '/subject',
    method: 'POST',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // PATCH /subject/:id => updateSubject
  //   - Must be authenticated & admin
  //   - parseId => 400 if invalid
  //   - parseSubject => 400 if invalid body
  // --------------------------------------------------------------------------
  {
    name: 'Update subject as admin => 204',
    route: '/subject/01JP827RKQVZN4GY643R03SHT0',
    method: 'PATCH',
    authAs: 'admin',
    body: { 
      name: 'Updated Subject',
      color: '#000000'  // Added valid color as required by the schema
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update subject with invalid ID => 400',
    route: '/subject/not-valid',
    method: 'PATCH',
    authAs: 'admin',
    body: { name: 'Invalid ID Subject' },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update subject with invalid body => 400',
    route: '/subject/123',
    method: 'PATCH',
    authAs: 'admin',
    body: {}, // or something parseSubject rejects
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update subject as teacher => 403',
    route: '/subject/123',
    method: 'PATCH',
    authAs: 'teacher',
    body: { name: 'No Access' },
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update subject as unauthenticated => 401',
    route: '/subject/123',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // DELETE /subject/:id => deleteSubject
  //   - Must be authenticated & admin
  //   - parseId => 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Delete subject as admin => 204',
    route: '/subject/01JP8242YA493TV5E005H0D358',
    method: 'DELETE',
    authAs: 'admin',
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete subject with invalid ID => 400',
    route: '/subject/not-an-id',
    method: 'DELETE',
    authAs: 'admin',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete subject as teacher => 403',
    route: '/subject/999',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete subject as unauthenticated => 401',
    route: '/subject/999',
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
]

export default tests
