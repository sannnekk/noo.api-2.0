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
import { UserModel } from '../../Users/Data/UserModel.js';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { config } from '../../config.js';
let SnippetModel = class SnippetModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.user) {
                this.user = new UserModel(data.user);
            }
        }
    }
    name;
    content;
    user;
    userId;
};
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
        length: 255,
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], SnippetModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'content',
        type: 'json',
    }),
    __metadata("design:type", Object)
], SnippetModel.prototype, "content", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.snippets),
    __metadata("design:type", Object)
], SnippetModel.prototype, "user", void 0);
__decorate([
    RelationId((snippet) => snippet.user),
    __metadata("design:type", String)
], SnippetModel.prototype, "userId", void 0);
SnippetModel = __decorate([
    Entity('snippet'),
    __metadata("design:paramtypes", [Object])
], SnippetModel);
export { SnippetModel };
