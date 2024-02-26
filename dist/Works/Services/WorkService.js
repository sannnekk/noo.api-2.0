import { NotFoundError, Pagination, Service } from '@core';
import { WorkRepository } from '../Data/WorkRepository';
import { WorkModel } from '../Data/WorkModel';
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
