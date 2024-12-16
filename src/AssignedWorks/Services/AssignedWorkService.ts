import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Pagination } from '@modules/Core/Data/Pagination'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'
import type { User } from '@modules/Users/Data/User'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { WorkRepository } from '@modules/Works/Data/WorkRepository'
import type { Work } from '@modules/Works/Data/Work'
import { CalenderService } from '@modules/Calender/Services/CalenderService'
import type { CourseMaterial } from '@modules/Courses/Data/Relations/CourseMaterial'
import { CourseMaterialRepository } from '@modules/Courses/Data/CourseMaterialRepository'
import { AssignedWorkRepository } from '../Data/AssignedWorkRepository'
import type { AssignedWork } from '../Data/AssignedWork'
import { AssignedWorkModel } from '../Data/AssignedWorkModel'
import { WorkAlreadySolvedError } from '../Errors/WorkAlreadySolvedError'
import { WorkAlreadyCheckedError } from '../Errors/WorkAlreadyCheckedError'
import { WorkIsNotSolvedYetError } from '../Errors/WorkIsNotSolvedYetError'
import { WorkAlreadyAssignedToThisMentorError } from '../Errors/WorkAlreadyAssignedToThisMentorError'
import { WorkAlreadyAssignedToEnoughMentorsError } from '../Errors/WorkAlreadyAssignedToEnoughMentorsError'
import { SolveDeadlineNotSetError } from '../Errors/SolveDeadlineNotSetError'
import { CheckDeadlineNotSetError } from '../Errors/CheckDeadlineNotSetError'
import type { AssignedWorkComment } from '../Data/Relations/AssignedWorkComment'
import { DeadlineAlreadyShiftedError } from '../Errors/DeadlineAlreadyShiftedError'
import { TaskService } from './TaskService'
import { AssignedWorkCommentRepository } from '../Data/AssignedWorkCommentRepository'
import { AssignedWorkAnswerRepository } from '../Data/AssignedWorkAnswerRepository'
import type { RemakeOptions } from '../DTO/RemakeOptions'
import type { CreateOptions } from '../DTO/CreateOptions'
import type { SolveOptions } from '../DTO/SolveOptions'
import type { CheckOptions } from '../DTO/CheckOptions'
import type { SaveOptions } from '../DTO/SaveOptions'
import Dates from '@modules/Core/Utils/date'
import { AssignedWorkOptions } from '../AssignedWorkOptions'
import type { FindOptionsWhere } from 'typeorm'
import { UserService } from '@modules/Users/Services/UserService'
import type { AssignedWorkProgress } from '../Types/AssignedWorkProgress'
import { NotificationService } from '@modules/Notifications/Services/NotificationService'
import { CantDeleteMadeWorkError } from '../Errors/CantDeleteMadeWorkError'
import { isAutomaticallyCheckable } from '../Utils/Task'
import { workAlreadyChecked, workAlreadyMade } from '../Utils/AssignedWork'
import { AssignedWorkAnswer } from '../Data/Relations/AssignedWorkAnswer'
import { WorkIsNotCheckedYetError } from '../Errors/WorkIsNotCheckedYetError'

export class AssignedWorkService {
  private readonly taskService: TaskService

  private readonly assignedWorkRepository: AssignedWorkRepository

  private readonly materialRepository: CourseMaterialRepository

  private readonly workRepository: WorkRepository

  private readonly userRepository: UserRepository

  private readonly userService: UserService

  private readonly answerRepository: AssignedWorkAnswerRepository

  private readonly commentRepository: AssignedWorkCommentRepository

  private readonly calenderService: CalenderService

  private readonly notificationService: NotificationService

  constructor() {
    this.taskService = new TaskService()
    this.assignedWorkRepository = new AssignedWorkRepository()
    this.materialRepository = new CourseMaterialRepository()
    this.workRepository = new WorkRepository()
    this.userRepository = new UserRepository()
    this.answerRepository = new AssignedWorkAnswerRepository()
    this.commentRepository = new AssignedWorkCommentRepository()
    this.calenderService = new CalenderService()
    this.userService = new UserService()
    this.notificationService = new NotificationService()
  }

