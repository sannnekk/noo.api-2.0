import type { RequestTest } from '@modules/Core/Test/RequestTest'
import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'

// Minimal success schema for statistics response
const StatisticsResponseSchema = z.object({
  data: z.object({
    sections: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        entries: z.array(
          z.object({
            name: z.string(),
            description: z.string().optional(),
            value: z.number(),
            percentage: z.number().nullable().optional(),
            subEntries: z.array(
              z.object({
                name: z.string(),
                description: z.string().optional(),
                value: z.number(),
                percentage: z.number().nullable().optional(),
              })
            ).optional(),
          })
        ),
        plots: z.array(z.any()).optional(),
      })
    ),
  }),
}).passthrough()


// Generic error schema
const ErrorSchema = z.object({ error: z.string() }).passthrough()

// Valid body for the request (dates must be valid)
const validBody = {
  from: new Date('2023-01-01'),
  to: new Date('2023-12-31'),
  type: 'someWorkType', // optional
}

const tests: RequestTest[] = [
  // -----------------------------------------
  // 1) Teacher requests statistics => 200
  // -----------------------------------------
  {
    name: 'Teacher gets statistics => 200',
    route: '/statistics/teacher', // must match an existing teacher's username
    method: 'POST',
    authAs: 'teacher',
    body: validBody,
    expectedStatus: StatusCodes.OK,
    responseSchema: StatisticsResponseSchema,
  },

  // -----------------------------------------
  // 2) Mentor requests statistics => 200
  // -----------------------------------------
  {
    name: 'Mentor gets statistics => 200',
    route: '/statistics/mentor', // must match an existing mentor's username
    method: 'POST',
    authAs: 'mentor',
    body: validBody,
    expectedStatus: StatusCodes.OK,
    responseSchema: StatisticsResponseSchema,
  },

  // -----------------------------------------
  // 3) Student requests statistics => 200
  // -----------------------------------------
  {
    name: 'Student gets statistics => 200',
    route: '/statistics/student', // must match an existing student username
    method: 'POST',
    authAs: 'student',
    body: validBody,
    expectedStatus: StatusCodes.OK,
    responseSchema: StatisticsResponseSchema,
  },

  // -----------------------------------------
  // 4) Admin => WrongRoleError => 400
  // -----------------------------------------
  {
    name: 'Admin tries to get statistics => 400 WrongRoleError', // Forbidden as admin has no statistics
    route: '/statistics/admin', // existing admin username
    method: 'POST',
    authAs: 'admin',
    body: validBody,
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },

  // -----------------------------------------
  // 5) Non-existent user => 404
  // -----------------------------------------
  {
    name: 'Non-existent user => 404',
    route: '/statistics/unknownuser',
    method: 'POST',
    authAs: 'teacher',
    body: validBody,
    expectedStatus: StatusCodes.NOT_FOUND,
    responseSchema: ErrorSchema,
  },

  // -----------------------------------------
  // 6) Invalid slug => 400
  // -----------------------------------------
  {
    name: 'Invalid slug => 400',
    route: '/statistics/invalid%slug!',
    method: 'POST',
    authAs: 'teacher',
    body: validBody,
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // -----------------------------------------
  // 7) Invalid date => 400
  // -----------------------------------------
  {
    name: 'Invalid date => 400',
    route: '/statistics/teacheruser',
    method: 'POST',
    authAs: 'teacher',
    body: {
      from: 'not-a-date',
      to: new Date('2023-12-31'),
    },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // -----------------------------------------
  // 8) Unauthenticated => 401
  // -----------------------------------------
  {
    name: 'Unauthenticated => 401',
    route: '/statistics/teacheruser',
    method: 'POST',
    body: validBody,
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
]

export default tests
