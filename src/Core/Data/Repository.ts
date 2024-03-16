import { BaseModel, Model } from './Model'
import { CoreDataSource } from './DataSource'
import { Pagination } from './Pagination'
import { NotFoundError } from '../Errors/NotFoundError'
import TypeORM from 'typeorm'
import { AlreadyExistError } from '../Errors/AlreadyExistError'

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
		try {
			await this.repository.save(model)
		} catch (error: any) {
			throw new AlreadyExistError()
		}
	}

	async createMany(data: T[]): Promise<void> {
		const models = data.map((item) => new this.model(item))

		try {
			await this.repository.save(models)
		} catch (error) {
			throw new AlreadyExistError()
		}
	}

	async update(data: Partial<T> & { id: T['id'] }): Promise<void> {
		const item = await this.repository.findOne({
			where: {
				id: data.id,
			},
		})

		if (!item) {
			throw new NotFoundError()
		}

		const newItem = new this.model({ ...item, ...data, id: item.id })

		try {
			await this.repository.save(newItem)
		} catch (error) {
			throw new AlreadyExistError()
		}
	}

	async updateRaw(data: Partial<T> & { id: T['id'] }): Promise<void> {
		const item = await this.repository.findOne({
			where: {
				id: data.id,
			},
		})

		if (!item) {
			throw new NotFoundError()
		}

		try {
			await this.repository.save(data)
		} catch (error) {
			throw new AlreadyExistError()
		}
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
		conditions?: Partial<T> | Partial<T>[],
		relations?: (keyof Partial<T>)[],
		pagination: Pagination = new Pagination()
	): Promise<T[]> {
		return (await this.repository.find({
			relations: (relations as string[]) || undefined,
			where: pagination.getCondition(conditions),
			order: pagination.orderOptions,
			skip: pagination.offset,
			take: pagination.take,
		})) as unknown as Promise<T[]>
	}

	async findOne(
		conditions: Record<string, unknown> | Record<string, unknown>[],
		relations?: (keyof Partial<T>)[]
	): Promise<T | null> {
		return this.repository.findOne({
			relations: (relations as string[]) || undefined,
			where: conditions,
		}) as Promise<T | null>
	}

	async count(
		conditions?: Record<string, unknown> | Record<string, unknown>[],
		pagination?: Pagination
	): Promise<number> {
		return this.repository.count({
			where: pagination?.getCondition(conditions),
		})
	}
}
