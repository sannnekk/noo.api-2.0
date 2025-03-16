import type { RequestTest } from '@modules/Core/Test/RequestTest'
import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'

// Generic schemas for success and error responses:
const SuccessSchema = z.object({}).passthrough();
const ErrorSchema = z.object({ error: z.string() }).passthrough();

// -------------------------------
// Specific response schemas
// -------------------------------

// Version endpoint returns a version string.
const VersionResponseSchema = z.object({
  data: z.string(),
}).passthrough();

// Changelog: assuming an array of changelog items with at least a version field.
const ChangelogItemSchema = z.object({
  version: z.string(),
  // Add other fields if needed.
}).passthrough();

const ChangelogResponseSchema = z.object({
  data: z.array(ChangelogItemSchema),
}).passthrough();

// Single changelog item response.
const ChangelogItemResponseSchema = z.object({
  data: ChangelogItemSchema,
}).passthrough();

// Healthcheck endpoint returns an array of HealthCheckResult.
const HealthcheckResponseSchema = z.object({
  data: z.array(z.object({
    label: z.string(),
    status: z.enum(['ok', 'error', 'warning']),
  }).passthrough()),
}).passthrough();

// Heapdump endpoint returns an object with a path string.
const HeapdumpResponseSchema = z.object({
  data: z.object({
    path: z.string(),
  }),
}).passthrough();

// -------------------------------
// Test suite for Platform module endpoints
// -------------------------------
const tests: RequestTest[] = [
  // GET /platform/version
  {
    name: 'Get platform version as teacher',
    route: '/platform/version',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: VersionResponseSchema,
  },
  {
    name: 'Get platform version as unauthenticated => 401',
    route: '/platform/version',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // GET /platform/changelog
  {
    name: 'Get platform changelog as teacher',
    route: '/platform/changelog',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: ChangelogResponseSchema,
  },
  {
    name: 'Get platform changelog as admin',
    route: '/platform/changelog',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: ChangelogResponseSchema,
  },
  {
    name: 'Get platform changelog as student => 403',
    route: '/platform/changelog',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get platform changelog as unauthenticated => 401',
    route: '/platform/changelog',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // GET /platform/changelog/:version
  {
    name: 'Get platform changelog for a valid version as teacher',
    route: '/platform/changelog/1.0.0', // Adjust the version if needed.
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: ChangelogItemResponseSchema,
  },
  {
    name: 'Get platform changelog for an invalid version format => 400',
    route: '/platform/changelog/invalid-version',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get platform changelog for a non-existent version as teacher => 404',
    route: '/platform/changelog/9.9.9', // Assuming this version doesn't exist.
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.NOT_FOUND,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get platform changelog for a version as unauthenticated => 401',
    route: '/platform/changelog/1.0.0',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // GET /platform/healthcheck
  {
    name: 'Get platform healthcheck as teacher',
    route: '/platform/healthcheck',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: HealthcheckResponseSchema,
  },
  {
    name: 'Get platform healthcheck as admin',
    route: '/platform/healthcheck',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: HealthcheckResponseSchema,
  },
  {
    name: 'Get platform healthcheck as student => 403',
    route: '/platform/healthcheck',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get platform healthcheck as unauthenticated => 401',
    route: '/platform/healthcheck',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // GET /platform/heapdump
  {
    name: 'Get platform heapdump as teacher',
    route: '/platform/heapdump',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: HeapdumpResponseSchema,
  },
  {
    name: 'Get platform heapdump as admin',
    route: '/platform/heapdump',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: HeapdumpResponseSchema,
  },
  {
    name: 'Get platform heapdump as student => 403',
    route: '/platform/heapdump',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get platform heapdump as unauthenticated => 401',
    route: '/platform/heapdump',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
]

export default tests;
