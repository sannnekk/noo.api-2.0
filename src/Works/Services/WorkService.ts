import { Service } from '@modules/Core/Services/Service'
import { Pagination } from '@modules/Core/Data/Pagination'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { WorkRepository } from '../Data/WorkRepository'
import { Work } from '../Data/Work'
import { WorkModel } from '../Data/WorkModel'
import { WorkDTO } from '../DTO/WorkDTO'

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

		const meta = await this.getRequestMeta(
			this.workRepository,
			undefined,
			pagination,
			[]
		)

		return { works, meta }
	}

	public async getWorkBySlug(slug: Work['slug']) {
		const work = await this.workRepository.findOne({ slug }, ['tasks'], {
			tasks: { order: 'ASC' },
		})

		if (!work) {
			throw new NotFoundError()
		}

		return work
	}

	public async getWorkById(id: Work['id']) {
		const work = await this.workRepository.findOne({ id }, ['tasks'], {
			tasks: { order: 'ASC' },
		})

		if (!work) {
			throw new NotFoundError()
		}

		return work
	}

	public async createWork(workDTO: WorkDTO) {
		const work = new WorkModel(workDTO)
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

	public async updateWork(id: Work['id'], work: WorkDTO) {
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
