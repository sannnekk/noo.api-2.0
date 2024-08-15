import { z } from 'zod'
import { Pagination } from '../Data/Pagination'
import { Ulid } from '../Data/Ulid'
import { ErrorConverter } from './ValidatorDecorator'
import { Version } from '../Version/Version'

type PaginationType = {
  page?: number
  limit?: number
  sort?: string
  order?: 'ASC' | 'DESC'
  search?: string
  filter?: Record<string, unknown>
  relations?: string[]
}

@ErrorConverter()
export abstract class Validator {
  public idScheme = z.string().ulid()

  public slugScheme = z.string().min(1).max(256)

  public paginationScheme = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    sort: z.string().optional(),
    order: z.enum(['ASC', 'DESC']).optional(),
    search: z.string().optional(),
    filter: z.record(z.any()).optional(),
    relations: z.array(z.string()).optional(),
  })

  public versionScheme = z
    .string()
    .regex(
      /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?:-(?<prerelease>[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+(?<buildmetadata>[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/,
      'version'
    )

  public parsePagination(data: unknown): Pagination {
    const pagination = this.parse<PaginationType>(data, this.paginationScheme)

    return new Pagination(
      pagination.page,
      pagination.limit,
      pagination.sort,
      pagination.order,
      pagination.search,
      // TODO: Fix any
      pagination.filter as any,
      pagination.relations
    )
  }

  public parseId(id: unknown): Ulid {
    return this.parse<string>(id, this.idScheme)
  }

  public parseSlug(slug: unknown): string {
    return this.parse<string>(slug, this.slugScheme)
  }

  public parseVersion(version: unknown): Version {
    return new Version(this.parse(version, this.versionScheme))
  }

  public parseString(value: unknown): string {
    return this.parse<string>(value, z.string())
  }

  public parseNonemptyString(value: unknown): string {
    return this.parse<string>(value, z.string().min(1))
  }

  protected parse<T>(o: unknown, schema: z.ZodType): T {
    return schema.parse(o)
  }
}
