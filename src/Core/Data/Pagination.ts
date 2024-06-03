import { merge } from 'ts-deepmerge'
import TypeORM from 'typeorm'

export type Filters = Record<string, any>

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
		| undefined
		| Record<string, string | number>
		| Record<string, string | number>[] {
		let allConditions = [{ ...this.filters }]

		if (Array.isArray(conditions)) {
			allConditions = conditions.map((condition) =>
				merge(this.filters, condition)
			)
		} else {
			allConditions = [merge(conditions || {}, this.filters)]
		}

		if (!this.search.length || !this.entries.length) {
			if (allConditions.length === 1) {
				return allConditions[0]
			}

			return allConditions
		}

		const result = this.entries.flatMap((entry) => {
			const merges = []

			for (const condition of allConditions) {
				merges.push(
					merge(
						this.getSearchCondition(entry, this.search),
						condition
					) as Record<string, any>
				)
			}

			return merges
		})

		if (result.length === 1 && Object.keys(result[0]).length === 0) {
			return undefined
		}

		return result
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

	private getSearchCondition(
		entry: string,
		search: string
	): Record<string, any> {
		if (entry.includes('.')) {
			const [relation] = entry.split('.')
			const rest = entry.slice(relation.length + 1)
			return {
				[relation]: {
					...this.getSearchCondition(rest, search),
				},
			}
		}

		return { [entry]: TypeORM.ILike(`%${this.search}%`) }
	}

	private parseFilterValues(filters: Filters): Filters {
		const parsedFilters = {} as any
		let value: any

		for (const key in filters) {
			value = filters[key]

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

				if (parsedFilters[key].length === 0) {
					parsedFilters[key] = undefined
				}

				continue
			}

			if (/^tags\([0-9.|:\-\_a-zA-Z]+\)$/.test(value)) {
				parsedFilters[key] = value
					.slice(5, -1)
					.split('|')
					.map((v: string) =>
						TypeORM.ILike(`%${this.typeConvert(v) as string},%`)
					)

				if (parsedFilters[key].length === 0) {
					parsedFilters[key] = undefined
				}

				if (parsedFilters[key].length === 1) {
					parsedFilters[key] = parsedFilters[key][0]
				}

				continue
			}

			parsedFilters[key] = this.typeConvert(value)
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

		if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
			return new Date(value)
		}

		return value
	}
}
