import { Model } from '@modules/Core/Data/Model'
import { GoogleDocsBinding } from './GoogleDocsBinding'
import { Column, Entity } from 'typeorm'
import { GoogleCredentials } from './GoogleCredentials'

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
    type: 'varchar',
    length: 255,
  })
  filePath!: string

  @Column({
    name: 'google_oauth_token',
    type: 'text',
  })
  googleOAuthToken!: string

  @Column({
    name: 'google_credentials',
    type: 'json',
  })
  googleCredentials!: GoogleCredentials

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['active', 'inactive', 'error'],
    default: 'active',
  })
  status!: 'active' | 'inactive' | 'error'

  @Column({
    name: 'format',
    type: 'enum',
    enum: ['csv'],
    default: 'csv',
  })
  format!: 'csv'

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
