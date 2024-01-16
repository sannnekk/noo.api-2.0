import { Pagination } from '../Data/Pagination'
import { Ulid } from '../Data/Ulid'
import { z } from 'zod'

export abstract class Validator {
	public validatePagination(data: unknown): asserts data is Pagination {
		const schema = z.object({
			page: z.number().int().positive().optional(),
			limit: z.number().int().positive().optional(),
			sort: z.string().optional(),
			order: z.string().optional(),
			search: z.any().optional(),
		})

		schema.parse(data)
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
