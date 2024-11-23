import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { WorkScheme } from '@modules/Works/Schemes/WorkScheme'
import { z } from 'zod'
import { AssignedWorkAnswerScheme } from './AssignedWorkAnswerScheme'
import { AssignedWorkCommentScheme } from './AssignedWorkCommentScheme'
import { UserScheme } from '@modules/Users/Schemes/UserScheme'

export const AssignedWorkScheme = z.object({
  id: z.string().ulid(),
  createdAt: z.date().or(z.string().date()),
  updatedAt: z.date().or(z.string().date()),
  studentId: z.string().ulid(),
  student: UserScheme(),
  mentors: z.array(UserScheme()),
  mentorIds: z.array(z.string().ulid()),
  workId: z.string().ulid(),
  work: WorkScheme,
  solveStatus: z.nativeEnum({
    'not-started': 'not-started',
    'in-progress': 'in-progress',
    'made-in-deadline': 'made-in-deadline',
    'made-after-deadline': 'made-after-deadline',
  }),
  checkStatus: z.nativeEnum({
    'not-checked': 'not-checked',
    'in-progress': 'in-progress',
    'checked-in-deadline': 'checked-in-deadline',
    'checked-after-deadline': 'checked-after-deadline',
    'checked-automatically': 'checked-automatically',
  }),
  solveDeadlineAt: z.date().or(z.string().date()).nullable(),
  solveDeadlineShifted: z.boolean(),
  checkDeadlineAt: z.date().or(z.string().date()).nullable(),
  checkDeadlineShifted: z.boolean(),
  solvedAt: z.date().or(z.string().date()).nullable(),
  checkedAt: z.date().or(z.string().date()).nullable(),
  score: z.number().nullable(),
  maxScore: z.number(),
  isArchivedByMentors: z.boolean(),
  isArchivedByStudent: z.boolean(),
  isNewAttempt: z.boolean(),
  excludedTaskIds: z.array(z.string()),
  studentComment: DeltaScheme.nullable(),
  mentorComment: DeltaScheme.nullable(),
  answers: z.array(AssignedWorkAnswerScheme),
  comments: z.array(AssignedWorkCommentScheme),
})
