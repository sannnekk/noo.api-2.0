import { type BaseModel } from '../Data/Model'
import { Pagination } from '../Data/Pagination'
import { Repository } from '../Data/Repository'
import { InternalError } from '../Errors/InternalError'
import type { RequestMeta } from '../Response/RequestMeta'

export abstract class Service<T extends BaseModel> {
	protected lastRequestCondition:
		| Record<string, unknown>
		| Record<string, unknown>[]
		| undefined
	protected lastRequestPagination: Pagination | undefined
	protected lastRequestRelations: string[] | undefined
	protected lastUsedRepository: Repository<T> | null = null

	/*
	 * get model meta
	 */
	public async getLastRequestMeta(): Promise<RequestMeta> {
		if (this.lastUsedRepository === null) {
			throw new InternalError(
				'Tried to access request meta before request'
			)
		}

		const total = await this.lastUsedRepository.count(
			this.lastRequestCondition,
			this.lastRequestPagination
		)

		this.lastRequestCondition = undefined
		this.lastRequestPagination = undefined
		this.lastRequestRelations = undefined
		this.lastUsedRepository = null

		return { total, relations: this.lastRequestRelations || [] }
	}

	protected storeRequestMeta(
		repository: Repository<T>,
		condition:
			| Record<string, unknown>
			| Record<string, unknown>[]
			| undefined,
		relations: string[] | undefined,
		pagination: Pagination | undefined
	) {
		this.lastUsedRepository = repository
		this.lastRequestCondition = condition
		this.lastRequestPagination = pagination
		this.lastRequestRelations = relations
	}
}
