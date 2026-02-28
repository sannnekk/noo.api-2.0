import type { User } from '@modules/Users/Data/User'
import type { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
import type { AssignedWorkAnswer } from './AssignedWorkAnswer'
import type { AssignedWorkComment } from './AssignedWorkComment'
import type { FavouriteTask } from './FavouriteTask'
import { UserModel } from '@modules/Users/Data/UserModel'
import {
  Brackets,
  Column,
  Entity,
  ManyToOne,
  SelectQueryBuilder,
} from 'typeorm'
import { WorkTaskModel } from '@modules/Works/Data/Relations/WorkTaskModel'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { BaseModel } from '@modules/Core/Data/Model'

@Entity('favourite_task')
export class FavouriteTaskModel
  extends SearchableModel
  implements FavouriteTask
{
  public constructor(data?: Partial<FavouriteTask>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @Column({
    name: 'answer',
    type: 'json',
    nullable: true,
  })
  answer!: AssignedWorkAnswer | null

  @Column({
    name: 'comment',
    type: 'json',
    nullable: true,
  })
  comment!: AssignedWorkComment | null

  @ManyToOne(() => UserModel, (user) => user.favouriteTasks)
  user?: User

  @ManyToOne(() => WorkTaskModel, (task) => task.favourites)
  task?: WorkTask

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere(
      new Brackets((qb) => {
        qb.where('LOWER(favourite_task__task.content) LIKE LOWER(:needle)', {
          needle: `%${needle}%`,
        })
      })
    )

    return ['task']
  }
}
