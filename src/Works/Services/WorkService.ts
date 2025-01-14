import { Pagination } from '@modules/Core/Data/Pagination'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { WorkRepository } from '../Data/WorkRepository'
import { Work } from '../Data/Work'
import { WorkModel } from '../Data/WorkModel'
import { WorkDTO } from '../DTO/WorkDTO'
import { Subject } from '@modules/Subjects/Data/Subject'
import { CourseMaterialRepository } from '@modules/Courses/Data/CourseMaterialRepository'
import { WorkStatisticsDTO } from '../DTO/WorkStatisticsDTO'
import { WorkTaskRepository } from '../Data/WorkTaskRepository'
import { AssignedWorkRepository } from '@modules/AssignedWorks/Data/AssignedWorkRepository'
import { round } from '@modules/Core/Utils/math'

export class WorkService {
  private readonly workRepository: WorkRepository

  private readonly workTaskRepository: WorkTaskRepository

  private readonly assignedWorkRepository: AssignedWorkRepository

  private readonly courseMaterialRepository: CourseMaterialRepository

  constructor() {
    this.workRepository = new WorkRepository()
    this.courseMaterialRepository = new CourseMaterialRepository()
    this.assignedWorkRepository = new AssignedWorkRepository()
    this.workTaskRepository = new WorkTaskRepository()
  }

  public async getWorks(pagination?: Pagination) {
    pagination = new Pagination().assign(pagination)

    return this.workRepository.search(undefined, pagination)
  }

  public async getWorkBySlug(slug: Work['slug']) {
    const work = await this.workRepository.findOne({ slug }, ['tasks'], {
      tasks: { order: 'ASC' },
    })

    if (!work) {
      throw new NotFoundError()
    }

    return work
  }

  public async getWorkById(id: Work['id']) {
    const work = await this.workRepository.findOne({ id }, ['tasks'], {
      tasks: { order: 'ASC' },
    })

    if (!work) {
      throw new NotFoundError()
    }

    return work
  }

  public async getWorkStatistics(id: Work['id']): Promise<WorkStatisticsDTO> {
    const work = await this.getWorkById(id)

    const maxScore = await this.workTaskRepository.getWorkMaxScore(work.id)

    const hardestTaskIds = await this.workTaskRepository.getHardestTaskIds(
      id,
      3
    )

    const averageWorkScore =
      await this.assignedWorkRepository.getAverageWorkScore(id)

    const averageWorkScorePercentage = (averageWorkScore / maxScore) * 100

    const medianWorkScore =
      await this.assignedWorkRepository.getMedianWorkScore(id)

    const medianWorkScorePercentage = (medianWorkScore / maxScore) * 100

    const workSolveCount = await this.assignedWorkRepository.getWorkSolveCount(
      id,
      false
    )

    return {
      hardestTaskIds,
      averageWorkScore: {
        absolute: round(averageWorkScore, 2),
        percentage: round(averageWorkScorePercentage, 2),
      },
      medianWorkScore: {
        absolute: round(medianWorkScore, 2),
        percentage: round(medianWorkScorePercentage, 2),
      },
      workSolveCount,
      work,
    }
  }

  public async getWorkRelatedMaterials(
    id: Work['id'],
    pagination?: Pagination
  ) {
    const work = await this.workRepository.findOne({ id })

    if (!work) {
      throw new NotFoundError('Работа не найдена')
    }

    return this.courseMaterialRepository.search(
      {
        work: { id: work.id },
      },
      pagination,
      ['chapter.course']
    )
  }

  public async createWork(workDTO: WorkDTO) {
    const work = new WorkModel(workDTO)
    return this.workRepository.create(work)
  }

  public async copyWork(workSlug: Work['slug']) {
    const work = await this.workRepository.findOne({ slug: workSlug }, [
      'tasks',
      'subject',
    ])

    if (!work) {
      throw new NotFoundError('Работа не найдена')
    }

    const newWork = {
      type: work.type,
      name: `[копия] ${work.name}`,
      description: work.description,
      subject: {
        id: work.subject!.id,
      } as Subject,
    } as Work

    newWork.tasks = work.tasks.map(
      (task) =>
        ({
          order: task.order,
          content: task.content,
          highestScore: task.highestScore,
          type: task.type,
          checkingStrategy: task.checkingStrategy,
          rightAnswer: task.rightAnswer,
          solveHint: task.solveHint,
          checkHint: task.checkHint,
        }) as unknown as Work['tasks'][0]
    )

    this.workRepository.create(newWork)
  }

  public async updateWork(id: Work['id'], work: WorkDTO) {
    const foundWork = await this.workRepository.findOne({ id: work.id })

    if (!foundWork) {
      throw new NotFoundError()
    }

    const newWork = new WorkModel({ ...foundWork, ...work })

    return this.workRepository.update(newWork)
  }

  public async deleteWork(id: Work['id']) {
    const foundWork = await this.workRepository.findOne({ id })

    if (!foundWork) {
      throw new NotFoundError()
    }

    return this.workRepository.delete(id)
  }
}
