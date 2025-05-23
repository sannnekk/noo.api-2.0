var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { AssignedWorkModel } from '../../AssignedWorks/Data/AssignedWorkModel.js';
import { FavouriteTaskModel } from '../../AssignedWorks/Data/Relations/FavouriteTaskModel.js';
import { BlogPostModel } from '../../Blog/Data/BlogPostModel.js';
import { BlogPostReactionModel } from '../../Blog/Data/Relations/BlogPostReactionModel.js';
import { config } from '../../config.js';
import { SearchableModel } from '../../Core/Data/SearchableModel.js';
import { CourseModel } from '../../Courses/Data/CourseModel.js';
import { CourseAssignmentModel } from '../../Courses/Data/Relations/CourseAssignmentModel.js';
import { CourseMaterialReactionModel } from '../../Courses/Data/Relations/CourseMaterialReactionModel.js';
import { NotificationModel } from '../../Notifications/Data/NotificationModel.js';
import { PollModel } from '../../Polls/Data/PollModel.js';
import { PollAnswerModel } from '../../Polls/Data/Relations/PollAnswerModel.js';
import { SessionModel } from '../../Sessions/Data/SessionModel.js';
import { SnippetModel } from '../../Snippets/Data/SnippetModel.js';
import { Brackets, Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, } from 'typeorm';
import { UserSettingsModel } from '../../UserSettings/Data/UserSettingsModel.js';
import { MentorAssignmentModel } from './Relations/MentorAssignmentModel.js';
import { UserAvatarModel } from './Relations/UserAvatarModel.js';
import { VideoModel } from '../../Video/Data/VideoModel.js';
import { VideoCommentModel } from '../../Video/Data/Relations/VideoCommentModel.js';
import { TableModel } from '../../Tables/Data/TableModel.js';
import { VideoSavingModel } from '../../Video/Data/Relations/VideoSavingModel.js';
import { VideoReactionModel } from '../../Video/Data/Relations/VideoReactionModel.js';
let UserModel = class UserModel extends SearchableModel {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (!data.slug && data.username) {
                this.slug = this.sluggify(this.username);
            }
            if (data.avatar) {
                this.avatar = new UserAvatarModel(data.avatar);
            }
        }
    }
    username;
    slug;
    role;
    name;
    email;
    newEmail;
    mentorAssignmentsAsMentor;
    mentorAssignmentsAsStudent;
    courses;
    editedCourses;
    courseAssignments;
    courseAssignmentsAsAssigner;
    assignedWorksAsMentor;
    assignedWorksAsStudent;
    blogPosts;
    blogPostReactions;
    materialReactions;
    pollAnswers;
    votedPolls;
    uploadedVideos;
    notifications;
    sessions;
    snippets;
    tables;
    avatar;
    favouriteTasks;
    settings;
    videoComments;
    savedVideos;
    videoReactions;
    telegramId;
    telegramUsername;
    telegramNotificationsEnabled;
    password;
    isBlocked;
    forbidden;
    verificationToken;
    addSearchToQuery(query, needle) {
        query.andWhere(new Brackets((qb) => {
            qb.where('LOWER(user.username) LIKE LOWER(:needle)', {
                needle: `%${needle}%`,
            });
            qb.orWhere('LOWER(user.name) LIKE LOWER(:needle)', {
                needle: `%${needle}%`,
            });
            qb.orWhere('LOWER(user.email) LIKE LOWER(:needle)', {
                needle: `%${needle}%`,
            });
            qb.orWhere('LOWER(user.telegramUsername) LIKE LOWER(:needle)', {
                needle: `%${needle}%`,
            });
        }));
        return [];
    }
    sluggify(username) {
        return username.toLowerCase().replace(/\s/g, '-');
    }
    static getRoleName(role) {
        switch (role) {
            case 'student':
                return 'Ученик';
            case 'mentor':
                return 'Куратор';
            case 'teacher':
                return 'Преподаватель';
            case 'admin':
                return 'Администратор';
            case 'assistant':
                return 'Ассистент';
        }
    }
};
__decorate([
    Column({
        name: 'username',
        type: 'varchar',
        nullable: false,
        unique: true,
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "username", void 0);
__decorate([
    Column({
        name: 'slug',
        type: 'varchar',
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "slug", void 0);
__decorate([
    Column({
        name: 'role',
        type: 'enum',
        enum: [
            'student',
            'mentor',
            'teacher',
            'admin',
            'assistant',
        ],
        default: 'student',
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", Object)
], UserModel.prototype, "role", void 0);
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'email',
        type: 'varchar',
        unique: true,
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", String)
], UserModel.prototype, "email", void 0);
__decorate([
    Column({
        name: 'new_email',
        type: 'varchar',
        nullable: true,
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", Object)
], UserModel.prototype, "newEmail", void 0);
__decorate([
    OneToMany(() => MentorAssignmentModel, (assignment) => assignment.mentor),
    __metadata("design:type", Array)
], UserModel.prototype, "mentorAssignmentsAsMentor", void 0);
__decorate([
    OneToMany(() => MentorAssignmentModel, (assignment) => assignment.student),
    __metadata("design:type", Array)
], UserModel.prototype, "mentorAssignmentsAsStudent", void 0);
__decorate([
    ManyToMany(() => CourseModel, (course) => course.authors),
    __metadata("design:type", Array)
], UserModel.prototype, "courses", void 0);
__decorate([
    ManyToMany(() => CourseModel, (course) => course.editors),
    __metadata("design:type", Array)
], UserModel.prototype, "editedCourses", void 0);
__decorate([
    OneToMany(() => CourseAssignmentModel, (assignment) => assignment.student),
    __metadata("design:type", Array)
], UserModel.prototype, "courseAssignments", void 0);
__decorate([
    OneToMany(() => CourseAssignmentModel, (assignment) => assignment.assigner),
    __metadata("design:type", Array)
], UserModel.prototype, "courseAssignmentsAsAssigner", void 0);
__decorate([
    ManyToMany(() => AssignedWorkModel, (assignedWork) => assignedWork.mentors),
    __metadata("design:type", Array)
], UserModel.prototype, "assignedWorksAsMentor", void 0);
__decorate([
    OneToMany(() => AssignedWorkModel, (assignedWork) => assignedWork.student),
    __metadata("design:type", Array)
], UserModel.prototype, "assignedWorksAsStudent", void 0);
__decorate([
    OneToMany(() => BlogPostModel, (post) => post.author),
    __metadata("design:type", Array)
], UserModel.prototype, "blogPosts", void 0);
__decorate([
    OneToMany(() => BlogPostReactionModel, (reaction) => reaction.user),
    __metadata("design:type", Array)
], UserModel.prototype, "blogPostReactions", void 0);
__decorate([
    OneToMany(() => CourseMaterialReactionModel, (reaction) => reaction.user),
    __metadata("design:type", Array)
], UserModel.prototype, "materialReactions", void 0);
__decorate([
    OneToMany(() => PollAnswerModel, (answer) => answer.user),
    __metadata("design:type", Array)
], UserModel.prototype, "pollAnswers", void 0);
__decorate([
    ManyToMany(() => PollModel, (poll) => poll.votedUsers),
    __metadata("design:type", Array)
], UserModel.prototype, "votedPolls", void 0);
__decorate([
    OneToMany(() => VideoModel, (video) => video.uploadedBy),
    __metadata("design:type", Array)
], UserModel.prototype, "uploadedVideos", void 0);
__decorate([
    OneToMany(() => NotificationModel, (notification) => notification.user),
    __metadata("design:type", Array)
], UserModel.prototype, "notifications", void 0);
__decorate([
    OneToMany(() => SessionModel, (session) => session.user, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], UserModel.prototype, "sessions", void 0);
__decorate([
    OneToMany(() => SnippetModel, (snippet) => snippet.user),
    __metadata("design:type", Array)
], UserModel.prototype, "snippets", void 0);
__decorate([
    OneToMany(() => TableModel, (table) => table.user),
    __metadata("design:type", Array)
], UserModel.prototype, "tables", void 0);
__decorate([
    OneToOne(() => UserAvatarModel, (avatar) => avatar.user, {
        onDelete: 'CASCADE',
        cascade: true,
        eager: true,
    }),
    JoinColumn(),
    __metadata("design:type", Object)
], UserModel.prototype, "avatar", void 0);
__decorate([
    OneToMany(() => FavouriteTaskModel, (favourite) => favourite.user),
    __metadata("design:type", Array)
], UserModel.prototype, "favouriteTasks", void 0);
__decorate([
    OneToOne(() => UserSettingsModel, (settings) => settings.user),
    __metadata("design:type", Object)
], UserModel.prototype, "settings", void 0);
__decorate([
    OneToMany(() => VideoCommentModel, (comment) => comment.user),
    __metadata("design:type", Array)
], UserModel.prototype, "videoComments", void 0);
__decorate([
    OneToMany(() => VideoSavingModel, (videoSaving) => videoSaving.user),
    __metadata("design:type", Array)
], UserModel.prototype, "savedVideos", void 0);
__decorate([
    OneToMany(() => VideoReactionModel, (reaction) => reaction.user),
    __metadata("design:type", Array)
], UserModel.prototype, "videoReactions", void 0);
__decorate([
    Column({
        name: 'telegram_id',
        type: 'varchar',
        nullable: true,
        default: null,
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", Object)
], UserModel.prototype, "telegramId", void 0);
__decorate([
    Column({
        name: 'telegram_username',
        type: 'varchar',
        nullable: true,
        default: null,
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", Object)
], UserModel.prototype, "telegramUsername", void 0);
__decorate([
    Column({
        name: 'telegram_notifications_enabled',
        type: 'boolean',
        default: true,
    }),
    __metadata("design:type", Boolean)
], UserModel.prototype, "telegramNotificationsEnabled", void 0);
__decorate([
    Column({
        name: 'password',
        type: 'varchar',
        nullable: true,
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
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
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", Object)
], UserModel.prototype, "verificationToken", void 0);
UserModel = __decorate([
    Entity('user'),
    __metadata("design:paramtypes", [Object])
], UserModel);
export { UserModel };
