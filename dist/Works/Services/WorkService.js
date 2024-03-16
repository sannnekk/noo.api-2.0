import { NotFoundError, Pagination, Service } from '../../core/index.js';
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
        this.storeRequestMeta(this.workRepository, undefined, undefined, pagination);
        return works;
    }
    async getWorkBySlug(slug) {
        const work = await this.workRepository.findOne({ slug }, ['tasks']);
        if (!work) {
            throw new NotFoundError();
        }
        return this.sortTasks(work);
    }
    async getWorkById(id) {
        const work = await this.workRepository.findOne({ id }, ['tasks']);
        if (!work) {
            throw new NotFoundError();
        }
        return this.sortTasks(work);
    }
    async createWork(work) {
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
    async updateWork(work) {
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
    sortTasks(work) {
        work.tasks = work.tasks.sort((a, b) => a.order - b.order);
        return work;
    }
}
