import type { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import type { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
import { deltaToText } from '../Utils/delta'
import type { TaskCriterion } from '../Criteria/TaskCriteria'

export type AiMessageContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

export type AiPrompt = {
  system: string
  user: AiMessageContentPart[]
}

export class AiPromptGenerator {
  private initialPrompt = [
    'Ты — НОО.Шпунтик, ассистент, который проверяет мои ответы на задания.',
    'Тебе даю условие задания, максимальный балл, иногда — решение/критерии проверки и мой ответ.',
    'Изображения пронумерованы: "[Изображение N]" в тексте соответствует N-му приложенному изображению.',
    'Оцени мой ответ строго, но справедливо, и напиши краткий понятный комментарий на русском языке:',
    'что сделано верно, какие ошибки допущены и как их исправить. В комментарии к ответу ссылайся на Решение / критерии проверки, если они есть, в формате ',
    '1 ЭО (Элемент ответа) - зачтен/не зачтен, если не зачтен, то почему. И так по всем имеющимся ЭО. В конце - сколько ЭО из всех зачтено и балл.',
    'Именно в таком порядке: 1 ЭО, а не ЭО 1. И не списком, а просто каждый на новой строке.',
    'Ответь ТОЛЬКО валидным JSON-объектом (не оборачивай его в ```) вида:',
    '{"score": <целое число от 0 до максимального балла>, "feedback": "<комментарий к проверке, где скажи еще, почему именно такой балл выбрал>"}',
    'В поле "feedback" можно использовать только такое форматирование:',
    '- маркированные списки: строки, начинающиеся с "- "',
    '- нумерованные списки: строки, начинающиеся с "1. ", "2. " и т.д.',
    '- **жирный**, *курсив*, ***жирный курсив***, ~~зачёркнутый~~',
    '- формулы LaTeX внутри строки: $x^2 + 1$ (без $$ и без блочных формул)',
    'Переносы строк — через \\n. Другую разметку (таблицы, ссылки, код, вложенные списки) не используй.',
  ].join('\n')

  private criteriaPrompt = [
    'Если в задании указаны критерии оценивания, оцени ответ по КАЖДОМУ критерию отдельно',
    'и добавь в JSON поле "detailedScore" — объект вида {"<код критерия>": <целое число от 0 до максимального балла по критерию>}',
    'с ключами строго из кодов критериев. Поле "score" в этом случае должно быть равно сумме баллов по критериям.',
    'В комментарии вместо ЭО разбери каждый критерий в формате "К1 - <балл>/<максимум>: пояснение", каждый на новой строке.',
  ].join('\n')

  public generateCheckPrompt(
    task: Pick<
      WorkTask,
      'content' | 'highestScore' | 'solveHint' | 'checkHint'
    >,
    answerContent: DeltaContentType,
    criteria: TaskCriterion[] = []
  ): AiPrompt {
    const images: string[] = []

    const taskText = deltaToText(task.content, images)
    const checkHint = task.checkHint ? deltaToText(task.checkHint, images) : ''
    const answerText = deltaToText(answerContent, images)

    const text = [
      `## Условие задания\n${taskText}`,
      `## Максимальный балл\n${task.highestScore}`,
      `## Решение / критерии проверки\n${checkHint.trim() ? checkHint.trim() : 'Не указаны'}`,
      criteria.length
        ? `## Критерии оценивания\n${this.criteriaToText(criteria)}`
        : '',
      `## Мой ответ\n${answerText}`,
    ]
      .filter(Boolean)
      .join('\n\n')

    return {
      system: criteria.length
        ? `${this.initialPrompt}\n${this.criteriaPrompt}`
        : this.initialPrompt,
      user: [
        { type: 'text', text },
        ...images.map(
          (url): AiMessageContentPart => ({
            type: 'image_url',
            image_url: { url },
          })
        ),
      ],
    }
  }

  private criteriaToText(criteria: TaskCriterion[]): string {
    return criteria
      .map(
        (criterion) =>
          `### ${criterion.code} (максимум ${criterion.maxScore})\n${criterion.title}\n${criterion.description}`
      )
      .join('\n\n')
  }
}
