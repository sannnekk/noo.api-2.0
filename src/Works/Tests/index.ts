import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

// Generic success/error schemas:
const SuccessSchema = z.object({}).passthrough()
const ErrorSchema = z.object({ error: z.string() }).passthrough()

const tests: RequestTest[] = [
  // --------------------------------------------------------------------------
  // 1) GET /work/ => getWorks
  //    - Must be authenticated
  //    - Must be teacherOrAdmin => teacher|admin => 200, student => 403
  //    - unauth => 401
  // --------------------------------------------------------------------------
  {
    name: 'Get all works as teacher => 200',
    route: '/work/',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get all works as admin => 200',
    route: '/work/',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get all works as student => 403',
    route: '/work/',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get all works unauthenticated => 401',
    route: '/work/',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Get all works with invalid pagination => 400',
    route: '/work/?page=NaN',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 2) GET /work/:slug => getWorkBySlug
  //    - Must be authenticated
  //    - parseSlug => 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Get a specific work by slug as teacher => 200',
    route: '/work/example-slug',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get a specific work by slug as student => 200',
    route: '/work/example-slug',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get a specific work by invalid slug => 400',
    route: '/work/???',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get a specific work by slug unauth => 401',
    route: '/work/example-slug',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 3) GET /work/:id/related-materials => getWorkRelatedMaterials
  //    - Must be authenticated
  //    - parseId => 400 if invalid
  //    - parsePagination => 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Get related materials for a work as admin => 200',
    route: '/work/123/related-materials',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get related materials for a work as student => 200',
    route: '/work/123/related-materials',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get related materials with invalid ID => 400',
    route: '/work/not-an-id/related-materials',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get related materials with invalid pagination => 400',
    route: '/work/123/related-materials?page=NaN',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get related materials unauth => 401',
    route: '/work/123/related-materials',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 4) POST /work/ => createWork
  //    - Must be authenticated
  //    - Must be teacher => else 403
  //    - parseCreation => 400 if invalid body
  // --------------------------------------------------------------------------
  {
    name: 'Create a new work as teacher => 200',
    route: '/work/',
    method: 'POST',
    authAs: 'teacher',
    body: {
      title: 'New Work',
      description: 'Some description...',
    }, // valid data
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Create a new work with invalid body => 400',
    route: '/work/',
    method: 'POST',
    authAs: 'teacher',
    body: {}, // invalid for parseCreation
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create a new work as admin => 403 (requires teacher)',
    route: '/work/',
    method: 'POST',
    authAs: 'admin',
    body: { title: 'Forbidden' },
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create a new work as unauth => 401',
    route: '/work/',
    method: 'POST',
    body: { title: 'No Auth' },
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 5) POST /work/copy/:slug => copyWork
  //    - Must be authenticated
  //    - Must be teacher => else 403
  //    - parseSlug => 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Copy a work as teacher => 200',
    route: '/work/copy/some-work-slug',
    method: 'POST',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Copy a work with invalid slug => 400',
    route: '/work/copy/???',
    method: 'POST',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Copy a work as admin => 403 (requires teacher)',
    route: '/work/copy/some-work-slug',
    method: 'POST',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Copy a work as unauth => 401',
    route: '/work/copy/some-work-slug',
    method: 'POST',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 6) PATCH /work/:id => updateWork
  //    - Must be authenticated
  //    - Must be teacher => else 403
  //    - parseId => 400 if invalid
  //    - parseUpdate => 400 if invalid body
  // --------------------------------------------------------------------------
  {
    name: 'Update work as teacher => 200',
    route: '/work/999',
    method: 'PATCH',
    authAs: 'teacher',
    body: {
      title: 'Updated Title',
    },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update work with invalid body => 400',
    route: '/work/999',
    method: 'PATCH',
    authAs: 'teacher',
    body: {}, // parseUpdate likely fails
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update work with invalid ID => 400',
    route: '/work/not-an-id',
    method: 'PATCH',
    authAs: 'teacher',
    body: { title: 'Won’t Work' },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update work as admin => 403 (requires teacher)',
    route: '/work/999',
    method: 'PATCH',
    authAs: 'admin',
    body: { title: 'Forbidden' },
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update work as unauth => 401',
    route: '/work/999',
    method: 'PATCH',
    body: { title: 'No Auth' },
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 7) DELETE /work/:id => deleteWork
  //    - Must be authenticated
  //    - Must be teacher => else 403
  //    - parseId => 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Delete a work as teacher => 200',
    route: '/work/999',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete a work with invalid ID => 400',
    route: '/work/not-valid',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete a work as admin => 403 (requires teacher)',
    route: '/work/999',
    method: 'DELETE',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete a work as unauth => 401',
    route: '/work/999',
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
]

export default tests
