import TypeORM, {
  SelectQueryBuilder,
  FindOptionsWhere,
  FindOptionsUtils,
} from 'typeorm'
import { BaseModel, Model } from './Model'
import { CoreDataSource } from './DataSource'
import { Pagination } from './Pagination'
import { NotFoundError } from '../Errors/NotFoundError'
import { AlreadyExistError } from '../Errors/AlreadyExistError'
import { SearchableModel } from './SearchableModel'
import { RequestMeta } from '../Response/RequestMeta'

type ConstructableModel = { new (data?: Partial<Model>): Model }

type RelationsType<T> = (
  | keyof Partial<T>
  | `${Exclude<keyof Partial<T>, symbol | number>}.${string}`
)[]

type SearchOptions = {
  /**
   * Use eager relations in the search
   *
   * @default true
   */
  useEagerRelations?: boolean

  /**
   * Select only the specified columns
   *
   * @default undefined (all columns)
   * @example [['select', 'alias']]
   * @note: Use columns names, not entity properties
   * @note: This will return raw entities
   */
  select?: [string, string?][]
}

type FindOneOptions = {
  /**
   * Use eager relations in the search
   *
   * @default true
   */
  useEagerRelations?: boolean
  /**
   * Load relations using query builder instead of join
   *
   * @default 'join'
   */
  relationLoadStrategy?: 'query' | 'join'
}

type FindAllOptions = {
  /**
   * Load relations using query builder instead of join
   *
   * @default 'join'
   */
  joinStrategy?: 'query' | 'join'
}

/**
 * Generic repository class to use for all repositories
 */
export abstract class Repository<T extends BaseModel> {
  protected readonly model: ConstructableModel

  protected readonly repository: TypeORM.Repository<Model>

  protected readonly instance: Model

  protected readonly metadata: TypeORM.EntityMetadata

  protected readonly entityName: string

  protected readonly eagerRelations: string[]

  /**
   * Create a new repository instance
   *
   * @param model The model class to use for the repository
   */
  constructor(model: ConstructableModel) {
    this.model = model
    this.repository = CoreDataSource.getRepository(model)

    // we need to create an instance of the model to get the search keywords
    // and check if the model is searchable
    // because we can't use the static method getSearchKeywords
    // because typescript doesn't allow abstract static methods
    this.instance = new this.model()

    this.metadata = this.repository.metadata
    this.entityName = this.metadata.tableName
    this.eagerRelations = this.metadata.relations
      .filter((relation) => relation.isEager)
      .map((relation) => relation.buildPropertyPath())
  }

  /**
   * Create a new entity
   *
   * @throws AlreadyExistError if the entity already exists
   * @param data The data to create the entity with
   */
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

