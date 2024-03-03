import TypeORM from 'typeorm';
export class Pagination {
    page;
    limit;
    sort;
    order;
    search;
    entries = [];
    filters = {};
    constructor(page, limit, sort, order, search, rawFilters) {
        this.page = page || 1;
        this.limit = limit || 25;
        this.sort = sort || 'id';
        this.order = order === 'ASC' ? 'ASC' : 'DESC';
        this.search = search || '';
        this.filters = rawFilters ? this.parseFilterValues(rawFilters) : {};
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
        const allConditions = { ...(conditions || {}), ...this.filters };
        if (!this.search.length || !this.entries.length) {
            return allConditions;
        }
        return this.entries.map((entry) => ({
            ...allConditions,
            [entry]: TypeORM.ILike(`%${this.search}%`),
        }));
    }
    parseFilterValues(filters) {
        return Object.entries(filters)
            .map(([key, value]) => {
            const [_, field] = key.split('[');
            const fieldName = field.slice(0, -1);
            if (value === 'null') {
                return { [fieldName]: null };
            }
            if (/^range\([0-9.|]+\)$/.test(value)) {
                const [min, max] = value
                    .slice(6, -1)
                    .split('|')
                    .map((v) => this.typeConvert(v));
                return { [fieldName]: TypeORM.Between(min, max) };
            }
            if (/^arr\([0-9a-bA-B\_|]+\)$/.test(value)) {
                return {
                    [fieldName]: TypeORM.In(value
                        .slice(4, -1)
                        .split('|')
                        .map((v) => this.typeConvert(v))),
                };
            }
            return { [fieldName]: this.typeConvert(value) };
        })
            .reduce((acc, filter) => ({ ...acc, ...filter }), {});
    }
    typeConvert(value) {
        if (value === 'null') {
            return null;
        }
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }
        if (/^[0-9]+$/.test(value)) {
            return parseInt(value);
        }
        if (/^[0-9.]+$/.test(value)) {
            return parseFloat(value);
        }
        if (new Date(value).toISOString() === value) {
            return new Date(value);
        }
        return value;
    }
}
