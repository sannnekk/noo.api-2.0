var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { z } from 'zod';
import { Validator } from '../Core/Request/Validator.js';
import { Reactions } from './Data/BlogPost.js';
import { PollValidator } from '../Polls/PollValidator.js';
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
let BlogValidator = class BlogValidator extends Validator {
    pollValidator;
    constructor() {
        super();
        this.pollValidator = new PollValidator();
    }
    tagsScheme = z
        .array(z
        .string()
        .min(1, 'Тег должен содержать хотя бы один символ')
        .max(255, 'Тег слишком длинный')
        .regex(/^[a-zA-Z0-9а-яА-ЯёЁ]+$/, 'Тег должен содержать только буквы и цифры'))
        .min(1, 'У поста должен быть хотя бы один тег')
        .max(10, 'У поста может быть максимум 10 тегов');
    titleScheme = z
        .string()
        .min(1, 'У поста должно быть название')
        .max(255, 'Название поста слишком длинное, максимум 255 символов');
    reactionsEnumScheme = z.enum(Reactions);
    parseCreateBlog(data) {
        const scheme = z.object({
            title: this.titleScheme,
            content: z.any(),
            tags: this.tagsScheme,
            poll: this.pollValidator.pollScheme.optional(),
        });
        return scheme.parse(data);
    }
    parseUpdateBlog(data) {
        const scheme = z.object({
            id: z.string().ulid(),
            title: this.titleScheme.optional(),
            content: z.any().optional(),
            tags: this.tagsScheme.optional(),
        });
        return scheme.parse(data);
    }
    parseReaction(data) {
        return this.reactionsEnumScheme.parse(data);
    }
};
BlogValidator = __decorate([
    ErrorConverter(),
    __metadata("design:paramtypes", [])
], BlogValidator);
export { BlogValidator };
