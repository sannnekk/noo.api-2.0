import { InvalidRequestError } from '@modules/Core/Errors/InvalidRequestError'
import { Validator } from '@modules/Core/Request/Validator'
import { Work } from '@modules/Works/Data/Work'

export class StatisticsValidator extends Validator {
	validateGetStatistics(
		body: any
	): asserts body is { from: Date; to: Date; type?: Work['type'] } {
		if (!body.from || !body.to) {
			throw new InvalidRequestError('Даты не указаны')
		}

		if (new Date(body.from) > new Date(body.to)) {
			throw new InvalidRequestError('Дата начала больше даты окончания')
		}

		if (
			new Date(body.to).getTime() - new Date(body.from).getTime() >
			1000 * 60 * 60 * 24 * 90
		) {
			throw new InvalidRequestError(
				'Период не должен превышать 90 дней'
			)
		}

		if ('type' in body) {
			const types: Work['type'][] = [
				'trial-work',
				'phrase',
				'mini-test',
				'test',
				'second-part',
			]

			if (!types.includes(body.type)) {
				throw new InvalidRequestError('Неверный тип работы')
			}
		}
	}
}
