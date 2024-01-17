import { NotFoundError, Pagination } from '@core';
import { WorkRepository } from '../Data/WorkRepository';
import { WorkModel } from '../Data/WorkModel';
export class WorkService {
    workRepository;
    constructor() {
        this.workRepository = new WorkRepository();
    }
    async getWorks(pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = ['name', 'description'];
        return await this.workRepository.find(undefined, ['materials'], pagination);
    }
    async getWorkBySlug(slug) {
        const work = await this.workRepository.findOne({ slug });
        if (!work) {
            throw new NotFoundError();
        }
        return work;
    }
    async getWorkById(id) {
        const work = await this.workRepository.findOne({ id });
        if (!work) {
            throw new NotFoundError();
        }
        return work;
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
}
