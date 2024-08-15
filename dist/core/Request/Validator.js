var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { z } from 'zod';
import { Pagination } from '../Data/Pagination.js';
import { ErrorConverter } from './ValidatorDecorator.js';
import { Version } from '../Version/Version.js';
let Validator = class Validator {
    idScheme = z.string().ulid();
    slugScheme = z.string().min(1).max(256);
    paginationScheme = z.object({
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
        sort: z.string().optional(),
        order: z.enum(['ASC', 'DESC']).optional(),
        search: z.string().optional(),
        filter: z.record(z.any()).optional(),
        relations: z.array(z.string()).optional(),
    });
    versionScheme = z
        .string()
        .regex(/^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?:-(?<prerelease>[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+(?<buildmetadata>[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/, 'version');
    parsePagination(data) {
        const pagination = this.parse(data, this.paginationScheme);
        return new Pagination(pagination.page, pagination.limit, pagination.sort, pagination.order, pagination.search, 
        // TODO: Fix any
        pagination.filter, pagination.relations);
    }
    parseId(id) {
        return this.parse(id, this.idScheme);
    }
    parseOptionalId(id) {
        return this.parse(id, this.idScheme.or(z.undefined()));
    }
    parseSlug(slug) {
        return this.parse(slug, this.slugScheme);
    }
    parseVersion(version) {
        return new Version(this.parse(version, this.versionScheme));
    }
    parseString(value) {
        return this.parse(value, z.string());
    }
    parseNonemptyString(value) {
        return this.parse(value, z.string().min(1));
    }
    parse(o, schema) {
        return schema.parse(o);
    }
};
Validator = __decorate([
    ErrorConverter()
], Validator);
export { Validator };
