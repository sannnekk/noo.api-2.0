var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import * as ULID from '../../Core/Data/Ulid.js';
import { Brackets, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId, } from 'typeorm';
import { UserModel } from '../../Users/Data/UserModel.js';
import { WorkModel } from '../../Works/Data/WorkModel.js';
import { CalenderEventModel } from '../../Calender/Data/CalenderEventModel.js';
import { AssignedWorkAnswerModel } from './Relations/AssignedWorkAnswerModel.js';
import { AssignedWorkCommentModel } from './Relations/AssignedWorkCommentModel.js';
import { SearchableModel } from '../../Core/Data/SearchableModel.js';
import { config } from '../../config.js';
let AssignedWorkModel = class AssignedWorkModel extends SearchableModel {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (!data.slug) {
                this.slug = this.sluggify();
            }
            /* if (data.mentors) {
              this.mentors = data.mentors.map((mentor) => new UserModel(mentor))
            } */
            if (data.answers) {
                this.answers = data.answers.map((answer) => new AssignedWorkAnswerModel(answer));
            }
            if (data.comments) {
                this.comments = data.comments.map((comment) => new AssignedWorkCommentModel(comment));
            }
        }
    }
    slug;
    mentors;
    mentorIds;
    student;
    studentId;
    work;
    workId;
    solveStatus;
    checkStatus;
    solveDeadlineAt;
    solveDeadlineShifted;
    checkDeadlineAt;
    checkDeadlineShifted;
    solvedAt;
    checkedAt;
    answers;
    comments;
    calenderEvents;
    score;
    maxScore;
    isArchivedByMentors;
    isArchivedByStudent;
    isArchivedByAssistants;
    isNewAttempt;
    studentComment;
    mentorComment;
    _excludedTaskIds;
    get excludedTaskIds() {
        return this._excludedTaskIds || [];
    }
    set excludedTaskIds(value) {
        this._excludedTaskIds = value;
    }
    addSearchToQuery(query, needle) {
        query.andWhere(new Brackets((qb) => {
            qb.where('LOWER(assigned_work__student.name) LIKE LOWER(:needle)', {
                needle: `%${needle}%`,
            });
            qb.orWhere('LOWER(assigned_work__work.name) LIKE LOWER(:needle)', {
                needle: `%${needle}%`,
            });
            /* qb.orWhere(
              'LOWER(assigned_work__assigned_work_mentors.name) LIKE LOWER(:needle)',
              {
                needle: `%${needle}%`,
              }
            ) */
        }));
        return ['student', 'work', 'mentors'];
    }
    static readableSolveStatus(status) {
        switch (status) {
            case 'not-started':
                return 'Не начато';
            case 'in-progress':
                return 'В процессе';
            case 'made-in-deadline':
                return 'Сдано в дедлайн';
            case 'made-after-deadline':
                return 'Сдано после дедлайна';
            default:
                return status;
        }
    }
    static readableCheckStatus(status) {
        switch (status) {
            case 'not-checked':
                return 'Не проверено';
            case 'in-progress':
                return 'В процессе';
            case 'checked-in-deadline':
                return 'Проверено в дедлайн';
            case 'checked-after-deadline':
                return 'Проверено после дедлайна';
            case 'checked-automatically':
                return 'Проверено автоматически';
            default:
                return status;
        }
    }
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
    RelationId((assignedWork) => assignedWork.mentors),
    __metadata("design:type", Array)
], AssignedWorkModel.prototype, "mentorIds", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.assignedWorksAsStudent),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "student", void 0);
__decorate([
    RelationId((assignedWork) => assignedWork.student),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "studentId", void 0);
__decorate([
    ManyToOne(() => WorkModel, (work) => work.assignedWorks),
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
            'checked-automatically',
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
    OneToMany(() => AssignedWorkAnswerModel, (answer) => answer.assignedWork, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], AssignedWorkModel.prototype, "answers", void 0);
__decorate([
    OneToMany(() => AssignedWorkCommentModel, (comment) => comment.assignedWork, { cascade: true }),
    __metadata("design:type", Array)
], AssignedWorkModel.prototype, "comments", void 0);
__decorate([
    OneToMany(() => CalenderEventModel, (calenderEvent) => calenderEvent.assignedWork),
    __metadata("design:type", Array)
], AssignedWorkModel.prototype, "calenderEvents", void 0);
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
        name: 'is_archived_by_mentors',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], AssignedWorkModel.prototype, "isArchivedByMentors", void 0);
__decorate([
    Column({
        name: 'is_archived_by_student',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], AssignedWorkModel.prototype, "isArchivedByStudent", void 0);
__decorate([
    Column({
        name: 'is_archived_by_assistants',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], AssignedWorkModel.prototype, "isArchivedByAssistants", void 0);
__decorate([
    Column({
        name: 'is_new_attempt',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], AssignedWorkModel.prototype, "isNewAttempt", void 0);
__decorate([
    Column({
        name: 'student_comment',
        type: 'json',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "studentComment", void 0);
__decorate([
    Column({
        name: 'mentor_comment',
        type: 'json',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AssignedWorkModel.prototype, "mentorComment", void 0);
__decorate([
    Column({
        name: 'filtered_out_task_ids',
        type: 'json',
        nullable: true,
    }),
    __metadata("design:type", Array)
], AssignedWorkModel.prototype, "_excludedTaskIds", void 0);
AssignedWorkModel = __decorate([
    Entity('assigned_work'),
    __metadata("design:paramtypes", [Object])
], AssignedWorkModel);
export { AssignedWorkModel };
