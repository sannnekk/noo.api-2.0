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

		const works = await this.workRepository.find(
			undefined,
			undefined,
			pagination
		)

		this.storeRequestMeta(
			this.workRepository,
			undefined,
			undefined,
			pagination
		)

		return works
	}

	public async getWorkBySlug(slug: Work['slug']) {
		const work = await this.workRepository.findOne({ slug }, ['tasks'])

		if (!work) {
			throw new NotFoundError()
		}

		return this.sortTasks(work)
	}

	public async getWorkById(id: Work['id']) {
		const work = await this.workRepository.findOne({ id }, ['tasks'])

		if (!work) {
			throw new NotFoundError()
		}

		return this.sortTasks(work)
	}

	public async createWork(work: Work) {
		return await this.workRepository.create(work)
	}

	public async copyWork(workSlug: Work['slug']) {
		const work = await this.workRepository.findOne({ slug: workSlug }, [
			'tasks',
		])

		if (!work) {
			throw new NotFoundError('Работа не найдена')
		}

		const newWork = {
			type: work.type,
			name: `[копия] ${work.name}`,
			description: work.description,
		} as Work

		newWork.tasks = work.tasks.map(
			(task) =>
				({
					order: task.order,
					content: task.content,
					highestScore: task.highestScore,
					type: task.type,
					checkingStrategy: task.checkingStrategy,
					rightAnswer: task.rightAnswer,
					solveHint: task.solveHint,
					checkHint: task.checkHint,
				} as unknown as Work['tasks'][0])
		)

		this.workRepository.create(newWork)
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
