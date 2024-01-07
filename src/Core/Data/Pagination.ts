export class Pagination {
	private page: number
	private limit: number
	private sort: string
	private order: 'ASC' | 'DESC'

	constructor(
		page: number = 0,
		limit: number = 10,
		sort: string = 'id',
		order: string = 'ASC'
	) {
		this.page = page
		this.limit = limit
		this.sort = sort
		this.order = order === 'ASC' ? 'ASC' : 'DESC'
	}

	get offset(): number {
		return (this.page - 1) * this.limit
	}

	get take(): number {
		return this.limit
	}

	get orderOptions(): Record<string, 'ASC' | 'DESC'> {
		return {
			[this.sort]: this.order,
		}
	}
}
