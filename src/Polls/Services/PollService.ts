import { Service } from '@modules/Core/Services/Service'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Pagination } from '@modules/Core/Data/Pagination'
import { User } from '@modules/Users/Data/User'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { UserModel } from '@modules/Users/Data/UserModel'
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

export class PollService extends Service<Poll | PollAnswer | User> {
  private readonly pollRepository: PollRepository

  private readonly pollAnswerRepository: PollAnswerRepository

  private readonly userRepository: UserRepository

  private readonly pollAuthService: PollAuthService

  constructor() {
    super()

    this.pollRepository = new PollRepository()
    this.pollAnswerRepository = new PollAnswerRepository()
    this.userRepository = new UserRepository()
    this.pollAuthService = new PollAuthService()
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
    pagination.entriesToSearch = UserModel.entriesToSearch()

    const relations = [] as (keyof User)[]
    const conditions = {
      votedPolls: {
        id: pollId,
      } as unknown as Poll[],
    }

    const users = await this.userRepository.find(
      conditions,
      relations,
      pagination
    )

    const meta = await this.getRequestMeta(
      this.userRepository,
      conditions,
      pagination,
      relations
    )

    return { users, meta }
  }

  public async searchWhoVotedUnregistered(
    userRole: User['role'],
    pollId: Poll['id'],
    pagination: Pagination
  ) {
    if (!(await this.canSeeResults(userRole, pollId))) {
      throw new UnauthorizedError()
    }

    pagination = new Pagination().assign(pagination)
    pagination.take = 1000
    pagination.entriesToSearch = PollAnswerModel.entriesToSearch()

    const relations = [] as (keyof PollAnswer)[]
    const conditions = {
      userAuthType: TypeORM.Not('api'),
      question: {
        poll: {
          id: pollId,
        },
      },
    } as unknown as Partial<PollAnswer>

    const answers = await this.pollAnswerRepository.find(
      conditions,
      relations,
      pagination
    )

    const meta = await this.getRequestMeta(
      this.pollAnswerRepository,
      conditions,
      pagination,
      relations
    )

    // group by user
    const users = answers.reduce(
      (acc, answer) => {
        if (!answer.userAuthData) {
          return acc
        }

        // @ts-expect-error TypeORM doesn't support union types
        const data = JSON.parse(answer.userAuthData)

        acc[answer.userAuthIdentifier as string] = {
          identifier: answer.userAuthIdentifier,
          id: data?.id,
          firstName: data?.first_name,
          lastName: data?.last_name,
          avatarUrl: data?.photo_url,
          username: data?.username,
        }

        return acc
      },
      {} as Record<string, any>
    )

    return { users: Object.values(users), meta }
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

    const answers = await this.pollAnswerRepository.find(
      conditions as any,
      relations,
      new Pagination(1, 250)
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
          userAuthIdentifier: answer.userAuthData!.username as string,
        }
      }

      return new PollAnswerModel(data)
    })

    this.pollRepository.update(poll)
    try {
      this.pollAnswerRepository.createMany(answerModels)
    } catch (error) {
      throw new Error('Не удалось сохранить ответы.')
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
