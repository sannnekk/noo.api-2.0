import { Repository } from '@modules/Core/Data/Repository'
import { User } from './User'
import { UserModel } from './UserModel'
import { FindOptionsWhere } from 'typeorm'

export class UserRepository extends Repository<User> {
  constructor() {
    super(UserModel)
  }

  public async getIdsFromEmails(
    emails: string[],
    condition?: Partial<User>
  ): Promise<string[]> {
    const query = await this.queryBuilder('user')
      .select('user.id')
      .where('user.email IN (:...emails)', { emails })

    if (condition) {
      for (const [key, value] of Object.entries(condition)) {
        query.andWhere(`user.${key} = :${key}`, { [key]: value })
      }
    }

    const users = await query.getMany()

    return users.map((user) => user.id)
  }

  public async findIds(conditions?: FindOptionsWhere<User>): Promise<string[]> {
    return (
      await this.repository.find({ where: conditions, select: ['id'] })
    ).map((user) => user.id)
  }
}
