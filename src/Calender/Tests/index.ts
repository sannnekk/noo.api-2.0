import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

const tests: RequestTest[] = [
  // --------------------------------------------------------------------------
  // GET /platform/version
  // --------------------------------------------------------------------------
  {
    name: 'Get platform version as authenticated user (admin)',
    route: '/platform/version',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        version: z.string(),
      }),
    }),
  },
  {
    name: 'Get platform version as authenticated user (teacher)',
    route: '/platform/version',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        version: z.string(),
      }),
    }),
  },
  {
    name: 'Get platform version as authenticated user (student)',
    route: '/platform/version',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        version: z.string(),
      }),
    }),
  },
  {
    name: 'Get platform version as unauthenticated user',
    route: '/platform/version',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: z.object({
      error: z.string().optional(),
    }),
  },

  // --------------------------------------------------------------------------
  // GET /platform/changelog
  // --------------------------------------------------------------------------
  {
    name: 'Get platform changelog as admin',
    route: '/platform/changelog',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.array(
        z.object({
          version: z.string(),
          changes: z.array(z.string()),
        })
      ),
    }),
  },
  {
    name: 'Get platform changelog as teacher',
    route: '/platform/changelog',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.array(
        z.object({
          version: z.string(),
          changes: z.array(z.string()),
        })
      ),
    }),
  },
  {
    name: 'Get platform changelog as student',
    route: '/platform/changelog',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Get platform changelog as unauthenticated user',
    route: '/platform/changelog',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: z.object({
      error: z.string().optional(),
    }),
  },

  // --------------------------------------------------------------------------
  // GET /platform/changelog/:version
  // --------------------------------------------------------------------------
  {
    name: 'Get platform changelog for specific version (valid) as admin',
    route: '/platform/changelog/1.0.0',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        version: z.string(),
        changes: z.array(z.string()),
      }),
    }),
  },
  {
    name: 'Get platform changelog for specific version (valid) as teacher',
    route: '/platform/changelog/1.0.0',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        version: z.string(),
        changes: z.array(z.string()),
      }),
    }),
  },
  {
    name: 'Get platform changelog for invalid version format',
    route: '/platform/changelog/invalid-version',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Get platform changelog for specific version as student',
    route: '/platform/changelog/1.0.0',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Get platform changelog for specific version as unauthenticated user',
    route: '/platform/changelog/1.0.0',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: z.object({
      error: z.string().optional(),
    }),
  },

  // --------------------------------------------------------------------------
  // GET /platform/healthcheck
  // --------------------------------------------------------------------------
  {
    name: 'Get platform healthcheck as admin',
    route: '/platform/healthcheck',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        status: z.string(),
        uptime: z.number(),
        memoryUsage: z.object({
          rss: z.number(),
          heapTotal: z.number(),
          heapUsed: z.number(),
          external: z.number(),
        }),
      }),
    }),
  },
  {
    name: 'Get platform healthcheck as teacher',
    route: '/platform/healthcheck',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        status: z.string(),
        uptime: z.number(),
        memoryUsage: z.object({
          rss: z.number(),
          heapTotal: z.number(),
          heapUsed: z.number(),
          external: z.number(),
        }),
      }),
    }),
  },
  {
    name: 'Get platform healthcheck as student',
    route: '/platform/healthcheck',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Get platform healthcheck as unauthenticated user',
    route: '/platform/healthcheck',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: z.object({
      error: z.string().optional(),
    }),
  },

  // --------------------------------------------------------------------------
  // GET /platform/heapdump
  // --------------------------------------------------------------------------
  {
    name: 'Generate heapdump as admin',
    route: '/platform/heapdump',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        path: z.string(),
      }),
    }),
  },
  {
    name: 'Generate heapdump as teacher',
    route: '/platform/heapdump',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        path: z.string(),
      }),
    }),
  },
  {
    name: 'Generate heapdump as student',
    route: '/platform/heapdump',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Generate heapdump as unauthenticated user',
    route: '/platform/heapdump',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: z.object({
      error: z.string().optional(),
    }),
  },
]

export default tests
