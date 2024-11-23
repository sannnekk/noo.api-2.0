import { RequestTest } from '@modules/Core/Test/RequestTest'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'
import { BlogPostScheme } from '../Schemes/BlogPostScheme'
import { Pagination } from '@modules/Core/Data/Pagination'

const BlogPostCreation = (users: any, hasPoll = false) => ({
  title: 'Test blogpost ' + Date.now(),
  content: {
    ops: [
      {
        insert: 'Test content\n',
      },
      {
        insert: Math.random().toString(36).substring(7) + '\n',
      },
      {
        insert: '\n',
      },
    ],
  },
  poll: hasPoll ? {} : undefined,
})

const tests: RequestTest[] = [
  {
    name: 'Get paginated list of blogposts',
    route: '/blog',
    method: 'GET',
    query: new Pagination(1, 25).toQuery(),
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.array(BlogPostScheme).length(0),
      meta: z.object({
        total: z.number(),
      }),
    }),
  },
  {
    name: 'Get blogpost by non-ulid id',
    route: '/blog/123',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
  },
  {
    name: 'Get blogpost by ulid that does not exist',
    route: '/blog/00HZHJSWPQ8JCB0FGSYRWAD6TZ',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.NOT_FOUND,
  },
  {
    name: 'React to a post',
    route: '/blog/01HZHJSWPQ8JCB0FGSYRWAD6TZ/react/like',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.record(z.string()),
    }),
  },
  {
    name: 'React to the same post with another reaction',
    route: '/blog/01HZHJSWPQ8JCB0FGSYRWAD6TZ/react/sad',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.record(z.string()),
    }),
  },
  {
    name: 'React to a post with invalid reaction',
    route: '/blog/01HZHJSWPQ8JCB0FGSYRWAD6TZ/react/invalid',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.BAD_REQUEST,
  },
  {
    name: 'Create a blogpost as mentor',
    route: '/blog',
    method: 'POST',
    authAs: 'mentor',
    body: (users: any) => BlogPostCreation(users),
    expectedStatus: StatusCodes.FORBIDDEN,
  },
]

export default tests
