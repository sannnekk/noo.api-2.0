import TypeORM, { FindOptionsOrder, SelectQueryBuilder } from 'typeorm'
import Dates from '../Utils/date'
import { BaseModel } from './Model'

export type Filters = Record<
  string,
  (
    query: TypeORM.SelectQueryBuilder<BaseModel>,
    metadata: TypeORM.EntityMetadata
  ) => void
>

export class Pagination {
  private page: number

  private limit: number

  private sort: string

  private order: 'ASC' | 'DESC'

  private search: string

  private filters: Filters = {}

  private relations: string[] = []

  public constructor(
    page?: number | undefined,
    limit?: number | undefined,
    sort?: string | undefined,
    order?: 'ASC' | 'DESC' | undefined,
    search?: string | undefined,
    filters?: Filters | undefined,
    relations?: string[] | undefined
  ) {
    this.page = page || 1
    this.limit = limit || 25
    this.sort = sort || 'id'
    this.order = order === 'ASC' ? 'ASC' : 'DESC'
    this.search = search || ''
    this.filters = filters ? this.parseFilterValues(filters) : {}
    this.relations = relations || []
  }

  public assign(data: Partial<Pagination> | undefined): typeof this {
    Object.assign(this, data)

    return this
  }

  public get offset(): number {
    return (this.page - 1) * this.limit
  }

  public get take(): number {
    return this.limit
  }

  public set take(value: number) {
    this.limit = value
  }

  public getOrderOptions<Entity extends BaseModel>(
    entityName: string
  ): FindOptionsOrder<Entity> {
    return {
      [`${entityName}.${this.sort}`]: this.order,
    } as FindOptionsOrder<Entity>
  }

  public get relationsToLoad(): string[] {
    return this.relations
  }

  public get searchQuery(): string {
    return this.search
  }

  public set searchQuery(value) {
    this.search = value
  }

  public getFilter(name: string): any {
    return this.filters[name]
  }

  public getFilters(): Filters {
    return this.filters
  }

  public setFilter(name: string, value: any): void {
    this.filters[name] = value
  }

  private parseFilterValues(filters: Filters): Filters {
    const parsedFilters = {} as Filters
    let value: any

    for (const key in filters) {
      value = filters[key]

      if (value === 'null') {
        parsedFilters[key] = () => `${key} IS NULL`
        continue
      }

      if (/^range\([0-9.|:\-\_a-zA-Z]+\)$/.test(value)) {
        this.addRangeFilter(key, value, parsedFilters)
        continue
      }

      if (/^arr\([0-9.|:\-\_a-zA-Z]+\)$/.test(value)) {
        this.addArrayFilter(key, value, parsedFilters)
        continue
      }

      if (/^tags\([0-9.|:\-\_a-zA-Z]+\)$/.test(value)) {
        this.addTagFilter(key, value, parsedFilters)
        continue
      }

      this.addSimpleFilter(key, value, parsedFilters)
    }

    return parsedFilters
  }

  private typeConvert(value: string): string | number | boolean | Date | null {
    if (value === 'null') {
      return null
    }

    if (value === 'true') {
      return true
    }

    if (value === 'false') {
      return false
    }

    if (/^[0-9]+$/.test(value)) {
      return parseInt(value)
    }

    if (/^[0-9.]+$/.test(value)) {
      return parseFloat(value)
    }

    if (Dates.isISOString(value)) {
      return Dates.fromISOString(value)
    }

    return value
  }

  private addRangeFilter(
    key: string,
    value: string,
    parsedFilters: Filters
  ): void {
    const [min, max] = value.slice(6, -1).split('|').map(this.typeConvert)

    parsedFilters[key] = (
      query: TypeORM.SelectQueryBuilder<BaseModel>,
      metadata: TypeORM.EntityMetadata
    ) => {
      key = this.getDbNameAndAddJoins(query, key, metadata)

      if (min !== null) {
        query.andWhere(`${key} >= :min`, { min })
      }

      if (max !== null) {
        query.andWhere(`${key} <= :max`, { max })
      }
    }
  }

  private addArrayFilter(
    key: string,
    value: string,
    parsedFilters: Filters
  ): void {
    const values = value.slice(4, -1).split('|').map(this.typeConvert)

    if (values.length !== 0) {
      parsedFilters[key] = (
        query: TypeORM.SelectQueryBuilder<BaseModel>,
        metadata: TypeORM.EntityMetadata
      ) => {
        key = this.getDbNameAndAddJoins(query, key, metadata)

        query.andWhere(`${key} IN (:...values)`, { values })
      }
    }
  }

  private addTagFilter(
    key: string,
    value: string,
    parsedFilters: Filters
  ): void {
    const tags = value.slice(5, -1).split('|').map(this.typeConvert)

    if (parsedFilters[key].length === 0) {
      parsedFilters[key] = () => void 0
    } else {
      parsedFilters[key] = (
        query: TypeORM.SelectQueryBuilder<BaseModel>,
        metadata: TypeORM.EntityMetadata
      ) => {
        key = this.getDbNameAndAddJoins(query, key, metadata)

        for (const tag of tags) {
          query.andWhere(`${key} LIKE :tag`, {
            tag: `%${tag}%`,
          })
        }
      }
    }
  }

  private addSimpleFilter(key: string, value: string, parsedFilters: Filters) {
    const convertedValue = this.typeConvert(value)
    parsedFilters[key] = (
      query: TypeORM.SelectQueryBuilder<BaseModel>,
      metadata: TypeORM.EntityMetadata
    ) => {
      key = this.getDbNameAndAddJoins(query, key, metadata)

      query.andWhere(`${key} = :${key}`, { [key]: convertedValue })
    }
  }

  private getDbNameAndAddJoins(
    query: SelectQueryBuilder<BaseModel>,
    key: string,
    metadata: TypeORM.EntityMetadata
  ): string {
    const entityName = metadata.tableName
    const [relationProp, column] = key.split('.')

    if (!column) {
      return `${entityName}.${key}`
    }

    const relation = metadata.relations.find(
      (r) => r.propertyName === relationProp
    )

    if (!relation) {
      return `${entityName}.${key}`
    }

    const fullAlias = `${relationProp}__${relation.propertyName}`

    query.leftJoinAndSelect(`${entityName}.${relationProp}`, fullAlias)

    return `${fullAlias}.${column}`
  }
}
