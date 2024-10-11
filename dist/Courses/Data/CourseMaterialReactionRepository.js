import { Repository } from '../../Core/Data/Repository.js';
import { CourseMaterialReactionModel } from './Relations/CourseMaterialReactionModel.js';
import TypeORM from 'typeorm';
export class CourseMaterialReactionRepository extends Repository {
    constructor() {
        super(CourseMaterialReactionModel);
    }
    async getMyReactions(userId, materialIds) {
        return this.findAll({
            user: { id: userId },
            material: { id: TypeORM.In(materialIds) },
        });
    }
    async toggleReaction(materialId, userId, reaction) {
        const reactionEntity = await this.findOne({
            user: { id: userId },
            material: { id: materialId },
        });
        if (reactionEntity && reactionEntity.reaction === reaction) {
            return this.delete(reactionEntity.id);
        }
        else if (reactionEntity) {
            reactionEntity.reaction = reaction;
            return this.update(reactionEntity);
        }
        return this.create(new CourseMaterialReactionModel({
            material: { id: materialId },
            user: { id: userId },
            reaction,
        }));
    }
}
