import { Repository } from '@modules/Core/Data/Repository'
import type { CourseMaterialReaction } from './Relations/CourseMaterialReaction'
import { CourseMaterialReactionModel } from './Relations/CourseMaterialReactionModel'
import type { User } from '@modules/Users/Data/User'
import type { CourseMaterial } from './Relations/CourseMaterial'
import TypeORM from 'typeorm'

export class CourseMaterialReactionRepository extends Repository<CourseMaterialReaction> {
  public constructor() {
    super(CourseMaterialReactionModel)
  }

  public async getMyReactions(
    userId: User['id'],
    materialIds: CourseMaterial['id'][]
  ): Promise<CourseMaterialReaction[]> {
    return this.findAll({
      user: { id: userId },
      material: { id: TypeORM.In(materialIds) },
    })
  }

  public async toggleReaction(
    materialId: CourseMaterial['id'],
    userId: User['id'],
    reaction: CourseMaterialReaction['reaction']
  ) {
    const reactionEntity = await this.findOne({
      user: { id: userId },
      material: { id: materialId },
    })

    if (reactionEntity && reactionEntity.reaction === reaction) {
      return this.delete(reactionEntity.id)
    } else if (reactionEntity) {
      reactionEntity.reaction = reaction
      return this.update(reactionEntity)
    }

    return this.create(
      new CourseMaterialReactionModel({
        material: { id: materialId } as CourseMaterial,
        user: { id: userId } as User,
        reaction,
      })
    )
  }
}
