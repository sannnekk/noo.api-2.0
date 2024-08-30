import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Pagination } from '@modules/Core/Data/Pagination'
import { User } from '@modules/Users/Data/User'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { Poll } from '../Data/Poll'
import { PollRepository } from '../Data/PollRepository'
import { PollAnswerRepository } from '../Data/PollAnswerRepository'
import { PollAnswer } from '../Data/Relations/PollAnswer'
import { PollAnswerModel } from '../Data/Relations/PollAnswerModel'
import { AlreadyVotedError } from '../Errors/AlreadyVotedError'
import { CantVoteInPollError } from '../Errors/CantVoteInPollError'
import { InvalidAuthTypeError } from '../Errors/InvalidAuthTypeError'
import { PollAuthService } from './PollAuthService'
import { z } from 'zod'
import * as TypeORM from 'typeorm'
import { PollQuestion } from '../Data/Relations/PollQuestion'
import { PollQuestionRepository } from '../Data/PollQuestionRepository'
import { UnknownError } from '@modules/Core/Errors/UnknownError'
import { NotificationService } from '@modules/Notifications/Services/NotificationService'

export class PollService {
  private readonly pollRepository: PollRepository

  private readonly pollAnswerRepository: PollAnswerRepository

  private readonly pollQuestionRepository: PollQuestionRepository

  private readonly userRepository: UserRepository

  private readonly pollAuthService: PollAuthService

  private readonly notificationService: NotificationService

  constructor() {
    this.pollRepository = new PollRepository()
    this.pollAnswerRepository = new PollAnswerRepository()
    this.pollQuestionRepository = new PollQuestionRepository()
    this.userRepository = new UserRepository()
    this.pollAuthService = new PollAuthService()
    this.notificationService = new NotificationService()
  }

  public async getPolls(pagination: Pagination) {
    pagination = new Pagination().assign(pagination)

    const relations = [] as (keyof Poll)[]
    const conditions = {} as Partial<Poll>

    return this.pollRepository.search(conditions as any, pagination, relations)
  }

  public async searchQuestions(pagination: Pagination, pollId?: Poll['id']) {
    pagination = new Pagination().assign(pagination)

    const relations = ['poll'] as any as (keyof PollQuestion)[]

    const conditions: Partial<PollQuestion> = {
      poll: {
        post: {
          id: TypeORM.Not(TypeORM.IsNull()) as any,
        } as any,
      } as any,
    }

    if (pollId) {
      conditions.poll!.id = pollId
    }

    return this.pollQuestionRepository.search(
      conditions as any,
      pagination,
      relations
    )
  }

  public async getPollById(id: Poll['id'], userId?: User['id']): Promise<Poll> {
    const poll = await this.pollRepository.findOne({ id }, ['questions'], {
      questions: {
        order: 'ASC',
      },
    })

    if (!poll) {
      throw new NotFoundError('Опрос не найден')
    }

    if (poll.requireAuth && !userId) {
      throw new UnauthorizedError('Необходимо авторизоваться для голосования')
    }

    return poll
  }

  public async getPollInfo(id: Poll['id']): Promise<Poll> {
    const poll = await this.pollRepository.findOne({ id })

    if (!poll) {
      throw new NotFoundError('Опрос не найден')
    }

    return poll
  }

  public async searchWhoVoted(
    userRole: User['role'],
    pollId: Poll['id'],
    pagination: Pagination
  ) {
    if (!(await this.canSeeResults(userRole, pollId))) {
      throw new UnauthorizedError()
    }

    pagination = new Pagination().assign(pagination)

    const relations = [] as (keyof User)[]
    const conditions = {
      votedPolls: {
        id: pollId,
      } as unknown as Poll[],
    }

    /* return {
      entities: [],
      meta: {
        total: 0,
        relations: [],
      },
    } */

    return this.userRepository.search(conditions as any, pagination, relations)
  }

  // !!! TEST THIS
  public async searchWhoVotedUnregistered(
    userRole: User['role'],
    pollId: Poll['id'],
    pagination: Pagination
  ) {
    if (!(await this.canSeeResults(userRole, pollId))) {
      throw new UnauthorizedError()
    }

    pagination = new Pagination().assign(pagination)

    const relations: (keyof PollAnswer)[] = []
    const groupBy: keyof PollAnswer = 'userAuthData'
    const conditions = {
      userAuthType: TypeORM.Not('api'),
      question: {
        poll: {
          id: pollId,
        },
      },
    } as unknown as Partial<PollAnswer>

    const { entities, meta } = await this.pollAnswerRepository.search(
      conditions as any,
      pagination,
      relations,
      groupBy,
      {
        useEagerRelations: false,
        select: [
          ['user_auth_identifier', ' identifier'],
          ['JSON_EXTRACT(user_auth_data, "$.id")', 'id'],
          [
            'JSON_UNQUOTE(JSON_EXTRACT(user_auth_data, "$.photo_url"))',
            'avatarUrl',
          ],
          [
            'JSON_UNQUOTE(JSON_EXTRACT(user_auth_data, "$.username"))',
            'username',
          ],
          [
            'JSON_UNQUOTE(JSON_EXTRACT(user_auth_data, "$.first_name"))',
            'firstName',
          ],
          [
            'JSON_UNQUOTE(JSON_EXTRACT(user_auth_data, "$.last_name"))',
            'lastName',
          ],
        ],
      }
    )

    return { entities, meta }
  }

