import { Controller, Post } from 'express-controller-decorator'
import * as Asserts from '@modules/Core/Security/asserts'
import { Context } from '@modules/Core/Request/Context'
import { StatisticsService } from './Services/StatisticsService'
import { StatisticsValidator } from './StatisticsValidator'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'

@Controller('/statistics')
export class StatisticsController {
	private readonly statisticsService: StatisticsService
	private readonly statisticsValidator: StatisticsValidator

	public constructor() {
		this.statisticsService = new StatisticsService()
		this.statisticsValidator = new StatisticsValidator()
	}

	@Post('/:username')
	async getStatistics(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)
			const options = this.statisticsValidator.parseGetStatistics(context.body)
			const username = this.statisticsValidator.parseSlug(
				context.params.username
			)

			const statistics = await this.statisticsService.getStatistics(
				username,
				options
			)

			return new ApiResponse({ data: statistics })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}
}