  public async getWorks(
    userId: User['id'],
    userRole?: User['role'],
    pagination?: Pagination
  ) {
    if (!userRole) {
      const user = await this.userRepository.findOne({ id: userId })

      if (!user) {
        throw new NotFoundError('Пользователь не найден')
      }

      userRole = user.role
    }

    // TODO: modify the conditions to load all assigned mentors instead of just one
    const conditions: FindOptionsWhere<AssignedWork> =
      userRole == 'student'
        ? { student: { id: userId } }
        : { mentors: { id: userId } }

    const relations = ['work', 'student', 'mentors'] as const

    const { entities, meta } = await this.assignedWorkRepository.search(
      conditions,
      pagination,
      relations
    )

    for (const work of entities) {
      if (work.isNewAttempt && work.work) {
        work.work.name = `🔁 ${work.work.name}`
      }
    }

    return { entities, meta }
  }

  public async getWorkById(id: AssignedWork['id'], role: User['role']) {
    const assignedWork = await this.assignedWorkRepository.findOne({ id }, [
      'mentors',
      'student',
    ])

    if (!assignedWork) {
      throw new NotFoundError('Работа не найдена')
    }

    const work = await this.workRepository.findOne(
      { id: assignedWork.workId },
      ['tasks'],
      {
        tasks: {
          order: 'ASC',
        },
      }
    )

    if (!work) {
      throw new NotFoundError('Работа не найдена')
    }

    assignedWork.work = work

    assignedWork.answers = []
    assignedWork.comments = []

    this.excludeTasks(assignedWork)

    if (assignedWork.isNewAttempt) {
      assignedWork.work.name = `🔁 (Пересдача) ${assignedWork.work.name}`
    }

    if (assignedWork.solveStatus !== 'not-started') {
      const answers = await this.answerRepository.findAll({
        assignedWork: { id: assignedWork.id } as AssignedWork,
      })

      assignedWork.answers = answers
    }

    if (
      (role === 'mentor' && !workAlreadyChecked(assignedWork)) ||
      workAlreadyChecked(assignedWork)
    ) {
      const comments = await this.commentRepository.findAll({
        assignedWork: { id: assignedWork.id } as AssignedWork,
      })

      assignedWork.comments = comments
    }

    return assignedWork
  }

  public async getProgressByWorkId(
    workId: Work['id'],
    studentId: User['id']
  ): Promise<AssignedWorkProgress | null> {
    const assignedWork = await this.assignedWorkRepository.findOne(
      {
        work: { id: workId },
        student: { id: studentId },
      },
      ['work']
    )

    if (!assignedWork) {
      return null
    }

    const progress: AssignedWorkProgress = {
      score: assignedWork.score || null,
      maxScore: assignedWork.maxScore,
      solveStatus: assignedWork.solveStatus,
      checkStatus: assignedWork.checkStatus,
    }

    return progress
  }

  public async createWork(
    options: CreateOptions,
    taskIdsToExclude: string[] = []
  ) {
    const work = await this.workRepository.findOne(
      {
        id: options.workId,
      },
      ['tasks', 'subject']
    )

    const student = await this.userRepository.findOne(
      {
        id: options.studentId,
      },
      ['mentorAssignmentsAsStudent']
    )

    if (!work) {
      throw new NotFoundError('Работа не найдена')
    }

    if (!student) {
      throw new NotFoundError('Ученик не найден')
    }

    const mentor = await this.userService.getMentor(student, work.subject!.id)

    if (!mentor && work.type !== 'test') {
      throw new NotFoundError('У ученика нет куратора по данному предмету')
    }

    const assignedWork = new AssignedWorkModel()

    if (work.type === 'test' && !mentor) {
      assignedWork.mentors = []
    } else {
      assignedWork.mentors = [{ id: mentor!.id } as User]
    }

    assignedWork.work = { id: work.id } as Work
    assignedWork.student = { id: student.id } as User
    assignedWork.excludedTaskIds = taskIdsToExclude
    assignedWork.maxScore = this.getMaxScore(work.tasks, taskIdsToExclude)
    assignedWork.solveStatus = 'not-started'
    assignedWork.checkStatus = 'not-checked'
    assignedWork.isNewAttempt = options.isNewAttempt || false
    assignedWork.solveDeadlineAt = options.solveDeadlineAt
    assignedWork.checkDeadlineAt = options.checkDeadlineAt

    const createdWork = await this.assignedWorkRepository.create(assignedWork)

    work.tasks = []

    createdWork.student = student
    createdWork.mentors = work.type === 'test' ? [] : [mentor!]
    createdWork.work = work

    if (assignedWork.solveDeadlineAt) {
      await this.calenderService.createSolveDeadlineEvent(createdWork)
    }

    if (assignedWork.checkDeadlineAt && work.type !== 'test') {
      await this.calenderService.createCheckDeadlineEvent(createdWork)
    }

    return createdWork
  }

