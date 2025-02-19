import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { TableModel } from '../Data/TableModel.js';
import { TableRepository } from '../Data/TableRepository.js';
import { TableCellRepository } from '../Data/TableCellRepository.js';
export class TableService {
    tableRepository;
    cellRepository;
    constructor() {
        this.tableRepository = new TableRepository();
        this.cellRepository = new TableCellRepository();
    }
    async getTables(userId, pagination) {
        return this.tableRepository.search({
            user: { id: userId },
        }, pagination);
    }
    async getTable(id, userId) {
        const table = await this.tableRepository.findOne({
            id,
            user: { id: userId },
        }, ['cells']);
        if (!table) {
            throw new NotFoundError('Таблица не найдена');
        }
        return table;
    }
    async createTable(data, userId) {
        const table = new TableModel({
            ...data,
            user: { id: userId },
        });
        return this.tableRepository.create(table);
    }
    async updateTable(id, data, userId) {
        const table = await this.tableRepository.findOne({
            id,
            user: { id: userId },
        });
        if (!table) {
            throw new NotFoundError('Таблица не найдена');
        }
        return this.tableRepository.update({
            ...table,
            ...data,
            id,
            user: { id: userId },
        });
    }
    async deleteTable(id, userId) {
        const table = await this.tableRepository.findOne({
            id,
            user: { id: userId },
        });
        if (!table) {
            throw new NotFoundError('Таблица не найдена');
        }
        await this.tableRepository.delete(id);
    }
}
