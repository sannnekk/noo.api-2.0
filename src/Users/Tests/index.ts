import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

// Basic success/error schemas
const SuccessSchema = z.object({}).passthrough()
const ErrorSchema = z.object({ error: z.string() }).passthrough()

const tests: RequestTest[] = [
  // --------------------------------------------------------------------------
  // 1) GET /user/:username => getByUsername
  //    - Must be authenticated => 401 otherwise
  //    - parseSlug => 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Get user by username as authenticated => 200',
    route: '/user/johndoe',
    method: 'GET',
    authAs: 'teacher', // any valid role
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get user by invalid username => 400',
    route: '/user/???', // parseSlug likely fails
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get user by username as unauth => 401',
    route: '/user/johndoe',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 2) PATCH /user/:username/verify-manual => verifyManual
  //    - Must be authenticated => 401
  //    - teacherOrAdmin => else 403
  //    - parseNonemptyString => 400 if invalid
  // --------------------------------------------------------------------------
  {
    name: 'Manually verify user as admin => 200',
    route: '/user/alice/verify-manual',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Manually verify user as teacher => 200',
    route: '/user/alice/verify-manual',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Manually verify user as student => 403',
    route: '/user/alice/verify-manual',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Manually verify user as unauth => 401',
    route: '/user/alice/verify-manual',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Manually verify user with invalid username => 400',
    route: '/user/  /verify-manual', // Something parseNonemptyString would fail
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 3) GET /user/mentor/search => getMentors
  //    - Must be authenticated => 401
  //    - Asserts.notStudent => if role=student => 403
  // --------------------------------------------------------------------------
  {
    name: 'Get mentors as teacher => 200',
    route: '/user/mentor/search',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get mentors as admin => 200',
    route: '/user/mentor/search',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get mentors as student => 403',
    route: '/user/mentor/search',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get mentors unauth => 401',
    route: '/user/mentor/search',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 4) GET /user/teacher/search => getTeachers
  //    - Must be authenticated
  //    - notStudent => else 403
  // --------------------------------------------------------------------------
  {
    name: 'Get teachers as admin => 200',
    route: '/user/teacher/search',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get teachers as teacher => 200',
    route: '/user/teacher/search',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get teachers as student => 403',
    route: '/user/teacher/search',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get teachers unauth => 401',
    route: '/user/teacher/search',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 5) GET /user/student/search => getStudents
  //    - Must be authenticated
  //    - notStudent => else 403
  // --------------------------------------------------------------------------
  {
    name: 'Get students as teacher => 200',
    route: '/user/student/search',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get students as student => 403',
    route: '/user/student/search',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get students unauth => 401',
    route: '/user/student/search',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 6) GET /user/student/search/own/:mentorId? => getMyStudents
  //    - Must be authenticated
  //    - notStudent => else 403
  //    - parseOptionalId => 400 if invalid param?
  // --------------------------------------------------------------------------
  {
    name: 'Get my students with explicit mentorId as teacher => 200',
    route: '/user/student/search/own/123',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get my students with no mentorId as teacher => 200',
    route: '/user/student/search/own', // no param
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get my students as student => 403',
    route: '/user/student/search/own/123',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get my students unauth => 401',
    route: '/user/student/search/own/123',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Get my students with invalid mentorId => 400',
    route: '/user/student/search/own/bad-id',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 7) GET /user/ => getUsers
  //    - Must be authenticated
  //    - notStudent => else 403
  // --------------------------------------------------------------------------
  {
    name: 'Get users as admin => 200',
    route: '/user/',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get users as student => 403',
    route: '/user/',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get users unauth => 401',
    route: '/user/',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 8) PATCH /user/:id => update
  //    - Must be authenticated => 401
  //    - parseId => 400 if invalid
  //    - parseUpdate => 400 if invalid body
  //    - if not teacher|admin => must own user => else 403
  // --------------------------------------------------------------------------
  {
    name: 'Update user as admin => 200',
    route: '/user/99',
    method: 'PATCH',
    authAs: 'admin',
    body: { firstName: 'Updated', lastName: 'Name' }, // example
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update user as teacher => 200',
    route: '/user/99',
    method: 'PATCH',
    authAs: 'teacher',
    body: { firstName: 'TeacherUpdate' },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update own user as student => 200',
    route: '/user/55',
    method: 'PATCH',
    authAs: 'student',
    // If your test harness sets context.credentials!.userId = 55
    // then isAuthorized(context,55) passes
    body: { firstName: 'StudentSelfUpdate' },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update another user as student => 403',
    route: '/user/9999',
    method: 'PATCH',
    authAs: 'student',
    body: { firstName: 'ForbiddenUpdate' },
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update user with invalid ID => 400',
    route: '/user/not-a-valid-id',
    method: 'PATCH',
    authAs: 'admin',
    body: { firstName: 'InvalidID' },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update user with invalid body => 400',
    route: '/user/99',
    method: 'PATCH',
    authAs: 'admin',
    body: {}, // parseUpdate likely fails
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update user unauth => 401',
    route: '/user/99',
    method: 'PATCH',
    body: { firstName: 'NoAuth' },
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 9) PATCH /user/:id/password => updatePassword
  //    - Must be authenticated => 401
  //    - parseId => 400 if invalid
  //    - parseUpdatePassword => 400 if invalid body
  //    - if not teacher|admin => must be user => else 403
  // --------------------------------------------------------------------------
  {
    name: 'Update password as admin => 200',
    route: '/user/123/password',
    method: 'PATCH',
    authAs: 'admin',
    body: { oldPassword: 'old123', newPassword: 'new123' },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update own password as student => 200',
    route: '/user/55/password',
    method: 'PATCH',
    authAs: 'student',
    // test harness sets userId=55 => isAuthorized => passes
    body: { oldPassword: 'old', newPassword: 'new' },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update another user’s password as student => 403',
    route: '/user/999/password',
    method: 'PATCH',
    authAs: 'student',
    body: { oldPassword: 'foo', newPassword: 'bar' },
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update password with invalid ID => 400',
    route: '/user/not-valid/password',
    method: 'PATCH',
    authAs: 'admin',
    body: { oldPassword: 'xxx', newPassword: 'yyy' },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update password with invalid body => 400',
    route: '/user/123/password',
    method: 'PATCH',
    authAs: 'admin',
    body: {}, // parseUpdatePassword fails
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update password unauth => 401',
    route: '/user/123/password',
    method: 'PATCH',
    body: { oldPassword: 'some', newPassword: 'thing' },
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 10) PATCH /user/:id/role => updateRole
  //     - Must be authenticated => 401
  //     - teacherOrAdmin => else 403
  //     - parseId => 400
  //     - parseRole => 400
  // --------------------------------------------------------------------------
  {
    name: 'Update user role as admin => 200',
    route: '/user/444/role',
    method: 'PATCH',
    authAs: 'admin',
    body: { role: 'mentor' }, // example
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update user role as teacher => 200',
    route: '/user/444/role',
    method: 'PATCH',
    authAs: 'teacher',
    body: { role: 'student' }, // example
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update user role as student => 403',
    route: '/user/444/role',
    method: 'PATCH',
    authAs: 'student',
    body: { role: 'teacher' },
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update user role unauth => 401',
    route: '/user/444/role',
    method: 'PATCH',
    body: { role: 'admin' },
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Update user role with invalid ID => 400',
    route: '/user/bad-id/role',
    method: 'PATCH',
    authAs: 'admin',
    body: { role: 'teacher' },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update user role with invalid body => 400',
    route: '/user/444/role',
    method: 'PATCH',
    authAs: 'admin',
    body: {}, // parseRole fails
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 11) PATCH /user/:id/telegram => updateTelegram
  //     - Must be authenticated => 401
  //     - parseId => 400
  //     - parseTelegramUpdate => 400
  //     - if role not teacher|admin => must be same user => 403
  // --------------------------------------------------------------------------
  {
    name: 'Update telegram as admin => 200',
    route: '/user/777/telegram',
    method: 'PATCH',
    authAs: 'admin',
    body: { telegramUsername: '@mytelegram' },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update telegram as teacher => 200',
    route: '/user/777/telegram',
    method: 'PATCH',
    authAs: 'teacher',
    body: { telegramUsername: '@teachertelegram' },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update own telegram as student => 200',
    route: '/user/55/telegram',
    method: 'PATCH',
    authAs: 'student',
    // test harness userId=55 => isAuthorized => OK
    body: { telegramUsername: '@studenttelegram' },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update another user’s telegram as student => 403',
    route: '/user/999/telegram',
    method: 'PATCH',
    authAs: 'student',
    body: { telegramUsername: '@forbidden' },
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update telegram with invalid ID => 400',
    route: '/user/not-valid/telegram',
    method: 'PATCH',
    authAs: 'admin',
    body: { telegramUsername: 'xxx' },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update telegram with invalid body => 400',
    route: '/user/777/telegram',
    method: 'PATCH',
    authAs: 'admin',
    body: {}, // parseTelegramUpdate fails
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update telegram unauth => 401',
    route: '/user/777/telegram',
    method: 'PATCH',
    body: { telegramUsername: 'xxx' },
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 12) PATCH /user/:id/email => updateEmail
  //     - Must be authenticated => 401
  //     - parseId => 400
  //     - parseEmailUpdate => 400
  //     - if role not teacher|admin => must be same user => 403
  // --------------------------------------------------------------------------
  {
    name: 'Update email as admin => 200',
    route: '/user/888/email',
    method: 'PATCH',
    authAs: 'admin',
    body: { email: 'new@example.com' },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update own email as student => 200',
    route: '/user/55/email',
    method: 'PATCH',
    authAs: 'student',
    body: { email: 'student@mail.com' },
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update another user’s email as student => 403',
    route: '/user/999/email',
    method: 'PATCH',
    authAs: 'student',
    body: { email: 'forbidden@mail.com' },
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update email with invalid ID => 400',
    route: '/user/not-valid/email',
    method: 'PATCH',
    authAs: 'admin',
    body: { email: 'test@mail.com' },
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update email with invalid body => 400',
    route: '/user/888/email',
    method: 'PATCH',
    authAs: 'admin',
    body: {}, // parseEmailUpdate fails
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update email unauth => 401',
    route: '/user/888/email',
    method: 'PATCH',
    body: { email: 'test@mail.com' },
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 13) PATCH /user/:id/block => block
  //     - Must be authenticated => 401
  //     - teacherOrAdmin => else 403
  //     - parseId => 400
  // --------------------------------------------------------------------------
  {
    name: 'Block user as admin => 200',
    route: '/user/999/block',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Block user as teacher => 200',
    route: '/user/999/block',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Block user as student => 403',
    route: '/user/999/block',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Block user unauth => 401',
    route: '/user/999/block',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Block user with invalid ID => 400',
    route: '/user/invalid/block',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 14) PATCH /user/:id/unblock => unblock
  //     - Must be authenticated => 401
  //     - teacherOrAdmin => else 403
  //     - parseId => 400
  // --------------------------------------------------------------------------
  {
    name: 'Unblock user as admin => 200',
    route: '/user/999/unblock',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Unblock user as teacher => 200',
    route: '/user/999/unblock',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Unblock user as student => 403',
    route: '/user/999/unblock',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Unblock user unauth => 401',
    route: '/user/999/unblock',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Unblock user with invalid ID => 400',
    route: '/user/invalid/unblock',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 15) PATCH /user/:studentId/:subjectId/mentor/:mentorId => assignMentor
  //     - Must be authenticated => 401
  //     - notStudent => else 403
  //     - parseId => 400 for studentId, subjectId, mentorId
  // --------------------------------------------------------------------------
  {
    name: 'Assign mentor as teacher => 200',
    route: '/user/111/222/mentor/333',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Assign mentor as admin => 200',
    route: '/user/111/222/mentor/333',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Assign mentor as student => 403',
    route: '/user/111/222/mentor/333',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Assign mentor unauth => 401',
    route: '/user/111/222/mentor/333',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Assign mentor with invalid IDs => 400',
    route: '/user/notID/222/mentor/333',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 16) DELETE /user/:studentId/:subjectId/mentor => unassignMentor
  //     - Must be authenticated => 401
  //     - notStudent => else 403
  //     - parseId => 400
  // --------------------------------------------------------------------------
  {
    name: 'Unassign mentor as admin => 200',
    route: '/user/111/222/mentor',
    method: 'DELETE',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Unassign mentor as teacher => 200',
    route: '/user/111/222/mentor',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Unassign mentor as student => 403',
    route: '/user/111/222/mentor',
    method: 'DELETE',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Unassign mentor unauth => 401',
    route: '/user/111/222/mentor',
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Unassign mentor with invalid IDs => 400',
    route: '/user/xxx/222/mentor',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 17) DELETE /user/:id/:password => delete
  //     - Must be authenticated => 401
  //     - parseId => 400 if invalid
  //     - parseNonemptyString => 400 if password is invalid
  //     - if not admin => must be the same user => else 403
  // --------------------------------------------------------------------------
  {
    name: 'Delete user as admin => 200',
    route: '/user/999/secret123',
    method: 'DELETE',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete own account as student => 200',
    route: '/user/55/mypass',
    method: 'DELETE',
    authAs: 'student',
    // harness sets userId=55 => isAuthorized => ok
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete another user as student => 403',
    route: '/user/9999/wrong',
    method: 'DELETE',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete user with invalid ID => 400',
    route: '/user/not-valid/pass123',
    method: 'DELETE',
    authAs: 'admin',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete user with invalid password param => 400',
    route: '/user/999/', // missing password or empty string
    method: 'DELETE',
    authAs: 'admin',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete user unauth => 401',
    route: '/user/999/pass',
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
]

export default tests
