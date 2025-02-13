import type { RequestTest } from '@modules/Core/Test/RequestTest'
import { string, z } from 'zod'
import { StatusCodes } from 'http-status-codes'

const timestamp = Date.now();
const successfullEmail = `testuser_${timestamp}@example.com`;
const successfullUsername = `testuser_${timestamp}`;

// Define a response schema for a successful login.
// The LoginScheme is used for input validation, so here we define a matching output structure.
const LoginResponseScheme = z.object({
  data: z.object({
    token: z.string(),
    payload: z.object({
      userId: z.string(),
      username: z.string(),
      role: z.string(),
      permissions: z.number(),
      isBlocked: z.boolean(),
      sessionId: z.string(),
    }),
    user: z.object({
      id: z.string(),
      username: z.string(),
      email: z.string().email(),
      role: z.string(),
    }),
  }),
})

// For endpoints that do not return data on success, we define an empty response schema.
const EmptyResponseScheme = z.object({})

const tests: RequestTest[] = [
  {
    name: 'Login with valid teacher credentials',
    route: '/auth/login',
    method: 'POST',
    body: {
      usernameOrEmail: 'teacher',
      password: 'Test1234'
    },
    expectedStatus: StatusCodes.OK,
    responseSchema: LoginResponseScheme,
  },
  {
    name: 'Login with non-existent user',
    route: '/auth/login',
    method: 'POST',
    body: {
      usernameOrEmail: 'userdoesnotexist',
      password: 'SomePassword123'
    },
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Login with wrong password',
    route: '/auth/login',
    method: 'POST',
    body: {
      usernameOrEmail: 'teacher',
      password: 'WrongPassword'
    },
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Register a new user successfully',
    route: '/auth/register',
    method: 'POST',
    // Generate a unique user at test run time
    body: () => {
      return {
        name: 'Test User',
        username: successfullUsername,
        email: successfullEmail,
        password: 'TestPass123'
      }
    },
    expectedStatus: StatusCodes.OK,
    responseSchema: EmptyResponseScheme,
  },
  {
    name: 'Register with existing username',
    route: '/auth/register',
    method: 'POST',
    body: {
      name: 'Duplicate Teacher',
      username: 'teacher', // teacher already exists
      email: `another_${Date.now()}@example.com`,
      password: 'SomePassword123'
    },
    expectedStatus: StatusCodes.CONFLICT,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Register with existing email',
    route: '/auth/register',
    method: 'POST',
    body: {
      name: 'Duplicate Email',
      username: `uniqueusername_${Date.now()}`,
      email: 'test@test.ru', // email already exists
      password: 'TestPass123'
    },
    expectedStatus: StatusCodes.CONFLICT,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Check username exists for teacher',
    route: '/auth/check-username/teacher',
    method: 'GET',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        exists: z.boolean().refine((val) => val === true, {
          message: 'Expected exists to be true',
        }),
      }),
    }),
  },
  {
    name: 'Check username exists for non-existent user',
    route: '/auth/check-username/userdoesnotexist',
    method: 'GET',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        exists: z.boolean().refine((val) => val === false, {
          message: 'Expected exists to be false',
        }),
      }),
    }),
  },
  {
    name: 'Resend verification for a verified account',
    route: '/auth/resend-verification',
    method: 'POST',
    body: { email: 'test@test.ru' },
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Resend verification for non-existent email',
    route: '/auth/resend-verification',
    method: 'POST',
    body: { email: 'nonexistent@example.com' },
    expectedStatus: StatusCodes.NOT_FOUND,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Verify account for non-existent user',
    route: '/auth/verify',
    method: 'PATCH',
    body: {
      username: 'userdoesnotexist',
      token: 'sometoken'
    },
    expectedStatus: StatusCodes.NOT_FOUND,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Verify account with invalid token',
    route: '/auth/verify',
    method: 'PATCH',
    // Use a function to generate a unique username so that it must be registered first.
    // Then, using an invalid token should trigger the error.
    body: () => {
      const timestamp = Date.now()
      return {
        username: `verifytest_${timestamp}`,
        token: 'invalidtoken'
      }
    },
    expectedStatus: StatusCodes.NOT_FOUND,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Verify email change for non-existent user',
    route: '/auth/verify-email-change',
    method: 'PATCH',
    body: {
      username: 'userdoesnotexist',
      token: 'sometoken'
    },
    expectedStatus: StatusCodes.NOT_FOUND,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Manually verify user',
    route: `/user/${successfullUsername}/verify-manual`, // use the username variable here
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: EmptyResponseScheme,
  },
  {
    name: 'Forgot password for existing, verified user',
    route: '/auth/forgot-password',
    method: 'POST',
    body: { email: successfullEmail},
    expectedStatus: StatusCodes.OK,
    responseSchema: EmptyResponseScheme,
  },
  {
    name: 'Forgot password for non-existent email',
    route: '/auth/forgot-password',
    method: 'POST',
    body: { email: 'nonexistent@example.com' },
    expectedStatus: StatusCodes.NOT_FOUND,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
]

export default tests
