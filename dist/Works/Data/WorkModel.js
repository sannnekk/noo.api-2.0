var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import * as ULID from '../../Core/Data/Ulid.js';
import * as Transliteration from '../../Core/Utils/transliteration.js';
import { Brackets, Column, Entity, ManyToOne, OneToMany, RelationId, } from 'typeorm';
import { CourseMaterialModel } from '../../Courses/Data/Relations/CourseMaterialModel.js';
import { AssignedWorkModel } from '../../AssignedWorks/Data/AssignedWorkModel.js';
import { WorkTaskModel } from './Relations/WorkTaskModel.js';
import { SearchableModel } from '../../Core/Data/SearchableModel.js';
import { SubjectModel } from '../../Subjects/Data/SubjectModel.js';
import { config } from '../../config.js';
let WorkModel = class WorkModel extends SearchableModel {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.tasks) {
                this.tasks = data.tasks.map((task) => new WorkTaskModel(task));
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
    type = 'test';
    description;
    materials;
    tasks;
    taskIds;
    assignedWorks;
    subject;
    subjectId;
    addSearchToQuery(query, needle) {
        query.andWhere(new Brackets((qb) => {
            qb.where('LOWER(work.name) LIKE LOWER(:needle)', {
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
], WorkModel.prototype, "slug", void 0);
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], WorkModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'type',
        type: 'enum',
        enum: ['trial-work', 'phrase', 'mini-test', 'test', 'second-part'],
        default: 'test',
    }),
    __metadata("design:type", String)
], WorkModel.prototype, "type", void 0);
__decorate([
    Column({
        name: 'description',
        type: 'text',
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], WorkModel.prototype, "description", void 0);
__decorate([
    OneToMany(() => CourseMaterialModel, (material) => material.work),
    __metadata("design:type", Object)
], WorkModel.prototype, "materials", void 0);
__decorate([
    OneToMany(() => WorkTaskModel, (task) => task.work, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], WorkModel.prototype, "tasks", void 0);
__decorate([
    RelationId((work) => work.tasks),
    __metadata("design:type", Array)
], WorkModel.prototype, "taskIds", void 0);
__decorate([
    OneToMany(() => AssignedWorkModel, (assignedWork) => assignedWork.work),
    __metadata("design:type", Array)
], WorkModel.prototype, "assignedWorks", void 0);
__decorate([
    ManyToOne(() => SubjectModel, (subject) => subject.works, {
        eager: true,
    }),
    __metadata("design:type", SubjectModel)
], WorkModel.prototype, "subject", void 0);
__decorate([
    RelationId((work) => work.subject),
    __metadata("design:type", String)
], WorkModel.prototype, "subjectId", void 0);
WorkModel = __decorate([
    Entity('work'),
    __metadata("design:paramtypes", [Object])
], WorkModel);
export { WorkModel };
