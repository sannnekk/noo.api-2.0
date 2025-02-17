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
import { PollQuestionRepository } from '../Data/PollQuestionRepository'
import { NotificationService } from '@modules/Notifications/Services/NotificationService'
import { PollModel } from '../Data/PollModel'
import { PollAlreadyEndedError } from '../Errors/PollAlreadyEndedError'

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
    return this.pollRepository.search(undefined, pagination)
  }

  public async getMyPolls(userId: User['id'], pagination: Pagination) {
    const myPollIds = await this.pollAnswerRepository.getMyPollIds(userId)

    return this.pollRepository.search(
      {
        id: TypeORM.In(myPollIds),
      },
      pagination
    )
  }

  public async createPoll(poll: Poll) {
    return this.pollRepository.create(poll)
  }

  public async updatePoll(id: Poll['id'], data: Partial<Poll>) {
    const poll = await this.pollRepository.findOne({ id })

    if (!poll) {
      throw new NotFoundError('Опрос не найден')
    }

    const updatedPoll = new PollModel({ ...poll, ...data, id })

    await this.pollRepository.update(updatedPoll)
  }

  public async searchQuestions(pagination: Pagination, pollId?: Poll['id']) {
    return this.pollQuestionRepository.search(
      pollId
        ? {
            poll: {
              id: pollId,
            },
          }
        : undefined,
      pagination,
      ['poll']
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

    return this.userRepository.search(
      {
        votedPolls: {
          id: pollId,
        },
      },
      pagination
    )
  }

  public async searchWhoVotedUnregistered(
    userRole: User['role'],
    pollId: Poll['id'],
    pagination: Pagination
  ) {
    if (!(await this.canSeeResults(userRole, pollId))) {
      throw new UnauthorizedError()
    }

    return this.pollAnswerRepository.search(
      {
        userAuthType: TypeORM.Not('api'),
        question: {
          poll: {
            id: pollId,
          },
        },
      },
      pagination,
      undefined,
      'userAuthData',
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
  }

  public async getAnswers(
    userId: User['id'],
    userRole: User['role'],
    pollId: Poll['id'],
    idOrTelegramUsername: User['id'] | string
  ) {
    const isRegistered = z
      .string()
      .ulid()
      .safeParse(idOrTelegramUsername).success

    if (!(await this.canSeeResults(userRole, pollId))) {
      if (idOrTelegramUsername !== userId) {
        throw new UnauthorizedError()
      }
    }

    const conditions: TypeORM.FindOptionsWhere<PollAnswer> = {
      question: {
        poll: {
          id: pollId,
        },
      },
    }

    if (isRegistered) {
      conditions.user = {
        id: idOrTelegramUsername,
      }
    } else {
      conditions.userAuthIdentifier = TypeORM.ILike(`%${idOrTelegramUsername}%`)
    }

    return this.pollAnswerRepository.findAll(conditions)
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

    const isRegistered = !!userId

    if (isRegistered && (await this.userAlreadyVoted(userId, pollId))) {
      throw new AlreadyVotedError()
    }

    if (
      !isRegistered &&
      (await this.unregisteredUserAlreadyVoted(answers, pollId))
    ) {
      throw new AlreadyVotedError()
    }

    const poll = await this.pollRepository.findOne({ id: pollId }, [
      'votedUsers',
    ])

    if (!poll) {
      throw new NotFoundError()
    }

    if (poll.isStopped) {
      throw new PollAlreadyEndedError()
    }

    if (!isRegistered) {
      this.answersHaveValidAuth(answers)
    }

    const answerModels = answers.map((answer) => {
      let data = { ...answer }

      if (isRegistered) {
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

    poll.votedCount += 1

    this.pollRepository.update(poll)
    this.pollAnswerRepository.createMany(answerModels)

    if (isRegistered) {
      this.pollRepository.addVotedUser(poll.id, userId)

      this.notificationService.generateAndSend('poll.poll-answered', userId, {
        poll,
      })
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

  public async deletePoll(id: Poll['id']): Promise<void> {
    const poll = await this.pollRepository.findOne({ id })

    if (!poll) {
      throw new NotFoundError('Опрос не найден')
    }

    await this.pollRepository.delete(poll.id)
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

  private async unregisteredUserAlreadyVoted(
    answers: PollAnswer[],
    pollId: Poll['id']
  ): Promise<boolean> {
    if (answers.length === 0) {
      return true
    }

    const answer = answers[0]
    const authIdentifier = this.removeEmojisAndNonUTF8(
      (answer.userAuthData!.username ||
        '_telegram_id_' + answer.userAuthData!.id) as string
    )

    const existingAnswer = await this.pollAnswerRepository.findOne({
      question: {
        poll: {
          id: pollId,
        },
      },
      userAuthIdentifier: authIdentifier,
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
