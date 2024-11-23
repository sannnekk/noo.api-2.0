import { RequestTest } from '@modules/Core/Test/RequestTest'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

const moduleTests: RequestTest[] = [
  {
    name: 'Check if the username that exists is not available',
    route: '/auth/check-username/admin',
    method: 'GET',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        exists: z.literal(true),
      }),
    }),
  },
  {
    name: 'Check if the username that does not exist is available',
    route: '/auth/check-username/usern1234563456',
    method: 'GET',
    expectedStatus: StatusCodes.OK,
    responseSchema: z.object({
      data: z.object({
        exists: z.literal(false),
      }),
    }),
  },
  {
    name: 'Register a new user with invalid email',
    route: '/auth/register',
    method: 'POST',
    body: {
      username: 'newuser',
      email: 'invalidemail',
      password: 'Password123',
      name: 'New User',
    },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Register a new user with invalid username',
    route: '/auth/register',
    method: 'POST',
    body: {
      username: 'new user',
      email: 'example@dog.com',
      password: 'Password123',
      name: 'New User',
    },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Register a new user with invalid password',
    route: '/auth/register',
    method: 'POST',
    body: {
      username: 'newuser',
      email: 'example@dog.com',
      password: 'password',
      name: 'New User',
    },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: z.object({
      error: z.string(),
    }),
  },
  {
    name: 'Register a new user with name containing ё',
    route: '/auth/register',
    method: 'POST',
    body: {
      username: 'newuser',
      email: 'example@dog.com',
      password: 'Password123',
      name: 'Ёжик',
    },
    expectedStatus: StatusCodes.NO_CONTENT,
  },
  {
    name: 'Register a new user with existing username',
    route: '/auth/register',
    method: 'POST',
    body: {
      username: 'newuser',
      email: 'example@dog.com',
      password: 'Password123',
      name: 'New User',
    },
    expectedStatus: StatusCodes.CONFLICT,
  },
  {
    name: 'Register a new user with existing email',
    route: '/auth/register',
    method: 'POST',
    body: {
      username: 'newuser123',
      email: 'metpravda@gmail.com',
      password: 'Password123',
      name: 'New User',
    },
    expectedStatus: StatusCodes.CONFLICT,
  },
  {
    name: 'Verify the user with invalid token',
    route: '/auth/verify',
    method: 'PATCH',
    body: {
      username: 'newuser',
      token: 'invalid_token',
    },
    expectedStatus: StatusCodes.BAD_REQUEST,
  },
  {
    name: 'Verify the user with valid token',
    route: '/auth/verify',
    method: 'PATCH',
    body: {
      username: 'newuser',
      token: 'valid_token',
    },
    expectedStatus: StatusCodes.NO_CONTENT,
  },
  {
    name: 'Verify the user with valid token but user does not exist',
    route: '/auth/verify',
    method: 'PATCH',
    body: {
      username: 'unknownuser',
      token: 'valid_token',
    },
    expectedStatus: StatusCodes.NOT_FOUND,
  },
  {
    name: 'Resend verification email to the user with invalid email',
    route: '/auth/resend-verification',
    method: 'POST',
    body: {
      email: 'invalidemail',
    },
    expectedStatus: StatusCodes.BAD_REQUEST,
  },
  {
    name: 'Resend verification email to the verified user',
    route: '/auth/resend-verification',
    method: 'POST',
    body: {
      email: 'metpravda@gmail.com',
    },
    expectedStatus: StatusCodes.BAD_REQUEST,
  },
  {
    name: 'Resend verification email to the non-existing user',
    route: '/auth/resend-verification',
    method: 'POST',
    body: {
      email: 'example123@dogs.ua',
    },
    expectedStatus: StatusCodes.NOT_FOUND,
  },
]

export default moduleTests