  public async remakeWork(
    assignedWorkId: AssignedWork['id'],
    studentId: User['id'],
    options: RemakeOptions
  ) {
    const assignedWork = await this.getAssignedWork(assignedWorkId, ['work'])

    if (!assignedWork) {
      throw new NotFoundError('Работа не найдена')
    }

    if (!assignedWork.work) {
      throw new NotFoundError('Работа не найдена. Возможно, она была удалена')
    }

    if (assignedWork.studentId !== studentId) {
      throw new UnauthorizedError('Вы не можете пересдать чужую работу')
    }

    const rightTaskIds: string[] = assignedWork.excludedTaskIds

    if (options.onlyFalse) {
      const comments = await this.commentRepository.findAll(
        {
          assignedWork: { id: assignedWork.id } as AssignedWork,
        },
        ['task']
      )

      const newExcludes = comments
        .filter((comment) => comment.task?.highestScore === comment.score)
        .map((comment) => comment.task?.id)
        .filter(Boolean) as string[]

      rightTaskIds.push(...newExcludes)
    }

    await this.createWork(
      {
        workId: assignedWork.work.id,
        studentId,
        isNewAttempt: true,
      } as CreateOptions,
      rightTaskIds
    )
  }

  public async getOrCreateWork(
    materialSlug: CourseMaterial['slug'],
    studentId: AssignedWork['studentId']
  ): Promise<{ link: string }> {
    const material = await this.materialRepository.findOne(
      {
        slug: materialSlug,
      },
      ['work']
    )

    if (!material) {
      throw new NotFoundError('Материал не найден')
    }

    const workId = material.work?.id

    if (!workId) {
      throw new NotFoundError('У этого материала нет работы')
    }

    const assignedWork = await this.assignedWorkRepository.findOne({
      work: { id: workId },
      student: { id: studentId },
    })

    if (assignedWork) {
      switch (assignedWork.solveStatus) {
        case 'in-progress':
          return { link: `/assigned-works/${assignedWork.id}/solve` }
        case 'made-in-deadline':
          return { link: `/assigned-works/${assignedWork.id}/read` }
        case 'made-after-deadline':
          return { link: `/assigned-works/${assignedWork.id}/read` }
        case 'not-started':
        default:
          return { link: `/assigned-works/${assignedWork.id}/solve` }
      }
    }

    const createdWork = await this.createWork({
      studentId,
      workId,
      checkDeadlineAt: material.workCheckDeadline,
      solveDeadlineAt: material.workSolveDeadline,
    } as CreateOptions)

    return { link: `/assigned-works/${createdWork.id}/solve` }
  }

