import { Repository } from '@core'
import { User } from './User'
import { UserModel } from './UserModel'

export class UserRepository extends Repository<User> {
	constructor() {
		super(UserModel)
	}
}
