import { AppError } from '@modules/Core/Errors/AppError'
import { StatusCodes } from 'http-status-codes'
import { FAQOptions } from '../FAQOptions'

export class CategoryTooDeepError extends AppError {
  public constructor() {
    super(
      'Категория слишком глубоко вложена, максимальная вложенность: ' +
        FAQOptions.maxCategoryDepth,
      StatusCodes.BAD_REQUEST
    )
  }
}
