var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model } from '../../Core/Data/Model.js';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { AssignedWorkModel } from '../../AssignedWorks/Data/AssignedWorkModel.js';
import { config } from '../../config.js';
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
    visibility = 'private';
    type = 'event';
    username;
    assignedWork;
    assignedWorkId;
};
__decorate([
    Column({
        name: 'title',
        type: 'varchar',
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], CalenderEventModel.prototype, "title", void 0);
__decorate([
    Column({
        name: 'description',
        type: 'text',
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], CalenderEventModel.prototype, "description", void 0);
__decorate([
    Column({
        name: 'date',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], CalenderEventModel.prototype, "date", void 0);
__decorate([
    Column({
        name: 'url',
        type: 'varchar',
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", String)
], CalenderEventModel.prototype, "url", void 0);
__decorate([
    Column({
        name: 'visibility',
        type: 'enum',
        enum: ['all', 'own-students', 'all-mentors', 'own-mentor', 'private'],
        default: 'private',
    }),
    __metadata("design:type", Object)
], CalenderEventModel.prototype, "visibility", void 0);
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
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", String)
], CalenderEventModel.prototype, "username", void 0);
__decorate([
    ManyToOne(() => AssignedWorkModel, (assignedWork) => assignedWork.calenderEvents, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], CalenderEventModel.prototype, "assignedWork", void 0);
__decorate([
    RelationId((calenderEvent) => calenderEvent.assignedWork),
    __metadata("design:type", Object)
], CalenderEventModel.prototype, "assignedWorkId", void 0);
CalenderEventModel = __decorate([
    Entity('calender_event'),
    __metadata("design:paramtypes", [Object])
], CalenderEventModel);
export { CalenderEventModel };
