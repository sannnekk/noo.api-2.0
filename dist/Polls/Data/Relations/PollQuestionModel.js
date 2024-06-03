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
import { PollModel } from '../PollModel.js';
import { PollAnswerModel } from './PollAnswerModel.js';
let PollQuestionModel = class PollQuestionModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.answers) {
                this.answers = data.answers.map((answer) => new PollAnswerModel(answer));
            }
            switch (data.type) {
                case 'choice':
                    this.resetOptions();
                    this.minChoices = data.minChoices;
                    this.maxChoices = data.maxChoices;
                    this.choices = data.choices;
                    break;
                case 'rating':
                    this.resetOptions();
                    this.minRating = data.minRating;
                    this.maxRating = data.maxRating;
                    this.onlyIntegerRating = data.onlyIntegerRating;
                    break;
                case 'file':
                    this.resetOptions();
                    this.maxFileSize = data.maxFileSize;
                    this.maxFileCount = data.maxFileCount;
                    this.allowedFileTypes = data.allowedFileTypes;
                    break;
                case 'text':
                    this.resetOptions();
                    this.minLength = data.minLength;
                    this.maxLength = data.maxLength;
                    break;
                case 'number':
                    this.resetOptions();
                    this.minValue = data.minValue;
                    this.maxValue = data.maxValue;
                    this.onlyIntegerValue = data.onlyIntegerValue;
                    break;
                case 'date':
                    this.resetOptions();
                    this.onlyFutureDate = data.onlyFutureDate;
                    this.onlyPastDate = data.onlyPastDate;
                    break;
                case undefined:
                default:
                    break;
            }
        }
    }
    poll;
    pollId;
    answers;
    text;
    description;
    type;
    required;
    choices;
    minChoices;
    maxChoices;
    minRating;
    maxRating;
    onlyIntegerRating;
    maxFileSize;
    maxFileCount;
    allowedFileTypes;
    minLength;
    maxLength;
    minValue;
    maxValue;
    onlyIntegerValue;
    onlyFutureDate;
    onlyPastDate;
    resetOptions() {
        this.minChoices = undefined;
        this.maxChoices = undefined;
        this.choices = undefined;
        this.minRating = undefined;
        this.maxRating = undefined;
        this.onlyIntegerRating = undefined;
        this.maxFileSize = undefined;
        this.maxFileCount = undefined;
        this.allowedFileTypes = undefined;
        this.minLength = undefined;
        this.maxLength = undefined;
        this.minValue = undefined;
        this.maxValue = undefined;
        this.onlyIntegerValue = undefined;
        this.onlyFutureDate = undefined;
        this.onlyPastDate = undefined;
    }
};
__decorate([
    ManyToOne(() => PollModel, (poll) => poll.questions),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "poll", void 0);
__decorate([
    RelationId((question) => question.poll),
    __metadata("design:type", String)
], PollQuestionModel.prototype, "pollId", void 0);
__decorate([
    OneToMany(() => PollAnswerModel, (answer) => answer.question, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], PollQuestionModel.prototype, "answers", void 0);
__decorate([
    Column({
        name: 'text',
        type: 'text',
    }),
    __metadata("design:type", String)
], PollQuestionModel.prototype, "text", void 0);
__decorate([
    Column({
        name: 'description',
        type: 'text',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "description", void 0);
__decorate([
    Column({
        name: 'type',
        type: 'enum',
        enum: ['text', 'number', 'date', 'file', 'choice', 'rating'],
    }),
    __metadata("design:type", String)
], PollQuestionModel.prototype, "type", void 0);
__decorate([
    Column({
        name: 'required',
        type: 'boolean',
        default: true,
    }),
    __metadata("design:type", Boolean)
], PollQuestionModel.prototype, "required", void 0);
__decorate([
    Column({
        name: 'choices',
        type: 'simple-array',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "choices", void 0);
__decorate([
    Column({
        name: 'min_choices',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "minChoices", void 0);
__decorate([
    Column({
        name: 'max_choices',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "maxChoices", void 0);
__decorate([
    Column({
        name: 'min_rating',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "minRating", void 0);
__decorate([
    Column({
        name: 'max_rating',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "maxRating", void 0);
__decorate([
    Column({
        name: 'only_integer_rating',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "onlyIntegerRating", void 0);
__decorate([
    Column({
        name: 'max_file_size',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "maxFileSize", void 0);
__decorate([
    Column({
        name: 'max_file_count',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "maxFileCount", void 0);
__decorate([
    Column({
        name: 'allowed_file_types',
        type: 'simple-array',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "allowedFileTypes", void 0);
__decorate([
    Column({
        name: 'min_length',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "minLength", void 0);
__decorate([
    Column({
        name: 'max_length',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "maxLength", void 0);
__decorate([
    Column({
        name: 'min_value',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "minValue", void 0);
__decorate([
    Column({
        name: 'max_value',
        type: 'int',
        nullable: true,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "maxValue", void 0);
__decorate([
    Column({
        name: 'only_integer_value',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "onlyIntegerValue", void 0);
__decorate([
    Column({
        name: 'only_future_date',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "onlyFutureDate", void 0);
__decorate([
    Column({
        name: 'only_past_date',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Object)
], PollQuestionModel.prototype, "onlyPastDate", void 0);
PollQuestionModel = __decorate([
    Entity('poll_question'),
    __metadata("design:paramtypes", [Object])
], PollQuestionModel);
export { PollQuestionModel };
