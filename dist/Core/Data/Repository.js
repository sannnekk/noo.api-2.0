import { CoreDataSource } from './DataSource.js';
import { Pagination } from './Pagination.js';
import { NotFoundError } from '../Errors/NotFoundError.js';
import { AlreadyExistError } from '../Errors/AlreadyExistError.js';
export class Repository {
    model;
    repository;
    constructor(model) {
        this.model = model;
        this.repository = CoreDataSource.getRepository(model);
    }
    async create(data) {
        const model = new this.model(data);
        try {
            return (await this.repository.save(model));
        }
        catch (error) {
            throw new AlreadyExistError();
        }
    }
    async createMany(data) {
        const models = data.map((item) => new this.model(item));
        try {
            await this.repository.save(models);
        }
        catch (error) {
            console.log(error);
            throw new AlreadyExistError();
        }
    }
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
            throw new AlreadyExistError();
        }
    }
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
            throw new AlreadyExistError();
        }
    }
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
    async find(conditions, relations, pagination = new Pagination()) {
        return (await this.repository.find({
            relations: relations || undefined,
            where: pagination.getCondition(conditions),
            order: pagination.orderOptions,
            skip: pagination.offset,
            take: pagination.take,
        }));
    }
    async findAll(conditions, relations, sort) {
        return (await this.repository.find({
            relations: relations || undefined,
            where: conditions,
            order: sort,
        }));
    }
    async findOne(conditions, relations, sort) {
        return this.repository.findOne({
            relations: relations || undefined,
            where: conditions,
            order: sort,
        });
    }
    async count(conditions, pagination) {
        return this.repository.count({
            where: pagination?.getCondition(conditions),
        });
    }
    queryBuilder(alias) {
        return this.repository.createQueryBuilder(alias);
    }
}
