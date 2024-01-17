var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model } from '../../../core/index';
import { Column, Entity, ManyToMany, ManyToOne, RelationId, } from 'typeorm';
import { WorkTaskModel } from './WorkTaskModel';
import { AssignedWorkAnswerModel } from '../../../AssignedWorks/Data/Relations/AssignedWorkAnswerModel';
let WorkTaskOptionModel = class WorkTaskOptionModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            this.assignedWorkAnswers = (data.assignedWorkAnswers || []).map((answer) => new AssignedWorkAnswerModel(answer));
        }
    }
    name;
    isCorrect;
    task;
    taskId;
    assignedWorkAnswers;
    get assignedWorkAnswerIds() {
        return (this.assignedWorkAnswers || []).map((answer) => answer.id);
    }
    set assignedWorkAnswerIds(ids) { }
};
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], WorkTaskOptionModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'is_correct',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], WorkTaskOptionModel.prototype, "isCorrect", void 0);
__decorate([
    ManyToOne(() => WorkTaskModel, (task) => task.options, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], WorkTaskOptionModel.prototype, "task", void 0);
__decorate([
    RelationId((option) => option.task),
    __metadata("design:type", Object)
], WorkTaskOptionModel.prototype, "taskId", void 0);
__decorate([
    ManyToMany(() => AssignedWorkAnswerModel, (answer) => answer.chosenTaskOptions),
    __metadata("design:type", Object)
], WorkTaskOptionModel.prototype, "assignedWorkAnswers", void 0);
WorkTaskOptionModel = __decorate([
    Entity('work_task_option'),
    __metadata("design:paramtypes", [Object])
], WorkTaskOptionModel);
export { WorkTaskOptionModel };