  public async solveWork(
    assignedWorkId: AssignedWork['id'],
    solveOptions: SolveOptions,
    studentId: User['id']
  ) {
    const foundWork = await this.getAssignedWork(assignedWorkId, ['student'])

    if (!foundWork) {
      throw new NotFoundError()
    }

    if (foundWork.studentId !== studentId) {
      throw new UnauthorizedError('Вы не можете решить чужую работу')
    }

    if (workAlreadyMade(foundWork)) {
      throw new WorkAlreadySolvedError()
    }

    const work = await this.workRepository.findOne({ id: foundWork.workId }, [
      'tasks',
    ])

    if (!work) {
      throw new NotFoundError()
    }

    if (
      foundWork.solveDeadlineAt &&
      Dates.isInPast(foundWork.solveDeadlineAt)
    ) {
      foundWork.solveStatus = 'made-after-deadline'
    } else {
      foundWork.solveStatus = 'made-in-deadline'
    }

    foundWork.solvedAt = Dates.now()
    foundWork.answers = solveOptions.answers
    foundWork.comments = this.taskService.automatedCheck(
      work.tasks,
      solveOptions.answers
    )

    foundWork.studentComment = solveOptions.studentComment || null

    if (work.tasks.every((task) => isAutomaticallyCheckable(task.type))) {
      foundWork.checkStatus = 'checked-automatically'
      foundWork.checkedAt = Dates.now()
      foundWork.score = this.getScore(foundWork.comments)
      foundWork.maxScore = this.getMaxScore(
        work.tasks,
        foundWork.excludedTaskIds
      )
    }

    await this.assignedWorkRepository.update(foundWork)

    await this.calenderService.createWorkMadeEvent({ ...foundWork, work })

    await this.notificationService.generateAndSend(
      'assigned-work.work-made-for-student',
      foundWork.student!.id,
      { assignedWork: { ...foundWork, work } }
    )

    if (foundWork.checkStatus !== 'checked-automatically') {
      for (const mentor of foundWork.mentors!) {
        await this.notificationService.generateAndSend(
          'assigned-work.work-made-for-mentor',
          mentor.id,
          { assignedWork: { ...foundWork, work } }
        )
      }
    }
  }

  public async checkWork(
    assignedWorkId: AssignedWork['id'],
    checkOptions: CheckOptions,
    checkerId: User['id']
  ) {
    const foundWork = await this.getAssignedWork(assignedWorkId, [
      'mentors',
      'student',
    ])

    if (!foundWork) {
      throw new NotFoundError()
    }

    if (!foundWork.mentors!.some((mentor) => mentor.id === checkerId)) {
      throw new UnauthorizedError(
        'Вы не можете проверить эту работу, так как не являетесь куратором этой работы'
      )
    }

    if (workAlreadyChecked(foundWork)) {
      throw new WorkAlreadyCheckedError()
    }

    if (!workAlreadyMade(foundWork)) {
      throw new WorkIsNotSolvedYetError()
    }

    const work = await this.workRepository.findOne({ id: foundWork.workId }, [
      'tasks',
    ])

    if (!work) {
      throw new NotFoundError('Работа не найдена')
    }

    if (
      foundWork.checkDeadlineAt &&
      Dates.isInPast(foundWork.checkDeadlineAt)
    ) {
      foundWork.checkStatus = 'checked-after-deadline'
    } else {
      foundWork.checkStatus = 'checked-in-deadline'
    }

    foundWork.answers = checkOptions.answers || []
    foundWork.comments = checkOptions.comments || []
    foundWork.checkedAt = Dates.now()
    foundWork.score = this.getScore(foundWork.comments)
    foundWork.maxScore = this.getMaxScore(work.tasks, foundWork.excludedTaskIds)

    if (checkOptions.mentorComment) {
      foundWork.mentorComment = checkOptions.mentorComment
    }

    await this.assignedWorkRepository.update(foundWork)

    foundWork.work = work

    await this.calenderService.createWorkCheckedEvent(foundWork)

    await this.notificationService.generateAndSend(
      'assigned-work.work-checked-for-student',
      foundWork.student!.id,
      { assignedWork: foundWork }
    )

    for (const mentor of foundWork.mentors!) {
      await this.notificationService.generateAndSend(
        'assigned-work.work-checked-for-mentor',
        mentor.id,
        { assignedWork: foundWork }
      )
    }
  }

