import { FindOptionsUtils, } from 'typeorm';
import { CoreDataSource } from './DataSource.js';
import { Pagination } from './Pagination.js';
import { NotFoundError } from '../Errors/NotFoundError.js';
import { AlreadyExistError } from '../Errors/AlreadyExistError.js';
/**
 * Generic repository class to use for all repositories
 */
export class Repository {
    model;
    repository;
    instance;
    metadata;
    entityName;
    eagerRelations;
    /**
     * Create a new repository instance
     *
     * @param model The model class to use for the repository
     */
    constructor(model) {
        this.model = model;
        this.repository = CoreDataSource.getRepository(model);
        // we need to create an instance of the model to get the search keywords
        // and check if the model is searchable
        // because we can't use the static method getSearchKeywords
        // because typescript doesn't allow abstract static methods
        this.instance = new this.model();
        this.metadata = this.repository.metadata;
        this.entityName = this.metadata.tableName;
        this.eagerRelations = this.metadata.relations
            .filter((relation) => relation.isEager)
            .map((relation) => relation.buildPropertyPath());
    }
    /**
     * Create a new entity
     *
     * @throws AlreadyExistError if the entity already exists
     * @param data The data to create the entity with
     */
    async create(data) {
        const model = new this.model(data);
        try {
            return (await this.repository.save(model));
        }
        catch (error) {
            if (error?.code === '23505') {
                throw new AlreadyExistError();
            }
            throw error;
        }
    }
    /**
     * Create multiple entities
     *
     * @throws AlreadyExistError if any of the entities already exists
     * @param data The data to create the entities with
     */
    async createMany(data) {
        const models = data.map((item) => new this.model(item));
        try {
            return this.repository.save(models);
        }
        catch (error) {
            if (error?.code === '23505') {
                throw new AlreadyExistError();
            }
            throw error;
        }
    }
    /**
     * Find and update an entity by its id.
     *
     * @throws NotFoundError if the entity is not found
     * @throws AlreadyExistError if the entity already exists
     * @param data The data to update the entity with (id is required)
     */
    async update(data) {
        const item = await this.repository.findOne({
            where: {
                id: data.id,
            },
        });
        if (!item) {
            throw new NotFoundError();
        }
        const newItem = new this.model({ ...item, ...data, id: item.id });
        try {
            const saved = await this.repository.save(newItem);
            return saved;
        }
        catch (error) {
            if (error?.code === '23505') {
                throw new AlreadyExistError();
            }
            throw error;
        }
    }
    /**
     * Update an entity without merging the data with the existing entity.
     *
     * @throws NotFoundError if the entity is not found
     * @throws AlreadyExistError if the entity already exists
     * @param data The data to update the entity with (id is required)
     */
    async updateRaw(data) {
        const item = await this.repository.findOne({
            where: {
                id: data.id,
            },
        });
        if (!item) {
            throw new NotFoundError();
        }
        try {
            await this.repository.save(data);
        }
        catch (error) {
            if (error?.code === '23505') {
                throw new AlreadyExistError();
            }
            throw error;
        }
    }
    /**
     * Delete an entity by its id
     *
     * @throws NotFoundError if the entity is not found
     * @param id The id of the entity
     */
    async delete(id) {
        const exists = await this.repository.exists({
            where: {
                id,
            },
        });
        if (!exists) {
            throw new NotFoundError();
        }
        await this.repository.delete(id);
    }
    /**
     * Delete entities by condition
     *
     * @param conditions Condition to delete by
     */
    async deleteWhere(conditions) {
        await this.repository.delete(conditions);
    }
    /**
     * Find many entities. If no pagination is provided, it will create one with default oprions (page 1, limit 25)
     *
     * @param conditions The conditions to find the entities with (ActiveRecord style)
     * @param relations The relations to load with the entities
     * @param pagination The pagination instance (typically created in validator from request query)
     */
    async find(conditions, relations, pagination = new Pagination()) {
        return this.search(conditions, pagination, relations);
    }
    /**
     * Find all entities without pagination
     *
     * @param conditions The conditions to find the entity with (ActiveRecord style)
     * @param relations The relations to load with the entity
     * @param sort The sort options to use
     */
    async findAll(conditions, relations, sort) {
        return this.repository.find({
            relations: relations || undefined,
            where: conditions,
            order: sort,
        });
    }
    /**
     * Find one entity
     *
     * @param conditions The conditions to find the entity with (ActiveRecord style)
     * @param relations The relations to load with the entity
     * @param sort The sort options to use
     */
    async findOne(conditions, relations, sort, options) {
        const findOneOptions = this.mergeWithDefaultFindOneOptions(options);
        return this.repository.findOne({
            relations: relations || undefined,
            where: conditions,
            order: sort,
            relationLoadStrategy: findOneOptions.relationLoadStrategy,
        });
    }
    /**
     * Get this repository's query builder
     *
     * @param alias Alias for the query
     * @returns The query builder instance
     */
    queryBuilder(alias) {
        return this.repository.createQueryBuilder(alias);
    }
    /**
     * Get this repository's tree repository
     *
     * @returns The tree repository instance
     */
    treeRepository() {
        return this.repository.manager.getTreeRepository(this.model);
    }
    /**
     * Search for entities. Uses entities that extend SearchableModel.
     * If no pagination is provided, it will create one with default oprions (page 1, limit 25)
     *
     * @param conditions The conditions to search the entities with (ActiveRecord style)
     * @param pagination The pagination instance (typically created in validator from request query)
     * @param relations The relations to load with the entities
     * @param groupBy The column to group by
     */
    async search(conditions, pagination, relations = [], groupBy, options) {
        const searchOptions = this.mergeWithDefaultSearchOptions(options);
        const queryPagination = new Pagination().assign(pagination);
        const query = this.queryBuilder(this.entityName);
        let searchRelations = [];
        // add search to query
        if (typeof this.instance.addSearchToQuery !==
            'undefined' &&
            queryPagination.searchQuery.length > 0) {
            searchRelations = this.instance.addSearchToQuery(query, queryPagination.searchQuery);
        }
        // filter out duplicates
        const allRelations = [...relations, ...searchRelations].filter((value, index, self) => self.indexOf(value) === index &&
            !this.eagerRelations.includes(value));
        this.addConditions(query, conditions);
        const countQuery = query.clone();
        this.addSelect(query, searchOptions.select);
        this.addPagination(query, queryPagination);
        this.addRelations(query, allRelations);
        this.addEagerRelations(query);
        this.addGroupBy(query, groupBy);
        this.addGroupBy(countQuery, groupBy);
        let entities = [];
        let total;
        if (searchOptions.select) {
            entities = await query.getRawMany();
            total = await countQuery.getCount();
        }
        else {
            ;
            [entities, total] = await query.getManyAndCount();
        }
        return {
            entities,
            meta: {
                total,
                relations: allRelations,
            },
        };
    }
    /**
     * Merge the provided search options with the default search options
     *
     * @param options options to merge with the default search options
     * @returns merged search options
     */
    mergeWithDefaultSearchOptions(options) {
        const defaultSearchOptions = {
            useEagerRelations: true,
        };
        return { ...defaultSearchOptions, ...options };
    }
    /**
     * Merge the provided find one options with the default find one options
     *
     * @param options options to merge with the default find one options
     * @returns merged find one options
     */
    mergeWithDefaultFindOneOptions(options) {
        const defaultFindOneOptions = {
            useEagerRelations: true,
            relationLoadStrategy: 'join',
        };
        return { ...defaultFindOneOptions, ...options };
    }
    /**
     *
     * @param query Instance of the query builder
     * @param select The columns to select
     */
    addSelect(query, selects) {
        if (selects) {
            query.select(selects.map(([col, alias]) => (alias ? `${col} as ${alias}` : col)));
        }
    }
    /**
     * Add relations to the query builder
     *
     * @param query Instance of the query builder
     * @param relations The relations to load with the entity
     */
    addRelations(query, relations = []) {
        for (const relation of relations) {
            const relationData = this.buildRelationPath(relation);
            for (const data of relationData) {
                // check if the relation is already added
                if (query.expressionMap.joinAttributes.some((attr) => attr.alias.name === data.alias)) {
                    continue;
                }
                query.leftJoinAndSelect(data.propPath, data.alias);
            }
        }
    }
    /**
     * Add eager relations to the query builder
     *
     * @param query Instance of the query builder
     */
    addEagerRelations(query) {
        FindOptionsUtils.joinEagerRelations(query, query.alias, this.metadata);
    }
    /**
     * Extract the query conditions from the pagination object
     * to be used in the query builder
     *
     * @param query Instance of the query builder
     * @param pagination Pagination object
     */
    addPagination(query, pagination) {
        const filters = pagination.getFilters();
        const metadata = this.repository.metadata;
        // adding filters to the query
        for (const key in filters) {
            if (filters[key] !== undefined) {
                filters[key](query, metadata);
            }
        }
        query.orderBy(pagination.getOrderOptions(this.entityName));
        query.offset(pagination.offset);
        query.limit(pagination.take);
    }
    /**
     * Add conditions to the query builder
     *
     * @param query Instance of the query builder
     * @param conditions The conditions to find the entity with (ActiveRecord style)
     */
    addConditions(query, conditions) {
        if (conditions) {
            query.setFindOptions({ where: conditions });
        }
    }
    /**
     * Add group by to the query builder
     *
     * @param query Instance of the query builder
     * @param groupBy The column to group by
     */
    addGroupBy(query, groupBy) {
        if (groupBy) {
            const colName = this.metadata.columns.find((col) => col.propertyName === groupBy)?.databaseName;
            const groupByProp = `${this.entityName}.${colName}`;
            query.groupBy(groupByProp);
        }
    }
    /**
     * Get the relation path and alias for a relation
     *
     * @param relation Property name of the relation
     * @returns relation path and alias
     */
    buildRelationPath(relation) {
        if (relation.includes('.')) {
            return this.buildComplexRelationPath(relation);
        }
        return [
            {
                propPath: `${this.entityName}.${relation}`,
                alias: `${this.entityName}__${relation}`,
            },
        ];
    }
    /**
     * Get the relation path and alias for a complex relation
     *
     * @param relation Property name of the relation
     * @returns relation path and alias
     */
    buildComplexRelationPath(relation) {
        const relatedEntities = relation.split('.');
        const joins = [];
        for (const entity of relatedEntities) {
            const prevJoin = joins.at(-1);
            if (!prevJoin) {
                const [join] = this.buildRelationPath(entity);
                if (!join) {
                    return [];
                }
                joins.push(join);
                continue;
            }
            joins.push({
                propPath: `${prevJoin.alias}.${entity}`,
                alias: `${prevJoin.alias}__${entity}`,
            });
        }
        return joins;
    }
}
