import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { GoogleDocsBinding } from '../Data/GoogleDocsBinding'
import { GoogleAuthService } from './Google/GoogleAuthService'
import { GoogleDriveService } from './Google/GoogleDriveService'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { PollRepository } from '@modules/Polls/Data/PollRepository'
import { PollAnswerRepository } from '@modules/Polls/Data/PollAnswerRepository'
import { PollQuestion } from '@modules/Polls/Data/Relations/PollQuestion'
import { Pagination } from '@modules/Core/Data/Pagination'

export type DataToSync = {
  filename: string
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
  public async sync(binding: GoogleDocsBinding): Promise<string[]> {
    const data = await this.getBindingData(
      binding.entityName,
      binding.entitySelector
    )

    const auth = await this.googleAuthService.getAuthObject(
      binding.googleOAuthToken,
      binding.googleRefreshToken
    )

    return this.googleDriveService.syncFile(binding.filePath, data, auth)
  }

  private async getBindingData(
    entityName: GoogleDocsBinding['entityName'],
    entitySelector: GoogleDocsBinding['entitySelector']
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
    selector: GoogleDocsBinding['entitySelector']
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

    const users = await this.userRepository.find(
      {
        [selector.prop]: selector.value,
      },
      undefined,
      new Pagination(1, 999999)
    )

    return {
      filename: `Пользователи (селектор: ${selector.value})`,
      header,
      data: users,
    }
  }

  private async getPollAnswerData(
    selector: GoogleDocsBinding['entitySelector']
  ): Promise<DataToSync> {
    // assumes the selector is {pollId: 'some-id'}, TODO: change it in the future

    const poll = await this.pollRepository.findOne(
      {
        id: selector.value,
      },
      ['questions'],
      undefined,
      'query'
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

    const answers = await this.pollAnswerRepository.find(
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

        acc[userAuthIdentifier][answer.questionId] = answerText

        return acc
      },
      {} as Record<string, Record<string, string>>
    )

    return {
      filename: `Результаты опроса ${poll.title}`,
      header,
      data: Object.values(data),
    }
  }
}
