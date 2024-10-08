import Dates from '../Utils/date.js';
export class Pagination {
    page;
    limit;
    sort;
    order;
    search;
    filters = {};
    relations = [];
    constructor(page, limit, sort, order, search, filters, relations) {
        this.page = page || 1;
        this.limit = limit || 25;
        this.sort = sort || 'id';
        this.order = order === 'ASC' ? 'ASC' : 'DESC';
        this.search = search || '';
        this.filters = filters ? this.parseFilterValues(filters) : {};
        this.relations = relations || [];
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
    set take(value) {
        this.limit = value;
    }
    getOrderOptions(entityName) {
        return {
            [`${entityName}.${this.sort}`]: this.order,
        };
    }
    get relationsToLoad() {
        return this.relations;
    }
    get searchQuery() {
        return this.search;
    }
    set searchQuery(value) {
        this.search = value;
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
    parseFilterValues(filters) {
        const parsedFilters = {};
        let value;
        for (const key in filters) {
            value = filters[key];
            if (value === 'null') {
                parsedFilters[key] = () => `${key} IS NULL`;
                continue;
            }
            if (/^range\([0-9.|:\-\_a-zA-Z]+\)$/.test(value)) {
                this.addRangeFilter(key, value, parsedFilters);
                continue;
            }
            if (/^arr\([0-9.|:\-\_a-zA-Z]+\)$/.test(value)) {
                this.addArrayFilter(key, value, parsedFilters);
                continue;
            }
            if (/^tags\((?:[\p{L}\p{N}_]+)(?:\|[\p{L}\p{N}_]+)*\)$/u.test(value)) {
                this.addTagFilter(key, value, parsedFilters);
                continue;
            }
            this.addSimpleFilter(key, value, parsedFilters);
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
        if (Dates.isISOString(value)) {
            return Dates.fromISOString(value);
        }
        return value;
    }
    addRangeFilter(key, value, parsedFilters) {
        const [min, max] = value.slice(6, -1).split('|').map(this.typeConvert);
        const parameterKey = Math.random().toString(36).slice(3);
        parsedFilters[key] = (query, metadata) => {
            key = this.getDbNameAndAddJoins(query, key, metadata);
            if (min !== null) {
                query.andWhere(`${key} >= :min${parameterKey}`, {
                    [`min${parameterKey}`]: min,
                });
            }
            if (max !== null) {
                query.andWhere(`${key} <= :max${parameterKey}`, {
                    [`max${parameterKey}`]: max,
                });
            }
        };
    }
    addArrayFilter(key, value, parsedFilters) {
        const values = value.slice(4, -1).split('|').map(this.typeConvert);
        const parameterKey = Math.random().toString(36).slice(3);
        if (values.length !== 0) {
            parsedFilters[key] = (query, metadata) => {
                key = this.getDbNameAndAddJoins(query, key, metadata);
                query.andWhere(`${key} IN (:...values${parameterKey})`, {
                    [`values${parameterKey}`]: values,
                });
            };
        }
    }
    addTagFilter(key, value, parsedFilters) {
        const tags = value.slice(5, -1).split('|').map(this.typeConvert);
        const parameterKey = Math.random().toString(36).slice(3);
        if (tags?.length > 0) {
            parsedFilters[key] = (query, metadata) => {
                key = this.getDbNameAndAddJoins(query, key, metadata);
                for (const tag of tags) {
                    query.andWhere(`${key} LIKE :tag${parameterKey}`, {
                        [`tag${parameterKey}`]: `%${tag}%`,
                    });
                }
            };
        }
    }
    addSimpleFilter(key, value, parsedFilters) {
        const convertedValue = this.typeConvert(value);
        parsedFilters[key] = (query, metadata) => {
            key = this.getDbNameAndAddJoins(query, key, metadata);
            query.andWhere(`${key} = :${key}`, { [key]: convertedValue });
        };
    }
    getDbNameAndAddJoins(query, key, metadata) {
        const alias = query.alias;
        const mainTableName = metadata.tableName;
        const entityName = metadata.tableName;
        const [relationProp, column] = key.split('.');
        if (!column) {
            return `${entityName}.${key}`;
        }
        const relation = metadata.relations.find((r) => r.propertyName === relationProp);
        if (!relation) {
            return `${entityName}.${key}`;
        }
        const fullAlias = `${alias}__${mainTableName}_${relationProp}`;
        const alreadyJoined = query.expressionMap.joinAttributes.some((join) => join.alias.name === fullAlias);
        if (!alreadyJoined) {
            query.leftJoinAndSelect(`${entityName}.${relationProp}`, fullAlias);
        }
        return `${fullAlias}.${column}`;
    }
}
