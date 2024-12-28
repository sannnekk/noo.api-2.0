import { Repository } from '@modules/Core/Data/Repository'
import { CourseModel } from './CourseModel'
import type { Course } from './Course'
import type { User } from '@modules/Users/Data/User'

export class CourseRepository extends Repository<Course> {
  constructor() {
    super(CourseModel)
  }

  public async getAuthors(courseId: string): Promise<User[]> {
    return this.queryBuilder().relation('authors').of(courseId).loadMany()
  }
}
