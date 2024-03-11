import TypeORM from 'typeorm';
export class Pagination {
    page;
    limit;
    sort;
    order;
    search;
    entries = [];
    filters = {};
    constructor(page, limit, sort, order, search, filters) {
        this.page = page || 1;
        this.limit = limit || 25;
        this.sort = sort || 'id';
        this.order = order === 'ASC' ? 'ASC' : 'DESC';
        this.search = search || '';
        this.filters = filters ? this.parseFilterValues(filters) : {};
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
        if (Array.isArray(conditions)) {
            return conditions;
        }
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
        const parsedFilters = {};
        for (const key in filters) {
            const value = filters[key];
            if (value === 'null') {
                parsedFilters[key] = null;
                continue;
            }
            if (/^range\([0-9.|:\-\_a-zA-Z]+\)$/.test(value)) {
                const [min, max] = value
                    .slice(6, -1)
                    .split('|')
                    .map((v) => this.typeConvert(v));
                parsedFilters[key] = TypeORM.Between(min, max);
                continue;
            }
            if (/^arr\([0-9.|:\-\_a-zA-Z]+\)$/.test(value)) {
                parsedFilters[key] = TypeORM.In(value
                    .slice(4, -1)
                    .split('|')
                    .map((v) => this.typeConvert(v)));
                continue;
            }
            parsedFilters[key] = this.typeConvert(value);
        }
        return parsedFilters;
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
        try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        catch (error) { }
        return value;
    }
}
