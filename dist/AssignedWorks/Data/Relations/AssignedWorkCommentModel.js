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
let AssignedWorkCommentModel = class AssignedWorkCommentModel extends Model {
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
    score;
    detailedScore;
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
], AssignedWorkCommentModel.prototype, "slug", void 0);
__decorate([
    Column({
        name: 'content',
        type: 'json',
    }),
    __metadata("design:type", Object)
], AssignedWorkCommentModel.prototype, "content", void 0);
__decorate([
    Column({
        name: 'score',
        type: 'float',
    }),
    __metadata("design:type", Number)
], AssignedWorkCommentModel.prototype, "score", void 0);
__decorate([
    Column({
        name: 'detailed_score',
        type: 'json',
        nullable: true,
        default: null,
    }),
    __metadata("design:type", Object)
], AssignedWorkCommentModel.prototype, "detailedScore", void 0);
__decorate([
    ManyToOne(() => WorkTaskModel, (task) => task.assignedWorkComments),
    __metadata("design:type", Object)
], AssignedWorkCommentModel.prototype, "task", void 0);
__decorate([
    RelationId((comment) => comment.task),
    __metadata("design:type", Object)
], AssignedWorkCommentModel.prototype, "taskId", void 0);
__decorate([
    ManyToOne(() => AssignedWorkModel, (assignedWork) => assignedWork.comments, {
        orphanedRowAction: 'delete',
    }),
    __metadata("design:type", Object)
], AssignedWorkCommentModel.prototype, "assignedWork", void 0);
AssignedWorkCommentModel = __decorate([
    Entity('assigned_work_comment'),
    __metadata("design:paramtypes", [Object])
], AssignedWorkCommentModel);
export { AssignedWorkCommentModel };