  /**
   * Create multiple entities
   *
   * @throws AlreadyExistError if any of the entities already exists
   * @param data The data to create the entities with
   */
  async createMany(data: T[]): Promise<T[]> {
    const models = data.map((item) => new this.model(item))

    try {
      return this.repository.save(models) as unknown as T[]
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new AlreadyExistError()
      }

      throw error
    }
  }

  /**
   * Find and update an entity by its id.
   *
   * @throws NotFoundError if the entity is not found
   * @throws AlreadyExistError if the entity already exists
   * @param data The data to update the entity with (id is required)
   */
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

  /**
   * Update an entity without merging the data with the existing entity.
   *
   * @throws NotFoundError if the entity is not found
   * @throws AlreadyExistError if the entity already exists
   * @param data The data to update the entity with (id is required)
   */
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

  /**
   * Delete an entity by its id
   *
   * @throws NotFoundError if the entity is not found
   * @param id The id of the entity
   */
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

  /**
   * Delete entities by condition
   *
   * @param conditions Condition to delete by
   */
  async deleteWhere(conditions: FindOptionsWhere<T>): Promise<void> {
    await this.repository.delete(conditions)
  }

  /**
   * Find many entities. If no pagination is provided, it will create one with default oprions (page 1, limit 25)
   *
   * @param conditions The conditions to find the entities with (ActiveRecord style)
   * @param relations The relations to load with the entities
   * @param pagination The pagination instance (typically created in validator from request query)
   */
  async find(
    conditions?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    relations?: Readonly<RelationsType<T>>,
    pagination: Pagination = new Pagination()
  ): Promise<{ entities: T[]; meta: RequestMeta }> {
    return this.search(conditions, pagination, relations)
  }

  /**
   * Find all entities without pagination
   *
   * @param conditions The conditions to find the entity with (ActiveRecord style)
   * @param relations The relations to load with the entity
   * @param sort The sort options to use
   * @param options The find all options
   */
  async findAll(
    conditions?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    relations?: Readonly<RelationsType<T>>,
    sort?: TypeORM.FindOptionsOrder<T>,
    options?: FindAllOptions
  ): Promise<T[]> {
    return this.repository.find({
      relations: (relations as string[]) || undefined,
      where: conditions,
      order: sort,
      relationLoadStrategy: options?.joinStrategy || 'join',
    }) as Promise<unknown> as Promise<T[]>
  }

  /**
   * Find one entity
   *
   * @param conditions The conditions to find the entity with (ActiveRecord style)
   * @param relations The relations to load with the entity
   * @param sort The sort options to use
   */
  async findOne(
    conditions: Record<string, unknown> | Record<string, unknown>[],
    relations?: Readonly<RelationsType<T>>,
    sort?: any | undefined,
    options?: FindOneOptions
  ): Promise<T | null> {
    const findOneOptions = this.mergeWithDefaultFindOneOptions(options)

    return this.repository.findOne({
      relations: (relations as string[]) || undefined,
      where: conditions,
      order: sort,
      relationLoadStrategy: findOneOptions.relationLoadStrategy,
    }) as Promise<T | null>
  }

  /**
   * Count entities
   *
   * @param conditions The conditions to count the entities with (ActiveRecord style)
   */
  async count(conditions?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where: conditions })
  }

  /**
   * Get this repository's query builder
   *
   * @param alias Alias for the query
   * @returns The query builder instance
   */
  public queryBuilder(alias?: string): TypeORM.SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(
      alias
    ) as unknown as TypeORM.SelectQueryBuilder<T>
  }

  /**
   * Get this repository's tree repository
   *
   * @returns The tree repository instance
   */
  public treeRepository() {
    return this.repository.manager.getTreeRepository(this.model)
  }

  /**
   * Search for entities. Uses entities that extend SearchableModel.
   * If no pagination is provided, it will create one with default oprions (page 1, limit 25)
   *
   * @param conditions The conditions to search the entities with (ActiveRecord style)
   * @param pagination The pagination instance (typically created in validator from request query)
   * @param relations The relations to load with the entities
   * @param groupBy The column to group by
   */
  async search(
    conditions?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    pagination?: Pagination,
    relations: Readonly<RelationsType<T>> = [],
    groupBy?: string,
    options?: SearchOptions
  ): Promise<{ entities: T[]; meta: RequestMeta }> {
    const searchOptions = this.mergeWithDefaultSearchOptions(options)
    const queryPagination = new Pagination().assign(pagination)
    const query = this.queryBuilder(this.entityName)

    let searchRelations: string[] = []

    // add search to query
    if (
      typeof (this.instance as SearchableModel).addSearchToQuery !==
        'undefined' &&
      queryPagination.searchQuery.length > 0
    ) {
      searchRelations = (this.instance as SearchableModel).addSearchToQuery(
        query as SelectQueryBuilder<BaseModel>,
        queryPagination.searchQuery
      )
    }

    // filter out duplicates
    const allRelations = [...relations, ...searchRelations].filter(
      (value, index, self) =>
        self.indexOf(value) === index &&
        !this.eagerRelations.includes(value as string)
    )

    this.addConditions(query, conditions)

    const countQuery = query.clone()

    this.addSelect(query, searchOptions.select)
    this.addPagination(query, queryPagination)
    this.addRelations(query, allRelations)
    this.addEagerRelations(query)
    this.addGroupBy(query, groupBy)
    this.addGroupBy(countQuery, groupBy)

    let entities: T[] = []
    let total: number

    if (searchOptions.select) {
      entities = await query.getRawMany()
      total = await countQuery.getCount()
    } else {
      ;[entities, total] = await query.getManyAndCount()
    }

    return {
      entities,
      meta: {
        total,
        relations: allRelations as string[],
      },
    }
  }

  /**
   * Merge the provided search options with the default search options
   *
   * @param options options to merge with the default search options
   * @returns merged search options
   */
  private mergeWithDefaultSearchOptions(options?: SearchOptions) {
    const defaultSearchOptions: SearchOptions = {
      useEagerRelations: true,
    }

    return { ...defaultSearchOptions, ...options }
  }

  /**
   * Merge the provided find one options with the default find one options
   *
   * @param options options to merge with the default find one options
   * @returns merged find one options
   */
  private mergeWithDefaultFindOneOptions(options?: FindOneOptions) {
    const defaultFindOneOptions: FindOneOptions = {
      useEagerRelations: true,
      relationLoadStrategy: 'join',
    }

    return { ...defaultFindOneOptions, ...options }
  }

  /**
   *
   * @param query Instance of the query builder
   * @param select The columns to select
   */
  private addSelect(
    query: SelectQueryBuilder<T>,
    selects?: SearchOptions['select']
  ): void {
    if (selects) {
      query.select(
        selects.map(([col, alias]) => (alias ? `${col} as ${alias}` : col))
      )
    }
  }

  /**
   * Add relations to the query builder
   *
   * @param query Instance of the query builder
   * @param relations The relations to load with the entity
   */
  private addRelations(
    query: SelectQueryBuilder<T>,
    relations: (string | keyof T)[] = []
  ): void {
    for (const relation of relations) {
      const relationData = this.buildRelationPath(relation as string)

      for (const data of relationData) {
        // check if the relation is already added
        if (
          query.expressionMap.joinAttributes.some(
            (attr) => attr.alias.name === data.alias
          )
        ) {
          continue
        }

        query.leftJoinAndSelect(data.propPath, data.alias)
      }
    }
  }

  /**
   * Add eager relations to the query builder
   *
   * @param query Instance of the query builder
   */
  private addEagerRelations(query: SelectQueryBuilder<T>): void {
    FindOptionsUtils.joinEagerRelations(query, query.alias, this.metadata)
  }

  /**
   * Extract the query conditions from the pagination object
   * to be used in the query builder
   *
   * @param query Instance of the query builder
   * @param pagination Pagination object
   */
  private addPagination(
    query: TypeORM.SelectQueryBuilder<T>,
    pagination: Pagination
  ): void {
    const filters = pagination.getFilters()
    const metadata = this.repository.metadata

    // adding filters to the query
    for (const key in filters) {
      if (filters[key] !== undefined) {
        filters[key](query as SelectQueryBuilder<BaseModel>, metadata)
      }
    }

    query.orderBy(pagination.getOrderOptions(this.entityName) as any)
    query.offset(pagination.offset)
    query.limit(pagination.take)
  }

  /**
   * Add conditions to the query builder
   *
   * @param query Instance of the query builder
   * @param conditions The conditions to find the entity with (ActiveRecord style)
   */
  private addConditions(
    query: SelectQueryBuilder<T>,
    conditions?: FindOptionsWhere<T> | FindOptionsWhere<T>[]
  ) {
    if (conditions) {
      query.setFindOptions({ where: conditions })
    }
  }

  /**
   * Add group by to the query builder
   *
   * @param query Instance of the query builder
   * @param groupBy The column to group by
   */
  private addGroupBy(query: SelectQueryBuilder<T>, groupBy?: string) {
    if (groupBy) {
      const colName = this.metadata.columns.find(
        (col) => col.propertyName === groupBy
      )?.databaseName

      const groupByProp = `${this.entityName}.${colName}`

      query.groupBy(groupByProp)
    }
  }

  /**
   * Get the relation path and alias for a relation
   *
   * @param relation Property name of the relation
   * @returns relation path and alias
   */
  private buildRelationPath(
    relation: string
  ): { propPath: string; alias: string }[] {
    if (relation.includes('.')) {
      return this.buildComplexRelationPath(relation)
    }

    return [
      {
        propPath: `${this.entityName}.${relation}`,
        alias: `${this.entityName}__${relation}`,
      },
    ]
  }

  /**
   * Get the relation path and alias for a complex relation
   *
   * @param relation Property name of the relation
   * @returns relation path and alias
   */
  private buildComplexRelationPath(
    relation: string
  ): { propPath: string; alias: string }[] {
    const relatedEntities = relation.split('.')

    const joins: { propPath: string; alias: string }[] = []

    for (const entity of relatedEntities) {
      const prevJoin = joins.at(-1)

      if (!prevJoin) {
        const [join] = this.buildRelationPath(entity)

        if (!join) {
          return []
        }

        joins.push(join)
        continue
      }

      joins.push({
        propPath: `${prevJoin.alias}.${entity}`,
        alias: `${prevJoin.alias}__${entity}`,
      })
    }

    return joins
  }
}
