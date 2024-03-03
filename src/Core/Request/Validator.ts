import { Pagination, RawFilters } from '../Data/Pagination'
import { Ulid } from '../Data/Ulid'
import { z } from 'zod'
import { ErrorConverter } from './ValidatorDecorator'

@ErrorConverter()
export abstract class Validator {
	public validatePagination(data: unknown): Pagination {
		// TODO: Better validation for filter's value
		const filterValueSchema = z.string()

		const filterSchema = z.custom<RawFilters>((data) => {
			return z
				.record(
					z.string().regex(/^filter\[[a-zA-Z.]+\]$/),
					filterValueSchema
				)
				.parse(data)
		})

		const schema = z.object({
			page: z.coerce.number().int().positive().optional(),
			limit: z.coerce.number().int().positive().optional(),
			sort: z.string().optional(),
			order: z.enum(['ASC', 'DESC']).optional(),
			search: z.string().optional(),
		})

		const pagination = schema.parse(data)
		const rawFilters = filterSchema.parse(data)

		return new Pagination(
			pagination.page,
			pagination.limit,
			pagination.sort,
			pagination.order,
			pagination.search,
			rawFilters
		)
	}

	public validateId(id: unknown): asserts id is Ulid {
		const schema = z.string().ulid()

		schema.parse(id)
	}

	public validateSlug(slug: unknown): asserts slug is string {
		const schema = z.string().min(2).max(256)

		schema.parse(slug)
	}
}
