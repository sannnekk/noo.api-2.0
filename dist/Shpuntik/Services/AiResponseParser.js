import { markdownToDelta } from '../Utils/markdownToDelta.js';
export class AiResponseParser {
    parseTaskCheckResponse(response, maxScore, criteria = []) {
        try {
            // strip possible markdown code fences
            const json = response
                .trim()
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/\s*```$/, '');
            const parsed = JSON.parse(json);
            const score = Number(parsed?.score);
            const feedback = parsed?.feedback;
            if (!Number.isFinite(score) || typeof feedback !== 'string') {
                throw new Error('Invalid response shape');
            }
            if (criteria.length) {
                const detailedScore = this.parseDetailedScore(parsed?.detailedScore, criteria);
                return {
                    status: 'success',
                    // keep the score consistent with the criteria, as the frontend does
                    score: Object.values(detailedScore).reduce((a, b) => a + b, 0),
                    detailedScore,
                    feedback: markdownToDelta(feedback),
                };
            }
            return {
                status: 'success',
                score: this.clamp(score, maxScore),
                detailedScore: null,
                feedback: markdownToDelta(feedback),
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: 'не удалось разобрать ответ ИИ',
            };
        }
    }
    parseDetailedScore(raw, criteria) {
        if (!raw || typeof raw !== 'object') {
            throw new Error('Invalid detailed score');
        }
        return criteria.reduce((acc, criterion) => {
            const value = Number(raw[criterion.code]);
            if (!Number.isFinite(value)) {
                throw new Error(`Missing score for criterion ${criterion.code}`);
            }
            acc[criterion.code] = this.clamp(value, criterion.maxScore);
            return acc;
        }, {});
    }
    clamp(value, max) {
        return Math.min(Math.max(Math.round(value), 0), max);
    }
}
