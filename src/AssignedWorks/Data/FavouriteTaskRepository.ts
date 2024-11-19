import { Repository } from '@modules/Core/Data/Repository'
import { FavouriteTask } from './Relations/FavouriteTask'
import { FavouriteTaskModel } from './Relations/FavouriteTaskModel'
import TypeORM from 'typeorm'

export class FavouriteTaskRepository extends Repository<FavouriteTask> {
  public constructor() {
    super(FavouriteTaskModel)
  }

  public async deleteFavourite(userId: string, taskId: string) {
    return this.repository.delete({
      user: {
        id: userId,
      },
      task: {
        id: taskId,
      },
    } as any)
  }

  public async bulkDeleteFavourites(userId: string, taskIds: string[]) {
    return (this.repository as TypeORM.Repository<FavouriteTaskModel>).delete({
      user: {
        id: userId,
      },
      task: {
        id: TypeORM.In(taskIds),
      },
    })
  }
}
