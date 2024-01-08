import { z } from 'zod';
export class Validator {
    validatePagination(data) {
        const schema = z.object({
            page: z.number().int().positive().optional(),
            limit: z.number().int().positive().optional(),
            sort: z.string().optional(),
            order: z.string().optional(),
        });
        schema.parse(data);
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
