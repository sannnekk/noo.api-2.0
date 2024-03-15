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
        const relations = ['materials'];
        const works = await this.workRepository.find(undefined, relations, pagination);
        this.storeRequestMeta(this.workRepository, undefined, relations, pagination);
        // Clear tasks as they are not needed in the list
        for (const work of works) {
            work.tasks = [];
        }
        return works;
    }
    async getWorkBySlug(slug) {
        const work = await this.workRepository.findOne({ slug });
        if (!work) {
            throw new NotFoundError();
        }
        return this.sortTasks(work);
    }
    async getWorkById(id) {
        const work = await this.workRepository.findOne({ id });
        if (!work) {
            throw new NotFoundError();
        }
        return this.sortTasks(work);
    }
    async createWork(work) {
        return this.workRepository.create(work);
    }
    async copyWork(workSlug) {
        const work = await this.workRepository.findOne({ slug: workSlug });
        if (!work) {
            throw new NotFoundError('Работа не найдена');
        }
        const newWork = {
            type: work.type,
            name: `[копия] ${work.name}`,
            description: work.description,
        };
        newWork.tasks = work.tasks.map((task) => ({
            id: undefined,
            slug: undefined,
            workId: undefined,
            name: task.name,
            order: task.order,
            content: task.content,
            highestScore: task.highestScore,
            type: task.type,
            options: [],
            checkingStrategy: task.checkingStrategy,
            rightAnswer: task.rightAnswer,
            solveHint: task.solveHint,
            checkHint: task.checkHint,
            assignedWorkId: undefined,
            assignedWorkAnswers: [],
            assignedWorkAnswerIds: [],
            assignedWorkComments: [],
            assignedWorkCommentIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
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
