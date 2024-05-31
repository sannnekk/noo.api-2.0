import { Pagination } from '../Data/Pagination'
import { Ulid } from '../Data/Ulid'
import { z } from 'zod'
import { ErrorConverter } from './ValidatorDecorator'

type PaginationType = {
	page?: number
	limit?: number
	sort?: string
	order?: 'ASC' | 'DESC'
	search?: string
	filter?: Record<string, unknown>
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
	})

	public parsePagination(data: unknown): Pagination {
		const pagination = this.parse<PaginationType>(data, this.paginationScheme)

		return new Pagination(
			pagination.page,
			pagination.limit,
			pagination.sort,
			pagination.order,
			pagination.search,
			pagination.filter
		)
	}

	public parseId(id: unknown): Ulid {
		return this.parse<string>(id, this.idScheme)
	}

	public parseSlug(slug: unknown): string {
		return this.parse<string>(slug, this.slugScheme)
	}

	protected parse<T>(o: unknown, schema: z.ZodType): T {
		return schema.parse(o)
	}
}
