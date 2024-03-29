import {
	PrimaryColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm'
import { Ulid, generate } from './Ulid'

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
		const jsonObj = Object.assign({}, this)
		const proto = Object.getPrototypeOf(this)

		for (const key of Object.getOwnPropertyNames(proto)) {
			const desc = Object.getOwnPropertyDescriptor(proto, key)
			const hasGetter = desc && typeof desc.get === 'function'

			if (hasGetter) {
				jsonObj[key as keyof typeof this] =
					this[key as keyof typeof this]
			}
		}
		return { ...jsonObj, password: undefined }
	}
}
