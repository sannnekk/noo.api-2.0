import TypeORM from 'typeorm';
export class Pagination {
    page;
    limit;
    sort;
    order;
    search;
    entries = [];
    constructor(page = 1, limit = 10, sort = 'id', order = 'ASC', search = '') {
        this.page = page;
        this.limit = limit;
        this.sort = sort;
        this.order = order === 'ASC' ? 'ASC' : 'DESC';
        this.search = search;
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
