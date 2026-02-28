import { Model } from '@modules/Core/Data/Model'
import type { CourseMaterial } from './CourseMaterial'
import type { CourseMaterialReaction, Reaction } from './CourseMaterialReaction'
import type { User } from '@modules/Users/Data/User'
import { Column, Entity, ManyToOne, RelationId } from 'typeorm'
import { CourseMaterialModel } from './CourseMaterialModel'
import { UserModel } from '@modules/Users/Data/UserModel'

@Entity('course_material_reaction')
export class CourseMaterialReactionModel
  extends Model
  implements CourseMaterialReaction
{
  public constructor(data?: Partial<CourseMaterialReaction>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @ManyToOne(() => CourseMaterialModel, (matetrial) => matetrial.reactions)
  public material?: CourseMaterial

  @RelationId((reaction: CourseMaterialReactionModel) => reaction.material)
  public materialId?: CourseMaterial['id']

  @ManyToOne(() => UserModel, (user) => user.materialReactions)
  public user?: User

  @Column({
    name: 'reaction',
    type: 'varchar',
    nullable: false,
  })
  public reaction!: Reaction
}
