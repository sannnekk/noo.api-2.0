import { NotFoundError, Pagination } from '@core'
import { WorkRepository } from '../Data/WorkRepository'
import { Work } from '../Data/Work'
import { WorkModel } from '../Data/WorkModel'

export class WorkService {
	private readonly workRepository: WorkRepository

	constructor() {
		this.workRepository = new WorkRepository()
	}

	public async getWorks(pagination?: Pagination) {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = ['name', 'description']

		return await this.workRepository.find(
			undefined,
			['materials'],
			pagination
		)
	}

	public async getWorkBySlug(slug: Work['slug']) {
		const work = await this.workRepository.findOne({ slug })

		if (!work) {
			throw new NotFoundError()
		}

		return work
	}

	public async getWorkById(id: Work['id']) {
		const work = await this.workRepository.findOne({ id })

		if (!work) {
			throw new NotFoundError()
		}

		return work
	}

	public async createWork(work: Work) {
		return this.workRepository.create(work)
	}

	public async updateWork(work: Work) {
		const foundWork = await this.workRepository.findOne({ id: work.id })

		if (!foundWork) {
			throw new NotFoundError()
		}

		const newWork = new WorkModel({ ...foundWork, ...work })

		return this.workRepository.update(newWork)
	}

	public async deleteWork(id: Work['id']) {
		const foundWork = await this.workRepository.findOne({ id })

		if (!foundWork) {
			throw new NotFoundError()
		}

		return this.workRepository.delete(id)
	}
}
