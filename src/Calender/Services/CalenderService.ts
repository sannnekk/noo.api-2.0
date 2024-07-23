import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { Pagination } from '@modules/Core/Data/Pagination'
import { Service } from '@modules/Core/Services/Service'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'
import { User } from '@modules/Users/Data/User'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { CalenderEvent } from '../Data/CalenderEvent'
import { CalenderEventRepository } from '../Data/CalenderEventRepository'
import { CalenderEventModel } from '../Data/CalenderEventModel'
import { UserRelationService } from './UserRelationService'
import { EventCreationOptions } from '../DTO/EventCreationOptions'

export class CalenderService extends Service<CalenderEvent> {
  private readonly calenderEventRepository: CalenderEventRepository

  private readonly userRelationService: UserRelationService

  constructor() {
    super()

    this.calenderEventRepository = new CalenderEventRepository()
    this.userRelationService = new UserRelationService()
  }

  public async create(
    options: EventCreationOptions,
    username: User['username'],
    type: CalenderEvent['type'] = 'event'
  ): Promise<CalenderEvent> {
    const event = new CalenderEventModel(options)

    event.type = type
    event.username = username

    if (!event.url) {
      event.url = ''
    }

    return this.calenderEventRepository.create(event)
  }

  public async updateDeadlineFromWork(
    work: AssignedWork,
    type: 'student-deadline' | 'mentor-deadline'
  ): Promise<void> {
    const newDate =
      type === 'student-deadline' ? work.solveDeadlineAt : work.checkDeadlineAt

    const event = await this.calenderEventRepository.findOne({
      assignedWork: {
        id: work.id,
      },
      type,
    })

    if (!event || !newDate) {
      return
    }

    event.date = newDate
    event.description += ' (Дедлайн сдивнут на эту дату)'

    await this.calenderEventRepository.update(event)
  }

  public async get(requester: User['username'], pagination?: Pagination) {
    if (!pagination?.getFilter('username')) {
      throw new UnauthorizedError()
    }

    const condition = await this.userRelationService.getCondition(
      requester,
      pagination?.getFilter('username')
    )

    const events = await this.calenderEventRepository.find(
      condition,
      undefined,
      pagination
    )

    const meta = await this.getRequestMeta(
      this.calenderEventRepository,
      condition,
      pagination || new Pagination(),
      []
    )

    return { events, meta }
  }

  public async getOne(
    id: CalenderEvent['id'],
    username: User['username']
  ): Promise<CalenderEvent | null> {
    const event = await this.calenderEventRepository.findOne({ id })

    if (event && event?.username !== username) {
      throw new UnauthorizedError()
    }

    return event
  }

  public async update(
    id: CalenderEvent['id'],
    event: Partial<CalenderEvent>,
    username: User['username']
  ): Promise<void> {
    const foundEvent = await this.calenderEventRepository.findOne({
      id,
    })

    if (foundEvent && foundEvent?.username !== username) {
      throw new UnauthorizedError()
    }

    await this.calenderEventRepository.update({ ...event, id })
  }

  public async delete(
    id: CalenderEvent['id'],
    username: User['username']
  ): Promise<void> {
    const foundEvent = await this.calenderEventRepository.findOne({
      id,
    })

    if (!foundEvent) {
      throw new NotFoundError('Событие не найдено')
    }

    if (foundEvent.username !== username) {
      throw new UnauthorizedError()
    }

    await this.calenderEventRepository.delete(id)
  }

  public async createSolveDeadlineEvent(work: AssignedWork): Promise<void> {
    await this.calenderEventRepository.create({
      title: 'Дедлайн по работе',
      description: `Работа: ${work.work.name}`,
      date: work.solveDeadlineAt!,
      url: `/assigned-works/${work.id}/solve`,
      visibility: 'all',
      type: 'student-deadline',
      username: work.student!.username,
      assignedWork: work,
    } as CalenderEvent)
  }

  public async createCheckDeadlineEvent(work: AssignedWork): Promise<void> {
    await Promise.all(
      (work.mentors || []).map((mentor) => {
        return this.calenderEventRepository.create(
          new CalenderEventModel({
            title: 'Дедлайн по проверке работы',
            description: `Работа: ${work.work.name}`,
            date: work.checkDeadlineAt!,
            url: `/assigned-works/${work.id}/check`,
            visibility: 'private',
            type: 'mentor-deadline',
            username: mentor.username,
            assignedWork: work,
          })
        )
      })
    )
  }

  public async createWorkMadeEvent(work: AssignedWork): Promise<void> {
    await this.calenderEventRepository.create(
      new CalenderEventModel({
        title: `${work.student!.name}: Работа сдана`,
        description: `Работа: ${work.work.name}`,
        date: work.solvedAt!,
        url: `/assigned-works/${work.id}/read`,
        visibility: 'all',
        type: 'work-made',
        username: work.student!.username,
        assignedWork: work,
      })
    )
  }

  public async createWorkCheckedEvent(work: AssignedWork): Promise<void> {
    await Promise.all(
      [...(work.mentors || []), work.student!].filter(Boolean).map((user) => {
        return this.calenderEventRepository.create(
          new CalenderEventModel({
            title: `${work.student!.name}: Работа проверена`,
            description: `Работа: ${work.work.name}`,
            date: work.checkedAt!,
            url: `/assigned-works/${work.id}/read`,
            visibility: 'private',
            type: 'work-checked',
            username: user.username,
            assignedWork: work,
          })
        )
      })
    )
  }
}
