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
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { PollQuestionModel } from './PollQuestionModel.js';
import { MediaModel } from '../../../Media/Data/MediaModel.js';
import { UserModel } from '../../../Users/Data/UserModel.js';
let PollAnswerModel = class PollAnswerModel extends Model {
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
    questionType;
    text;
    number;
    date;
    files;
    choices;
    rating;
    static entriesToSearch() {
        return ['user.username', 'user.email', 'user.name'];
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
        type: 'simple-array',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollAnswerModel.prototype, "choices", void 0);
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
