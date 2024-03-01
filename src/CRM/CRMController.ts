import { Controller, Post } from 'express-controller-decorator'
import { DealsService } from './Services/DealsService'
import { ApiResponse, Context, log } from '@core'
import CrmAsserts from './Security/CrmAsserts'

@Controller('/crm')
export class CRMController {
	private readonly dealsService: DealsService

	constructor() {
		this.dealsService = new DealsService()
	}

	@Post('/deal/create')
	public async onDealCreation(context: Context): Promise<ApiResponse> {
		try {
			CrmAsserts.hasSecret(context)

			log('Deal created')
			log(context._express.req)
			log(context.body)
			log('Deal created end')
			//const deal = await this.dealsService.create(context.body)
		} catch (error: any) {
			log('Deal creation error')
			log(error)
		} finally {
			return new ApiResponse(null)
		}
	}

	@Post('/deal/cancel')
	public async onDealrefund(context: Context): Promise<ApiResponse> {
		try {
			CrmAsserts.hasSecret(context)

			log('Deal canceled')
			log(context._express.req)
			log(context.body)
			log('Deal canceled end')
			//const deal = await this.dealsService.create(context.body)
		} catch (error: any) {
			log('Deal cancel error')
			log(error)
		} finally {
			return new ApiResponse(null)
		}
	}
}
