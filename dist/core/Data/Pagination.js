export class Pagination {
    page;
    limit;
    sort;
    order;
    constructor(page = 0, limit = 10, sort = 'id', order = 'ASC') {
        this.page = page;
        this.limit = limit;
        this.sort = sort;
        this.order = order === 'ASC' ? 'ASC' : 'DESC';
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
}
