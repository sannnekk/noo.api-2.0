var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Validator } from '../Core/Request/Validator.js';
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { BlogPostReactionScheme } from './Schemes/BlogPostReactionScheme.js';
import { BlogPostScheme } from './Schemes/BlogPostScheme.js';
let BlogValidator = class BlogValidator extends Validator {
    parseCreateBlog(data) {
        return this.parse(data, BlogPostScheme.omit({ id: true }));
    }
    parseUpdateBlog(data) {
        return this.parse(data, BlogPostScheme.omit({ poll: true }));
    }
    parseReaction(data) {
        return this.parse(data, BlogPostReactionScheme);
    }
};
BlogValidator = __decorate([
    ErrorConverter()
], BlogValidator);
export { BlogValidator };
