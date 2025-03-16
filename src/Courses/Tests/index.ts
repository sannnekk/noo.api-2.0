import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { RequestTest } from '@modules/Core/Test/RequestTest'

// Generic schemas for responses:
const SuccessSchema = z.object({}).passthrough()
const ErrorSchema = z.object({ error: z.string() }).passthrough()

// Global variables to capture dynamic IDs/slugs at runtime:
let capturedStudentId: string = '01JJQ7MAPK3TZMSECAFEMDP5HG'
let capturedOtherStudentId: string = '01J6G76JDMH0FP47FW1RDDK1CC'
let capturedCourseId: string = '01HRQC5E2WFMXVKTWFP8A4RMNF'
let capturedCourseSlug: string = '01HRQC5E2WDW3M7G5EN6FBV8PE-testovyi-kurs-po-biologii'
let capturedAssignmentId: string = '01HRPT1AQHHNQ5BTZ5Y4117JTY'
let capturedMaterialSlug: string = '17d13caa-7593-4a3b-a2b3-e6b9158a6ec3'
let capturedWorkId: string = '01HRP8ZCKN3CNQ12N0C1CY4J9E'

const tests: RequestTest[] = [
  // 1) GET /course/
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

  // 2) GET /course/student/:studentId
  {
    name: 'Get student courses as teacher (any studentId)',
    route: `/course/student/${capturedStudentId}`,
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get student courses as admin (any studentId)',
    route: `/course/student/${capturedStudentId}`,
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get own student courses as the same student',
    route: `/course/student/${capturedStudentId}`,
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get other student courses as a different student => forbidden',
    route: `/course/student/${capturedOtherStudentId}`,
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get student courses as unauthenticated',
    route: `/course/student/${capturedStudentId}`,
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // 3) PATCH /course/:assignmentId/archive
  {
    name: 'Archive course assignment as student',
    route: `/course/${capturedAssignmentId}/archive`,
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Archive course assignment as teacher => forbidden',
    route: `/course/${capturedAssignmentId}/archive`,
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Archive course assignment as admin => forbidden',
    route: `/course/${capturedAssignmentId}/archive`,
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Archive course assignment as unauthenticated => unauthorized',
    route: `/course/${capturedAssignmentId}/archive`,
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // 4) PATCH /course/:assignmentId/unarchive
  {
    name: 'Unarchive course assignment as student',
    route: `/course/${capturedAssignmentId}/unarchive`,
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Unarchive course assignment as teacher => forbidden',
    route: `/course/${capturedAssignmentId}/unarchive`,
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Unarchive course assignment as admin => forbidden',
    route: `/course/${capturedAssignmentId}/unarchive`,
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Unarchive course assignment as unauthenticated => unauthorized',
    route: `/course/${capturedAssignmentId}/unarchive`,
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // 5) PATCH /course/:materialSlug/react/:reaction
  {
    name: 'React to material as student',
    route: `/course/material/${capturedMaterialSlug}/react/check`,
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'React to material with invalid reaction => bad request',
    route: `/course/material/${capturedMaterialSlug}/react/notAValidReaction`,
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.BAD_REQUEST,
    responseSchema: ErrorSchema,
  },
  {
    name: 'React to material as teacher => forbidden',
    route: `/course/material/${capturedMaterialSlug}/react/check`,
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'React to material as admin => forbidden',
    route: `/course/material/${capturedMaterialSlug}/react/check`,
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'React to material as unauthenticated => unauthorized',
    route: `/course/material/${capturedMaterialSlug}/react/check`,
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // 6) GET /course/:slug
  {
    name: 'Get course by slug as teacher',
    route: `/course/${capturedCourseSlug}`,
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get course by slug as student',
    route: `/course/${capturedCourseSlug}`,
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get course by slug as admin',
    route: `/course/${capturedCourseSlug}`,
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get course by slug as unauthenticated => unauthorized',
    route: `/course/${capturedCourseSlug}`,
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

  // 7) GET /course/material/:slug/assigned-work
  {
    name: 'Get assigned work as student',
    route: `/course/material/${capturedMaterialSlug}/assigned-work`,
    method: 'GET',
    authAs: 'student',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Get assigned work as teacher => forbidden',
    route: `/course/material/${capturedMaterialSlug}/assigned-work`,
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get assigned work as admin => forbidden',
    route: `/course/material/${capturedMaterialSlug}/assigned-work`,
    method: 'GET',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Get assigned work as unauthenticated => unauthorized',
    route: `/course/material/${capturedMaterialSlug}/assigned-work`,
    method: 'GET',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // 8) POST /course/ => Create new course as teacher (capture course id & slug)
  {
    name: 'Create new course as teacher',
    route: '/course/',
    method: 'POST',
    authAs: 'teacher',
    body: {
      name: 'New Course',
      description: 'Course description',
      images: [],
      chapters: [],
      subject: { id: '01ARZ3NDEKTSV4RRFFQ69G5FAV' },
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
    postTest: (response: any) => {
      capturedCourseId = response.body.data.id
      capturedCourseSlug = response.body.data.slug
      console.log('Captured course id:', capturedCourseId, 'slug:', capturedCourseSlug)
    },
  },

  // 9) POST /course/:courseSlug/chapter => Create chapter as teacher
  {
    name: 'Create chapter as teacher',
    route: `/course/${capturedCourseSlug}/chapter`,
    method: 'POST',
    authAs: 'teacher',
    body: {
      name: 'New Chapter',
      order: 1,
      materials: [],
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },

  // 10) PATCH /course/:id => Update course as teacher
  {
    name: 'Update course as teacher',
    route: `/course/${capturedCourseId}`,
    method: 'PATCH',
    authAs: 'teacher',
    body: {
      name: 'Updated Course Title',
      description: 'Updated description',
      images: [],
      chapters: [],
      subject: { id: '01J6G7EG4SHD1RSE957X1FBG7T' },
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },

  // 11) PATCH /course/:materialSlug/assign-work/:workId => Assign work to material as teacher
  {
    name: 'Assign work to material as teacher',
    route: `/course/${capturedMaterialSlug}/assign-work/${capturedWorkId}`,
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },

  // 12) PATCH /course/:materialSlug/unassign-work => Unassign work from material as teacher
  {
    name: 'Unassign work from material as teacher',
    route: `/course/${capturedMaterialSlug}/unassign-work`,
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },

  // 13) GET /course/:courseId/student-list => Get student list as teacher
  {
    name: 'Get student list as teacher',
    route: `/course/${capturedCourseId}/student-list`,
    method: 'GET',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },

  // 14) PATCH /course/:courseSlug/add-students => Add students to course as teacher
  {
    name: 'Add students to course as teacher',
    route: `/course/${capturedCourseSlug}/add-students`,
    method: 'PATCH',
    authAs: 'teacher',
    body: {
      studentIds: ['01ARZ3NDEKTSV4RRFFQ69G5FAV', '01ARZ3NDEKTSV4RRFFQ69G5FAW'],
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Add students to course as admin => forbidden',
    route: `/course/${capturedCourseSlug}/add-students`,
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Add students to course as student => forbidden',
    route: `/course/${capturedCourseSlug}/add-students`,
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Add students to course as unauth => unauthorized',
    route: `/course/${capturedCourseSlug}/add-students`,
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // 15) PATCH /course/:courseSlug/remove-students => Remove students from course as teacher
  {
    name: 'Remove students from course as teacher',
    route: `/course/${capturedCourseSlug}/remove-students`,
    method: 'PATCH',
    authAs: 'teacher',
    expectedStatus: StatusCodes.OK,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Remove students from course as admin => forbidden',
    route: `/course/${capturedCourseSlug}/remove-students`,
    method: 'PATCH',
    authAs: 'admin',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Remove students from course as student => forbidden',
    route: `/course/${capturedCourseSlug}/remove-students`,
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Remove students from course as unauth => unauthorized',
    route: `/course/${capturedCourseSlug}/remove-students`,
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // 16) PATCH /course/:courseSlug/add-students-via-emails => Add students via emails as teacherOrAdmin
  {
    name: 'Add students via emails as teacher',
    route: `/course/${capturedCourseSlug}/add-students-via-emails`,
    method: 'PATCH',
    authAs: 'teacher',
    body: {
      emails: ['test1@example.com', 'test2@example.com'],
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Add students via emails as admin',
    route: `/course/${capturedCourseSlug}/add-students-via-emails`,
    method: 'PATCH',
    authAs: 'admin',
    body: {
      emails: ['test1@example.com', 'test2@example.com'],
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Add students via emails as student => forbidden',
    route: `/course/${capturedCourseSlug}/add-students-via-emails`,
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Add students via emails as unauth => unauthorized',
    route: `/course/${capturedCourseSlug}/add-students-via-emails`,
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // 17) PATCH /course/:courseSlug/remove-students-via-emails => Remove students via emails as teacherOrAdmin
  {
    name: 'Remove students via emails as teacher',
    route: `/course/${capturedCourseSlug}/remove-students-via-emails`,
    method: 'PATCH',
    authAs: 'teacher',
    body: {
      emails: ['example1@test.com', 'example2@test.com'],
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Remove students via emails as admin',
    route: `/course/${capturedCourseSlug}/remove-students-via-emails`,
    method: 'PATCH',
    authAs: 'admin',
    body: {
      emails: ['example1@test.com', 'example2@test.com'],
    },
    expectedStatus: StatusCodes.NO_CONTENT,
    responseSchema: SuccessSchema,
  },
  {
    name: 'Remove students via emails as student => forbidden',
    route: `/course/${capturedCourseSlug}/remove-students-via-emails`,
    method: 'PATCH',
    authAs: 'student',
    expectedStatus: StatusCodes.FORBIDDEN,
    responseSchema: ErrorSchema,
  },
  {
    name: 'Remove students via emails as unauth => unauthorized',
    route: `/course/${capturedCourseSlug}/remove-students-via-emails`,
    method: 'PATCH',
    expectedStatus: StatusCodes.UNAUTHORIZED,
    responseSchema: ErrorSchema.optional(),
  },

  // 18) DELETE /course/:id => delete course (dummy IDs remain)
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
