import { z } from 'zod';
// Еhreshold for identifying data-links
const IMAGE_URL_MAX_LENGTH = 255;
const attributesSchema = z
    .object({
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    underline: z.boolean().optional(),
    strike: z.boolean().optional(),
    script: z.enum(['sub', 'super']).optional(),
    link: z
        .string()
        //.url({ message: 'Одна из ссылок недействительна' })
        .optional(),
    header: z.number().optional(),
    list: z.enum(['ordered', 'bullet']).optional(),
    align: z.enum(['left', 'center', 'right', 'justify']).optional(),
    // custom attributes
    'image-comment': z.any().optional(),
    comment: z.any().optional(),
    // allow only css var for color
    // color: z
    //   .string()
    //   .regex(/^var\(--[\w-]+\)$/, 'Используйте только предоставленные цвета')
    //   .optional(),
    color: z.string().optional(),
    // disable background color as we do not need it
    //background: z.string().optional(),
})
    .optional()
    // allow only css var for color and remove it if it is not a var
    .transform((data) => {
    if (data?.color && !data.color.startsWith('var(--')) {
        const { color, ...rest } = data;
        return rest;
    }
    return data;
});
export const DeltaScheme = z.object({
    ops: z.array(z.object({
        insert: z.union([
            z.string(), // Text insert
            z
                .object({
                image: z
                    .string()
                    .max(IMAGE_URL_MAX_LENGTH, 'Одно из изображений прикреплено с ошибкой. Воспользуйтесь кнопкой "Прикрепить изображение"')
                    .optional(),
                //video: z.string().url('Ссылка на видео недействительна').optional(),
                video: z.any().optional(),
            })
                .transform((insert) => {
                if (typeof insert.video !== 'string') {
                    // Remove 'video' prop if it's a boolean
                    const { video, ...rest } = insert;
                    return Object.keys(rest).length > 0 ? rest : undefined;
                }
                return insert;
            }),
        ]),
        attributes: attributesSchema,
    })),
});
