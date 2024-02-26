import TypeORM from 'typeorm';
export class Pagination {
    page;
    limit;
    sort;
    order;
    search;
    entries = [];
    constructor(page, limit, sort, order, search) {
        this.page = page || 1;
        this.limit = limit || 25;
        this.sort = sort || 'id';
        this.order = order === 'ASC' ? 'ASC' : 'DESC';
        this.search = search || '';
    }
    assign(data) {
        Object.assign(this, data);
        return this;
    }
    get offset() {
        return (this.page - 1) * this.limit;
    }
    get take() {
        return this.limit;
    }
    get orderOptions() {
        return {
            [this.sort]: this.order,
        };
    }
    set entriesToSearch(entries) {
        this.entries = entries;
    }
    get entriesToSearch() {
        return this.entries;
    }
    getCondition(conditions) {
        if (!this.search.length || !this.entries.length) {
            return conditions || {};
        }
        return this.entries.map((entry) => ({
            ...(conditions || {}),
            [entry]: TypeORM.ILike(`%${this.search}%`),
        }));
    }
}
