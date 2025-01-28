import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

/**
 * Common response schemas for success and error
 */
const SuccessSchema = z.object({}).passthrough()
//  - We use `.passthrough()` so that any extra fields (e.g. { data, meta }) won't fail the schema.
//  - Adjust to a more specific schema if you want stricter validation.

const ErrorSchema = z.object({
  error: z.string(),
}).passthrough()

const tests: RequestTest[] = [
  // --------------------------------------------------------------------------
  // 1) GET /course/
  //    - Must be authenticated
  //    - Asserts.notStudent => teacher or admin is allowed
  // --------------------------------------------------------------------------
  {
    name: 'Get courses as teacher',
    route: '/course/',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get courses as admin',
    route: '/course/',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get courses as student',
    route: '/course/',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get courses as unauthenticated',
    route: '/course/',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 2) GET /course/student/:studentId?
  //    - Must be authenticated
  //    - If role=student => can only get own courses
  // --------------------------------------------------------------------------
  {
    name: 'Get student courses as teacher (any studentId)',
    route: '/course/student/123',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get student courses as admin (any studentId)',
    route: '/course/student/123',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get own student courses as the same student',
    route: '/course/student/123',
    method: 'GET',
    // Suppose credentials.userId === 123 in your tests
    // That means isAuthorized(context, studentId) will pass
    authAs: 'student', 
    // Some test runners let you specify a userId. If not, you might 
    // rely on route logic to interpret 'student' as userId=123. 
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get other student courses as a different student => forbidden',
    route: '/course/student/9999', 
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get student courses as unauthenticated',
    route: '/course/student/123',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 3) PATCH /course/:assignmentId/archive
  //    - Must be authenticated
  //    - Must be a student
  // --------------------------------------------------------------------------
  {
    name: 'Archive course assignment as student',
    route: '/course/abc123/archive',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Archive course assignment as teacher => forbidden',
    route: '/course/abc123/archive',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Archive course assignment as admin => forbidden',
    route: '/course/abc123/archive',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Archive course assignment as unauthenticated => unauthorized',
    route: '/course/abc123/archive',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 4) PATCH /course/:assignmentId/unarchive
  //    - Must be authenticated
  //    - Must be a student
  // --------------------------------------------------------------------------
  {
    name: 'Unarchive course assignment as student',
    route: '/course/abc123/unarchive',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Unarchive course assignment as teacher => forbidden',
    route: '/course/abc123/unarchive',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Unarchive course assignment as admin => forbidden',
    route: '/course/abc123/unarchive',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Unarchive course assignment as unauthenticated => unauthorized',
    route: '/course/abc123/unarchive',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 5) PATCH /course/material/:materialId/react/:reaction
  //    - Must be authenticated
  //    - Must be student
  // --------------------------------------------------------------------------
  {
    name: 'React to material as student',
    route: '/course/material/42/react/like', // example reaction
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'React to material with invalid reaction => bad request',
    route: '/course/material/42/react/notAValidReaction',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.BAD_REQUEST, 
    responseSchema: ErrorSchema,
  },
  {
    name: 'React to material as teacher => forbidden',
    route: '/course/material/42/react/like',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'React to material as admin => forbidden',
    route: '/course/material/42/react/like',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'React to material as unauthenticated => unauthorized',
    route: '/course/material/42/react/like',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 6) GET /course/:slug
  //    - Must be authenticated
  // --------------------------------------------------------------------------
  {
    name: 'Get course by slug as teacher',
    route: '/course/some-course-slug',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get course by slug as student',
    route: '/course/some-course-slug',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get course by slug as admin',
    route: '/course/some-course-slug',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get course by slug as unauthenticated => unauthorized',
    route: '/course/some-course-slug',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
  {
    name: 'Get course by invalid slug => bad request',
    route: '/course/???',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },

  // --------------------------------------------------------------------------
  // 7) GET /course/material/:slug/assigned-work
  //    - Must be authenticated
  //    - Must be student
  // --------------------------------------------------------------------------
  {
    name: 'Get assigned work as student',
    route: '/course/material/xyz/assigned-work',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get assigned work as teacher => forbidden',
    route: '/course/material/xyz/assigned-work',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get assigned work as admin => forbidden',
    route: '/course/material/xyz/assigned-work',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get assigned work as unauthenticated => unauthorized',
    route: '/course/material/xyz/assigned-work',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 8) POST /course/
  //    - Must be authenticated
  //    - Must be teacher
  // --------------------------------------------------------------------------
  {
    name: 'Create new course as teacher',
    route: '/course/',
    method: 'POST',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    // Typically an empty success response
    responseSchema: SuccessSchema,
  },
  {
    name: 'Create new course as admin => forbidden',
    route: '/course/',
    method: 'POST',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create new course as student => forbidden',
    route: '/course/',
    method: 'POST',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create new course as unauthenticated => unauthorized',
    route: '/course/',
    method: 'POST',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 9) POST /course/:courseSlug/chapter
  //    - Must be authenticated
  //    - Must be teacher
  // --------------------------------------------------------------------------
  {
    name: 'Create chapter as teacher',
    route: '/course/some-slug/chapter',
    method: 'POST',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Create chapter as admin => forbidden',
    route: '/course/some-slug/chapter',
    method: 'POST',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create chapter as student => forbidden',
    route: '/course/some-slug/chapter',
    method: 'POST',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Create chapter as unauthenticated => unauthorized',
    route: '/course/some-slug/chapter',
    method: 'POST',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 10) PATCH /course/:id
  //     - Must be authenticated
  //     - Must be teacher
  // --------------------------------------------------------------------------
  {
    name: 'Update course as teacher',
    route: '/course/100',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Update course as admin => forbidden',
    route: '/course/100',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update course as student => forbidden',
    route: '/course/100',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Update course as unauthenticated => unauthorized',
    route: '/course/100',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 11) PATCH /course/:materialSlug/assign-work/:workId
  //     - Must be authenticated
  //     - Must be teacher
  // --------------------------------------------------------------------------
  {
    name: 'Assign work to material as teacher',
    route: '/course/some-material/assign-work/555',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Assign work to material as admin => forbidden',
    route: '/course/some-material/assign-work/555',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Assign work to material as student => forbidden',
    route: '/course/some-material/assign-work/555',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Assign work to material as unauth => unauthorized',
    route: '/course/some-material/assign-work/555',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 12) PATCH /course/:materialSlug/unassign-work
  //     - Must be teacher
  // --------------------------------------------------------------------------
  {
    name: 'Unassign work from material as teacher',
    route: '/course/some-material/unassign-work',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Unassign work from material as admin => forbidden',
    route: '/course/some-material/unassign-work',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Unassign work from material as student => forbidden',
    route: '/course/some-material/unassign-work',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Unassign work from material as unauth => unauthorized',
    route: '/course/some-material/unassign-work',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 13) GET /course/:courseId/student-list
  //     - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Get student list as teacher',
    route: '/course/100/student-list',
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get student list as admin',
    route: '/course/100/student-list',
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get student list as student => forbidden',
    route: '/course/100/student-list',
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get student list as unauthenticated => unauthorized',
    route: '/course/100/student-list',
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 14) PATCH /course/:courseSlug/add-students
  //     - Must be teacher
  // --------------------------------------------------------------------------
  {
    name: 'Add students to course as teacher',
    route: '/course/my-course/add-students',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Add students to course as admin => forbidden',
    route: '/course/my-course/add-students',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Add students to course as student => forbidden',
    route: '/course/my-course/add-students',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Add students to course as unauth => unauthorized',
    route: '/course/my-course/add-students',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 15) PATCH /course/:courseSlug/remove-students
  //     - Must be teacher
  // --------------------------------------------------------------------------
  {
    name: 'Remove students from course as teacher',
    route: '/course/my-course/remove-students',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Remove students from course as admin => forbidden',
    route: '/course/my-course/remove-students',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Remove students from course as student => forbidden',
    route: '/course/my-course/remove-students',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Remove students from course as unauth => unauthorized',
    route: '/course/my-course/remove-students',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 16) PATCH /course/:courseSlug/add-students-via-emails
  //     - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Add students via emails as teacher',
    route: '/course/my-course/add-students-via-emails',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Add students via emails as admin',
    route: '/course/my-course/add-students-via-emails',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Add students via emails as student => forbidden',
    route: '/course/my-course/add-students-via-emails',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Add students via emails as unauth => unauthorized',
    route: '/course/my-course/add-students-via-emails',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 17) PATCH /course/:courseSlug/remove-students-via-emails
  //     - Must be teacherOrAdmin
  // --------------------------------------------------------------------------
  {
    name: 'Remove students via emails as teacher',
    route: '/course/my-course/remove-students-via-emails',
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Remove students via emails as admin',
    route: '/course/my-course/remove-students-via-emails',
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Remove students via emails as student => forbidden',
    route: '/course/my-course/remove-students-via-emails',
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Remove students via emails as unauth => unauthorized',
    route: '/course/my-course/remove-students-via-emails',
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // --------------------------------------------------------------------------
  // 18) DELETE /course/:id
  //     - Must be teacher
  // --------------------------------------------------------------------------
  {
    name: 'Delete course as teacher',
    route: '/course/999',
    method: 'DELETE',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Delete course as admin => forbidden',
    route: '/course/999',
    method: 'DELETE',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete course as student => forbidden',
    route: '/course/999',
    method: 'DELETE',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Delete course as unauth => unauthorized',
    route: '/course/999',
    method: 'DELETE',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },
]

export default tests
