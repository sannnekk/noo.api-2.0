import TypeORM from 'typeorm'

export class Pagination {
	private page: number
	private limit: number
	private sort: string
	private order: 'ASC' | 'DESC'
	private search: string
	private entries: string[] = []

	public constructor(
		page?: number | undefined,
		limit?: number | undefined,
		sort?: string | undefined,
		order?: 'ASC' | 'DESC' | undefined,
		search?: string | undefined
	) {
		this.page = page || 1
		this.limit = limit || 25
		this.sort = sort || 'id'
		this.order = order === 'ASC' ? 'ASC' : 'DESC'
		this.search = search || ''
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
		if (!this.search.length || !this.entries.length) {
			return conditions || {}
		}

		return this.entries.map((entry) => ({
			...(conditions || {}),
			[entry]: TypeORM.ILike(`%${this.search}%`),
		}))
	}
}
