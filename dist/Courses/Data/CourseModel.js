var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model, Transliteration, ULID } from '@core';
import { UserModel } from '@modules/Users/Data/UserModel';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, RelationId, } from 'typeorm';
import { CourseChapterModel } from './Relations/CourseChapterModel';
import { MediaModel } from '@modules/Media/Data/MediaModel';
let CourseModel = class CourseModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            this.chapters = (data.chapters || []).map((chapter) => new CourseChapterModel(chapter));
            this.images = (data.images || []).map((image) => new MediaModel(image));
            if (!data.slug) {
                this.slug = this.sluggify(this.name);
            }
        }
    }
    slug;
    name;
    author;
    authorId;
    students;
    get studentIds() {
        return this.students?.map((student) => student.id) || [];
    }
    set studentIds(ids) { }
    description;
    chapters;
    images;
    static entriesToSearch() {
        return ['name', 'description'];
    }
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
], CourseModel.prototype, "slug", void 0);
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], CourseModel.prototype, "name", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.courses, { eager: true }),
    __metadata("design:type", Object)
], CourseModel.prototype, "author", void 0);
__decorate([
    RelationId((course) => course.author),
    __metadata("design:type", Object)
], CourseModel.prototype, "authorId", void 0);
__decorate([
    ManyToMany(() => UserModel, (user) => user.coursesAsStudent, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CourseModel.prototype, "students", void 0);
__decorate([
    Column({
        name: 'description',
        type: 'text',
    }),
    __metadata("design:type", String)
], CourseModel.prototype, "description", void 0);
__decorate([
    OneToMany(() => CourseChapterModel, (chapter) => chapter.course, {
        eager: true,
        cascade: true,
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
CourseModel = __decorate([
    Entity('course'),
    __metadata("design:paramtypes", [Object])
], CourseModel);
export { CourseModel };
