import { UserRepository } from '@modules/Users/Data/UserRepository'
import { User } from '@modules/Users/Data/User'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { CalenderEvent } from '../Data/CalenderEvent'

export class UserRelationService {
  private readonly userRepository: UserRepository

  private visibilities: Record<
    CalenderEvent['visibility'],
    (requester: User, target: User) => boolean
  > = {
    all: () => true,
    private: (requester, target) => requester.username === target.username,
    'own-mentor': (/* requester, target */) => {
      // TODO: implement
      return false
    },
    'all-mentors': (requester) => {
      return requester.role === 'mentor'
    },
    'own-students': (/* requester, target */) => {
      // TODO: implement
      return false
    },
  }

  constructor() {
    this.userRepository = new UserRepository()
  }

  public async getUserToUserVisibilities(
    requester: User,
    target: User
  ): Promise<CalenderEvent['visibility'][]> {
    const visibilities = Object.keys(
      this.visibilities
    ) as CalenderEvent['visibility'][]

    if (requester.username === target.username) {
      return visibilities
    }

    return visibilities.filter((key) =>
      this.visibilities[key](requester, target)
    )
  }

  public async getCondition(
    requester: string,
    target: string
  ): Promise<Record<string, any>[]> {
    const requesterUser = await this.userRepository.findOne({
      username: requester,
    })

    if (!requesterUser) {
      throw new NotFoundError('Пользователь не найден.')
    }

    const targetUser = await this.userRepository.findOne({
      username: target,
    })

    if (!targetUser) {
      throw new NotFoundError('Пользователь не найден')
    }

    const visibilities = await this.getUserToUserVisibilities(
      requesterUser,
      targetUser
    )

    const conditions: Record<string, any>[] = visibilities.map(
      (visibility) => ({
        visibility,
        username: target,
      })
    )

    conditions.push(...this.addRelativeUserConditions(targetUser))

    return conditions
  }

  private addRelativeUserConditions(target: User): Record<string, any>[] {
    const conditions: Record<string, any>[] = []

    switch (target.role) {
      case 'student':
        /* if (!target.mentor) {
          return conditions
        }
        conditions.push({
          username: target.mentor.username,
          visibility: 'own-students',
        })
        conditions.push({
          username: target.mentor.username,
          visibility: 'all',
        }) */
        break
      case 'mentor':
        /* if (!target.students) {
          return conditions
        }

        for (const student of target.students) {
          conditions.push({
            username: student.username,
            visibility: 'own-mentor',
          })
        } */
        break
    }

    return conditions
  }
}
