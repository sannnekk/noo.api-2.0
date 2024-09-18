import { Repository } from '@modules/Core/Data/Repository'
import { UserModel } from './UserModel'
import { FindOptionsWhere } from 'typeorm'
import type { User } from './User'
import type { Course } from '@modules/Courses/Data/Course'
import { Pagination } from '@modules/Core/Data/Pagination'

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

  public async getStudentsWithAssignments(
    courseId: Course['id'],
    pagination: Pagination
  ) {
    const query = this.queryBuilder('user')
      .leftJoinAndSelect(
        'user.courseAssignments',
        'courseAssignment',
        'courseAssignment.courseId = :courseId',
        { courseId }
      )
      .where('user.role = :role', { role: 'student' })
      .take(pagination.take)
      .skip(pagination.offset)
      .orderBy('user.id', 'DESC')

    if (pagination.searchQuery && typeof pagination.searchQuery === 'string') {
      new UserModel().addSearchToQuery(query, pagination.searchQuery)
    }

    const [entities, total] = await query.getManyAndCount()

    return {
      entities,
      meta: {
        total,
        relations: ['courseAssignments'],
      },
    }
  }
}
