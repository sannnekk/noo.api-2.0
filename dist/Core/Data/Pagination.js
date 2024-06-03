import { merge } from 'ts-deepmerge';
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
        let allConditions = [{ ...this.filters }];
        if (Array.isArray(conditions)) {
            allConditions = conditions.map((condition) => merge(this.filters, condition));
        }
        else {
            allConditions = [merge(conditions || {}, this.filters)];
        }
        if (!this.search.length || !this.entries.length) {
            if (allConditions.length === 1) {
                return allConditions[0];
            }
            return allConditions;
        }
        const result = this.entries.flatMap((entry) => {
            const merges = [];
            for (const condition of allConditions) {
                merges.push(merge(this.getSearchCondition(entry, this.search), condition));
            }
            return merges;
        });
        if (result.length === 1 && Object.keys(result[0]).length === 0) {
            return undefined;
        }
        return result;
    }
    getFilter(name) {
        return this.filters[name];
    }
    getFilters() {
        return this.filters;
    }
    setFilter(name, value) {
        this.filters[name] = value;
    }
    getSearchCondition(entry, search) {
        if (entry.includes('.')) {
            const [relation] = entry.split('.');
            const rest = entry.slice(relation.length + 1);
            return {
                [relation]: {
                    ...this.getSearchCondition(rest, search),
                },
            };
        }
        return { [entry]: TypeORM.ILike(`%${this.search}%`) };
    }
    parseFilterValues(filters) {
        const parsedFilters = {};
        let value;
        for (const key in filters) {
            value = filters[key];
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
                if (parsedFilters[key].length === 0) {
                    parsedFilters[key] = undefined;
                }
                continue;
            }
            if (/^tags\([0-9.|:\-\_a-zA-Z]+\)$/.test(value)) {
                parsedFilters[key] = value
                    .slice(5, -1)
                    .split('|')
                    .map((v) => TypeORM.ILike(`%${this.typeConvert(v)},%`));
                if (parsedFilters[key].length === 0) {
                    parsedFilters[key] = undefined;
                }
                if (parsedFilters[key].length === 1) {
                    parsedFilters[key] = parsedFilters[key][0];
                }
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
        if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            return new Date(value);
        }
        return value;
    }
}
