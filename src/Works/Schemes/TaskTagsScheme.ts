import { z } from 'zod'
import { WorkOptions } from '../WorkOptions'

export const TaskTagsScheme = z
  .array(
    z
      .string()
      .trim()
      .min(1, 'Тег должен содержать хотя бы один символ')
      .max(50, 'Тег слишком длинный, максимум 50 символов')
      // the tags are stored as a comma-separated string, so commas are not allowed
      .regex(
        /^[a-zA-Zа-яА-ЯёЁ0-9][a-zA-Zа-яА-ЯёЁ0-9\s-]*$/,
        'Тег должен содержать только буквы, цифры, пробелы и дефисы'
      )
  )
  .max(
    WorkOptions.maxTaskTagCount,
    `У задания может быть максимум ${WorkOptions.maxTaskTagCount} тегов`
  )
