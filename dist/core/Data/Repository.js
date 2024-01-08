import { CoreDataSource } from './DataSource';
import { Pagination } from './Pagination';
import { NotFoundError } from '../Errors/NotFoundError';
export class Repository {
    model;
    repository;
    constructor(model) {
        this.model = model;
        this.repository = CoreDataSource.getRepository(model);
    }
    async create(data) {
        const model = new this.model(data);
        await this.repository.save(model);
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
        await this.repository.save(newItem);
    }
    async delete(id) {
        const exists = await this.repository.exist({
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
        return this.repository.find({
            relations: relations || undefined,
            where: conditions,
            ...pagination,
        });
    }
    async findOne(conditions, relations) {
        return this.repository.findOne({
            relations: relations || undefined,
            where: conditions,
        });
    }
}
