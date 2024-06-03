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
import * as Transliteration from '../../../Core/Utils/transliteration.js';
import * as ULID from '../../../Core/Data/Ulid.js';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { CourseModel } from '../CourseModel.js';
import { CourseMaterialModel } from './CourseMaterialModel.js';
let CourseChapterModel = class CourseChapterModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            this.materials = (data.materials || []).map((chapter) => new CourseMaterialModel(chapter));
            if (!data.slug) {
                this.slug = this.sluggify(this.name);
            }
        }
    }
    name;
    slug;
    order;
    course;
    courseId;
    materials;
    materialIds;
    sluggify(text) {
        return ULID.generate() + '-' + Transliteration.sluggify(text);
    }
};
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], CourseChapterModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'slug',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], CourseChapterModel.prototype, "slug", void 0);
__decorate([
    Column({
        name: 'order',
        type: 'int',
    }),
    __metadata("design:type", Number)
], CourseChapterModel.prototype, "order", void 0);
__decorate([
    ManyToOne(() => CourseModel, (course) => course.chapters, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], CourseChapterModel.prototype, "course", void 0);
__decorate([
    RelationId((chapter) => chapter.course),
    __metadata("design:type", Object)
], CourseChapterModel.prototype, "courseId", void 0);
__decorate([
    OneToMany(() => CourseMaterialModel, (material) => material.chapter, { cascade: true }),
    __metadata("design:type", Object)
], CourseChapterModel.prototype, "materials", void 0);
__decorate([
    RelationId((chapter) => chapter.materials),
    __metadata("design:type", Array)
], CourseChapterModel.prototype, "materialIds", void 0);
CourseChapterModel = __decorate([
    Entity('course_chapter'),
    __metadata("design:paramtypes", [Object])
], CourseChapterModel);
export { CourseChapterModel };