  public async recheckAutomatically(workId: AssignedWork['id']) {
    const foundWork = await this.getAssignedWork(workId, ['answers'])

    if (!foundWork) {
      throw new NotFoundError('Работа не найдена')
    }

    if (foundWork.checkStatus !== 'checked-automatically') {
      throw new WorkIsNotSolvedYetError()
    }

    const work = await this.workRepository.findOne({ id: foundWork.workId }, [
      'tasks',
    ])

    if (!work) {
      throw new NotFoundError('Работа не найдена')
    }

    foundWork.comments = this.taskService.automatedCheck(
      work.tasks,
      foundWork.answers
    )

    foundWork.checkedAt = Dates.now()
    foundWork.score = this.getScore(foundWork.comments)

    await this.assignedWorkRepository.update(foundWork)
  }

  public async saveProgress(
    assignedWorkId: AssignedWork['id'],
    saveOptions: SaveOptions,
    role: User['role']
  ) {
    const foundWork = await this.getAssignedWork(assignedWorkId)

    if (!foundWork) {
      throw new NotFoundError()
    }

    if (role === 'student') {
      if (workAlreadyMade(foundWork)) {
        throw new WorkAlreadySolvedError()
      }

      foundWork.solveStatus = 'in-progress'
      foundWork.studentComment = saveOptions.studentComment || null
    } else if (role === 'mentor') {
      if (workAlreadyChecked(foundWork)) {
        throw new WorkAlreadyCheckedError()
      }

      if (!workAlreadyMade(foundWork)) {
        throw new WorkIsNotSolvedYetError()
      }

      foundWork.checkStatus = 'in-progress'
      foundWork.mentorComment = saveOptions.mentorComment || null
    } else {
      foundWork.answers = saveOptions.answers

      if (saveOptions.studentComment) {
        foundWork.studentComment = saveOptions.studentComment
      }

      return this.assignedWorkRepository.update(foundWork)
    }

    foundWork.answers = saveOptions.answers
    foundWork.comments = saveOptions.comments || foundWork.comments || []

    await this.assignedWorkRepository.update(foundWork)
  }

  public async saveAnswer(
    assignedWorkId: AssignedWork['id'],
    answer: AssignedWorkAnswer,
    userId: User['id']
  ): Promise<AssignedWorkAnswer['id']> {
    const foundWork = await this.getAssignedWork(assignedWorkId)

    if (foundWork.studentId !== userId) {
      throw new UnauthorizedError()
    }

    if (workAlreadyMade(foundWork)) {
      throw new WorkAlreadySolvedError()
    }

    if (foundWork.solveStatus !== 'in-progress') {
      foundWork.solveStatus = 'in-progress'
      await this.assignedWorkRepository.update(foundWork)
    }

    if (answer.id) {
      await this.answerRepository.update(answer)
      return answer.id
    }

    answer.assignedWork = { id: foundWork.id } as AssignedWork

    const createdAnswer = await this.answerRepository.create(answer)

    return createdAnswer.id
  }

  public async saveComment(
    assignedWorkId: AssignedWork['id'],
    comment: AssignedWorkComment,
    userId: User['id']
  ): Promise<AssignedWorkComment['id']> {
    const foundWork = await this.getAssignedWork(assignedWorkId)

    if (!foundWork.mentors!.some((mentor) => mentor.id === userId)) {
      throw new UnauthorizedError()
    }

    if (!workAlreadyMade(foundWork)) {
      throw new WorkIsNotSolvedYetError()
    }

    if (workAlreadyChecked(foundWork)) {
      throw new WorkAlreadyCheckedError()
    }

    if (foundWork.checkStatus !== 'in-progress') {
      foundWork.checkStatus = 'in-progress'
      await this.assignedWorkRepository.update(foundWork)
    }

    if (comment.id) {
      await this.commentRepository.update(comment)
      return comment.id
    }

    comment.assignedWork = { id: foundWork.id } as AssignedWork

    const createdComment = await this.commentRepository.create(comment)

    return createdComment.id
  }

