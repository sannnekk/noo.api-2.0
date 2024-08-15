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
import { Column, Entity, OneToMany } from 'typeorm';
import { CourseModel } from '../../Courses/Data/CourseModel.js';
import { WorkModel } from '../../Works/Data/WorkModel.js';
import { MentorAssignmentModel } from '../../Users/Data/Relations/MentorAssignmentModel.js';
import { config } from '../../config.js';
let SubjectModel = class SubjectModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    name;
    color = '';
    courses;
    works;
    mentorAssignments;
};
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
        length: 255,
        nullable: false,
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], SubjectModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'color',
        type: 'varchar',
        length: 255,
        nullable: false,
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", String)
], SubjectModel.prototype, "color", void 0);
__decorate([
    OneToMany(() => CourseModel, (course) => course.subject),
    __metadata("design:type", Array)
], SubjectModel.prototype, "courses", void 0);
__decorate([
    OneToMany(() => WorkModel, (work) => work.subject),
    __metadata("design:type", Array)
], SubjectModel.prototype, "works", void 0);
__decorate([
    OneToMany(() => MentorAssignmentModel, (mentorAssignment) => mentorAssignment.subject),
    __metadata("design:type", Array)
], SubjectModel.prototype, "mentorAssignments", void 0);
SubjectModel = __decorate([
    Entity('subject'),
    __metadata("design:paramtypes", [Object])
], SubjectModel);
export { SubjectModel };
