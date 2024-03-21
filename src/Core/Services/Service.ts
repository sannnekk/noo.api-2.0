import { type BaseModel } from '../Data/Model'
import { Pagination } from '../Data/Pagination'
import { Repository } from '../Data/Repository'
import { InternalError } from '../Errors/InternalError'
import type { RequestMeta } from '../Response/RequestMeta'

export abstract class Service<T extends BaseModel> {
	/*
	 * get model meta
	 */
	public async getRequestMeta(
		repository: Repository<T>,
		condition:
			| Record<string, unknown>
			| Record<string, unknown>[]
			| undefined,
		pagination: Pagination,
		relations: string[]
	): Promise<RequestMeta> {
		const total = await repository.count(condition, pagination)

		return { total, relations }
	}
}
