var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import * as Transliteration from '../../Core/Utils/transliteration.js';
import * as ULID from '../../Core/Data/Ulid.js';
import { UserModel } from '../../Users/Data/UserModel.js';
import { Brackets, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId, } from 'typeorm';
import { MediaModel } from '../../Media/Data/MediaModel.js';
import { CourseChapterModel } from './Relations/CourseChapterModel.js';
import { SearchableModel } from '../../Core/Data/SearchableModel.js';
import { SubjectModel } from '../../Subjects/Data/SubjectModel.js';
import { config } from '../../config.js';
import { CourseAssignmentModel } from './Relations/CourseAssignmentModel.js';
let CourseModel = class CourseModel extends SearchableModel {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.chapters) {
                this.chapters = data.chapters.map((chapter) => new CourseChapterModel(chapter));
            }
            if (data.images) {
                this.images = data.images.map((image) => new MediaModel(image));
            }
            if (data.subject) {
                this.subject = new SubjectModel(data.subject);
            }
            if (!data.slug) {
                this.slug = this.sluggify(this.name);
            }
        }
    }
    slug;
    name;
    authors;
    editors;
    studentAssignments;
    description;
    chapters;
    images;
    subject;
    subjectId;
    addSearchToQuery(query, needle) {
        query.andWhere(new Brackets((qb) => {
            qb.where(`LOWER(course.name) LIKE LOWER(:needle)`, {
                needle: `%${needle}%`,
            });
            qb.orWhere(`LOWER(course.description) LIKE LOWER(:needle)`, {
                needle: `%${needle}%`,
            });
        }));
        return [];
    }
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
], CourseModel.prototype, "slug", void 0);
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], CourseModel.prototype, "name", void 0);
__decorate([
    ManyToMany(() => UserModel, (user) => user.courses),
    JoinTable(),
    __metadata("design:type", Array)
], CourseModel.prototype, "authors", void 0);
__decorate([
    ManyToMany(() => UserModel, (user) => user.editedCourses),
    JoinTable(),
    __metadata("design:type", Array)
], CourseModel.prototype, "editors", void 0);
__decorate([
    OneToMany(() => CourseAssignmentModel, (assignment) => assignment.course),
    __metadata("design:type", Array)
], CourseModel.prototype, "studentAssignments", void 0);
__decorate([
    Column({
        name: 'description',
        type: 'text',
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], CourseModel.prototype, "description", void 0);
__decorate([
    OneToMany(() => CourseChapterModel, (chapter) => chapter.course, {
        cascade: ['insert'],
    }),
    __metadata("design:type", Array)
], CourseModel.prototype, "chapters", void 0);
__decorate([
    OneToMany(() => MediaModel, (media) => media.course, {
        eager: true,
        cascade: true,
    }),
    __metadata("design:type", Array)
], CourseModel.prototype, "images", void 0);
__decorate([
    ManyToOne(() => SubjectModel, (subject) => subject.courses, {
        eager: true,
    }),
    __metadata("design:type", SubjectModel)
], CourseModel.prototype, "subject", void 0);
__decorate([
    RelationId((course) => course.subject),
    __metadata("design:type", String)
], CourseModel.prototype, "subjectId", void 0);
CourseModel = __decorate([
    Entity('course'),
    __metadata("design:paramtypes", [Object])
], CourseModel);
export { CourseModel };
