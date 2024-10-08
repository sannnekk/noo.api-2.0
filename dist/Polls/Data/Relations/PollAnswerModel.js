var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Brackets, Column, Entity, ManyToOne, OneToMany, RelationId, } from 'typeorm';
import { MediaModel } from '../../../Media/Data/MediaModel.js';
import { UserModel } from '../../../Users/Data/UserModel.js';
import { PollQuestionModel } from './PollQuestionModel.js';
import { SearchableModel } from '../../../Core/Data/SearchableModel.js';
import { config } from '../../../config.js';
let PollAnswerModel = class PollAnswerModel extends SearchableModel {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.files) {
                this.files = data.files.map((file) => new MediaModel(file));
            }
            if (data.questionId) {
                this.question = { id: data.questionId };
            }
        }
    }
    question;
    questionId;
    user;
    userId;
    userAuthType;
    userAuthData;
    userAuthIdentifier;
    questionType;
    text;
    number;
    date;
    files;
    _choices;
    get choices() {
        return this._choices?.split('|');
    }
    set choices(choices) {
        this._choices = choices?.join('|');
    }
    rating;
    addSearchToQuery(query, needle) {
        query.andWhere(new Brackets((qb) => {
            qb.where('poll_answer.user_auth_data LIKE :needle', {
                needle: `%${needle}%`,
            });
            qb.orWhere('poll_answer.text LIKE :needle', { needle: `%${needle}%` });
        }));
        return [];
    }
};
__decorate([
    ManyToOne(() => PollQuestionModel, (question) => question.answers, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], PollAnswerModel.prototype, "question", void 0);
__decorate([
    RelationId((answer) => answer.question),
    __metadata("design:type", String)
], PollAnswerModel.prototype, "questionId", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.pollAnswers, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Object)
], PollAnswerModel.prototype, "user", void 0);
__decorate([
    RelationId((answer) => answer.user),
    __metadata("design:type", String)
], PollAnswerModel.prototype, "userId", void 0);
__decorate([
    Column({
        name: 'user_auth_type',
        type: 'varchar',
        default: 'api',
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", Object)
], PollAnswerModel.prototype, "userAuthType", void 0);
__decorate([
    Column({
        name: 'user_auth_data',
        type: 'varchar',
        nullable: true,
        default: null,
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", Object)
], PollAnswerModel.prototype, "userAuthData", void 0);
__decorate([
    Column({
        name: 'user_auth_identifier',
        type: 'varchar',
        nullable: true,
        default: null,
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], PollAnswerModel.prototype, "userAuthIdentifier", void 0);
__decorate([
    Column({
        name: 'question_type',
        type: 'enum',
        enum: ['text', 'number', 'date', 'file', 'choice', 'rating'],
    }),
    __metadata("design:type", Object)
], PollAnswerModel.prototype, "questionType", void 0);
__decorate([
    Column({
        name: 'text',
        type: 'text',
        nullable: true,
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", Object)
], PollAnswerModel.prototype, "text", void 0);
__decorate([
    Column({
        name: 'number',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollAnswerModel.prototype, "number", void 0);
__decorate([
    Column({
        name: 'date',
        type: 'timestamp',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollAnswerModel.prototype, "date", void 0);
__decorate([
    OneToMany(() => MediaModel, (media) => media.pollAnswer, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Object)
], PollAnswerModel.prototype, "files", void 0);
__decorate([
    Column({
        name: 'choices',
        type: 'text',
        nullable: true,
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], PollAnswerModel.prototype, "_choices", void 0);
__decorate([
    Column({
        name: 'rating',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollAnswerModel.prototype, "rating", void 0);
PollAnswerModel = __decorate([
    Entity('poll_answer'),
    __metadata("design:paramtypes", [Object])
], PollAnswerModel);
export { PollAnswerModel };