  public async archiveWork(id: AssignedWork['id'], role: User['role']) {
    const foundWork = await this.getAssignedWork(id)

    if (!foundWork) {
      throw new NotFoundError()
    }

    if (role === 'student') {
      foundWork.isArchivedByStudent = true
    } else if (role === 'mentor' || role === 'assistant') {
      foundWork.isArchivedByMentors = true
    }

    await this.assignedWorkRepository.update(foundWork)
  }

  public async unarchiveWork(id: AssignedWork['id'], role: User['role']) {
    const foundWork = await this.getAssignedWork(id)

    if (!foundWork) {
      throw new NotFoundError()
    }

    if (role === 'student') {
      foundWork.isArchivedByStudent = false
    } else if (role === 'mentor' || role === 'assistant') {
      foundWork.isArchivedByMentors = false
    }

    await this.assignedWorkRepository.update(foundWork)
  }

  public async transferWorkToAnotherMentor(
    workId: AssignedWork['id'],
    mentorId: AssignedWork['mentorIds'][0],
    currentMentorId: User['id']
  ) {
    const foundWork = await this.getAssignedWork(workId, [
      'work',
      'mentors',
      'student',
    ])

    if (!foundWork) {
      throw new NotFoundError()
    }

    if (foundWork.mentorIds.includes(mentorId)) {
      throw new WorkAlreadyAssignedToThisMentorError()
    }

    if (foundWork.mentorIds.length >= 2) {
      throw new WorkAlreadyAssignedToEnoughMentorsError()
    }

    const mentor = await this.userRepository.findOne({
      id: currentMentorId,
      role: 'mentor',
    })

    const newMentor = await this.userRepository.findOne({
      id: mentorId,
      role: 'mentor',
    })

    if (!mentor || !newMentor) {
      throw new NotFoundError('Куратор не найден')
    }

    foundWork.mentors = [mentor, newMentor]

    await this.assignedWorkRepository.update(foundWork)

    await this.notificationService.generateAndSend(
      'assigned-work.work-transferred-to-another-mentor',
      newMentor.id,
      { assignedWork: foundWork }
    )
  }

  public async replaceMentor(
    workId: AssignedWork['id'],
    newMentorentorId: User['id']
  ) {
    const assignedWork = await this.assignedWorkRepository.findOne({
      id: workId as any,
    })

    if (!assignedWork) {
      throw new NotFoundError()
    }

    const newMentor = await this.userRepository.findOne({
      id: newMentorentorId,
      role: 'mentor',
    })

    if (!newMentor) {
      throw new NotFoundError('Куратор не найден')
    }

    assignedWork.mentors = [newMentor]

    await this.assignedWorkRepository.update(assignedWork)
  }

  public async shiftDeadline(
    id: AssignedWork['id'],
    role: Exclude<User['role'], 'teacher' | 'admin'>,
    userId: User['id']
  ) {
    const work = await this.getAssignedWork(id, ['mentors'])

    const days: number = AssignedWorkOptions.deadlineShift
    const mentorAlsoDays: number = AssignedWorkOptions.mentorDeadlineAlsoShift

    if (role == 'student') {
      if (work.studentId !== userId) {
        throw new UnauthorizedError()
      }

      if (!work.solveDeadlineAt) {
        throw new SolveDeadlineNotSetError()
      }

      if (work.solveDeadlineShifted) {
        throw new DeadlineAlreadyShiftedError()
      }

      if (workAlreadyMade(work)) {
        throw new WorkAlreadySolvedError()
      }

      work.solveDeadlineAt = Dates.addDays(work.solveDeadlineAt, days)
      work.solveDeadlineShifted = true

      // also shift mentors deadline
      if (work.checkDeadlineAt) {
        work.checkDeadlineAt = Dates.addDays(
          work.checkDeadlineAt,
          mentorAlsoDays
        )
      }

      await this.calenderService.updateDeadlineFromWork(
        work,
        'student-deadline'
      )
    } else {
      if (!work.mentors!.some((mentor) => mentor.id === userId)) {
        throw new UnauthorizedError()
      }

      if (!work.checkDeadlineAt) {
        throw new CheckDeadlineNotSetError()
      }

      if (work.checkDeadlineShifted) {
        throw new DeadlineAlreadyShiftedError()
      }

      if (workAlreadyChecked(work)) {
        throw new WorkAlreadyCheckedError()
      }

      work.checkDeadlineAt = Dates.addDays(work.checkDeadlineAt, days)
      work.checkDeadlineShifted = true

      await this.calenderService.updateDeadlineFromWork(work, 'mentor-deadline')
    }

    await this.assignedWorkRepository.update(work)

    return {
      newSolveDeadlineAt: work.solveDeadlineAt,
      newCheckDeadlineAt: work.checkDeadlineAt,
    }
  }

