var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, ManyToOne } from 'typeorm';
import { Model } from '../../Core/Data/Model.js';
import { CourseMaterialModel } from '../../Courses/Data/Relations/CourseMaterialModel.js';
import { CourseModel } from '../../Courses/Data/CourseModel.js';
import { PollAnswerModel } from '../../Polls/Data/Relations/PollAnswerModel.js';
let MediaModel = class MediaModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    src;
    name;
    mimeType;
    courseMaterial;
    course;
    pollAnswer;
};
__decorate([
    Column({
        name: 'src',
        type: 'varchar',
        length: 1024,
    }),
    __metadata("design:type", String)
], MediaModel.prototype, "src", void 0);
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
        length: 255,
    }),
    __metadata("design:type", String)
], MediaModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'mime_type',
        type: 'enum',
        enum: ['image/jpeg', 'image/png', 'application/pdf'],
    }),
    __metadata("design:type", String)
], MediaModel.prototype, "mimeType", void 0);
__decorate([
    ManyToOne(() => CourseMaterialModel, (courseMaterial) => courseMaterial.files, { onDelete: 'CASCADE' }),
    __metadata("design:type", CourseMaterialModel)
], MediaModel.prototype, "courseMaterial", void 0);
__decorate([
    ManyToOne(() => CourseModel, (course) => course.images, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", CourseModel)
], MediaModel.prototype, "course", void 0);
__decorate([
    ManyToOne(() => PollAnswerModel, (answer) => answer.files, {
        onDelete: 'SET NULL',
    }),
    __metadata("design:type", PollAnswerModel)
], MediaModel.prototype, "pollAnswer", void 0);
MediaModel = __decorate([
    Entity('media'),
    __metadata("design:paramtypes", [Object])
], MediaModel);
export { MediaModel };
