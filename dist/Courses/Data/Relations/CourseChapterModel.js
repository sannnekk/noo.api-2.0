var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CourseChapterModel_1;
import { Model } from '../../../Core/Data/Model.js';
import * as Transliteration from '../../../Core/Utils/transliteration.js';
import * as ULID from '../../../Core/Data/Ulid.js';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CourseModel } from '../CourseModel.js';
import { CourseMaterialModel } from './CourseMaterialModel.js';
import { config } from '../../../config.js';
let CourseChapterModel = CourseChapterModel_1 = class CourseChapterModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.chapters) {
                this.chapters = data.chapters.map((chapter) => new CourseChapterModel_1(chapter));
            }
            if (data.materials) {
                this.materials = data.materials.map((material) => new CourseMaterialModel(material));
            }
            if (!data.slug) {
                this.slug = this.sluggify(this.name);
            }
        }
    }
    name;
    titleColor;
    isPinned;
    slug;
    order;
    isActive;
    course;
    parentChapter;
    chapters;
    materials;
    sluggify(text) {
        return `${ULID.generate()}-${Transliteration.sluggify(text)}`;
    }
};
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], CourseChapterModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'title_color',
        type: 'varchar',
        nullable: true,
        default: null,
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", Object)
], CourseChapterModel.prototype, "titleColor", void 0);
__decorate([
    Column({
        name: 'is_pinned',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], CourseChapterModel.prototype, "isPinned", void 0);
__decorate([
    Column({
        name: 'slug',
        type: 'varchar',
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
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
    Column({
        name: 'is_active',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], CourseChapterModel.prototype, "isActive", void 0);
__decorate([
    ManyToOne(() => CourseModel, (course) => course.chapters, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], CourseChapterModel.prototype, "course", void 0);
__decorate([
    ManyToOne(() => CourseChapterModel, (chapter) => chapter.chapters, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], CourseChapterModel.prototype, "parentChapter", void 0);
__decorate([
    OneToMany(() => CourseChapterModel, (chapter) => chapter.parentChapter, {
        cascade: ['insert'],
    }),
    __metadata("design:type", Array)
], CourseChapterModel.prototype, "chapters", void 0);
__decorate([
    OneToMany(() => CourseMaterialModel, (material) => material.chapter, {
        cascade: ['insert'],
    }),
    __metadata("design:type", Array)
], CourseChapterModel.prototype, "materials", void 0);
CourseChapterModel = CourseChapterModel_1 = __decorate([
    Entity('course_chapter', {
        orderBy: {
            order: 'ASC',
        },
    }),
    __metadata("design:paramtypes", [Object])
], CourseChapterModel);
export { CourseChapterModel };
