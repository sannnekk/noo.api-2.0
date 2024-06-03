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
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, RelationId, } from 'typeorm';
import { UserModel } from '../../Users/Data/UserModel.js';
import { BlogPostReactionModel } from './Relations/BlogPostReactionModel.js';
import { PollModel } from '../../Polls/Data/PollModel.js';
let BlogPostModel = class BlogPostModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.author) {
                this.author = new UserModel(data.author);
            }
            if (data.poll) {
                this.poll = new PollModel(data.poll);
            }
        }
    }
    title;
    content;
    author;
    authorId;
    tags;
    reactions;
    reactionCounts;
    poll;
    pollId;
    static entriesToSearch() {
        return [
            'title',
            'content',
            'tags',
            'author.name',
            'author.username',
        ];
    }
};
__decorate([
    Column({
        name: 'title',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], BlogPostModel.prototype, "title", void 0);
__decorate([
    Column({
        name: 'content',
        type: 'json',
    }),
    __metadata("design:type", Object)
], BlogPostModel.prototype, "content", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.blogPosts),
    __metadata("design:type", Object)
], BlogPostModel.prototype, "author", void 0);
__decorate([
    RelationId((post) => post.author),
    __metadata("design:type", Object)
], BlogPostModel.prototype, "authorId", void 0);
__decorate([
    Column({
        name: 'tags',
        type: 'simple-array',
    }),
    __metadata("design:type", Array)
], BlogPostModel.prototype, "tags", void 0);
__decorate([
    OneToMany(() => BlogPostReactionModel, (reaction) => reaction.post, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], BlogPostModel.prototype, "reactions", void 0);
__decorate([
    Column({
        name: 'reaction_counts',
        type: 'json',
    }),
    __metadata("design:type", Object)
], BlogPostModel.prototype, "reactionCounts", void 0);
__decorate([
    OneToOne(() => PollModel, (poll) => poll.post, { cascade: true }),
    JoinColumn(),
    __metadata("design:type", Object)
], BlogPostModel.prototype, "poll", void 0);
__decorate([
    RelationId((post) => post.poll),
    __metadata("design:type", String)
], BlogPostModel.prototype, "pollId", void 0);
BlogPostModel = __decorate([
    Entity('blog_post'),
    __metadata("design:paramtypes", [Object])
], BlogPostModel);
export { BlogPostModel };
