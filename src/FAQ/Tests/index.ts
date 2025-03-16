import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

let capturedFAQArticleId: string = '' // Used to capture the ID of a created FAQ article
let capturedFAQCategoryId: string = '' // Used to capture the ID of a created FAQ category
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
    route: '/faq/article/01J5EYHHSM2Y4RN2HVZ061SR0H',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get single FAQ article as admin',
    route: '/faq/article/01J5EYHHSM2Y4RN2HVZ061SR0H',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get single FAQ article as student',
    route: '/faq/article/01J5EYHHSM2Y4RN2HVZ061SR0H',
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
  // 6) POST /faq/category => createCategory()
  //    - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Create new FAQ category as teacher => 200',
    route: '/faq/category',
    method: 'POST',
    authAs: 'teacher',
    body: {
      name: 'Test FAQ Category',
      order: 1,
      parentCategory: null,
    },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
    postTest: (response: any) => {
      capturedFAQCategoryId = response.body.data.id;
    },
  } as RequestTest & { postTest?: (response: any) => void },
  {
    name: 'Create new FAQ category as admin => 200',
    route: '/faq/category',
    method: 'POST',
    authAs: 'admin',
    body: {
      name: 'Test FAQ Category by Admin',
      order: 1,
      parentCategory: null,
    },
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
  // 7) POST /faq => createArticle()
  //    - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Create new FAQ article as teacher => 200',
    route: '/faq',
    method: 'POST',
    authAs: 'teacher',
    body: {
      order: 1,
      for: ['all'],
      title: 'Test FAQ Article',
      content: { ops: [{ insert: 'This is a test FAQ article content.' }] },
      category: { id: '01JP7R7SVCY9RDNZBRPCZ3Z0GP' },
    },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
    postTest: (response: any) => {
      capturedFAQArticleId = response.body.data.id;
      capturedFAQCategoryId = response.body.data.category.id;
      console.log('Captured FAQ Article ID:', capturedFAQArticleId);
      if (!capturedFAQArticleId) {
        throw new Error('FAQ Article ID was not captured!');
      }
    },    
  } as RequestTest & { postTest?: (response: any) => void },  
  {
    name: 'Create new FAQ article as admin => 200',
    route: '/faq',
    method: 'POST',
    authAs: 'admin',
    body: {
      order: 1,
      for: ['all'],
      title: 'Test FAQ Article by Admin',
      content: { ops: [{ insert: 'This is a test FAQ article content created by admin.' }] },
      category: { id: '01JP7R7SVCY9RDNZBRPCZ3Z0GP' },
    },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema
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
  // 8) PATCH /faq/:id => updateFAQ()
  //    - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Update FAQ article as teacher => 204',
    route: '/faq/01J5EYHHSM2Y4RN2HVZ061SR0H',
    method: 'PATCH',
    authAs: 'teacher',
    body: {
      order: 0,
      for: ['all'],
      title: 'Updated FAQ Article',
      content: { ops: [{ insert: 'Updated content.' }] },
      category: { id: '01J5EYBMHZR4F9CTB1GKKW40FQ' },
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update FAQ article as admin => 204',
    route: '/faq/01J5EYHHSM2Y4RN2HVZ061SR0H',
    method: 'PATCH',
    authAs: 'admin',
    body: {
      order: 0,
      for: ['all'],
      title: 'Updated FAQ Article',
      content: { ops: [{ insert: 'Updated content.' }] },
      category: { id: '01J5EYBMHZR4F9CTB1GKKW40FQ' },
    },
    expectedStatus: StatusCodes.NO_CONTENT,
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
    name: 'Update FAQ category as teacher => 204',
    route: '/faq/category/01J5EYBMHZR4F9CTB1GKKW40FQ',
    method: 'PATCH',
    authAs: 'teacher',
    body: {
      name: 'Updated FAQ Category',
      order: 2,
      parentCategory: null,
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update FAQ category as admin => 204',
    route: '/faq/category/01J5EYBMHZR4F9CTB1GKKW40FQ',
    method: 'PATCH',
    authAs: 'admin',
    body: {
      name: 'Updated FAQ Category',
      order: 2,
      parentCategory: null,
    },
    expectedStatus: StatusCodes.NO_CONTENT,
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
    get route() { return `/faq/${capturedFAQArticleId}` }, // Use the captured ID from the POST test
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete FAQ article as admin => 200',
    get route() { return `/faq/${capturedFAQArticleId}` }, // Use the captured ID from the POST test
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
    route: '/faq/category/01JP7R7SVCY9RDNZBRPCZ3Z0GP',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete FAQ category as admin => 200',
    route: '/faq/category/01JP7R7SVCY9RDNZBRPCZ3Z0GP',
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
