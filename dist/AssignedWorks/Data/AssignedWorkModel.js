var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model, ULID } from '../../core/index.js';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId, } from 'typeorm';
import { UserModel } from '../../Users/Data/UserModel.js';
import { WorkModel } from '../../Works/Data/WorkModel.js';
import { AssignedWorkAnswerModel } from './Relations/AssignedWorkAnswerModel.js';
import { AssignedWorkCommentModel } from './Relations/AssignedWorkCommentModel.js';
let AssignedWorkModel = class AssignedWorkModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (!data.slug) {
                this.slug = this.sluggify();
            }
            this.mentors = (data.mentors || []).map((mentor) => new UserModel(mentor));
            this.answers = (data.answers || []).map((answer) => new AssignedWorkAnswerModel(answer));
            this.comments = (data.comments || []).map((comment) => new AssignedWorkCommentModel(comment));
        }
    }
    slug;
    mentors;
    get mentorIds() {
        return (this.mentors || []).map((mentor) => mentor.id);
    }
    set mentorIds(ids) { }
    student;
    studentId;
    work;
    workId;
    solveStatus = 'not-started';
    checkStatus = 'not-checked';
    solveDeadlineAt;
    solveDeadlineShifted = false;
    checkDeadlineAt;
    checkDeadlineShifted = false;
    solvedAt;
    checkedAt;
    answers;
    get answerIds() {
        return (this.answers || []).map((answer) => answer.id);
    }
    set answerIds(ids) { }
    comments;
    get commentIds() {
        return (this.comments || []).map((comment) => comment.id);
    }
    set commentIds(ids) { }
    score;
    maxScore;
    isArchived = false;
    static entriesToSearch() {
        return [
            'work.name',
            'work.description',
            'student.name',
            'mentors.name',
        ];
    }
    sluggify() {
        return ULID.generate();
    }
};
__decorate([
    Column({
        name: 'slug',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], AssignedWorkModel.prototype, "slug", void 0);
__decorate([
    ManyToMany(() => UserModel, (user) => user.assignedWorksAsMentor, {
        eager: true,
        cascade: true,
    }),
    JoinTable(),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "mentors", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.assignedWorksAsStudent),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "student", void 0);
__decorate([
    RelationId((assignedWork) => assignedWork.student),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "studentId", void 0);
__decorate([
    ManyToOne(() => WorkModel, (work) => work.assignedWorks, {
        eager: true,
    }),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "work", void 0);
__decorate([
    RelationId((assignedWork) => assignedWork.work),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "workId", void 0);
__decorate([
    Column({
        name: 'solve_status',
        type: 'enum',
        enum: [
            'not-started',
            'in-progress',
            'made-in-deadline',
            'made-after-deadline',
        ],
        default: 'not-started',
    }),
    __metadata("design:type", String)
], AssignedWorkModel.prototype, "solveStatus", void 0);
__decorate([
    Column({
        name: 'check_status',
        type: 'enum',
        enum: [
            'not-checked',
            'in-progress',
            'checked-in-deadline',
            'checked-after-deadline',
        ],
        default: 'not-checked',
    }),
    __metadata("design:type", String)
], AssignedWorkModel.prototype, "checkStatus", void 0);
__decorate([
    Column({
        name: 'solve_deadline_at',
        type: 'timestamp',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "solveDeadlineAt", void 0);
__decorate([
    Column({
        name: 'solve_deadline_shifted',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], AssignedWorkModel.prototype, "solveDeadlineShifted", void 0);
__decorate([
    Column({
        name: 'check_deadline_at',
        type: 'timestamp',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "checkDeadlineAt", void 0);
__decorate([
    Column({
        name: 'check_deadline_shifted',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], AssignedWorkModel.prototype, "checkDeadlineShifted", void 0);
__decorate([
    Column({
        name: 'solved_at',
        type: 'timestamp',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "solvedAt", void 0);
__decorate([
    Column({
        name: 'checked_at',
        type: 'timestamp',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "checkedAt", void 0);
__decorate([
    OneToMany(() => AssignedWorkAnswerModel, (answer) => answer.assignedWork, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], AssignedWorkModel.prototype, "answers", void 0);
__decorate([
    OneToMany(() => AssignedWorkCommentModel, (comment) => comment.assignedWork, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], AssignedWorkModel.prototype, "comments", void 0);
__decorate([
    Column({
        name: 'score',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "score", void 0);
__decorate([
    Column({
        name: 'max_score',
        type: 'int',
    }),
    __metadata("design:type", Number)
], AssignedWorkModel.prototype, "maxScore", void 0);
__decorate([
    Column({
        name: 'is_archived',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], AssignedWorkModel.prototype, "isArchived", void 0);
AssignedWorkModel = __decorate([
    Entity('assigned_work'),
    __metadata("design:paramtypes", [Object])
], AssignedWorkModel);
export { AssignedWorkModel };
