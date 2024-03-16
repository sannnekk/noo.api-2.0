import { InternalError } from '../Errors/InternalError';
export class Service {
    lastRequestCondition;
    lastRequestPagination;
    lastRequestRelations;
    lastUsedRepository = null;
    /*
     * get model meta
     */
    async getLastRequestMeta() {
        if (this.lastUsedRepository === null) {
            throw new InternalError('Tried to access request meta before request');
        }
        const total = await this.lastUsedRepository.count(this.lastRequestCondition, this.lastRequestPagination);
        return { total, relations: this.lastRequestRelations || [] };
    }
    storeRequestMeta(repository, condition, relations, pagination) {
        this.lastUsedRepository = repository;
        this.lastRequestCondition = condition;
        this.lastRequestPagination = pagination;
        this.lastRequestRelations = relations;
    }
}
