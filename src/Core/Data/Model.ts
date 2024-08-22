import { PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Ulid, generate } from './Ulid'
import { config } from '@modules/config'

export interface BaseModel {
  id: Ulid
  createdAt: Date
  updatedAt: Date
}

export abstract class Model implements BaseModel {
  set(data: Partial<Model>): void {
    Object.assign(this, data)
  }

  @PrimaryColumn({
    name: 'id',
    type: 'varchar',
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  id: Ulid = generate()

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt!: Date

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt!: Date

  toJSON(): Record<keyof typeof this, unknown> {
    const jsonObj = { ...this }
    const proto = Object.getPrototypeOf(this)

    for (const key of Object.getOwnPropertyNames(proto)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key)

      if (desc && typeof desc.get === 'function') {
        const value = desc.get.call(this)

        if (value !== undefined) {
          jsonObj[key as keyof typeof this] = value
        }
      }
    }

    return { ...jsonObj, password: undefined }
  }
}
