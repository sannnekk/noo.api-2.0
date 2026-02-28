import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { Model } from '@modules/Core/Data/Model'
import { UserModel } from '@modules/Users/Data/UserModel'
import { Column, Entity, ManyToOne, RelationId } from 'typeorm'
import { Snippet } from './Snippet'
import { config } from '@modules/config'
import { User } from '@modules/Users/Data/User'

@Entity('snippet')
export class SnippetModel extends Model implements Snippet {
  public constructor(data?: Partial<Snippet>) {
    super()

    if (data) {
      this.set(data)

      if (data.user) {
        this.user = new UserModel(data.user)
      }
    }
  }

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  public name!: string

  @Column({
    name: 'content',
    type: 'json',
  })
  public content!: DeltaContentType

  @ManyToOne(() => UserModel, (user) => user.snippets)
  public user!: User

  @RelationId((snippet: SnippetModel) => snippet.user)
  public userId!: string
}
