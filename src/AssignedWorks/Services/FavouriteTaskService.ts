import { Pagination } from '@modules/Core/Data/Pagination'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { WorkTaskRepository } from '@modules/Works/Data/WorkTaskRepository'
import { FavouriteTaskRepository } from '../Data/FavouriteTaskRepository'
import { AlreadyExistError } from '@modules/Core/Errors/AlreadyExistError'
import type { User } from '@modules/Users/Data/User'
import type { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
import type { FavouriteTask } from '../Data/Relations/FavouriteTask'
import { AssignedWorkCommentRepository } from '../Data/AssignedWorkCommentRepository'
import { Subject } from '@modules/Subjects/Data/Subject'

export class FavouriteTaskService {
  private readonly favouriteTaskRepository: FavouriteTaskRepository

  private readonly taskRepository: WorkTaskRepository

  private readonly commentRepository: AssignedWorkCommentRepository

  public constructor() {
    this.favouriteTaskRepository = new FavouriteTaskRepository()
    this.taskRepository = new WorkTaskRepository()
    this.commentRepository = new AssignedWorkCommentRepository()
  }

  public async getFavouriteTasks(
    userId: string,
    subjectId: Subject['id'],
    count: number
  ) {
    return this.favouriteTaskRepository.search(
      {
        user: {
          id: userId,
        },
        task: {
          work: {
            subject: {
              id: subjectId,
            },
          },
        },
      },
      new Pagination(1, count),
      ['task', 'task.work']
    )
  }

  public async isTaskFavourite(userId: string, taskId: string) {
    const favourite = await this.favouriteTaskRepository.findOne({
      user: {
        id: userId,
      },
      task: {
        id: taskId,
      },
    })

    return !!favourite
  }

  public async addTaskToFavourites(userId: string, taskId: string) {
    const task = await this.taskRepository.findOne({
      id: taskId,
    })

    if (!task) {
      throw new NotFoundError('Задание не найдено')
    }

    const favouriteTask = await this.favouriteTaskRepository.findOne({
      user: {
        id: userId,
      },
      task: {
        id: taskId,
      },
    })

    if (favouriteTask) {
      throw new AlreadyExistError('Задание уже добавлено в избранное')
    }

    return this.favouriteTaskRepository.create({
      user: {
        id: userId,
      } as User,
      task: {
        id: taskId,
      } as WorkTask,
      answer: null,
      comment: null,
    } as FavouriteTask)
  }

  public async removeFavouriteTask(userId: string, taskId: string) {
    return this.favouriteTaskRepository.deleteFavourite(userId, taskId)
  }

  public async bulkRemoveFavouriteTasks(userId: string, taskIds: string[]) {
    return this.favouriteTaskRepository.bulkDeleteFavourites(userId, taskIds)
  }
}
