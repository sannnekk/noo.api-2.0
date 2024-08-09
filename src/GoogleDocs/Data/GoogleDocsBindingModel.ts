import { Model } from '@modules/Core/Data/Model'
import { GoogleDocsBinding } from './GoogleDocsBinding'
import { Column, Entity } from 'typeorm'
import { type TokenPayload } from 'google-auth-library'

@Entity('google_docs_binding')
export class GoogleDocsBindingModel extends Model implements GoogleDocsBinding {
  public constructor(data?: Partial<GoogleDocsBinding>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
  })
  name!: string

  @Column({
    name: 'entity_name',
    type: 'varchar',
    length: 255,
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
  })
  filePath!: string[]

  @Column({
    name: 'google_oauth_token',
    type: 'text',
    nullable: true,
  })
  googleOAuthToken!: string

  @Column({
    name: 'google_refresh_token',
    type: 'text',
    nullable: true,
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
  })
  lastErrorText!: string | null

  @Column({
    name: 'frequency',
    type: 'enum',
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    default: 'daily',
  })
  frequency!: 'hourly' | 'daily' | 'weekly' | 'monthly'

  public static entriesToSearch(): string[] {
    return ['name', 'entityName', 'filePath']
  }
}
