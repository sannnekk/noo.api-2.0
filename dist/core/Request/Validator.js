import { Pagination } from '../Data/Pagination.js';
import { z } from 'zod';
export class Validator {
    validatePagination(data) {
        const schema = z.object({
            page: z.coerce.number().int().positive().optional(),
            limit: z.coerce.number().int().positive().optional(),
            sort: z.string().optional(),
            order: z.enum(['ASC', 'DESC']).optional(),
            search: z.string().optional(),
        });
        const pagination = schema.parse(data);
        return new Pagination(pagination.page, pagination.limit, pagination.sort, pagination.order, pagination.search);
    }
    validateId(id) {
        const schema = z.string().ulid();
        schema.parse(id);
    }
    validateSlug(slug) {
        const schema = z.string().min(2).max(256);
        schema.parse(slug);
    }
}
