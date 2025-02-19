var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model } from '../../../Core/Data/Model.js';
import { Column, Entity, ManyToOne } from 'typeorm';
import { TableModel } from '../TableModel.js';
let TableCellModel = class TableCellModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    type;
    value;
    col;
    row;
    background;
    metadata;
    table;
};
__decorate([
    Column({
        name: 'type',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], TableCellModel.prototype, "type", void 0);
__decorate([
    Column({
        name: 'value',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], TableCellModel.prototype, "value", void 0);
__decorate([
    Column({
        name: 'col',
        type: 'int',
    }),
    __metadata("design:type", Number)
], TableCellModel.prototype, "col", void 0);
__decorate([
    Column({
        name: 'row',
        type: 'int',
    }),
    __metadata("design:type", Number)
], TableCellModel.prototype, "row", void 0);
__decorate([
    Column({
        name: 'background',
        type: 'varchar',
        nullable: true,
    }),
    __metadata("design:type", Object)
], TableCellModel.prototype, "background", void 0);
__decorate([
    Column({
        name: 'metadata',
        type: 'json',
        nullable: true,
    }),
    __metadata("design:type", Object)
], TableCellModel.prototype, "metadata", void 0);
__decorate([
    ManyToOne(() => TableModel, (table) => table.cells, {
        onDelete: 'CASCADE',
        orphanedRowAction: 'delete',
    }),
    __metadata("design:type", Object)
], TableCellModel.prototype, "table", void 0);
TableCellModel = __decorate([
    Entity('table_cell'),
    __metadata("design:paramtypes", [Object])
], TableCellModel);
export { TableCellModel };
