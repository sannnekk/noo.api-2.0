var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, ManyToOne, OneToMany, } from 'typeorm';
import { UserModel } from '../../Users/Data/UserModel.js';
import { SearchableModel } from '../../Core/Data/SearchableModel.js';
import { TableCellModel } from './Relations/TableCellModel.js';
let TableModel = class TableModel extends SearchableModel {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.cells) {
                this.cells = data.cells.map((cell) => new TableCellModel(cell));
            }
        }
    }
    title;
    cells;
    user;
    addSearchToQuery(query, needle) {
        query.andWhere('LOWER(table.title) LIKE LOWER(:needle)', {
            needle: `%${needle}%`,
        });
        return [];
    }
};
__decorate([
    Column({
        name: 'title',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], TableModel.prototype, "title", void 0);
__decorate([
    OneToMany(() => TableCellModel, (cell) => cell.table, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], TableModel.prototype, "cells", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.tables),
    __metadata("design:type", Object)
], TableModel.prototype, "user", void 0);
TableModel = __decorate([
    Entity('table'),
    __metadata("design:paramtypes", [Object])
], TableModel);
export { TableModel };
