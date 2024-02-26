import { Pagination } from '../Data/Pagination'
import { Ulid } from '../Data/Ulid'
import { z } from 'zod'
import { ErrorConverter } from './ValidatorDecorator'

@ErrorConverter()
export abstract class Validator {
	public validatePagination(data: unknown): Pagination {
		const schema = z.object({
			page: z.coerce.number().int().positive().optional(),
			limit: z.coerce.number().int().positive().optional(),
			sort: z.string().optional(),
			order: z.enum(['ASC', 'DESC']).optional(),
			search: z.string().optional(),
		})

		const pagination = schema.parse(data)

		return new Pagination(
			pagination.page,
			pagination.limit,
			pagination.sort,
			pagination.order,
			pagination.search
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
