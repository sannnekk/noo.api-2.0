import { BaseModel, Model } from './Model'
import { CoreDataSource } from './DataSource'
import { Pagination } from './Pagination'
import { NotFoundError } from '../Errors/NotFoundError'
import TypeORM from 'typeorm'

type ConstructableModel = { new (data?: Partial<Model>): Model }

export abstract class Repository<T extends BaseModel> {
	protected readonly model: ConstructableModel
	protected readonly repository: TypeORM.Repository<Model>

	constructor(model: ConstructableModel) {
		this.model = model
		this.repository = CoreDataSource.getRepository(model)
	}

	async create(data: T): Promise<void> {
		const model = new this.model(data)
		await this.repository.save(model)
	}

	async update(data: T): Promise<void> {
		const item = await this.repository.findOne({
			where: {
				id: data.id,
			},
		})

		if (!item) {
			throw new NotFoundError()
		}

		const newItem = new this.model({ ...item, ...data, id: item.id })

		await this.repository.save(newItem)
	}

	async delete(id: string): Promise<void> {
		const exists = await this.repository.exist({
			where: {
				id,
			},
		})

		if (!exists) {
			throw new NotFoundError()
		}

		await this.repository.delete(id)
	}

	async find(
		conditions?: Partial<T>,
		relations?: (keyof Partial<T>)[],
		pagination: Pagination = new Pagination()
	): Promise<T[]> {
		return this.repository.find({
			relations: (relations as string[]) || undefined,
			where: conditions,
			...pagination,
		}) as unknown as Promise<T[]>
	}

	async findOne(
		conditions: Record<string, unknown>,
		relations?: (keyof Partial<T>)[]
	): Promise<T | null> {
		return this.repository.findOne({
			relations: (relations as string[]) || undefined,
			where: conditions,
		}) as Promise<T | null>
	}
}