  public async sendToRevision(
    workId: AssignedWork['id'],
    mentorId: User['id']
  ) {
    const work = await this.getAssignedWork(workId, ['mentors'])

    if (!work) {
      throw new NotFoundError()
    }

    if (!work.mentors!.some((mentor) => mentor.id === mentorId)) {
      throw new UnauthorizedError()
    }

    if (workAlreadyChecked(work) || work.checkStatus === 'in-progress') {
      throw new WorkAlreadyCheckedError()
    }

    if (!workAlreadyMade(work)) {
      throw new WorkIsNotSolvedYetError()
    }

    work.solveStatus = 'in-progress'
    work.solvedAt = null

    await this.assignedWorkRepository.update(work)
  }

  public async sendToRecheck(
    assignedWorkId: AssignedWork['id'],
    userId: User['id'],
    userRole: User['role']
  ) {
    const foundWork = await this.getAssignedWork(assignedWorkId, ['mentors'])

    if (!foundWork) {
      throw new NotFoundError()
    }

    if (
      userRole === 'mentor' &&
      !foundWork.mentors!.some((mentor) => mentor.id === userId)
    ) {
      throw new UnauthorizedError()
    }

    if (!workAlreadyChecked(foundWork)) {
      throw new WorkIsNotCheckedYetError()
    }

    foundWork.checkStatus = 'in-progress'
    foundWork.checkedAt = null

    await this.assignedWorkRepository.update(foundWork)
  }

  public async deleteWork(
    id: AssignedWork['id'],
    userId: User['id'],
    userRole: User['role']
  ) {
    const foundWork = await this.assignedWorkRepository.findOne({ id }, [
      'mentors',
      'student',
    ])

    if (!foundWork) {
      throw new NotFoundError(
        'Работа не найдена. Возможно, она была уже удалена'
      )
    }

    if (
      userRole === 'mentor' &&
      !foundWork.mentors!.some((mentor) => mentor.id === userId)
    ) {
      throw new UnauthorizedError()
    }

    if (userRole === 'student' && foundWork.studentId !== userId) {
      throw new UnauthorizedError()
    }

    if (workAlreadyMade(foundWork)) {
      throw new CantDeleteMadeWorkError()
    }

    await this.assignedWorkRepository.delete(id)
  }

  private async getAssignedWork(
    id: AssignedWork['id'],
    relations: (keyof AssignedWork)[] = []
  ) {
    const assignedWork = await this.assignedWorkRepository.findOne(
      { id },
      relations
    )

    if (!assignedWork) {
      throw new NotFoundError('Работа не найдена')
    }

    this.excludeTasks(assignedWork)

    return assignedWork
  }

  private excludeTasks(assignedWork: AssignedWork) {
    const tasksToExclude = assignedWork.excludedTaskIds

    if (tasksToExclude.length && assignedWork?.work?.tasks) {
      assignedWork.work.tasks = assignedWork.work.tasks.filter(
        (task) => !tasksToExclude.includes(task.id)
      )
    }
  }

  private getMaxScore(
    tasks: AssignedWork['work']['tasks'],
    excludedTaskIds: string[] = []
  ) {
    const filteredTasks = tasks.filter(
      (task) => !excludedTaskIds.includes(task.id)
    )

    return filteredTasks.reduce((acc, task) => acc + task.highestScore, 0)
  }

  private getScore(comments: AssignedWorkComment[]) {
    return comments.reduce((acc, comment) => acc + comment.score, 0)
  }
}
