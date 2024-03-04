var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model } from '../../core/index.js';
import { Column, Entity } from 'typeorm';
let CalenderEventModel = class CalenderEventModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    title;
    description;
    date;
    url;
    isPrivate = false;
    type = 'event';
    username;
};
__decorate([
    Column({
        name: 'title',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], CalenderEventModel.prototype, "title", void 0);
__decorate([
    Column({
        name: 'description',
        type: 'text',
    }),
    __metadata("design:type", String)
], CalenderEventModel.prototype, "description", void 0);
__decorate([
    Column({
        name: 'date',
        type: 'timestamp',
    }),
    __metadata("design:type", Date)
], CalenderEventModel.prototype, "date", void 0);
__decorate([
    Column({
        name: 'url',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], CalenderEventModel.prototype, "url", void 0);
__decorate([
    Column({
        name: 'is_private',
        type: 'boolean',
        default: false,
        nullable: false,
    }),
    __metadata("design:type", Boolean)
], CalenderEventModel.prototype, "isPrivate", void 0);
__decorate([
    Column({
        name: 'type',
        type: 'enum',
        enum: [
            'student-deadline',
            'mentor-deadline',
            'work-checked',
            'work-made',
            'event',
        ],
        default: 'event',
        nullable: false,
    }),
    __metadata("design:type", String)
], CalenderEventModel.prototype, "type", void 0);
__decorate([
    Column({
        name: 'username',
        type: 'varchar',
        nullable: false,
    }),
    __metadata("design:type", String)
], CalenderEventModel.prototype, "username", void 0);
CalenderEventModel = __decorate([
    Entity('calender_event'),
    __metadata("design:paramtypes", [Object])
], CalenderEventModel);
export { CalenderEventModel };
