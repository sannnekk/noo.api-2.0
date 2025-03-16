import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

// Reusable schemas
const SuccessSchema = z.object({}).passthrough()
const ErrorSchema = z.object({ error: z.string() }).passthrough()

const tests: RequestTest[] = [
  // --------------------------------------------------------------------------
  // GET /poll/ => getPolls
  //   - Must be authenticated
  //   - Must be teacherOrAdmin => teacher|admin => 200, student => 403
  //   - unauth => 401
  // --------------------------------------------------------------------------
  {
    name: 'Get all polls as teacher => 200',
    route: '/poll/',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get all polls as admin => 200',
    route: '/poll/',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get all polls as student => 403',
    route: '/poll/',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get all polls unauthenticated => 401',
    route: '/poll/',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // GET /poll/question => getQuestions
  //   - Must be authenticated
  //   - Must be teacherOrAdmin => teacher|admin => 200, student => 403
  //   - unauth => 401
  // --------------------------------------------------------------------------
  {
    name: 'Get poll questions as teacher => 200',
    route: '/poll/question',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get poll questions as admin => 200',
    route: '/poll/question',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get poll questions as student => 403',
    route: '/poll/question',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get poll questions unauthenticated => 401',
    route: '/poll/question',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // GET /poll/:id => getPoll
  //   - Currently NO authentication check (commented out)
  //   - parseId => 400 if invalid
  //   - Otherwise => 200 for anyone (auth or not)
  // --------------------------------------------------------------------------
  {
    name: 'Get poll by invalid ID => 400',
    route: '/poll/not-an-id',
    method: 'GET',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  // If you restore the authentication check, add tests:
  // {
  //   name: 'Get poll by ID unauth => 401 (if the line is uncommented)',
  //   route: '/poll/123',
  //   method: 'GET',
  //   expectedStatus: StatusCodes.UNAUTHORIZED,
  //   responseSchema: ErrorSchema.optional(),
  // },

  // --------------------------------------------------------------------------
  // GET /poll/:id/info => getPollInfo
  //   - Must be authenticated (any role)
  //   - parseId => 400 if invalid
  //   - unauth => 401
  //   - success => 200
  // --------------------------------------------------------------------------
  {
    name: 'Get poll info as teacher => 200',
    route: '/poll/01J0TSSM28YZ0VPJBXXK9KP0T5/info',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get poll info as student => 200',
    route: '/poll/01J0TSSM28YZ0VPJBXXK9KP0T5/info',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get poll info with invalid ID => 400',
    route: '/poll/not-valid/info',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get poll info unauth => 401',
    route: '/poll/123/info',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // GET /poll/:pollId/user => searchWhoVoted
  //   - Must be authenticated
  //   - parseId => 400 if invalid
  //   - unauth => 401
  //   - success => 200
  // --------------------------------------------------------------------------
  {
    name: 'Search who voted as teacher => 200',
    route: '/poll/01J0TSSM28YZ0VPJBXXK9KP0T5/user',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Search who voted as admin => 200',
    route: '/poll/01J0TSSM28YZ0VPJBXXK9KP0T5/user',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Search who voted as student => 200',
    route: '/poll/01J0TSSM28YZ0VPJBXXK9KP0T5/user',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Search who voted with invalid pollId => 400',
    route: '/poll/invalid/user',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Search who voted unauth => 401',
    route: '/poll/111/user',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // GET /poll/:pollId/unregistered => searchWhoVotedUnregistered
  //   - Must be authenticated
  //   - parseId => 400 if invalid
  //   - unauth => 401
  //   - success => 200
  // --------------------------------------------------------------------------
  {
    name: 'Search who voted unregistered as teacher => 200',
    route: '/poll/01J0TSSM28YZ0VPJBXXK9KP0T5/unregistered',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Search who voted unregistered as admin => 200',
    route: '/poll/01J0TSSM28YZ0VPJBXXK9KP0T5/unregistered',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Search who voted unregistered as student => 200',
    route: '/poll/01J0TSSM28YZ0VPJBXXK9KP0T5/unregistered',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Search who voted unregistered with invalid pollId => 400',
    route: '/poll/not-valid/unregistered',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Search who voted unregistered unauth => 401',
    route: '/poll/222/unregistered',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // GET /poll/:pollId/user/:userId/answer => getAnswers
  //   - Must be authenticated
  //   - parseId => pollId => 400 if invalid
  //   - parseIdOrTelegramUsername => userId => 400 if truly invalid
  //   - unauth => 401
  //   - success => 200
  // --------------------------------------------------------------------------
  {
    name: 'Get answers as teacher => 200',
    route: '/poll/333/user/444/answer',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get answers as admin => 200',
    route: '/poll/333/user/444/answer',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get answers as student => 200',
    route: '/poll/333/user/444/answer',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get answers with invalid pollId => 400',
    route: '/poll/invalid/user/444/answer',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get answers with invalid userId => 400',
    route: '/poll/333/user/not-valid/answer',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get answers unauth => 401',
    route: '/poll/333/user/444/answer',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // PATCH /poll/answer/:id => editAnswer
  //   - Must be authenticated
  //   - Must be teacherOrAdmin
  //   - parseId => 400 if invalid
  //   - parsePollAnswer => 400 if invalid body
  // --------------------------------------------------------------------------
  {
    name: 'Edit poll answer as teacher => 200',
    route: '/poll/answer/123',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Edit poll answer as admin => 200',
    route: '/poll/answer/123',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Edit poll answer as student => 403',
    route: '/poll/answer/123',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Edit poll answer unauth => 401',
    route: '/poll/answer/123',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Edit poll answer with invalid ID => 400',
    route: '/poll/answer/not-an-id',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Edit poll answer with invalid body => 400',
    route: '/poll/answer/456',
    method: 'PATCH',
    authAs: 'teacher',
    body: {}, // or something invalid for parsePollAnswer
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // POST /poll/:id/answer => saveAnswers
  //   - Currently NO authentication required (commented out)
  //   - parseId => 400 if invalid
  //   - parsePollAnswers => 400 if invalid body
  //   - success => 200
  // --------------------------------------------------------------------------
  {
    name: 'Save answers with invalid poll ID => 400',
    route: '/poll/invalid/answer',
    method: 'POST',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Save answers with invalid body => 400',
    route: '/poll/111/answer',
    method: 'POST',
    body: {}, // or something invalid for parsePollAnswers
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  // If you uncomment the isAuthenticated line, add:
  // {
  //   name: 'Save answers unauth => 401 (if you re-enable authentication)',
  //   route: '/poll/111/answer',
  //   method: 'POST',
  //   expectedStatus: StatusCodes.UNAUTHORIZED,
  //   responseSchema: ErrorSchema.optional(),
  // },
]

export default tests
