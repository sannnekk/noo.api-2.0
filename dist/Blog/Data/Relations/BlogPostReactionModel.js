var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model } from '../../../Core/Data/Model.js';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { BlogPostModel } from '../BlogPostModel.js';
import { UserModel } from '../../../Users/Data/UserModel.js';
let BlogPostReactionModel = class BlogPostReactionModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    post;
    postId;
    user;
    userId;
    reaction;
};
__decorate([
    ManyToOne(() => BlogPostModel, (post) => post.reactions, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], BlogPostReactionModel.prototype, "post", void 0);
__decorate([
    RelationId((reaction) => reaction.post),
    __metadata("design:type", String)
], BlogPostReactionModel.prototype, "postId", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.blogPostReactions),
    __metadata("design:type", Object)
], BlogPostReactionModel.prototype, "user", void 0);
__decorate([
    RelationId((reaction) => reaction.user),
    __metadata("design:type", String)
], BlogPostReactionModel.prototype, "userId", void 0);
__decorate([
    Column({
        name: 'reaction',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], BlogPostReactionModel.prototype, "reaction", void 0);
BlogPostReactionModel = __decorate([
    Entity('blog_post_reaction'),
    __metadata("design:paramtypes", [Object])
], BlogPostReactionModel);
export { BlogPostReactionModel };
