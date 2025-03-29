var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Validator } from '../Core/Request/Validator.js';
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { VideoScheme } from './Schemes/VideoScheme.js';
import { VideoUpdateScheme } from './Schemes/VideoUpdateScheme.js';
import { VideoCommentScheme } from './Schemes/VideoCommentScheme.js';
import { SupportedReactionScheme } from './Schemes/SupportedReactionScheme.js';
import { z } from 'zod';
let VideoValidator = class VideoValidator extends Validator {
    parseVideo(data) {
        return this.parse(data, VideoScheme);
    }
    parseVideoReaction(data) {
        return this.parse(data, z.object({
            reaction: SupportedReactionScheme,
        }));
    }
    parseVideoUpdate(data) {
        return this.parse(data, VideoUpdateScheme);
    }
    parseComment(data) {
        return this.parse(data, VideoCommentScheme);
    }
};
VideoValidator = __decorate([
    ErrorConverter()
], VideoValidator);
export { VideoValidator };
