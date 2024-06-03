var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Validator } from '../Core/Request/Validator.js';
import { ErrorConverter } from '../Core/Request/ValidatorDecorator.js';
import { z } from 'zod';
let StatisticsValidator = class StatisticsValidator extends Validator {
    statisticsOptionsScheme = z.object({
        from: z.date(),
        to: z.date(),
        type: z.string().optional(), // TODO: use enum from work module
    });
    parseGetStatistics(data) {
        return this.parse(data, this.statisticsOptionsScheme);
    }
};
StatisticsValidator = __decorate([
    ErrorConverter()
], StatisticsValidator);
export { StatisticsValidator };
