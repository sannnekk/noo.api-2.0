var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, ManyToOne, RelationId, } from 'typeorm';
import { Model, Transliteration, ULID } from '@core';
import { CourseChapterModel } from './CourseChapterModel';
import { WorkModel } from '@modules/Works/Data/WorkModel';
let CourseMaterialModel = class CourseMaterialModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (!data.slug) {
                this.slug = this.sluggify(this.name);
            }
        }
    }
    slug;
    name;
    description;
    content;
    chapter;
    chapterId;
    work;
    workId;
    sluggify(text) {
        return ULID.generate() + '-' + Transliteration.sluggify(text);
    }
};
__decorate([
    Column({
        name: 'slug',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], CourseMaterialModel.prototype, "slug", void 0);
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], CourseMaterialModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'description',
        type: 'text',
    }),
    __metadata("design:type", String)
], CourseMaterialModel.prototype, "description", void 0);
__decorate([
    Column({
        name: 'content',
        type: 'json',
    }),
    __metadata("design:type", Object)
], CourseMaterialModel.prototype, "content", void 0);
__decorate([
    ManyToOne(() => CourseChapterModel, (chapter) => chapter.materials, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], CourseMaterialModel.prototype, "chapter", void 0);
__decorate([
    RelationId((material) => material.chapter),
    __metadata("design:type", Object)
], CourseMaterialModel.prototype, "chapterId", void 0);
__decorate([
    ManyToOne(() => WorkModel, (work) => work.materials),
    __metadata("design:type", Object)
], CourseMaterialModel.prototype, "work", void 0);
__decorate([
    RelationId((material) => material.work),
    __metadata("design:type", Object)
], CourseMaterialModel.prototype, "workId", void 0);
CourseMaterialModel = __decorate([
    Entity('course_material'),
    __metadata("design:paramtypes", [Object])
], CourseMaterialModel);
export { CourseMaterialModel };
