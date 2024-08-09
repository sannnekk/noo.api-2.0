import TypeORM from 'typeorm'
import { BaseModel, Model } from './Model'
import { CoreDataSource } from './DataSource'
import { Pagination } from './Pagination'
import { NotFoundError } from '../Errors/NotFoundError'
import { AlreadyExistError } from '../Errors/AlreadyExistError'

type ConstructableModel = { new (data?: Partial<Model>): Model }

type RelationsType<T> = (
  | keyof Partial<T>
  | `${Exclude<keyof Partial<T>, symbol | number>}.${string}`
)[]

export abstract class Repository<T extends BaseModel> {
  protected readonly model: ConstructableModel

  protected readonly repository: TypeORM.Repository<Model>

  constructor(model: ConstructableModel) {
    this.model = model
    this.repository = CoreDataSource.getRepository(model)
  }

  async create(data: T): Promise<T> {
    const model = new this.model(data)
    try {
      return (await this.repository.save(model)) as unknown as T
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new AlreadyExistError()
      }

      throw error
    }
  }

  async createMany(data: T[]): Promise<void> {
    const models = data.map((item) => new this.model(item))

    try {
      await this.repository.save(models)
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new AlreadyExistError()
      }

      throw error
    }
  }

  async update(data: Partial<T> & { id: T['id'] }): Promise<T> {
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
      const saved = await this.repository.save(newItem)

      return saved as unknown as T
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new AlreadyExistError()
      }

      throw error
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
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new AlreadyExistError()
      }

      throw error
    }
  }

  async delete(id: string): Promise<void> {
    const exists = await this.repository.exists({
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
    relations?: Readonly<RelationsType<T>>,
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

  async findAll(
    conditions?: Partial<T> | Partial<T>[],
    relations?: Readonly<RelationsType<T>>,
    sort?: any
  ): Promise<T[]> {
    return (await this.repository.find({
      relations: (relations as string[]) || undefined,
      where: conditions,
      order: sort,
    })) as unknown as Promise<T[]>
  }

  async findOne(
    conditions: Record<string, unknown> | Record<string, unknown>[],
    relations?: Readonly<RelationsType<T>>,
    sort?: any | undefined,
    relationLoadStrategy: 'join' | 'query' = 'join'
  ): Promise<T | null> {
    return this.repository.findOne({
      relations: (relations as string[]) || undefined,
      where: conditions,
      order: sort,
      relationLoadStrategy,
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

  queryBuilder(alias?: string): TypeORM.SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(
      alias
    ) as unknown as TypeORM.SelectQueryBuilder<T>
  }
}
