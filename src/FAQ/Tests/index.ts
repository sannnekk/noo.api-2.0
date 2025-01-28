import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

// Generic schemas for success/error:
const SuccessSchema = z.object({}).passthrough()
const ErrorSchema = z.object({ error: z.string() }).passthrough()

const tests: RequestTest[] = [
  // --------------------------------------------------------------------------
  // 1) GET /faq          => getArticles()
  //    - Must be authenticated, but any role (student, teacher, admin) can access
  // --------------------------------------------------------------------------
  {
    name: 'Get all FAQ articles as teacher',
    route: '/faq',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get all FAQ articles as admin',
    route: '/faq',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get all FAQ articles as student',
    route: '/faq',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get all FAQ articles as unauthenticated user => 401',
    route: '/faq',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 2) GET /faq/article/:id   => getArticle()
  //    - Must be authenticated, any role allowed
  // --------------------------------------------------------------------------
  {
    name: 'Get single FAQ article as teacher',
    route: '/faq/article/1',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get single FAQ article as admin',
    route: '/faq/article/1',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get single FAQ article as student',
    route: '/faq/article/1',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get single FAQ article as unauthenticated => 401',
    route: '/faq/article/1',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Get single FAQ article with invalid ID => 400',
    route: '/faq/article/invalid-id',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 3) GET /faq/category/tree => getCategoryTree()
  //    - Must be authenticated (any role)
  // --------------------------------------------------------------------------
  {
    name: 'Get category tree as teacher',
    route: '/faq/category/tree',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get category tree as admin',
    route: '/faq/category/tree',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get category tree as student',
    route: '/faq/category/tree',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get category tree as unauthenticated => 401',
    route: '/faq/category/tree',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 4) GET /faq/category/tree/article => getTreeWithArticles()
  //    - Must be authenticated (any role)
  // --------------------------------------------------------------------------
  {
    name: 'Get category tree with articles as teacher',
    route: '/faq/category/tree/article',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get category tree with articles as admin',
    route: '/faq/category/tree/article',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get category tree with articles as student',
    route: '/faq/category/tree/article',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get category tree with articles as unauthenticated => 401',
    route: '/faq/category/tree/article',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 5) GET /faq/category/search => searchCategories()
  //    - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Search categories as teacher => 200',
    route: '/faq/category/search',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Search categories as admin => 200',
    route: '/faq/category/search',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Search categories as student => 403',
    route: '/faq/category/search',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Search categories as unauthenticated => 401',
    route: '/faq/category/search',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 6) POST /faq => createArticle()
  //    - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Create new FAQ article as teacher => 200',
    route: '/faq',
    method: 'POST',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Create new FAQ article as admin => 200',
    route: '/faq',
    method: 'POST',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Create new FAQ article as student => 403',
    route: '/faq',
    method: 'POST',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create new FAQ article as unauthenticated => 401',
    route: '/faq',
    method: 'POST',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 7) POST /faq/category => createCategory()
  //    - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Create new FAQ category as teacher => 200',
    route: '/faq/category',
    method: 'POST',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Create new FAQ category as admin => 200',
    route: '/faq/category',
    method: 'POST',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Create new FAQ category as student => 403',
    route: '/faq/category',
    method: 'POST',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create new FAQ category as unauth => 401',
    route: '/faq/category',
    method: 'POST',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 8) PATCH /faq/:id => updateFAQ()
  //    - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Update FAQ article as teacher => 200',
    route: '/faq/100',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update FAQ article as admin => 200',
    route: '/faq/100',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update FAQ article as student => 403',
    route: '/faq/100',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update FAQ article as unauth => 401',
    route: '/faq/100',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Update FAQ article with invalid ID => 400',
    route: '/faq/not-an-id',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 9) PATCH /faq/category/:id => updateCategory()
  //    - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Update FAQ category as teacher => 200',
    route: '/faq/category/11',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update FAQ category as admin => 200',
    route: '/faq/category/11',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update FAQ category as student => 403',
    route: '/faq/category/11',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update FAQ category as unauth => 401',
    route: '/faq/category/11',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Update FAQ category with invalid ID => 400',
    route: '/faq/category/bad-id',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 10) DELETE /faq/:id => deleteFAQ()
  //     - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Delete FAQ article as teacher => 200',
    route: '/faq/999',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete FAQ article as admin => 200',
    route: '/faq/999',
    method: 'DELETE',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete FAQ article as student => 403',
    route: '/faq/999',
    method: 'DELETE',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete FAQ article as unauth => 401',
    route: '/faq/999',
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Delete FAQ article with invalid ID => 400',
    route: '/faq/not-an-id',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 11) DELETE /faq/category/:id => deleteCategory()
  //     - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Delete FAQ category as teacher => 200',
    route: '/faq/category/55',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete FAQ category as admin => 200',
    route: '/faq/category/55',
    method: 'DELETE',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete FAQ category as student => 403',
    route: '/faq/category/55',
    method: 'DELETE',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete FAQ category as unauth => 401',
    route: '/faq/category/55',
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Delete FAQ category with invalid ID => 400',
    route: '/faq/category/not-an-id',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
]

export default tests
