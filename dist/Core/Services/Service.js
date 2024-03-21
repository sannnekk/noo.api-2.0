export class Service {
    /*
     * get model meta
     */
    async getRequestMeta(repository, condition, pagination, relations) {
        const total = await repository.count(condition, pagination);
        return { total, relations };
    }
}
