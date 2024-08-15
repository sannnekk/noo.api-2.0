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
import { Entity, ManyToOne } from 'typeorm';
import { UserModel } from '../UserModel.js';
import { SubjectModel } from '../../../Subjects/Data/SubjectModel.js';
let MentorAssignmentModel = class MentorAssignmentModel extends Model {
    constructor(data) {
        super();
        if (data) {
            if (data.mentor) {
                this.mentor = new UserModel(data.mentor);
            }
            if (data.student) {
                this.student = new UserModel(data.student);
            }
            if (data.subject) {
                this.subject = new SubjectModel(data.subject);
            }
        }
    }
    mentor;
    student;
    subject;
};
__decorate([
    ManyToOne(() => UserModel, (user) => user.mentorAssignmentsAsMentor),
    __metadata("design:type", Object)
], MentorAssignmentModel.prototype, "mentor", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.mentorAssignmentsAsStudent),
    __metadata("design:type", Object)
], MentorAssignmentModel.prototype, "student", void 0);
__decorate([
    ManyToOne(() => SubjectModel, (subject) => subject.mentorAssignments),
    __metadata("design:type", Object)
], MentorAssignmentModel.prototype, "subject", void 0);
MentorAssignmentModel = __decorate([
    Entity('mentor_assignment'),
    __metadata("design:paramtypes", [Object])
], MentorAssignmentModel);
export { MentorAssignmentModel };
