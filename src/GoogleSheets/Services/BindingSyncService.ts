import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { GoogleSheetsBinding } from '../Data/GoogleSheetsBinding'
import { GoogleAuthService } from './Google/GoogleAuthService'
import { GoogleDriveService } from './Google/GoogleDriveService'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { PollRepository } from '@modules/Polls/Data/PollRepository'
import { PollAnswerRepository } from '@modules/Polls/Data/PollAnswerRepository'
import { PollQuestion } from '@modules/Polls/Data/Relations/PollQuestion'
import { Pagination } from '@modules/Core/Data/Pagination'
import { FindOptionsWhere } from 'typeorm'
import { BaseModel } from '@modules/Core/Data/Model'

export type DataToSync = {
  header: {
    title: string
    key: string
  }[]
  data: any[]
}

export class BindingSyncService {
  private readonly googleAuthService: GoogleAuthService

  private readonly googleDriveService: GoogleDriveService

  private readonly userRepository: UserRepository

  private readonly pollRepository: PollRepository

  private readonly pollAnswerRepository: PollAnswerRepository

  public constructor() {
    this.googleAuthService = new GoogleAuthService()
    this.googleDriveService = new GoogleDriveService()
    this.userRepository = new UserRepository()
    this.pollRepository = new PollRepository()
    this.pollAnswerRepository = new PollAnswerRepository()
  }

  /**
   * Start sync process
   *
   * @param binding Binding to sync
   * @returns Array of file ids as file path
   */
  public async sync(binding: GoogleSheetsBinding): Promise<string[]> {
    const data = await this.getBindingData(
      binding.entityName,
      binding.entitySelector
    )

    const auth = await this.googleAuthService.getAuthObject(
      binding.googleOAuthToken,
      binding.googleRefreshToken
    )

    return this.googleDriveService.syncFile(
      binding.name,
      binding.filePath,
      data,
      auth
    )
  }

  private async getBindingData(
    entityName: GoogleSheetsBinding['entityName'],
    entitySelector: GoogleSheetsBinding['entitySelector']
  ): Promise<DataToSync> {
    switch (entityName) {
      case 'user':
        return this.getUserData(entitySelector)
      case 'poll_answer':
        return this.getPollAnswerData(entitySelector)
      default:
        throw new NotFoundError('Модуль для синхронизации не найден')
    }
  }

  private async getUserData(
    selector: GoogleSheetsBinding['entitySelector']
  ): Promise<DataToSync> {
    const header: DataToSync['header'] = [
      {
        title: 'Никнейм',
        key: 'username',
      },
      {
        title: 'Имя',
        key: 'name',
      },
      {
        title: 'Email',
        key: 'email',
      },
      {
        title: 'Роль',
        key: 'role',
      },
      {
        title: 'Дата регистрации',
        key: 'createdAt',
      },
      {
        title: 'Telegram',
        key: 'telegramUsername',
      },
    ]

    const condition = this.prepareCondition(selector)

    const { entities: users } = await this.userRepository.find(
      condition,
      undefined,
      new Pagination(1, 999999)
    )

    return {
      header,
      data: users,
    }
  }

  private async getPollAnswerData(
    selector: GoogleSheetsBinding['entitySelector']
  ): Promise<DataToSync> {
    const condition = this.prepareCondition(selector)

    const poll = await this.pollRepository.findOne(
      condition,
      ['questions'],
      undefined,
      {
        relationLoadStrategy: 'query',
      }
    )

    if (!poll) {
      throw new NotFoundError('Опрос не найден')
    }

    // sort questions by order field
    poll.questions.sort((a, b) => a.order - b.order)

    const header: DataToSync['header'] = poll.questions.map(
      (question, index) => ({
        title: `${index + 1}. ${question.text}`,
        key: question.id,
      })
    )

    header.push({
      title: 'Ссылка на ответы',
      key: 'pollLink',
    })

    const { entities: answers } = await this.pollAnswerRepository.find(
      {
        question: {
          poll: {
            id: selector.value,
          },
        } as PollQuestion,
      },
      undefined,
      new Pagination(1, 999999)
    )

    const userIds = answers.map((answer) => answer.userId).filter(Boolean)

    const users = await this.userRepository.findAll(
      userIds.map((id) => ({
        id,
      }))
    )

    // Record<userAuthIdentifier, Record<questionId, answerText>>
    const data = answers.reduce(
      (acc, answer) => {
        const userAuthIdentifier =
          answer.userAuthIdentifier || answer.userId || '-'

        if (!acc[userAuthIdentifier]) {
          acc[userAuthIdentifier] = {}
        }

        let answerText

        switch (answer.questionType) {
          case 'choice':
            answerText = answer.choices?.join(', ') || '-'
            break
          case 'date':
            answerText = answer.date ? answer.date.toLocaleString() : '-'
            break
          case 'number':
            answerText = answer.number ? String(answer.number) : '-'
            break
          case 'rating':
            answerText = answer.rating ? String(answer.rating) : '-'
            break
          case 'file':
            answerText = answer.files
              ? answer.files
                  .map((media) => process.env.CDN_URL + media.src)
                  .join(', ')
              : '-'
            break
          case 'text':
          default:
            answerText = answer.text || '-'
            break
        }

        const username = users.find(
          (user) => user.id === answer.userId
        )?.username

        acc[userAuthIdentifier][answer.questionId] = answerText
        acc[userAuthIdentifier].pollLink = username
          ? `https://noo-school.ru/polls/${poll.id}/results/${username}`
          : '-'

        return acc
      },
      {} as Record<string, Record<string, string>>
    )

    return {
      header,
      data: Object.values(data),
    }
  }

  private prepareCondition<T extends BaseModel>(
    selector: GoogleSheetsBinding['entitySelector']
  ): FindOptionsWhere<T> {
    switch (selector.prop) {
      case 'pollId':
        return {
          id: selector.value,
        } as any
      case 'courseId':
        return {
          courseAssignments: {
            course: {
              id: selector.value,
            },
          },
        } as any
      case 'role':
        return {
          role: selector.value,
        } as any
    }

    throw new NotFoundError('Тип селектора не найден')
  }
}
