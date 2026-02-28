import { GoogleSheetsBinding } from './GoogleSheetsBinding'
import { Column, Entity, SelectQueryBuilder } from 'typeorm'
import { type TokenPayload } from 'google-auth-library'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { BaseModel } from '@modules/Core/Data/Model'
import { config } from '@modules/config'

@Entity('google_sheets_binding')
export class GoogleSheetsBindingModel
  extends SearchableModel
  implements GoogleSheetsBinding
{
  public constructor(data?: Partial<GoogleSheetsBinding>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  name!: string

  @Column({
    name: 'entity_name',
    type: 'varchar',
    length: 255,
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  entityName!: string

  @Column({
    name: 'entity_selector',
    type: 'json',
  })
  entitySelector!: { prop: string; value: string }

  @Column({
    name: 'file_path',
    type: 'simple-array',
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  filePath!: string[]

  @Column({
    name: 'google_oauth_token',
    type: 'text',
    nullable: true,
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  googleOAuthToken!: string

  @Column({
    name: 'google_refresh_token',
    type: 'text',
    nullable: true,
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  googleRefreshToken!: string | null

  @Column({
    name: 'google_credentials',
    type: 'json',
    nullable: true,
  })
  googleCredentials!: TokenPayload | null

  @Column({
    name: 'last_run_at',
    type: 'timestamp',
    nullable: true,
  })
  lastRunAt!: Date | null

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['active', 'inactive', 'error'],
    default: 'active',
  })
  status!: 'active' | 'inactive' | 'error'

  @Column({
    name: 'last_error_text',
    type: 'text',
    nullable: true,
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  lastErrorText!: string | null

  @Column({
    name: 'frequency',
    type: 'enum',
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    default: 'daily',
  })
  frequency!: 'hourly' | 'daily' | 'weekly' | 'monthly'

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere('LOWER(google_sheets_binding.name) LIKE LOWER(:needle)', {
      needle: `%${needle}%`,
    })

    return []
  }
}
