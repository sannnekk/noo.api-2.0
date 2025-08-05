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
import * as ULID from '../../../Core/Data/Ulid.js';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { WorkTaskModel } from '../../../Works/Data/Relations/WorkTaskModel.js';
import { AssignedWorkModel } from '../AssignedWorkModel.js';
import { config } from '../../../config.js';
let AssignedWorkAnswerModel = class AssignedWorkAnswerModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (!data.slug) {
                this.slug = this.sluggify();
            }
            if (data.taskId) {
                this.task = { id: data.taskId };
            }
        }
    }
    slug;
    content;
    word;
    isSubmitted;
    task;
    taskId;
    assignedWork;
    sluggify() {
        return ULID.generate();
    }
};
__decorate([
    Column({
        name: 'slug',
        type: 'varchar',
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", String)
], AssignedWorkAnswerModel.prototype, "slug", void 0);
__decorate([
    Column({
        name: 'content',
        type: 'json',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AssignedWorkAnswerModel.prototype, "content", void 0);
__decorate([
    Column({
        name: 'word',
        type: 'varchar',
        nullable: true,
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", Object)
], AssignedWorkAnswerModel.prototype, "word", void 0);
__decorate([
    Column({
        name: 'is_submitted',
        type: 'boolean',
        nullable: true,
        default: false,
    }),
    __metadata("design:type", Object)
], AssignedWorkAnswerModel.prototype, "isSubmitted", void 0);
__decorate([
    ManyToOne(() => WorkTaskModel, (task) => task.assignedWorkAnswers),
    __metadata("design:type", Object)
], AssignedWorkAnswerModel.prototype, "task", void 0);
__decorate([
    RelationId((answer) => answer.task),
    __metadata("design:type", Object)
], AssignedWorkAnswerModel.prototype, "taskId", void 0);
__decorate([
    ManyToOne(() => AssignedWorkModel, (assignedWork) => assignedWork.answers, {
        orphanedRowAction: 'delete',
    }),
    __metadata("design:type", Object)
], AssignedWorkAnswerModel.prototype, "assignedWork", void 0);
AssignedWorkAnswerModel = __decorate([
    Entity('assigned_work_answer'),
    __metadata("design:paramtypes", [Object])
], AssignedWorkAnswerModel);
export { AssignedWorkAnswerModel };
