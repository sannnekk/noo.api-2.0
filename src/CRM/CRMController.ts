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
		} catch (error: any) {
		} finally {
			return new ApiResponse(null)
		}
	}

	@Post('/deal/cancel')
	public async onDealrefund(context: Context): Promise<ApiResponse> {
		try {
			CrmAsserts.hasSecret(context)
		} catch (error: any) {
		} finally {
			return new ApiResponse(null)
		}
	}
}
