var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Model } from '../../../Core/Data/Model.js';
import * as ULID from '../../../Core/Data/Ulid.js';
import * as Transliteration from '../../../Core/Utils/transliteration.js';
import { WorkModel } from '../../../Works/Data/WorkModel.js';
import { MediaModel } from '../../../Media/Data/MediaModel.js';
import { CourseChapterModel } from './CourseChapterModel.js';
import { config } from '../../../config.js';
import { PollModel } from '../../../Polls/Data/PollModel.js';
let CourseMaterialModel = class CourseMaterialModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (!data.slug) {
                this.slug = this.sluggify(this.name);
            }
            if (data.files) {
                this.files = data.files.map((file) => new MediaModel(file));
            }
        }
    }
    slug;
    name;
    description;
    content;
    workSolveDeadline;
    workCheckDeadline;
    order;
    isActive;
    chapter;
    chapterId;
    work;
    workId;
    poll;
    pollId;
    files;
    sluggify(text) {
        return `${ULID.generate()}-${Transliteration.sluggify(text)}`;
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
], CourseMaterialModel.prototype, "slug", void 0);
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], CourseMaterialModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'description',
        type: 'text',
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
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
    Column({
        name: 'work_solve_deadline',
        type: 'timestamp',
        nullable: true,
    }),
    __metadata("design:type", Date)
], CourseMaterialModel.prototype, "workSolveDeadline", void 0);
__decorate([
    Column({
        name: 'work_check_deadline',
        type: 'timestamp',
        nullable: true,
    }),
    __metadata("design:type", Date)
], CourseMaterialModel.prototype, "workCheckDeadline", void 0);
__decorate([
    Column({
        name: 'order',
        type: 'int',
        default: 0,
    }),
    __metadata("design:type", Number)
], CourseMaterialModel.prototype, "order", void 0);
__decorate([
    Column({
        name: 'is_active',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], CourseMaterialModel.prototype, "isActive", void 0);
__decorate([
    ManyToOne(() => CourseChapterModel, (chapter) => chapter.materials, {
        onDelete: 'CASCADE',
        orphanedRowAction: 'delete',
    }),
    __metadata("design:type", Object)
], CourseMaterialModel.prototype, "chapter", void 0);
__decorate([
    RelationId((material) => material.chapter),
    __metadata("design:type", Object)
], CourseMaterialModel.prototype, "chapterId", void 0);
__decorate([
    ManyToOne(() => WorkModel, (work) => work.materials),
    __metadata("design:type", WorkModel)
], CourseMaterialModel.prototype, "work", void 0);
__decorate([
    RelationId((material) => material.work),
    __metadata("design:type", String)
], CourseMaterialModel.prototype, "workId", void 0);
__decorate([
    ManyToOne(() => PollModel, (poll) => poll.materials),
    __metadata("design:type", Object)
], CourseMaterialModel.prototype, "poll", void 0);
__decorate([
    RelationId((material) => material.poll),
    __metadata("design:type", Object)
], CourseMaterialModel.prototype, "pollId", void 0);
__decorate([
    OneToMany(() => MediaModel, (media) => media.courseMaterial, {
        eager: true,
        cascade: true,
    }),
    __metadata("design:type", Array)
], CourseMaterialModel.prototype, "files", void 0);
CourseMaterialModel = __decorate([
    Entity('course_material', {
        orderBy: {
            order: 'ASC',
        },
    }),
    __metadata("design:paramtypes", [Object])
], CourseMaterialModel);
export { CourseMaterialModel };