  public async getAnswers(
    userRole: User['role'],
    pollId: Poll['id'],
    idOrTelegramUsername: User['id'] | string
  ) {
    if (!(await this.canSeeResults(userRole, pollId))) {
      throw new UnauthorizedError()
    }

    const relations = [] as (keyof PollAnswer)[]
    const conditions = {
      question: {
        poll: {
          id: pollId,
        },
      },
      userAuthIdentifier: TypeORM.ILike(`%${idOrTelegramUsername}%`),
    }

    if (z.string().ulid().safeParse(idOrTelegramUsername).success) {
      // @ts-expect-error TypeORM doesn't support union types
      conditions.user = {
        id: idOrTelegramUsername,
      }
      // @ts-expect-error TypeORM doesn't support union types
      delete conditions.userAuthIdentifier
    }

    const { entities: answers } = await this.pollAnswerRepository.search(
      conditions as any,
      new Pagination(1, 250),
      relations
    )

    return answers
  }

  public async saveAnswers(
    userId: User['id'] | undefined,
    userRole: User['role'] | undefined,
    pollId: Poll['id'],
    answers: PollAnswer[]
  ): Promise<void> {
    if (!(await this.canVote(userRole, pollId))) {
      throw new CantVoteInPollError()
    }

    if (userId && (await this.userAlreadyVoted(userId, pollId))) {
      throw new AlreadyVotedError()
    }

    const poll = await this.pollRepository.findOne({ id: pollId }, [
      'votedUsers',
    ])

    if (!poll) {
      throw new NotFoundError()
    }

    // TODO: add user more efficient
    if (userId) {
      poll.votedUsers!.push({ id: userId } as User)
    } else {
      this.answersHaveValidAuth(answers)
    }

    poll.votedCount += 1

    const answerModels = answers.map((answer) => {
      let data = { ...answer }

      if (userId) {
        data = { ...data, user: { id: userId } as User }
      } else {
        data = {
          ...data,
          userAuthData: this.removeEmojisAndNonUTF8(
            JSON.stringify(answer.userAuthData)
          ) as any,
          userAuthIdentifier: (answer.userAuthData!.username ||
            '_telegram_id_' + answer.userAuthData!.id) as string,
        }
      }

      return new PollAnswerModel(data)
    })

    this.pollRepository.update(poll)
    try {
      this.pollAnswerRepository.createMany(answerModels)

      if (userId) {
        this.notificationService.generateAndSend('poll.poll-answered', userId, {
          poll,
        })
      }
    } catch (error) {
      throw new UnknownError('Не удалось сохранить ответы')
    }
  }

  public async editAnswer(
    id: PollAnswer['id'],
    data: PollAnswer
  ): Promise<void> {
    const answer = await this.pollAnswerRepository.findOne({ id })

    if (!answer) {
      throw new NotFoundError('Ответ не найден')
    }

    const newAnswer = new PollAnswerModel({ ...answer, ...data, id })

    await this.pollAnswerRepository.update(newAnswer)
  }

  private async userAlreadyVoted(
    userId: User['id'],
    pollId: Poll['id']
  ): Promise<boolean> {
    const existingAnswer = await this.pollAnswerRepository.findOne({
      question: {
        poll: {
          id: pollId,
        },
      },
      user: {
        id: userId,
      },
    })

    return existingAnswer !== null
  }

  private async canVote(
    role: User['role'] | undefined,
    pollId: Poll['id']
  ): Promise<boolean> {
    const poll = await this.pollRepository.findOne({
      id: pollId,
    })

    if (!poll) {
      throw new NotFoundError('Опрос не найден')
    }

    if (poll.requireAuth && !role) {
      throw new UnauthorizedError('Необходимо авторизоваться для голосования')
    } else if (!poll.requireAuth && !role) {
      return true
    }

    return poll.canVote.includes(role!) || poll.canVote.includes('everyone')
  }

  private async canSeeResults(
    role: User['role'],
    pollId: Poll['id']
  ): Promise<boolean> {
    const poll = await this.pollRepository.findOne({
      id: pollId,
    })

    if (!poll) {
      throw new NotFoundError('Опрос не найден')
    }

    return (
      poll.canSeeResults.includes(role) ||
      poll.canSeeResults.includes('everyone')
    )
  }

  private answersHaveValidAuth(answers: PollAnswer[]) {
    for (const answer of answers) {
      switch (answer.userAuthType) {
        case 'telegram':
          this.pollAuthService.checkTelegramAuth(answer.userAuthData)
          break
        case 'api':
          break
        default:
          throw new InvalidAuthTypeError()
      }
    }
  }

  private removeEmojisAndNonUTF8(str: string): string {
    // Remove emojis and symbols, including those outside the BMP
    // This targets symbols and pictographs, including emojis
    return (
      str
        .replace(/[\p{So}\p{C}]/gu, '')
        // Remove surrogate pairs for characters outside the BMP
        .replace(/[\uD800-\uDFFF]/g, '')
    )
  }
}
