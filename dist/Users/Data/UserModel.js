var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId, } from 'typeorm';
import { Model } from '@core';
import { CourseModel } from '@modules/Courses/Data/CourseModel';
import { AssignedWorkModel } from '@modules/AssignedWorks/Data/AssignedWorkModel';
let UserModel = class UserModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (!data.slug && data.username) {
                this.slug = this.sluggify(this.username);
            }
        }
    }
    username;
    slug;
    role = 'student';
    name;
    email;
    students;
    mentorId;
    mentor;
    courses;
    courseIds;
    coursesAsStudent;
    courseIdsAsStudent;
    assignedWorksAsMentor;
    assignedWorkIdsAsMentor;
    assignedWorksAsStudent;
    assignedWorkIdsAsStudent;
    telegramId;
    telegramUsername;
    password;
    isBlocked = false;
    forbidden = 0;
    verificationToken;
    static entriesToSearch() {
        return ['username', 'name', 'email', 'telegramUsername'];
    }
    sluggify(username) {
        return username.toLowerCase().replace(/\s/g, '-');
    }
};
__decorate([
    Column({
        name: 'username',
        type: 'varchar',
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "username", void 0);
__decorate([
    Column({
        name: 'slug',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], UserModel.prototype, "slug", void 0);
__decorate([
    Column({
        name: 'role',
        type: 'enum',
        enum: ['student', 'mentor', 'teacher', 'admin'],
        default: 'student',
    }),
    __metadata("design:type", Object)
], UserModel.prototype, "role", void 0);
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], UserModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'email',
        type: 'varchar',
        unique: true,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "email", void 0);
__decorate([
    OneToMany(() => UserModel, (user) => user.mentor),
    __metadata("design:type", Array)
], UserModel.prototype, "students", void 0);
__decorate([
    RelationId((user) => user.mentor),
    __metadata("design:type", String)
], UserModel.prototype, "mentorId", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.students),
    __metadata("design:type", Object)
], UserModel.prototype, "mentor", void 0);
__decorate([
    OneToMany(() => CourseModel, (course) => course.author),
    __metadata("design:type", Array)
], UserModel.prototype, "courses", void 0);
__decorate([
    RelationId((user) => user.courses),
    __metadata("design:type", Array)
], UserModel.prototype, "courseIds", void 0);
__decorate([
    ManyToMany(() => CourseModel, (course) => course.students),
    JoinTable(),
    __metadata("design:type", Array)
], UserModel.prototype, "coursesAsStudent", void 0);
__decorate([
    RelationId((user) => user.coursesAsStudent),
    __metadata("design:type", Array)
], UserModel.prototype, "courseIdsAsStudent", void 0);
__decorate([
    ManyToMany(() => AssignedWorkModel, (assignedWork) => assignedWork.mentors),
    __metadata("design:type", Array)
], UserModel.prototype, "assignedWorksAsMentor", void 0);
__decorate([
    RelationId((user) => user.assignedWorksAsMentor),
    __metadata("design:type", Array)
], UserModel.prototype, "assignedWorkIdsAsMentor", void 0);
__decorate([
    OneToMany(() => AssignedWorkModel, (assignedWork) => assignedWork.student),
    __metadata("design:type", Array)
], UserModel.prototype, "assignedWorksAsStudent", void 0);
__decorate([
    RelationId((user) => user.assignedWorksAsStudent),
    __metadata("design:type", Array)
], UserModel.prototype, "assignedWorkIdsAsStudent", void 0);
__decorate([
    Column({
        name: 'telegram_id',
        type: 'varchar',
        nullable: true,
        default: null,
    }),
    __metadata("design:type", Object)
], UserModel.prototype, "telegramId", void 0);
__decorate([
    Column({
        name: 'telegram_username',
        type: 'varchar',
        nullable: true,
        default: null,
    }),
    __metadata("design:type", Object)
], UserModel.prototype, "telegramUsername", void 0);
__decorate([
    Column({
        name: 'password',
        type: 'varchar',
        nullable: true,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "password", void 0);
__decorate([
    Column({
        name: 'is_blocked',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], UserModel.prototype, "isBlocked", void 0);
__decorate([
    Column({
        name: 'forbidden',
        type: 'int',
        default: 0,
    }),
    __metadata("design:type", Number)
], UserModel.prototype, "forbidden", void 0);
__decorate([
    Column({
        name: 'verification_token',
        type: 'varchar',
        nullable: true,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "verificationToken", void 0);
UserModel = __decorate([
    Entity('user'),
    __metadata("design:paramtypes", [Object])
], UserModel);
export { UserModel };
