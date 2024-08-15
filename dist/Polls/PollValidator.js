var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Validator } from '../Core/Request/Validator.js';
import { z } from 'zod';
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { PollAnswerScheme } from './Schemes/PollAnswerScheme.js';
import { PollScheme } from './Schemes/PollScheme.js';
import { PollAnswerEditScheme } from './Schemes/PollAnswerEditScheme.js';
let PollValidator = class PollValidator extends Validator {
    parsePoll(data) {
        return this.parse(data, PollScheme);
    }
    parsePollAnswers(data) {
        return this.parse(data, z.array(PollAnswerScheme));
    }
    parsePollAnswer(data) {
        return this.parse(data, PollAnswerEditScheme);
    }
    parseIdOrTelegramUsername(data) {
        return this.parse(data, this.idScheme.or(z.string().min(1)));
    }
};
PollValidator = __decorate([
    ErrorConverter()
], PollValidator);
export { PollValidator };
