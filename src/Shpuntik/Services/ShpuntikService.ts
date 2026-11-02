import { AssignedWorkCommentModel } from '@modules/AssignedWorks/Data/Relations/AssignedWorkCommentModel'
import type { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import type { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
import type { AssignedWorkComment } from '@modules/AssignedWorks/Data/Relations/AssignedWorkComment'
import { AssignedWorkService } from '@modules/AssignedWorks/Services/AssignedWorkService'
import { isAutomaticallyCheckable } from '@modules/AssignedWorks/Utils/Task'
import { TaskCanNotBeCheckedByAiError } from '../Errors/TaskCanNotBeCheckedByAiError'
import {
  workAlreadyChecked,
  workAlreadyMade,
} from '@modules/AssignedWorks/Utils/AssignedWork'
import { WorkIsNotSolvedYetError } from '@modules/AssignedWorks/Errors/WorkIsNotSolvedYetError'
import { WorkAlreadyCheckedError } from '@modules/AssignedWorks/Errors/WorkAlreadyCheckedError'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { isDeltaEmpty, toDelta } from '@modules/Core/Utils/delta'
import { log } from '@modules/Core/Logs/Logger'
import { AiInteractor } from './AiInteractor'
import { AiPromptGenerator } from './AiPromptGenerator'
import { AiResponseParser } from './AiResponseParser'
import { TASK_CRITERIA } from '../Criteria/TaskCriteria'

export class ShpuntikService {
  private assignedWorkService: AssignedWorkService

  private aiInteractor: AiInteractor

  private aiPromptGenerator: AiPromptGenerator

  private aiResponseParser: AiResponseParser

  public constructor() {
    this.assignedWorkService = new AssignedWorkService()
    this.aiInteractor = new AiInteractor()
    this.aiPromptGenerator = new AiPromptGenerator()
    this.aiResponseParser = new AiResponseParser()
  }

  public async checkTask(workId: string, taskId: string): Promise<void> {
    const work = await this.getCheckableWork(workId)

    const task = work.work.tasks.find((t) => t.id === taskId)

    if (!task) {
      throw new NotFoundError('Задание не найдено')
    }

    if (isAutomaticallyCheckable(task.type)) {
      throw new TaskCanNotBeCheckedByAiError(
        'Это задание проверяется автоматически.'
      )
    }

    const comment = await this.checkTaskOfWork(work, task)

    if (!comment) {
      throw new TaskCanNotBeCheckedByAiError(
        'Ответ на задание пустой или задание уже прокомментировано.'
      )
    }

    await this.assignedWorkService.saveAiComments(work.id, [comment])
  }

  public async removeComment(workId: string, taskId: string): Promise<void> {
    const work = await this.getCheckableWork(workId)

    if (!work.work.tasks.some((t) => t.id === taskId)) {
      throw new NotFoundError('Задание не найдено')
    }

    await this.assignedWorkService.removeTaskComment(work.id, taskId)
  }

  private async getCheckableWork(workId: string): Promise<AssignedWork> {
    const work = await this.assignedWorkService.getWorkById(workId, 'teacher')

    if (!workAlreadyMade(work)) {
      throw new WorkIsNotSolvedYetError()
    }

    if (workAlreadyChecked(work)) {
      throw new WorkAlreadyCheckedError()
    }

    return work
  }

  /**
   * Checks a single task with AI.
   * Returns the comment to save or null if the task should be skipped.
   */
  private async checkTaskOfWork(
    work: AssignedWork,
    task: WorkTask
  ): Promise<AssignedWorkComment | null> {
    const answer = work.answers.find((a) => a.taskId === task.id)
    let comment = work.comments.find((c) => c.taskId === task.id)

    if (
      !answer?.content ||
      isDeltaEmpty(answer.content) ||
      !isDeltaEmpty(comment?.content)
    ) {
      return null
    }

    if (!comment) {
      comment = new AssignedWorkCommentModel({ taskId: task.id, score: 0 })
    }

    const criteria = TASK_CRITERIA[task.type] ?? []

    const prompt = this.aiPromptGenerator.generateCheckPrompt(
      task,
      answer.content,
      criteria
    )

    let aiResponse: string

    try {
      aiResponse = await this.aiInteractor.sendRequest(prompt)
    } catch (error: any) {
      log('error', 'Shpuntik AI request failed', error?.message ?? error)
      aiResponse = ''
    }

    const parsed = this.aiResponseParser.parseTaskCheckResponse(
      aiResponse,
      task.highestScore,
      criteria
    )

    if (parsed.status === 'error') {
      comment.content = toDelta(
        `НОО.Шпунтик не смог проверить задание из-за ошибки: ${parsed.error}\n`
      )
      comment.score = comment.score ?? 0
    } else {
      comment.content = parsed.feedback
      comment.score = parsed.score
      comment.detailedScore = parsed.detailedScore
    }

    return comment
  }
}
