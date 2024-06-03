var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model } from '../../Core/Data/Model.js';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, RelationId, } from 'typeorm';
import { PollQuestionModel } from './Relations/PollQuestionModel.js';
import { BlogPostModel } from '../../Blog/Data/BlogPostModel.js';
import { UserModel } from '../../Users/Data/UserModel.js';
let PollModel = class PollModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.questions) {
                this.questions = data.questions.map((question) => new PollQuestionModel(question));
            }
        }
    }
    post;
    questions;
    votedUsers;
    votedUserIds;
    title;
    description;
    canVote;
    canSeeResults;
    requireAuth;
    stopAt;
    isStopped;
};
__decorate([
    OneToOne(() => BlogPostModel, (post) => post.poll, { onDelete: 'CASCADE' }),
    __metadata("design:type", Object)
], PollModel.prototype, "post", void 0);
__decorate([
    OneToMany(() => PollQuestionModel, (question) => question.poll, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], PollModel.prototype, "questions", void 0);
__decorate([
    ManyToMany(() => UserModel, (user) => user.votedPolls),
    JoinTable(),
    __metadata("design:type", Array)
], PollModel.prototype, "votedUsers", void 0);
__decorate([
    RelationId((poll) => poll.votedUsers),
    __metadata("design:type", Array)
], PollModel.prototype, "votedUserIds", void 0);
__decorate([
    Column({
        name: 'title',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], PollModel.prototype, "title", void 0);
__decorate([
    Column({
        name: 'description',
        type: 'text',
        nullable: true,
    }),
    __metadata("design:type", String)
], PollModel.prototype, "description", void 0);
__decorate([
    Column({
        name: 'can_vote',
        type: 'simple-array',
    }),
    __metadata("design:type", Array)
], PollModel.prototype, "canVote", void 0);
__decorate([
    Column({
        name: 'can_see_results',
        type: 'simple-array',
    }),
    __metadata("design:type", Array)
], PollModel.prototype, "canSeeResults", void 0);
__decorate([
    Column({
        name: 'require_auth',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], PollModel.prototype, "requireAuth", void 0);
__decorate([
    Column({
        name: 'stop_at',
        type: 'timestamp',
        nullable: true,
    }),
    __metadata("design:type", Date)
], PollModel.prototype, "stopAt", void 0);
__decorate([
    Column({
        name: 'is_stopped',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], PollModel.prototype, "isStopped", void 0);
PollModel = __decorate([
    Entity('poll'),
    __metadata("design:paramtypes", [Object])
], PollModel);
export { PollModel };
