import { Service } from '../../Core/Services/Service.js';
import { Pagination } from '../../Core/Data/Pagination.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { WorkRepository } from '../Data/WorkRepository.js';
import { WorkModel } from '../Data/WorkModel.js';
export class WorkService extends Service {
    workRepository;
    constructor() {
        super();
        this.workRepository = new WorkRepository();
    }
    async getWorks(pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = WorkModel.entriesToSearch();
        const works = await this.workRepository.find(undefined, undefined, pagination);
        const meta = await this.getRequestMeta(this.workRepository, undefined, pagination, []);
        return { works, meta };
    }
    async getWorkBySlug(slug) {
        const work = await this.workRepository.findOne({ slug }, ['tasks'], {
            tasks: { order: 'ASC' },
        });
        if (!work) {
            throw new NotFoundError();
        }
        return work;
    }
    async getWorkById(id) {
        const work = await this.workRepository.findOne({ id }, ['tasks'], {
            tasks: { order: 'ASC' },
        });
        if (!work) {
            throw new NotFoundError();
        }
        return work;
    }
    async createWork(workDTO) {
        const work = new WorkModel(workDTO);
        return await this.workRepository.create(work);
    }
    async copyWork(workSlug) {
        const work = await this.workRepository.findOne({ slug: workSlug }, [
            'tasks',
        ]);
        if (!work) {
            throw new NotFoundError('Работа не найдена');
        }
        const newWork = {
            type: work.type,
            name: `[копия] ${work.name}`,
            description: work.description,
        };
        newWork.tasks = work.tasks.map((task) => ({
            order: task.order,
            content: task.content,
            highestScore: task.highestScore,
            type: task.type,
            checkingStrategy: task.checkingStrategy,
            rightAnswer: task.rightAnswer,
            solveHint: task.solveHint,
            checkHint: task.checkHint,
        }));
        this.workRepository.create(newWork);
    }
    async updateWork(id, work) {
        const foundWork = await this.workRepository.findOne({ id: work.id });
        if (!foundWork) {
            throw new NotFoundError();
        }
        const newWork = new WorkModel({ ...foundWork, ...work });
        return this.workRepository.update(newWork);
    }
    async deleteWork(id) {
        const foundWork = await this.workRepository.findOne({ id });
        if (!foundWork) {
            throw new NotFoundError();
        }
        return this.workRepository.delete(id);
    }
}
