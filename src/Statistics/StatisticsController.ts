import { Controller, Post, Req, Res } from '@decorators/express'
import * as Asserts from '@modules/Core/Security/asserts'
import { Request, Response } from 'express'
import { Context } from '@modules/Core/Request/Context'
import { getErrorData } from '@modules/core/Response/helpers'
import { StatisticsService } from './Services/StatisticsService'
import { StatisticsValidator } from './StatisticsValidator'

@Controller('/statistics')
export class StatisticsController {
	private readonly statisticsService: StatisticsService
	private readonly statisticsValidator: StatisticsValidator

	public constructor() {
		this.statisticsService = new StatisticsService()
		this.statisticsValidator = new StatisticsValidator()
	}

	@Post('/:username')
	async getStatistics(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context
		context.setParams(req.params)

		try {
			await Asserts.isAuthenticated(context)
			this.statisticsValidator.validateGetStatistics(context.body)
			this.statisticsValidator.validateSlug(context.params.username)

			const statistics = await this.statisticsService.getStatistics(
				context.params.username,
				context.body.from,
				context.body.to,
				context.body.type
			)

			res.status(200).send({ data: statistics })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}
}
