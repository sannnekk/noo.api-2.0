var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Validator } from '../Core/Request/Validator.js';
import { z } from 'zod';
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
let TelegramValidator = class TelegramValidator extends Validator {
    bindingScheme = z.object({
        telegramUsername: z
            .string()
            .nonempty('Поле "telegramUsername" не должно быть пустым'),
    });
    parseBindingData(data) {
        return this.parse(data, this.bindingScheme);
    }
};
TelegramValidator = __decorate([
    ErrorConverter()
], TelegramValidator);
export { TelegramValidator };
