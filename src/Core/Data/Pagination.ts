import TypeORM from 'typeorm'
import { array } from 'zod'

export type Filters = {
	[key: string]: any
}

export class Pagination {
	private page: number
	private limit: number
	private sort: string
	private order: 'ASC' | 'DESC'
	private search: string
	private entries: string[] = []
	private filters: Filters = {}

	public constructor(
		page?: number | undefined,
		limit?: number | undefined,
		sort?: string | undefined,
		order?: 'ASC' | 'DESC' | undefined,
		search?: string | undefined,
		filters?: Filters | undefined
	) {
		this.page = page || 1
		this.limit = limit || 25
		this.sort = sort || 'id'
		this.order = order === 'ASC' ? 'ASC' : 'DESC'
		this.search = search || ''
		this.filters = filters ? this.parseFilterValues(filters) : {}
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

	public get orderOptions(): Record<string, 'ASC' | 'DESC'> {
		return {
			[this.sort]: this.order,
		}
	}

	public set entriesToSearch(entries: string[]) {
		this.entries = entries
	}

	public get entriesToSearch(): string[] {
		return this.entries
	}

	public getCondition(
		conditions?: Record<string, any>
	):
		| Record<string, string | number>
		| Record<string, string | number>[] {
		if (Array.isArray(conditions)) {
			return conditions
		}

		const allConditions = { ...(conditions || {}), ...this.filters }

		if (!this.search.length || !this.entries.length) {
			return allConditions
		}

		return this.entries.map((entry) => ({
			...allConditions,
			[entry]: TypeORM.ILike(`%${this.search}%`),
		}))
	}

	private parseFilterValues(filters: Filters): Filters {
		const parsedFilters = {} as any

		for (const key in filters) {
			const value = filters[key]

			if (value === 'null') {
				parsedFilters[key] = null
				continue
			}

			if (/^range\([0-9.|:\-\_a-zA-Z]+\)$/.test(value)) {
				const [min, max] = value
					.slice(6, -1)
					.split('|')
					.map((v: any) => this.typeConvert(v))

				parsedFilters[key] = TypeORM.Between(min, max)
				continue
			}

			if (/^arr\([0-9.|:\-\_a-zA-Z]+\)$/.test(value)) {
				parsedFilters[key] = TypeORM.In(
					value
						.slice(4, -1)
						.split('|')
						.map((v: any) => this.typeConvert(v))
				)
				continue
			}

			parsedFilters[key] = this.typeConvert(value)
		}

		return parsedFilters
	}

	private typeConvert(
		value: string
	): string | number | boolean | Date | null {
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

		try {
			const date = new Date(value)

			if (!isNaN(date.getTime())) {
				return date
			}
		} catch (error: any) {}

		return value
	}
}
