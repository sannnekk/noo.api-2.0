import type { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import type { DetailedScore } from '@modules/AssignedWorks/Data/Relations/AssignedWorkComment'
import { markdownToDelta } from '../Utils/markdownToDelta'
import type { TaskCriterion } from '../Criteria/TaskCriteria'

export type AiCheckResponse =
  | {
      status: 'success'
      score: number
      detailedScore: DetailedScore | null
      feedback: DeltaContentType
    }
  | {
      status: 'error'
      error: string
    }

export class AiResponseParser {
  public parseTaskCheckResponse(
    response: string,
    maxScore: number,
    criteria: TaskCriterion[] = []
  ): AiCheckResponse {
    try {
      // strip possible markdown code fences
      const json = response
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')

      const parsed = JSON.parse(json)
      const score = Number(parsed?.score)
      const feedback = parsed?.feedback

      if (!Number.isFinite(score) || typeof feedback !== 'string') {
        throw new Error('Invalid response shape')
      }

      if (criteria.length) {
        const detailedScore = this.parseDetailedScore(
          parsed?.detailedScore,
          criteria
        )

        return {
          status: 'success',
          // keep the score consistent with the criteria, as the frontend does
          score: Object.values(detailedScore).reduce((a, b) => a + b, 0),
          detailedScore,
          feedback: markdownToDelta(feedback),
        }
      }

      return {
        status: 'success',
        score: this.clamp(score, maxScore),
        detailedScore: null,
        feedback: markdownToDelta(feedback),
      }
    } catch (error) {
      return {
        status: 'error',
        error: 'не удалось разобрать ответ ИИ',
      }
    }
  }

  private parseDetailedScore(
    raw: unknown,
    criteria: TaskCriterion[]
  ): DetailedScore {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Invalid detailed score')
    }

    return criteria.reduce((acc, criterion) => {
      const value = Number((raw as Record<string, unknown>)[criterion.code])

      if (!Number.isFinite(value)) {
        throw new Error(`Missing score for criterion ${criterion.code}`)
      }

      acc[criterion.code] = this.clamp(value, criterion.maxScore)
      return acc
    }, {} as DetailedScore)
  }

  private clamp(value: number, max: number): number {
    return Math.min(Math.max(Math.round(value), 0), max)
  }
}
