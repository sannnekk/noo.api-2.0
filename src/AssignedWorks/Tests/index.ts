import { Pagination } from '@modules/Core/Data/Pagination'
import type { RequestTest } from '@modules/Core/Test/RequestTest'
import { z } from 'zod'
import { AssignedWorkScheme } from '../Schemes/AssignedWorkScheme'
import { StatusCodes } from 'http-status-codes'

const tests: RequestTest[] = [
  {
    name: 'Get paginated list of assigned works',
    route: '/assigned-work',
    method: 'GET',
    authAs: 'admin',
    query: new Pagination(1, 25).toQuery(),
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.array(AssignedWorkScheme).length(0),
      meta: z.object({
        total: z.number(),
      }),
    }),
  },
  {
    name: 'Get assigned work by non-ulid id',
    route: '/assigned-work/123',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Get assigned work by ulid but from another user as student',
    route: '/assigned-work/01J1VFAVTPC9140ECA738SS1CH',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Get assigned work by ulid but from another user as mentor',
    route: '/assigned-work/01J1VFAVTPC9140ECA738SS1CH',
    method: 'GET',
    authAs: 'mentor',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Get assigned work by ulid',
    route: '/assigned-work/01J1VFAVTPC9140ECA738SS1CH',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: AssignedWorkScheme,
    }),
  },
  {
    name: 'Get assigned work by ulid that does not exist',
    route: '/assigned-work/00J1VFAVTPC9140ECA739SS1CH',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.NOT_FOUND,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Get or create assigned work by material slug for a student not in this course',
    route: '/assigned-work/e258b663-4e62-4966-92ad-4f67f8bc1987',
    method: 'POST',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
  },
  {
    name: 'Add student to course',
    route:
      '/course/01J55NXVTP856BHBC4GGYZYZ48-godovoi-kurs-ili-khimiya-ege-ili-dima/add-students',
    method: 'PATCH',
    authAs: 'teacher',
    body: (users: any) => ({
      studentIds: [users.student.id],
    }),
    expectedStatus: StatusCodes.NO_CONTENT,
  },
  {
    name: 'Get or create assigned work by material slug for a student in this course',
    route: '/assigned-work/e258b663-4e62-4966-92ad-4f67f8bc1987',
    method: 'POST',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        link: z.string().min(1),
      }),
    }),
  },
  {
    name: 'Get progress of the work that does not exist',
    route: '/assigned-work/progress/00J1VFAVTPC9140ECA739SS1CH',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.NOT_FOUND,
  },
  {
    name: 'Get progress of the work by ulid',
    route: '/assigned-work/progress/01J1VFAVTPC9140ECA738SS1CH',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        progress: z.number(),
      }),
    }),
  },
]

export default tests
