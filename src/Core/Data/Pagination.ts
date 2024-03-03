import TypeORM from 'typeorm'

export type RawFilters = {
	[key: `filter[${string}]`]: string
}

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
		rawFilters?: RawFilters | undefined
	) {
		this.page = page || 1
		this.limit = limit || 25
		this.sort = sort || 'id'
		this.order = order === 'ASC' ? 'ASC' : 'DESC'
		this.search = search || ''
		this.filters = rawFilters ? this.parseFilterValues(rawFilters) : {}
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
		const allConditions = { ...(conditions || {}), ...this.filters }

		if (!this.search.length || !this.entries.length) {
			return allConditions
		}

		return this.entries.map((entry) => ({
			...allConditions,
			[entry]: TypeORM.ILike(`%${this.search}%`),
		}))
	}

	private parseFilterValues(filters: RawFilters): Filters {
		return Object.entries(filters)
			.map(([key, value]) => {
				const [_, field] = key.split('[')
				const fieldName = field.slice(0, -1)

				if (value === 'null') {
					return { [fieldName]: null }
				}

				if (/^range\([0-9.|]+\)$/.test(value)) {
					const [min, max] = value
						.slice(6, -1)
						.split('|')
						.map((v) => this.typeConvert(v))

					return { [fieldName]: TypeORM.Between(min, max) }
				}

				if (/^arr\([0-9a-bA-B\_|]+\)$/.test(value)) {
					return {
						[fieldName]: TypeORM.In(
							value
								.slice(4, -1)
								.split('|')
								.map((v) => this.typeConvert(v))
						),
					}
				}

				return { [fieldName]: this.typeConvert(value) }
			})
			.reduce((acc, filter) => ({ ...acc, ...filter }), {} as Filters)
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

		if (new Date(value).toISOString() === value) {
			return new Date(value)
		}

		return value
	}
}
