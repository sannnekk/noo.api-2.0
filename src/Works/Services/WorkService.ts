import { NotFoundError, Pagination, Service } from '@core'
import { WorkRepository } from '../Data/WorkRepository'
import { Work } from '../Data/Work'
import { WorkModel } from '../Data/WorkModel'

export class WorkService extends Service<Work> {
	private readonly workRepository: WorkRepository

	constructor() {
		super()

		this.workRepository = new WorkRepository()
	}

	public async getWorks(pagination?: Pagination) {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = WorkModel.entriesToSearch()

		const relations = ['materials' as const]

		const works = await this.workRepository.find(
			undefined,
			relations,
			pagination
		)

		this.storeRequestMeta(
			this.workRepository,
			undefined,
			relations,
			pagination
		)

		return works
	}

	public async getWorkBySlug(slug: Work['slug']) {
		const work = await this.workRepository.findOne({ slug })

		if (!work) {
			throw new NotFoundError()
		}

		return this.sortTasks(work)
	}

	public async getWorkById(id: Work['id']) {
		const work = await this.workRepository.findOne({ id })

		if (!work) {
			throw new NotFoundError()
		}

		return this.sortTasks(work)
	}

	public async createWork(work: Work) {
		return this.workRepository.create(work)
	}

	public async copyWork(workSlug: Work['slug']) {
		const work = await this.workRepository.findOne({ slug: workSlug })

		if (!work) {
			throw new NotFoundError('Работа не найдена')
		}

		const newWork = {
			...work,
			name: `${work.name} [копия]`,
			assignedWorks: [],
			assignedWorkIds: [],
			id: undefined as any,
			slug: undefined as any,
		}

		newWork.tasks = newWork.tasks.map((task) => ({
			...task,
			id: undefined as any,
			workId: undefined as any,
			assignedWorkAnswers: [],
			assignedWorkAnswerIds: [],
			assignedWorkComments: [],
			assignedWorkCommentIds: [],
		}))

		return this.workRepository.create(newWork)
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

	private sortTasks(work: Work) {
		work.tasks = work.tasks.sort((a, b) => a.order - b.order)

		return work
	}
}
