import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

// Generic success/error schemas:
const SuccessSchema = z.object({}).passthrough()
const ErrorSchema = z.object({
  error: z.string(),
}).passthrough()

const tests: RequestTest[] = [
  // --------------------------------------------------------------------------
  // 1) GET /notification/read => getAll()
  //    - Must be authenticated
  // --------------------------------------------------------------------------
  {
    name: 'Get read notifications as an authenticated user (student)',
    route: '/notification/read',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get read notifications as an authenticated user (teacher)',
    route: '/notification/read',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get read notifications unauthenticated => 401',
    route: '/notification/read',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 2) GET /notification/unread => getUnread()
  //    - Must be authenticated
  // --------------------------------------------------------------------------
  {
    name: 'Get unread notifications as an authenticated user (student)',
    route: '/notification/unread',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get unread notifications as an authenticated user (teacher)',
    route: '/notification/unread',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get unread notifications unauthenticated => 401',
    route: '/notification/unread',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 3) GET /notification/unread-count => getUnreadCount()
  //    - Must be authenticated
  // --------------------------------------------------------------------------
  {
    name: 'Get unread notifications count as an authenticated user (student)',
    route: '/notification/unread-count',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get unread notifications count as an authenticated user (teacher)',
    route: '/notification/unread-count',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get unread notifications count unauthenticated => 401',
    route: '/notification/unread-count',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 4) PATCH /notification/:id/mark-as-read => markAsRead()
  //    - Must be authenticated
  //    - parseId => could be 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Mark a notification as read as an authenticated user (student)',
    route: '/notification/01HZHJSWPQ8JCB0FGSYRWAD6TZ/mark-as-read',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Mark a notification as read with invalid ID => 400',
    route: '/notification/invalid-id/mark-as-read',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Mark a notification as read unauthenticated => 401',
    route: '/notification/123/mark-as-read',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 5) PATCH /notification/mark-all-as-read => markAllAsRead()
  //    - Must be authenticated
  // --------------------------------------------------------------------------
  {
    name: 'Mark all notifications as read as student => 200',
    route: '/notification/mark-all-as-read',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Mark all notifications as read unauthenticated => 401',
    route: '/notification/mark-all-as-read',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 6) POST /notification => create()
  //    - Must be authenticated
  //    - parseNotificationCreation => if invalid => 400
  // --------------------------------------------------------------------------
  {
    name: 'Create a new notification as an authenticated user',
    route: '/notification',
    method: 'POST',
    authAs: 'student', // any authenticated user role
    body: {
      notification: {
        title: 'Test Notification',
        message: 'This is a test notification.',
        link: null,
        type: 'announcement', // valid value from NotificationTypeScheme: 'maintenance', 'new-feature', 'announcement', or 'other'
        isBanner: false,
      },
      sendOptions: {
        selector: 'role', // valid value: 'role', 'course', or 'all'
        value: 'admin'
      },
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Create a new notification with invalid data => 400',
    route: '/notification',
    method: 'POST',
    authAs: 'teacher',
    body: {}, // an empty object that likely fails your parseNotificationCreation
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create a new notification as unauthenticated => 401',
    route: '/notification',
    method: 'POST',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 7) DELETE /notification/:id => delete()
  //    - Must be authenticated
  //    - parseId => 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Delete notification as an authenticated user',
    route: '/notification/999',
    method: 'DELETE',
    authAs: 'student', // or 'teacher', 'admin'
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete notification with invalid ID => 400',
    route: '/notification/not-an-id',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete notification as unauthenticated => 401',
    route: '/notification/999',
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
]

export default tests
