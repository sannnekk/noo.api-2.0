import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

// Generic schemas for success & error responses
const SuccessSchema = z.object({}).passthrough()
const ErrorSchema = z.object({ error: z.string() }).passthrough()

const tests: RequestTest[] = [
  {
    name: 'Get statistics with valid username & body (authenticated) => 200',
    route: '/statistics/johndoe',
    method: 'POST',
    authAs: 'teacher', // or any authenticated role
    body: {
      fromDate: '2022-01-01',
      toDate: '2022-12-31',
    },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get statistics as unauthenticated user => 401',
    route: '/statistics/johndoe',
    method: 'POST',
    body: {
      fromDate: '2022-01-01',
      toDate: '2022-12-31',
    },
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Get statistics with invalid username => 400',
    route: '/statistics/???',
    method: 'POST',
    authAs: 'teacher',
    body: {
      fromDate: '2022-01-01',
      toDate: '2022-12-31',
    },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get statistics with invalid body => 400',
    route: '/statistics/johndoe',
    method: 'POST',
    authAs: 'teacher',
    body: {
      fromDate: 'not-a-date', // or missing required fields
    },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
]

export default tests
