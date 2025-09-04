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
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { CourseModel } from '../CourseModel.js';
import { UserModel } from '../../../Users/Data/UserModel.js';
let CourseAssignmentModel = class CourseAssignmentModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.course) {
                this.course = new CourseModel(data.course);
            }
            if (data.student) {
                this.student = new UserModel(data.student);
            }
            if (data.assigner) {
                this.assigner = new UserModel(data.assigner);
            }
        }
    }
    isArchived;
    isPinned;
    course;
    courseId;
    student;
    studentId;
    assigner;
    assignerId;
};
__decorate([
    Column({ name: 'is_archived', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], CourseAssignmentModel.prototype, "isArchived", void 0);
__decorate([
    Column({ name: 'is_pinned', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], CourseAssignmentModel.prototype, "isPinned", void 0);
__decorate([
    ManyToOne(() => CourseModel, (course) => course.studentAssignments, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], CourseAssignmentModel.prototype, "course", void 0);
__decorate([
    RelationId((assignment) => assignment.course),
    __metadata("design:type", Object)
], CourseAssignmentModel.prototype, "courseId", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.courseAssignments, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], CourseAssignmentModel.prototype, "student", void 0);
__decorate([
    RelationId((assignment) => assignment.student),
    __metadata("design:type", Object)
], CourseAssignmentModel.prototype, "studentId", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.courseAssignmentsAsAssigner, {
        onDelete: 'SET NULL',
    }),
    __metadata("design:type", Object)
], CourseAssignmentModel.prototype, "assigner", void 0);
__decorate([
    RelationId((assignment) => assignment.assigner),
    __metadata("design:type", Object)
], CourseAssignmentModel.prototype, "assignerId", void 0);
CourseAssignmentModel = __decorate([
    Entity('course_assignment'),
    __metadata("design:paramtypes", [Object])
], CourseAssignmentModel);
export { CourseAssignmentModel };
