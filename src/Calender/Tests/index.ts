import type { RequestTest } from '@modules/Core/Test/RequestTest'
import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import { CalenderEventVisibilityScheme } from '../Schemes/CalenderEventVisibilityScheme'

// Global variable to capture a created calendar event ID
let capturedCalendarEventId = ''

// Base valid event payload
const validEvent = {
  title: 'Team Meeting',
  description: 'Monthly sync-up',
  date: new Date().toISOString(),
  visibility: 'all',
}

// Schema for a successful creation response
const CalendarEventResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    visibility: CalenderEventVisibilityScheme,
  }),
  meta: z.any().nullable().optional(),
})

// Schema for a successful GET response (with pagination)
const GetCalendarEventsResponseSchema = z.object({
  data: z.array(z.object({}).passthrough()),
  meta: z
    .object({
      page: z.number().optional(),
      perPage: z.number().optional(),
      total: z.number().optional(),
    })
    .optional()
    .nullable(),
}).passthrough()

const tests: RequestTest[] = [
  // -------------------------------
  // POST /calender tests
  // -------------------------------
  {
    name: 'Create event with valid payload (authenticated)',
    route: '/calender',
    method: 'POST',
    body: {
      title: 'Team Meeting',
      description: 'Monthly sync-up',
      date: new Date().toISOString(),
      visibility: 'all',
    },
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: CalendarEventResponseSchema,
  
    // The "response" callback now assumes the parameter is already the parsed JSON body
    response: (data: any) => {
      // Access `data` directly, instead of `data.body`
      capturedCalendarEventId = data.data.id
      console.log('Captured calendar event id:', capturedCalendarEventId)
    },
  },
  {
    name: 'Fail to create event when unauthenticated',
    route: '/calender',
    method: 'POST',
    body: validEvent,
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: z.object({ error: z.string() }),
  },
  {
    name: 'Fail to create event with missing title',
    route: '/calender',
    method: 'POST',
    body: {
      description: 'No title provided',
      date: new Date().toISOString(),
      visibility: 'all',
    },
    authAs: 'student',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: z.object({ error: z.string() }),
  },
  {
    name: 'Fail to create event with invalid visibility value',
    route: '/calender',
    method: 'POST',
    body: {
      title: 'Event with invalid visibility',
      description: 'Visibility not allowed',
      date: new Date().toISOString(),
      visibility: 'everyone', // invalid value
    },
    authAs: 'student',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: z.object({ error: z.string() }),
  },
  {
    name: 'Fail to create event with title too long',
    route: '/calender',
    method: 'POST',
    body: {
      title: 'A'.repeat(256), // exceeds length limit
      description: 'Title length exceeds limit',
      date: new Date().toISOString(),
      visibility: 'all',
    },
    authAs: 'student',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: z.object({ error: z.string() }),
  },
  {
    name: 'Fail to create event with missing date field',
    route: '/calender',
    method: 'POST',
    body: {
      title: 'Event without date',
      description: 'Date is missing',
      visibility: 'all',
    },
    authAs: 'student',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: z.object({ error: z.string() }),
  },

  // -------------------------------
  // GET /calender tests (with pagination)
  // -------------------------------
  {
    name: 'Get calendar events with valid pagination (authenticated)',
    route: '/calender',
    method: 'GET',
    query: {
      page: '1',
      limit: '10',
      filter: { username: 'teacher' },
    },
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: GetCalendarEventsResponseSchema,
  },
  {
    name: 'Fail to get calendar events when unauthenticated',
    route: '/calender',
    method: 'GET',
    query: {
      page: '1',
      limit: '10',
      filter: { username: 'student' },
    },
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: z.object({ error: z.string() }),
  },
  {
    name: 'Fail to get calendar events with invalid pagination query',
    route: '/calender',
    method: 'GET',
    query: {
      page: 'abc',
      limit: 'def',
      filter: { username: 'student' },
    },
    authAs: 'student',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: z.object({ error: z.string() }),
  },

  // -------------------------------
  // GET /calender tests (role-based)
  // -------------------------------
  {
    name: "Student cannot get another student's calendar events",
    route: '/calender',
    method: 'GET',
    query: {
      page: '1',
      limit: '10',
      filter: { username: 'otherstudent' },
    },
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: z.object({ error: z.string() }),
  },
  {
    name: 'Teacher can get student calendar events',
    route: '/calender',
    method: 'GET',
    query: {
      page: '1',
      limit: '10',
      filter: { username: 'teacher' },
    },
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: GetCalendarEventsResponseSchema,
  },

  // -------------------------------
  // DELETE /calender tests
  // -------------------------------
  {
    name: 'Delete calendar event successfully (authenticated, owner)',
    get route() {
      return `/calender/${capturedCalendarEventId}`
    },
    method: 'DELETE',
    authAs: 'student',
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: z.object({}),
  },
  {
    name: 'Fail to delete calendar event when event not found',
    route: '/calender/01HMC2PA3251RT43WWRYZSHHQ7',
    method: 'DELETE',
    authAs: 'student',
    expectedStatus: StatusCodes.NOT_FOUND,
    responseSchema: z.object({ error: z.string() }),
  },
  {
    name: 'Fail to delete calendar event when not owner',
    route: '/calender/01HTJFN4XWFEPW7X3X4NZ7XM3R',
    method: 'DELETE',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: z.object({ error: z.string() }),
  },
  {
    name: 'Fail to delete calendar event when unauthenticated',
    get route() {
      return `/calender/01HTJFN4XWFEPW7X3X4NZ7XM3R`
    },
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: z.object({ error: z.string() }),
  },
]

export default tests
