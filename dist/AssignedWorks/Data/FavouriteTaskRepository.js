import { Repository } from '../../Core/Data/Repository.js';
import { FavouriteTaskModel } from './Relations/FavouriteTaskModel.js';
import TypeORM from 'typeorm';
export class FavouriteTaskRepository extends Repository {
    constructor() {
        super(FavouriteTaskModel);
    }
    async deleteFavourite(userId, taskId) {
        return this.repository.delete({
            user: {
                id: userId,
            },
            task: {
                id: taskId,
            },
        });
    }
    async bulkDeleteFavourites(userId, taskIds) {
        return this.repository.delete({
            user: {
                id: userId,
            },
            task: {
                id: TypeORM.In(taskIds),
            },
        });
    }
}
