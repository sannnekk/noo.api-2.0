import { Repository } from '@modules/Core/Data/Repository'
import { User } from './User'
import { UserModel } from './UserModel'

export class UserRepository extends Repository<User> {
  constructor() {
    super(UserModel)
  }

  public async getRandomMentor(): Promise<User | null> {
    return this.queryBuilder('user')
      .where('user.role = :role', { role: 'mentor' })
      .orderBy('RAND()')
      .getOne()
  }
}
